import { getFacingGlyph, getGlyphOffsetsFromKey, rasterizeGlyph } from "./glyph-visual-cache.js";
import { getWallComposition, getWallMask } from "./underground-wall-autotile.js";
import { CLOSED_CHEST_GLYPH, ENEMY_SPAWNER_GLYPH, OPEN_CHEST_GLYPH } from "./systems/world-system.js";
import { FRONT_DOOR_CLOSED_ART, FRONT_DOOR_OPEN_ART, SIDE_DOOR_CLOSED_ART, SIDE_DOOR_OPEN_ART } from "./systems/civilization-system.js";

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
  return KEY_PREFIX + JSON.stringify(terrain.kind === "wall"
    ? [terrain.kind, overlay, getWallMask(world, cell)] : [terrain.kind, overlay]);
}

export function parseTerrainArtKey(key) {
  if (typeof key !== "string" || !key.startsWith(KEY_PREFIX)) return null;
  const [kind, overlay, mask] = JSON.parse(key.slice(KEY_PREFIX.length));
  return { frame: UNDERGROUND_TERRAIN_FRAMES[kind], overlay,
    ...(kind === "wall" && mask !== undefined ? { mask } : {}) };
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

export async function loadRasterImage(url, { width, height }) {
  const image = new Image();
  image.src = url;
  await image.decode();
  if (image.naturalWidth !== width || image.naturalHeight !== height) {
    throw new Error("Unexpected raster image dimensions.");
  }
  return image;
}

function getStaticPropImage(glyph, images) {
  switch (getFacingGlyph(glyph)) {
    case CLOSED_CHEST_GLYPH: return images.silverChestClosed ?? null;
    case OPEN_CHEST_GLYPH: return images.silverChestOpen ?? null;
    case FRONT_DOOR_CLOSED_ART: return images.frontDoorClosed ?? null;
    case FRONT_DOOR_OPEN_ART: return images.frontDoorOpen ?? null;
    case SIDE_DOOR_CLOSED_ART: return images.sideDoorClosed ?? null;
    case SIDE_DOOR_OPEN_ART: return images.sideDoorOpen ?? null;
    default: return null;
  }
}

// The open chest sheet is taller so its lid can rise above its cell. Keep that
// source aspect ratio through the game renderer rather than squeezing it into
// a square glyph raster.
export function getStaticPropArtAspectRatio(key) {
  const visual = parseTerrainArtKey(key);
  const glyph = visual?.overlay ?? key;
  return [OPEN_CHEST_GLYPH, FRONT_DOOR_CLOSED_ART, FRONT_DOOR_OPEN_ART].includes(getFacingGlyph(glyph)) ? 1.5 : 1;
}

export function rasterizeStaticPropArt(key, images, size) {
  const image = getStaticPropImage(key, images);
  if (!image) return null;
  const height = Math.round(size * getStaticPropArtAspectRatio(key));
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Static prop art needs a 2D canvas context.");
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, size, height);
  return { name: key, width: size, height, pixels: context.getImageData(0, 0, size, height).data };
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
  const propImage = getStaticPropImage(visual.overlay, images);
  const propHeight = propImage ? Math.round(size * getStaticPropArtAspectRatio(key)) : size;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = propHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Terrain art needs a 2D canvas context.");
  context.imageSmoothingEnabled = false;
  const { x, y, width, height } = visual.frame;
  const terrainTop = propHeight - size;
  context.drawImage(images[visual.frame.source], x, y, width, height, 0, terrainTop, size, size);
  if (visual.mask !== undefined) {
    for (const [sx, sy, sw, sh, dx, dy] of getWallComposition(visual.mask).slice(1)) {
      const left = Math.round(dx * size / 32), top = terrainTop + Math.round(dy * size / 32);
      const right = Math.round((dx + sw) * size / 32), bottom = Math.round((dy + sh) * size / 32);
      context.drawImage(images.wall, sx, sy, sw, sh, left, top, right - left, bottom - top);
    }
  }
  if (propImage) {
    context.drawImage(propImage, 0, 0, size, propHeight);
    return {
      name: key, width: size, height: propHeight, composite: true, terrainArt: true,
      pixels: context.getImageData(0, 0, size, propHeight).data,
    };
  }
  // Enemy spawners retain their simulation glyph for occupancy and combat, but
  // use the supplied dungeon prop in every terrain-backed renderer.
  if (getFacingGlyph(visual.overlay) === ENEMY_SPAWNER_GLYPH && images.cobweb1) {
    context.drawImage(images.cobweb1, 0, 0, size, size);
    return {
      name: key, width: size, height: size, composite: true, terrainArt: true,
      pixels: context.getImageData(0, 0, size, size).data,
    };
  }
  const overlay = visual.overlay === null ? null : rasterizeGlyph(
    visual.overlay, family, size, "#ffffff", getGlyphOffsetsFromKey(visual.overlay),
  );
  const color = paletteColors.get(getFacingGlyph(visual.overlay)) ?? [1, 1, 1];
  return {
    name: key, width: size, height: size, composite: true, terrainArt: true,
    pixels: compositeTerrainPixels(context.getImageData(0, 0, size, size).data, overlay, color),
  };
}
