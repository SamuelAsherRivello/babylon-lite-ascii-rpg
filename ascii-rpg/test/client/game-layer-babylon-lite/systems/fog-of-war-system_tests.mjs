import assert from "node:assert/strict";
import test from "node:test";
import {
  DISCOVERY_LIGHT_CUTOFF,
  fogUnclearRadius,
  MINIMAP_WORLD_SCALE,
  createFogOfWar,
  createFogMapsForWorld,
  discoverCell,
  discoverFromPlayer,
  discoverStartingArea,
  getFogVisibility,
  getMinimapCoverage,
  getRealmDiscoveryPercent,
  isDiscovered,
} from "../../../../src/client/game-layer-babylon-lite/systems/fog-of-war-system.js";

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
  assert.equal(fog.walkableCellCount, 144);
  assert.equal(fog.discoveredWalkableCount, 0);
  assert.equal(getRealmDiscoveryPercent(fog), 0);
  assert.equal(isDiscovered(fog, world, { x: 2, y: 2 }), false);
  discoverFromPlayer(fog, world, { x: 2, y: 2 });
  assert.equal(isDiscovered(fog, world, { x: 2, y: 2 }), true);
  assert.equal(isDiscovered(fog, world, { x: 3, y: 2 }), true);
  assert.ok(getRealmDiscoveryPercent(fog) > 0);
});

test("realm discovery percentage counts only unfogged walkable tiles", () => {
  const world = createWorld(2, 5);
  world.terrain[0][0].walkable = false;
  const fog = createFogOfWar(world);
  assert.equal(fog.walkableCellCount, 9);
  assert.equal(getRealmDiscoveryPercent(fog), 0);

  discoverCell(fog, world, { x: 1, y: 0 });
  discoverCell(fog, world, { x: 2, y: 0 });
  assert.equal(fog.discoveredWalkableCount, 2);
  assert.equal(getRealmDiscoveryPercent(fog), 22);

  discoverCell(fog, world, { x: 2, y: 0 });
  assert.equal(fog.discoveredWalkableCount, 2);
  assert.equal(getRealmDiscoveryPercent(fog), 22);

  assert.equal(discoverCell(fog, world, { x: 0, y: 0 }), false);
  assert.equal(fog.discoveredWalkableCount, 2);
  assert.equal(getRealmDiscoveryPercent(fog), 22);

  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.columns; x += 1) {
      discoverCell(fog, world, { x, y });
    }
  }
  assert.equal(fog.discoveredWalkableCount, 9);
  assert.equal(getRealmDiscoveryPercent(fog), 100);
});

test("generated world realms receive independent fog maps", () => {
  const overground = createWorld();
  const underground = createWorld();
  const worldRealms = { realms: { Overground: overground, Underground: underground } };
  const fogMaps = createFogMapsForWorld(worldRealms);

  assert.notEqual(fogMaps.Overground, fogMaps.Underground);
  discoverCell(fogMaps.Overground, overground, { x: 2, y: 2 });
  assert.equal(isDiscovered(fogMaps.Overground, overground, { x: 2, y: 2 }), true);
  assert.equal(isDiscovered(fogMaps.Underground, underground, { x: 2, y: 2 }), false);
  assert.ok(getRealmDiscoveryPercent(fogMaps.Overground) > 0);
  assert.equal(getRealmDiscoveryPercent(fogMaps.Underground), 0);
});

test("fog discovers clear walkable cells within the fixed five-grid radius", () => {
  const world = createWorld(50, 50);
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 25, y: 25 });
  assert.equal(fogUnclearRadius, 5);
  assert.equal(isDiscovered(fog, world, { x: 30, y: 25 }), true);
  assert.equal(isDiscovered(fog, world, { x: 31, y: 25 }), false);
});

