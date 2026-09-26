import { getFacingGlyph, getGlyphOffsetsFromKey, rasterizeGlyph } from "./glyph-visual-cache.js";

// Project-local source sheets; Tiled IDs are zero-based and never map IDs.
export const UNDERGROUND_TERRAIN_SHEETS = Object.freeze({
  wall: Object.freeze({ width: 384, height: 288 }),
  dirt: Object.freeze({ width: 384, height: 288 }),
});
export const UNDERGROUND_TERRAIN_FRAMES = Object.freeze({
  wall: Object.freeze({ source: "wall", x: 224, y: 64, width: 32, height: 32 }),
  dirt: Object.freeze({ source: "dirt", x: 32, y: 32, width: 32, height: 32 }),
});
const KEY_PREFIX = "terrain-art:";

// Adjacent terrain tiles share exactly the same rounded edge. Glyph footprints
// deliberately overlap, but translucent full-cell art must not double-blend.
export function getTerrainArtBounds(cell, viewport, offset = { x: 0, y: 0 }) {
  const left = Math.round(offset.x + cell.x * viewport.gridWidth);
  const right = Math.round(offset.x + (cell.x + 1) * viewport.gridWidth);
  const top = Math.round(offset.y + cell.y * viewport.gridHeight);
  const bottom = Math.round(offset.y + (cell.y + 1) * viewport.gridHeight);
  return { center: { x: (left + right) / 2, y: (top + bottom) / 2 },
    size: { width: right - left, height: bottom - top } };
}

export function resolveUndergroundTerrainFrame(world, cell) {
  if ((world?.realm ?? world?.realmName) !== "Underground") return null;
  return UNDERGROUND_TERRAIN_FRAMES[world.terrain?.[cell.y]?.[cell.x]?.kind] ?? null;
}

export function getTerrainArtKey(world, cell, glyphKey) {
  if (!resolveUndergroundTerrainFrame(world, cell)) return glyphKey;
  const terrain = world.terrain[cell.y][cell.x];
  // Only the terrain's own glyph disappears. Facing and offsets on overlays
  // remain part of the cache identity, independent of world coordinates.
  const overlay = getFacingGlyph(glyphKey) === terrain.glyph ? null : glyphKey;
  return KEY_PREFIX + JSON.stringify([terrain.kind, overlay]);
}

export function parseTerrainArtKey(key) {
  if (typeof key !== "string" || !key.startsWith(KEY_PREFIX)) return null;
  const [kind, overlay] = JSON.parse(key.slice(KEY_PREFIX.length));
  return { frame: UNDERGROUND_TERRAIN_FRAMES[kind], overlay };
}

export async function loadUndergroundTerrainImage(url, source = "dirt") {
  const image = new Image();
  image.src = url;
  await image.decode();
  const expected = UNDERGROUND_TERRAIN_SHEETS[source];
  if (image.naturalWidth !== expected.width || image.naturalHeight !== expected.height) {
    throw new Error("Unexpected Underground terrain sheet dimensions.");
  }
  return image;
}

export function compositeTerrainPixels(terrainPixels, overlayRaster = null, color = [1, 1, 1]) {
  const pixels = new Uint8ClampedArray(terrainPixels);
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = overlayRaster ? overlayRaster.pixels[i + 3] / 255 : 0;
    for (let channel = 0; channel < 3; channel += 1) {
      pixels[i + channel] = Math.round(pixels[i + channel] * (1 - alpha)
        + (overlayRaster?.pixels[i + channel] ?? 0) * color[channel] * alpha);
    }
    pixels[i + 3] = 255;
  }
  return pixels;
}

export function rasterizeTerrainArt(key, images, family, size, paletteColors) {
  const visual = parseTerrainArtKey(key);
  if (!visual) return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Terrain art needs a 2D canvas context.");
  context.imageSmoothingEnabled = false;
  const { x, y, width, height } = visual.frame;
  context.drawImage(images[visual.frame.source], x, y, width, height, 0, 0, size, size);
  const overlay = visual.overlay === null ? null : rasterizeGlyph(
    visual.overlay, family, size, "#ffffff", getGlyphOffsetsFromKey(visual.overlay),
  );
  const color = paletteColors.get(getFacingGlyph(visual.overlay)) ?? [1, 1, 1];
  return {
    name: key, width: size, height: size, composite: true, terrainArt: true,
    pixels: compositeTerrainPixels(context.getImageData(0, 0, size, size).data, overlay, color),
  };
}
