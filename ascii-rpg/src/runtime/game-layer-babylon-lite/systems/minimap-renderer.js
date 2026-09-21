import { getPaletteStyle } from "../../bridge-layer/palette.js";
import { MINIMAP_WORLD_SCALE, getMinimapCoverage, isDiscovered } from "./fog-of-war-system.js";
import { getVisibleGlyph } from "./world-system.js";

export const MINIMAP_MARKER_DEPTHS = Object.freeze({
  base: 0,
  world: 10,
  start: 20,
  quest: 30,
  player: 40,
});

export const MINIMAP_INDICATOR_SAFE_INSET = 5;
export const MINIMAP_INDICATOR_MIN_SIZE = 9.6;

const MINIMAP_MARKER_COLORS = Object.freeze({
  start: "#00ff00",
  quest: "#ffff00",
  player: "#ffff00",
});

function getWorldObjects(world) {
  return world?.objects ?? world?.pickups ?? [];
}

function getPickupObjects(world) {
  if (world?.objects) {
    const markerIds = world.questPickupIds;
    if (!(markerIds instanceof Set) && !Array.isArray(markerIds)) return [];
    return world.objects.filter((object) => markerIds.has?.(object.id) || markerIds.includes?.(object.id));
  }
  return world?.pickups ?? [];
}

function hexToRgb(color) {
  return [0, 2, 4].map((offset) => Number.parseInt(color.slice(offset + 1, offset + 3), 16));
}

