import assert from "node:assert/strict";
import test from "node:test";
import { createGlyphVisualCache, darkenGlyphColor, FACING_RIGHT, getFacingGlyphKey, getFacingGlyphOffsets, getGlyphOffsetKey, getGlyphOffsetsFromKey, getGlyphRasterSize, getOffsetGlyphKey, rasterizeSolidGlyph, tintGlyphRgb } from "../../../src/client/game-layer-babylon-lite/glyph-visual-cache.js";
import { collectVisibleGlyphs, getVisibleRegion, getVisibleSlot, shouldUpdateVisibleSprite } from "../../../src/client/game-layer-babylon-lite/visible-region.js";
import { createFrameCheckpoint, getVisibleGlyph } from "../../../src/client/game-layer-babylon-lite/systems/world-system.js";
import { colorToLinearRgba, linearRgbaToHex, linearRgbaToRendererHex, reconcilePaletteColors } from "../../../src/client/game-layer-babylon-lite/palette-color-cache.js";
import { applyLightingToColor, createSceneLightingFieldCache, LIGHTING_PRESETS } from "../../../src/client/game-layer-babylon-lite/lighting.js";

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
  assert.deepEqual(rasterized.map((entry) => entry.size), [64, 64, 128, 128]);
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
  assert.equal(getGlyphRasterSize(1, 6.4), 64);
  assert.equal(getGlyphRasterSize(5, 32), 128);
  assert.equal(getGlyphRasterSize(10, 64), 128);
});

test("glyph offset keys are stable and reusable for visual cache identity", () => {
  assert.equal(getGlyphOffsetKey({ offsetX: 0, offsetY: 0, offsetScale: 0 }), "0,0,0");
  assert.equal(getOffsetGlyphKey("🤺", { offsetX: 0, offsetY: 0, offsetScale: 0 }), "🤺");
  const key = getOffsetGlyphKey("🤺", { offsetX: 4, offsetY: -3, offsetScale: 25 });
  assert.notEqual(key, "🤺");
  assert.deepEqual(getGlyphOffsetsFromKey(key), { offsetX: 4, offsetY: -3, offsetScale: 25 });
  assert.deepEqual(getGlyphOffsetsFromKey(getOffsetGlyphKey("🤺", { offsetX: 40, offsetY: -40, offsetScale: 200 })), {
    offsetX: 10,
    offsetY: -10,
    offsetScale: 100,
  });
});

test("right-facing glyphs mirror their x offset with the artwork", () => {
  const offsets = { offsetX: 4, offsetY: -3, offsetScale: 25 };
  assert.deepEqual(getFacingGlyphOffsets("🤺", offsets), offsets);
  assert.deepEqual(getFacingGlyphOffsets(getFacingGlyphKey("🤺", FACING_RIGHT), offsets), {
    offsetX: -4,
    offsetY: -3,
    offsetScale: 25,
  });
});

test("glyph background darkness moves palette colors toward black", () => {
  assert.deepEqual(darkenGlyphColor([1, 0.5, 0.2], 0), [1, 0.5, 0.2]);
  assert.deepEqual(darkenGlyphColor([1, 0.5, 0.2], 50), [0.5, 0.25, 0.1]);
  assert.deepEqual(darkenGlyphColor([1, 0.5, 0.2], 100), [0, 0, 0]);
  assert.throws(() => darkenGlyphColor([1, 0.5, 0.2], 101), /0 through 100/);
});

test("solid fog backing is fully opaque and independent of glyph artwork", () => {
  const raster = rasterizeSolidGlyph(2, [12, 12, 12, 255]);
  assert.deepEqual([...raster.pixels], Array(4).fill([12, 12, 12, 255]).flat());
  assert.throws(() => rasterizeSolidGlyph(0), /positive integer/);
});

test("glyph tinting preserves source artwork while applying palette color", () => {
  assert.deepEqual(tintGlyphRgb([255, 128, 64], [1, 1, 1]), [255, 128, 64]);
  assert.deepEqual(tintGlyphRgb([255, 128, 64], [0.5, 1, 0.25]), [128, 128, 16]);
});

