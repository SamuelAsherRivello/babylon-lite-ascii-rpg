export const HEALTH_BAR_LAYER_ORDER = 2;
export const HEALTH_BAR_OUTLINE_COLOR = Object.freeze([0.85, 0.88, 0.92]);
export const HEALTH_BAR_TRACK_COLOR = Object.freeze([0.08, 0.04, 0.06]);
export const HEALTH_BAR_FILL_COLOR = Object.freeze([1, 0.12, 0.28]);
export const HEALTH_BAR_DELTA_COLOR = Object.freeze([1, 0.49, 0.58]);

export function createSolidHealthBarFrame(size = 4) {
  const pixels = new Uint8Array(size * size * 4);
  pixels.fill(255);
  return { name: "health-bar-solid", pixels, width: size, height: size };
}

export function getHealthBarSpriteGeometry(center, viewport, fillRatio, {
  deltaStartRatio = fillRatio,
  deltaWidthRatio = 0,
} = {}) {
  const width = Math.max(1, viewport.gridWidth);
  const height = Math.max(2, viewport.gridHeight * 0.125);
  const border = Math.max(1, Math.min(width, height) * 0.08);
  const gap = Math.max(1, viewport.gridHeight * 0.08);
  const innerWidth = Math.max(0, width - border * 2);
  const innerHeight = Math.max(1, height - border * 2);
  const boundedFill = Math.max(0, Math.min(1, fillRatio));
  const fillWidth = boundedFill === 0 ? 0 : Math.max(1, innerWidth * boundedFill);
  const boundedDeltaStart = Math.max(0, Math.min(1, deltaStartRatio));
  const boundedDeltaWidth = Math.max(0, Math.min(1 - boundedDeltaStart, deltaWidthRatio));
  const deltaWidth = boundedDeltaWidth === 0 ? 0 : Math.max(1, innerWidth * boundedDeltaWidth);
  const y = center.y - viewport.gridHeight / 2 - gap - height / 2;
  return Object.freeze({
    outline: Object.freeze({ positionPx: Object.freeze([center.x, y]), sizePx: Object.freeze([width, height]) }),
    track: Object.freeze({ positionPx: Object.freeze([center.x, y]), sizePx: Object.freeze([innerWidth, innerHeight]) }),
    fill: Object.freeze({
      positionPx: Object.freeze([center.x - innerWidth / 2 + fillWidth / 2, y]),
      sizePx: Object.freeze([fillWidth, innerHeight]),
    }),
    delta: Object.freeze({
      positionPx: Object.freeze([center.x - innerWidth / 2 + innerWidth * boundedDeltaStart + deltaWidth / 2, y]),
      sizePx: Object.freeze([deltaWidth, innerHeight]),
    }),
  });
}
