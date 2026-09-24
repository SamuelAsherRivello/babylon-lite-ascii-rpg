import assert from "node:assert/strict";
import test from "node:test";
import { createHomeAt, createOverworldBuildings, findHomeCandidates, getBuildingGlyph, HOME_HEIGHT, HOME_WIDTH } from "../../../../src/client/game-layer-babylon-lite/systems/building-system.js";

function world(size = 96) {
  return { rows: size, columns: size, playerStart: { x: 70, y: 70 }, terrain: Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => ({ walkable: x > 0 && y > 0 && x < size - 1 && y < size - 1 }))), objects: [], stairs: [] };
}

test("Home uses the approved 20 by 10 footprint and column-10 bottom door", () => {
  const home = createHomeAt({ x: 10, y: 20 });
  assert.equal(home.width, HOME_WIDTH); assert.equal(home.height, HOME_HEIGHT);
  assert.deepEqual(home.door, { x: 19, y: 29 }); assert.deepEqual(home.approach, { x: 19, y: 30 });
  assert.equal(home.cells.length, 200); assert.equal(home.interior.length, 18 * 8);
});

test("Home candidates require a walkable footprint, approach, and reachable exterior key", () => {
  const map = world();
  const homes = findHomeCandidates(map, { region: { x: 1, y: 1, width: 64, height: 36 }, random: () => 0 });
  assert.ok(homes.length > 0); const home = homes[0];
  const distance = Math.abs(home.key.x - home.approach.x) + Math.abs(home.key.y - home.approach.y);
  assert.ok(distance >= 3 && distance <= 6);
  map.terrain[1][1].walkable = false;
  assert.ok(findHomeCandidates(map, { region: { x: 1, y: 1, width: 20, height: 10 } }).every((candidate) => candidate.origin.x !== 1 || candidate.origin.y !== 1));
});

test("Buildings are seeded, non-overlapping, and reveal only while entered", () => {
  const map = world(160); const values = [0, 0.25, 0.5, 0.75]; let index = 0; const random = () => values[index++ % values.length];
  const first = createOverworldBuildings(map, { chance: 1, random }); index = 0;
  const second = createOverworldBuildings(map, { chance: 1, random });
  assert.deepEqual(first, second);
  const keys = new Set(first.flatMap((home) => home.cells.map((cell) => `${cell.x},${cell.y}`)));
  assert.equal(keys.size, first.reduce((sum, home) => sum + home.cells.length, 0));
  const home = first[0];
  assert.equal(getBuildingGlyph(home, home.interior[0], { x: 1, y: 1 }), "^");
  assert.equal(getBuildingGlyph(home, home.interior[0], home.door), ".");
  assert.equal(getBuildingGlyph(home, home.interior[0], home.interior[0]), ".");
  assert.equal(getBuildingGlyph(home, home.interior[0], home.approach), "^");
  assert.equal(getBuildingGlyph(home, home.walls[0], home.door), "#");
});

test("a reserved static cell rejects a Home instead of creating a partial footprint", () => {
  const map = world();
  const reserved = new Set(["1,1"]);
  assert.ok(findHomeCandidates(map, { region: { x: 1, y: 1, width: 20, height: 10 }, reserved }).every((home) => home.origin.x !== 1 || home.origin.y !== 1));
});
