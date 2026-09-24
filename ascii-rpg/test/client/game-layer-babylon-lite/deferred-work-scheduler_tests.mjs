import assert from "node:assert/strict";
import test from "node:test";
import { createDeferredWorkScheduler } from "../../../src/client/game-layer-babylon-lite/deferred-work-scheduler.js";

function controlledScheduler(options = {}) {
  let clock = 0; let visible = true; const frames = []; const cancelled = [];
  const scheduler = createDeferredWorkScheduler({
    now: () => clock, isVisible: () => visible, sliceMs: 1, presentationFrames: 2,
    scheduleFrame: callback => { frames.push(callback); return frames.length - 1; },
    cancelFrame: handle => cancelled.push(handle), ...options,
  });
  return { scheduler, frames, cancelled, advance(ms = 1) { clock += ms; }, set visible(value) { visible = value; } };
}

test("deferred work starts only after two presentation opportunities and honors priority", () => {
  const control = controlledScheduler(); const events = [];
  control.scheduler.subscribe(event => events.push(event.type));
  control.scheduler.enqueue({ id: "low", priority: 1, run: () => { events.push("low"); return "done"; } });
  control.scheduler.enqueue({ id: "high", priority: 2, run: () => { events.push("high"); return "done"; } });
  assert.deepEqual(events, ["enqueued", "enqueued"]);
  control.frames.shift()(); control.frames.shift()(); control.frames.shift()();
  assert.deepEqual(events, ["enqueued", "enqueued", "started", "high", "settled", "started", "low", "settled"]);
  assert.deepEqual(control.scheduler.snapshot(), { pending: 0, longestSliceMs: 0, presentationPending: 0 });
});

test("deferred work is bounded, pauses hidden work, and cancels stale work", () => {
  const control = controlledScheduler({ presentationFrames: 0 }); let slices = 0;
  control.scheduler.enqueue({ id: "slow", run: () => { slices += 1; return slices === 3 ? "done" : "pending"; } });
  control.frames.shift()(); control.frames.shift()(); control.frames.shift()();
  assert.equal(slices, 3);
  control.scheduler.enqueue({ id: "hidden", run: () => assert.fail("hidden work ran") });
  control.visible = false; control.frames.shift()();
  assert.equal(control.scheduler.snapshot().pending, 1);
  assert.equal(control.scheduler.cancel("hidden"), true);
  assert.equal(control.scheduler.snapshot().pending, 0);
  control.scheduler.enqueue({ id: "stale", run: () => "done" });
  control.scheduler.dispose();
  assert.ok(control.cancelled.length >= 0);
  assert.equal(control.scheduler.snapshot().pending, 0);
});

test("priority aging gives lower-priority pending work a bounded turn", () => {
  const control = controlledScheduler({ presentationFrames: 0, sliceMs: 1 }); const order = [];
  control.scheduler.enqueue({ id: "high", priority: 10, run: () => { order.push("high"); control.advance(1); return "pending"; } });
  control.scheduler.enqueue({ id: "low", priority: 1, run: () => { order.push("low"); control.advance(1); return "done"; } });
  for (let frame = 0; frame < 12 && control.frames.length; frame += 1) control.frames.shift()();
  assert.ok(order.includes("low"));
  assert.ok(order.indexOf("low") <= 10);
  assert.ok(control.scheduler.snapshot().longestSliceMs >= 1);
});
