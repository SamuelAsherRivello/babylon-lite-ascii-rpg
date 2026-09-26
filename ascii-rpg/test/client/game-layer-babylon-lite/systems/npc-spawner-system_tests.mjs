import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicOccupancy } from "../../../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import { createNpcSystem, NPC_ACTION_INTERVAL, NPC_FOLLOW_DISTANCE, NPC_FOLLOW_MAX_DISTANCE, NPC_GLYPH, NPC_HEALTH } from "../../../../src/client/game-layer-babylon-lite/systems/npc-system.js";
import { createEnemySystem } from "../../../../src/client/game-layer-babylon-lite/systems/enemy-system.js";
import { createNpcSpawnerSystem, selectNpcSpawnerCells } from "../../../../src/client/game-layer-babylon-lite/systems/npc-spawner-system.js";
import { createTimeSystem } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { createDeferredWorkScheduler } from "../../../../src/client/game-layer-babylon-lite/deferred-work-scheduler.js";
import { AStarUtility } from "../../../../src/client/game-layer-babylon-lite/utilities/a-star-utility.js";

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
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const spawned = [];
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => { spawned.push(request); return request; }, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0 });
  spawners.addSpawner({ id: "npc-spawner-1", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0].spawnerId, "npc-spawner-1");
  assert.deepEqual(spawned[0].patrolAnchor, { x: 10, y: 10 });
  timeSystem.dispatchCurrent(); timeSystem.advance(200); assert.equal(spawned.length, 1);
});

test("bomb damage removes an NPC spawner while its already-created NPC survives", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const npcSystem = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable) });
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => npcSystem.addNpc(request), worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), isStaticOccupied: () => false, randomFor: () => () => 0 });
  spawners.addSpawner({ id: "npc-spawner-1", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(occupancy.get("npc-1").health, 100);
  assert.equal(occupancy.get("npc-spawner-1").health, 100);
  spawners.damage("npc-spawner-1", 100);
  assert.equal(occupancy.get("npc-spawner-1"), null);
  assert.equal(occupancy.get("npc-1").type, "npc");
  assert.equal(npcSystem.damage("npc-1", 100), null);
  assert.equal(occupancy.get("npc-1"), null);
});

test("an NPC wakes 10 to 15 path cells from its spawner, patrols to its approach, and repeats", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const npcSystem = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable) });
  const spawners = createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc: (request) => npcSystem.addNpc(request), worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => 0 });
  const spawnerCell = { x: 20, y: 20 };
  spawners.addSpawner({ id: "npc-spawner-route", realm: "Overground", cell: spawnerCell });
  const npc = occupancy.get("npc-1");
  const distance = AStarUtility.createDistanceField(map, spawnerCell, { maxDistance: 15 }).getDistance(npc.cell);
  assert.ok(distance >= 10 && distance <= 15);
  assert.deepEqual(npc.home, npc.cell);
  assert.deepEqual(npc.patrolAnchor, spawnerCell);
  const initialEndpoint = npc.home;
  const firstStep = npc.route[0];
  occupancy.claim({ id: "temporary-blocker", type: "player", cell: firstStep });
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.deepEqual(occupancy.get(npc.id).cell, initialEndpoint);
  occupancy.remove("temporary-blocker");
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.deepEqual(occupancy.get(npc.id).cell, firstStep);
  timeSystem.advance(NPC_ACTION_INTERVAL * (npc.route.length - 1));
  assert.deepEqual(occupancy.get(npc.id).cell, npc.destination);
  assert.equal(occupancy.get(npc.id).returning, true);
  timeSystem.advance(NPC_ACTION_INTERVAL * npc.route.length);
  assert.deepEqual(occupancy.get(npc.id).cell, initialEndpoint);
  assert.equal(occupancy.get(npc.id).returning, false);
  timeSystem.advance(NPC_ACTION_INTERVAL);
  assert.deepEqual(occupancy.get(npc.id).cell, firstStep);
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

