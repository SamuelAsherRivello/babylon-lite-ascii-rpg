import assert from "node:assert/strict";
import test from "node:test";
import {
  getTimeSnapshot,
  sendRealmAmbientSnapshot,
  sendCameraModeSnapshot,
  sendGpuLightPassSnapshot,
  sendGlyphBackgroundSnapshot,
  sendBackgroundDarknessSnapshot,
  sendMinimapZoomSnapshot,
  sendFontSnapshot,
  sendPlayerLightingSnapshot,
  sendPlayerShadowSnapshot,
  sendPaletteSnapshot,
  sendTorchLightingSnapshot,
  sendTorchShadowSnapshot,
  sendZoomSnapshot,
  sendTimeSnapshot,
  sendQuestSnapshot,
  sendQuestEvent,
  sendGoldSnapshot,
  sendPlayerDeadSnapshot,
  getQuestSnapshot,
  getGoldSnapshot,
  getPlayerDeadSnapshot,
  subscribeToQuest,
  subscribeToQuestEvent,
  subscribeToGold,
  subscribeToPlayerDead,
  setGameController,
  subscribeToTime,
  subscribeToMinimapZoom,
  PLAYER_MOVED_EVENTS,
  sendPlayerMovedEvent,
  subscribeToPlayerMoved,
  getLogSnapshot,
  sendLogSnapshot,
  getRandomSeedSnapshot,
  sendRandomSeedSnapshot,
  subscribeToRandomSeed,
  subscribeToLog,
  getKeySnapshot,
  sendKeySnapshot,
  subscribeToKey,
  startQuest,
} from "../../../src/runtime/bridge-layer/game-bridge.js";

test("publishes the current session random seed", () => {
  const received = [];
  const unsubscribe = subscribeToRandomSeed(() => received.push(getRandomSeedSnapshot()));

  sendRandomSeedSnapshot("session-seed");

  assert.equal(getRandomSeedSnapshot(), "session-seed");
  assert.deepEqual(received, ["session-seed"]);
  unsubscribe();
});

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

test("publishes key snapshots to subscribers", () => {
  const received = [];
  const unsubscribe = subscribeToKey(() => received.push(getKeySnapshot()));

  sendKeySnapshot(2);
  assert.equal(getKeySnapshot(), 2);
  sendKeySnapshot(-1);
  assert.equal(getKeySnapshot(), 0);
  assert.deepEqual(received, [2, 0]);

  unsubscribe();
});

test("publishes only generic player-moved events to subscribers", () => {
  const received = [];
  const unsubscribe = subscribeToPlayerMoved((eventName) => received.push(eventName));

  sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.up);
  sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.right);
  sendPlayerMovedEvent("tutorial complete");

  assert.deepEqual(received, [PLAYER_MOVED_EVENTS.up, PLAYER_MOVED_EVENTS.right]);
  unsubscribe();
  sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.down);
  assert.deepEqual(received, [PLAYER_MOVED_EVENTS.up, PLAYER_MOVED_EVENTS.right]);
});

test("publishes immutable quest and live gold snapshots", () => {
  const quests = [];
  const gold = [];
  const stopQuest = subscribeToQuest(() => quests.push(getQuestSnapshot()));
  const stopGold = subscribeToGold(() => gold.push(getGoldSnapshot()));
  const snapshot = Object.freeze({ id: "collect-gold", title: "Collect Gold", objective: "Collect Gold", state: "pending", current: 1, target: 3 });
  sendQuestSnapshot(snapshot);
  sendGoldSnapshot(1);
  assert.strictEqual(getQuestSnapshot(), snapshot);
  assert.equal(getGoldSnapshot(), 1);
  assert.deepEqual(quests, [snapshot]);
  assert.deepEqual(gold, [1]);
  stopQuest();
  stopGold();
});

test("publishes quest transition events separately from HUD snapshots", () => {
  const events = [];
  const stop = subscribeToQuestEvent((event) => events.push(event));
  const completedSnapshot = Object.freeze({ id: "first-quest", title: "First Quest", state: "complete" });
  const nextSnapshot = Object.freeze({ id: "next-quest", title: "Next Quest", state: "pending" });
  const completedEvent = Object.freeze({ type: "completed", snapshot: completedSnapshot });
  const startedEvent = Object.freeze({ type: "started", snapshot: nextSnapshot });

  sendQuestEvent(completedEvent);
  sendQuestEvent(startedEvent);

  assert.deepEqual(events, [completedEvent, startedEvent]);
  stop();
});

test("forwards quest selection without exposing game internals", () => {
  let selected = null;
  setGameController({ startQuest(id) { selected = id; return { id }; } });

  assert.deepEqual(startQuest("collect-gold"), { id: "collect-gold" });
  assert.equal(selected, "collect-gold");
});

test("publishes the terminal player-dead snapshot", () => {
  const received = [];
  const unsubscribe = subscribeToPlayerDead(() => received.push(getPlayerDeadSnapshot()));

  sendPlayerDeadSnapshot(true);
  assert.equal(getPlayerDeadSnapshot(), true);
  assert.deepEqual(received, [true]);

  unsubscribe();
  sendPlayerDeadSnapshot(false);
  assert.deepEqual(received, [true]);
});

test("freezes ordered quest steps at the bridge boundary", () => {
  const snapshot = {
    id: "collect-gold",
    title: "Collect Gold",
    steps: [{ id: "enter-overground", label: "Enter Overground Realm", complete: true }],
  };
  sendQuestSnapshot(snapshot);
  assert.equal(Object.isFrozen(getQuestSnapshot()), true);
  assert.equal(Object.isFrozen(getQuestSnapshot().steps), true);
  assert.equal(Object.isFrozen(getQuestSnapshot().steps[0]), true);
});

test("publishes immutable ordered log snapshots and supports cleanup", () => {
  const received = [];
  const unsubscribe = subscribeToLog(() => received.push(getLogSnapshot()));

  sendLogSnapshot(["Older", "Newest"]);

  assert.deepEqual(getLogSnapshot(), ["Older", "Newest"]);
  assert.equal(Object.isFrozen(getLogSnapshot()), true);
  assert.throws(() => getLogSnapshot().push("mutated"), TypeError);
  assert.deepEqual(received, [["Older", "Newest"]]);

  unsubscribe();
  sendLogSnapshot(["After cleanup"]);
  assert.deepEqual(received, [["Older", "Newest"]]);
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

test("forwards glyph background preferences and reapplies the latest values", () => {
  const received = {};
  setGameController({
    setGlyphBackground(value) { received.enabled = value; },
    setBackgroundDarkness(value) { received.darkness = value; },
  });
  sendGlyphBackgroundSnapshot(false);
  sendBackgroundDarknessSnapshot(75);
  assert.deepEqual(received, { enabled: false, darkness: 75 });

  const restored = {};
  setGameController({
    setGlyphBackground(value) { restored.enabled = value; },
    setBackgroundDarkness(value) { restored.darkness = value; },
  });
  assert.deepEqual(restored, { enabled: false, darkness: 75 });
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
