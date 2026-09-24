import { AStarUtility } from "../utilities/a-star-utility.js";

export const HOME_SIZE_SMALL = "SMALL";
export const HOME_SIZE_MED = "MED";
export const HOME_SIZE_HIGH = "HIGH";
export const HOME_SIZE_DEFINITIONS = Object.freeze([
  Object.freeze({ name: HOME_SIZE_SMALL, width: 7, height: 5 }),
  Object.freeze({ name: HOME_SIZE_MED, width: 10, height: 5 }),
  Object.freeze({ name: HOME_SIZE_HIGH, width: 20, height: 10 }),
]);
export const HOME_WIDTH = HOME_SIZE_DEFINITIONS[2].width;
export const HOME_HEIGHT = HOME_SIZE_DEFINITIONS[2].height;
export const HOME_WALL_GLYPH = "#";
export const HOME_ROOF_GLYPH = "^";
export const HOME_INTERIOR_GLYPH = ".";
export const HOME_SCREEN_COLUMNS = 64;
export const HOME_SCREEN_ROWS = 36;
export const HOME_SCREEN_CHANCE = 0.1;

const cellKey = (cell) => `${cell.x},${cell.y}`;
const sameCell = (left, right) => left?.x === right?.x && left?.y === right?.y;
const isWalkable = (world, cell) => Boolean(world?.terrain?.[cell.y]?.[cell.x]?.walkable);

function isInWorld(world, cell) {
  return cell.x > 0 && cell.y > 0 && cell.x < world.columns - 1 && cell.y < world.rows - 1;
}

function collectReservedCells(world, reserved) {
  const cells = new Set(reserved);
  if (world.playerStart) cells.add(cellKey(world.playerStart));
  for (const object of world.objects ?? []) if (object.active !== false && object.cell) cells.add(cellKey(object.cell));
  for (const stair of world.stairs ?? []) cells.add(cellKey(stair));
  return cells;
}

function createRegions(world, columns, rows) {
  const regions = [];
  for (let y = 1; y < world.rows - 1; y += rows) for (let x = 1; x < world.columns - 1; x += columns) {
    regions.push({ x, y, width: Math.min(columns, world.columns - 1 - x), height: Math.min(rows, world.rows - 1 - y) });
  }
  return regions;
}

function getHomeSizeDefinition(size = HOME_SIZE_HIGH) {
  return HOME_SIZE_DEFINITIONS.find((definition) => definition.name === size) ?? HOME_SIZE_DEFINITIONS[2];
}

export function createHomeAt(origin, size = HOME_SIZE_HIGH) {
  const definition = typeof size === "string" ? getHomeSizeDefinition(size) : size;
  const doorColumn = Math.floor((definition.width - 1) / 2);
  const door = Object.freeze({ x: origin.x + doorColumn, y: origin.y + definition.height - 1 });
  const approach = Object.freeze({ x: door.x, y: door.y + 1 });
  const cells = [];
  const walls = [];
  const interior = [];
  for (let y = 0; y < definition.height; y += 1) for (let x = 0; x < definition.width; x += 1) {
    const cell = Object.freeze({ x: origin.x + x, y: origin.y + y });
    cells.push(cell);
    if (x === 0 || x === definition.width - 1 || y === 0 || y === definition.height - 1) {
      if (!sameCell(cell, door)) walls.push(cell);
    } else interior.push(cell);
  }
  return Object.freeze({
    id: `home-${origin.x}-${origin.y}`,
    type: "home", size: definition.name, origin: Object.freeze({ ...origin }), width: definition.width, height: definition.height,
    cells: Object.freeze(cells), walls: Object.freeze(walls), interior: Object.freeze(interior), door, approach,
    key: null, exteriorGlyph: HOME_ROOF_GLYPH, interiorGlyph: HOME_INTERIOR_GLYPH, wallGlyph: HOME_WALL_GLYPH,
    chestCell: null,
  });
}