test("recruited NPCs follow three cells behind the player and are removed at zero health", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  let playerCell = { x: 20, y: 10 };
  const system = createNpcSystem({
    timeSystem,
    occupancy,
    worldFor: () => map,
    getPlayerState: () => ({ cell: playerCell, facing: "right", alive: true }),
    isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable),
  });
  system.addNpc({ id: "npc-follow", realm: "Overground", cell: { x: 10, y: 10 } });
  assert.equal(occupancy.get("npc-follow").health, NPC_HEALTH);
  assert.equal(system.recruitNpc("npc-follow"), true);
  for (let step = 0; step < 7; step += 1) timeSystem.advance(NPC_ACTION_INTERVAL);
  const followDistance = Math.abs(occupancy.get("npc-follow").cell.x - playerCell.x);
  assert.ok(followDistance >= NPC_FOLLOW_DISTANCE && followDistance <= NPC_FOLLOW_MAX_DISTANCE);
  const npcCell = occupancy.get("npc-follow").cell;
  assert.equal(system.damageNpc("npc-follow", NPC_HEALTH), null);
  assert.equal(occupancy.get("npc-follow"), null);
  assert.equal(occupancy.isOccupied(npcCell), false);
});

test("enemy damage updates ambient and recruited NPC health through shared realm occupancy", () => {
  const map = world(); const timeSystem = createTimeSystem();
  const overgroundOccupancy = createDynamicOccupancy(); const undergroundOccupancy = createDynamicOccupancy();
  const occupancies = new Map([["Overground", overgroundOccupancy], ["Underground", undergroundOccupancy]]);
  const npcSystem = createNpcSystem({
    timeSystem,
    occupancy: overgroundOccupancy,
    occupancyFor: (realm = null) => realm ? occupancies.get(realm) : occupancies.values(),
    worldFor: () => map,
    isWalkable: () => true,
  });
  const createEnemy = (occupancy, realm, playerCell) => createEnemySystem({
    timeSystem,
    occupancy,
    getPlayerState: () => ({ realm, cell: playerCell, world: map, alive: true }),
    getNpcTargets: () => occupancy.getAll("npc"),
    damageNpc: (id, amount, options) => npcSystem.damage(id, amount, options),
  });

  npcSystem.addNpc({ id: "npc-ambient", realm: "Overground", cell: { x: 3, y: 3 }, bornAtTime: 1 });
  const overgroundEnemy = createEnemy(overgroundOccupancy, "Overground", { x: 7, y: 3 });
  overgroundEnemy.addEnemy({ id: "enemy-ambient", realm: "Overground", cell: { x: 2, y: 3 }, bornAtTime: 1 });
  timeSystem.advance(2);
  assert.equal(overgroundOccupancy.get("npc-ambient").health, 95);

  npcSystem.addNpc({ id: "npc-party", realm: "Overground", cell: { x: 10, y: 10 }, bornAtTime: 3 });
  npcSystem.recruitNpc("npc-party");
  assert.equal(npcSystem.transferParty("Underground", { x: 6, y: 3 }), true);
  const partyNpc = undergroundOccupancy.get("npc-party");
  const undergroundEnemy = createEnemy(undergroundOccupancy, "Underground", { x: 9, y: 3 });
  undergroundEnemy.addEnemy({ id: "enemy-party", realm: "Underground", cell: { x: partyNpc.cell.x - 1, y: partyNpc.cell.y }, bornAtTime: 3 });
  timeSystem.advance(2);
  assert.equal(undergroundOccupancy.get("npc-party").health, 95);
});

test("recruited NPCs catch up one step per frame only while farther than five cells", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const playerCell = { x: 30, y: 10 };
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, getPlayerState: () => ({ cell: playerCell, facing: "right", alive: true }), isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable) });
  system.addNpc({ id: "npc-frame-follow", realm: "Overground", cell: { x: 10, y: 10 } });
  system.recruitNpc("npc-frame-follow");
  assert.equal(system.updateFollowers(), true);
  const first = occupancy.get("npc-frame-follow").cell;
  assert.equal(Math.abs(first.x - playerCell.x) + Math.abs(first.y - playerCell.y), 19);
  for (let frame = 0; frame < 14; frame += 1) system.updateFollowers();
  const close = occupancy.get("npc-frame-follow").cell;
  const distance = Math.abs(close.x - playerCell.x) + Math.abs(close.y - playerCell.y);
  assert.ok(distance >= NPC_FOLLOW_DISTANCE && distance <= NPC_FOLLOW_MAX_DISTANCE);
  const before = close;
  assert.equal(system.updateFollowers(), false);
  assert.deepEqual(occupancy.get("npc-frame-follow").cell, before);
});

