export const DEFAULT_PALETTE_COLOR = "#ffffff";
export const DEFAULT_PALETTE_ALPHA = 1;
export const PALETTE_STORAGE_KEY = "babylon-lite-ascii-rpg.palette";
export const PALETTE_WARNING_KEY = "babylon-lite-ascii-rpg.palette-warning-hidden";

const BULLET_GLYPH = "•";
const BULLET_ID = "U+2022";

const GROUP_LETTER_EXCEPTIONS = {
  "Æ": "A",
  "æ": "a",
  "Ø": "O",
  "ø": "o",
  "ß": "s",
};

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
  return entries;
}

export function isPaletteEntryCustomized(entry) {
  return entry.color.toLowerCase() !== DEFAULT_PALETTE_COLOR;
}

function isValidColor(color) {
  return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
}

function isValidIdentity(entry) {
  return (Number.isInteger(entry.code) && entry.code >= 32 && entry.code <= 254 && entry.unicode === null)
    || (entry.code === null && entry.unicode === BULLET_ID);
}

function getGroupLetter(glyph) {
  const normalizedGlyph = GROUP_LETTER_EXCEPTIONS[glyph] ?? glyph;
  const normalized = normalizedGlyph.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^[A-Za-z]$/.test(normalized) ? normalized.toUpperCase() : null;
}

export function getPaletteGroup(entry) {
  if (/^[0-9]$/.test(entry.glyph)) return "digits";
  return getGroupLetter(entry.glyph) ?? "punctuation";
}

function getGroupSortKey(entry) {
  const glyph = entry.glyph;
  if (/^[0-9]$/.test(glyph)) return [0, Number(glyph), 0, "", entry.code ?? Number.MAX_SAFE_INTEGER];

  const letter = getGroupLetter(glyph);
  if (letter) {
    const isUppercase = glyph === glyph.toUpperCase();
    const accentKey = GROUP_LETTER_EXCEPTIONS[glyph]
      ? `${isUppercase ? "Z" : "z"}${GROUP_LETTER_EXCEPTIONS[glyph]}`
      : glyph.normalize("NFD");
    return [1, letter, isUppercase ? 0 : 1, accentKey, entry.code ?? Number.MAX_SAFE_INTEGER];
  }

  return [2, "", 0, "", entry.code ?? Number.MAX_SAFE_INTEGER];
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
    if (!entry || !isValidIdentity(entry) || typeof entry.glyph !== "string" || [...entry.glyph].length !== 1) {
      throw new TypeError("Palette entries need a valid identity and one glyph.");
    }
    if (!expectedIds.has(getPaletteEntryId(entry)) || seen.has(getPaletteEntryId(entry))) {
      throw new TypeError("Palette entries must contain each supported identity exactly once.");
    }
    if (!isValidColor(entry.color) || !Number.isFinite(entry.alpha) || entry.alpha < 0 || entry.alpha > 1) {
      throw new TypeError("Palette entries need a six-digit color and alpha from 0 to 1.");
    }
    seen.add(getPaletteEntryId(entry));
  }
  if (seen.size !== expectedIds.size) {
    throw new TypeError("Palette entries are missing a supported identity.");
  }
  return entries;
}

export function createPalette(data = {}) {
  const entries = data.entries ?? createDefaultPalette();
  const palette = entries.map((entry) => ({ ...entry }));
  if (data.overrides) {
    for (const [id, override] of Object.entries(data.overrides)) {
      const entry = palette.find((candidate) => getPaletteEntryId(candidate) === id);
      if (!entry) {
        throw new TypeError(`Unknown palette identity: ${id}`);
      }
      Object.assign(entry, override);
    }
  }
  validatePaletteEntries(palette);
  return palette;
}

export function serializePalette(entries) {
  validatePaletteEntries(entries);
  return JSON.stringify({ version: 1, entries }, null, 2);
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