export function getHomeInteriorCorners(home) {
  if (!home) return Object.freeze([]);
  return Object.freeze([
    Object.freeze({ x: home.origin.x + 1, y: home.origin.y + 1 }),
    Object.freeze({ x: home.origin.x + home.width - 2, y: home.origin.y + 1 }),
    Object.freeze({ x: home.origin.x + 1, y: home.origin.y + home.height - 2 }),
    Object.freeze({ x: home.origin.x + home.width - 2, y: home.origin.y + home.height - 2 }),
  ]);
}

function findExteriorKey(world, home, reserved, random) {
  const footprint = cell => cell.x >= home.origin.x && cell.x < home.origin.x + home.width && cell.y >= home.origin.y && cell.y < home.origin.y + home.height;
  const field = AStarUtility.createDistanceField(world, home.approach, { isBlocked: footprint, maxDistance: 6 });
  const candidates = [];
  for (let y = Math.max(0, home.approach.y - 6); y <= Math.min(world.rows - 1, home.approach.y + 6); y += 1) for (let x = Math.max(0, home.approach.x - 6); x <= Math.min(world.columns - 1, home.approach.x + 6); x += 1) {
    const cell = { x, y }; const distance = field.getDistance(cell);
    if (distance >= 3 && distance <= 6 && isWalkable(world, cell) && !reserved.has(cellKey(cell)) && !footprint(cell)) candidates.push(cell);
  }
  if (!candidates.length) return null;
  return Object.freeze({ ...candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))] });
}

function collectHomeCandidates(world, { region = null, reserved = new Set(), random = Math.random, size = HOME_SIZE_HIGH } = {}) {
  if (!world?.terrain) return Object.freeze([]);
  const definition = typeof size === "string" ? getHomeSizeDefinition(size) : size;
  const occupied = collectReservedCells(world, reserved);
  const candidates = [];
  const minX = Math.max(1, region?.x ?? 1);
  const maxX = Math.min(world.columns - definition.width - 1, (region ? region.x + region.width - 1 : world.columns - 2));
  const minY = Math.max(1, region?.y ?? 1);
  const maxY = Math.min(world.rows - definition.height - 2, (region ? region.y + region.height - 1 : world.rows - 3));
  if (minX > maxX || minY > maxY) return Object.freeze([]);
  // Summed occupancy permits a constant-time footprint rejection, before any
  // frozen cell records or key navigation data are constructed.
  const stride = Math.max(0, maxX - minX + definition.width) + 1;
  const height = Math.max(0, maxY - minY + definition.height);
  const blocked = new Uint32Array((height + 1) * stride);
  for (let y = 0; y < height; y += 1) {
    let row = 0;
    for (let x = 0; x < stride - 1; x += 1) {
      row += !world.terrain[y + minY][x + minX].walkable || occupied.has(`${x + minX},${y + minY}`) ? 1 : 0;
      blocked[(y + 1) * stride + x + 1] = blocked[y * stride + x + 1] + row;
    }
  }
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    const right = x + definition.width, bottom = y + definition.height;
    const leftIndex = x - minX, topIndex = y - minY;
    const rightIndex = right - minX, bottomIndex = bottom - minY;
    if (blocked[bottomIndex * stride + rightIndex] - blocked[topIndex * stride + rightIndex] - blocked[bottomIndex * stride + leftIndex] + blocked[topIndex * stride + leftIndex]) continue;
    const home = { origin: { x, y }, width: definition.width, height: definition.height, approach: { x: x + Math.floor((definition.width - 1) / 2), y: bottom } };
    if (!isInWorld(world, home.approach) || !isWalkable(world, home.approach)) continue;
    const key = findExteriorKey(world, home, occupied, random);
    if (!key) continue;
    const homeWithGeometry = createHomeAt(home.origin, definition);
    const cornerCandidates = getHomeInteriorCorners(homeWithGeometry)
      .filter((cell) => isWalkable(world, cell) && !occupied.has(cellKey(cell)) && !sameCell(cell, key));
    if (!cornerCandidates.length) continue;
    const chestCell = cornerCandidates[Math.min(cornerCandidates.length - 1, Math.floor(random() * cornerCandidates.length))];
    candidates.push({ origin: home.origin, key, chestCell });
  }
  return Object.freeze(candidates);
}

