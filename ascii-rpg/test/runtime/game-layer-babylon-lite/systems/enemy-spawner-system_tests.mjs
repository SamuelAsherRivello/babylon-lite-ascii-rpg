import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicOccupancy } from "../../../../src/runtime/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import {
  createEnemySpawnerSystem,
  ENEMY_SPAWNER_GLYPH,
  selectEnemySpawnerCells,
} from "../../../../src/runtime/game-layer-babylon-lite/systems/enemy-spawner-system.js";
import { createEnemySystem } from "../../../../src/runtime/game-layer-babylon-lite/systems/enemy-system.js";
import { createTimeSystem } from "../../../../src/runtime/game-layer-babylon-lite/systems/time-system.js";

function createWorld(rows = 18, columns = 18) {
  return {
    rows,
    columns,
    playerStart: { x: 8, y: 8 },
    terrain: Array.from({ length: rows }, (_, y) => Array.from({ length: columns }, (_, x) => ({
      walkable: x > 0 && y > 0 && x < columns - 1 && y < rows - 1,
    }))),
    characters: Array.from({ length: rows }, () => Array(columns).fill(null)),
    objects: [],
    civilizationGroups: [],
  };
}

test("distributes at most one normal Underground spawner per 4x4 coarse region", () => {
  const world = createWorld();
  const first = selectEnemySpawnerCells(world, { realm: "Underground", random: () => 0.25 });
  const second = selectEnemySpawnerCells(world, { realm: "Underground", random: () => 0.25 });

  assert.equal(first.normalCells.length, 16);
  assert.equal(first.cells.length, 16);
  assert.deepEqual(first, second);
  assert.deepEqual(selectEnemySpawnerCells(world, { realm: "Overground", random: () => 0.25 }).cells, []);
});

test("excludes the player, object, character, and civilization cells", () => {
  const world = createWorld(7, 7);
  world.playerStart = { x: 1, y: 1 };
  world.objects.push({ active: true, cell: { x: 2, y: 1 } });
  world.characters[1][3] = "N";
  world.civilizationGroups.push({
    cells: [{ x: 4, y: 1 }],
    door: { x: 4, y: 1 },
    keys: [{ x: 5, y: 1 }],
  });

  const { cells } = selectEnemySpawnerCells(world, { realm: "Underground", random: () => 0 });
  const keys = new Set(cells.map(({ x, y }) => `${x},${y}`));
  for (const blocked of ["1,1", "2,1", "3,1", "4,1", "5,1"]) assert.equal(keys.has(blocked), false);
});

test("adds one optional development spawner within Euclidean distance five", () => {
  const world = createWorld();
  const disabled = selectEnemySpawnerCells(world, { realm: "Underground", random: () => 0 });
  const enabled = selectEnemySpawnerCells(world, {
    realm: "Underground",
    random: () => 0,
    includeDevelopmentBonus: true,
  });

  assert.equal(disabled.bonusCell, null);
  assert.ok(enabled.bonusCell);
  assert.equal(enabled.cells.length, enabled.normalCells.length + 1);
  assert.ok(Math.hypot(enabled.bonusCell.x - world.playerStart.x, enabled.bonusCell.y - world.playerStart.y) <= 5);
});

test("omits the development bonus when no nearby candidate is valid", () => {
  const world = createWorld(9, 9);
  for (const row of world.terrain) for (const cell of row) cell.walkable = false;
  world.terrain[7][7].walkable = true;

  const distribution = selectEnemySpawnerCells(world, {
    realm: "Underground",
    random: () => 0,
    includeDevelopmentBonus: true,
  });

  assert.equal(distribution.bonusCell, null);
});

function createHarness({ validCells = null, random = () => 0 } = {}) {
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  const spawned = [];
  const logs = [];
  const damageEvents = [];
  const system = createEnemySpawnerSystem({
    timeSystem,
    occupancy,
    isWalkable: (cell) => !validCells || validCells.has(`${cell.x},${cell.y}`),
    isStaticOccupied: () => false,
    randomFor: () => random,
    spawnEnemy: (request) => {
      spawned.push(request);
      return true;
    },
    log: (message) => logs.push(message),
    onDamage: (entity, at) => damageEvents.push({ entity, at }),
  });
  return { timeSystem, occupancy, spawned, logs, damageEvents, system };
}

