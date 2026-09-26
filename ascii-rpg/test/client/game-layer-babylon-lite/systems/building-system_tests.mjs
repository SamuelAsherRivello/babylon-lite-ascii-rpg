import assert from "node:assert/strict";
import test from "node:test";
import { getSceneLightingFactor } from "../../../../src/client/game-layer-babylon-lite/lighting.js";
import { createHomeAt, createOverworldBuildings, findHomeCandidates, getBuildingGlyph, getBuildingPresentationLightingFactor, getIndexedBuildingGlyph, getBuildingPresentationDirtyCells, getHomeInteriorCorners, HOME_HEIGHT, HOME_WIDTH, HOME_SIZE_SMALL, HOME_SIZE_MED, HOME_SIZE_HIGH, isConcealedBuildingRoof } from "../../../../src/client/game-layer-babylon-lite/systems/building-system.js";

function world(size = 96) {
  return { rows: size, columns: size, playerStart: { x: 70, y: 70 }, terrain: Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => ({ walkable: x > 0 && y > 0 && x < size - 1 && y < size - 1 }))), objects: [], stairs: [] };
}

test("building presentation index matches reference through entry, exit, and replacement", () => {
  const buildings = Object.freeze([createHomeAt({ x: 2, y: 2 }), createHomeAt({ x: 30, y: 30 })]);
  for (const player of [{ x: 0, y: 0 }, buildings[0].door, buildings[0].interior[5], buildings[1].door, { x: 0, y: 0 }]) {
    for (const cell of [...buildings.flatMap(b => [...b.cells, b.approach]), { x: 95, y: 95 }]) {
      const expected = buildings.map(b => getBuildingGlyph(b, cell, player)).find(g => g !== null) ?? null;
      assert.equal(getIndexedBuildingGlyph(buildings, cell, player), expected);
    }
  }
  assert.equal(getIndexedBuildingGlyph([], buildings[0].walls[0], null), null);
  assert.deepEqual(findHomeCandidates(world(8)), []);
  assert.deepEqual(getBuildingPresentationDirtyCells(buildings, buildings[0].approach, buildings[0].door), buildings[0].cells);
  assert.deepEqual(getBuildingPresentationDirtyCells(buildings, buildings[0].door, buildings[0].interior[0]), []);
  assert.deepEqual(getBuildingPresentationDirtyCells(buildings, buildings[0].interior[0], buildings[0].approach), buildings[0].cells);
});

test("Home uses the approved 20 by 10 footprint and column-10 bottom door", () => {
  const home = createHomeAt({ x: 10, y: 20 });
  assert.equal(home.id, "home-10-20");
  assert.equal(home.width, HOME_WIDTH); assert.equal(home.height, HOME_HEIGHT);
  assert.deepEqual(home.door, { x: 19, y: 29 }); assert.deepEqual(home.approach, { x: 19, y: 30 });
  assert.equal(home.cells.length, 200); assert.equal(home.interior.length, 18 * 8);
});

test("Home size definitions create complete centered footprints", () => {
  const expected = [
    [HOME_SIZE_SMALL, 7, 5, { x: 13, y: 24 }, 35, 15],
    [HOME_SIZE_MED, 10, 5, { x: 14, y: 24 }, 50, 24],
    [HOME_SIZE_HIGH, 20, 10, { x: 19, y: 29 }, 200, 144],
  ];
  for (const [size, width, height, door, cellCount, interiorCount] of expected) {
    const home = createHomeAt({ x: 10, y: 20 }, size);
    assert.equal(home.size, size); assert.equal(home.width, width); assert.equal(home.height, height);
    assert.deepEqual(home.door, door); assert.equal(home.cells.length, cellCount); assert.equal(home.interior.length, interiorCount);
    assert.equal(home.walls.length, cellCount - interiorCount - 1);
    assert.deepEqual(getHomeInteriorCorners(home), [
      { x: 11, y: 21 }, { x: 8 + width, y: 21 },
      { x: 11, y: 18 + height }, { x: 8 + width, y: 18 + height },
    ]);
  }
});

test("smaller Homes can fit where HIGH cannot", () => {
  const map = world(16);
  assert.equal(findHomeCandidates(map, { size: HOME_SIZE_SMALL }).length > 0, true);
  assert.deepEqual(findHomeCandidates(map, { size: HOME_SIZE_HIGH }), []);
});

test("Home candidates require a walkable footprint, approach, and reachable exterior key", () => {
  const map = world();
  const homes = findHomeCandidates(map, { region: { x: 1, y: 1, width: 64, height: 36 }, random: () => 0 });
  assert.ok(homes.length > 0); const home = homes[0];
  assert.equal(map.terrain[home.key.y][home.key.x].walkable, true);
  assert.equal(getBuildingGlyph(home, home.key, home.approach), null);
  assert.equal(getIndexedBuildingGlyph([home], home.key, home.approach), null);
  const distance = Math.abs(home.key.x - home.approach.x) + Math.abs(home.key.y - home.approach.y);
  assert.ok(distance >= 3 && distance <= 6);
  map.terrain[1][1].walkable = false;
  assert.ok(findHomeCandidates(map, { region: { x: 1, y: 1, width: 20, height: 10 } }).every((candidate) => candidate.origin.x !== 1 || candidate.origin.y !== 1));
});

