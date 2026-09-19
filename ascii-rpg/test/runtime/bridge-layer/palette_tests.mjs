import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PALETTE_ALPHA,
  DEFAULT_PALETTE_COLOR,
  createDefaultPalette,
  createPalette,
  getPaletteEntryId,
  filterPaletteEntries,
  isPaletteEntryCustomized,
  sortPaletteEntries,
  serializePalette,
  validatePaletteEntries,
} from "../../../src/runtime/bridge-layer/palette.js";

test("creates every visible Code Page 437 entry plus the bullet", () => {
  const palette = createDefaultPalette();
  const ids = new Set(palette.map(getPaletteEntryId));

  assert.equal(palette.length, 224);
  assert.equal(ids.size, 224);
  assert.ok(ids.has("32"));
  assert.ok(ids.has("254"));
  assert.ok(ids.has("U+2022"));
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
  assert.equal(serialized.version, 1);
  assert.equal(serialized.entries.length, 224);
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
  assert.equal(indexDescending[0].unicode, "U+2022");
  assert.equal(alphabetAscending[0].glyph, " ");
});
