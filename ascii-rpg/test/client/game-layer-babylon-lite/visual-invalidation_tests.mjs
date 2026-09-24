import assert from "node:assert/strict";
import test from "node:test";
import { createVisualInvalidation } from "../../../src/client/game-layer-babylon-lite/visual-invalidation.js";

test("visual invalidation refreshes each affected surface for every semantic input", () => {
  for (const input of ["player", "viewport", "fog", "lighting", "palette", "markers", "gpuEffect"]) {
    const invalidation = createVisualInvalidation();
    const initial = invalidation.snapshot();
    invalidation.invalidate({ [input]: true });
    const changed = invalidation.changedSince(initial);
    if (input === "lighting") assert.equal(changed.minimap, false);
    else if (input === "markers") assert.equal(changed.world, false);
    else assert.deepEqual(changed, { world: true, minimap: true });
  }
});

test("visual invalidation leaves unchanged surfaces eligible to skip redundant work", () => {
  const invalidation = createVisualInvalidation();
  const before = invalidation.snapshot();
  assert.deepEqual(invalidation.changedSince(before), { world: false, minimap: false });
});
