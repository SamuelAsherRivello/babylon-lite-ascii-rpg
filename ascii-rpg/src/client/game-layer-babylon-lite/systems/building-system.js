import { AStarUtility } from "../utilities/a-star-utility.js";

export const HOME_WIDTH = 20;
export const HOME_HEIGHT = 10;
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

export function createHomeAt(origin) {
  const door = Object.freeze({ x: origin.x + 9, y: origin.y + HOME_HEIGHT - 1 });
  const approach = Object.freeze({ x: door.x, y: door.y + 1 });
  const cells = [];
  const walls = [];
  const interior = [];
  for (let y = 0; y < HOME_HEIGHT; y += 1) for (let x = 0; x < HOME_WIDTH; x += 1) {
    const cell = Object.freeze({ x: origin.x + x, y: origin.y + y });
    cells.push(cell);
    if (x === 0 || x === HOME_WIDTH - 1 || y === 0 || y === HOME_HEIGHT - 1) {
      if (!sameCell(cell, door)) walls.push(cell);
    } else interior.push(cell);
  }
  return Object.freeze({
    type: "home", origin: Object.freeze({ ...origin }), width: HOME_WIDTH, height: HOME_HEIGHT,
    cells: Object.freeze(cells), walls: Object.freeze(walls), interior: Object.freeze(interior), door, approach,
    key: null, exteriorGlyph: HOME_ROOF_GLYPH, interiorGlyph: HOME_INTERIOR_GLYPH, wallGlyph: HOME_WALL_GLYPH,
  });
}

function findExteriorKey(world, home, reserved, random) {
  const footprint = new Set(home.cells.map(cellKey));
  const field = AStarUtility.createDistanceField(world, home.approach, { isBlocked: (cell) => footprint.has(cellKey(cell)), maxDistance: 6 });
  const candidates = [];
  for (let y = 0; y < world.rows; y += 1) for (let x = 0; x < world.columns; x += 1) {
    const cell = { x, y }; const distance = field.getDistance(cell);
    if (distance >= 3 && distance <= 6 && !reserved.has(cellKey(cell)) && !footprint.has(cellKey(cell))) candidates.push(cell);
  }
  if (!candidates.length) return null;
  return Object.freeze({ ...candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))] });
}

export function findHomeCandidates(world, { region = null, reserved = new Set(), random = Math.random } = {}) {
  if (!world?.terrain) return Object.freeze([]);
  const occupied = collectReservedCells(world, reserved);
  const candidates = [];
  const minX = Math.max(1, region?.x ?? 1);
  const maxX = Math.min(world.columns - HOME_WIDTH - 1, (region ? region.x + region.width - 1 : world.columns - 2));
  const minY = Math.max(1, region?.y ?? 1);
  const maxY = Math.min(world.rows - HOME_HEIGHT - 2, (region ? region.y + region.height - 1 : world.rows - 3));
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    const home = createHomeAt({ x, y });
    if (!isInWorld(world, home.approach) || !isWalkable(world, home.approach)
      || home.cells.some((cell) => !isWalkable(world, cell) || occupied.has(cellKey(cell)))) continue;
    const key = findExteriorKey(world, home, occupied, random);
    if (!key) continue;
    candidates.push(Object.freeze({ ...home, key }));
  }
  return Object.freeze(candidates);
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
    const candidates = findHomeCandidates(world, { region, reserved: occupied, random });
    if (!candidates.length) continue;
    const home = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
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
