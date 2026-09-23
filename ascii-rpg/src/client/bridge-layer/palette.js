export const DEFAULT_PALETTE_COLOR = "#ffffff";
export const DEFAULT_PALETTE_ALPHA = 1;
export const DEFAULT_GLYPH_OFFSET_X = 0;
export const DEFAULT_GLYPH_OFFSET_Y = 0;
export const DEFAULT_GLYPH_OFFSET_SCALE = 0;
export const PALETTE_STORAGE_KEY = "babylon-lite-ascii-rpg.palette";
export const PALETTE_WARNING_KEY = "babylon-lite-ascii-rpg.palette-warning-hidden";
export const PALETTE_VERSION = 3;

const BULLET_GLYPH = "•";
const BULLET_ID = "U+2022";
const LEGACY_PLAYER_GLYPH_ID = "U+1F93A";
const PLAYER_GLYPH_ID = "U+1F464";
const PLAYER_GLYPH = "👤";
const LEGACY_PALETTE_SIZE = 224;

const TEXT_SYMBOL_GLYPHS = [
  "↑", "↓", "←", "→", "↖", "↗", "↘", "↙", "↔", "↕", "⇧", "⇩", "↩", "↪",
  "♥", "♡", "♦", "♢", "♣", "♧", "♠", "♤",
  "◇", "◆", "▲", "▼", "△", "▽", "○", "●", "◉", "◎", "⊙", "⌖", "⌑", "☆", "★", "✦", "✧", "✶",
  "🪙", "💰", "🕯️", "🔥", "👤", "🕷️", "▤", "□", "▬", "▭", "▮", "▯", "⚿",
  "♪", "♫", "☼", "☀", "☾", "☽", "☁", "☂", "☃", "❄", "♨",
  "⚔", "⚒", "⚙", "⚑", "⚐", "⚠", "☠", "☘", "⚖", "⚗", "⚕", "✝", "☯", "☺",
];