test("spawns at time 1 and every 30 units without deferred backlog", () => {
  const harness = createHarness();
  harness.system.addSpawner({ id: "spawner-1", realm: "Underground", cell: { x: 5, y: 5 }, bornAtTime: 1 });

  harness.timeSystem.dispatchCurrent();
  assert.deepEqual(harness.spawned.map(({ bornAtTime }) => bornAtTime), [1]);
  harness.timeSystem.advance(29);
  assert.equal(harness.spawned.length, 1);
  harness.timeSystem.advance();
  assert.deepEqual(harness.spawned.map(({ bornAtTime }) => bornAtTime), [1, 31]);
  harness.timeSystem.advance(30);
  assert.deepEqual(harness.spawned.map(({ bornAtTime }) => bornAtTime), [1, 31, 61]);
});

test("uses the sole valid neighboring cell and skips an all-blocked attempt", () => {
  const validCells = new Set(["6,5"]);
  const harness = createHarness({ validCells });
  harness.system.addSpawner({ id: "spawner-1", realm: "Underground", cell: { x: 5, y: 5 } });

  harness.timeSystem.dispatchCurrent();
  assert.deepEqual(harness.spawned[0].cell, { x: 6, y: 5 });
  validCells.clear();
  harness.timeSystem.advance(30);
  assert.equal(harness.spawned.length, 1);
});

test("selects multiple neighboring candidates deterministically", () => {
  const first = createHarness({ random: () => 0.75 });
  const second = createHarness({ random: () => 0.75 });
  for (const harness of [first, second]) {
    harness.system.addSpawner({ id: "spawner-1", realm: "Underground", cell: { x: 5, y: 5 } });
    harness.timeSystem.dispatchCurrent();
  }

  assert.deepEqual(first.spawned[0].cell, second.spawned[0].cell);
});

test("has red-S identity, 100 health, and permanently stops after death", () => {
  const harness = createHarness();
  const spawner = harness.system.addSpawner({ id: "spawner-1", realm: "Underground", cell: { x: 5, y: 5 } });
  assert.equal(spawner.glyph, ENEMY_SPAWNER_GLYPH);
  assert.equal(spawner.health, 100);
  assert.equal(spawner.maxHealth, 100);

  harness.timeSystem.dispatchCurrent();
  assert.equal(harness.system.damage("spawner-1", 95, { attacker: "player", at: 10 })?.health, 5);
  assert.equal(harness.system.damage("spawner-1", 5, { attacker: "player", at: 20 }), null);
  assert.equal(harness.occupancy.get("spawner-1"), null);
  harness.timeSystem.advance(60);
  assert.equal(harness.spawned.length, 1);
  assert.deepEqual(harness.logs, ["Player hit Enemy Spawner for -95 Health", "Player hit Enemy Spawner for -5 Health", "Enemy Spawner died"]);
  assert.deepEqual(harness.damageEvents.map(({ entity, at }) => ({
    health: entity.health,
    previousHealth: entity.previousHealth,
    at,
  })), [
    { health: 5, previousHealth: 100, at: 10 },
    { health: 0, previousHealth: 5, at: 20 },
  ]);
});

test("keeps earlier enemies independently registered across multiple spawn cadences", () => {
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  const enemySystem = createEnemySystem({
    timeSystem,
    occupancy,
    getPlayerState: () => null,
  });
  const spawnerSystem = createEnemySpawnerSystem({
    timeSystem,
    occupancy,
    spawnEnemy: (request) => enemySystem.addEnemy(request),
    isWalkable: () => true,
    randomFor: () => () => 0,
  });
  spawnerSystem.addSpawner({ id: "spawner-1", realm: "Underground", cell: { x: 5, y: 5 } });

  timeSystem.dispatchCurrent();
  timeSystem.advance(60);

  const enemies = occupancy.getAll("enemy");
  assert.equal(enemies.length, 3);
  assert.deepEqual(enemies.map((enemy) => enemySystem.getAge(enemy.id, 61)), [60, 30, 0]);
});
