import assert from "node:assert/strict";
import test from "node:test";
import { buildGpuLightPassSamples, createGpuLightPassFrame, getGpuLightPassAlpha } from "../../../src/runtime/game-layer-babylon-lite/gpu-light-pass.js";

test("GPU light samples use visible, shadow-aware source contributions without mutation", () => {
  const region = { rows: 1, columns: 3 };
  const torchContributions = new Float64Array([1, 0, 0.25]);
  const playerContributions = new Float64Array([0, 0, 0.75]);
  const field = { torchContributions, playerContributions };
  const samples = buildGpuLightPassSamples(region, field);

  assert.deepEqual(samples, [
    { slot: 0, x: 0, y: 0, intensity: 1 },
    { slot: 2, x: 2, y: 0, intensity: 0.75 },
  ]);
  assert.deepEqual([...torchContributions], [1, 0, 0.25]);
  assert.deepEqual([...playerContributions], [0, 0, 0.75]);
});

test("GPU light frame is a centered soft mask suitable for additive composition", () => {
  const frame = createGpuLightPassFrame(5);
  assert.equal(frame.pixels.length, 100);
  assert.equal(frame.pixels[(2 * 5 + 2) * 4 + 3], 255);
  assert.equal(frame.pixels[3], 0);
});

test("GPU light falloff is shared by the game sprite and minimap glow", () => {
  assert.equal(getGpuLightPassAlpha(0), 1);
  assert.equal(getGpuLightPassAlpha(0.5), 0.125);
  assert.equal(getGpuLightPassAlpha(1), 0);
});

test("GPU light samples continuously use remaining ambient headroom", () => {
  const region = { rows: 1, columns: 1 };
  const field = { torchContributions: new Float64Array([1]), playerContributions: new Float64Array([0]) };
  assert.deepEqual(buildGpuLightPassSamples(region, field, 0.25), [{ slot: 0, x: 0, y: 0, intensity: 0.75 }]);
  assert.deepEqual(buildGpuLightPassSamples(region, field, 1), []);
});

test("GPU light samples can reuse caller-owned sample objects", () => {
  const region = { rows: 1, columns: 2 };
  const field = { torchContributions: new Float64Array([1, 0.5]) };
  const samples = [];
  const first = buildGpuLightPassSamples(region, field, 0, samples);
  const firstSample = first[0];
  const second = buildGpuLightPassSamples(region, field, 0.25, samples);

  assert.equal(first, samples);
  assert.equal(second, samples);
  assert.equal(second[0], firstSample);
  assert.deepEqual(second, [
    { slot: 0, x: 0, y: 0, intensity: 0.75 },
    { slot: 1, x: 1, y: 0, intensity: 0.375 },
  ]);
});
