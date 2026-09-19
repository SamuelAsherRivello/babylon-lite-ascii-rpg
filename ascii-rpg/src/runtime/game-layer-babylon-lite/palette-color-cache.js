export function colorToLinearRgba({ color, alpha }) {
  const hex = color.slice(1);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  return [...channels.map((channel) => channel ** 2.2), alpha];
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
