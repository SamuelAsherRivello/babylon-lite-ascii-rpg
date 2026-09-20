const HEX_COLOR_PATTERN = /^#([0-9a-f]{6})$/i;

function parseHexColor(color) {
  const match = HEX_COLOR_PATTERN.exec(color);
  if (!match) throw new Error(`Expected a six-digit hex color, received ${color}`);
  const value = Number.parseInt(match[1], 16);
  return { red: value >> 16, green: (value >> 8) & 0xff, blue: value & 0xff };
}

function formatHexColor({ red, green, blue }) {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

function mixColors(color, target, amount) {
  const sourceRgb = parseHexColor(color);
  const targetRgb = parseHexColor(target);
  const boundedAmount = Math.min(1, Math.max(0, amount));
  return formatHexColor({
    red: sourceRgb.red + (targetRgb.red - sourceRgb.red) * boundedAmount,
    green: sourceRgb.green + (targetRgb.green - sourceRgb.green) * boundedAmount,
    blue: sourceRgb.blue + (targetRgb.blue - sourceRgb.blue) * boundedAmount,
  });
}

export function deriveBarColors(baseColor) {
  return Object.freeze({
    current: baseColor,
    delta: mixColors(baseColor, "#ffffff", 0.42),
    unfilled: mixColors(baseColor, "#000000", 0.72),
  });
}

