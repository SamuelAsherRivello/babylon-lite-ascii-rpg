import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ZOOM,
  getEffectiveZoom,
  getNearestDisplayedZoom,
  getZoomScale,
  MAX_ZOOM,
  MIN_ZOOM,
  migrateLegacyZoom,
} from "../../../src/client/game-layer-babylon-lite/zoom-scale.js";

test("maps ten displayed zooms linearly between the requested endpoints", () => {
  const effective = Array.from({ length: MAX_ZOOM }, (_, index) => getEffectiveZoom(index + MIN_ZOOM));
  assert.equal(DEFAULT_ZOOM, 9);
  assert.equal(effective[0], 0.1);
  assert.equal(effective.at(-1), 10);
  assert.ok(effective.every((value, index) => index === 0 || value > effective[index - 1]));
  const differences = effective.slice(1).map((value, index) => value - effective[index]);
  assert.ok(differences.every((difference) => Math.abs(difference - differences[0]) < 1e-12));
  assert.ok(Math.abs(effective[1] - 1.2) < 1e-12);
  assert.equal(effective[4], 4.5);
  assert.equal(getZoomScale(1), 0.02);
  assert.equal(getZoomScale(10), 2);
});

test("migrates legacy zooms to their nearest effective displayed values", () => {
  assert.equal(migrateLegacyZoom(1), 2);
  assert.equal(migrateLegacyZoom(5), 5);
  assert.equal(migrateLegacyZoom(10), 10);
  assert.equal(getNearestDisplayedZoom(0), 1);
  assert.equal(getNearestDisplayedZoom(100), 10);
});
