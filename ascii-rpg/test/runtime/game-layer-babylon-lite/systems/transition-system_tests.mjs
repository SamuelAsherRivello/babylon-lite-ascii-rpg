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

test("runs a 500ms close, 100ms covered hold, and 500ms open", () => {
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
    durationOut: 500,
    durationCovered: 100,
    durationIn: 500,
    onStart: () => events.push("start"),
    onCovered: () => events.push("covered"),
    onOpening: () => events.push("opening"),
    onComplete: () => events.push("complete"),
  }), true);
  assert.equal(transition.begin(0), true);
  frames.flush(500);
  frames.flush(550);
  frames.flush(600);
  frames.flush(1100);

  assert.deepEqual(events, ["start", "covered", "opening", "complete"]);
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
  assert.throws(() => transition.start({ from: 1, to: 0, durationCovered: -1 }), RangeError);
});

test("holds full coverage before opening when a covered duration is requested", () => {
  const frames = createFakeFrames();
  const phases = [];
  const transition = createTransitionSystem({
    requestFrame: frames.requestFrame,
    cancelFrame: frames.cancelFrame,
    onUpdate: ({ phase, progress }) => phases.push({ phase, progress }),
  });

  transition.start({ from: 100, to: 10, durationCovered: 100 });
  transition.begin(0);
  frames.flush(2000);
  assert.equal(transition.getPhase(), TRANSITION_PHASES.COVERED);
  frames.flush(2050);
  assert.equal(transition.getPhase(), TRANSITION_PHASES.COVERED);
  frames.flush(2100);
  assert.equal(transition.getPhase(), TRANSITION_PHASES.OPENING);
  assert.deepEqual(phases.slice(-2).map(({ phase }) => phase), [TRANSITION_PHASES.COVERED, TRANSITION_PHASES.OPENING]);
});

test("can start directly with a player reveal opening", () => {
  const frames = createFakeFrames();
  const updates = [];
  const transition = createTransitionSystem({
    requestFrame: frames.requestFrame,
    cancelFrame: frames.cancelFrame,
    onUpdate: (update) => updates.push(update),
  });

  transition.start({
    from: 100,
    to: 0,
    durationOut: 1,
    durationIn: 500,
    startPhase: TRANSITION_PHASES.OPENING,
  });
  transition.begin(0);
  frames.flush(0);
  frames.flush(250);
  frames.flush(500);

  assert.equal(updates[0].phase, TRANSITION_PHASES.OPENING);
  assert.equal(updates[0].value, 0);
  assert.equal(updates[2].value, 50);
  assert.equal(updates.at(-1).phase, TRANSITION_PHASES.IDLE);
});
