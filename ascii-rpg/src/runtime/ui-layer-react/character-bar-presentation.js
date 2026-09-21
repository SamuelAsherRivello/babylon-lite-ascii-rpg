export const CHARACTER_BAR_PERCENT_MAX = 100;
export const CHARACTER_BAR_DELTA_DURATION_MS = 300;

function clampPercent(value) {
  const numeric = Number(value);
  return Math.min(CHARACTER_BAR_PERCENT_MAX, Math.max(0, Number.isFinite(numeric) ? numeric : 0));
}

export function getCharacterBarSegments({
  currentPercent,
  transitionPercent = currentPercent,
} = {}) {
  const current = clampPercent(currentPercent);
  const transition = clampPercent(transitionPercent);
  return Object.freeze({
    currentPercent: current,
    deltaStartPercent: Math.min(current, transition),
    deltaWidthPercent: Math.abs(current - transition),
  });
}
