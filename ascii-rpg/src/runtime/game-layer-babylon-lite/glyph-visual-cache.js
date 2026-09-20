import { appendSpriteAtlasFrames, createSpriteAtlasFromFrames, disposeSpriteAtlas } from "@babylonjs/lite";

const ATLAS_WIDTH = 1024;
const MAX_CACHED_ZOOMS = 10;

export function getGlyphRasterSize(zoom, cellWidth = 32 * zoom / 5) {
  // A roughly two-to-one texture footprint avoids severe GPU minification;
  // the larger temporary source below supplies area-filtered curved edges.
  return Math.max(12, Math.min(128, Math.round(cellWidth * 2)));
}

export function rasterizeGlyph(glyph, fontFamily, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Glyph rasterization needs a 2D canvas context.");
  const paint = (target, targetSize) => {
    target.fillStyle = "#ffffff";
    target.font = `${targetSize}px ${fontFamily}`;
    target.textAlign = "center";
    target.textBaseline = "middle";
    target.fillText(glyph, targetSize / 2, targetSize / 2);
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
  return { pixels: context.getImageData(0, 0, size, size).data, width: size, height: size, name: glyph };
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
