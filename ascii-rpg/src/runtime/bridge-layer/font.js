export const DEFAULT_FONT_ID = "monospace";
export const FONT_STORAGE_KEY = "babylon-lite-ascii-rpg.font";

export const FONT_OPTIONS = Object.freeze([
  { id: "monospace", label: "Monospace", family: "monospace" },
  { id: "consolas", label: "Consolas", family: "Consolas, monospace" },
  { id: "courier-new", label: "Courier New", family: '"Courier New", monospace' },
  { id: "lucida-console", label: "Lucida Console", family: '"Lucida Console", monospace' },
  { id: "system-monospace", label: "System Monospace", family: "ui-monospace, SFMono-Regular, monospace" },
]);

const fontIds = new Set(FONT_OPTIONS.map((font) => font.id));

export function getFontOption(fontId) {
  return FONT_OPTIONS.find((font) => font.id === fontId) ?? null;
}

export function validateFontId(fontId) {
  if (typeof fontId !== "string" || !fontIds.has(fontId)) {
    throw new TypeError("Font selection is not supported.");
  }
  return fontId;
}

export function createFontConfig(data = {}) {
  const fontId = data.fontId ?? DEFAULT_FONT_ID;
  validateFontId(fontId);
  return { version: 1, fontId };
}

export function serializeFontConfig(fontId) {
  return JSON.stringify(createFontConfig({ fontId }), null, 2);
}
