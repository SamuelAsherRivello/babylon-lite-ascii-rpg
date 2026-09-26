import assert from "node:assert/strict";
import test from "node:test";
import objectData from "../../../../src/client/game-layer-babylon-lite/data/object_data.json" with { type: "json" };
import paletteData from "../../../../src/client/game-layer-babylon-lite/data/palette_data.json" with { type: "json" };
import { createObjectSpawnerSystem, placeDeclaredLevelObjects, selectObjectCells, validateObjectPalette } from "../../../../src/client/game-layer-babylon-lite/systems/object-spawner-system.js";
import { createGameplayEventSystem } from "../../../../src/client/game-layer-babylon-lite/systems/gameplay-event-system.js";
import { createLogSystem } from "../../../../src/client/game-layer-babylon-lite/systems/log-system.js";

function createWorld(size = 24) {
  return {
    rows: size,
    columns: size,
    terrain: Array.from({ length: size }, () => Array.from({ length: size }, () => ({ walkable: true }))),
    characters: Array.from({ length: size }, () => Array.from({ length: size }, () => null)),
  };
}

test("torch snapshots retain identity until their realm's sources change", () => {
  const system = createObjectSpawnerSystem({ catalog: objectData.objects });
  const world = createWorld();
  const other = createWorld();
  system.addObject({ type: "torch", cell: { x: 2, y: 2 }, realm: world });
  const lights = system.getLightingSources(world);
  assert.equal(system.getLightingSources(world), lights);
  system.addObject({ type: "heart", cell: { x: 3, y: 3 }, realm: world });
  system.addObject({ type: "torch", cell: { x: 4, y: 4 }, realm: other });
  assert.equal(system.getLightingSources(world), lights);
  system.addObject({ type: "torch", cell: { x: 5, y: 5 }, realm: world });
  assert.notEqual(system.getLightingSources(world), lights);
  assert.equal(system.getLightingSources(world).length, 2);
  assert.equal(lights.length, 1);
  assert.ok(Object.isFrozen(lights[0]));
});

test("the object catalog is palette-backed and declares pickup and level-spawn ownership", () => {
  assert.equal(validateObjectPalette(objectData.objects, paletteData.entries), true);
  assert.deepEqual(objectData.objects.map((object) => [object.type, object.IsPickup, object.IsLevelSpawned]), [
    ["welcome-sign", false, true], ["gold", true, false], ["heart", true, true], ["chest", false, true], ["torch", false, true], ["trap", false, true], ["stairs", false, true],
    ["key", true, false], ["fence", false, false], ["door", false, false], ["CampFire", false, true],
  ]);
  assert.equal(objectData.objects.find((object) => object.type === "torch").glyph, "🕯️");
  assert.equal(objectData.objects.find((object) => object.type === "CampFire").name, "Camp Fire");
  assert.equal(objectData.objects.find((object) => object.type === "CampFire").walkable, false);
  assert.equal(validateObjectPalette([{ type: "door", name: "Door", glyph: "█", openGlyph: "□", IsPickup: false, IsLevelSpawned: false }], paletteData.entries), true);
  assert.equal(objectData.objects.find((object) => object.type === "welcome-sign").glyph, "⚑");
});

test("a CampFire remains blocking and delegates every bump to its dialog", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "CampFire", name: "Camp Fire", glyph: "🔥", walkable: false, IsPickup: false, IsLevelSpawned: false },
  ] });
  system.addObject({ id: "CampFire-1", type: "CampFire", cell: { x: 3, y: 3 }, realm: world });
  const opened = [];
  const first = system.interactAtCell({ x: 3, y: 3 }, { world, openDialog: (request) => { opened.push(request.object.id); return true; } });
  const second = system.interactAtCell({ x: 3, y: 3 }, { world, openDialog: (request) => { opened.push(request.object.id); return true; } });
  assert.equal(first.handled, true);
  assert.equal(second.handled, true);
  assert.equal(system.getActiveObjects().some((object) => object.id === "CampFire-1"), true);
  assert.deepEqual(opened, ["CampFire-1", "CampFire-1"]);
});

