import { hasClearLightPath } from "../lighting.js";

export const MINIMAP_WORLD_SCALE = 10;
export const DISCOVERY_LIGHT_CUTOFF = 0.1;
export const fogUnclearRadius = 20;

function getCellIndex(cell, columns) {
  return cell.y * columns + cell.x;
}

function getMinimapIndex(cell, minimapColumns) {
  return cell.y * minimapColumns + cell.x;
}

function isWalkable(world, cell) {
  return world.terrain[cell.y]?.[cell.x]?.walkable === true;
}

function getMinimapCell(cell) {
  return {
    x: Math.floor(cell.x / MINIMAP_WORLD_SCALE),
    y: Math.floor(cell.y / MINIMAP_WORLD_SCALE),
  };
}

export function createFogOfWar(world) {
  if (!world?.terrain || !Number.isInteger(world.rows) || !Number.isInteger(world.columns)) {
    throw new TypeError("Fog of war requires a generated world.");
  }
  const minimapColumns = Math.ceil(world.columns / MINIMAP_WORLD_SCALE);
  const minimapRows = Math.ceil(world.rows / MINIMAP_WORLD_SCALE);
  const walkableCounts = new Uint16Array(minimapColumns * minimapRows);
  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.columns; x += 1) {
      const cell = { x, y };
      if (!isWalkable(world, cell)) continue;
      walkableCounts[getMinimapIndex(getMinimapCell(cell), minimapColumns)] += 1;
    }
  }
  return {
    discovered: new Uint8Array(world.rows * world.columns),
    discoveredCounts: new Uint16Array(minimapColumns * minimapRows),
    walkableCounts,
    minimapColumns,
    minimapRows,
  };
}

export function isDiscovered(fog, world, cell) {
  if (!fog || !world || !Number.isInteger(cell?.x) || !Number.isInteger(cell?.y) ||
      cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return false;
  return fog.discovered[getCellIndex(cell, world.columns)] === 1;
}

export function discoverCell(fog, world, cell) {
  if (!fog || !isWalkable(world, cell)) return false;
  const index = getCellIndex(cell, world.columns);
  if (fog.discovered[index] === 1) return false;
  fog.discovered[index] = 1;
  const minimapIndex = getMinimapIndex(getMinimapCell(cell), fog.minimapColumns);
  fog.discoveredCounts[minimapIndex] += 1;
  return true;
}

export function discoverFromPlayer(fog, world, playerCell) {
  if (!fog || !isWalkable(world, playerCell)) return [];
  const discovered = [];
  if (discoverCell(fog, world, playerCell)) discovered.push({ ...playerCell });
  const radius = Math.ceil(fogUnclearRadius);
  for (let y = Math.max(0, playerCell.y - radius); y <= Math.min(world.rows - 1, playerCell.y + radius); y += 1) {
    for (let x = Math.max(0, playerCell.x - radius); x <= Math.min(world.columns - 1, playerCell.x + radius); x += 1) {
      const target = { x, y };
      if (!isWalkable(world, target) || Math.hypot(target.x - playerCell.x, target.y - playerCell.y) >= fogUnclearRadius) continue;
      if (!hasClearLightPath(playerCell, target, world.terrain)) continue;
      if (discoverCell(fog, world, target)) discovered.push(target);
    }
  }
  return discovered;
}

export function getMinimapCoverage(fog, minimapCell) {
  if (!fog || !Number.isInteger(minimapCell?.x) || !Number.isInteger(minimapCell?.y) ||
      minimapCell.x < 0 || minimapCell.y < 0 ||
      minimapCell.x >= fog.minimapColumns || minimapCell.y >= fog.minimapRows) return 0;
  const index = getMinimapIndex(minimapCell, fog.minimapColumns);
  const walkable = fog.walkableCounts[index];
  return walkable === 0 ? 0 : fog.discoveredCounts[index] / walkable;
}
