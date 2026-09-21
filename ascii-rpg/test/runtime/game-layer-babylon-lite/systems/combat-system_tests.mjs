import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlayerCombatTurn, resolvePlayerDynamicCollision } from "../../../../src/runtime/game-layer-babylon-lite/systems/combat-system.js";
import { createTimeSystem } from "../../../../src/runtime/game-layer-babylon-lite/systems/time-system.js";
import { createStaminaSystem } from "../../../../src/runtime/game-layer-babylon-lite/systems/stamina-system.js";
import { createDynamicOccupancy } from "../../../../src/runtime/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import { createCombatStatsSystem } from "../../../../src/runtime/game-layer-babylon-lite/systems/combat-stats-system.js";

test("player collision applies the base twenty damage to an enemy or spawner without moving", () => {
  const calls = [];
  const enemy = { id: "enemy-1", type: "enemy", health: 100 };
  const spawner = { id: "spawner-1", type: "enemy-spawner", health: 100 };
  const systems = {
    enemySystem: { damage: (id, amount, context) => calls.push(["enemy", id, amount, context]) || { ...enemy, health: 80 } },
    spawnerSystem: { damage: (id, amount, context) => calls.push(["spawner", id, amount, context]) || { ...spawner, health: 80 } },
  };

  assert.deepEqual(resolvePlayerDynamicCollision(enemy, systems), { handled: true, killed: false });
  assert.deepEqual(resolvePlayerDynamicCollision(spawner, systems), { handled: true, killed: false });
  assert.deepEqual(calls, [
    ["enemy", "enemy-1", 20, { attacker: "player" }],
    ["spawner", "spawner-1", 20, { attacker: "player" }],
  ]);
});

test("reports lethal collisions and allows a later empty-cell movement attempt", () => {
  const occupancy = createDynamicOccupancy();
  occupancy.claim({ id: "player", type: "player", cell: { x: 1, y: 1 } });
  occupancy.claim({ id: "enemy-1", type: "enemy", health: 5, cell: { x: 2, y: 1 } });
  const enemy = { id: "enemy-1", type: "enemy", health: 5 };
  const systems = { enemySystem: { damage: () => occupancy.remove("enemy-1") && null } };

  assert.deepEqual(resolvePlayerDynamicCollision(enemy, systems), { handled: true, killed: true });
  assert.equal(occupancy.move("player", { x: 2, y: 1 }), true);
  assert.deepEqual(occupancy.get("player").cell, { x: 2, y: 1 });
});

test("ignores non-damageable dynamic occupants", () => {
  assert.deepEqual(resolvePlayerDynamicCollision({ id: "player", type: "player" }, {}), { handled: false, killed: false });
});

test("advances exactly one combat tick for a valid attack and none for a stale target", () => {
  const timeSystem = createTimeSystem();
  const staminaSystem = createStaminaSystem();
  const enemySystem = { damage: () => ({ id: "enemy-1", type: "enemy", health: 95 }) };
  const causes = [];
  timeSystem.subscribe((time, event) => causes.push(event.cause));

  resolvePlayerCombatTurn({ id: "enemy-1", type: "enemy" }, { timeSystem, staminaSystem, enemySystem });
  assert.equal(timeSystem.getTime(), 2);
  assert.equal(staminaSystem.getCurrent(), 45);
  assert.deepEqual(causes, ["combat"]);
  resolvePlayerCombatTurn(null, { timeSystem, staminaSystem, enemySystem });
  assert.equal(timeSystem.getTime(), 2);
  assert.equal(staminaSystem.getCurrent(), 45);
});

test("resolved attacks spend ten percent of current stamina", () => {
  const timeSystem = createTimeSystem();
  const staminaSystem = createStaminaSystem({ initialStamina: 10 });
  const enemySystem = { damage: () => ({ id: "enemy-1", type: "enemy", health: 95 }) };

  const result = resolvePlayerCombatTurn(
    { id: "enemy-1", type: "enemy" },
    { timeSystem, staminaSystem, enemySystem },
  );

  assert.deepEqual(result, { handled: true, killed: false });
  assert.equal(staminaSystem.getCurrent(), 9);
  assert.equal(timeSystem.getTime(), 2);
});

test("player collision damage follows current offense before spending stamina", () => {
  const staminaSystem = createStaminaSystem({ initialStamina: 25 });
  const combatStatsSystem = createCombatStatsSystem({ staminaSystem });
  const calls = [];
  resolvePlayerCombatTurn(
    { id: "enemy-1", type: "enemy" },
    {
      timeSystem: createTimeSystem(),
      staminaSystem,
      combatStatsSystem,
      enemySystem: { damage: (id, amount) => calls.push([id, amount]) || {} },
    },
  );
  assert.deepEqual(calls, [["enemy-1", 10]]);
});

test("awards attack experience and kill-specific experience without changing combat timing", () => {
  const awards = [];
  const experienceSystem = {
    awardAttack: () => awards.push("attack"),
    awardEnemyKill: () => awards.push("enemy-kill"),
    awardSpawnerKill: () => awards.push("spawner-kill"),
  };
  const options = {
    timeSystem: createTimeSystem(),
    staminaSystem: createStaminaSystem(),
    experienceSystem,
    enemySystem: { damage: () => null },
  };

  resolvePlayerCombatTurn({ id: "enemy-1", type: "enemy" }, options);
  resolvePlayerCombatTurn({ id: "spawner-1", type: "enemy-spawner" }, {
    ...options,
    spawnerSystem: { damage: () => null },
  });

  assert.deepEqual(awards, ["attack", "enemy-kill", "attack", "spawner-kill"]);
});