test("Welcome Sign interaction remains active and delegates to a dialog", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [{ type: "welcome-sign", name: "Welcome Sign", glyph: "⚑", IsPickup: false, IsLevelSpawned: true }] });
  system.addObject({ id: "sign-1", type: "welcome-sign", cell: { x: 3, y: 3 }, realm: world });
  const opened = [];
  const first = system.interactAtCell({ x: 3, y: 3 }, { world, openDialog: (request) => { opened.push(request.object.id); return true; } });
  const second = system.interactAtCell({ x: 3, y: 3 }, { world, openDialog: (request) => { opened.push(request.object.id); return true; } });
  assert.equal(first.handled, true);
  assert.equal(second.handled, true);
  assert.deepEqual(opened, ["sign-1", "sign-1"]);
  assert.equal(system.getActiveObjects().length, 1);
});

test("zero object count reads no candidates, consumes no random draws, and leaves reservations intact", () => {
  const reserved = new Set(["3,4"]);
  const world = new Proxy({}, { get() { assert.fail("zero count must not inspect the world"); } });
  assert.deepEqual(selectObjectCells(world, { x: 1, y: 1 }, 0, () => assert.fail("unexpected RNG"), { reserved }), []);
  assert.deepEqual([...reserved], ["3,4"]);
});

test("object placement is seeded, spaced, and excludes the player cell", () => {
  const world = createWorld();
  const first = selectObjectCells(world, { x: 12, y: 12 }, 8, () => 0.25, { minimumDistance: 3 });
  const second = selectObjectCells(world, { x: 12, y: 12 }, 8, () => 0.25, { minimumDistance: 3 });
  assert.deepEqual(first, second);
  assert.equal(first.some((cell) => cell.x === 12 && cell.y === 12), false);
  assert.ok(first.every((cell, index) => first.slice(index + 1).every((other) => Math.hypot(cell.x - other.x, cell.y - other.y) >= 3)));
});

test("chest placement stays within its configured player-start radius", () => {
  const world = createWorld(128);
  const start = { x: 64, y: 64 };
  const cells = selectObjectCells(world, start, 3, () => 0.25, { maximumDistance: 50 });
  assert.equal(cells.length, 3);
  assert.ok(cells.every((cell) => Math.hypot(cell.x - start.x, cell.y - start.y) <= 50));
});

test("pickups disappear after collision while persistent objects remain", () => {
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "heart", name: "Heart", glyph: "♥", IsPickup: true, IsLevelSpawned: true, logText: "Collected +2 Health from Heart" },
    { type: "trap", name: "Trap", glyph: "☠", IsPickup: false, IsLevelSpawned: true, logText: "Lost -25 Health from Trap" },
  ] });
  let health = 10;
  const world = createWorld();
  system.addObject({ id: "heart-1", type: "heart", cell: { x: 2, y: 2 }, realm: world, effect: () => { health += 2; } });
  system.addObject({ id: "trap-1", type: "trap", cell: { x: 3, y: 3 }, realm: world, effect: () => { health -= 25; } });
  world.characters[2][2] = "♥";
  world.characters[3][3] = "☠";
  assert.equal(system.collideAtCell({ x: 2, y: 2 }, { world }).logText, "Collected +2 Health from Heart");
  assert.equal(system.getActiveObjects().some((object) => object.id === "heart-1"), false);
  assert.equal(world.characters[2][2], null);
  assert.equal(system.collideAtCell({ x: 3, y: 3 }, { world }).logText, "Lost -25 Health from Trap");
  assert.equal(system.getActiveObjects().some((object) => object.id === "trap-1"), true);
  assert.equal(world.characters[3][3], "☠");
  assert.equal(health, -13);
});

