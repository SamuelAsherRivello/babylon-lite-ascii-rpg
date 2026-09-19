import assert from "node:assert/strict";
import test from "node:test";
import {
  getTimeSnapshot,
  sendAmbientLightSnapshot,
  sendCameraModeSnapshot,
  sendFontSnapshot,
  sendPlayerLightingSnapshot,
  sendPaletteSnapshot,
  sendTorchLightingSnapshot,
  sendZoomSnapshot,
  sendTimeSnapshot,
  setGameController,
  subscribeToTime,
} from "../../../src/runtime/bridge-layer/game-bridge.js";

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

test("forwards zoom changes to the game layer", () => {
  let received = null;
  setGameController({ setZoom(zoom) { received = zoom; } });

  assert.equal(sendZoomSnapshot(7), undefined);
  assert.equal(received, 7);
});

test("forwards camera mode changes and reapplies the latest mode to a new controller", () => {
  let received = null;
  setGameController({ setCameraMode(mode) { received = mode; } });
  sendCameraModeSnapshot("deadzone");
  assert.equal(received, "deadzone");

  let restored = null;
  setGameController({ setCameraMode(mode) { restored = mode; } });
  assert.equal(restored, "deadzone");
});

test("forwards ambient and independent source profiles to the game layer", () => {
  const received = {};
  setGameController({
    setAmbientLight(value) { received.ambient = value; },
    setTorchLighting(profile) { received.torch = profile; },
    setPlayerLighting(profile) { received.player = profile; },
  });
  sendAmbientLightSnapshot(0.75);
  sendTorchLightingSnapshot("High");
  sendPlayerLightingSnapshot("Off");
  assert.deepEqual(received, { ambient: 0.75, torch: "High", player: "Off" });
});
