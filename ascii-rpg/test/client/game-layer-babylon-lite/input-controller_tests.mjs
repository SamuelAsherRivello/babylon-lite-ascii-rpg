import test from "node:test";
import assert from "node:assert/strict";
import { shouldPlaceBombForKeydown } from "../../../src/client/game-layer-babylon-lite/game-session/input-controller.js";

test("SPACE requests bomb placement once and respects lock and browser repeat", () => {
  const space = { key: " ", code: "Space", repeat: false };
  assert.equal(shouldPlaceBombForKeydown(space), true);
  assert.equal(shouldPlaceBombForKeydown({ ...space, repeat: true }), false);
  assert.equal(shouldPlaceBombForKeydown(space, { held: true }), false);
  assert.equal(shouldPlaceBombForKeydown(space, { locked: true }), false);
  assert.equal(shouldPlaceBombForKeydown({ key: "Enter", code: "Enter" }), false);
});