test("minimap base colors use the same transient lighting modulation as the game view", () => {
  const baseColor = colorToLinearRgba({ color: "#808040", alpha: 1 });
  const ambientColor = linearRgbaToHex(applyLightingToColor(baseColor, 0.25));
  const litColor = linearRgbaToHex(applyLightingToColor(baseColor, 1));

  assert.notEqual(ambientColor, "#808040");
  assert.equal(litColor, "#808040");
  assert.deepEqual(baseColor, colorToLinearRgba({ color: "#808040", alpha: 1 }));
});

test("minimap renderer colors preserve the game renderer's raw linear channels", () => {
  const baseColor = colorToLinearRgba({ color: "#808040", alpha: 1 });
  const litColor = applyLightingToColor(baseColor, 0.25);
  assert.equal(linearRgbaToRendererHex(litColor), "#0e0e03");
  assert.notEqual(linearRgbaToHex(litColor), linearRgbaToRendererHex(litColor));
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
  const state = { glyph: "W", frame: 3, color, baseColor: color, lightingFactor: 1, fogVisibility: 100, visible: true };
  assert.equal(shouldUpdateVisibleSprite(state, "W", 3, color, 1), false);
  assert.equal(shouldUpdateVisibleSprite(state, "W", 3, color, 1, 75), true);
  assert.equal(shouldUpdateVisibleSprite(state, "•", 3, color, 1), true);
  assert.equal(shouldUpdateVisibleSprite(state, "W", 4, color, 1), true);
  assert.equal(shouldUpdateVisibleSprite(state, "W", 3, [1, 1, 1, 0.5], 1), true);
  assert.equal(shouldUpdateVisibleSprite(state, "W", 3, color, 0.5), true);
  assert.equal(shouldUpdateVisibleSprite({ ...state, visible: false }, "W", 3, color, 1), true);
});

test("visible light refresh clears old player light and glyph changes keep terrain intact", () => {
  const terrain = Array.from({ length: 5 }, () =>
    Array.from({ length: 7 }, () => ({ walkable: true, glyph: "•" })));
  terrain[2][3] = { walkable: false, glyph: "W" };
  const characters = Array.from({ length: 5 }, () => Array(7).fill(null));
  const world = { terrain, characters };
  const terrainSnapshot = JSON.stringify(terrain);
  const region = { x: 0, y: 0, columns: 7, rows: 5 };
  const torches = [{ x: 1, y: 2 }];
  const settings = {
    ambient: 0,
    torchProfile: LIGHTING_PRESETS[3].config,
    playerProfile: LIGHTING_PRESETS[3].config,
  };
  const cache = createSceneLightingFieldCache();
  const oldField = cache.get(world, region, torches, { x: 5, y: 2 }, settings);
  const shadowed = { x: 4, y: 2 };
  const oldShadowedFactor = oldField.getFactor(shadowed);
  const nextField = cache.get(world, region, torches, { x: 2, y: 2 }, settings);
  assert.ok(oldShadowedFactor > 0);
  assert.equal(nextField.getFactor(shadowed), 0);
  assert.ok(nextField.getFactor({ x: 3, y: 2 }) > 0);

  const baseColor = [0.8, 0.6, 0.2, 1];
  const previous = {
    glyph: "•", frame: 0, baseColor, lightingFactor: oldShadowedFactor, visible: true,
  };
  assert.equal(shouldUpdateVisibleSprite(previous, "•", 0, baseColor, nextField.getFactor(shadowed)), true);
  const changedCell = { x: 2, y: 1 };
  const factor = nextField.getFactor(changedCell);
  characters[1][2] = "T";
  assert.equal(getVisibleGlyph(world, changedCell), "T");
  assert.equal(shouldUpdateVisibleSprite({ ...previous, lightingFactor: factor }, "T", 0, baseColor, factor), true);
  applyLightingToColor(baseColor, factor);
  assert.deepEqual(baseColor, [0.8, 0.6, 0.2, 1]);
  assert.equal(JSON.stringify(terrain), terrainSnapshot);
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
  assert.deepEqual([...revision.changed], []);
  assert.equal(revision.colors.get("W"), original.colors.get("W"));
  assert.equal(revision.colors.get("•"), original.colors.get("•"));
  assert.equal(revision.colors.get("•")[3], 1);
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
  assert.equal(cache.snapshot().atlasBytes, 1572864);
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