test("recruited NPC followers prefer one empty grid cell between peers", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const playerCell = { x: 30, y: 20 };
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, getPlayerState: () => ({ cell: playerCell, facing: "right", alive: true }), isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable) });
  const first = system.addNpc({ id: "npc-spacing-1", realm: "Overground", cell: { x: 10, y: 20 } });
  const second = system.addNpc({ id: "npc-spacing-2", realm: "Overground", cell: { x: 10, y: 21 } });
  system.recruitNpc(first.id); system.recruitNpc(second.id);
  system.updateFollowers(); system.updateFollowers();
  const party = [occupancy.get(first.id), occupancy.get(second.id)];
  assert.ok(Math.abs(party[0].cell.x - party[1].cell.x) + Math.abs(party[0].cell.y - party[1].cell.y) >= 2);
});

test("recruited NPC followers accept adjacent legal cells when one-space separation is impossible", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const playerCell = { x: 20, y: 20 };
  for (let y = 1; y < map.rows - 1; y += 1) for (let x = 1; x < map.columns - 1; x += 1) map.terrain[y][x].walkable = x === 20;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, getPlayerState: () => ({ cell: playerCell, facing: "right", alive: true }), isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable) });
  const first = system.addNpc({ id: "npc-constrained-1", realm: "Overground", cell: { x: 20, y: 10 } });
  const second = system.addNpc({ id: "npc-constrained-2", realm: "Overground", cell: { x: 20, y: 11 } });
  system.recruitNpc(first.id); system.recruitNpc(second.id);
  for (let frame = 0; frame < 16; frame += 1) system.updateFollowers();
  assert.notDeepEqual(occupancy.get(first.id).cell, occupancy.get(second.id).cell);
});

test("a recruited NPC waits clear of a doorway while the player occupies it", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const doorway = { x: 20, y: 20 };
  map.objects.push({ type: "door", cell: doorway });
  occupancy.claim({ id: "player", type: "player", cell: doorway });
  const system = createNpcSystem({
    timeSystem,
    occupancy,
    worldFor: () => map,
    getPlayerState: () => ({ cell: doorway, facing: "right", alive: true }),
    isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable),
  });
  system.addNpc({ id: "npc-doorway-clearance", realm: "Overground", cell: { x: 20, y: 21 } });
  system.recruitNpc("npc-doorway-clearance");

  assert.equal(system.updateFollowers(), true);
  const npc = occupancy.get("npc-doorway-clearance");
  assert.notEqual(Math.abs(npc.cell.x - doorway.x) + Math.abs(npc.cell.y - doorway.y), 1);
  assert.notDeepEqual(npc.cell, doorway);
});

test("a recruited NPC follows through an open doorway after the player clears it", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy();
  const doorway = { x: 20, y: 20 };
  map.objects.push({ type: "door", cell: doorway, open: true });
  map.buildings = [{ doorway, door: doorway, interior: Array.from({ length: 3 }, (_, y) => Array.from({ length: 7 }, (_, x) => ({ x: 17 + x, y: 17 + y }))).flat() }];
  for (let y = 1; y < map.rows - 1; y += 1) for (let x = 1; x < map.columns - 1; x += 1) {
    map.terrain[y][x].walkable = x === 20 || (y >= 17 && y <= 19 && x >= 17 && x <= 23);
  }
  let playerCell = { x: 20, y: 17 };
  occupancy.claim({ id: "player", type: "player", cell: playerCell });
  const system = createNpcSystem({
    timeSystem,
    occupancy,
    worldFor: () => map,
    getPlayerState: () => ({ cell: playerCell, facing: "right", alive: true }),
    isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable),
  });
  system.addNpc({ id: "npc-doorway-follow", realm: "Overground", cell: { x: 20, y: 28 } });
  system.recruitNpc("npc-doorway-follow");

  for (let frame = 0; frame < 12; frame += 1) system.updateFollowers();
  const npc = occupancy.get("npc-doorway-follow");
  assert.ok(npc.cell.y < doorway.y);
  assert.ok(Math.abs(npc.cell.x - playerCell.x) + Math.abs(npc.cell.y - playerCell.y) >= NPC_FOLLOW_DISTANCE);
});

