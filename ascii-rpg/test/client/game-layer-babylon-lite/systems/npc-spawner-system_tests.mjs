import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicOccupancy } from "../../../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import { createNpcSystem, NPC_ACTION_INTERVAL, NPC_GLYPH } from "../../../../src/client/game-layer-babylon-lite/systems/npc-system.js";
import { createNpcSpawnerSystem, selectNpcSpawnerCells } from "../../../../src/client/game-layer-babylon-lite/systems/npc-spawner-system.js";
import { createTimeSystem } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { createDeferredWorkScheduler } from "../../../../src/client/game-layer-babylon-lite/deferred-work-scheduler.js";

function world(size = 40) {
  return { rows: size, columns: size, playerStart: { x: 20, y: 20 }, objects: [], terrain: Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => ({ walkable: x > 0 && y > 0 && x < size - 1 && y < size - 1 }))) };
}

function createControlledDeferredScheduler() {
  const frames = [];
  let visible = true;
  const scheduler = createDeferredWorkScheduler({
    scheduleFrame: (callback) => { frames.push(callback); return callback; },
    cancelFrame: () => {},
    now: () => 0,
    isVisible: () => visible,
    presentationFrames: 2,
  });
  return Object.freeze({
    scheduler,
    setVisible(next) { visible = next; },
    flush(limit = 256) { for (let index = 0; frames.length && index < limit; index += 1) frames.shift()(); },
  });
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

test("excludes player, object, character, civilization, and Building cells", () => {
  const map = world(9); map.playerStart = { x: 1, y: 1 }; map.characters = Array.from({ length: 9 }, () => Array(9).fill(null));
  map.objects.push({ active: true, cell: { x: 2, y: 1 } }); map.characters[1][3] = "X";
  map.civilizationGroups = [{ cells: [{ x: 4, y: 1 }], keys: [{ x: 5, y: 1 }], door: { x: 6, y: 1 } }];
  map.buildings = [{ cells: [{ x: 7, y: 1 }], key: { x: 1, y: 2 } }];
  const keys = new Set(selectNpcSpawnerCells(map, { realm: "Overground", random: () => 0 }).cells.map((cell) => `${cell.x},${cell.y}`));
  for (const blocked of ["1,1", "2,1", "3,1", "4,1", "5,1", "6,1", "7,1", "1,2"]) assert.equal(keys.has(blocked), false);
});

test("spawners create exactly once during setup and never repeat on later ticks", () => {
  const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const spawned = [];
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => { spawned.push(request); return request; }, isWalkable: () => true, randomFor: () => () => 0 });
  spawners.addSpawner({ id: "npc-spawner-1", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(spawned.length, 1);
  timeSystem.dispatchCurrent(); timeSystem.advance(200); assert.equal(spawned.length, 1);
});

test("NPCs start unrecruited and can be removed to become passable", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: () => true, randomFor: () => () => 0 });
  const npc = system.addNpc({ id: "npc-recruit", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(npc.recruited, false);
  assert.equal(occupancy.get("npc-recruit")?.type, "npc");
  assert.equal(system.removeNpc("npc-recruit"), true);
  assert.equal(occupancy.get("npc-recruit"), null);
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

test("NPC randomly samples a walkable patrol grid spot 15 to 20 cells from home and returns without re-randomizing", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  let randomCalls = 0;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => { randomCalls += 1; return 0; } });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  assert.equal(randomCalls, 1);
  assert.equal(occupancy.get("npc-1").route.length, 15);
  timeSystem.advance(NPC_ACTION_INTERVAL - 1);
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 20 });
  timeSystem.advance();
  const npc = occupancy.get("npc-1");
  assert.equal(npc.glyph, NPC_GLYPH);
  assert.ok(npc.destination);
  assert.equal(map.terrain[npc.destination.y][npc.destination.x].walkable, true);
  const distance = Math.abs(npc.destination.x - npc.home.x) + Math.abs(npc.destination.y - npc.home.y);
  assert.equal(distance, 15);
  const destination = npc.destination;
  timeSystem.advance(NPC_ACTION_INTERVAL * 14);
  assert.deepEqual(occupancy.get("npc-1").cell, destination);
  assert.equal(occupancy.get("npc-1").returning, true);
  timeSystem.advance(NPC_ACTION_INTERVAL * 15);
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 20 });
  assert.deepEqual(occupancy.get("npc-1").destination, destination);
  assert.equal(randomCalls, 1);
});

