import assert from "node:assert/strict";
import test from "node:test";
import { getAvailableUiSpaces } from "../../../src/client/ui-layer-react/available-ui-spaces.js";

test("available UI spaces rank clear viewport corners ahead of HUD overlap", () => {
  const spaces = getAvailableUiSpaces({
    viewport: { width: 800, height: 600 },
    size: { width: 200, height: 120 },
    exclusions: [{ left: 0, top: 0, width: 240, height: 180 }],
  });
  assert.notDeepEqual(spaces[0], { left: 8, top: 8, width: 200, height: 120 });
  assert.equal(spaces[0].left >= 0, true);
  assert.equal(spaces[0].top >= 0, true);
});
