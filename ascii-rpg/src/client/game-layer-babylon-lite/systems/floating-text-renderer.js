export const FLOATING_TEXT_DAMAGE_COLOR = "#ff3347";
export const FLOATING_TEXT_HEALING_COLOR = "#46f078";
export const FLOATING_TEXT_TRAVEL_RATIO = 0.1;
export const FLOATING_TEXT_HEALTH_BAR_CLEARANCE_RATIO = 0.35;

export function getFloatingTextColor(role) {
  return role === "healing" ? FLOATING_TEXT_HEALING_COLOR : FLOATING_TEXT_DAMAGE_COLOR;
}

export function getFloatingTextStyle(center, viewport, state) {
  const gridWidth = Math.max(1, Number(viewport?.gridWidth) || 1);
  const gridHeight = Math.max(1, Number(viewport?.gridHeight) || gridWidth);
  const progress = Math.max(0, Math.min(1, Number(state?.progress) || 0));
  const travelProgress = Math.max(0, Math.min(1, Number(state?.travelProgress ?? progress) || 0));
  const travel = gridWidth * FLOATING_TEXT_TRAVEL_RATIO * travelProgress;
  const clearance = gridHeight * FLOATING_TEXT_HEALTH_BAR_CLEARANCE_RATIO;
  return Object.freeze({
    text: state.text,
    color: getFloatingTextColor(state.colorRole),
    alpha: Math.max(0, Math.min(1, Number(state.alpha) || 0)),
    positionPx: Object.freeze([
      center.x,
      center.y - gridHeight / 2 - clearance - travel,
    ]),
    travelPx: travel,
    clearancePx: clearance,
    travelProgress,
  });
}
