import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicOccupancy } from "../../../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import {
  createCardinalDistanceField,
  createEnemySystem,
  DEFAULT_ENEMY_FACING,
  ENEMY_GLYPH,
  ENEMY_NAVIGATION_RADIUS,
} from "../../../../src/client/game-layer-babylon-lite/systems/enemy-system.js";
import { createTimeSystem } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { createPlayerLifecycle } from "../../../../src/client/game-layer-babylon-lite/systems/player-lifecycle.js";
import { createCombatStatsSystem } from "../../../../src/client/game-layer-babylon-lite/systems/combat-stats-system.js";
import { createStaminaSystem } from "../../../../src/client/game-layer-babylon-lite/systems/stamina-system.js";

function createWorld(rows = 7, columns = 9) {
  return {
    rows,
    columns,
    terrain: Array.from({ length: rows }, (_, y) => Array.from({ length: columns }, (_, x) => ({
      walkable: x > 0 && y > 0 && x < columns - 1 && y < rows - 1,
    }))),
  };
}

function createHarness({ playerCell = { x: 6, y: 3 }, activeRealm = "Underground", world = createWorld() } = {}) {
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  const logs = [];
  const attacks = [];
  const damageEvents = [];
  let distanceFieldBuilds = 0;
  occupancy.claim({ id: "player", type: "player", glyph: "🤺", cell: playerCell, realm: activeRealm });
  const system = createEnemySystem({
    timeSystem,
    occupancy,
    getPlayerState: (realm) => realm === activeRealm ? { realm, cell: playerCell, world, alive: true } : null,
    damagePlayer: (amount) => attacks.push(amount),
    log: (message) => logs.push(message),
    onDamage: (entity, at) => damageEvents.push({ entity, at }),
    onDistanceFieldBuilt: () => { distanceFieldBuilds += 1; },
  });
  return { timeSystem, occupancy, system, logs, attacks, damageEvents, getDistanceFieldBuilds: () => distanceFieldBuilds };
}

test("creates spider enemies with 40 health, default facing, and derived age", () => {
  const harness = createHarness();
  const enemy = harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 7 });

  assert.equal(enemy.glyph, ENEMY_GLYPH);
  assert.equal(enemy.facing, DEFAULT_ENEMY_FACING);
  assert.equal(enemy.health, 40);
  assert.equal(enemy.maxHealth, 40);
  assert.equal(enemy.bornAtTime, 7);
  assert.equal(harness.system.getAge("enemy-1", 7), 0);
  assert.equal(harness.system.getAge("enemy-1", 8), 1);
});

test("waits until age two and then acts on every even age", () => {
  const harness = createHarness();
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance();
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 2, y: 3 });
  harness.timeSystem.advance();
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 3, y: 3 });
  assert.equal(harness.occupancy.get("enemy-1").facing, "right");
  harness.timeSystem.advance();
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 3, y: 3 });
  harness.timeSystem.advance();
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 4, y: 3 });
  assert.equal(harness.occupancy.get("enemy-1").facing, "right");
});

test("builds a reverse cardinal distance field around walls and rejects unreachable cells", () => {
  const world = createWorld(7, 9);
  for (let y = 1; y < 5; y += 1) world.terrain[y][4].walkable = false;
  const field = createCardinalDistanceField(world, { x: 6, y: 3 });

  assert.equal(field.getDistance({ x: 6, y: 3 }), 0);
  assert.ok(field.getDistance({ x: 2, y: 3 }) > 4);
  world.terrain[5][4].walkable = false;
  const blocked = createCardinalDistanceField(world, { x: 6, y: 3 });
  assert.equal(blocked.getDistance({ x: 2, y: 3 }), -1);
});

test("uses the allocation-free indexed blocker without invoking object-cell fallback scans", () => {
  const world = createWorld(64, 64);
  let indexedChecks = 0;
  const field = createCardinalDistanceField(world, { x: 32, y: 32 }, {
    isBlocked: () => { throw new Error("Object-cell blocker should not be used."); },
    isBlockedIndex: (x, y) => {
      indexedChecks += 1;
      return x === 30 && y === 32;
    },
  });

  assert.ok(field.getDistance({ x: 29, y: 32 }) > 3);
  assert.ok(indexedChecks <= world.rows * world.columns);
});

test("bounds per-tick flow-field work while leaving far enemies on the constant-time chase path", () => {
  const world = createWorld(512, 512);
  let indexedChecks = 0;
  const field = createCardinalDistanceField(world, { x: 256, y: 256 }, {
    maxDistance: ENEMY_NAVIGATION_RADIUS,
    isBlockedIndex: () => { indexedChecks += 1; return false; },
  });

  assert.equal(field.getDistance({ x: 256 + ENEMY_NAVIGATION_RADIUS, y: 256 }), ENEMY_NAVIGATION_RADIUS);
  assert.equal(field.getDistance({ x: 256 + ENEMY_NAVIGATION_RADIUS + 1, y: 256 }), -1);
  assert.ok(indexedChecks < 9_000);
});

