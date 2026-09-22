import assert from "node:assert/strict";
import test from "node:test";
import paletteData from "../../../../src/client/game-layer-babylon-lite/data/palette_data.json" with { type: "json" };
import {
  DEEP_WATER_GLYPH,
  FLOOR_GLYPH,
  HEALTH_GLYPH,
  UNDERGROUND_FLOOR_GLYPH,
  GOLD_GLYPH,
  GENERATION_PASSES,
  MOUNTAIN_GLYPH,
  MEDIUM_WATER_GLYPH,
  OBJECT_DISTRIBUTION_RULES,
  PLAYER_GLYPH,
  ENEMY_GLYPH,
  ENEMY_SPAWNER_GLYPH,
  PROJECT_MAP_GLYPHS,
  SHALLOW_WATER_GLYPH,
  TRAP_GLYPH,
  TORCH_GLYPH,
  STAIR_GLYPH,
  KEY_GLYPH,
  HORIZONTAL_FENCE_GLYPH,
  VERTICAL_FENCE_GLYPH,
  CLOSED_VERTICAL_DOOR_GLYPH,
  OPEN_VERTICAL_DOOR_GLYPH,
  CLOSED_HORIZONTAL_DOOR_GLYPH,
  OPEN_HORIZONTAL_DOOR_GLYPH,
  WALL_GLYPH,
  DEFAULT_WATER_FILL_PERCENT,
  createWorld,
  createWorldCooperative,
  createWorldRealms,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  isWalkableCell,
  clearCharacter,
  normalizePlayerMarkers,
  setCharacter,
} from "../../../../src/client/game-layer-babylon-lite/systems/world-system.js";
import { moveWorldCell } from "../../../../src/client/game-layer-babylon-lite/characters/player/player-grid.js";

function assertMinimumTorchDistance(torches, minimumDistance = OBJECT_DISTRIBUTION_RULES.torch.minimumDistance) {
  for (let index = 0; index < torches.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < torches.length; otherIndex += 1) {
      const deltaX = torches[index].x - torches[otherIndex].x;
      const deltaY = torches[index].y - torches[otherIndex].y;
      assert.ok(deltaX ** 2 + deltaY ** 2 >= minimumDistance ** 2);
    }
  }
}

test("publishes every glyph used by the project maps", () => {
  assert.deepEqual(new Set(PROJECT_MAP_GLYPHS), new Set([
    WALL_GLYPH,
    MOUNTAIN_GLYPH,
    FLOOR_GLYPH,
    UNDERGROUND_FLOOR_GLYPH,
    PLAYER_GLYPH,
    ENEMY_GLYPH,
    ENEMY_SPAWNER_GLYPH,
    TORCH_GLYPH,
    STAIR_GLYPH,
    GOLD_GLYPH,
    SHALLOW_WATER_GLYPH,
    MEDIUM_WATER_GLYPH,
    DEEP_WATER_GLYPH,
    HEALTH_GLYPH,
    TRAP_GLYPH,
    KEY_GLYPH,
    HORIZONTAL_FENCE_GLYPH,
    VERTICAL_FENCE_GLYPH,
    CLOSED_VERTICAL_DOOR_GLYPH,
    OPEN_VERTICAL_DOOR_GLYPH,
    CLOSED_HORIZONTAL_DOOR_GLYPH,
    OPEN_HORIZONTAL_DOOR_GLYPH,
  ]));
  assert.equal(paletteData.entries.find(({ glyph }) => glyph === ENEMY_GLYPH)?.color, "#fa8d8d");
  assert.equal(paletteData.entries.find(({ glyph }) => glyph === ENEMY_SPAWNER_GLYPH)?.color, "#ff3b3b");
});

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
  const water = first.terrain.flat().filter((cell) => cell.depth !== null);
  const shallow = water.filter((cell) => cell.depth === "shallow");
  const medium = water.filter((cell) => cell.depth === "medium");
  const deep = water.filter((cell) => cell.depth === "deep");
  const nonWalls = first.terrain.flat().filter((cell) => cell.glyph !== WALL_GLYPH);

  assert.deepEqual(first.generationPasses, GENERATION_PASSES);
  assert.deepEqual(first.terrain, second.terrain);
  assert.deepEqual(first.waterCells, second.waterCells);
  assert.deepEqual(first.waterLakes, second.waterLakes);
  assert.ok(shallow.length > 0);
  assert.ok(medium.length > 0);
  assert.ok(deep.length > 0);
  assert.ok(water.length / nonWalls.length >= 0.05);
  assert.ok(water.length / nonWalls.length <= 0.5);
  assert.ok(first.waterLakes.length >= 1);
  assert.ok(first.waterLakes.length <= 2);
  assert.ok(first.waterLakes.every((lake) => lake.length >= 50 && lake.length <= 480));
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
  assert.equal(DEEP_WATER_GLYPH, "▓");
  assert.notEqual(DEEP_WATER_GLYPH, MEDIUM_WATER_GLYPH);
  assert.equal(first.terrain[first.playerStart.y][first.playerStart.x].walkable, true);
  assert.notEqual(first.terrain[first.playerStart.y][first.playerStart.x].glyph, MEDIUM_WATER_GLYPH);
  assert.notEqual(first.terrain[first.playerStart.y][first.playerStart.x].glyph, DEEP_WATER_GLYPH);
});

