import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  DEFAULT_PALETTE_ALPHA,
  DEFAULT_PALETTE_COLOR,
  PALETTE_VERSION,
  createDefaultPalette,
  createPalette,
  getPaletteGroup,
  getPaletteGroupLabel,
  getPaletteEntryId,
  filterPaletteEntries,
  isPaletteEntryCustomized,
  sortPaletteEntries,
  serializePalette,
  validatePaletteEntries,
} from "../../../src/runtime/bridge-layer/palette.js";

test("creates every visible Code Page 437 entry, the bullet, and 64 text symbols", () => {
  const palette = createDefaultPalette();
  const ids = new Set(palette.map(getPaletteEntryId));

  assert.equal(palette.length, 289);
  assert.equal(ids.size, 289);
  assert.equal(new Set(palette.map((entry) => entry.glyph)).size, 289);
  assert.ok(ids.has("32"));
  assert.ok(ids.has("254"));
  assert.ok(ids.has("U+2022"));
  for (const id of ["U+2191", "U+2665", "U+25C7", "U+266A", "U+2694"]) {
    assert.ok(ids.has(id));
  }
});

test("migrates saved 224-entry palettes while preserving existing colors", () => {
  const legacyEntries = createDefaultPalette().slice(0, 224);
  legacyEntries.find((entry) => entry.glyph === "•").color = "#4c4c4c";

  const palette = createPalette({ version: 1, entries: legacyEntries });

  assert.equal(palette.length, 289);
  assert.equal(palette.find((entry) => entry.glyph === "•").color, "#4c4c4c");
  assert.equal(palette.find((entry) => entry.glyph === "↑").color, DEFAULT_PALETTE_COLOR);
});

test("defaults entries to white and fully opaque", () => {
  const entry = createDefaultPalette().find((candidate) => candidate.glyph === "W");
  assert.equal(entry.color, DEFAULT_PALETTE_COLOR);
  assert.equal(entry.alpha, DEFAULT_PALETTE_ALPHA);
  assert.equal(isPaletteEntryCustomized(entry), false);
});

test("applies a stored bullet override and derives customized status", () => {
  const palette = createPalette({ overrides: { "U+2022": { color: "#999999", alpha: 1 } } });
  const bullet = palette.find((entry) => entry.unicode === "U+2022");
  assert.equal(bullet.color, "#999999");
  assert.equal(isPaletteEntryCustomized(bullet), true);
});

test("rejects malformed palette entries", () => {
  const palette = createDefaultPalette();
  assert.throws(() => validatePaletteEntries(palette.slice(1)), /missing/);
  assert.throws(() => validatePaletteEntries(palette.map((entry) => ({ ...entry, alpha: 2 }))), /alpha/);
  assert.throws(() => validatePaletteEntries(palette.map((entry, index) => index === 0 ? { ...entry, color: "red" } : entry)), /color/);
});

test("serializes a complete validated palette", () => {
  const serialized = JSON.parse(serializePalette(createDefaultPalette()));
  assert.equal(serialized.version, PALETTE_VERSION);
  assert.equal(serialized.entries.length, 289);
});

test("filters the palette by map usage and customized styles", () => {
  const palette = createPalette({ overrides: { "U+2022": { color: "#999999", alpha: 1 } } });
  const inMaps = filterPaletteEntries(palette, "in-maps", new Set(["W", "•", "P"]));
  const customized = filterPaletteEntries(palette, "customized", new Set());

  assert.deepEqual(inMaps.map((entry) => entry.glyph), ["P", "W", "•"]);
  assert.deepEqual(customized.map((entry) => entry.glyph), ["•"]);
});

test("toggles index and alphabet palette ordering", () => {
  const palette = createPalette();
  const indexAscending = sortPaletteEntries(palette, "index", "ascending");
  const indexDescending = sortPaletteEntries(palette, "index", "descending");
  const alphabetAscending = sortPaletteEntries(palette, "alphabet", "ascending");

  assert.equal(indexAscending[0].code, 32);
  assert.ok(indexDescending[0].unicode);
  assert.equal(alphabetAscending[0].glyph, " ");
});

test("groups the palette into ordered semantic families", () => {
  const palette = createPalette();
  const grouped = sortPaletteEntries(palette, "group", "ascending").map((entry) => entry.glyph);
  const digits = grouped.slice(0, 10);

  assert.deepEqual(digits, ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  assert.ok(grouped.indexOf("A") < grouped.indexOf("│"));
  assert.ok(grouped.indexOf("│") < grouped.indexOf("╣"));
  assert.ok(grouped.indexOf("╣") < grouped.indexOf("╡"));
  assert.ok(grouped.indexOf("╡") < grouped.indexOf("░"));
  assert.ok(grouped.indexOf("░") < grouped.indexOf("α"));
  assert.ok(grouped.indexOf("α") < grouped.indexOf("↑"));
  assert.ok(grouped.indexOf("↑") < grouped.indexOf("♥"));
});

test("classifies agreed special-symbol families without changing inventory", () => {
  const entry = (glyph) => ({ glyph });

  assert.equal(getPaletteGroup(entry("┄")), "terrain");
  assert.equal(getPaletteGroup(entry("╱")), "terrain");
  assert.equal(getPaletteGroup(entry("◈")), "maps");
  assert.equal(getPaletteGroup(entry("◒")), "maps");
  assert.equal(getPaletteGroup(entry("⊗")), "status");
  assert.equal(getPaletteGroup(entry("⊟")), "status");
  assert.equal(getPaletteGroup(entry("ᚠ")), "runes");
  assert.equal(getPaletteGroup(entry("⚄")), "dice");
  assert.equal(getPaletteGroup(entry("♛")), "chess");
  assert.equal(getPaletteGroupLabel(entry("◈")), "Maps");
  assert.equal(getPaletteGroupLabel(entry("⊕")), "Status");
});

test("ships blue defaults for the distinct water glyphs", async () => {
  const data = JSON.parse(await readFile(new URL(
    "../../../src/runtime/game-layer-babylon-lite/data/palette_data.json",
    import.meta.url,
  ), "utf8"));
  const palette = createPalette(data);
  const colors = new Map(palette.map((entry) => [entry.glyph, entry.color]));

  assert.equal(colors.get("~"), "#62c7ff");
  assert.equal(colors.get("≈"), "#247fc3");
  assert.deepEqual(
    filterPaletteEntries(palette, "in-maps", new Set(["~", "≈"])).map((entry) => entry.glyph),
    ["~", "≈"],
  );
});

test("ships distinct green and brown defaults for overground and underground floor glyphs", async () => {
  const data = JSON.parse(await readFile(new URL(
    "../../../src/runtime/game-layer-babylon-lite/data/palette_data.json",
    import.meta.url,
  ), "utf8"));
  const palette = createPalette(data);
  const colors = new Map(palette.map((entry) => [entry.glyph, entry.color]));

  assert.equal(colors.get("•"), "#55aa55");
  assert.equal(colors.get("●"), "#8b5a2b");
});

test("ships a yellow gold glyph for shared HUD and world rendering", async () => {
  const data = JSON.parse(await readFile(new URL(
    "../../../src/runtime/game-layer-babylon-lite/data/palette_data.json",
    import.meta.url,
  ), "utf8"));
  const palette = createPalette(data);
  assert.equal(palette.find((entry) => entry.glyph === "◆").color, "#ffff00");
});
