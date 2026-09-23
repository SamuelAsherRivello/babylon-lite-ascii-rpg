import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlayerCombatTurn, resolvePlayerDynamicCollision } from "../../../../src/client/game-layer-babylon-lite/systems/combat-system.js";
import { createTimeSystem } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { createStaminaSystem } from "../../../../src/client/game-layer-babylon-lite/systems/stamina-system.js";
import { createDynamicOccupancy } from "../../../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import { createCombatStatsSystem } from "../../../../src/client/game-layer-babylon-lite/systems/combat-stats-system.js";
import { moveWorldCell } from "../../../../src/client/game-layer-babylon-lite/characters/player/player-grid.js";
import { createFloatingTextSystem } from "../../../../src/client/game-layer-babylon-lite/systems/floating-text-system.js";
import { createHealthBarSystem } from "../../../../src/client/game-layer-babylon-lite/systems/health-bar-system.js";
import { damageMountainTarget, getDiggableMountainTarget } from "../../../../src/client/game-layer-babylon-lite/systems/mountain-system.js";

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

test("mountain collision uses Offense damage and a full attack turn without kill rewards", () => {
  const timeSystem = createTimeSystem();
  const staminaSystem = createStaminaSystem({ initialStamina: 25 });
  const combatStatsSystem = createCombatStatsSystem({ staminaSystem });
  const calls = [];
  const awards = [];
  const result = resolvePlayerCombatTurn({ id: "mountain:Overground:3:4", type: "mountain" }, {
    timeSystem,
    staminaSystem,
    combatStatsSystem,
    experienceSystem: {
      awardAttack: () => awards.push("attack"),
      awardEnemyKill: () => awards.push("enemy-kill"),
    },
    mountainSystem: { damage: (target, amount, context) => {
      calls.push([target.id, amount, context]);
      return { handled: true, killed: true };
    } },
  });

  assert.deepEqual(result, { handled: true, killed: true });
  assert.deepEqual(calls, [["mountain:Overground:3:4", 10, { attacker: "player" }]]);
  assert.deepEqual(awards, ["attack"]);
  assert.equal(staminaSystem.getCurrent(), 22.5);
  assert.equal(timeSystem.getTime(), 2);
});

test("only initialized Overground mountain terrain is a dig target", () => {
  const cell = { kind: "mountain", glyph: "△", walkable: false, health: 100, maxHealth: 100 };
  const borderMountain = { ...cell };
  const world = { rows: 3, columns: 3, terrain: [[{}, borderMountain, {}], [{}, cell, {}], [{}, {}, {}]] };
  const target = getDiggableMountainTarget(world, "Overground", { x: 1, y: 1 });

  assert.equal(target.type, "mountain");
  assert.equal(target.id, "mountain:Overground:1:1");
  assert.equal(getDiggableMountainTarget(world, "Underground", { x: 1, y: 1 }), null);
  assert.equal(getDiggableMountainTarget(world, "Overground", { x: 1, y: 0 }), null);
});

test("mountain damage clamps health, supports repeated hits, and turns lethal terrain to grass", () => {
  const cell = { kind: "mountain", glyph: "△", color: "#999", walkable: false, health: 100, maxHealth: 100 };
  const world = { rows: 3, columns: 3, terrain: [[{}, {}, {}], [{}, cell, {}], [{}, {}, {}]] };
  const target = getDiggableMountainTarget(world, "Overground", { x: 1, y: 1 });
  const first = damageMountainTarget(target, 30);
  assert.equal(first.appliedDamage, 30);
  assert.equal(first.target.previousHealth, 100);
  assert.equal(first.target.health, 70);
  assert.equal(cell.health, 70);

  const second = damageMountainTarget(getDiggableMountainTarget(world, "Overground", { x: 1, y: 1 }), 100);
  assert.equal(second.appliedDamage, 70);
  assert.equal(second.killed, true);
  assert.equal(second.target.health, 0);
  assert.equal(cell.kind, "grass");
  assert.equal(cell.glyph, "•");
  assert.equal(cell.walkable, true);
  assert.equal(cell.health, undefined);
  assert.equal(getDiggableMountainTarget(world, "Overground", { x: 1, y: 1 }), null);

  const player = { x: 1, y: 2 };
  assert.deepEqual(player, { x: 1, y: 2 }, "lethal damage does not move the player");
  assert.deepEqual(moveWorldCell(player, { x: 0, y: -1 }, world), { x: 1, y: 1 });
});

test("mountain health bars and floating damage respect visibility and clamp displayed values", () => {
  const bars = createHealthBarSystem();
  const text = createFloatingTextSystem();
  const target = { id: "mountain:Overground:2:2", type: "mountain", realm: "Overground", cell: { x: 2, y: 2 } };
  bars.recordDamage({ ...target, health: 0, previousHealth: 10, maxHealth: 100 }, 100);
  text.recordDelta({ entityId: target.id, type: target.type, realm: target.realm, cell: target.cell, delta: -10, at: 100 });

  assert.equal(bars.getState(target.id, 100).fillRatio, 0);
  assert.deepEqual(bars.getVisible(100, { realm: "Overground", isCellVisible: () => false }), []);
  assert.deepEqual(text.getVisible(100, { realm: "Overground", isCellVisible: () => false }), []);
  assert.equal(bars.getVisible(100, { realm: "Overground", isCellVisible: () => true })[0].type, "mountain");
  assert.equal(text.getVisible(100, { realm: "Overground", isCellVisible: () => true })[0].delta, -10);
});