test("deferred NPC patrol planning preserves immediate placement and executes one already-due action after presentation", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const deferred = createControlledDeferredScheduler();
  let randomCalls = 0;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => { randomCalls += 1; return 0; }, deferredScheduler: deferred.scheduler });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  assert.equal(system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 21, y: 20 } }), null);
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 20 });
  assert.equal(occupancy.get("npc-1").patrolState, "pending");
  assert.equal(randomCalls, 0);
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.equal(occupancy.get("npc-1").pendingActionAt, timeSystem.getTime());
  deferred.flush();
  const npc = occupancy.get("npc-1");
  assert.equal(npc.patrolState, "ready");
  assert.equal(randomCalls, 1);
  assert.equal(npc.route.length, 15);
  assert.equal(Math.abs(npc.cell.x - 20) + Math.abs(npc.cell.y - 20), 1);
  timeSystem.advance();
  assert.deepEqual(occupancy.get("npc-1").cell, npc.cell);
});

test("disposing an NPC system cancels its deferred patrol before it can mutate occupancy", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const deferred = createControlledDeferredScheduler();
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0, deferredScheduler: deferred.scheduler });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  system.dispose();
  deferred.flush();
  assert.equal(occupancy.get("npc-1").patrolState, "pending");
  assert.equal(occupancy.get("npc-1").route.length, 0);
});

test("a first patrol action is identical whether its bounded preparation is ready early or finishes at the due tick", () => {
  const run = ({ delayPreparation }) => {
    const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const deferred = createControlledDeferredScheduler();
    const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0, deferredScheduler: deferred.scheduler });
    system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
    if (delayPreparation) timeSystem.advance(NPC_ACTION_INTERVAL);
    else deferred.flush();
    if (!delayPreparation) timeSystem.advance(NPC_ACTION_INTERVAL);
    else deferred.flush();
    const npc = occupancy.get("npc-1");
    return { cell: npc.cell, destination: npc.destination, route: npc.route, routeIndex: npc.routeIndex, returning: npc.returning, bornAtTime: npc.bornAtTime, pendingActionAt: npc.pendingActionAt };
  };
  assert.deepEqual(run({ delayPreparation: false }), run({ delayPreparation: true }));
});

test("deferred patrol exhausts its bounded candidates against current terrain without rebuilding a full navigation grid", () => {
  const map = world(64); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const deferred = createControlledDeferredScheduler();
  let randomCalls = 0;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => { randomCalls += 1; return 0; }, deferredScheduler: deferred.scheduler });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 32, y: 32 } });
  // A terrain change before preparation starts leaves valid destination cells,
  // but makes every route from the claimed initial cell unreachable.
  for (let x = 31; x <= 33; x += 1) for (let y = 31; y <= 33; y += 1) if (x !== 32 || y !== 32) map.terrain[y][x].walkable = false;
  deferred.flush();
  const npc = occupancy.get("npc-1");
  assert.equal(randomCalls, 32);
  assert.equal(npc.patrolState, "ready");
  assert.equal(npc.destination, null);
  assert.deepEqual(npc.route, []);
  assert.equal(deferred.scheduler.snapshot().pending, 0);
});

test("deferred patrol pauses outside its realm and cannot publish after its NPC is removed", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const deferred = createControlledDeferredScheduler();
  let realmActive = false;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0, deferredScheduler: deferred.scheduler, isRealmActive: () => realmActive });
  system.addNpc({ id: "paused", realm: "Overground", cell: { x: 20, y: 20 } });
  deferred.flush(3);
  assert.equal(occupancy.get("paused").patrolState, "pending");
  assert.equal(deferred.scheduler.snapshot().pending, 1);
  realmActive = true;
  deferred.flush();
  assert.equal(occupancy.get("paused").patrolState, "ready");
  system.addNpc({ id: "removed", realm: "Overground", cell: { x: 21, y: 20 } });
  assert.equal(system.removeNpc("removed"), true);
  deferred.flush();
  assert.equal(occupancy.get("removed"), null);
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.equal(occupancy.get("removed"), null);
});

test("NPC rejects an unreachable random patrol destination and samples another", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  for (let x = 1; x < map.columns - 1; x += 1) map.terrain[30][x].walkable = false;
  const values = [0, 0];
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => values.shift() ?? 0 });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  const npc = occupancy.get("npc-1");
  assert.deepEqual(npc.destination, { x: 20, y: 5 });
  assert.equal(npc.route.length, 15);
});

test("NPC waits for a temporary occupant and does not walk through static terrain", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  for (let y = 0; y < map.rows; y += 1) for (let x = 0; x < map.columns; x += 1) map.terrain[y][x].walkable = x === 20 && y > 0 && y < map.rows - 1;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0.125 });
  system.addNpc({ id: "npc-1", realm: "Overground", cell: { x: 20, y: 20 } });
  occupancy.claim({ id: "player", type: "player", cell: { x: 20, y: 19 } });
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 20 });
  occupancy.remove("player");
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.deepEqual(occupancy.get("npc-1").cell, { x: 20, y: 19 });
});
