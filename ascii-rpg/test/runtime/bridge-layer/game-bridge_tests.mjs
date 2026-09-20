import assert from "node:assert/strict";
import test from "node:test";
import {
  getTimeSnapshot,
  sendRealmAmbientSnapshot,
  sendCameraModeSnapshot,
  sendGpuLightPassSnapshot,
  sendMinimapSnapshot,
  sendMinimapZoomSnapshot,
  sendFontSnapshot,
  sendPlayerLightingSnapshot,
  sendPlayerShadowSnapshot,
  sendPaletteSnapshot,
  sendTorchLightingSnapshot,
  sendTorchShadowSnapshot,
  sendZoomSnapshot,
  sendTimeSnapshot,
  setGameController,
  subscribeToTime,
  subscribeToMinimapZoom,
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

test("publishes minimap zoom selections without changing game zoom", () => {
  const received = [];
  const unsubscribe = subscribeToMinimapZoom((zoom) => received.push(zoom));
  let gameZoomCalls = 0;
  setGameController({ setZoom() { gameZoomCalls += 1; } });
  gameZoomCalls = 0;
  sendMinimapZoomSnapshot(10);
  assert.deepEqual(received, [10]);
  assert.equal(gameZoomCalls, 0);

  let restored = null;
  setGameController({ setMinimapZoom(zoom) { restored = zoom; } });
  assert.equal(restored, 10);
  unsubscribe();
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

test("forwards GPU light pass state and reapplies it to a new controller", () => {
  let received = null;
  setGameController({ setGpuLightPass(enabled) { received = enabled; } });
  sendGpuLightPassSnapshot(true);
  assert.equal(received, true);

  let restored = null;
  setGameController({ setGpuLightPass(enabled) { restored = enabled; } });
  assert.equal(restored, true);
});

test("forwards minimap visibility and reapplies it to a new controller", () => {
  let received = null;
  setGameController({ setMinimap(enabled) { received = enabled; } });
  sendMinimapSnapshot(false);
  assert.equal(received, false);

  let restored = null;
  setGameController({ setMinimap(enabled) { restored = enabled; } });
  assert.equal(restored, false);
  sendMinimapSnapshot(true);
});

test("forwards realm ambient and independent source lighting and shadow profiles to the game layer", () => {
  const received = {};
  setGameController({
    setRealmAmbient(value) { received.realmAmbient = value; },
    setTorchLighting(profile) { received.torch = profile; },
    setPlayerLighting(profile) { received.player = profile; },
    setTorchShadow(profile) { received.torchShadow = profile; },
    setPlayerShadow(profile) { received.playerShadow = profile; },
  });
  sendRealmAmbientSnapshot({ Overground: 0.75, Underground: 0.2 });
  sendTorchLightingSnapshot("High");
  sendPlayerLightingSnapshot("Off");
  sendTorchShadowSnapshot("Low");
  sendPlayerShadowSnapshot("X High");
  assert.deepEqual(received, {
    realmAmbient: { Overground: 0.75, Underground: 0.2 }, torch: "High", player: "Off", torchShadow: "Low", playerShadow: "X High",
  });
});
