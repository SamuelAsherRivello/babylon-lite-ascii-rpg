import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicOccupancy } from "../../../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import { createNpcSystem, NPC_GLYPH } from "../../../../src/client/game-layer-babylon-lite/systems/npc-system.js";
import { createNpcSpawnerSystem, selectNpcSpawnerCells } from "../../../../src/client/game-layer-babylon-lite/systems/npc-spawner-system.js";
import { createTimeSystem } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";

function world(size = 40) {
  return { rows: size, columns: size, playerStart: { x: 20, y: 20 }, objects: [], terrain: Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => ({ walkable: x > 0 && y > 0 && x < size - 1 && y < size - 1 }))) };
}

test("selects deterministic Low, Med, and High Overground spawner counts including one near player start and rejects Underground", () => {
  const map = world(80);
  for (const [density, count] of Object.entries({ Low: 4, Med: 8, High: 12 })) {
    const first = selectNpcSpawnerCells(map, { realm: "Overground", count, random: () => 0.25 });
    assert.deepEqual(first, selectNpcSpawnerCells(map, { realm: "Overground", count, random: () => 0.25 }), density);
    assert.equal(first.cells.length, count, density);
    assert.ok(first.cells.some((cell) => Math.abs(cell.x - map.playerStart.x) + Math.abs(cell.y - map.playerStart.y) <= 50), density);
  }
  assert.deepEqual(selectNpcSpawnerCells(map, { realm: "Underground" }).cells, []);
});

test("excludes player, object, character, and civilization cells", () => {
  const map = world(9); map.playerStart = { x: 1, y: 1 }; map.characters = Array.from({ length: 9 }, () => Array(9).fill(null));
  map.objects.push({ active: true, cell: { x: 2, y: 1 } }); map.characters[1][3] = "X";
  map.civilizationGroups = [{ cells: [{ x: 4, y: 1 }], keys: [{ x: 5, y: 1 }], door: { x: 6, y: 1 } }];
  const keys = new Set(selectNpcSpawnerCells(map, { realm: "Overground", random: () => 0 }).cells.map((cell) => `${cell.x},${cell.y}`));
  for (const blocked of ["1,1", "2,1", "3,1", "4,1", "5,1", "6,1"]) assert.equal(keys.has(blocked), false);
});

test("spawners create exactly once during setup and never repeat on later ticks", () => {
  const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const spawned = [];
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => { spawned.push(request); return request; }, isWalkable: () => true, randomFor: () => () => 0 });
  spawners.addSpawner({ id: "npc-spawner-1", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(spawned.length, 1);
  timeSystem.dispatchCurrent(); timeSystem.advance(200); assert.equal(spawned.length, 1);
});

test("spawner remains empty when its setup spawn is blocked", () => {
  const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const spawned = [];
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => { spawned.push(request); return request; }, isWalkable: () => true, randomFor: () => () => 0 });
  for (const cell of [{ x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 9, y: 10 }, { x: 11, y: 10 }, { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 }]) occupancy.claim({ id: `block-${cell.x}-${cell.y}`, type: "player", cell });
  spawners.addSpawner({ id: "npc-spawner-1", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(spawned.length, 0);
  timeSystem.advance(20);
  assert.equal(spawned.length, 0);
});

test("spawner does not create an NPC in a walkable pocket without a patrol route", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const spawned = [];
  for (let y = 0; y < map.rows; y += 1) for (let x = 0; x < map.columns; x += 1) map.terrain[y][x].walkable = false;
  for (const cell of [{ x: 10, y: 10 }, { x: 10, y: 9 }, { x: 11, y: 10 }, { x: 10, y: 11 }, { x: 9, y: 10 }]) map.terrain[cell.y][cell.x].walkable = true;
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => { spawned.push(request); return request; }, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0 });
  spawners.addSpawner({ id: "npc-spawner-1", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(spawned.length, 0);
});

test("NPC chooses either requested patrol distance and returns home without re-randomizing", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  let randomCalls = 0;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => { randomCalls += 1; return 0; } });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  assert.equal(randomCalls, 2);
  assert.equal(occupancy.get("npc-1").route.length, 15);
  timeSystem.advance();
  const npc = occupancy.get("npc-1");
  assert.equal(npc.glyph, NPC_GLYPH);
  assert.ok(npc.destination);
  const distance = Math.abs(npc.destination.x - npc.home.x) + Math.abs(npc.destination.y - npc.home.y);
  assert.equal(distance, 15);
  const destination = npc.destination;
  timeSystem.advance(14);
  assert.deepEqual(occupancy.get("npc-1").cell, destination);
  assert.equal(occupancy.get("npc-1").returning, true);
  timeSystem.advance(15);
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 20 });
  assert.deepEqual(occupancy.get("npc-1").destination, destination);
  assert.equal(randomCalls, 2);
});

test("NPC waits for a temporary occupant and does not walk through static terrain", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  for (let y = 0; y < map.rows; y += 1) for (let x = 0; x < map.columns; x += 1) map.terrain[y][x].walkable = x === 20 && y > 0 && y < map.rows - 1;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0 });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  occupancy.claim({ id: "player", type: "player", cell: { x: 20, y: 19 } });
  timeSystem.advance();
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 20 });
  occupancy.remove("player");
  timeSystem.advance();
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 19 });
});
