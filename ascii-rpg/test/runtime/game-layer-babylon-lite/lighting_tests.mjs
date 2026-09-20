import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLightingToColor,
  createLightingConfig,
  createSceneLightingFieldCache,
  DEFAULT_LIGHTING,
  DEFAULT_SHADOW_SETTINGS,
  getLightingFactor,
  getShadowProfile,
  getSceneLightingFactor,
  getShadowDistanceBeyondFirstBlocker,
  hasClearLightPath,
  LIGHTING_PRESETS,
  LIGHTING_SOURCE_STATES,
  SHADOW_PROFILES,
  SHADOW_SOURCE_STATES,
} from "../../../src/runtime/game-layer-babylon-lite/lighting.js";

test("lighting uses ambient outside the configured radius", () => {
  assert.equal(getLightingFactor({ x: 10, y: 10 }, [{ x: 0, y: 0 }]), DEFAULT_LIGHTING.ambient);
  assert.equal(getLightingFactor({ x: 6, y: 0 }, [{ x: 0, y: 0 }]), DEFAULT_LIGHTING.ambient);
});

test("lighting reaches maximum at the torch and falls off circularly", () => {
  assert.equal(getLightingFactor({ x: 0, y: 0 }, [{ x: 0, y: 0 }]), DEFAULT_LIGHTING.maximum);
  assert.equal(
    getLightingFactor({ x: 3, y: 0 }, [{ x: 0, y: 0 }]),
    getLightingFactor({ x: 0, y: 3 }, [{ x: 0, y: 0 }]),
  );
  assert.ok(getLightingFactor({ x: 2, y: 0 }, [{ x: 0, y: 0 }]) > DEFAULT_LIGHTING.ambient);
});

test("overlapping torches use the strongest bounded contribution", () => {
  const one = getLightingFactor({ x: 3, y: 0 }, [{ x: 0, y: 0 }]);
  const two = getLightingFactor({ x: 3, y: 0 }, [{ x: 0, y: 0 }, { x: 3, y: 0 }]);
  assert.equal(two, DEFAULT_LIGHTING.maximum);
  assert.ok(two >= one);
});

function makeTerrain(rows = 5, columns = 7) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({ walkable: true })));
}

const darkScene = {
  ambient: 0,
  torchProfile: LIGHTING_PRESETS[3].config,
  playerProfile: LIGHTING_PRESETS[0].config,
};

test("grid light path lights the first blocker and closes diagonal corners", () => {
  const terrain = makeTerrain();
  const source = { x: 1, y: 2 };
  const wall = { x: 3, y: 2 };
  terrain[2][3] = { walkable: false };
  assert.equal(hasClearLightPath(source, { x: 2, y: 2 }, terrain), true);
  assert.equal(hasClearLightPath(source, wall, terrain), true);
  assert.equal(hasClearLightPath(source, { x: 4, y: 2 }, terrain), false);
  assert.equal(hasClearLightPath(source, { x: 7, y: 2 }, terrain), false);

  const corner = makeTerrain();
  corner[1][2] = { walkable: false };
  assert.equal(hasClearLightPath({ x: 1, y: 1 }, { x: 3, y: 3 }, corner), false);
  assert.equal(hasClearLightPath({ x: 3, y: 3 }, { x: 1, y: 1 }, corner), false);
});

test("shadow distance begins immediately behind the first blocker", () => {
  const terrain = makeTerrain();
  terrain[2][3] = { walkable: false };
  assert.equal(getShadowDistanceBeyondFirstBlocker({ x: 1, y: 2 }, { x: 2, y: 2 }, terrain), 0);
  assert.ok(getShadowDistanceBeyondFirstBlocker({ x: 1, y: 2 }, { x: 4, y: 2 }, terrain) >= 1);
});

test("a blocked cell lights up but casts a straight shadow behind it", () => {
  const terrain = makeTerrain();
  const torch = { x: 1, y: 2 };
  terrain[2][3] = { walkable: false, kind: "wall" };
  assert.ok(getSceneLightingFactor({ x: 2, y: 2 }, [torch], null, darkScene, terrain) > 0);
  assert.ok(getSceneLightingFactor({ x: 3, y: 2 }, [torch], null, darkScene, terrain) > 0);
  assert.equal(getSceneLightingFactor({ x: 4, y: 2 }, [torch], null, darkScene, terrain), 0);
});

test("every unwalkable water depth blocks source light", () => {
  for (const kind of ["mediumWater", "deepWater"]) {
    const terrain = makeTerrain();
    terrain[2][3] = { walkable: false, kind };
    assert.equal(
      getSceneLightingFactor({ x: 4, y: 2 }, [{ x: 1, y: 2 }], null, darkScene, terrain),
      0,
      kind,
    );
  }
});

test("light does not slip through a closed diagonal corner", () => {
  const terrain = makeTerrain();
  terrain[1][2] = { walkable: false, kind: "wall" };
  assert.equal(
    getSceneLightingFactor({ x: 3, y: 3 }, [{ x: 1, y: 1 }], null, darkScene, terrain),
    0,
  );
});