test("closed doors require a key and open without moving the player", () => {
  const world = createWorld();
  world.terrain[5][5].walkable = false;
  world.characters[5][5] = "█";
  const eventSystem = createGameplayEventSystem();
  const events = [];
  eventSystem.subscribe((event) => events.push(event));
  const system = createObjectSpawnerSystem({ eventSystem, catalog: [
    { type: "door", name: "Door", glyph: "█", openGlyph: "□", IsPickup: false, IsLevelSpawned: false },
  ] });
  system.addObject({ id: "door-1", type: "door", cell: { x: 5, y: 5 }, realm: world });
  const messages = [];

  const locked = system.interactAtCell({ x: 5, y: 5 }, { world, keyCount: 0, log: (message) => messages.push(message) });
  assert.equal(locked.opened, false);
  assert.equal(world.terrain[5][5].walkable, false);
  assert.deepEqual(messages, ["The door is locked."]);

  const unlocked = system.interactAtCell({ x: 5, y: 5 }, {
    world,
    keyCount: 1,
    spendKey: () => true,
    log: (message) => messages.push(message),
  });
  assert.equal(unlocked.opened, true);
  assert.equal(world.terrain[5][5].walkable, true);
  assert.equal(world.characters[5][5], "□");
  assert.deepEqual(messages, ["The door is locked.", "A key was spent.", "The door unlocked."]);
  assert.deepEqual(events.map(({ type, objectId }) => ({ type, objectId })), [
    { type: "door-unlocked", objectId: "door-1" },
  ]);
});

test("a cardinal chest bump spawns a Heart even without pre-generated Hearts", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "heart", name: "Heart", glyph: "♥", IsPickup: true, IsLevelSpawned: true },
    { type: "chest", name: "Treasure Chest", glyph: "◆", openGlyph: "◇", IsPickup: false, IsLevelSpawned: true, rewards: [{ type: "heart", weight: 100 }] },
  ] });
  const chest = system.addObject({ id: "chest-1", type: "chest", cell: { x: 5, y: 5 }, realm: world });
  world.characters[5][5] = "◆";
  world.characters[4][4] = "█";
  world.objects = [{ id: "occupied-neighbor", type: "fence", active: true, cell: { x: 4, y: 5 } }];
  const messages = [];
  let collectedHearts = 0;
  const opened = system.interactAtCell({ x: 5, y: 5 }, {
    world,
    playerCell: { x: 4, y: 5 },
    random: () => 0,
    createChestRewardEffect: (type) => type === "heart" ? () => { collectedHearts += 1; } : () => {},
    log: (message) => messages.push(message),
  });
  assert.equal(opened.handled, true);
  assert.equal(opened.opened, true);
  assert.equal(chest.open, true);
  assert.equal(world.characters[5][5], "◇");
  assert.equal(world.objects.length, 2);
  const reward = world.objects.find((object) => object.type === "heart");
  assert.deepEqual(reward.cell, { x: 5, y: 4 });
  assert.equal(reward.type, "heart");
  assert.equal(world.characters[4][5], "♥");
  assert.equal(world.characters[5][5], "◇");
  system.collideAtCell({ x: 5, y: 4 }, { world });
  assert.equal(collectedHearts, 1);
  assert.deepEqual(messages, ["Chest was opened"]);
  assert.deepEqual(system.interactAtCell({ x: 5, y: 5 }, { world }), { handled: true, opened: false, object: chest });
  assert.equal(world.objects.length, 2);
  assert.deepEqual(messages, ["Chest was opened"]);
  assert.equal(system.collideAtCell({ x: 5, y: 5 }, { world }), null);
});

test("a player bump on a treasure chest logs the opening and places its Heart predictably", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "heart", name: "Heart", glyph: "♥", IsPickup: true, IsLevelSpawned: true },
    { type: "chest", name: "Treasure Chest", glyph: "◆", openGlyph: "◇", IsPickup: false, IsLevelSpawned: true, rewards: [{ type: "heart", weight: 100 }] },
  ] });
  system.addObject({ id: "treasure-1", type: "chest", cell: { x: 5, y: 5 }, realm: world });
  world.characters[5][5] = "◆";
  const logs = [];

  const result = system.interactAtCell({ x: 5, y: 5 }, {
    world,
    playerCell: { x: 5, y: 6 },
    random: () => 0,
    log: (message) => logs.push(message),
  });

  assert.equal(result.opened, true);
  assert.deepEqual(logs, ["Chest was opened"]);
  assert.deepEqual(result.reward.cell, { x: 5, y: 4 });
  assert.equal(world.characters[4][5], "♥");
});

