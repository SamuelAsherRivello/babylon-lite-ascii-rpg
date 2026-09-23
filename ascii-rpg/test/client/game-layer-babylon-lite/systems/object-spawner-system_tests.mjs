import assert from "node:assert/strict";
import test from "node:test";
import objectData from "../../../../src/client/game-layer-babylon-lite/data/object_data.json" with { type: "json" };
import paletteData from "../../../../src/client/game-layer-babylon-lite/data/palette_data.json" with { type: "json" };
import { createObjectSpawnerSystem, selectObjectCells, validateObjectPalette } from "../../../../src/client/game-layer-babylon-lite/systems/object-spawner-system.js";
import { createGameplayEventSystem } from "../../../../src/client/game-layer-babylon-lite/systems/gameplay-event-system.js";

function createWorld(size = 24) {
  return {
    rows: size,
    columns: size,
    terrain: Array.from({ length: size }, () => Array.from({ length: size }, () => ({ walkable: true }))),
    characters: Array.from({ length: size }, () => Array.from({ length: size }, () => null)),
  };
}

test("the object catalog is palette-backed and declares pickup and level-spawn ownership", () => {
  assert.equal(validateObjectPalette(objectData.objects, paletteData.entries), true);
  assert.deepEqual(objectData.objects.map((object) => [object.type, object.IsPickup, object.IsLevelSpawned]), [
    ["gold", true, false], ["heart", true, true], ["torch", false, true], ["trap", false, true], ["stairs", false, true],
    ["key", true, false], ["fence", false, false], ["door", false, false], ["fireplace", false, false],
  ]);
  assert.equal(objectData.objects.find((object) => object.type === "torch").glyph, "🕯️");
  assert.equal(validateObjectPalette([{ type: "door", name: "Door", glyph: "█", openGlyph: "□", IsPickup: false, IsLevelSpawned: false }], paletteData.entries), true);
});

test("a fireplace remains after collision and saves on every entry", () => {
  const world = createWorld();
  const saves = [];
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "fireplace", name: "Fireplace", glyph: "🔥", IsPickup: false, IsLevelSpawned: false },
  ] });
  system.addObject({ id: "fireplace-1", type: "fireplace", cell: { x: 3, y: 3 }, realm: world, effect: () => saves.push("saved") });
  system.collideAtCell({ x: 3, y: 3 }, { world });
  system.collideAtCell({ x: 3, y: 3 }, { world });
  assert.equal(system.getActiveObjects().some((object) => object.id === "fireplace-1"), true);
  assert.deepEqual(saves, ["saved", "saved"]);
});

test("object placement is seeded, spaced, and excludes the player cell", () => {
  const world = createWorld();
  const first = selectObjectCells(world, { x: 12, y: 12 }, 8, () => 0.25, { minimumDistance: 3 });
  const second = selectObjectCells(world, { x: 12, y: 12 }, 8, () => 0.25, { minimumDistance: 3 });
  assert.deepEqual(first, second);
  assert.equal(first.some((cell) => cell.x === 12 && cell.y === 12), false);
  assert.ok(first.every((cell, index) => first.slice(index + 1).every((other) => Math.hypot(cell.x - other.x, cell.y - other.y) >= 3)));
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