function getUnicodeId(glyph) {
  return `U+${glyph.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
}

const supportedUnicodeIds = new Set([BULLET_ID, ...TEXT_SYMBOL_GLYPHS.map(getUnicodeId)]);

const GROUP_LETTER_EXCEPTIONS = {
  "Æ": "A",
  "æ": "a",
  "Ø": "O",
  "ø": "o",
  "ß": "s",
};

const PALETTE_GROUPS = [
  ["digits", "Digits"],
  ["letters", "Letters"],
  ["punctuation", "Punctuation"],
  ["single-line-borders", "Single-line Borders"],
  ["double-line-borders", "Double-line Borders"],
  ["mixed-line-borders", "Mixed-line Borders"],
  ["blocks-and-shading", "Blocks and Shading"],
  ["terrain", "Terrain"],
  ["greek-letters", "Greek Letters"],
  ["mathematical-symbols", "Mathematical Symbols"],
  ["arrows", "Arrows"],
  ["playing-cards", "Playing Cards"],
  ["maps", "Maps"],
  ["status", "Status"],
  ["weather", "Weather"],
  ["music", "Music"],
  ["gameplay", "Gameplay"],
  ["runes", "Runes"],
  ["dice", "Dice"],
  ["chess", "Chess"],
].map(([id, label], order) => Object.freeze({ id, label, order }));

const PALETTE_GROUP_BY_ID = new Map(PALETTE_GROUPS.map((group) => [group.id, group]));

const SINGLE_LINE_BORDER_GLYPHS = new Set(["│", "┤", "┐", "└", "┴", "┬", "├", "─", "┼", "┘", "┌"]);
const DOUBLE_LINE_BORDER_GLYPHS = new Set(["╣", "║", "╗", "╝", "╚", "╔", "╩", "╦", "╠", "═", "╬"]);
const MIXED_LINE_BORDER_GLYPHS = new Set(["╡", "╢", "╖", "╕", "╜", "╛", "╞", "╟", "╧", "╨", "╤", "╥", "╙", "╘", "╒", "╓", "╫", "╪"]);
const BLOCK_AND_SHADING_GLYPHS = new Set(["░", "▒", "▓", "█", "▄", "▌", "▐", "▀", "■", "□", "▬", "▭", "▮", "▯"]);
const TERRAIN_GLYPHS = new Set(["~", "┄", "┅", "┈", "┉", "╱", "╲", "╳", "▤", "▥", "▦", "▧", "▨"]);
const GREEK_LETTER_GLYPHS = new Set(["α", "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "φ", "ε"]);
const MATHEMATICAL_SYMBOL_GLYPHS = new Set(["∞", "∩", "≡", "±", "≥", "≤", "⌠", "⌡", "÷", "≈", "°", "∙", "·", "√", "ⁿ", "²"]);
const ARROW_GLYPHS = new Set(["↑", "↓", "←", "→", "↖", "↗", "↘", "↙", "↔", "↕", "⇧", "⇩", "↩", "↪"]);
const PLAYING_CARD_GLYPHS = new Set(["♥", "♡", "♦", "♢", "♣", "♧", "♠", "♤"]);
const MAP_GLYPHS = new Set(["◇", "◆", "▲", "▼", "△", "▽", "○", "●", "◉", "◎", "⊙", "⌖", "⌑", "☆", "★", "✦", "✧", "✶", "◈", "▣", "◐", "◑", "◒", "◓"]);
const STATUS_GLYPHS = new Set(["⊕", "⊖", "⊗", "⊘", "⊞", "⊟"]);
const WEATHER_GLYPHS = new Set(["☼", "☀", "☾", "☽", "☁", "☂", "☃", "❄", "♨"]);
const MUSIC_GLYPHS = new Set(["♪", "♫"]);
const GAMEPLAY_GLYPHS = new Set(["⚔", "⚒", "⚙", "⚑", "⚐", "⚠", "☠", "☘", "⚖", "⚗", "⚕", "✝", "☯", "⚿", "🔥", "☺"]);

const CP437_EXTENDED_GLYPHS = [
  "⌂", "Ç", "ü", "é", "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï", "î", "ì", "Ä",
  "Å", "É", "æ", "Æ", "ô", "ö", "ò", "û", "ù", "ÿ", "Ö", "Ü", "ø", "£", "Ø", "×",
  "ƒ", "á", "í", "ó", "ú", "ñ", "Ñ", "ª", "º", "¿", "⌐", "¬", "½", "¼", "¡", "«",
  "»", "░", "▒", "▓", "│", "┤", "╡", "╢", "╖", "╕", "╣", "║", "╗", "╝", "╜", "╛",
  "┐", "└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩", "╦", "╠", "═", "╬",
  "╧", "╨", "╤", "╥", "╙", "╘", "╒", "╓", "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐",
  "▀", "α", "ß", "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "∞", "φ", "ε",
  "∩", "≡", "±", "≥", "≤", "⌠", "⌡", "÷", "≈", "°", "∙", "·", "√", "ⁿ", "²", "■",
];

function createDefaultEntry({ code = null, unicode = null, glyph }) {
  return {
    code,
    unicode,
    glyph,
    color: DEFAULT_PALETTE_COLOR,
    alpha: DEFAULT_PALETTE_ALPHA,
    offsetX: DEFAULT_GLYPH_OFFSET_X,
    offsetY: DEFAULT_GLYPH_OFFSET_Y,
    offsetScale: DEFAULT_GLYPH_OFFSET_SCALE,
  };
}

export function getPaletteEntryId(entry) {
  return entry.code === null ? entry.unicode : String(entry.code);
}

export function createDefaultPalette() {
  const entries = [];
  for (let code = 32; code <= 126; code += 1) {
    entries.push(createDefaultEntry({ code, glyph: String.fromCharCode(code) }));
  }
  CP437_EXTENDED_GLYPHS.forEach((glyph, index) => {
    entries.push(createDefaultEntry({ code: index + 127, glyph }));
  });
  entries.push(createDefaultEntry({ unicode: BULLET_ID, glyph: BULLET_GLYPH }));
  for (const glyph of TEXT_SYMBOL_GLYPHS) {
    entries.push(createDefaultEntry({ unicode: getUnicodeId(glyph), glyph }));
  }
  return entries;
}

export function isPaletteEntryCustomized(entry) {
  return entry.color.toLowerCase() !== DEFAULT_PALETTE_COLOR
    || entry.offsetX !== DEFAULT_GLYPH_OFFSET_X
    || entry.offsetY !== DEFAULT_GLYPH_OFFSET_Y
    || entry.offsetScale !== DEFAULT_GLYPH_OFFSET_SCALE;
}

function isValidColor(color) {
  return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
}

function isValidIdentity(entry) {
  return (Number.isInteger(entry.code) && entry.code >= 32 && entry.code <= 254 && entry.unicode === null)
    || (entry.code === null && supportedUnicodeIds.has(entry.unicode));
}

export function getPaletteEntryOffsets(entry = {}) {
  return {
    offsetX: entry.offsetX ?? DEFAULT_GLYPH_OFFSET_X,
    offsetY: entry.offsetY ?? DEFAULT_GLYPH_OFFSET_Y,
    offsetScale: entry.offsetScale ?? DEFAULT_GLYPH_OFFSET_SCALE,
  };
}

function normalizePaletteEntry(entry) {
  return {
    ...entry,
    ...getPaletteEntryOffsets(entry),
  };
}

function migrateLegacyPlayerGlyph(entry) {
  if (entry?.unicode !== LEGACY_PLAYER_GLYPH_ID) return entry;
  return { ...entry, unicode: PLAYER_GLYPH_ID, glyph: PLAYER_GLYPH };
}

function isValidGlyphOffset(entry) {
  return Number.isInteger(entry.offsetX) && entry.offsetX >= -10 && entry.offsetX <= 10
    && Number.isInteger(entry.offsetY) && entry.offsetY >= -10 && entry.offsetY <= 10
    && Number.isInteger(entry.offsetScale) && entry.offsetScale >= -100 && entry.offsetScale <= 100;
}

function getGroupLetter(glyph) {
  const normalizedGlyph = GROUP_LETTER_EXCEPTIONS[glyph] ?? glyph;
  const normalized = normalizedGlyph.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^[A-Za-z]$/.test(normalized) ? normalized.toUpperCase() : null;
}

export function getPaletteGroup(entry) {
  const glyph = entry.glyph;
  if (/^[0-9]$/.test(glyph)) return "digits";
  if (getGroupLetter(glyph)) return "letters";
  if (SINGLE_LINE_BORDER_GLYPHS.has(glyph)) return "single-line-borders";
  if (DOUBLE_LINE_BORDER_GLYPHS.has(glyph)) return "double-line-borders";
  if (MIXED_LINE_BORDER_GLYPHS.has(glyph)) return "mixed-line-borders";
  if (BLOCK_AND_SHADING_GLYPHS.has(glyph)) return "blocks-and-shading";
  if (TERRAIN_GLYPHS.has(glyph)) return "terrain";
  if (GREEK_LETTER_GLYPHS.has(glyph)) return "greek-letters";
  if (MATHEMATICAL_SYMBOL_GLYPHS.has(glyph)) return "mathematical-symbols";
  if (ARROW_GLYPHS.has(glyph)) return "arrows";
  if (PLAYING_CARD_GLYPHS.has(glyph)) return "playing-cards";
  if (MAP_GLYPHS.has(glyph)) return "maps";
  if (STATUS_GLYPHS.has(glyph)) return "status";
  if (WEATHER_GLYPHS.has(glyph)) return "weather";
  if (MUSIC_GLYPHS.has(glyph)) return "music";
  if (GAMEPLAY_GLYPHS.has(glyph)) return "gameplay";
  const codePoint = glyph.codePointAt(0);
  if (codePoint >= 0x16A0 && codePoint <= 0x16B7) return "runes";
  if (codePoint >= 0x2680 && codePoint <= 0x2685) return "dice";
  if (codePoint >= 0x2654 && codePoint <= 0x265F) return "chess";
  return "punctuation";
}

export function getPaletteGroupLabel(entry) {
  return PALETTE_GROUP_BY_ID.get(getPaletteGroup(entry)).label;
}

function getGroupSortKey(entry) {
  const group = PALETTE_GROUP_BY_ID.get(getPaletteGroup(entry));
  const glyph = entry.glyph;
  if (/^[0-9]$/.test(glyph)) return [group.order, Number(glyph), 0, "", entry.code ?? Number.MAX_SAFE_INTEGER];

  const letter = getGroupLetter(glyph);
  if (letter) {
    const isUppercase = glyph === glyph.toUpperCase();
    const accentKey = GROUP_LETTER_EXCEPTIONS[glyph]
      ? `${isUppercase ? "Z" : "z"}${GROUP_LETTER_EXCEPTIONS[glyph]}`
      : glyph.normalize("NFD");
    return [group.order, letter, isUppercase ? 0 : 1, accentKey, entry.code ?? Number.MAX_SAFE_INTEGER];
  }

  return [group.order, glyph, 0, "", entry.code ?? Number.MAX_SAFE_INTEGER];
}

function compareGroupKeys(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return 0;
}

export function validatePaletteEntries(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError("Palette entries must be an array.");
  }

  const expected = createDefaultPalette();
  const expectedIds = new Set(expected.map(getPaletteEntryId));
  const seen = new Set();
  for (const entry of entries) {
    if (!entry || !isValidIdentity(entry) || typeof entry.glyph !== "string" || entry.glyph.length === 0) {
      throw new TypeError("Palette entries need a valid identity and one glyph.");
    }
    if (!expectedIds.has(getPaletteEntryId(entry)) || seen.has(getPaletteEntryId(entry))) {
      throw new TypeError("Palette entries must contain each supported identity exactly once.");
    }
    if (!isValidColor(entry.color) || !Number.isFinite(entry.alpha) || entry.alpha < 0 || entry.alpha > 1) {
      throw new TypeError("Palette entries need a six-digit color and alpha from 0 to 1.");
    }
    if (!isValidGlyphOffset(entry)) {
      throw new TypeError("Palette entries need integer glyph offsets: offsetX and offsetY from -10 to 10, offsetScale from -100 to 100.");
    }
    seen.add(getPaletteEntryId(entry));
  }
  if (seen.size !== expectedIds.size) {
    throw new TypeError("Palette entries are missing a supported identity.");
  }
  return entries;
}

export function createPalette(data = {}) {
  const defaults = createDefaultPalette();
  const entries = (data.entries ?? defaults).map(migrateLegacyPlayerGlyph);
  const palette = entries.map(normalizePaletteEntry);
  if (data.version === 1 && data.entries?.length === LEGACY_PALETTE_SIZE) {
    palette.push(...defaults.slice(LEGACY_PALETTE_SIZE));
  } else if (data.entries) {
    const existingIds = new Set(palette.map(getPaletteEntryId));
    for (const entry of defaults) {
      const id = getPaletteEntryId(entry);
      if (!existingIds.has(id)) palette.push({ ...entry });
    }
  }
  if (data.overrides) {
    for (const [id, override] of Object.entries(data.overrides)) {
      const entry = palette.find((candidate) => getPaletteEntryId(candidate) === id);
      if (!entry) {
        throw new TypeError(`Unknown palette identity: ${id}`);
      }
      Object.assign(entry, normalizePaletteEntry({ ...entry, ...override }));
    }
  }
  validatePaletteEntries(palette);
  return palette;
}

export function serializePalette(entries) {
  validatePaletteEntries(entries);
  return JSON.stringify({ version: PALETTE_VERSION, entries }, null, 2);
}

export function getPaletteStyle(entries, glyph) {
  return entries.find((entry) => entry.glyph === glyph) ?? createDefaultEntry({ glyph });
}

export function filterPaletteEntries(entries, filter, mapGlyphs) {
  if (filter === "in-maps") {
    return entries.filter((entry) => mapGlyphs.has(entry.glyph));
  }
  if (filter === "customized") {
    return entries.filter(isPaletteEntryCustomized);
  }
  return entries;
}

export function sortPaletteEntries(entries, sortBy, direction = "ascending") {
  const multiplier = direction === "descending" ? -1 : 1;
  return [...entries].sort((left, right) => {
    let comparison;
    if (sortBy === "group") {
      comparison = compareGroupKeys(getGroupSortKey(left), getGroupSortKey(right));
    } else if (sortBy === "alphabet") {
      comparison = left.glyph.localeCompare(right.glyph, undefined, { sensitivity: "base" });
    } else {
      const leftIndex = left.code ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = right.code ?? Number.MAX_SAFE_INTEGER;
      comparison = leftIndex - rightIndex;
      if (comparison === 0) comparison = left.unicode.localeCompare(right.unicode);
    }
    return comparison * multiplier;
  });
}
