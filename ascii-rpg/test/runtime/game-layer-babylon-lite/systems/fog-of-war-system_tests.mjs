import assert from "node:assert/strict";
import test from "node:test";
import {
  DISCOVERY_LIGHT_CUTOFF,
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

const profile = { radius: 6, maximum: 1, falloffExponent: 1 };

test("fog starts fully undiscovered and records the player's current cell", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  assert.equal(MINIMAP_WORLD_SCALE, 10);
  assert.equal(DISCOVERY_LIGHT_CUTOFF, 0.1);
  assert.equal(isDiscovered(fog, world, { x: 2, y: 2 }), false);
  discoverFromPlayer(fog, world, { x: 2, y: 2 }, { ...profile, maximum: 0 });
  assert.equal(isDiscovered(fog, world, { x: 2, y: 2 }), true);
  assert.equal(isDiscovered(fog, world, { x: 3, y: 2 }), false);
});

test("fog discovers clear walkable cells using player falloff and not torch or ambient inputs", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 2, y: 2 }, profile);
  assert.equal(isDiscovered(fog, world, { x: 6, y: 2 }), true);
  assert.equal(isDiscovered(fog, world, { x: 8, y: 2 }), false);
});

test("walls and unwalkable targets remain fogged regardless of shadow bleed", () => {
  const world = createWorld();
  world.terrain[2][4].walkable = false;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 2, y: 2 }, profile);
  assert.equal(isDiscovered(fog, world, { x: 4, y: 2 }), false);
  assert.equal(isDiscovered(fog, world, { x: 5, y: 2 }), false);
  assert.equal(isDiscovered(fog, world, { x: 2, y: 5 }), true);
});

test("minimap coverage uses only discovered walkable cells", () => {
  const world = createWorld();
  world.terrain[0][0].walkable = false;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 1, y: 1 }, { radius: 2, maximum: 1, falloffExponent: 1 });
  const coverage = getMinimapCoverage(fog, { x: 0, y: 0 });
  assert.ok(coverage > 0 && coverage < 1);
  assert.equal(getMinimapCoverage(fog, { x: 1, y: 1 }), 0);
});
