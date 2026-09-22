import assert from "node:assert/strict";
import test from "node:test";
import {
  createFloatingTextSystem,
  FLOATING_TEXT_FADE_IN_MS,
  FLOATING_TEXT_FADE_OUT_MS,
  FLOATING_TEXT_HOLD_MS,
  formatFloatingTextDelta,
} from "../../../../src/client/game-layer-babylon-lite/systems/floating-text-system.js";

const entity = Object.freeze({
  entityId: "player",
  type: "player",
  realm: "Underground",
  cell: Object.freeze({ x: 4, y: 5 }),
});

test("fades in, holds, fades out, and expires", () => {
  const floatingText = createFloatingTextSystem();
  const state = floatingText.recordDelta({ ...entity, delta: -3, at: 1_000 });

  assert.equal(state.text, "-3");
  assert.equal(state.colorRole, "damage");
  assert.equal(floatingText.getState(state.id, 1_000).alpha, 0);
  assert.equal(floatingText.getState(state.id, 1_000).progress, 0);
  assert.equal(floatingText.getState(state.id, 1_050).alpha, 0.5);
  assert.ok(floatingText.getState(state.id, 1_050).progress > 0);
  assert.equal(floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS).alpha, 1);
  assert.ok(floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS).progress > floatingText.getState(state.id, 1_050).progress);
  assert.equal(floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS + FLOATING_TEXT_HOLD_MS).alpha, 1);
  assert.ok(floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS + FLOATING_TEXT_HOLD_MS).progress > floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS).progress);
  assert.equal(floatingText.getState(state.id, 1_650).alpha, 0.5);
  assert.ok(floatingText.getState(state.id, 1_650).progress > floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS + FLOATING_TEXT_HOLD_MS).progress);
  assert.equal(floatingText.getState(state.id, 1_000 + FLOATING_TEXT_FADE_IN_MS + FLOATING_TEXT_HOLD_MS + FLOATING_TEXT_FADE_OUT_MS), null);
});

test("creates independent instances for rapid repeated deltas", () => {
  const floatingText = createFloatingTextSystem();
  const first = floatingText.recordDelta({ ...entity, delta: -2, at: 2_000 });
  const second = floatingText.recordDelta({ ...entity, delta: -3, at: 2_010 });
  const third = floatingText.recordDelta({ ...entity, delta: 10, at: 2_020 });

  assert.notEqual(first.id, second.id);
  assert.notEqual(second.id, third.id);
  assert.deepEqual(floatingText.getVisible(2_050, {
    realm: "Underground",
    isCellVisible: () => true,
  }).map((state) => state.text), ["-2", "-3", "+10"]);
  assert.equal(third.colorRole, "healing");
});

test("filters by realm and visible cell without replaying hidden records", () => {
  const floatingText = createFloatingTextSystem();
  floatingText.recordDelta({ ...entity, delta: -2, at: 3_000 });

  assert.deepEqual(floatingText.getVisible(3_100, {
    realm: "Overground",
    isCellVisible: () => true,
  }), []);
  assert.deepEqual(floatingText.getVisible(3_100, {
    realm: "Underground",
    isCellVisible: () => false,
  }), []);
  assert.equal(floatingText.getVisible(3_100, {
    realm: "Underground",
    isCellVisible: () => true,
  }).length, 1);
});

test("supports remove, clear, and signed formatting", () => {
  const floatingText = createFloatingTextSystem();
  const state = floatingText.recordDelta({ ...entity, delta: 2, at: 4_000 });

  assert.equal(formatFloatingTextDelta(2), "+2");
  assert.equal(formatFloatingTextDelta(-25), "-25");
  assert.equal(formatFloatingTextDelta(0), "0");
  assert.equal(floatingText.remove(state.id), true);
  assert.equal(floatingText.getState(state.id, 4_050), null);
  floatingText.recordDelta({ ...entity, delta: -1, at: 4_100 });
  floatingText.clear();
  assert.deepEqual(floatingText.getVisible(4_150, {
    realm: "Underground",
    isCellVisible: () => true,
  }), []);
});
