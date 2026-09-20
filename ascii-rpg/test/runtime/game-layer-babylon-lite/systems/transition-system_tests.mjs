import assert from "node:assert/strict";
import test from "node:test";
import {
  createTransitionSystem,
  TRANSITION_PHASES,
} from "../../../../src/runtime/game-layer-babylon-lite/systems/transition-system.js";

function createFakeFrames() {
  let nextFrame = 0;
  const callbacks = new Map();
  return {
    requestFrame(callback) {
      const id = ++nextFrame;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      callbacks.delete(id);
    },
    flush(timestamp) {
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pending) callback(timestamp);
    },
  };
}

test("runs a 2000ms close and 2000ms open with the covered event between them", () => {
  const frames = createFakeFrames();
  const updates = [];
  const events = [];
  const transition = createTransitionSystem({
    requestFrame: frames.requestFrame,
    cancelFrame: frames.cancelFrame,
    onUpdate: (update) => updates.push(update),
  });

  assert.equal(transition.start({
    from: 100,
    to: 10,
    onStart: () => events.push("start"),
    onCovered: () => events.push("covered"),
    onComplete: () => events.push("complete"),
  }), true);
  assert.equal(transition.begin(0), true);
  frames.flush(1000);
  frames.flush(2000);
  frames.flush(3000);
  frames.flush(4000);

  assert.deepEqual(events, ["start", "covered", "complete"]);
  assert.equal(updates.find((update) => update.phase === TRANSITION_PHASES.COVERED).value, 10);
  assert.equal(updates.at(-1).phase, TRANSITION_PHASES.IDLE);
  assert.equal(transition.isActive(), false);
});

test("clamps elapsed time and rejects a concurrent transition", () => {
  const frames = createFakeFrames();
  const transition = createTransitionSystem({
    requestFrame: frames.requestFrame,
    cancelFrame: frames.cancelFrame,
  });

  assert.equal(transition.start({ from: 1, to: 0 }), true);
  assert.equal(transition.start({ from: 1, to: 0 }), false);
  transition.begin(100);
  frames.flush(50);
  frames.flush(1000);
  frames.flush(2000);
  frames.flush(3000);
  frames.flush(4000);
  frames.flush(5000);
  assert.equal(transition.isActive(), false);
});

test("requires finite values and positive phase durations", () => {
  const transition = createTransitionSystem();
  assert.throws(() => transition.start({ from: NaN, to: 0 }), TypeError);
  assert.throws(() => transition.start({ from: 1, to: 0, durationOut: 0 }), RangeError);
});