test("another unblocked source can brighten a cell in a wall shadow", () => {
  const terrain = makeTerrain();
  terrain[2][3] = { walkable: false, kind: "wall" };
  const target = { x: 4, y: 2 };
  const blocked = getSceneLightingFactor(target, [{ x: 1, y: 2 }], null, darkScene, terrain);
  const playerScene = { ...darkScene, playerProfile: LIGHTING_PRESETS[3].config };
  const rescued = getSceneLightingFactor(target, [{ x: 1, y: 2 }], { x: 5, y: 2 }, playerScene, terrain);
  assert.equal(blocked, 0);
  assert.ok(rescued > 0);
});

test("scene source profiles retain their radius and distance falloff", () => {
  const terrain = makeTerrain();
  const torch = { x: 1, y: 2 };
  const near = { x: 2, y: 2 };
  const far = { x: 4, y: 2 };
  const factors = LIGHTING_PRESETS.map(({ config }) =>
    getSceneLightingFactor(far, [torch], null, {
      ambient: 0, torchProfile: config, playerProfile: LIGHTING_PRESETS[0].config,
    }, terrain));
  assert.equal(factors[0], 0);
  assert.ok(factors[1] > 0 && factors[1] < factors[2] && factors[2] < factors[3]);
  assert.ok(getSceneLightingFactor(near, [torch], null, darkScene, terrain) > factors[3]);
  assert.equal(getSceneLightingFactor({ x: 6, y: 2 }, [torch], null, {
    ...darkScene, torchProfile: LIGHTING_PRESETS[1].config,
  }, terrain), 0);
});

test("shadowed cells retain ambient and strongest unblocked source wins", () => {
  const terrain = makeTerrain();
  terrain[2][3] = { walkable: false };
  const target = { x: 4, y: 2 };
  const blockedTorch = { x: 1, y: 2 };
  const openTorch = { x: 5, y: 2 };
  const ambient = getSceneLightingFactor(target, [blockedTorch], null, {
    ...darkScene, ambient: 0.35,
  }, terrain);
  assert.equal(ambient, 0.35);
  assert.equal(getSceneLightingFactor(target, [blockedTorch], null, darkScene, terrain), 0);
  assert.equal(getSceneLightingFactor(target, [blockedTorch], null, {
    ...darkScene, ambient: 1,
  }, terrain), 1);
  const one = getSceneLightingFactor(target, [openTorch], null, darkScene, terrain);
  const two = getSceneLightingFactor(target, [blockedTorch, openTorch], null, darkScene, terrain);
  assert.equal(two, one);
  assert.ok(two > 0 && two <= 1);
});

test("visible lighting field matches direct scene factors inside region bounds", () => {
  const terrain = makeTerrain();
  terrain[2][3] = { walkable: false };
  const world = { terrain };
  const region = { x: 1, y: 1, columns: 4, rows: 3 };
  const torches = [{ x: 1, y: 2 }, { x: 100, y: 100 }];
  const player = { x: 4, y: 3 };
  const settings = { ...darkScene, playerProfile: LIGHTING_PRESETS[2].config };
  const field = createSceneLightingFieldCache().get(world, region, torches, player, settings);
  assert.equal(field.torchContributions.length, 12);
  assert.equal(field.playerContributions.length, 12);
  assert.equal(field.getFactor({ x: 0, y: 2 }), 0);
  for (let y = region.y; y < region.y + region.rows; y += 1) {
    for (let x = region.x; x < region.x + region.columns; x += 1) {
      const cell = { x, y };
      assert.equal(field.getFactor(cell), getSceneLightingFactor(cell, torches, player, settings, terrain));
    }
  }
});

test("torch and player fields invalidate independently for their changing inputs", () => {
  const world = { terrain: makeTerrain() };
  const region = { x: 1, y: 1, columns: 4, rows: 3 };
  const torches = [{ x: 1, y: 2 }];
  const player = { x: 4, y: 2 };
  const settings = { ...darkScene, playerProfile: LIGHTING_PRESETS[2].config };
  const cache = createSceneLightingFieldCache();
  const first = cache.get(world, region, torches, player, settings);
  const ambientChanged = cache.get(world, region, torches, player, { ...settings, ambient: 0.4 });
  assert.equal(ambientChanged.torchContributions, first.torchContributions);
  assert.equal(ambientChanged.playerContributions, first.playerContributions);
  assert.ok(ambientChanged.getFactor({ x: 3, y: 2 }) > first.getFactor({ x: 3, y: 2 }));

  const moved = cache.get(world, region, torches, { x: 4, y: 3 }, settings);
  assert.equal(moved.torchContributions, first.torchContributions);
  assert.notEqual(moved.playerContributions, first.playerContributions);
  assert.notEqual(moved.getFactor({ x: 4, y: 2 }), first.getFactor({ x: 4, y: 2 }));

  const torchChanged = cache.get(world, region, torches, { x: 4, y: 3 }, {
    ...settings, torchProfile: LIGHTING_PRESETS[1].config,
  });
  assert.notEqual(torchChanged.torchContributions, moved.torchContributions);
  assert.equal(torchChanged.playerContributions, moved.playerContributions);

  const shifted = cache.get(world, { ...region, x: 2 }, torches, { x: 4, y: 3 }, settings);
  assert.notEqual(shifted.torchContributions, torchChanged.torchContributions);
  assert.notEqual(shifted.playerContributions, torchChanged.playerContributions);

  const newTerrain = makeTerrain();
  newTerrain[2][3] = { walkable: false };
  const replaced = cache.get({ terrain: newTerrain }, region, torches, player, settings);
  assert.notEqual(replaced.torchContributions, first.torchContributions);
  assert.equal(replaced.torchContributions[7], 0);
});

