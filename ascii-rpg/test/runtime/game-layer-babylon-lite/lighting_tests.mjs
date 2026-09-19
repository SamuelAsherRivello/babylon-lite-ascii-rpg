import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLightingToColor,
  createLightingConfig,
  DEFAULT_LIGHTING,
  getLightingFactor,
  getSceneLightingFactor,
  LIGHTING_PRESETS,
  LIGHTING_SOURCE_STATES,
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

test("walls and floor cells at equal distance receive equal lighting", () => {
  assert.equal(
    getLightingFactor({ x: 2, y: 0 }, [{ x: 0, y: 0 }]),
    getLightingFactor({ x: 0, y: 2 }, [{ x: 0, y: 0 }]),
  );
});

test("lighting configuration rejects invalid values", () => {
  assert.throws(() => createLightingConfig({ ambient: -0.1 }), /ambient/);
  assert.throws(() => createLightingConfig({ radius: 0 }), /radius/);
  assert.throws(() => createLightingConfig({ maximum: 0.2, ambient: 0.3 }), /maximum/);
  assert.throws(() => createLightingConfig({ falloffExponent: 0 }), /falloffExponent/);
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

test("lighting profiles expose the four source states", () => {
  assert.deepEqual(LIGHTING_PRESETS.map(({ label }) => label), LIGHTING_SOURCE_STATES);
  assert.equal(LIGHTING_PRESETS[0].config.maximum, 0);
  assert.ok(LIGHTING_PRESETS[1].config.maximum < LIGHTING_PRESETS[2].config.maximum);
  assert.ok(LIGHTING_PRESETS[2].config.maximum < LIGHTING_PRESETS[3].config.maximum);
});

test("level ambient blends source light and suppresses it at full ambient", () => {
  const torch = { x: 0, y: 0 };
  const player = { x: 10, y: 10 };
  const dark = getSceneLightingFactor({ x: 5, y: 0 }, [torch], player, {
    ambient: 0,
    torchProfile: LIGHTING_PRESETS[2].config,
    playerProfile: LIGHTING_PRESETS[0].config,
  });
  const full = getSceneLightingFactor({ x: 5, y: 0 }, [torch], player, {
    ambient: 1,
    torchProfile: LIGHTING_PRESETS[3].config,
    playerProfile: LIGHTING_PRESETS[3].config,
  });
  assert.ok(dark > 0 && dark < 1);
  assert.equal(full, 1);
});
