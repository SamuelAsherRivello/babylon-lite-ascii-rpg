import assert from "node:assert/strict";
import test from "node:test";
import {
  getTimeSnapshot,
  sendFontSnapshot,
  sendPaletteSnapshot,
  sendTimeSnapshot,
  setGameController,
  subscribeToTime,
} from "../src/game-bridge.js";

test("forwards confirmed palette snapshots without exposing game internals", () => {
  const palette = [{ glyph: "W", color: "#909090", alpha: 1 }];
  let received = null;
  setGameController({ setPalette(entries) { received = entries; } });

  assert.equal(sendPaletteSnapshot(palette), undefined);
  assert.strictEqual(received, palette);
});

test("forwards live and confirmed font snapshots without exposing game internals", () => {
  let received = null;
  setGameController({ setFont(fontId) { received = fontId; } });

  assert.equal(sendFontSnapshot("consolas"), undefined);
  assert.equal(received, "consolas");
});

test("publishes time snapshots to subscribers", () => {
  const received = [];
  const unsubscribe = subscribeToTime(() => received.push(getTimeSnapshot()));

  sendTimeSnapshot(2);
  assert.equal(getTimeSnapshot(), 2);
  assert.deepEqual(received, [2]);

  unsubscribe();
  sendTimeSnapshot(3);
  assert.deepEqual(received, [2]);
});
