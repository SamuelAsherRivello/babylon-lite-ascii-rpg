import assert from "node:assert/strict";
import test from "node:test";
import { isLogScrollAtBottom, LOG_SCROLL_BOTTOM_TOLERANCE_PX } from "../../../src/runtime/ui-layer-react/log-scroll.js";

test("recognizes the scrollable bottom with a small pixel tolerance", () => {
  assert.equal(isLogScrollAtBottom({ scrollHeight: 200, scrollTop: 100, clientHeight: 100 }), true);
  assert.equal(isLogScrollAtBottom({ scrollHeight: 200, scrollTop: 99, clientHeight: 100 }), true);
  assert.equal(isLogScrollAtBottom({ scrollHeight: 200, scrollTop: 98, clientHeight: 100 }), false);
  assert.equal(isLogScrollAtBottom({ scrollHeight: 200, scrollTop: 98, clientHeight: 100 }, 2), true);
  assert.equal(LOG_SCROLL_BOTTOM_TOLERANCE_PX, 1);
});
