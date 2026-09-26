import { appendSpriteAtlasFrames, createSpriteAtlasFromFrames, disposeSpriteAtlas } from "@babylonjs/lite";

const ATLAS_WIDTH = 1024;
import { getZoomScale } from "./zoom-scale.js";

const MAX_CACHED_ZOOMS = 10;
const FACING_KEY_SEPARATOR = "\u0000";
const DEFAULT_GLYPH_OFFSETS = Object.freeze({ offsetX: 0, offsetY: 0, offsetScale: 0 });

export const FACING_LEFT = "left";
export const FACING_RIGHT = "right";

export function getFacingGlyphKey(glyph, facing = FACING_LEFT) {
  return facing === FACING_RIGHT ? `${glyph}${FACING_KEY_SEPARATOR}${FACING_RIGHT}` : glyph;
}

export function getFacingGlyph(glyphKey) {
  return typeof glyphKey === "string" ? glyphKey.split(FACING_KEY_SEPARATOR)[0] : glyphKey;
}

export function getFacingGlyphDirection(glyphKey) {
  return typeof glyphKey === "string" && glyphKey.split(FACING_KEY_SEPARATOR).includes(FACING_RIGHT)
    ? FACING_RIGHT
    : FACING_LEFT;
}

export function getGlyphRasterSize(zoom, cellWidth = 32 * getZoomScale(zoom)) {
  // Keep a useful source footprint even when the displayed cell is only a few
  // pixels wide. The atlas is sampled linearly, so this preserves edge detail
  // while the GPU reduces the glyph to the actual cell size.
  return Math.max(64, Math.min(128, Math.round(cellWidth * 4)));
}

export function normalizeGlyphOffsets(offsets = DEFAULT_GLYPH_OFFSETS) {
  return {
    offsetX: Number.isInteger(offsets.offsetX) ? Math.min(20, Math.max(-20, offsets.offsetX)) : 0,
    offsetY: Number.isInteger(offsets.offsetY) ? Math.min(20, Math.max(-20, offsets.offsetY)) : 0,
    offsetScale: Number.isInteger(offsets.offsetScale) ? Math.min(100, Math.max(-100, offsets.offsetScale)) : 0,
  };
}

export function getGlyphOffsetKey(offsets = DEFAULT_GLYPH_OFFSETS) {
  const normalized = normalizeGlyphOffsets(offsets);
  return `${normalized.offsetX},${normalized.offsetY},${normalized.offsetScale}`;
}

export function getOffsetGlyphKey(glyph, offsets = DEFAULT_GLYPH_OFFSETS) {
  const key = getGlyphOffsetKey(offsets);
  return key === "0,0,0" ? glyph : `${glyph}${FACING_KEY_SEPARATOR}offset:${key}`;
}

export function getGlyphOffsetsFromKey(glyphKey) {
  if (typeof glyphKey !== "string") return DEFAULT_GLYPH_OFFSETS;
  const offsetPart = glyphKey.split(FACING_KEY_SEPARATOR).find((part) => part.startsWith("offset:"));
  if (!offsetPart) return DEFAULT_GLYPH_OFFSETS;
  const [offsetX, offsetY, offsetScale] = offsetPart.slice("offset:".length).split(",").map((value) => Number.parseInt(value, 10));
  return normalizeGlyphOffsets({ offsetX, offsetY, offsetScale });
}

export function getFacingGlyphOffsets(glyphKey, offsets = DEFAULT_GLYPH_OFFSETS) {
  const normalized = normalizeGlyphOffsets(offsets);
  return getFacingGlyphDirection(glyphKey) === FACING_RIGHT
    ? { ...normalized, offsetX: -normalized.offsetX }
    : normalized;
}

export function rasterizeGlyph(glyph, fontFamily, size, color = "#ffffff", offsets = DEFAULT_GLYPH_OFFSETS) {
  const displayGlyph = getFacingGlyph(glyph);
  const facing = getFacingGlyphDirection(glyph);
  const normalizedOffsets = getFacingGlyphOffsets(glyph, offsets);
  const scale = Math.max(0, 1 + normalizedOffsets.offsetScale / 100);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Glyph rasterization needs a 2D canvas context.");
  const paint = (target, targetSize) => {
    target.fillStyle = color;
    target.font = `${targetSize * scale}px ${fontFamily}`;
    target.textAlign = "center";
    target.textBaseline = "middle";
    const offsetScale = targetSize / size;
    const offsetX = normalizedOffsets.offsetX * offsetScale;
    const offsetY = normalizedOffsets.offsetY * offsetScale;
    if (facing === FACING_RIGHT) {
      target.translate(targetSize, 0);
      target.scale(-1, 1);
      target.fillText(displayGlyph, targetSize / 2 - offsetX, targetSize / 2 + offsetY);
    } else {
      target.fillText(displayGlyph, targetSize / 2 + offsetX, targetSize / 2 + offsetY);
    }
  };
  if (size <= 24) {
    const sourceSize = size * 2;
    const source = document.createElement("canvas");
    source.width = sourceSize;
    source.height = sourceSize;
    const sourceContext = source.getContext("2d");
    if (!sourceContext) throw new Error("Glyph rasterization needs a 2D canvas context.");
    paint(sourceContext, sourceSize);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, size, size);
  } else {
    paint(context, size);
  }
  return { pixels: context.getImageData(0, 0, size, size).data, width: size, height: size, name: glyph, offsets: normalizedOffsets };
}

