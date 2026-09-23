import assert from "node:assert/strict";
import test from "node:test";
import { createCoalescedFrameScheduler } from "../../../src/client/game-layer-babylon-lite/movement-render-scheduler.js";

test("coalesced movement rendering presents only the newest pending state", () => {
  const callbacks = [];
  const rendered = [];
  let nextHandle = 0;
  const scheduler = createCoalescedFrameScheduler({
    scheduleFrame(callback) {
      callbacks.push(callback);
      return nextHandle++;
    },
    cancelFrame() {},
    render(state) {
      rendered.push(state);
    },
  });

  scheduler.schedule({ playerX: 1, playerY: 1, refreshLighting: false });
  scheduler.schedule({ playerX: 2, playerY: 1, refreshLighting: true });
  assert.equal(callbacks.length, 1);
  assert.equal(scheduler.pending, true);

  callbacks.shift()();
  assert.deepEqual(rendered, [{ playerX: 2, playerY: 1, refreshLighting: true }]);
  assert.equal(scheduler.pending, false);
});

test("coalesced movement rendering retains a required lighting invalidation", () => {
  const scheduled = [];
  const rendered = [];
  const scheduler = createCoalescedFrameScheduler({
    scheduleFrame(callback) { scheduled.push(callback); return scheduled.length; },
    cancelFrame() {},
    render(state) { rendered.push(state); },
    merge: (previous, next) => ({ refreshLighting: previous.refreshLighting || next.refreshLighting }),
  });

  scheduler.schedule({ refreshLighting: true });
  scheduler.schedule({ refreshLighting: false });
  scheduled.shift()();

  assert.deepEqual(rendered, [{ refreshLighting: true }]);
});

test("coalesced movement rendering cancels pending obsolete work", () => {
  const callbacks = [];
  let cancelled = null;
  const scheduler = createCoalescedFrameScheduler({
    scheduleFrame(callback) {
      callbacks.push(callback);
      return 7;
    },
    cancelFrame(handle) {
      cancelled = handle;
    },
    render() {
      throw new Error("cancelled movement must not render");
    },
  });

  scheduler.schedule({ playerX: 3, playerY: 3, refreshLighting: true });
  scheduler.cancel();
  assert.equal(cancelled, 7);
  assert.equal(scheduler.pending, false);
  assert.equal(callbacks.length, 1);
});

test("cancelled callbacks cannot render after a lifecycle transition", () => {
  let callback;
  const scheduler = createCoalescedFrameScheduler({
    scheduleFrame(next) { callback = next; return 1; },
    cancelFrame() {},
    render() { throw new Error("stale callbacks must not render"); },
  });

  scheduler.schedule({ playerX: 3, playerY: 3 });
  scheduler.cancel();
  callback();
});
