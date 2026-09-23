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

export function createFogOfWar(world, { deferMetrics = false } = {}) {
  if (!world?.terrain || !Number.isInteger(world.rows) || !Number.isInteger(world.columns)) {
    throw new TypeError("Fog of war requires a generated world.");
  }
  const minimapColumns = Math.ceil(world.columns / MINIMAP_WORLD_SCALE);
  const minimapRows = Math.ceil(world.rows / MINIMAP_WORLD_SCALE);
  const walkableCounts = new Uint16Array(minimapColumns * minimapRows);
  const fog = {
    visibility: new Uint8Array(world.rows * world.columns),
    discovered: null,
    visibilityTotals: new Uint32Array(minimapColumns * minimapRows),
    walkableCounts,
    walkableCellCount: 0,
    discoveredWalkableCount: 0,
    minimapColumns,
    minimapRows,
    fogUnclearRadius: Number.isFinite(world.fogUnclearRadius) ? world.fogUnclearRadius : fogUnclearRadius,
    walkableMetricsReady: false,
  };
  fog.discovered = fog.visibility;
  if (!deferMetrics) ensureFogMetrics(fog, world);
  return fog;
}

export function ensureFogMetrics(fog, world) {
  if (!fog || !world || fog.walkableMetricsReady) return fog;
  fog.walkableCounts.fill(0);
  let walkableCellCount = 0;
  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.columns; x += 1) {
      const cell = { x, y };
      if (!isWalkable(world, cell)) continue;
      walkableCellCount += 1;
      fog.walkableCounts[getMinimapIndex(getMinimapCell(cell), fog.minimapColumns)] += 1;
    }
  }
  fog.walkableCellCount = walkableCellCount;
  fog.walkableMetricsReady = true;
  return fog;
}

/**
 * Creates one independent fog map for every realm in a generated world.
 * The returned records are keyed by realm name so a view can never reuse a
 * discovery map from another realm.
 */
export function createFogMapsForWorld(worldRealms) {
  if (!worldRealms?.realms || typeof worldRealms.realms !== "object") {
    throw new TypeError("Fog maps require generated world realms.");
  }
  return Object.fromEntries(Object.entries(worldRealms.realms).map(([realmName, world]) => [
    realmName,
    createFogOfWar(world),
  ]));
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
    if (previousVisibility === 0 && nextVisibility > 0) fog.discoveredWalkableCount += 1;
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

function getStartingFootprintExtent(viewportExtent, coverage, worldExtent) {
  if (!Number.isFinite(viewportExtent) || viewportExtent <= 0) return 1;
  const safeCoverage = Number.isFinite(coverage) ? Math.max(0, Math.min(1, coverage)) : 1;
  return Math.max(1, Math.min(worldExtent, Math.round(viewportExtent * safeCoverage)));
}

function getStartingFootprintBounds(playerCoordinate, footprintExtent, worldExtent) {
  const halfExtent = Math.floor(footprintExtent / 2);
  const maximumStart = Math.max(0, worldExtent - footprintExtent);
  const start = Math.min(Math.max(playerCoordinate - halfExtent, 0), maximumStart);
  return { start, end: start + footprintExtent - 1 };
}

function getStartingVisibility(target, playerCell, footprintWidth, footprintHeight) {
  const halfWidth = Math.max((footprintWidth - 1) / 2, 0);
  const halfHeight = Math.max((footprintHeight - 1) / 2, 0);
  const normalizedX = halfWidth === 0 ? (target.x === playerCell.x ? 0 : Infinity) : Math.abs(target.x - playerCell.x) / halfWidth;
  const normalizedY = halfHeight === 0 ? (target.y === playerCell.y ? 0 : Infinity) : Math.abs(target.y - playerCell.y) / halfHeight;
  return getVisibilityForDistance(Math.min(1, Math.max(normalizedX, normalizedY)), 1);
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

export function discoverStartingArea(fog, world, playerCell, {
  viewportColumns,
  viewportRows,
  coverageX = 1,
  coverageY = 1,
} = {}) {
  if (!fog || !isWalkable(world, playerCell)) return [];
  const footprintWidth = getStartingFootprintExtent(viewportColumns, coverageX, world.columns);
  const footprintHeight = getStartingFootprintExtent(viewportRows, coverageY, world.rows);
  const xBounds = getStartingFootprintBounds(playerCell.x, footprintWidth, world.columns);
  const yBounds = getStartingFootprintBounds(playerCell.y, footprintHeight, world.rows);
  const discovered = [];
  for (let y = yBounds.start; y <= yBounds.end; y += 1) {
    for (let x = xBounds.start; x <= xBounds.end; x += 1) {
      const target = { x, y };
      const visibility = getStartingVisibility(target, playerCell, footprintWidth, footprintHeight);
      if (visibility === 0 || !hasClearLightPath(playerCell, target, world.terrain)) continue;
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

export function getRealmDiscoveryPercent(fog) {
  if (!fog || !Number.isFinite(fog.walkableCellCount) || fog.walkableCellCount <= 0) return 0;
  const discovered = Math.min(
    fog.walkableCellCount,
    Math.max(0, Number(fog.discoveredWalkableCount) || 0),
  );
  return Math.min(100, Math.max(0, Math.round((discovered * 100) / fog.walkableCellCount)));
}
