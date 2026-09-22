export const HEALTH_BAR_FADE_MS = 100;
export const HEALTH_BAR_HOLD_MS = 1_000;
export const HEALTH_BAR_DELTA_MS = 300;

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
    const sinceFirstDamage = Math.max(0, now - record.firstDamageAt);
    const sinceLatestDamage = Math.max(0, now - record.latestDamageAt);
    let alpha = fadeInMs === 0 ? 1 : clamp(sinceFirstDamage / fadeInMs, 0, 1);
    if (sinceLatestDamage > holdMs) {
      const fadeElapsed = sinceLatestDamage - holdMs;
      alpha = fadeOutMs === 0 ? 0 : clamp(1 - fadeElapsed / fadeOutMs, 0, 1);
    }
    if (alpha <= 0 && sinceLatestDamage >= holdMs + fadeOutMs) {
      records.delete(id);
      return null;
    }
    const maximum = Math.max(1, record.maxHealth);
    const fillRatio = clamp(record.health / maximum, 0, 1);
    const previousRatio = clamp(record.previousHealth / maximum, 0, 1);
    const deltaVisible = sinceLatestDamage < deltaMs;
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
