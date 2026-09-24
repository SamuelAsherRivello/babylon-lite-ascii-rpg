import { calculatePlayerAttackDamage } from "./combat-stats-system.js";

export const PLAYER_BASE_DAMAGE = 20;

function createCombatResult({ handled, killed, appliedDamage = 0 }) {
  const result = { handled, killed };
  Object.defineProperty(result, "appliedDamage", { value: appliedDamage, enumerable: false });
  return Object.freeze(result);
}

export function resolvePlayerDynamicCollision(occupant, {
  enemySystem,
  spawnerSystem,
  mountainSystem,
  combatStatsSystem,
} = {}) {
  if (!occupant) return createCombatResult({ handled: false, killed: false });
  const offense = combatStatsSystem?.getOffenseSnapshot?.();
  const damage = offense
    ? calculatePlayerAttackDamage(PLAYER_BASE_DAMAGE, offense.current, offense.maximum)
    : PLAYER_BASE_DAMAGE;
  let result;
  if (occupant.type === "enemy") {
    if (enemySystem?.get && !enemySystem.get(occupant.id)) return createCombatResult({ handled: false, killed: false });
    result = enemySystem?.damage(occupant.id, damage, { attacker: "player" });
  } else if (occupant.type === "enemy-spawner") {
    if (spawnerSystem?.get && !spawnerSystem.get(occupant.id)) return createCombatResult({ handled: false, killed: false });
    result = spawnerSystem?.damage(occupant.id, damage, { attacker: "player" });
  } else if (occupant.type === "mountain") {
    result = mountainSystem?.damage(occupant, damage, { attacker: "player" });
    if (!result?.handled) return createCombatResult({ handled: false, killed: false });
    return createCombatResult({ handled: true, killed: result.killed, appliedDamage: result.appliedDamage ?? 0 });
  } else {
    return createCombatResult({ handled: false, killed: false });
  }
  return createCombatResult({
    handled: true,
    killed: result === null,
    appliedDamage: Math.max(0, (Number(occupant.health) || 0) - (Number(result?.health) || 0)),
  });
}

export function resolvePlayerCombatTurn(occupant, {
  timeSystem,
  staminaSystem,
  experienceSystem,
  enemySystem,
  spawnerSystem,
  mountainSystem,
  combatStatsSystem,
  advanceBeforeAction = false,
  shouldContinue = null,
} = {}) {
  let result = createCombatResult({ handled: false, killed: false });
  const attack = () => {
    result = resolvePlayerDynamicCollision(occupant, {
      enemySystem, spawnerSystem, mountainSystem, combatStatsSystem,
    });
    if (!result.handled) return;
    experienceSystem?.awardAttack?.();
    if (result.killed) {
      if (occupant.type === "enemy") experienceSystem?.awardEnemyKill?.();
      if (occupant.type === "enemy-spawner") experienceSystem?.awardSpawnerKill?.();
    }
    staminaSystem?.spendForAttack();
  };
  if (advanceBeforeAction) {
    timeSystem?.advance(1, "combat", { beforeTick: attack, shouldContinue });
  } else {
    attack();
    if (result.handled) timeSystem?.advance(1, "combat");
  }
  return result;
}