test("house-owned chests use the same reward and logging lifecycle", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "heart", name: "Heart", glyph: "♥", IsPickup: true, IsLevelSpawned: true },
    { type: "chest", name: "Treasure Chest", glyph: "◆", openGlyph: "◇", IsPickup: false, IsLevelSpawned: true, rewards: [{ type: "heart", weight: 100 }] },
  ] });
  const chest = system.addObject({ id: "home-1-chest", type: "chest", cell: { x: 5, y: 5 }, buildingId: "home-1", realm: world });
  world.characters[5][5] = "◆";
  const messages = [];
  const result = system.interactAtCell({ x: 5, y: 5 }, {
    world,
    playerCell: { x: 5, y: 6 },
    random: () => 0,
    log: (message) => messages.push(message),
  });
  assert.equal(result.object, chest);
  assert.equal(result.reward.type, "heart");
  assert.deepEqual(messages, ["Chest was opened"]);
});

test("a chest registers one Heart in the active realm and the normal pickup path logs once", () => {
  const world = createWorld();
  const logSystem = createLogSystem();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "heart", name: "Heart", glyph: "♥", IsPickup: true, IsLevelSpawned: true },
    { type: "chest", name: "Treasure Chest", glyph: "◆", openGlyph: "◇", IsPickup: false, IsLevelSpawned: true, rewards: [{ type: "heart", weight: 100 }] },
  ] });
  system.addObject({ id: "chest-1", type: "chest", cell: { x: 5, y: 5 }, realm: world });
  world.characters[5][5] = "◆";
  let healthEffects = 0;

  const opened = system.interactAtCell({ x: 5, y: 5 }, {
    world,
    playerCell: { x: 5, y: 6 },
    random: () => 0,
    log: (message) => logSystem.log({ message }),
    createChestRewardEffect: () => () => {
      healthEffects += 1;
      logSystem.log({ message: "Collected +2 Health from Heart" });
    },
  });

  assert.equal(world.objects.filter((object) => object.type === "heart").length, 1);
  assert.equal(world.pickups.filter((object) => object.type === "heart").length, 1);
  assert.equal(world.characters[opened.reward.cell.y][opened.reward.cell.x], "♥");
  system.collideAtCell(opened.reward.cell, { world });
  system.collideAtCell(opened.reward.cell, { world });
  assert.equal(healthEffects, 1);
  assert.deepEqual(logSystem.getSnapshot(), ["Chest was opened", "Collected +2 Health from Heart"]);
});

test("a blocked chest neighborhood opens without creating an invalid Heart", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "heart", name: "Heart", glyph: "♥", IsPickup: true, IsLevelSpawned: true },
    { type: "chest", name: "Treasure Chest", glyph: "◆", openGlyph: "◇", IsPickup: false, IsLevelSpawned: true, rewards: [{ type: "heart", weight: 100 }] },
  ] });
  system.addObject({ id: "chest-1", type: "chest", cell: { x: 5, y: 5 }, realm: world });
  world.characters[5][5] = "◆";
  for (let y = 4; y <= 6; y += 1) for (let x = 4; x <= 6; x += 1) {
    if (x !== 5 || y !== 5) world.terrain[y][x].walkable = false;
  }
  const messages = [];
  const opened = system.interactAtCell({ x: 5, y: 5 }, {
    world, playerCell: { x: 5, y: 6 }, log: (message) => messages.push(message),
  });

  assert.equal(opened.opened, true);
  assert.equal(opened.reward, null);
  assert.equal(system.getActiveObjects(world).filter((object) => object.type === "heart").length, 0);
  assert.deepEqual(messages, ["Chest was opened"]);
});

