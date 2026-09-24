import test from "node:test";
import assert from "node:assert/strict";
import {
  getCharacterStateSnapshot,
  sendCharacterStateSnapshot,
  subscribeToCharacterState,
} from "../../../src/client/bridge-layer/game-bridge.js";

test("publishes immutable character-state snapshots through the bridge", () => {
  const seen = [];
  const stop = subscribeToCharacterState(() => seen.push(getCharacterStateSnapshot()));
  sendCharacterStateSnapshot({
    slots: [{ slot: "Slot 01", id: "sword", glyph: "🗡", name: "Sword", health: 1000, maxHealth: 1000 }, null, null, null],
    gold: 2,
    keys: 1,
  });
  stop();
  const snapshot = getCharacterStateSnapshot();
  assert.equal(snapshot.gold, 2);
  assert.equal(snapshot.keys, 1);
  assert.equal(snapshot.slots[0].glyph, "🗡");
  assert.equal(snapshot.slots[0].health, 1000);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.slots), true);
  assert.equal(seen.at(-1), snapshot);
});