test("fog uses the realm-specific discovery radius", () => {
  const underground = createWorld(50, 50);
  underground.fogUnclearRadius = 6;
  const undergroundFog = createFogOfWar(underground);
  discoverFromPlayer(undergroundFog, underground, { x: 25, y: 25 });
  assert.equal(undergroundFog.fogUnclearRadius, 6);
  assert.equal(isDiscovered(undergroundFog, underground, { x: 31, y: 25 }), true);
  assert.equal(isDiscovered(undergroundFog, underground, { x: 32, y: 25 }), false);

  const overground = createWorld(50, 50);
  overground.fogUnclearRadius = 11;
  const overgroundFog = createFogOfWar(overground);
  discoverFromPlayer(overgroundFog, overground, { x: 25, y: 25 });
  assert.equal(overgroundFog.fogUnclearRadius, 11);
  assert.equal(isDiscovered(overgroundFog, overground, { x: 36, y: 25 }), true);
  assert.equal(isDiscovered(overgroundFog, overground, { x: 37, y: 25 }), false);
});

test("starting fog reveal uses independent coverage extents and existing falloff", () => {
  const world = createWorld(30, 40);
  const fog = createFogOfWar(world);
  discoverStartingArea(fog, world, { x: 20, y: 15 }, {
    viewportColumns: 20,
    viewportRows: 10,
    coverageX: 0.5,
    coverageY: 0.6,
  });
  assert.equal(isDiscovered(fog, world, { x: 15, y: 12 }), true);
  assert.equal(isDiscovered(fog, world, { x: 24, y: 17 }), true);
  assert.equal(isDiscovered(fog, world, { x: 14, y: 15 }), false);
  assert.equal(isDiscovered(fog, world, { x: 20, y: 18 }), false);
  assert.equal(getFogVisibility(fog, world, { x: 20, y: 15 }), 100);
  assert.equal(getFogVisibility(fog, world, { x: 15, y: 15 }), 25);
});

test("starting fog reveal clamps its footprint and does not reveal another fog record", () => {
  const world = createWorld(8, 10);
  const fog = createFogOfWar(world);
  const inactiveFog = createFogOfWar(world);
  discoverStartingArea(fog, world, { x: 1, y: 1 }, {
    viewportColumns: 20,
    viewportRows: 20,
    coverageX: 0.95,
    coverageY: 0.95,
  });
  assert.equal([...fog.visibility].some((value) => value > 0), true);
  assert.equal([...inactiveFog.visibility].some((value) => value > 0), false);
  assert.equal(getFogVisibility(fog, world, { x: 9, y: 7 }) > 0, true);
});

test("fog uses persistent seventy-percent visibility bands", () => {
  const world = createWorld(50, 50);
  world.fogUnclearRadius = 10;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 25, y: 25 });
  assert.equal(getFogVisibility(fog, world, { x: 32, y: 25 }), 100);
  assert.equal(getFogVisibility(fog, world, { x: 33, y: 25 }), 75);
  assert.equal(getFogVisibility(fog, world, { x: 34, y: 25 }), 50);
  assert.equal(getFogVisibility(fog, world, { x: 35, y: 25 }), 25);
  assert.equal(getFogVisibility(fog, world, { x: 36, y: 25 }), 0);
});

test("fog retains the highest visibility reached by a cell", () => {
  const world = createWorld(50, 50);
  world.fogUnclearRadius = 4;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 25, y: 25 });
  assert.equal(getFogVisibility(fog, world, { x: 29, y: 25 }), 25);
  fog.fogUnclearRadius = 1;
  discoverFromPlayer(fog, world, { x: 20, y: 20 });
  assert.equal(getFogVisibility(fog, world, { x: 29, y: 25 }), 25);
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

test("minimap coverage averages persistent visibility values", () => {
  const world = createWorld(10, 10);
  world.fogUnclearRadius = 4;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 5, y: 5 });
  const expected = [...fog.visibility].reduce((total, value) => total + value, 0) / (100 * 100);
  assert.equal(getMinimapCoverage(fog, { x: 0, y: 0 }), expected);
  assert.ok(expected > 0 && expected < 1);
});