test("uses independent water coverage and depth walkability settings", () => {
  const dry = createWorld({ rows: 20, columns: 30, waterFillPercent: 0, seed: "dry-cave" });
  const wet = createWorld({ rows: 20, columns: 30, waterFillPercent: 100, seed: "wet-cave" });

  assert.equal(dry.options.waterFillPercent, 0);
  assert.equal(dry.waterCells.length, 0);
  assert.equal(wet.options.waterFillPercent, 100);
  assert.ok(wet.waterCells.length > 0);
  for (const cell of wet.terrain.flat()) {
    if (cell.depth === "shallow") assert.equal(cell.walkable, true);
    if (cell.depth === "medium" || cell.depth === "deep") {
      assert.equal(cell.walkable, false);
    }
  }
});

test("generates the production-sized world with sparse large-body water population", () => {
  const world = createWorld({ rows: 512, columns: 512, seed: "production-world" });
  const nonWalls = world.terrain.flat().filter((cell) => cell.glyph !== WALL_GLYPH).length;
  const coverage = world.waterCells.length / nonWalls;

  assert.ok(coverage <= 0.01);
  assert.ok(world.waterLakes.length <= 2);
  assert.ok(world.waterLakes.every((lake) => lake.length >= 50 && lake.length <= 480));
});

test("uses restrained water frequency in default worlds", () => {
  const worlds = Array.from({ length: 100 }, (_, index) => createWorld({
    rows: 40,
    columns: 60,
    seed: `water-frequency-${index}`,
  }));
  const waterWorlds = worlds.filter((world) => world.waterCells.length > 0);
  assert.equal(DEFAULT_WATER_FILL_PERCENT, 30);
  assert.ok(waterWorlds.length > 10 && waterWorlds.length < 60, "default water frequency should be near 30%");
  assert.ok(waterWorlds.every((world) => world.waterLakes.length >= 1 && world.waterLakes.length <= 2));
});

