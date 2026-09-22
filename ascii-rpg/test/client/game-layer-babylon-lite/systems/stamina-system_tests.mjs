import assert from "node:assert/strict";
import test from "node:test";
import {
  ATTACK_STAMINA_COST,
  ATTACK_STAMINA_COST_PERCENT,
  INITIAL_PLAYER_STAMINA,
  MAX_PLAYER_STAMINA,
  STAMINA_BAR_NOMINAL_CAPACITY,
  STAMINA_PER_TIME_TICK,
  createStaminaSystem,
} from "../../../../src/client/game-layer-babylon-lite/systems/stamina-system.js";

test("starts at 50 stamina against a bounded 50 stamina maximum", () => {
  const stamina = createStaminaSystem();

  assert.equal(INITIAL_PLAYER_STAMINA, 50);
  assert.equal(MAX_PLAYER_STAMINA, 50);
  assert.equal(STAMINA_BAR_NOMINAL_CAPACITY, 100);
  assert.deepEqual(stamina.getSnapshot(), { current: 50, maximum: 50, currentPercent: 50 });
  assert.equal(Object.isFrozen(stamina.getSnapshot()), true);
});

test("spends ten percent of current stamina while movement ticks recover", () => {
  const stamina = createStaminaSystem({ initialStamina: 30 });

  assert.equal(ATTACK_STAMINA_COST, 10);
  assert.equal(ATTACK_STAMINA_COST_PERCENT, 10);
  assert.equal(STAMINA_PER_TIME_TICK, 10);

  stamina.spendForAttack();
  assert.equal(stamina.getCurrent(), 27);
  stamina.recoverForTimeTick();
  assert.equal(stamina.getCurrent(), 37);
});

test("clamps recovery and preserves zero stamina", () => {
  const full = createStaminaSystem({ initialStamina: 50 });
  full.recoverForTimeTick();
  assert.equal(full.getCurrent(), 50);

  const empty = createStaminaSystem({ initialStamina: 0 });
  empty.spendForAttack();
  assert.equal(empty.getCurrent(), 0);
  empty.recoverForTimeTick();
  assert.equal(empty.getCurrent(), 10);
});

test("publishes immutable current and maximum snapshots", () => {
  const stamina = createStaminaSystem({ initialStamina: 5 });
  const received = [];
  const unsubscribe = stamina.subscribe((snapshot) => received.push(snapshot));

  stamina.spendForAttack();
  stamina.recoverForTimeTick();

  assert.deepEqual(received, [
    { current: 5, maximum: 50, currentPercent: 5 },
    { current: 4.5, maximum: 50, currentPercent: 4.5 },
    { current: 14.5, maximum: 50, currentPercent: 14.5 },
  ]);
  assert.equal(received.every(Object.isFrozen), true);
  unsubscribe();
});