function rgbToHex([red, green, blue]) {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

function getMinimapMarkerCell(cell) {
  return {
    x: cell.x,
    y: cell.y,
  };
}

/**
 * Returns minimap markers from back to front so later entries visibly cover
 * earlier entries in the same coarse minimap pixel.
 */
export function getMinimapMarkers(world, fog, playerCell) {
  if (!world || !fog || !playerCell) return [];
  const markers = [];
  if (world.playerStart) {
    markers.push({
      type: "start", color: MINIMAP_MARKER_COLORS.start,
      depth: MINIMAP_MARKER_DEPTHS.start, cell: getMinimapMarkerCell(world.playerStart),
    });
  }
  for (const pickup of getPickupObjects(world)) {
    if (!pickup.active) continue;
    markers.push({
      type: "quest", color: MINIMAP_MARKER_COLORS.quest,
      depth: MINIMAP_MARKER_DEPTHS.quest, pickupId: pickup.id,
      cell: getMinimapMarkerCell(pickup.cell),
    });
  }
  if (playerCell) {
    markers.push({
      type: "player", color: MINIMAP_MARKER_COLORS.player,
      depth: MINIMAP_MARKER_DEPTHS.player, cell: getMinimapMarkerCell(playerCell),
    });
  }
  return markers;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getMinimapIndicatorSafeArea(width, height, inset = MINIMAP_INDICATOR_SAFE_INSET) {
  const safeInset = Math.max(0, inset);
  return {
    left: safeInset,
    top: safeInset,
    right: Math.max(safeInset, width - safeInset),
    bottom: Math.max(safeInset, height - safeInset),
  };
}

export function getMinimapEdgeIndicators(world, playerCell, viewport) {
  if (!world || !playerCell || !viewport) return [];
  const indicators = [];
  const minimumX = viewport.x;
  const minimumY = viewport.y;
  const maximumX = viewport.x + viewport.columns - 1;
  const maximumY = viewport.y + viewport.rows - 1;
  const localPlayer = { x: playerCell.x - minimumX, y: playerCell.y - minimumY };
  const edgeCounts = new Map();
  for (const pickup of getPickupObjects(world)) {
    if (!pickup.active) continue;
    const localTarget = { x: pickup.cell.x - minimumX, y: pickup.cell.y - minimumY };
    if (localTarget.x >= 0 && localTarget.x < viewport.columns && localTarget.y >= 0 && localTarget.y < viewport.rows) continue;
    const direction = { x: localTarget.x - localPlayer.x, y: localTarget.y - localPlayer.y };
    if (direction.x === 0 && direction.y === 0) continue;
    const factors = [];
    if (direction.x > 0) factors.push((viewport.columns - 1 - localPlayer.x) / direction.x);
    if (direction.x < 0) factors.push((0 - localPlayer.x) / direction.x);
    if (direction.y > 0) factors.push((viewport.rows - 1 - localPlayer.y) / direction.y);
    if (direction.y < 0) factors.push((0 - localPlayer.y) / direction.y);
    const factor = Math.min(...factors.filter((candidate) => candidate >= 0));
    const edge = {
      x: clamp(localPlayer.x + direction.x * factor, 0, viewport.columns - 1),
      y: clamp(localPlayer.y + direction.y * factor, 0, viewport.rows - 1),
    };
    const edgeKey = `${Math.round(edge.x === 0 || edge.x === viewport.columns - 1 ? edge.x : edge.y)}:${edge.x === 0 || edge.x === viewport.columns - 1 ? "x" : "y"}`;
    const offsetIndex = edgeCounts.get(edgeKey) ?? 0;
    edgeCounts.set(edgeKey, offsetIndex + 1);
    indicators.push({
      type: "quest-edge", pickupId: pickup.id, color: MINIMAP_MARKER_COLORS.quest,
      edge, direction, offsetIndex,
    });
  }
  return indicators;
}

/**
 * Reduces one 10 by 10 world area to its unlit, fog-masked minimap pixel.
 * Only discovered walkable cells contribute, so unwalkable terrain never leaks
 * through a partially explored coarse area.
 */
export function getMinimapWorldPixel(world, fog, palette, minimapCell) {
  const opacity = getMinimapCoverage(fog, minimapCell);
  if (opacity <= 0) return { color: "#000000", opacity: 0 };

  const minimumX = minimapCell.x * MINIMAP_WORLD_SCALE;
  const minimumY = minimapCell.y * MINIMAP_WORLD_SCALE;
  const maximumX = Math.min(world.columns, minimumX + MINIMAP_WORLD_SCALE);
  const maximumY = Math.min(world.rows, minimumY + MINIMAP_WORLD_SCALE);
  const total = [0, 0, 0];
  let count = 0;

  for (let y = minimumY; y < maximumY; y += 1) {
    for (let x = minimumX; x < maximumX; x += 1) {
      const cell = { x, y };
      if (!world.terrain[y][x].walkable || !isDiscovered(fog, world, cell)) continue;
      const color = getPaletteStyle(palette, getVisibleGlyph(world, cell)).color;
      const channels = hexToRgb(color);
      total[0] += channels[0];
      total[1] += channels[1];
      total[2] += channels[2];
      count += 1;
    }
  }

  return {
    color: count === 0 ? "#000000" : rgbToHex(total.map((channel) => channel / count)),
    opacity,
  };
}

export function getMinimapWorldGraphic(world, fog, palette, minimapCell) {
  const minimumX = minimapCell.x * MINIMAP_WORLD_SCALE;
  const minimumY = minimapCell.y * MINIMAP_WORLD_SCALE;
  const maximumX = Math.min(world.columns, minimumX + MINIMAP_WORLD_SCALE);
  const maximumY = Math.min(world.rows, minimumY + MINIMAP_WORLD_SCALE);

  for (let y = minimumY; y < maximumY; y += 1) {
    for (let x = minimumX; x < maximumX; x += 1) {
      const cell = { x, y };
      if (!world.terrain[y][x].walkable || !isDiscovered(fog, world, cell)) continue;
      const glyph = getVisibleGlyph(world, cell);
      return { glyph, color: getPaletteStyle(palette, glyph).color };
    }
  }

  return null;
}

export function getMinimapWorldCellGraphic(world, fog, palette, cell) {
  if (!world?.terrain?.[cell.y]?.[cell.x] || !isDiscovered(fog, world, cell)) return null;
  const glyph = getVisibleGlyph(world, cell);
  return { glyph, color: getPaletteStyle(palette, glyph).color };
}
