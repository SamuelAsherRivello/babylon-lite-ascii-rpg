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
import { AStarUtility } from "../../../../src/client/game-layer-babylon-lite/utilities/a-star-utility.js";

function createWorld(rows = 7, columns = 9) {
  return {
    rows,
    columns,
    terrain: Array.from({ length: rows }, (_, y) => Array.from({ length: columns }, (_, x) => ({
      walkable: x > 0 && y > 0 && x < columns - 1 && y < rows - 1,
    }))),
  };
}

function createHarness({ playerCell = { x: 6, y: 3 }, activeRealm = "Underground", world = createWorld(), npcTargets = [] } = {}) {
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  const logs = [];
  const attacks = [];
  const damageEvents = [];
  let distanceFieldBuilds = 0;
  occupancy.claim({ id: "player", type: "player", glyph: "👤", cell: playerCell, realm: activeRealm });
  const system = createEnemySystem({
    timeSystem,
    occupancy,
    getNpcTargets: () => npcTargets,
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

test("far enemies reuse valid routes, honor realm blockers, and rebuild after navigation changes", () => {
  const world = createWorld(128, 128);
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  let revision = 0;
  let builds = 0;
  let blocked = null;
  const original = AStarUtility.findHierarchicalPath;
  AStarUtility.findHierarchicalPath = function (...args) { builds += 1; return original.apply(this, args); };
  try {
    const system = createEnemySystem({
      timeSystem, occupancy,
      getPlayerState: () => ({ world, realm: "Underground", alive: true, cell: { x: 110, y: 110 } }),
      getNavigationRevision: () => revision,
      isStaticOccupied: cell => cell.x === blocked?.x && cell.y === blocked?.y,
      isStaticOccupiedIndex: (x, y, realm) => {
        assert.equal(realm, "Underground");
        return x === blocked?.x && y === blocked?.y;
      },
    });
    system.addEnemy({ id: "far", realm: "Underground", cell: { x: 10, y: 10 } });
    timeSystem.advance(2);
    assert.equal(builds, 1);
    assert.deepEqual(occupancy.get("far").cell, { x: 11, y: 10 });
    timeSystem.advance(2);
    assert.equal(builds, 1);
    assert.deepEqual(occupancy.get("far").cell, { x: 12, y: 10 });
    blocked = { x: 13, y: 10 };
    revision += 1;
    timeSystem.advance(2);
    assert.equal(builds, 2);
    assert.notDeepEqual(occupancy.get("far").cell, blocked);
  } finally { AStarUtility.findHierarchicalPath = original; }
});

test("far enemies request a fresh segment when their cached path ends", () => {
  const world = createWorld(128, 128);
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  let builds = 0;
  const original = AStarUtility.findHierarchicalPath;
  AStarUtility.findHierarchicalPath = (_world, from) => {
    builds += 1;
    return { path: [from, { x: from.x + 1, y: from.y }, { x: from.x + 2, y: from.y }] };
  };
  try {
    const system = createEnemySystem({ timeSystem, occupancy,
      getPlayerState: () => ({ world, realm: "Underground", alive: true, cell: { x: 110, y: 110 } }),
      getNavigationRevision: () => 0 });
    system.addEnemy({ id: "far", realm: "Underground", cell: { x: 10, y: 10 } });
    timeSystem.advance(6);
    assert.equal(builds, 2);
    assert.deepEqual(occupancy.get("far").cell, { x: 13, y: 10 });
  } finally { AStarUtility.findHierarchicalPath = original; }
});

test("far enemies cache a no-step result until its navigation revision changes", () => {
  const world = createWorld(128, 128);
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  let builds = 0;
  let revision = 0;
  const original = AStarUtility.findHierarchicalPath;
  AStarUtility.findHierarchicalPath = (_world, from) => { builds += 1; return { path: [from] }; };
  try {
    const system = createEnemySystem({ timeSystem, occupancy,
      getPlayerState: () => ({ world, realm: "Underground", alive: true, cell: { x: 110, y: 110 } }),
      getNavigationRevision: () => revision });
    system.addEnemy({ id: "far", realm: "Underground", cell: { x: 10, y: 10 } });
    timeSystem.advance(8);
    assert.equal(builds, 1);
    revision += 1;
    timeSystem.advance(2);
    assert.equal(builds, 2);
    assert.deepEqual(occupancy.get("far").cell, { x: 10, y: 10 });
  } finally { AStarUtility.findHierarchicalPath = original; }
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

test("revision-aware fields reuse identical targets across ticks and invalidate changed terrain", () => {
  const world = createWorld();
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  let builds = 0;
  let revision = 0;
  let cell = { x: 6, y: 6 };
  const system = createEnemySystem({ timeSystem, occupancy,
    getPlayerState: () => ({ world, realm: "Underground", alive: true, cell }),
    getNavigationRevision: () => revision,
    onDistanceFieldBuilt: () => { builds += 1; } });
  system.addEnemy({ id: "near", realm: "Underground", cell: { x: 0, y: 0 } });
  timeSystem.advance(4);
  assert.equal(builds, 1);
  revision += 1;
  timeSystem.advance(2);
  assert.equal(builds, 2);
  cell = { x: 5, y: 6 };
  timeSystem.advance(2);
  assert.equal(builds, 3);
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

test("pursues and attacks the nearest living NPC before the player", () => {
  const npc = { id: "npc-near", type: "npc", realm: "Underground", cell: { x: 4, y: 3 }, health: 100, dead: false };
  const harness = createHarness({ playerCell: { x: 6, y: 3 }, npcTargets: [npc] });
  const npcDamage = [];
  const system = createEnemySystem({
    timeSystem: harness.timeSystem,
    occupancy: harness.occupancy,
    getPlayerState: () => ({ realm: "Underground", cell: { x: 6, y: 3 }, world: createWorld(), alive: true }),
    getNpcTargets: () => [npc],
    damageNpc: (id, amount) => npcDamage.push({ id, amount }),
  });
  system.addEnemy({ id: "enemy-npc", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.deepEqual(harness.occupancy.get("enemy-npc").cell, { x: 3, y: 3 });
  harness.timeSystem.advance(2);
  assert.deepEqual(npcDamage, [{ id: "npc-near", amount: 5 }]);
  assert.deepEqual(harness.occupancy.get("enemy-npc").cell, { x: 3, y: 3 });
});

test("prefers the player when NPC and player are equally distant", () => {
  const npc = { id: "npc-tie", type: "npc", realm: "Underground", cell: { x: 4, y: 3 }, health: 100, dead: false };
  const harness = createHarness({ playerCell: { x: 2, y: 3 }, npcTargets: [npc] });
  const playerDamage = [];
  const npcDamage = [];
  const system = createEnemySystem({
    timeSystem: harness.timeSystem,
    occupancy: harness.occupancy,
    getPlayerState: () => ({ realm: "Underground", cell: { x: 2, y: 3 }, world: createWorld(), alive: true }),
    getNpcTargets: () => [npc],
    damagePlayer: amount => playerDamage.push(amount),
    damageNpc: (id, amount) => npcDamage.push({ id, amount }),
  });
  system.addEnemy({ id: "enemy-tie", realm: "Underground", cell: { x: 3, y: 3 }, bornAtTime: 1 });

  harness.timeSystem.advance(2);
  assert.deepEqual(playerDamage, [5]);
  assert.deepEqual(npcDamage, []);
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
  occupancy.claim({ id: "player", type: "player", glyph: "👤", cell: { x: 3, y: 3 }, realm: "Underground" });
  const world = createWorld();
  const system = createEnemySystem({
    timeSystem,
    occupancy,
    getPlayerState: () => ({ realm: "Underground", cell: { x: 3, y: 3 }, world, alive: !lifecycle.isDead() }),
    damagePlayer: (amount) => lifecycle.applyHealthDelta(-amount),
  });
  system.addEnemy({ id: "enemy-1", realm: "Underground", cell: { x: 2, y: 3 }, bornAtTime: 1 });

  timeSystem.advance(52);
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