test("far enemies use a constant-time step toward the player until they enter navigation range", () => {
  const world = createWorld(512, 512);
  const playerCell = { x: 400, y: 400 };
  const harness = createHarness({ playerCell, world });
  harness.system.addEnemy({ id: "enemy-far", realm: "Underground", cell: { x: 10, y: 10 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);

  assert.deepEqual(harness.occupancy.get("enemy-far").cell, { x: 11, y: 10 });
  assert.equal(harness.getDistanceFieldBuilds(), 0);
});

test("routes around a closed barrier with deterministic cardinal tie-breaking", () => {
  const world = createWorld(7, 9);
  world.terrain[3][3].walkable = false;
  const harness = createHarness({ world });
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 2, y: 2 });
});

test("builds one field for multiple enemies in the same realm and tick", () => {
  const harness = createHarness();
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 2 }, bornAtTime: 1 });
  harness.system.addEnemy({ id: "enemy-2", realm: "Underground", cell: { x: 2, y: 4 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.equal(harness.getDistanceFieldBuilds(), 1);
});

test("waits when another actor occupies the chosen step", () => {
  const harness = createHarness();
  harness.occupancy.claim({ id: "blocker", type: "enemy", glyph: "🕷️", cell: { x: 3, y: 3 } });
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 2, y: 3 });
});

test("ticks in an inactive realm without moving toward a cross-realm player", () => {
  const harness = createHarness({ activeRealm: "Overground" });
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(8);
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 2, y: 3 });
  assert.equal(harness.system.getAge("enemy-1", 9), 8);
});

test("attacks a cardinally adjacent player for five without sharing the cell", () => {
  const harness = createHarness({ playerCell: { x: 3, y: 3 } });
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.deepEqual(harness.attacks, [5]);
  assert.deepEqual(harness.occupancy.get("enemy-1").cell, { x: 2, y: 3 });
  assert.deepEqual(harness.occupancy.get("player").cell, { x: 3, y: 3 });
  assert.deepEqual(harness.logs, ["Enemy hit Player for -5 Health"]);
});

test("applies defense mitigation to an adjacent enemy attack", () => {
  const staminaSystem = createStaminaSystem({ initialStamina: 25 });
  const combatStatsSystem = createCombatStatsSystem({ staminaSystem });
  const harness = createHarness({ playerCell: { x: 3, y: 3 } });
  const attacks = [];
  const system = createEnemySystem({
    timeSystem: harness.timeSystem,
    occupancy: harness.occupancy,
    getPlayerState: () => ({
      realm: "Underground",
      cell: { x: 3, y: 3 },
      world: createWorld(),
      alive: true,
    }),
    damagePlayer: (amount) => attacks.push(amount),
    combatStatsSystem,
  });
  system.addEnemy({ id: "enemy-defense", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.deepEqual(attacks, [4]);
});

test("damages Player Lifecycle to zero and publishes death once", () => {
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  const lifecycle = createPlayerLifecycle();
  const deaths = [];
  lifecycle.subscribeToDeath((dead) => deaths.push(dead));
  occupancy.claim({ id: "player", type: "player", glyph: "🤺", cell: { x: 3, y: 3 }, realm: "Underground" });
  const world = createWorld();
  const system = createEnemySystem({
    timeSystem,
    occupancy,
    getPlayerState: () => ({ realm: "Underground", cell: { x: 3, y: 3 }, world, alive: !lifecycle.isDead() }),
    damagePlayer: (amount) => lifecycle.applyHealthDelta(-amount),
  });
  system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  timeSystem.advance(42);
  assert.equal(lifecycle.getHealth(), 0);
  assert.deepEqual(deaths, [true]);
  assert.deepEqual(occupancy.get("enemy-1").cell, { x: 2, y: 3 });
});

test("removes and unregisters an enemy permanently at zero health", () => {
  const harness = createHarness();
  harness.system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  assert.equal(harness.system.damage("enemy-1", 35, { attacker: "player", at: 10 })?.health, 5);
  assert.equal(harness.system.damage("enemy-1", 5, { attacker: "player", at: 20 }), null);
  harness.timeSystem.advance(10);
  assert.equal(harness.occupancy.get("enemy-1"), null);
  assert.deepEqual(harness.logs, ["Player hit Enemy for -35 Health", "Player hit Enemy for -5 Health", "Enemy died"]);
  assert.deepEqual(harness.damageEvents.map(({ entity, at }) => ({
    health: entity.health,
    previousHealth: entity.previousHealth,
    at,
  })), [
    { health: 5, previousHealth: 40, at: 10 },
    { health: 0, previousHealth: 5, at: 20 },
  ]);
});