export function findHomeCandidates(world, options = {}) {
  const size = options.size ?? HOME_SIZE_HIGH;
  return Object.freeze(collectHomeCandidates(world, { ...options, size }).map(({ origin, key, chestCell }) => Object.freeze({ ...createHomeAt(origin, size), key, chestCell: Object.freeze({ ...chestCell }) })));
}

export function createOverworldBuildings(world, {
  random = Math.random,
  chance = HOME_SCREEN_CHANCE,
  screenColumns = HOME_SCREEN_COLUMNS,
  screenRows = HOME_SCREEN_ROWS,
  reserved = new Set(),
} = {}) {
  if (!world?.terrain) return Object.freeze([]);
  const occupied = collectReservedCells(world, reserved);
  const buildings = [];
  for (const region of createRegions(world, screenColumns, screenRows)) {
    if (random() >= chance) continue;
    const size = HOME_SIZE_DEFINITIONS[Math.min(HOME_SIZE_DEFINITIONS.length - 1, Math.floor(random() * HOME_SIZE_DEFINITIONS.length))];
    const candidates = collectHomeCandidates(world, { region, reserved: occupied, random, size });
    if (!candidates.length) continue;
    const selected = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
    const home = Object.freeze({ ...createHomeAt(selected.origin, size), key: selected.key, chestCell: Object.freeze({ ...selected.chestCell }) });
    buildings.push(home);
    for (const cell of [...home.cells, home.key]) occupied.add(cellKey(cell));
  }
  return Object.freeze(buildings);
}

export function containsBuildingCell(building, cell) {
  return Boolean(building && (sameCell(building.door, cell) || building.interior.some((candidate) => sameCell(candidate, cell))));
}

export function getBuildingGlyph(building, cell, playerCell) {
  if (!building || sameCell(building.door, cell)) return null;
  if (building.walls.some((candidate) => sameCell(candidate, cell))) return building.wallGlyph;
  if (!building.interior.some((candidate) => sameCell(candidate, cell))) return null;
  return containsBuildingCell(building, playerCell) ? building.interiorGlyph : building.exteriorGlyph;
}

// Immutable building arrays identify the placement revision. Door characters and
// dynamic occupants still take precedence in the caller; this index is visual only.
const presentationIndexes = new WeakMap();
export function getBuildingPresentationDirtyCells(buildings, previousPlayer, nextPlayer) {
  return (buildings ?? []).flatMap(building => containsBuildingCell(building, previousPlayer) !== containsBuildingCell(building, nextPlayer) ? building.cells : []);
}

export function getIndexedBuildingGlyph(buildings, cell, playerCell) {
  if (!buildings?.length) return null;
  let index = presentationIndexes.get(buildings);
  if (!index) {
    const cells = new Map();
    for (const building of buildings) {
      const key = building.key ? cellKey(building.key) : null;
      for (const wall of building.walls) if (cellKey(wall) !== key && !cells.has(cellKey(wall))) cells.set(cellKey(wall), { building, wall: true });
      for (const interior of building.interior) if (cellKey(interior) !== key && !cells.has(cellKey(interior))) cells.set(cellKey(interior), { building, wall: false });
    }
    index = { cells, playerKey: null, inside: new Map() };
    presentationIndexes.set(buildings, index);
  }
  const record = index.cells.get(cellKey(cell));
  if (!record) return null;
  if (record.wall) return record.building.wallGlyph;
  const playerKey = playerCell ? cellKey(playerCell) : "none";
  if (index.playerKey !== playerKey) { index.playerKey = playerKey; index.inside.clear(); }
  if (!index.inside.has(record.building)) index.inside.set(record.building, containsBuildingCell(record.building, playerCell));
  return index.inside.get(record.building) ? record.building.interiorGlyph : record.building.exteriorGlyph;
}