export function rasterizeSolidGlyph(size, color = [255, 255, 255, 255]) {
  if (!Number.isInteger(size) || size < 1) throw new RangeError("Solid glyph size must be a positive integer.");
  if (!Array.isArray(color) || color.length !== 4 || color.some((channel) => !Number.isInteger(channel) || channel < 0 || channel > 255)) {
    throw new TypeError("Solid glyph color must be four byte channels.");
  }
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let index = 0; index < pixels.length; index += 4) pixels.set(color, index);
  return { pixels, width: size, height: size, name: "solid" };
}

// Props use their authored colors, unlike text glyphs which are tinted later
// by the renderer. Keep the source proportions so tall front doors do not
// become square when packed into a cell-sized atlas frame.
export function rasterizeImageGlyph(glyph, image, size) {
  if (!image?.naturalWidth || !image?.naturalHeight) throw new TypeError("Image glyph needs a decoded image.");
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Image glyph rasterization needs a 2D canvas context.");
  const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.imageSmoothingEnabled = false;
  context.drawImage(image, (size - width) / 2, size - height, width, height);
  return {
    pixels: context.getImageData(0, 0, size, size).data,
    width: size,
    height: size,
    name: glyph,
    composite: true,
  };
}

export function darkenGlyphColor(color, darkness = 50) {
  if (!Array.isArray(color) || color.length < 3 || color.some((channel) => !Number.isFinite(channel))) {
    throw new TypeError("Glyph color must contain finite RGB channels.");
  }
  if (!Number.isInteger(darkness) || darkness < 0 || darkness > 100) {
    throw new RangeError("Background darkness must be an integer from 0 through 100.");
  }
  const scale = 1 - darkness / 100;
  return [color[0] * scale, color[1] * scale, color[2] * scale];
}

export function tintGlyphRgb(rgb, color) {
  if ((!Array.isArray(rgb) && !ArrayBuffer.isView(rgb)) || rgb.length < 3 || rgb.some((channel) => !Number.isFinite(channel))) {
    throw new TypeError("Glyph RGB channels must be finite.");
  }
  if (!Array.isArray(color) || color.length < 3 || color.some((channel) => !Number.isFinite(channel) || channel < 0 || channel > 1)) {
    throw new TypeError("Glyph tint channels must be finite values from 0 through 1.");
  }
  return [
    Math.round(rgb[0] * color[0]),
    Math.round(rgb[1] * color[1]),
    Math.round(rgb[2] * color[2]),
  ];
}

export function rasterizeCompositeGlyph(glyph, fontFamily, size, color, darkness = 50, offsets = DEFAULT_GLYPH_OFFSETS) {
  const glyphRaster = rasterizeGlyph(glyph, fontFamily, size, "#ffffff", offsets);
  const background = darkenGlyphColor(color, darkness);
  const pixels = new Uint8ClampedArray(glyphRaster.pixels.length);
  for (let index = 0; index < glyphRaster.pixels.length; index += 4) {
    const glyphAlpha = glyphRaster.pixels[index + 3] / 255;
    const tinted = tintGlyphRgb(glyphRaster.pixels.slice(index, index + 3), color).map((channel) => channel / 255);
    pixels[index] = Math.round(((background[0] * (1 - glyphAlpha)) + (tinted[0] * glyphAlpha)) * 255);
    pixels[index + 1] = Math.round(((background[1] * (1 - glyphAlpha)) + (tinted[1] * glyphAlpha)) * 255);
    pixels[index + 2] = Math.round(((background[2] * (1 - glyphAlpha)) + (tinted[2] * glyphAlpha)) * 255);
    pixels[index + 3] = 255;
  }
  return { ...glyphRaster, pixels, composite: true };
}

