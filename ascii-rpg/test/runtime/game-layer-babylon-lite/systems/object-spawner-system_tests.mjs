import assert from "node:assert/strict";
import test from "node:test";
import objectData from "../../../../src/runtime/game-layer-babylon-lite/data/object_data.json" with { type: "json" };
import paletteData from "../../../../src/runtime/game-layer-babylon-lite/data/palette_data.json" with { type: "json" };
import { createObjectSpawnerSystem, selectObjectCells, validateObjectPalette } from "../../../../src/runtime/game-layer-babylon-lite/systems/object-spawner-system.js";

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
  ]);
  assert.equal(objectData.objects.find((object) => object.type === "torch").glyph, "🕯️");
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
    { type: "trap", name: "Trap", glyph: "☠", IsPickup: false, IsLevelSpawned: true, logText: "Lost -2 Health from Trap" },
  ] });
  let health = 10;
  system.addObject({ id: "heart-1", type: "heart", cell: { x: 2, y: 2 }, effect: () => { health += 2; } });
  system.addObject({ id: "trap-1", type: "trap", cell: { x: 3, y: 3 }, effect: () => { health -= 2; } });
  assert.equal(system.collideAtCell({ x: 2, y: 2 }).logText, "Collected +2 Health from Heart");
  assert.equal(system.getActiveObjects().some((object) => object.id === "heart-1"), false);
  assert.equal(system.collideAtCell({ x: 3, y: 3 }).logText, "Lost -2 Health from Trap");
  assert.equal(system.getActiveObjects().some((object) => object.id === "trap-1"), true);
  assert.equal(health, 10);
});
