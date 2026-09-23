import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  DEFAULT_PALETTE_ALPHA,
  DEFAULT_PALETTE_COLOR,
  DEFAULT_GLYPH_OFFSET_SCALE,
  DEFAULT_GLYPH_OFFSET_X,
  DEFAULT_GLYPH_OFFSET_Y,
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
} from "../../../src/client/bridge-layer/palette.js";

test("creates every visible Code Page 437 entry, the bullet, and civilization text symbols", () => {
  const palette = createDefaultPalette();
  const ids = new Set(palette.map(getPaletteEntryId));

  assert.equal(palette.length, 302);
  assert.equal(ids.size, 302);
  assert.equal(new Set(palette.map((entry) => entry.glyph)).size, 302);
  assert.ok(ids.has("32"));
  assert.ok(ids.has("254"));
  assert.ok(ids.has("U+2022"));
  for (const id of ["U+2191", "U+2665", "U+25C7", "U+266A", "U+2694", "U+1F464", "U+1F577", "U+25AC", "U+25AD", "U+25AE", "U+25AF", "U+26BF", "U+263A"]) {
    assert.ok(ids.has(id));
  }
});

test("migrates saved 224-entry palettes while preserving existing colors", () => {
  const legacyEntries = createDefaultPalette().slice(0, 224);
  legacyEntries.find((entry) => entry.glyph === "•").color = "#4c4c4c";

  const palette = createPalette({ version: 1, entries: legacyEntries });

  assert.equal(palette.length, 302);
  assert.equal(palette.find((entry) => entry.glyph === "•").color, "#4c4c4c");
  assert.equal(palette.find((entry) => entry.glyph === "•").offsetX, DEFAULT_GLYPH_OFFSET_X);
  assert.equal(palette.find((entry) => entry.glyph === "•").offsetY, DEFAULT_GLYPH_OFFSET_Y);
  assert.equal(palette.find((entry) => entry.glyph === "•").offsetScale, DEFAULT_GLYPH_OFFSET_SCALE);
  assert.equal(palette.find((entry) => entry.glyph === "↑").color, DEFAULT_PALETTE_COLOR);
});

test("backfills newly supported identities in an otherwise current palette", () => {
  const partialEntries = createDefaultPalette().filter((entry) => entry.glyph !== "💰");
  partialEntries.find((entry) => entry.glyph === "★").color = "#ffff00";

  const palette = createPalette({ version: PALETTE_VERSION, entries: partialEntries });

  assert.equal(palette.length, 302);
  assert.equal(palette.find((entry) => entry.glyph === "💰").color, DEFAULT_PALETTE_COLOR);
  assert.equal(palette.find((entry) => entry.glyph === "★").color, "#ffff00");
});

test("migrates saved player styling from the fencer glyph to the player glyph", () => {
  const legacyEntries = createDefaultPalette().map((entry) => (
    entry.glyph === "👤" ? { ...entry, unicode: "U+1F93A", glyph: "🤺", color: "#334455", offsetX: 3 } : entry
  ));

  const palette = createPalette({ version: PALETTE_VERSION, entries: legacyEntries });
  const player = palette.find((entry) => entry.glyph === "👤");

  assert.equal(player.unicode, "U+1F464");
  assert.equal(player.color, "#334455");
  assert.equal(player.offsetX, 3);
});

test("defaults entries to white, fully opaque, and zero offsets", () => {
  const entry = createDefaultPalette().find((candidate) => candidate.glyph === "W");
  assert.equal(entry.color, DEFAULT_PALETTE_COLOR);
  assert.equal(entry.alpha, DEFAULT_PALETTE_ALPHA);
  assert.equal(entry.offsetX, DEFAULT_GLYPH_OFFSET_X);
  assert.equal(entry.offsetY, DEFAULT_GLYPH_OFFSET_Y);
  assert.equal(entry.offsetScale, DEFAULT_GLYPH_OFFSET_SCALE);
  assert.equal(isPaletteEntryCustomized(entry), false);
});

test("applies a stored bullet override and derives customized status", () => {
  const palette = createPalette({ overrides: { "U+2022": { color: "#999999", alpha: 1, offsetX: 2, offsetY: -3, offsetScale: 25 } } });
  const bullet = palette.find((entry) => entry.unicode === "U+2022");
  assert.equal(bullet.color, "#999999");
  assert.equal(bullet.offsetX, 2);
  assert.equal(bullet.offsetY, -3);
  assert.equal(bullet.offsetScale, 25);
  assert.equal(isPaletteEntryCustomized(bullet), true);
});

test("rejects malformed palette entries", () => {
  const palette = createDefaultPalette();
  assert.throws(() => validatePaletteEntries(palette.slice(1)), /missing/);
  assert.throws(() => validatePaletteEntries(palette.map((entry) => ({ ...entry, alpha: 2 }))), /alpha/);
  assert.throws(() => validatePaletteEntries(palette.map((entry, index) => index === 0 ? { ...entry, color: "red" } : entry)), /color/);
  assert.throws(() => validatePaletteEntries(palette.map((entry, index) => index === 0 ? { ...entry, offsetX: 11 } : entry)), /offset/);
  assert.throws(() => validatePaletteEntries(palette.map((entry, index) => index === 0 ? { ...entry, offsetY: -11 } : entry)), /offset/);
  assert.throws(() => validatePaletteEntries(palette.map((entry, index) => index === 0 ? { ...entry, offsetScale: 101 } : entry)), /offset/);
  assert.throws(() => validatePaletteEntries(palette.map((entry, index) => index === 0 ? { ...entry, offsetScale: 1.5 } : entry)), /offset/);
});

test("serializes a complete validated palette", () => {
  const serialized = JSON.parse(serializePalette(createDefaultPalette()));
  assert.equal(serialized.version, PALETTE_VERSION);
  assert.equal(serialized.entries.length, 302);
  assert.equal(serialized.entries[0].offsetX, 0);
  assert.equal(serialized.entries[0].offsetY, 0);
  assert.equal(serialized.entries[0].offsetScale, 0);
});

test("filters the palette by map usage and customized styles", () => {
  const palette = createPalette({ overrides: {
    "U+2022": { color: "#999999", alpha: 1 },
    "U+1F464": { offsetX: 4, offsetY: 0, offsetScale: 0 },
  } });
  const inMaps = filterPaletteEntries(palette, "in-maps", new Set(["W", "•", "👤"]));
  const customized = filterPaletteEntries(palette, "customized", new Set());

  assert.deepEqual(inMaps.map((entry) => entry.glyph), ["W", "•", "👤"]);
  assert.deepEqual(customized.map((entry) => entry.glyph), ["•", "👤"]);
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
    "../../../src/client/game-layer-babylon-lite/data/palette_data.json",
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
    "../../../src/client/game-layer-babylon-lite/data/palette_data.json",
    import.meta.url,
  ), "utf8"));
  const palette = createPalette(data);
  const colors = new Map(palette.map((entry) => [entry.glyph, entry.color]));

  assert.equal(colors.get("•"), "#55aa55");
  assert.equal(colors.get("●"), "#8b5a2b");
});

test("ships a yellow gold glyph for shared HUD and world rendering", async () => {
  const data = JSON.parse(await readFile(new URL(
    "../../../src/client/game-layer-babylon-lite/data/palette_data.json",
    import.meta.url,
  ), "utf8"));
  const palette = createPalette(data);
  assert.equal(palette.find((entry) => entry.glyph === "💰").color, "#ffff00");
});
