import { calculatePlayerAttackDamage } from "./combat-stats-system.js";

export const PLAYER_BASE_DAMAGE = 20;

export function resolvePlayerDynamicCollision(occupant, {
  enemySystem,
  spawnerSystem,
  combatStatsSystem,
} = {}) {
  if (!occupant) return Object.freeze({ handled: false, killed: false });
  const offense = combatStatsSystem?.getOffenseSnapshot?.();
  const damage = offense
    ? calculatePlayerAttackDamage(PLAYER_BASE_DAMAGE, offense.current, offense.maximum)
    : PLAYER_BASE_DAMAGE;
  let result;
  if (occupant.type === "enemy") {
    result = enemySystem?.damage(occupant.id, damage, { attacker: "player" });
  } else if (occupant.type === "enemy-spawner") {
    result = spawnerSystem?.damage(occupant.id, damage, { attacker: "player" });
  } else {
    return Object.freeze({ handled: false, killed: false });
  }
  return Object.freeze({ handled: true, killed: result === null });
}

export function resolvePlayerCombatTurn(occupant, {
  timeSystem,
  staminaSystem,
  experienceSystem,
  enemySystem,
  spawnerSystem,
  combatStatsSystem,
} = {}) {
  const result = resolvePlayerDynamicCollision(occupant, {
    enemySystem,
    spawnerSystem,
    combatStatsSystem,
  });
  if (result.handled) {
    experienceSystem?.awardAttack?.();
    if (result.killed) {
      if (occupant.type === "enemy") experienceSystem?.awardEnemyKill?.();
      if (occupant.type === "enemy-spawner") experienceSystem?.awardSpawnerKill?.();
    }
    staminaSystem?.spendForAttack();
    timeSystem?.advance(1, "combat");
  }
  return result;
}
