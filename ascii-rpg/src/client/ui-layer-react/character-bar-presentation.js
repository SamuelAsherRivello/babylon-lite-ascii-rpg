import { MOTION_PROFILES } from "../game-layer-babylon-lite/animation-profiles.js";

// React owns the delta hold/retirement; it uses the catalog cadence without a game-layer timer.
export const CHARACTER_BAR_PERCENT_MAX = 100;
export const CHARACTER_BAR_DELTA_DURATION_MS = MOTION_PROFILES.characterDelta.duration;

function clampPercent(value) {
  const numeric = Number(value);
  return Math.min(CHARACTER_BAR_PERCENT_MAX, Math.max(0, Number.isFinite(numeric) ? numeric : 0));
}

export function getCharacterBarMaximumPercent(maximum = 100) {
  return clampPercent(maximum);
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
