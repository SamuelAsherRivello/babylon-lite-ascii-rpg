import { MOTION_PROFILES } from "../animation-profiles.js";
import { resolveMotion } from "../tile-animation.js";
export const FLOATING_TEXT_FADE_IN_MS = 100;
export const FLOATING_TEXT_HOLD_MS = 500;
export const FLOATING_TEXT_FADE_OUT_MS = 100;

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getColorRole(delta) {
  return delta < 0 ? "damage" : "healing";
}

export function formatFloatingTextDelta(delta) {
  const rounded = Math.trunc(Number(delta) || 0);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function easeFloatingTextTravelProgress(progress) {
  const normalized = clamp(Number(progress) || 0, 0, 1);
  return 1 - ((1 - normalized) * (1 - normalized));
}

export function createFloatingTextSystem({
  fadeInMs = FLOATING_TEXT_FADE_IN_MS,
  holdMs = FLOATING_TEXT_HOLD_MS,
  fadeOutMs = FLOATING_TEXT_FADE_OUT_MS,
} = {}) {
  const records = new Map();
  let nextSequence = 1;

  const totalMs = fadeInMs + holdMs + fadeOutMs;

  const getState = (id, now) => {
    const record = records.get(id);
    if (!record) return null;
    const motion = resolveMotion(MOTION_PROFILES.floatingText, now, record.createdAt, totalMs);
    const elapsed = motion.elapsed;
    if (motion.complete) {
      records.delete(id);
      return null;
    }
    let alpha = resolveMotion(MOTION_PROFILES.floatingText, now, record.createdAt, fadeInMs).progress;
    if (elapsed > fadeInMs + holdMs) {
      alpha = 1 - resolveMotion(MOTION_PROFILES.floatingText, now, record.createdAt + fadeInMs + holdMs, fadeOutMs).progress;
    }
    const progress = motion.progress;
    return Object.freeze({
      ...record,
      alpha,
      progress,
      travelProgress: easeFloatingTextTravelProgress(progress),
    });
  };

  return Object.freeze({
    recordDelta({ entityId = null, type = "entity", realm, cell, delta, at = Date.now() } = {}) {
      const appliedDelta = Math.trunc(Number(delta) || 0);
      if (!realm || !cell || appliedDelta === 0) return null;
      const id = `floating-text-${nextSequence}`;
      nextSequence += 1;
      const record = Object.freeze({
        id,
        entityId,
        type,
        realm,
        cell: Object.freeze({ x: cell.x, y: cell.y }),
        delta: appliedDelta,
        text: formatFloatingTextDelta(appliedDelta),
        colorRole: getColorRole(appliedDelta),
        createdAt: at,
      });
      records.set(id, record);
      return getState(id, at);
    },
    getState,
    getVisible(now, { realm, isCellVisible = () => true } = {}) {
      const visible = [];
      for (const id of [...records.keys()]) {
        const state = getState(id, now);
        if (state && state.realm === realm && isCellVisible(state.cell)) visible.push(state);
      }
      return Object.freeze(visible);
    },
    hasActive(now) {
      for (const id of [...records.keys()]) {
        if (getState(id, now)) return true;
      }
      return false;
    },
    remove(id) {
      return records.delete(id);
    },
    clear() {
      records.clear();
    },
  });
}
