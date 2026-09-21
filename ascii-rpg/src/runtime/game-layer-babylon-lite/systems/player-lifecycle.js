export const INITIAL_PLAYER_HEALTH = 80;
export const MAX_PLAYER_HEALTH = 100;

function clampHealth(value) {
  return Math.min(MAX_PLAYER_HEALTH, Math.max(0, Number(value) || 0));
}

export function createPlayerLifecycle({ initialHealth = INITIAL_PLAYER_HEALTH } = {}) {
  let health = clampHealth(initialHealth);
  let dead = health === 0;
  const healthListeners = new Set();
  const deathListeners = new Set();

  const notifyHealth = () => {
    for (const listener of healthListeners) listener(health);
  };

  const notifyDeath = () => {
    for (const listener of deathListeners) listener(true);
  };

  return Object.freeze({
    getHealth() { return health; },
    isDead() { return dead; },
    applyHealthDelta(amount) {
      if (dead) return health;
      const nextHealth = clampHealth(health + Number(amount));
      if (nextHealth === health) return health;
      health = nextHealth;
      notifyHealth();
      if (health === 0) {
        dead = true;
        notifyDeath();
      }
      return health;
    },
    subscribeToHealth(listener) {
      healthListeners.add(listener);
      listener(health);
      return () => healthListeners.delete(listener);
    },
    subscribeToDeath(listener) {
      deathListeners.add(listener);
      if (dead) listener(true);
      return () => deathListeners.delete(listener);
    },
  });
}
