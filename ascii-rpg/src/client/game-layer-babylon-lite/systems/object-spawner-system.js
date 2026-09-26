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

function collectCandidates(world, start, reserved = new Set(), rule = null, maximumDistance = Infinity, candidateCells = null) {
  const candidates = [];
  const append = (cell) => {
      const { x, y } = cell;
      if (!world.terrain?.[y]?.[x]?.walkable || sameCell(cell, start) || reserved.has(key(cell))) return;
      if (Number.isFinite(maximumDistance) && Math.hypot(x - start.x, y - start.y) > maximumDistance) return;
      if (world.characters?.[y]?.[x] !== null && world.characters?.[y]?.[x] !== undefined) return;
      if (rule === "wall-adjacent" && ![
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
      ].some((direction) => !world.terrain?.[y + direction.y]?.[x + direction.x]?.walkable)) return;
      candidates.push(cell);
  };
  if (candidateCells) {
    for (const cell of candidateCells) append(cell);
  } else {
    const minX = Math.max(1, Math.ceil(start.x - maximumDistance));
    const maxX = Math.min(world.columns - 2, Math.floor(start.x + maximumDistance));
    const minY = Math.max(1, Math.ceil(start.y - maximumDistance));
    const maxY = Math.min(world.rows - 2, Math.floor(start.y + maximumDistance));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) append({ x, y });
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

export function selectObjectCells(world, start, count, random = Math.random, { minimumDistance = 3, rule = null, reserved = new Set(), maximumDistance = Infinity, candidateCells = null } = {}) {
  if (count <= 0) return [];
  const candidates = shuffle(collectCandidates(world, start, reserved, rule, maximumDistance, candidateCells), random);
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

export function placeDeclaredLevelObjects({ world, start, catalog = [], features = [], realm, countFor = () => 0, randomFor = () => Math.random, reserved = new Set() } = {}) {
  const definitions = new Map(catalog.map((object) => [object.type, object]));
  const placements = [];
  let candidateCells = null;
  for (const feature of features) {
    const definition = definitions.get(feature.objectType);
    if (!definition?.IsLevelSpawned || !definition.generation || !feature.objectType) continue;
    if (realm && !definition.generation.realms?.includes(realm)) continue;
    const count = countFor(feature, definition);
    // Owned only by this synchronous placement batch, never retained across
    // terrain changes. Every child still checks the current reservations.
    if (count > 0 && candidateCells === null) candidateCells = collectCandidates(world, start);
    const cells = selectObjectCells(world, start, count, randomFor(feature, definition), {
      minimumDistance: definition.distribution?.minimumDistance ?? 3,
      rule: definition.distribution?.rule ?? null,
      maximumDistance: definition.distribution?.maximumDistance ?? Infinity,
      reserved,
      candidateCells,
    });
    placements.push(Object.freeze({ feature, definition, cells: Object.freeze(cells) }));
  }
  return Object.freeze(placements);
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

export function createObjectSpawnerSystem({ catalog = [], eventSystem = null } = {}) {
  validateCatalog(catalog);
  const definitions = new Map(catalog.map((entry) => [entry.type, Object.freeze({ ...entry })]));
  const objects = new Map();
  const lightingSources = new Map();
  const listeners = new Set();
  let nextId = 0;

  const emit = (event) => {
    const frozen = Object.freeze({ ...event, cell: event.cell ? Object.freeze({ ...event.cell }) : undefined });
    for (const listener of listeners) listener(frozen);
    eventSystem?.publish?.(frozen);
  };

  const addObject = ({ id, type, cell, glyph = null, openGlyph = null, orientation = null, buildingId = null, effect = () => {}, realm = null } = {}) => {
    const definition = definitions.get(type);
    if (!definition) throw new RangeError(`Unknown object type: ${type}.`);
    if (!cell || !Number.isInteger(cell.x) || !Number.isInteger(cell.y)) throw new TypeError("An object needs an integer cell.");
    const objectId = id ?? `${type}-${++nextId}`;
    if (objects.has(objectId)) throw new TypeError(`Duplicate object id: ${objectId}.`);
    const object = {
      id: objectId,
      type,
      name: definition.name,
      glyph: glyph ?? definition.glyph,
      openGlyph: openGlyph ?? definition.openGlyph ?? null,
      alternateGlyph: definition.alternateGlyph ?? null,
      alternateOpenGlyph: definition.alternateOpenGlyph ?? null,
      orientation,
      buildingId,
      open: false,
      IsPickup: definition.IsPickup,
      IsLevelSpawned: definition.IsLevelSpawned,
      cell: { x: cell.x, y: cell.y },
      active: true,
      definition,
      effect,
      realm,
    };
    objects.set(objectId, object);
    if (type === "torch") { lightingSources.delete(realm); lightingSources.delete(null); }
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
      maximumDistance: distribution.maximumDistance,
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

  const getActiveObjectAtCell = (cell, context = {}) => [...objects.values()].find((candidate) => candidate.active
    && (!context.world || candidate.realm === context.world)
    && sameCell(candidate.cell, cell))
    ?? context.world?.objects?.find((candidate) => candidate?.active !== false && sameCell(candidate.cell, cell))
    ?? null;

  const interactAtCell = (cell, {
    world = null,
    keyCount = 0,
    spendKey = () => false,
    log = () => {},
    playerCell = null,
    random = Math.random,
    createChestRewardEffect = () => () => {},
    openDialog = () => false,
  } = {}) => {
    const object = getActiveObjectAtCell(cell, { world });
    if (!object) return null;
    if (object.type === "welcome-sign") {
      const opened = openDialog({ object, cell: { ...cell } });
      return { handled: opened, opened: false, object };
    }
    if (object.type === "chest" && object.open) return { handled: true, opened: false, object };
    if (object.open) return null;
    if (object.type === "chest") {
      object.open = true;
      object.glyph = object.openGlyph ?? object.glyph;
      if (world?.characters?.[cell.y]) world.characters[cell.y][cell.x] = object.glyph;
      const neighbors = [
        { x: cell.x, y: cell.y - 1 }, { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 }, { x: cell.x - 1, y: cell.y },
        { x: cell.x - 1, y: cell.y - 1 }, { x: cell.x + 1, y: cell.y - 1 },
        { x: cell.x + 1, y: cell.y + 1 }, { x: cell.x - 1, y: cell.y + 1 },
      ].filter((candidate) => world?.terrain?.[candidate.y]?.[candidate.x]?.walkable
        && !sameCell(candidate, playerCell)
        && (world.characters?.[candidate.y]?.[candidate.x] === null
          || world.characters?.[candidate.y]?.[candidate.x] === undefined)
        && !(world.objects ?? []).some((other) => other?.active !== false && sameCell(other.cell, candidate))
        && ![...objects.values()].some((other) => other.active && (!world || other.realm === world) && sameCell(other.cell, candidate)));
      const rewards = object.definition.rewards ?? [];
      const totalWeight = rewards.reduce((total, reward) => total + (reward.weight ?? 0), 0);
      let rewardType = null;
      if (totalWeight > 0) {
        let roll = random() * totalWeight;
        for (const reward of rewards) {
          roll -= reward.weight ?? 0;
          if (roll < 0) { rewardType = reward.type; break; }
        }
      }
      const rewardCell = neighbors.length > 0 ? neighbors[Math.floor(random() * neighbors.length)] : null;
      const reward = rewardType && rewardCell
        ? addObject({ type: rewardType, cell: rewardCell, realm: world, effect: createChestRewardEffect(rewardType) })
        : null;
      if (reward && rewardCell && world) {
        // The system map makes the Heart collectible; the active realm arrays
        // make it authoritative for world views and minimap/map consumers.
        // Initialize both collections defensively because chest rewards can be
        // the first pickup created in a realm with Heart generation disabled.
        world.objects = Array.isArray(world.objects) ? world.objects : [];
        world.pickups = Array.isArray(world.pickups) ? world.pickups : world.objects;
        if (!world.objects.includes(reward)) world.objects.push(reward);
        if (world.pickups !== world.objects && !world.pickups.includes(reward)) world.pickups.push(reward);
        if (world.characters?.[rewardCell.y]) world.characters[rewardCell.y][rewardCell.x] = reward.glyph;
      }
      log("Chest was opened");
      emit({ type: "chest-opened", objectId: object.id, objectType: object.type, cell: { ...object.cell }, rewardType: reward?.type ?? null, rewardCell });
      return { handled: true, opened: true, object, reward };
    }
    if (object.type !== "door") return null;
    if (keyCount <= 0 || !spendKey()) {
      log("The door is locked.");
      return { handled: true, opened: false, object };
    }
    object.open = true;
    object.glyph = object.openGlyph ?? object.glyph;
    if (world?.terrain?.[cell.y]?.[cell.x]) world.terrain[cell.y][cell.x].walkable = true;
    if (world?.characters?.[cell.y]) world.characters[cell.y][cell.x] = object.glyph;
    log("A key was spent.");
    log("The door unlocked.");
    emit({
      type: "door-unlocked",
      objectId: object.id,
      objectType: object.type,
      cell: { ...object.cell },
    });
    return { handled: true, opened: true, object };
  };

  const collideAtCell = (cell, context = {}) => {
    const object = getActiveObjectAtCell(cell, context);
    if (!object) return null;
    if (object.type === "chest" && object.open) return null;
    if (object.IsPickup) {
      object.active = false;
      if (object.type === "torch") { lightingSources.delete(object.realm); lightingSources.delete(null); }
      if (context.world?.characters?.[object.cell.y]?.[object.cell.x] === object.glyph) {
        context.world.characters[object.cell.y][object.cell.x] = null;
      }
    }
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
    getActiveObjectAtCell,
    interactAtCell,
    getCatalog() { return Object.freeze([...definitions.values()]); },
    getObjects() { return Object.freeze([...objects.values()].map(({ effect, definition, realm, ...object }) => freezeObject(object))); },
    getActiveObjects(realm = null) { return Object.freeze([...objects.values()].filter((object) => object.active && (!realm || object.realm === realm)).map(({ effect, definition, realm: objectRealm, ...object }) => freezeObject(object))); },
    getLightingSources(realm = null) {
      if (!lightingSources.has(realm)) lightingSources.set(realm, Object.freeze([...objects.values()]
        .filter((object) => object.active && object.type === "torch" && (!realm || object.realm === realm))
        .map((object) => Object.freeze({ ...object.cell }))));
      return lightingSources.get(realm);
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  });
}

export function validateObjectPalette(catalog, palette = []) {
  const glyphs = new Set(palette.map((entry) => entry.glyph));
  for (const entry of validateCatalog(catalog)) {
    for (const glyph of [entry.glyph, entry.openGlyph, entry.alternateGlyph, entry.alternateOpenGlyph].filter(Boolean)) {
      if (!glyphs.has(glyph)) throw new Error(`Object glyph is missing from the palette: ${glyph}`);
    }
  }
  return true;
}
