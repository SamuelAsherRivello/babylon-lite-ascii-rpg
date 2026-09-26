import assert from "node:assert/strict";
import test from "node:test";
import {
  createCivilizationGroups,
  getCivilizationDoorArt,
  findCivilizationCandidates,
  getCivilizationGlyph,
  isCardinalDirection,
} from "../../../../src/client/game-layer-babylon-lite/systems/civilization-system.js";

function createWorld() {
  const size = 24;
  const terrain = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ walkable: false })));
  for (let x = 5; x <= 9; x += 1) terrain[8][x].walkable = true;
  for (let y = 14; y <= 18; y += 1) terrain[y][16].walkable = true;
  terrain[3][7].walkable = true;
  terrain[13][7].walkable = true;
  terrain[16][11].walkable = true;
  terrain[16][21].walkable = true;
  return {
    rows: size,
    columns: size,
    terrain,
    characters: Array.from({ length: size }, () => Array.from({ length: size }, () => null)),
    objects: [],
    playerStart: { x: 2, y: 2 },
  };
}

test("finds bounded three-to-ten-cell civilization candidates", () => {
  const world = createWorld();
  const candidates = findCivilizationCandidates(world, { x: 1, y: 1, width: 22, height: 22 });
  assert.equal(candidates.length, 2);
  assert.deepEqual(candidates.map(({ orientation, cells, door }) => [orientation, cells.length, door]), [
    ["horizontal", 5, { x: 7, y: 8 }],
    ["vertical", 5, { x: 16, y: 16 }],
  ]);
});

test("places at most one deterministic barrier per screen and keys on both sides", () => {
  const world = createWorld();
  const first = createCivilizationGroups(world, {
    chance: 1,
    random: () => 0,
    screenColumns: 22,
    screenRows: 22,
  });
  const second = createCivilizationGroups(world, {
    chance: 1,
    random: () => 0,
    screenColumns: 22,
    screenRows: 22,
  });
  assert.deepEqual(first, second);
  assert.equal(first.length, 1);
  const group = first[0];
  assert.equal(group.cells.length, 5);
  assert.equal(group.orientation, "horizontal");
  assert.deepEqual(group.door, { x: 7, y: 8 });
  assert.equal(group.keys.length, 2);
  assert.ok(group.keys.every((cell) => {
    const distance = Math.abs(cell.x - group.door.x) + Math.abs(cell.y - group.door.y);
    return distance >= 5 && distance <= 10;
  }));
  assert.ok(group.keys.some((cell) => cell.y < group.door.y));
  assert.ok(group.keys.some((cell) => cell.y > group.door.y));
});

test("skips a bounded span when either side has no walkable key cell", () => {
  const world = createWorld();
  world.terrain[3][7].walkable = false;
  world.terrain[13][7].walkable = false;
  const groups = createCivilizationGroups(world, {
    chance: 1,
    random: () => 0,
    screenColumns: 22,
    screenRows: 22,
  });
  assert.deepEqual(groups, []);
});

test("uses the selected glyph pairs and cardinal interaction directions", () => {
  assert.equal(getCivilizationGlyph("fence", "horizontal"), "─");
  assert.equal(getCivilizationGlyph("fence", "vertical"), "│");
  assert.equal(getCivilizationGlyph("door", "vertical"), "█");
  assert.equal(getCivilizationGlyph("door", "vertical", true), "□");
  assert.equal(getCivilizationGlyph("door", "horizontal"), "█");
  assert.equal(getCivilizationGlyph("door", "horizontal", true), "□");
  assert.equal(getCivilizationGlyph("key", "horizontal"), "⚿");
  assert.equal(getCivilizationDoorArt("horizontal"), "civilization-door:front-closed");
  assert.equal(getCivilizationDoorArt("horizontal", true), "civilization-door:front-open");
  assert.equal(getCivilizationDoorArt("vertical"), "civilization-door:side-closed");
  assert.equal(getCivilizationDoorArt("vertical", true), "civilization-door:side-open");
  assert.equal(isCardinalDirection({ x: 1, y: 0 }), true);
  assert.equal(isCardinalDirection({ x: 1, y: 1 }), false);
});