test("distributes deterministic spaced torches on wall-adjacent walkable cells", () => {
  const first = createWorld({ rows: 12, columns: 20, seed: "torches" });
  const second = createWorld({ rows: 12, columns: 20, seed: "torches" });
  const torches = first.torches;

  assert.equal(OBJECT_DISTRIBUTION_RULES.torch.minimumDistance, 25);
  assert.ok(torches.length > 0 && torches.length < 3);
  assert.deepEqual(torches, second.torches);
  assert.equal(first.characters.flat().filter((glyph) => glyph === TORCH_GLYPH).length, torches.length);
  assertMinimumTorchDistance(torches);

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

test("honors a density-derived requested torch count when spacing permits", () => {
  const world = createWorld({ rows: 80, columns: 80, torchCount: 5, seed: "torch-density" });

  assert.equal(world.options.torchCount, 5);
  assert.equal(world.torches.length, 5);
  assert.equal(world.characters.flat().filter((glyph) => glyph === TORCH_GLYPH).length, 5);
  assertMinimumTorchDistance(world.torches);
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

test("restores an active pickup after the player leaves its cell", () => {
  const world = createWorld({ rows: 12, columns: 20, seed: "pickup-overlay" });
  const cell = { x: 2, y: 2 };
  world.characters[cell.y][cell.x] = PLAYER_GLYPH;
  world.pickups = [{ id: "gold-1", active: true, cell, glyph: GOLD_GLYPH }];
  clearCharacter(world, cell);
  assert.equal(getVisibleGlyph(world, cell), GOLD_GLYPH);
  world.pickups[0].active = false;
  clearCharacter(world, cell);
  assert.equal(getVisibleGlyph(world, cell), WALL_GLYPH);
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

test("normalizes stale player markers while restoring the underlying cell", () => {
  const world = createWorld({ rows: 20, columns: 20, seed: "single-player-overlay" });
  const arrival = world.terrain
    .flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
    .find(({ cell, x, y }) => cell.walkable && (x !== world.playerStart.x || y !== world.playerStart.y));
  assert.ok(arrival);
  world.stairs = [{ x: arrival.x, y: arrival.y }];
  world.characters[arrival.y][arrival.x] = STAIR_GLYPH;
  setCharacter(world, arrival, PLAYER_GLYPH);

  assert.equal(normalizePlayerMarkers(world), 2);
  assert.equal(world.characters[world.playerStart.y][world.playerStart.x], null);
  assert.equal(world.characters[arrival.y][arrival.x], STAIR_GLYPH);
  setCharacter(world, arrival, PLAYER_GLYPH);
  assert.equal(world.characters.flat().filter((glyph) => glyph === PLAYER_GLYPH).length, 1);
  assert.equal(getVisibleGlyph(world, arrival), PLAYER_GLYPH);
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

test("cooperative generation preserves completed spaced torch world data and ordered phases", async () => {
  const options = { rows: 128, columns: 128, torchCount: 9, seed: "cooperative-equality" };
  const synchronous = createWorld(options);
  const phases = [];
  let yields = 0;
  const cooperative = await createWorldCooperative(options, {
    sliceMs: 0,
    yieldToFrame: async () => { yields += 1; },
    onPhase: (phase) => phases.push(phase),
  });
  assert.deepEqual(cooperative, synchronous);
  assert.equal(cooperative.torches.length, 9);
  assertMinimumTorchDistance(cooperative.torches);
  assert.deepEqual(phases, ["cave", "cave-region", "water-lakes", "water", "walkability-region", "terrain", "complete"]);
  assert.ok(yields > 1);
});

test("creates deterministic paired realm stairs on walkable terrain", async () => {
  const options = { rows: 256, columns: 256, torchCount: 3, seed: "paired-realms" };
  const first = await createWorldRealms(options);
  const second = await createWorldRealms(options);
  const overground = first.realms.Overground;
  const underground = first.realms.Underground;

  assert.deepEqual(first, second);
  assert.equal(overground.realm, "Overground");
  assert.equal(underground.realm, "Underground");
  assert.equal(overground.fogUnclearRadius, 11);
  assert.equal(underground.fogUnclearRadius, 6);
  assert.ok(overground.terrain.flat().some((cell) => cell.glyph === FLOOR_GLYPH && cell.walkable));
  assert.ok(underground.terrain.flat().some((cell) => cell.glyph === UNDERGROUND_FLOOR_GLYPH && cell.walkable));
  assert.ok(overground.terrain.flat().some((cell) => cell.glyph === MOUNTAIN_GLYPH));
  assert.ok(underground.terrain.flat().some((cell) => cell.glyph === WALL_GLYPH));
  assert.deepEqual(overground.stairs, underground.stairs);
  for (const stair of overground.stairs) {
    assert.equal(overground.terrain[stair.y][stair.x].walkable, true);
    assert.equal(underground.terrain[stair.y][stair.x].walkable, true);
    assert.equal(overground.characters[stair.y][stair.x], STAIR_GLYPH);
    assert.equal(underground.characters[stair.y][stair.x], STAIR_GLYPH);
  }
});

test("applies deterministic pass-scoped realm settings without breaking valid starts", async () => {
  const options = {
    rows: 128, columns: 128, torchCount: 2, seed: "density-profile",
    wallFillOffset: -10, waterFillPercent: 15, minWalkableMultiplier: 0.8, playerStartMode: "broad",
  };
  const first = await createWorldRealms(options);
  const second = await createWorldRealms(options);

  assert.deepEqual(first, second);
  assert.equal(first.realms.Overground.options.wallFillPercent, 15);
  assert.equal(first.realms.Underground.options.wallFillPercent, 40);
  assert.equal(first.realms.Overground.options.waterFillPercent, 15);
  for (const realm of Object.values(first.realms)) {
    const start = realm.playerStart;
    assert.equal(realm.terrain[start.y][start.x].walkable, true);
  }
});

test("realm activation state keeps exactly one player at the paired arrival cell", async () => {
  const { realms } = await createWorldRealms({ rows: 96, columns: 96, torchCount: 2, seed: "single-player-realms" });
  const overground = realms.Overground;
  const underground = realms.Underground;
  const stair = overground.stairs[0];

  for (const realm of [overground, underground, overground, underground]) {
    normalizePlayerMarkers(realm);
    setCharacter(realm, stair, PLAYER_GLYPH);
    assert.equal(realm.characters.flat().filter((glyph) => glyph === PLAYER_GLYPH).length, 1);
    assert.equal(getVisibleGlyph(realm, stair), PLAYER_GLYPH);
  }
});

test("realm profiles expose independent starting fog coverage", async () => {
  const { realms } = await createWorldRealms({ rows: 32, columns: 48, torchCount: 1, seed: "starting-fog-coverage" });
  assert.deepEqual(realms.Overground.startingFogClearCoverage, { x: 0.95, y: 0.95 });
  assert.deepEqual(realms.Underground.startingFogClearCoverage, { x: 0.6, y: 0.6 });
  assert.equal(Number.isFinite(realms.Overground.fogUnclearRadius), true);
  assert.equal(Number.isFinite(realms.Underground.fogUnclearRadius), true);
});

test("uses the configured stairs glyph instead of the legacy S glyph", () => {
  assert.equal(STAIR_GLYPH, "▤");
});

test("aborted generation never publishes a partial world and a replacement can finish", async () => {
  const options = { rows: 40, columns: 60, seed: "replacement" };
  const controller = new AbortController();
  let yielded = false;
  const stale = createWorldCooperative(options, {
    signal: controller.signal,
    sliceMs: 0,
    yieldToFrame: async () => {
      yielded = true;
      controller.abort();
    },
  });
  await assert.rejects(stale, { name: "AbortError" });
  assert.equal(yielded, true);
  const replacement = await createWorldCooperative(options, {
    sliceMs: 0,
    yieldToFrame: async () => {},
  });
  assert.deepEqual(replacement, createWorld(options));
});
