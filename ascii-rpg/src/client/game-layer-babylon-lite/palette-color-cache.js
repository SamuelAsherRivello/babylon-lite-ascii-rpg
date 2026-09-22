export function colorToLinearRgba({ color, alpha }) {
  const hex = color.slice(1);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  void alpha;
  return [...channels.map((channel) => channel ** 2.2), 1];
}

export function linearRgbaToHex([red, green, blue]) {
  const channels = [red, green, blue].map((channel) => {
    if (!Number.isFinite(channel)) throw new TypeError("Linear color channels must be finite.");
    return Math.round((Math.min(1, Math.max(0, channel)) ** (1 / 2.2)) * 255);
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

// Canvas minimap pixels must match the raw linear channels submitted to the
// game sprite renderer. Do not gamma-encode these values a second time.
export function linearRgbaToRendererHex([red, green, blue]) {
  const channels = [red, green, blue].map((channel) => {
    if (!Number.isFinite(channel)) throw new TypeError("Linear color channels must be finite.");
    return Math.round(Math.min(1, Math.max(0, channel)) * 255);
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function reconcilePaletteColors(previousColors, entries) {
  const colors = new Map();
  const changed = new Set();
  for (const entry of entries) {
    const next = colorToLinearRgba(entry);
    const previous = previousColors?.get(entry.glyph);
    if (previous && previous.every((channel, index) => channel === next[index])) {
      colors.set(entry.glyph, previous);
    } else {
      colors.set(entry.glyph, next);
      changed.add(entry.glyph);
    }
  }
  return { colors, changed };
}
