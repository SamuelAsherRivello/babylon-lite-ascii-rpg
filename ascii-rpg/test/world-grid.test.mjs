import assert from "node:assert/strict";
import test from "node:test";
import {
  FLOOR_GLYPH,
  PLAYER_GLYPH,
  WALL_GLYPH,
  createWorld,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  isWalkableCell,
  setCharacter,
} from "../src/world-grid.js";
import { moveWorldCell } from "../src/player-grid.js";

test("creates a repeatable bordered world with layered terrain", () => {
  const first = createWorld({ rows: 12, columns: 20, seed: "cave" });
  const second = createWorld({ rows: 12, columns: 20, seed: "cave" });

  assert.equal(first.rows, 12);
  assert.equal(first.columns, 20);
  assert.deepEqual(first.terrain, second.terrain);
  assert.equal(first.terrain[0][0].glyph, WALL_GLYPH);
  assert.equal(first.terrain[11][19].walkable, false);
  assert.equal(first.characters[first.playerStart.y][first.playerStart.x], PLAYER_GLYPH);
  assert.equal(isWalkableCell(first, first.playerStart), true);
  assert.ok(first.terrain.flat().some((cell) => cell.glyph === FLOOR_GLYPH));
});

test("generates and retains a seed that can reproduce an unseeded level", () => {
  const first = createWorld({ rows: 12, columns: 20 });
  const second = createWorld({ rows: 12, columns: 20 });
  const replay = createWorld({
    ...first.options,
    rows: first.rows,
    columns: first.columns,
    seed: first.options.seed,
  });

  assert.equal(typeof first.options.seed, "string");
  assert.notEqual(first.options.seed, second.options.seed);
  assert.deepEqual(first.terrain, replay.terrain);
});

test("reads an optional random seed from the URL query", () => {
  assert.equal(getRandomSeedFromSearch("?randomSeed=0"), "0");
  assert.equal(getRandomSeedFromSearch("?randomSeed=night-cave"), "night-cave");
  assert.equal(getRandomSeedFromSearch("?other=value"), undefined);
  assert.equal(getRandomSeedFromSearch(""), undefined);
});

test("renders a character above terrain without changing walkability", () => {
  const world = createWorld({ rows: 10, columns: 10, seed: "layers" });
  const cell = world.playerStart;

  setCharacter(world, cell, PLAYER_GLYPH);

  assert.equal(getVisibleGlyph(world, cell), PLAYER_GLYPH);
  assert.equal(isWalkableCell(world, cell), true);
});

test("blocks world movement into walls and outside bounds", () => {
  const world = createWorld({ rows: 10, columns: 10, seed: "movement" });
  const start = { x: 0, y: 1 };
  const wallAdjacentCell = world.terrain
    .flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
    .find(({ cell, x, y }) =>
      cell.walkable && x > 0 && y > 0 && x < world.columns - 1 && y < world.rows - 1 &&
      !world.terrain[y][x - 1].walkable,
    );

  assert.deepEqual(moveWorldCell(start, { x: -1, y: 0 }, world), start);
  assert.ok(wallAdjacentCell);
  const walkableCell = { x: wallAdjacentCell.x, y: wallAdjacentCell.y };
  assert.deepEqual(moveWorldCell(walkableCell, { x: -1, y: 0 }, world), walkableCell);
  assert.equal(isWalkableCell(world, { x: 0, y: wallAdjacentCell.y }), false);
});