// Canvas views and the sprite atlas both consume the same rasterized glyph.
// Keeping this conversion here prevents a destination renderer from inventing
// a second glyph-painting algorithm.
export function createGlyphRasterCanvas(raster, color = "#ffffff", { alphaScale = 1, colorScale = 1, tint = false } = {}) {
  if (!Number.isFinite(alphaScale) || alphaScale < 0 || alphaScale > 1) {
    throw new RangeError("Glyph alpha scale must be finite and between 0 and 1.");
  }
  if (!Number.isFinite(colorScale) || colorScale < 0 || colorScale > 1) {
    throw new RangeError("Glyph color scale must be finite and between 0 and 1.");
  }
  const glyphCanvas = document.createElement("canvas");
  glyphCanvas.width = raster.width;
  glyphCanvas.height = raster.height;
  const glyphContext = glyphCanvas.getContext("2d");
  if (!glyphContext) throw new Error("Glyph raster display needs a 2D canvas context.");
  const image = glyphContext.createImageData(raster.width, raster.height);
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  for (let index = 0; index < raster.pixels.length; index += 4) {
    image.data[index] = raster.composite
      ? Math.round(raster.pixels[index] * colorScale)
      : tint ? Math.round((raster.pixels[index] * red) / 255) : red;
    image.data[index + 1] = raster.composite
      ? Math.round(raster.pixels[index + 1] * colorScale)
      : tint ? Math.round((raster.pixels[index + 1] * green) / 255) : green;
    image.data[index + 2] = raster.composite
      ? Math.round(raster.pixels[index + 2] * colorScale)
      : tint ? Math.round((raster.pixels[index + 2] * blue) / 255) : blue;
    image.data[index + 3] = Math.round(raster.pixels[index + 3] * alphaScale);
  }
  glyphContext.putImageData(image, 0, 0);
  return glyphCanvas;
}

export function createGlyphVisualCache(engine, {
  fontId, fontFamily, glyphLimit = 7, rasterize = rasterizeGlyph,
  maxCachedZooms = MAX_CACHED_ZOOMS,
  atlasApi = { create: createSpriteAtlasFromFrames, append: appendSpriteAtlasFrames, dispose: disposeSpriteAtlas },
} = {}) {
  if (!Number.isInteger(maxCachedZooms) || maxCachedZooms < 1) throw new RangeError("maxCachedZooms must be positive.");
  if (!Number.isInteger(glyphLimit) || glyphLimit < 1) throw new RangeError("glyphLimit must be positive.");
  const zooms = new Map();
  const stats = { hits: 0, misses: 0, warmupMs: 0 };

  function entryFor(zoom, cellWidth) {
    let entry = zooms.get(zoom);
    if (entry) {
      zooms.delete(zoom);
      zooms.set(zoom, entry);
      return entry;
    }
    const size = getGlyphRasterSize(zoom, cellWidth);
    const perRow = Math.max(1, Math.floor((ATLAS_WIDTH + 1) / (size + 1)));
    const rows = Math.ceil(glyphLimit / perRow);
    const height = Math.max(1, rows * size + Math.max(0, rows - 1));
    const atlas = atlasApi.create(engine, [], {
      capacityPx: [ATLAS_WIDTH, height], maxWidthPx: ATLAS_WIDTH, sampling: "linear", paddingPx: 1,
    });
    entry = { atlas, frames: new Map(), rasters: new Map(), size, bytes: ATLAS_WIDTH * height * 4 };
    zooms.set(zoom, entry);
    // The UI supports ten integer zooms. Diagnostic values use their own bounded
    // temporary entry; the least recently visited atlas is disposed if needed.
    if (zooms.size > maxCachedZooms) {
      const [oldZoom, oldEntry] = zooms.entries().next().value;
      if (oldZoom !== zoom) {
        zooms.delete(oldZoom);
        atlasApi.dispose(oldEntry.atlas);
      }
    }
    return entry;
  }

  function ensure(zoom, cellWidth, glyphs) {
    const started = performance.now();
    const missesBefore = stats.misses;
    const entry = entryFor(zoom, cellWidth);
    for (const glyph of new Set(glyphs)) {
      if (entry.frames.has(glyph)) {
        stats.hits += 1;
        continue;
      }
      if (entry.frames.size >= glyphLimit) throw new RangeError("The glyph atlas has no reserved space for another glyph.");
      const raster = rasterize(glyph, fontFamily, entry.size);
      const [frame] = atlasApi.append(engine, entry.atlas, [raster]);
      entry.frames.set(glyph, frame);
      entry.rasters.set(glyph, raster);
      stats.misses += 1;
    }
    const elapsed = performance.now() - started;
    const warmupMs = stats.misses > missesBefore ? elapsed : 0;
    stats.warmupMs += warmupMs;
    return { atlas: entry.atlas, frames: entry.frames, rasters: entry.rasters, warmupMs };
  }

  function snapshot() {
    return {
      fontId,
      zooms: zooms.size,
      glyphs: [...zooms.values()].reduce((sum, entry) => sum + entry.frames.size, 0),
      atlasBytes: [...zooms.values()].reduce((sum, entry) => sum + entry.bytes, 0),
      ...stats,
    };
  }

  function dispose() {
    for (const entry of zooms.values()) atlasApi.dispose(entry.atlas);
    zooms.clear();
  }

  return { ensure, snapshot, dispose };
}
