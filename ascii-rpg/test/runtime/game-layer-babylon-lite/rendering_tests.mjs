import assert from "node:assert/strict";
import test from "node:test";
import { createGlyphVisualCache, getGlyphRasterSize } from "../../../src/runtime/game-layer-babylon-lite/glyph-visual-cache.js";
import { collectVisibleGlyphs, getVisibleRegion, getVisibleSlot, shouldUpdateVisibleSprite } from "../../../src/runtime/game-layer-babylon-lite/visible-region.js";
import { createFrameCheckpoint } from "../../../src/runtime/game-layer-babylon-lite/systems/world-system.js";
import { reconcilePaletteColors } from "../../../src/runtime/game-layer-babylon-lite/palette-color-cache.js";

function fakeAtlasApi() {
  const disposed = [];
  let nextAtlas = 0;
  return {
    disposed,
    create: (_engine, _frames, options) => ({ id: nextAtlas++, options, frames: [] }),
    append: (_engine, atlas, frames) => frames.map((frame) => {
      atlas.frames.push(frame);
      return atlas.frames.length - 1;
    }),
    dispose: (atlas) => disposed.push(atlas.id),
  };
}

test("glyph visuals are lazy, reusable by zoom and font, tint-independent, and bounded", () => {
  const api = fakeAtlasApi();
  const rasterized = [];
  const rasterize = (glyph, font, size) => {
    rasterized.push({ glyph, font, size });
    return { glyph, width: size, height: size };
  };
  const cache = createGlyphVisualCache({}, {
    fontId: "first", fontFamily: "First Font", glyphLimit: 2, maxCachedZooms: 2,
    rasterize, atlasApi: api,
  });
  assert.equal(cache.snapshot().glyphs, 0);
  const zoomOne = cache.ensure(1, 6.4, ["•", "W"]);
  assert.equal(zoomOne.frames.size, 2);
  const zoomOneAgain = cache.ensure(1, 6.4, ["•", "W"]);
  assert.equal(zoomOneAgain.atlas, zoomOne.atlas);
  assert.equal(zoomOneAgain.warmupMs, 0);
  assert.equal(cache.snapshot().misses, 2);
  assert.equal(cache.snapshot().hits, 2);
  cache.ensure(5, 32, ["W"]);
  cache.ensure(1, 6.4, ["W"]); // Make zoom 1 most recently used.
  cache.ensure(10, 64, ["W"]);
  assert.deepEqual(api.disposed, [1]); // Zoom 5 was evicted, not zoom 1.
  assert.equal(cache.snapshot().zooms, 2);
  assert.equal(cache.snapshot().glyphs, 3);
  assert.deepEqual(rasterized.map((entry) => entry.size), [13, 13, 64, 128]);
  cache.dispose();
  assert.deepEqual(api.disposed.sort(), [0, 1, 2]);

  const secondApi = fakeAtlasApi();
  const otherFont = createGlyphVisualCache({}, {
    fontId: "second", fontFamily: "Other Font", glyphLimit: 2, rasterize, atlasApi: secondApi,
  });
  otherFont.ensure(1, 6.4, ["W"]);
  assert.equal(rasterized.at(-1).font, "Other Font");
  assert.equal(otherFont.snapshot().fontId, "second");
  otherFont.dispose();
});

test("raster footprints are scaled for distant and close zooms", () => {
  assert.equal(getGlyphRasterSize(1, 6.4), 13);
  assert.equal(getGlyphRasterSize(5, 32), 64);
  assert.equal(getGlyphRasterSize(10, 64), 128);
});

test("visible-region collection and slot resolution never touch off-screen cells", () => {
  const world = { rows: 512, columns: 512 };
  const viewport = { rows: 1000, columns: 1000 }; // Diagnostic zoom below the normal minimum.
  const all = getVisibleRegion(viewport, world, { x: 999, y: -1 });
  assert.deepEqual(all, { x: 0, y: 0, rows: 512, columns: 512, count: 512 * 512 });
  const small = getVisibleRegion({ rows: 12, columns: 20 }, world, { x: 500, y: 500 });
  assert.deepEqual(small, { x: 492, y: 500, rows: 12, columns: 20, count: 240 });
  let visits = 0;
  const glyphs = collectVisibleGlyphs(world, small, (_world, cell) => {
    assert.ok(cell.x >= small.x && cell.x < small.x + small.columns);
    assert.ok(cell.y >= small.y && cell.y < small.y + small.rows);
    visits += 1;
    return cell.x % 2 ? "W" : "•";
  });
  assert.equal(visits, 240);
  assert.deepEqual([...glyphs], ["•", "W"]);
  assert.equal(getVisibleSlot(small, { x: 492, y: 500 }), 0);
  assert.equal(getVisibleSlot(small, { x: 511, y: 511 }), 239);
  assert.equal(getVisibleSlot(small, { x: 491, y: 500 }), -1);
  assert.equal(getVisibleSlot(small, { x: 492, y: 512 }), -1);
});

