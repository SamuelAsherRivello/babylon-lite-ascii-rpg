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

test("fog discovers clear walkable cells within the fixed unclear radius", () => {
  const world = createWorld(50, 50);
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 25, y: 25 });
  assert.equal(fogUnclearRadius, 20);
  assert.equal(isDiscovered(fog, world, { x: 44, y: 25 }), true);
  assert.equal(isDiscovered(fog, world, { x: 45, y: 25 }), false);
});

test("walls and unwalkable targets remain fogged regardless of shadow bleed", () => {
  const world = createWorld();
  world.terrain[2][4].walkable = false;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 2, y: 2 });
  assert.equal(isDiscovered(fog, world, { x: 4, y: 2 }), false);
  assert.equal(isDiscovered(fog, world, { x: 5, y: 2 }), false);
  assert.equal(isDiscovered(fog, world, { x: 2, y: 5 }), true);
});

test("minimap coverage uses only discovered walkable cells", () => {
  const world = createWorld(50, 50);
  world.terrain[0][0].walkable = false;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 15, y: 15 });
  const coverage = getMinimapCoverage(fog, { x: 0, y: 0 });
  assert.ok(coverage > 0 && coverage < 1);
  assert.equal(getMinimapCoverage(fog, { x: 4, y: 4 }), 0);
});
