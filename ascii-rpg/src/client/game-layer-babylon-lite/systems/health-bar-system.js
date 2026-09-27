import { MOTION_PROFILES } from "../animation-profiles.js";
import { resolveMotion } from "../tile-animation.js";
export const HEALTH_BAR_FADE_MS = MOTION_PROFILES.healthFade.duration;
export const HEALTH_BAR_HOLD_MS = 1_000;
export const HEALTH_BAR_DELTA_MS = MOTION_PROFILES.healthDelta.duration;

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function createHealthBarSystem({
  fadeInMs = HEALTH_BAR_FADE_MS,
  holdMs = HEALTH_BAR_HOLD_MS,
  fadeOutMs = HEALTH_BAR_FADE_MS,
  deltaMs = HEALTH_BAR_DELTA_MS,
} = {}) {
  const records = new Map();

  const getState = (id, now) => {
    const record = records.get(id);
    if (!record) return null;
    const fadeIn = resolveMotion(MOTION_PROFILES.healthFade, now, record.firstDamageAt, fadeInMs);
    const delta = resolveMotion(MOTION_PROFILES.healthDelta, now, record.latestDamageAt, deltaMs);
    const sinceLatestDamage = delta.elapsed;
    let alpha = fadeIn.progress;
    if (sinceLatestDamage > holdMs) {
      alpha = 1 - resolveMotion(MOTION_PROFILES.healthFade, now, record.latestDamageAt + holdMs, fadeOutMs).progress;
    }
    if (alpha <= 0 && sinceLatestDamage >= holdMs + fadeOutMs) {
      records.delete(id);
      return null;
    }
    const maximum = Math.max(1, record.maxHealth);
    const fillRatio = clamp(record.health / maximum, 0, 1);
    const previousRatio = clamp(record.previousHealth / maximum, 0, 1);
    const deltaVisible = !delta.complete;
    return Object.freeze({
      id: record.id,
      type: record.type,
      realm: record.realm,
      cell: record.cell,
      health: record.health,
      maxHealth: record.maxHealth,
      fillRatio,
      deltaStartRatio: Math.min(fillRatio, previousRatio),
      deltaWidthRatio: deltaVisible ? Math.abs(fillRatio - previousRatio) : 0,
      alpha,
    });
  };

  return Object.freeze({
    recordDamage(entity, at = Date.now()) {
      if (!entity?.id || entity.type === "player") return null;
      const previous = records.get(entity.id);
      const maxHealth = Math.max(1, Number(entity.maxHealth) || 1);
      const health = clamp(Number(entity.health) || 0, 0, maxHealth);
      const rawPreviousHealth = Number(entity.previousHealth ?? previous?.health ?? maxHealth);
      const previousHealth = clamp(Number.isFinite(rawPreviousHealth) ? rawPreviousHealth : maxHealth, 0, maxHealth);
      const record = Object.freeze({
        id: entity.id,
        type: entity.type,
        realm: entity.realm,
        cell: Object.freeze({ ...entity.cell }),
        health,
        previousHealth,
        maxHealth,
        firstDamageAt: previous?.firstDamageAt ?? at,
        latestDamageAt: at,
      });
      records.set(entity.id, record);
      return getState(entity.id, at);
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
