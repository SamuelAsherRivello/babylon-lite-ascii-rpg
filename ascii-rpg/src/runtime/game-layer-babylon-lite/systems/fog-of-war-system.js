import { hasClearLightPath } from "../lighting.js";

export const MINIMAP_WORLD_SCALE = 10;
export const DISCOVERY_LIGHT_CUTOFF = 0.1;
export const fogUnclearRadius = 5;
export const FOG_VISIBILITY_LEVELS = Object.freeze([25, 50, 75, 100]);

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
  const visibility = new Uint8Array(world.rows * world.columns);
  return {
    visibility,
    discovered: visibility,
    visibilityTotals: new Uint32Array(minimapColumns * minimapRows),
    walkableCounts,
    minimapColumns,
    minimapRows,
    fogUnclearRadius: Number.isFinite(world.fogUnclearRadius) ? world.fogUnclearRadius : fogUnclearRadius,
  };
}

export function isDiscovered(fog, world, cell) {
  return getFogVisibility(fog, world, cell) > 0;
}

export function getFogVisibility(fog, world, cell) {
  if (!fog || !world || !Number.isInteger(cell?.x) || !Number.isInteger(cell?.y) ||
      cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return 0;
  return fog.visibility?.[getCellIndex(cell, world.columns)] ?? 0;
}

export function discoverCell(fog, world, cell) {
  if (!fog || !isWalkable(world, cell)) return false;
  return markVisibility(fog, world, cell, 100);
}

function markVisibility(fog, world, cell, candidateVisibility) {
  if (!fog || !world || !Number.isFinite(candidateVisibility) ||
      cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return false;
  const index = getCellIndex(cell, world.columns);
  const previousVisibility = fog.visibility[index];
  const nextVisibility = Math.max(previousVisibility, Math.min(100, Math.max(0, Math.round(candidateVisibility))));
  if (nextVisibility === previousVisibility) return false;
  fog.visibility[index] = nextVisibility;
  if (isWalkable(world, cell)) {
    const minimapIndex = getMinimapIndex(getMinimapCell(cell), fog.minimapColumns);
    fog.visibilityTotals[minimapIndex] += nextVisibility - previousVisibility;
  }
  return true;
}

function getVisibilityForDistance(distance, radius) {
  if (!Number.isFinite(distance) || !Number.isFinite(radius) || radius <= 0 || distance > radius) return 0;
  const normalizedDistance = distance / radius;
  if (normalizedDistance <= 0.7) return 100;
  if (normalizedDistance <= 0.8) return 75;
  if (normalizedDistance <= 0.9) return 50;
  return 25;
}

export function discoverFromPlayer(fog, world, playerCell) {
  if (!fog || !isWalkable(world, playerCell)) return [];
  const discovered = [];
  const unclearRadius = Number.isFinite(fog.fogUnclearRadius) ? fog.fogUnclearRadius : fogUnclearRadius;
  const radius = Math.ceil(unclearRadius);
  for (let y = Math.max(0, playerCell.y - radius); y <= Math.min(world.rows - 1, playerCell.y + radius); y += 1) {
    for (let x = Math.max(0, playerCell.x - radius); x <= Math.min(world.columns - 1, playerCell.x + radius); x += 1) {
      const target = { x, y };
      const visibility = getVisibilityForDistance(
        Math.hypot(target.x - playerCell.x, target.y - playerCell.y),
        unclearRadius,
      );
      if (visibility === 0) continue;
      if (!hasClearLightPath(playerCell, target, world.terrain)) continue;
      if (markVisibility(fog, world, target, visibility)) discovered.push(target);
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
  return walkable === 0 ? 0 : fog.visibilityTotals[index] / (walkable * 100);
}