test("lighting configuration rejects invalid values", () => {
  assert.throws(() => createLightingConfig({ ambient: -0.1 }), /ambient/);
  assert.throws(() => createLightingConfig({ radius: 0 }), /radius/);
  assert.throws(() => createLightingConfig({ maximum: 0.2, ambient: 0.3 }), /maximum/);
  assert.throws(() => createLightingConfig({ falloffExponent: 0 }), /falloffExponent/);
  assert.throws(() => getSceneLightingFactor({ x: 0, y: 0 }, [], null), /terrain/);
});

test("palette modulation preserves hue relationships and owns opacity", () => {
  const base = [0.8, 0.4, 0.2, 0.25];
  const ambient = applyLightingToColor(base, DEFAULT_LIGHTING.ambient);
  const lit = applyLightingToColor(base, DEFAULT_LIGHTING.maximum);
  assert.deepEqual(lit, [0.8, 0.4, 0.2, 1]);
  assert.equal(ambient[3], DEFAULT_LIGHTING.ambient);
  assert.ok(ambient[0] > ambient[1]);
  assert.ok(ambient[1] > ambient[2]);
  assert.equal(base[3], 0.25);
});

test("lighting and shadow profiles expose independent five-state controls", () => {
  assert.deepEqual(LIGHTING_PRESETS.map(({ label }) => label), LIGHTING_SOURCE_STATES);
  assert.deepEqual(LIGHTING_SOURCE_STATES, ["Off", "Low", "Med", "High", "X High"]);
  assert.deepEqual(LIGHTING_PRESETS.map(({ config }) => ({
    radius: config.radius,
    maximum: config.maximum,
    falloffExponent: config.falloffExponent,
  })), [
    { radius: 1, maximum: 0, falloffExponent: 1 },
    { radius: 5, maximum: 0.7, falloffExponent: 1.75 },
    { radius: 8, maximum: 0.85, falloffExponent: 1.5 },
    { radius: 12, maximum: 1, falloffExponent: 1.25 },
    { radius: 16, maximum: 1, falloffExponent: 1 },
  ]);
  assert.deepEqual(SHADOW_SOURCE_STATES, LIGHTING_SOURCE_STATES);
  assert.deepEqual(SHADOW_PROFILES.map(({ config }) => config), [
    { occlusion: 0, bleed: 1 },
    { occlusion: 0.25, bleed: 0.75 },
    { occlusion: 0.5, bleed: 0.5 },
    { occlusion: 0.75, bleed: 0.25 },
    DEFAULT_SHADOW_SETTINGS,
  ]);
  assert.equal(getShadowProfile("unrecognized").config, DEFAULT_SHADOW_SETTINGS);
});

test("shadow profiles progressively bleed less light behind terrain", () => {
  const terrain = makeTerrain();
  terrain[2][3] = { walkable: false };
  const settings = {
    ambient: 0,
    torchProfile: LIGHTING_PRESETS[4].config,
    playerProfile: LIGHTING_PRESETS[0].config,
  };
  const factors = SHADOW_PROFILES.map(({ config }) => getSceneLightingFactor(
    { x: 4, y: 2 }, [{ x: 1, y: 2 }], null, { ...settings, torchShadow: config }, terrain,
  ));
  assert.ok(factors[0] > factors[1] && factors[1] > factors[2] && factors[2] > factors[3]);
  assert.equal(factors[4], 0);
});

test("level ambient blends source light and suppresses it at full ambient", () => {
  const torch = { x: 0, y: 0 };
  const player = { x: 10, y: 10 };
  const dark = getSceneLightingFactor({ x: 5, y: 0 }, [torch], player, {
    ambient: 0,
    torchProfile: LIGHTING_PRESETS[2].config,
    playerProfile: LIGHTING_PRESETS[0].config,
  }, makeTerrain(11, 11));
  const full = getSceneLightingFactor({ x: 5, y: 0 }, [torch], player, {
    ambient: 1,
    torchProfile: LIGHTING_PRESETS[3].config,
    playerProfile: LIGHTING_PRESETS[3].config,
  }, makeTerrain(11, 11));
  assert.ok(dark > 0 && dark < 1);
  assert.equal(full, 1);
});
