function sameCell(left, right) {
  return left?.x === right?.x && left?.y === right?.y;
}

function key(cell) {
  return `${cell.x},${cell.y}`;
}

function freezeObject(object) {
  return Object.freeze({ ...object, cell: Object.freeze({ ...object.cell }) });
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new TypeError("Object catalog must be an array.");
  const types = new Set();
  for (const entry of catalog) {
    if (!entry?.type || !entry.name || !entry.glyph) throw new TypeError("Every object catalog entry needs a type, name, and glyph.");
    if (types.has(entry.type)) throw new TypeError(`Duplicate object catalog type: ${entry.type}.`);
    if (typeof entry.IsPickup !== "boolean" || typeof entry.IsLevelSpawned !== "boolean") {
      throw new TypeError(`Object ${entry.type} needs boolean IsPickup and IsLevelSpawned properties.`);
    }
    types.add(entry.type);
  }
  return catalog;
}

function collectCandidates(world, start, reserved = new Set(), rule = null) {
  const candidates = [];
  for (let y = 1; y < world.rows - 1; y += 1) {
    for (let x = 1; x < world.columns - 1; x += 1) {
      const cell = { x, y };
      if (!world.terrain?.[y]?.[x]?.walkable || sameCell(cell, start) || reserved.has(key(cell))) continue;
      if (world.characters?.[y]?.[x] !== null && world.characters?.[y]?.[x] !== undefined) continue;
      if (rule === "wall-adjacent" && ![
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
      ].some((direction) => !world.terrain?.[y + direction.y]?.[x + direction.x]?.walkable)) continue;
      candidates.push(cell);
    }
  }
  return candidates;
}

function shuffle(values, random) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

export function selectObjectCells(world, start, count, random = Math.random, { minimumDistance = 3, rule = null, reserved = new Set() } = {}) {
  const candidates = shuffle(collectCandidates(world, start, reserved, rule), random);
  const selected = [];
  const minimumDistanceSquared = minimumDistance ** 2;
  for (const candidate of candidates) {
    if (selected.some((object) => (candidate.x - object.x) ** 2 + (candidate.y - object.y) ** 2 < minimumDistanceSquared)) continue;
    selected.push(candidate);
    reserved.add(key(candidate));
    if (selected.length >= count) break;
  }
  return selected;
}

export function selectPickupCells(world, start, distances, random = Math.random, tolerance = 8) {
  const reserved = new Set([key(start)]);
  const candidates = shuffle(collectCandidates(world, start, reserved), random);
  return distances.map((target) => {
    const candidate = candidates
      .filter((cell) => !reserved.has(key(cell)))
      .sort((left, right) => Math.abs(Math.hypot(left.x - start.x, left.y - start.y) - target)
        - Math.abs(Math.hypot(right.x - start.x, right.y - start.y) - target))[0];
    if (!candidate || Math.abs(Math.hypot(candidate.x - start.x, candidate.y - start.y) - target) > tolerance) return null;
    reserved.add(key(candidate));
    return candidate;
  }).filter(Boolean);
}