test("frame checkpoint can yield and reject stale cancelled work", async () => {
  const controller = new AbortController();
  let yields = 0;
  const checkpoint = createFrameCheckpoint({
    signal: controller.signal,
    sliceMs: 0,
    yieldToFrame: async () => { yields += 1; },
  });
  await checkpoint();
  assert.equal(yields, 1);
  controller.abort();
  assert.throws(() => checkpoint(), { name: "AbortError" });
});

test("dirty sprites update only for changed visible glyph, frame, tint, or visibility", () => {
  const color = [1, 1, 1, 1];
  const state = { glyph: "W", frame: 3, color, visible: true };
  assert.equal(shouldUpdateVisibleSprite(state, "W", 3, color), false);
  assert.equal(shouldUpdateVisibleSprite(state, "•", 3, color), true);
  assert.equal(shouldUpdateVisibleSprite(state, "W", 4, color), true);
  assert.equal(shouldUpdateVisibleSprite(state, "W", 3, [1, 1, 1, 0.5]), true);
  assert.equal(shouldUpdateVisibleSprite({ ...state, visible: false }, "W", 3, color), true);
});

test("palette revisions reuse unchanged tint data without multiplying shape-cache entries", () => {
  const original = reconcilePaletteColors(null, [
    { glyph: "W", color: "#ffffff", alpha: 1 },
    { glyph: "•", color: "#008800", alpha: 1 },
  ]);
  const revision = reconcilePaletteColors(original.colors, [
    { glyph: "W", color: "#ffffff", alpha: 1 },
    { glyph: "•", color: "#008800", alpha: 0.5 },
  ]);
  assert.deepEqual([...revision.changed], ["•"]);
  assert.equal(revision.colors.get("W"), original.colors.get("W"));
  assert.notEqual(revision.colors.get("•"), original.colors.get("•"));
  assert.equal(revision.colors.get("•")[3], 0.5);
});

test("diagnostic half-zoom stays world-bounded and cache cost tracks glyphs rather than world cells", () => {
  const api = fakeAtlasApi();
  const glyphs = ["W", "•", "P", "T", "~", "≈", "▓"];
  const cache = createGlyphVisualCache({}, {
    fontId: "diagnostic", fontFamily: "monospace", glyphLimit: 7,
    atlasApi: api, rasterize: (glyph, _font, size) => ({ glyph, width: size, height: size }),
  });
  const world = { rows: 512, columns: 512 };
  const counts = [];
  for (const zoom of [0.5, 1, 5, 10]) {
    const cellWidth = 32 * zoom / 5;
    const viewport = { columns: Math.floor(1138 / cellWidth), rows: Math.floor(590 / cellWidth) };
    const region = getVisibleRegion(viewport, world, { x: 250, y: 250 });
    counts.push(region.count);
    assert.ok(region.count <= 512 * 512);
    assert.equal(region.count, region.rows * region.columns);
    cache.ensure(zoom, cellWidth, glyphs);
  }
  assert.deepEqual(counts, [65320, 16284, 630, 153]);
  assert.equal(cache.snapshot().glyphs, 7 * 4);
  assert.equal(cache.snapshot().zooms, 4);
  assert.equal(cache.snapshot().atlasBytes, 888832);
  const color = [1, 1, 1, 1];
  const states = new Array(counts[0]);
  let submitted = 0;
  let skipped = 0;
  for (let pass = 0; pass < 2; pass += 1) {
    for (let slot = 0; slot < states.length; slot += 1) {
      if (shouldUpdateVisibleSprite(states[slot], "W", 0, color)) {
        states[slot] = { glyph: "W", frame: 0, color, visible: true };
        submitted += 1;
      } else skipped += 1;
    }
  }
  assert.equal(submitted, 65320);
  assert.equal(skipped, 65320);
  assert.equal(shouldUpdateVisibleSprite(states[0], "P", 1, color), true);
  cache.dispose();
});
