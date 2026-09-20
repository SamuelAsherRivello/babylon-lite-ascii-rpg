import assert from "node:assert/strict";
import test from "node:test";
import {
  CAMERA_MODE_LABELS,
  DEFAULT_CAMERA_MODE,
  getCameraModeLabel,
  getNextCameraMode,
  normalizeCameraMode,
} from "../../../src/runtime/bridge-layer/camera.js";

test("camera mode values normalize safely and cycle in the visible order", () => {
  assert.equal(DEFAULT_CAMERA_MODE, "lock");
  assert.equal(normalizeCameraMode(null), DEFAULT_CAMERA_MODE);
  assert.equal(normalizeCameraMode("unknown"), DEFAULT_CAMERA_MODE);
  assert.equal(getCameraModeLabel("center"), CAMERA_MODE_LABELS.center);
  assert.equal(getNextCameraMode("center"), "deadzone");
  assert.equal(getNextCameraMode("deadzone"), "lock");
  assert.equal(getNextCameraMode("lock"), "center");
});