test("Home candidates never place a key on a non-walkable exterior tile", () => {
  const map = world();
  const region = { x: 1, y: 1, width: 64, height: 36 };
  const baseline = findHomeCandidates(map, { region, random: () => 0 });
  assert.ok(baseline.length > 0);
  for (const candidate of baseline) map.terrain[candidate.key.y][candidate.key.x].walkable = false;

  const homes = findHomeCandidates(map, { region, random: () => 0 });
  assert.ok(homes.every((home) => map.terrain[home.key.y][home.key.x].walkable));
});

test("Buildings are seeded, non-overlapping, and reveal only while entered", () => {
  const map = world(160); const values = [0, 0.25, 0.5, 0.75]; let index = 0; const random = () => values[index++ % values.length];
  const first = createOverworldBuildings(map, { chance: 1, random }); index = 0;
  const second = createOverworldBuildings(map, { chance: 1, random });
  assert.deepEqual(first, second);
  const keys = new Set(first.flatMap((home) => home.cells.map((cell) => `${cell.x},${cell.y}`)));
  assert.equal(keys.size, first.reduce((sum, home) => sum + home.cells.length, 0));
  assert.ok(first.every((home) => map.terrain[home.key.y][home.key.x].walkable));
  assert.ok(first.every((home) => getHomeInteriorCorners(home).some((cell) => cell.x === home.chestCell.x && cell.y === home.chestCell.y)));
  assert.ok(first.every((home) => home.interior.some((cell) => cell.x === home.chestCell.x && cell.y === home.chestCell.y)));
  const home = first[0];
  assert.equal(getBuildingGlyph(home, home.interior[0], { x: 1, y: 1 }), "^");
  assert.equal(getBuildingGlyph(home, home.interior[0], home.door), ".");
  assert.equal(getBuildingGlyph(home, home.interior[0], home.interior[0]), ".");
  assert.equal(getBuildingGlyph(home, home.interior[0], home.approach), "^");
  assert.equal(getBuildingGlyph(home, home.walls[0], home.door), "#");
});

test("concealed roof predicate follows the Building presentation state", () => {
  const home = createHomeAt({ x: 10, y: 20 });
  const roofCell = home.interior[0];
  assert.equal(isConcealedBuildingRoof([home], roofCell, home.approach), true);
  assert.equal(isConcealedBuildingRoof([home], roofCell, home.door), false);
  assert.equal(isConcealedBuildingRoof([home], roofCell, roofCell), false);
  assert.equal(isConcealedBuildingRoof([home], home.walls[0], home.approach), false);
});

test("an open Home Door transmits light while its exterior roof remains ambient-only", () => {
  const home = createHomeAt({ x: 10, y: 20 });
  const roofCell = home.interior.find((cell) => cell.x === home.door.x && cell.y === home.door.y - 1);
  const source = home.approach;
  const terrain = Array.from({ length: 40 }, () => Array.from({ length: 40 }, () => ({ walkable: true })));
  const ambient = 0.1;
  const sourceFactor = getSceneLightingFactor(roofCell, [], source, {
    ambient,
    playerProfile: { radius: 6, maximum: 1, falloffExponent: 1 },
  }, terrain);

  assert.ok(sourceFactor > ambient);
  assert.equal(getBuildingPresentationLightingFactor([home], roofCell, home.approach, ambient, sourceFactor), ambient);
  assert.equal(getBuildingPresentationLightingFactor([home], roofCell, home.door, ambient, sourceFactor), sourceFactor);
});

test("a reserved static cell rejects a Home instead of creating a partial footprint", () => {
  const map = world();
  const reserved = new Set(["1,1"]);
  assert.ok(findHomeCandidates(map, { region: { x: 1, y: 1, width: 20, height: 10 }, reserved }).every((home) => home.origin.x !== 1 || home.origin.y !== 1));
});

test("Building placement excludes player, paired stairs, and existing static objects", () => {
  const map = world(160);
  map.playerStart = { x: 2, y: 2 };
  map.stairs = [{ x: 30, y: 10 }];
  map.objects = [{ active: true, cell: { x: 50, y: 15 } }];
  const buildings = createOverworldBuildings(map, { chance: 1, random: () => 0 });
  const reserved = new Set(["2,2", "30,10", "50,15"]);
  for (const building of buildings) for (const cell of [...building.cells, building.key, building.approach]) {
    assert.equal(reserved.has(`${cell.x},${cell.y}`), false);
  }
});
