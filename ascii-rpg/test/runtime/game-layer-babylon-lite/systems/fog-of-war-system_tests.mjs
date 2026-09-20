import assert from "node:assert/strict";
import test from "node:test";
import {
  DISCOVERY_LIGHT_CUTOFF,
  fogUnclearRadius,
  MINIMAP_WORLD_SCALE,
  createFogOfWar,
  discoverFromPlayer,
  getMinimapCoverage,
  isDiscovered,
} from "../../../../src/runtime/game-layer-babylon-lite/systems/fog-of-war-system.js";

function createWorld(rows = 12, columns = 12) {
  return {
    rows,
    columns,
    terrain: Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ walkable: true }))),
  };
}

test("fog starts fully undiscovered and records the player's current cell", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  assert.equal(MINIMAP_WORLD_SCALE, 10);
  assert.equal(DISCOVERY_LIGHT_CUTOFF, 0.1);
  assert.equal(isDiscovered(fog, world, { x: 2, y: 2 }), false);
  discoverFromPlayer(fog, world, { x: 2, y: 2 });
  assert.equal(isDiscovered(fog, world, { x: 2, y: 2 }), true);
  assert.equal(isDiscovered(fog, world, { x: 3, y: 2 }), true);
});

test("fog discovers clear walkable cells within the fixed five-grid radius", () => {
  const world = createWorld(50, 50);
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 25, y: 25 });
  assert.equal(fogUnclearRadius, 5);
  assert.equal(isDiscovered(fog, world, { x: 30, y: 25 }), true);
  assert.equal(isDiscovered(fog, world, { x: 31, y: 25 }), false);
});

test("discovered cells remain permanently unfogged after the player moves away", () => {
  const world = createWorld(50, 50);
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 25, y: 25 });
  discoverFromPlayer(fog, world, { x: 35, y: 25 });
  assert.equal(isDiscovered(fog, world, { x: 25, y: 25 }), true);
});

test("reveals the first blocking cell but not cells behind it", () => {
  const world = createWorld();
  world.terrain[2][4].walkable = false;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 2, y: 2 });
  assert.equal(isDiscovered(fog, world, { x: 4, y: 2 }), true);
  assert.equal(isDiscovered(fog, world, { x: 5, y: 2 }), false);
  assert.equal(isDiscovered(fog, world, { x: 2, y: 5 }), true);
});

test("minimap coverage uses only discovered walkable cells", () => {
  const world = createWorld(50, 50);
  world.terrain[0][0].walkable = false;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 8, y: 8 });
  const coverage = getMinimapCoverage(fog, { x: 0, y: 0 });
  assert.ok(coverage > 0 && coverage < 1);
  assert.equal(getMinimapCoverage(fog, { x: 20, y: 20 }), 0);
});
