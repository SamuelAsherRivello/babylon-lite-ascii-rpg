export const MAX_PLAYER_STAMINA = 50;
export const INITIAL_PLAYER_STAMINA = 50;
export const ATTACK_STAMINA_COST_PERCENT = 10;
export const ATTACK_STAMINA_COST = ATTACK_STAMINA_COST_PERCENT;
export const STAMINA_PER_TIME_TICK = 10;
export const STAMINA_BAR_NOMINAL_CAPACITY = 100;

function clampStamina(value, maximum = MAX_PLAYER_STAMINA) {
  const numeric = Number(value);
  return Math.min(maximum, Math.max(0, Number.isFinite(numeric) ? numeric : 0));
}

export function createStaminaSystem({
  initialStamina = INITIAL_PLAYER_STAMINA,
  maximumStamina = MAX_PLAYER_STAMINA,
} = {}) {
  const maximum = Math.max(0, Number(maximumStamina) || 0);
  let current = clampStamina(initialStamina, maximum);
  const listeners = new Set();

  const getSnapshot = () => Object.freeze({
    current,
    maximum,
    currentPercent: (current * 100) / STAMINA_BAR_NOMINAL_CAPACITY,
  });
  const notify = () => {
    const snapshot = getSnapshot();
    for (const listener of listeners) listener(snapshot);
  };
  const setCurrent = (value) => {
    const next = clampStamina(value, maximum);
    if (next === current) return getSnapshot();
    current = next;
    notify();
    return getSnapshot();
  };

  return Object.freeze({
    getCurrent() { return current; },
    getMaximum() { return maximum; },
    getSnapshot,
    spendForAttack() {
      return setCurrent(current * (1 - (ATTACK_STAMINA_COST_PERCENT / 100)));
    },
    recoverForTimeTick() {
      return setCurrent(current + STAMINA_PER_TIME_TICK);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(getSnapshot());
      return () => listeners.delete(listener);
    },
    dispose() {
      listeners.clear();
    },
  });
}
