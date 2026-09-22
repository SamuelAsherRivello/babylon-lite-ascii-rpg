import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePlayerAttackDamage,
  calculatePlayerDamageTaken,
  createCombatStatsSystem,
  deriveCombatStatValue,
  INITIAL_DEFENSE_MAXIMUM,
  INITIAL_OFFENSE_MAXIMUM,
} from "../../../../src/client/game-layer-babylon-lite/systems/combat-stats-system.js";
import { createStaminaSystem } from "../../../../src/client/game-layer-babylon-lite/systems/stamina-system.js";

test("derives current offense and defense from the stamina ratio", () => {
  assert.equal(deriveCombatStatValue(25, 50, 50), 25);
  assert.equal(deriveCombatStatValue(25, 25, 50), 12.5);
  assert.equal(deriveCombatStatValue(25, 0, 50), 0);
});

test("publishes immutable initial and stamina-derived stat snapshots", () => {
  const stamina = createStaminaSystem();
  const stats = createCombatStatsSystem({ staminaSystem: stamina });
  assert.deepEqual(stats.getSnapshot(), {
    offense: { current: 25, maximum: 25, currentPercent: 25, previousPercent: 25, revision: 0 },
    defense: { current: 25, maximum: 25, currentPercent: 25, previousPercent: 25, revision: 0 },
  });
  assert.equal(Object.isFrozen(stats.getSnapshot().offense), true);
  stamina.spendForAttack();
  assert.equal(stats.getOffenseSnapshot().current, 22.5);
  assert.equal(stats.getDefenseSnapshot().current, 22.5);
  assert.equal(stats.getOffenseSnapshot().currentPercent, 22.5);
});

test("uses the requested starting maximums", () => {
  assert.equal(INITIAL_OFFENSE_MAXIMUM, 25);
  assert.equal(INITIAL_DEFENSE_MAXIMUM, 25);
});

test("scales player damage and retains minimum damage", () => {
  assert.equal(calculatePlayerAttackDamage(5, 25, 25), 5);
  assert.equal(calculatePlayerAttackDamage(5, 13, 25), 3);
  assert.equal(calculatePlayerAttackDamage(5, 0, 25), 1);
});

test("reduces incoming damage with bounded defense mitigation", () => {
  assert.equal(calculatePlayerDamageTaken(5, 25, 25), 3);
  assert.equal(calculatePlayerDamageTaken(5, 13, 25), 4);
  assert.equal(calculatePlayerDamageTaken(5, 0, 25), 5);
});
