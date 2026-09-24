import assert from "node:assert/strict";
import test from "node:test";
import { createRendererLifecycle } from "../../../src/client/game-layer-babylon-lite/renderer-lifecycle.js";

test("renderer lifecycle ignores a loss callback from intentional disposal", () => {
  const lifecycle = createRendererLifecycle();
  const token = lifecycle.begin();
  lifecycle.beginDisposal();
  assert.equal(lifecycle.isActive(token), false);
});

test("renderer lifecycle retains active unexpected device-loss reporting", () => {
  const lifecycle = createRendererLifecycle();
  const token = lifecycle.begin();
  assert.equal(lifecycle.isActive(token), true);
});
