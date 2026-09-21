export const INITIAL_OFFENSE_MAXIMUM = 25;
export const INITIAL_DEFENSE_MAXIMUM = 25;
export const PLAYER_MAX_ATTACK_DAMAGE = 20;
export const ENEMY_MAX_ATTACK_DAMAGE = 5;
export const MAX_DEFENSE_MITIGATION = 0.5;

function clamp(value, maximum) {
  const numeric = Number(value);
  return Math.min(maximum, Math.max(0, Number.isFinite(numeric) ? numeric : 0));
}

function ratio(current, maximum) {
  return maximum > 0 ? clamp(current, maximum) / maximum : 0;
}

export function deriveCombatStatValue(maximum, staminaCurrent, staminaMaximum) {
  const boundedMaximum = Math.max(0, Number(maximum) || 0);
  return boundedMaximum * ratio(staminaCurrent, staminaMaximum);
}

export function calculatePlayerAttackDamage(
  maximumDamage = PLAYER_MAX_ATTACK_DAMAGE,
  currentOffense,
  maximumOffense = INITIAL_OFFENSE_MAXIMUM,
) {
  const damage = Math.round((Number(maximumDamage) || 0) * ratio(currentOffense, maximumOffense));
  return Math.max(1, damage);
}

export function calculatePlayerDamageTaken(
  maximumDamage = ENEMY_MAX_ATTACK_DAMAGE,
  currentDefense,
  maximumDefense = INITIAL_DEFENSE_MAXIMUM,
) {
  const defenseRatio = ratio(currentDefense, maximumDefense);
  const mitigation = Math.min(MAX_DEFENSE_MITIGATION, MAX_DEFENSE_MITIGATION * defenseRatio);
  return Math.max(1, Math.ceil((Number(maximumDamage) || 0) * (1 - mitigation)));
}

function createStatSnapshot(current, maximum, previousPercent = null, revision = 0) {
  const currentPercent = clamp(current, 100);
  return Object.freeze({
    current,
    maximum,
    currentPercent,
    previousPercent: previousPercent ?? currentPercent,
    revision,
  });
}

export function createCombatStatsSystem({
  staminaSystem,
  offenseMaximum = INITIAL_OFFENSE_MAXIMUM,
  defenseMaximum = INITIAL_DEFENSE_MAXIMUM,
} = {}) {
  const boundedOffenseMaximum = Math.max(0, Number(offenseMaximum) || 0);
  const boundedDefenseMaximum = Math.max(0, Number(defenseMaximum) || 0);
  const initialStamina = staminaSystem?.getSnapshot?.() ?? { current: 0, maximum: 0 };
  const initialOffense = deriveCombatStatValue(boundedOffenseMaximum, initialStamina.current, initialStamina.maximum);
  const initialDefense = deriveCombatStatValue(boundedDefenseMaximum, initialStamina.current, initialStamina.maximum);
  let offenseSnapshot = createStatSnapshot(initialOffense, boundedOffenseMaximum);
  let defenseSnapshot = createStatSnapshot(initialDefense, boundedDefenseMaximum);
  const listeners = new Set();

  const notify = (stamina = staminaSystem?.getSnapshot?.() ?? { current: 0, maximum: 0 }) => {
    const nextOffense = deriveCombatStatValue(boundedOffenseMaximum, stamina.current, stamina.maximum);
    const nextDefense = deriveCombatStatValue(boundedDefenseMaximum, stamina.current, stamina.maximum);
    const nextOffensePercent = clamp(nextOffense, 100);
    const nextDefensePercent = clamp(nextDefense, 100);
    const changed = nextOffensePercent !== offenseSnapshot.currentPercent
      || nextDefensePercent !== defenseSnapshot.currentPercent;
    if (!changed) return;
    const revision = offenseSnapshot.revision + 1;
    offenseSnapshot = createStatSnapshot(nextOffense, boundedOffenseMaximum, offenseSnapshot.currentPercent, revision);
    defenseSnapshot = createStatSnapshot(nextDefense, boundedDefenseMaximum, defenseSnapshot.currentPercent, revision);
    for (const listener of listeners) listener(getSnapshot());
  };
  const getSnapshot = () => Object.freeze({ offense: offenseSnapshot, defense: defenseSnapshot });
  const unsubscribeStamina = staminaSystem?.subscribe?.(notify) ?? (() => {});

  return Object.freeze({
    getSnapshot,
    getOffenseSnapshot() { return offenseSnapshot; },
    getDefenseSnapshot() { return defenseSnapshot; },
    subscribe(listener) {
      listeners.add(listener);
      listener(getSnapshot());
      return () => listeners.delete(listener);
    },
    dispose() {
      unsubscribeStamina();
      listeners.clear();
    },
  });
}
