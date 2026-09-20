import { getPaletteStyle } from "../../bridge-layer/palette.js";
import { MINIMAP_WORLD_SCALE, getMinimapCoverage, isDiscovered } from "./fog-of-war-system.js";
import { getVisibleGlyph } from "./world-system.js";

function hexToRgb(color) {
  return [0, 2, 4].map((offset) => Number.parseInt(color.slice(offset + 1, offset + 3), 16));
}

function rgbToHex([red, green, blue]) {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
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