test("key collection is applied once and emits its exact collection log", () => {
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "key", name: "Key", glyph: "⚿", IsPickup: true, IsLevelSpawned: false, logText: "The key was collected." },
  ] });
  let keys = 0;
  const logs = [];
  system.addObject({ id: "key-1", type: "key", cell: { x: 4, y: 4 }, effect: () => { keys += 1; logs.push("The key was collected."); } });
  system.collideAtCell({ x: 4, y: 4 });
  system.collideAtCell({ x: 4, y: 4 });
  assert.equal(keys, 1);
  assert.deepEqual(logs, ["The key was collected."]);
});

test("a Building Key and Door retain their shared identity through the normal lifecycle", () => {
  const world = createWorld();
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "key", name: "Key", glyph: "⚿", IsPickup: true, IsLevelSpawned: false },
    { type: "door", name: "Door", glyph: "█", openGlyph: "□", IsPickup: false, IsLevelSpawned: false },
  ] });
  const key = system.addObject({ id: "home-1-key", type: "key", cell: { x: 4, y: 4 }, buildingId: "home-1" });
  const door = system.addObject({ id: "home-1-door", type: "door", cell: { x: 5, y: 4 }, buildingId: "home-1", realm: world });
  world.characters[4][5] = "█";
  assert.equal(key.buildingId, "home-1");
  assert.equal(door.buildingId, "home-1");
  assert.equal(system.interactAtCell({ x: 5, y: 4 }, { world, keyCount: 1, spendKey: () => true }).opened, true);
  assert.equal(world.terrain[4][5].walkable, true);
});

test("Object Spawner publishes generic pickup events without quest ownership", () => {
  const eventSystem = createGameplayEventSystem();
  const events = [];
  eventSystem.subscribe((event) => events.push(event));
  const system = createObjectSpawnerSystem({
    eventSystem,
    catalog: [{ type: "gold", name: "Gold", glyph: "💰", IsPickup: true, IsLevelSpawned: false }],
  });
  system.addObject({ id: "gold-1", type: "gold", cell: { x: 1, y: 1 } });
  system.collideAtCell({ x: 1, y: 1 });
  assert.deepEqual(events.map(({ type, pickupType }) => ({ type, pickupType })), [
    { type: "pickup-collected", pickupType: "gold" },
  ]);
});

test("declared level-spawned catalog objects join distribution without a startup call", () => {
  const world = createWorld(); world.playerStart = { x: 12, y: 12 };
  const catalog = [{ type: "fixture", name: "Fixture", glyph: "F", IsPickup: false, IsLevelSpawned: true, distribution: { minimumDistance: 1 }, generation: { realms: ["Overground"] } }];
  const placements = placeDeclaredLevelObjects({ world, start: world.playerStart, catalog, features: [{ id: "object-fixture", objectType: "fixture" }], realm: "Overground", countFor: () => 1, randomFor: () => () => 0 });
  assert.equal(placements.length, 1);
  assert.equal(placements[0].definition.type, "fixture");
  assert.equal(placements[0].cells.length, 1);
});

test("declared objects are repeatable and reserve cells across distribution entries", () => {
  const world = createWorld(32); world.playerStart = { x: 16, y: 16 };
  const catalog = [
    { type: "first", name: "First", glyph: "1", IsPickup: false, IsLevelSpawned: true, distribution: { minimumDistance: 1 }, generation: { realms: ["Underground"] } },
    { type: "second", name: "Second", glyph: "2", IsPickup: false, IsLevelSpawned: true, distribution: { minimumDistance: 1 }, generation: { realms: ["Underground"] } },
  ];
  const options = {
    world,
    start: world.playerStart,
    catalog,
    features: [{ id: "object-first", objectType: "first" }, { id: "object-second", objectType: "second" }],
    realm: "Underground",
    countFor: () => 4,
    randomFor: () => () => 0.25,
  };
  const first = placeDeclaredLevelObjects(options);
  const second = placeDeclaredLevelObjects({ ...options, world: createWorld(32), start: { x: 16, y: 16 } });
  const cells = first.flatMap((placement) => placement.cells);

  assert.deepEqual(first, second);
  assert.equal(new Set(cells.map((cell) => `${cell.x},${cell.y}`)).size, cells.length);
});