export function createObjectSpawnerSystem({ catalog = [] } = {}) {
  validateCatalog(catalog);
  const definitions = new Map(catalog.map((entry) => [entry.type, Object.freeze({ ...entry })]));
  const objects = new Map();
  const listeners = new Set();
  let nextId = 0;

  const emit = (event) => {
    const frozen = Object.freeze({ ...event, cell: event.cell ? Object.freeze({ ...event.cell }) : undefined });
    for (const listener of listeners) listener(frozen);
  };

  const addObject = ({ id, type, cell, effect = () => {}, realm = null } = {}) => {
    const definition = definitions.get(type);
    if (!definition) throw new RangeError(`Unknown object type: ${type}.`);
    if (!cell || !Number.isInteger(cell.x) || !Number.isInteger(cell.y)) throw new TypeError("An object needs an integer cell.");
    const objectId = id ?? `${type}-${++nextId}`;
    if (objects.has(objectId)) throw new TypeError(`Duplicate object id: ${objectId}.`);
    const object = {
      id: objectId,
      type,
      name: definition.name,
      glyph: definition.glyph,
      IsPickup: definition.IsPickup,
      IsLevelSpawned: definition.IsLevelSpawned,
      cell: { x: cell.x, y: cell.y },
      active: true,
      definition,
      effect,
      realm,
    };
    objects.set(objectId, object);
    return object;
  };

  const addCatalogObjects = ({ type, world, start, count, random = Math.random, realm = null, idPrefix = type, reserved = new Set(), effect = () => {} } = {}) => {
    const definition = definitions.get(type);
    if (!definition) throw new RangeError(`Unknown object type: ${type}.`);
    const distribution = definition.distribution ?? {};
    const cells = selectObjectCells(world, start, count, random, {
      minimumDistance: distribution.minimumDistance ?? 3,
      rule: distribution.rule,
      reserved,
    });
    return cells.map((cell, index) => addObject({
      id: `${idPrefix}-${index + 1}`,
      type,
      cell,
      realm,
      effect,
    }));
  };

  const requestPickupObjects = ({ type, world, start, distances = [], random = Math.random, realm = null, idPrefix = type, effect = () => {} } = {}) => {
    const definition = definitions.get(type);
    if (!definition?.IsPickup) throw new RangeError(`Object type ${type} is not a pickup.`);
    const reserved = new Set([key(start)]);
    const candidates = shuffle(collectCandidates(world, start, reserved), random);
    const selected = [];
    for (const target of distances) {
      const candidate = candidates
        .filter((cell) => !reserved.has(key(cell)) && selected.every((other) => Math.hypot(cell.x - other.x, cell.y - other.y) >= 3))
        .sort((left, right) => Math.abs(Math.hypot(left.x - start.x, left.y - start.y) - target) - Math.abs(Math.hypot(right.x - start.x, right.y - start.y) - target))[0];
      if (!candidate) continue;
      selected.push(candidate);
      reserved.add(key(candidate));
    }
    return selected.map((cell, index) => addObject({ id: `${idPrefix}-${index + 1}`, type, cell, realm, effect }));
  };

  const collideAtCell = (cell, context = {}) => {
    const object = [...objects.values()].find((candidate) => candidate.active
      && (!context.world || candidate.realm === context.world)
      && sameCell(candidate.cell, cell));
    if (!object) return null;
    if (object.IsPickup) object.active = false;
    object.effect(context);
    const event = {
      type: object.IsPickup ? "pickup-collected" : "object-collided",
      objectId: object.id,
      objectType: object.type,
      pickupId: object.IsPickup ? object.id : undefined,
      pickupType: object.IsPickup ? object.type : undefined,
      cell: { ...object.cell },
      logText: object.definition.logText ?? null,
    };
    emit(event);
    return event;
  };

  return Object.freeze({
    addObject,
    addCatalogObjects,
    requestPickupObjects,
    collideAtCell,
    getCatalog() { return Object.freeze([...definitions.values()]); },
    getObjects() { return Object.freeze([...objects.values()].map(({ effect, definition, realm, ...object }) => freezeObject(object))); },
    getActiveObjects(realm = null) { return Object.freeze([...objects.values()].filter((object) => object.active && (!realm || object.realm === realm)).map(({ effect, definition, realm: objectRealm, ...object }) => freezeObject(object))); },
    getLightingSources(realm = null) { return Object.freeze([...objects.values()].filter((object) => object.active && object.type === "torch" && (!realm || object.realm === realm)).map((object) => Object.freeze({ ...object.cell }))); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  });
}

export function validateObjectPalette(catalog, palette = []) {
  const glyphs = new Set(palette.map((entry) => entry.glyph));
  for (const entry of validateCatalog(catalog)) {
    if (!glyphs.has(entry.glyph)) throw new Error(`Object glyph is missing from the palette: ${entry.glyph}`);
  }
  return true;
}