test("recruited NPCs transfer across realms with identity and recruited state intact", () => {
  const map = world(); const timeSystem = createTimeSystem();
  const overground = createDynamicOccupancy(); const underground = createDynamicOccupancy();
  const occupancies = new Map([["Overground", overground], ["Underground", underground]]);
  const system = createNpcSystem({
    timeSystem,
    occupancy: overground,
    occupancyFor: (realm = null) => realm ? occupancies.get(realm) : occupancies.values(),
    worldFor: () => map,
    isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable),
    isStaticOccupied: () => false,
    randomFor: () => () => 0,
  });
  const npc = system.addNpc({ id: "party-crossing", realm: "Overground", cell: { x: 10, y: 10 } });
  system.recruitNpc(npc.id);
  underground.claim({ id: "player", type: "player", cell: { x: 20, y: 20 } });
  assert.equal(system.transferParty("Underground", { x: 20, y: 20 }), true);
  assert.equal(overground.get(npc.id), null);
  assert.equal(underground.get(npc.id)?.id, npc.id);
  assert.equal(underground.get(npc.id)?.recruited, true);
  assert.equal(underground.get(npc.id)?.realm, "Underground");
});

test("realm transfer places multiple party NPCs on distinct nearest valid stair cells and skips blocked candidates", () => {
  const map = world(); const timeSystem = createTimeSystem();
  const overground = createDynamicOccupancy(); const underground = createDynamicOccupancy();
  const occupancies = new Map([["Overground", overground], ["Underground", underground]]);
  for (const cell of [{ x: 17, y: 20 }, { x: 18, y: 20 }]) map.terrain[cell.y][cell.x].walkable = false;
  const system = createNpcSystem({
    timeSystem,
    occupancy: overground,
    occupancyFor: (realm = null) => realm ? occupancies.get(realm) : occupancies.values(),
    worldFor: () => map,
    isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable),
    isStaticOccupied: () => false,
    randomFor: () => () => 0,
  });
  for (const [index, cell] of [[1, { x: 10, y: 10 }], [2, { x: 11, y: 10 }]]) {
    const npc = system.addNpc({ id: `party-${index}`, realm: "Overground", cell });
    system.recruitNpc(npc.id);
  }
  underground.claim({ id: "player", type: "player", cell: { x: 20, y: 20 } });
  assert.equal(system.transferParty("Underground", { x: 20, y: 20 }), true);
  const party = underground.getAll("npc");
  assert.equal(party.length, 2);
  assert.equal(new Set(party.map((npc) => `${npc.cell.x},${npc.cell.y}`)).size, 2);
  for (const npc of party) {
    const distance = Math.abs(npc.cell.x - 20) + Math.abs(npc.cell.y - 20);
    assert.equal(distance, NPC_FOLLOW_DISTANCE);
    assert.equal(map.terrain[npc.cell.y][npc.cell.x].walkable, true);
  }
  assert.equal(underground.getAt({ x: 17, y: 20 }), null);
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

test("deferred spawner patrol preparation preserves its selected endpoint and spawner approach", () => {
  const map = world(); const timeSystem = createTimeSystem(); const occupancy = createDynamicOccupancy(); const deferred = createControlledDeferredScheduler();
  let randomCalls = 0;
  const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => map, isWalkable: (cell) => Boolean(map.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => () => { randomCalls += 1; return 0; }, deferredScheduler: deferred.scheduler });
  system.addNpc({ id: "npc-spawner-pending", realm: "Overground", cell: { x: 20, y: 5 }, home: { x: 20, y: 5 }, patrolAnchor: { x: 20, y: 20 } });
  deferred.flush();
  const npc = occupancy.get("npc-spawner-pending");
  assert.equal(randomCalls, 0);
  assert.equal(npc.patrolState, "ready");
  assert.deepEqual(npc.home, { x: 20, y: 5 });
  assert.deepEqual(npc.destination, { x: 20, y: 19 });
  assert.equal(npc.route.length, 14);
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
