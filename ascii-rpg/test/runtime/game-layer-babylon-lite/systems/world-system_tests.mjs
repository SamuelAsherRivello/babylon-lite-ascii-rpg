import assert from "node:assert/strict";
import test from "node:test";
import {
  DEEP_WATER_GLYPH,
  FLOOR_GLYPH,
  GENERATION_PASSES,
  MEDIUM_WATER_GLYPH,
  PLAYER_GLYPH,
  SHALLOW_WATER_GLYPH,
  TORCH_GLYPH,
  WALL_GLYPH,
  createWorld,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  isWalkableCell,
  clearCharacter,
  setCharacter,
} from "../../../../src/runtime/game-layer-babylon-lite/systems/world-system.js";
import { moveWorldCell } from "../../../../src/runtime/game-layer-babylon-lite/characters/player/player-grid.js";

test("creates a repeatable bordered world with layered terrain", () => {
  const first = createWorld({ rows: 12, columns: 20, seed: "cave" });
  const second = createWorld({ rows: 12, columns: 20, seed: "cave" });

  assert.equal(first.rows, 12);
  assert.equal(first.columns, 20);
  assert.deepEqual(first.terrain, second.terrain);
  assert.equal(first.terrain[0][0].glyph, WALL_GLYPH);
  assert.equal(first.terrain[11][19].walkable, false);
  assert.ok(first.terrain[0].every((cell) => cell.glyph === WALL_GLYPH));
  assert.ok(first.terrain[11].every((cell) => cell.glyph === WALL_GLYPH));
  assert.ok(first.terrain.every((row) => row[0].glyph === WALL_GLYPH && row[19].glyph === WALL_GLYPH));
  assert.equal(first.characters[first.playerStart.y][first.playerStart.x], PLAYER_GLYPH);
  assert.equal(isWalkableCell(first, first.playerStart), true);
  assert.ok(first.terrain.flat().some((cell) => cell.glyph === FLOOR_GLYPH));
});

test("runs ordered generation passes and creates nested deterministic water", () => {
  const first = createWorld({ rows: 40, columns: 60, seed: "water-passes" });
  const second = createWorld({ rows: 40, columns: 60, seed: "water-passes" });
  const water = first.terrain.flat().filter((cell) => [
    SHALLOW_WATER_GLYPH,
    MEDIUM_WATER_GLYPH,
    DEEP_WATER_GLYPH,
  ].includes(cell.glyph));
  const shallow = water.filter((cell) => cell.glyph === SHALLOW_WATER_GLYPH);
  const medium = water.filter((cell) => cell.glyph === MEDIUM_WATER_GLYPH);
  const deep = water.filter((cell) => cell.glyph === DEEP_WATER_GLYPH);
  const nonWalls = first.terrain.flat().filter((cell) => cell.glyph !== WALL_GLYPH);

  assert.deepEqual(first.generationPasses, GENERATION_PASSES);
  assert.deepEqual(first.terrain, second.terrain);
  assert.deepEqual(first.waterCells, second.waterCells);
  assert.deepEqual(first.waterLakes, second.waterLakes);
  assert.ok(shallow.length > 0);
  assert.ok(medium.length > 0);
  assert.ok(deep.length > 0);
  assert.ok(water.length / nonWalls.length >= 0.1);
  assert.ok(water.length / nonWalls.length <= 0.3);
  assert.ok(first.waterLakes.length > 0);
  assert.ok(first.waterLakes.every((lake) => lake.length >= 5 && lake.length <= 20));
  for (const lake of first.waterLakes) {
    const lakeKeys = new Set(lake.map((cell) => `${cell.x},${cell.y}`));
    for (const cell of lake) {
      if (first.terrain[cell.y][cell.x].depth !== "deep") continue;
      const neighbors = [
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x - 1, y: cell.y },
      ].filter((neighbor) => lakeKeys.has(`${neighbor.x},${neighbor.y}`));
      assert.ok(neighbors.some((neighbor) => first.terrain[neighbor.y][neighbor.x].depth === "medium"));
      assert.ok(neighbors.every((neighbor) => first.terrain[neighbor.y][neighbor.x].depth !== "shallow"));
    }
  }
  assert.equal(shallow[0].color, "#62c7ff");
  assert.equal(medium[0].color, "#247fc3");
  assert.equal(deep[0].color, "#0b3d91");
  assert.equal(first.terrain[first.playerStart.y][first.playerStart.x].walkable, true);
  assert.notEqual(first.terrain[first.playerStart.y][first.playerStart.x].glyph, MEDIUM_WATER_GLYPH);
  assert.notEqual(first.terrain[first.playerStart.y][first.playerStart.x].glyph, DEEP_WATER_GLYPH);
});

test("uses independent water coverage and depth walkability settings", () => {
  const dry = createWorld({ rows: 20, columns: 30, waterFillPercent: 0, seed: "dry-cave" });
  const wet = createWorld({ rows: 20, columns: 30, waterFillPercent: 20, seed: "wet-cave" });

  assert.equal(dry.options.waterFillPercent, 0);
  assert.equal(dry.waterCells.length, 0);
  assert.equal(wet.options.waterFillPercent, 20);
  assert.ok(wet.waterCells.length > 0);
  for (const cell of wet.terrain.flat()) {
    if (cell.glyph === SHALLOW_WATER_GLYPH) assert.equal(cell.walkable, true);
    if (cell.glyph === MEDIUM_WATER_GLYPH || cell.glyph === DEEP_WATER_GLYPH) {
      assert.equal(cell.walkable, false);
    }
  }
});

test("generates the production-sized world without collapsing lake coverage", () => {
  const world = createWorld({ rows: 512, columns: 512, seed: "production-world" });
  const nonWalls = world.terrain.flat().filter((cell) => cell.glyph !== WALL_GLYPH).length;
  const coverage = world.waterCells.length / nonWalls;

  assert.ok(coverage >= 0.15);
  assert.ok(coverage <= 0.25);
  assert.ok(world.waterLakes.every((lake) => lake.length >= 5 && lake.length <= 20));
});

test("places three deterministic torches on wall-adjacent walkable cells", () => {
  const first = createWorld({ rows: 12, columns: 20, seed: "torches" });
  const second = createWorld({ rows: 12, columns: 20, seed: "torches" });
  const torches = first.torches;

  assert.equal(torches.length, 3);
  assert.deepEqual(torches, second.torches);
  assert.equal(first.characters.flat().filter((glyph) => glyph === TORCH_GLYPH).length, 3);

  for (const torch of torches) {
    assert.equal(first.terrain[torch.y][torch.x].walkable, true);
    assert.notDeepEqual(torch, first.playerStart);
    assert.ok([
      first.terrain[torch.y - 1]?.[torch.x],
      first.terrain[torch.y]?.[torch.x + 1],
      first.terrain[torch.y + 1]?.[torch.x],
      first.terrain[torch.y]?.[torch.x - 1],
    ].some((cell) => cell?.walkable === false));
    assert.equal(getVisibleGlyph(first, torch), TORCH_GLYPH);
  }
});

test("restores a torch after the player leaves its cell", () => {
  const world = createWorld({ rows: 12, columns: 20, seed: "torch-overlay" });
  const torch = world.torches[0];
  world.characters[torch.y][torch.x] = PLAYER_GLYPH;

  assert.equal(getVisibleGlyph(world, torch), PLAYER_GLYPH);
  clearCharacter(world, torch);
  assert.equal(getVisibleGlyph(world, torch), TORCH_GLYPH);
  assert.equal(isWalkableCell(world, torch), true);
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
