import { getPaletteStyle } from "../../bridge-layer/palette.js";
import { MINIMAP_WORLD_SCALE, getMinimapCoverage, isDiscovered } from "./fog-of-war-system.js";
import { getVisibleGlyph } from "./world-system.js";

export const MINIMAP_MARKER_DEPTHS = Object.freeze({
  base: 0,
  world: 10,
  start: 20,
  torch: 30,
  player: 40,
});

const MINIMAP_MARKER_COLORS = Object.freeze({
  start: "#00ff00",
  torch: "#ffffff",
  player: "#ffff00",
});

function hexToRgb(color) {
  return [0, 2, 4].map((offset) => Number.parseInt(color.slice(offset + 1, offset + 3), 16));
}

function rgbToHex([red, green, blue]) {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

function getMinimapMarkerCell(cell) {
  return {
    x: Math.floor(cell.x / MINIMAP_WORLD_SCALE),
    y: Math.floor(cell.y / MINIMAP_WORLD_SCALE),
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
  for (const torch of world.torches ?? []) {
    if (!isDiscovered(fog, world, torch)) continue;
    markers.push({
      type: "torch", color: MINIMAP_MARKER_COLORS.torch,
      depth: MINIMAP_MARKER_DEPTHS.torch, cell: getMinimapMarkerCell(torch),
    });
  }
  markers.push({
    type: "player", color: MINIMAP_MARKER_COLORS.player,
    depth: MINIMAP_MARKER_DEPTHS.player, cell: getMinimapMarkerCell(playerCell),
  });
  return markers;
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
