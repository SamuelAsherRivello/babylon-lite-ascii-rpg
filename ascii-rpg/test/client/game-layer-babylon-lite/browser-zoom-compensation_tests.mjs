import test from "node:test";
import assert from "node:assert/strict";
import { getBrowserZoomCompensation, getBrowserZoomRatio } from "../../../src/client/game-layer-babylon-lite/browser-zoom-compensation.js";

test("derives browser zoom relative to the startup device pixel ratio", () => {
  assert.equal(getBrowserZoomRatio(1.25, 1), 1.25);
  assert.equal(getBrowserZoomRatio(0.8, 1), 0.8);
  assert.equal(getBrowserZoomRatio(0.25, 1), 0.25);
  assert.equal(getBrowserZoomRatio(4, 1), 4);
});

test("keeps coarse-pointer mobile presentation uncompensated", () => {
  assert.deepEqual(getBrowserZoomCompensation({ currentDevicePixelRatio: 1.25, baselineDevicePixelRatio: 1, isCoarsePointer: true }), {
    ratio: 1,
    inverse: 1,
    enabled: false,
  });
});

test("returns an inverse presentation scale for fine-pointer browser zoom", () => {
  assert.deepEqual(getBrowserZoomCompensation({ currentDevicePixelRatio: 1.25, baselineDevicePixelRatio: 1, isCoarsePointer: false }), {
    ratio: 1.25,
    inverse: 0.8,
    enabled: true,
  });
});
