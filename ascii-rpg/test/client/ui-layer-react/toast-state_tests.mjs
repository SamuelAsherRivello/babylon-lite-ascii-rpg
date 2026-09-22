import assert from "node:assert/strict";
import test from "node:test";
import { createToastState, toastReducer } from "../../../src/client/ui-layer-react/toast-state.js";

function reduce(state, type, message) {
  return toastReducer(state, { type, message });
}

test("first toast enters, becomes visible, and exits when its hold completes", () => {
  let state = reduce(createToastState(), "enqueue", "First");
  assert.equal(state.phase, "entering");
  assert.equal(state.active.message, "First");

  state = reduce(state, "entered");
  assert.equal(state.phase, "visible");

  state = reduce(state, "hold-complete");
  assert.equal(state.phase, "exiting");

  state = reduce(state, "exited");
  assert.equal(state.phase, "idle");
  assert.equal(state.active, null);
});

test("queued messages replace the active toast FIFO without another entry phase", () => {
  let state = reduce(createToastState(), "enqueue", "First");
  state = reduce(state, "enqueue", "Second");
  state = reduce(state, "enqueue", "Third");
  state = reduce(state, "entered");

  state = reduce(state, "hold-complete");
  assert.equal(state.phase, "visible");
  assert.equal(state.active.message, "Second");
  assert.deepEqual(state.queue.map((toast) => toast.message), ["Third"]);

  state = reduce(state, "hold-complete");
  assert.equal(state.phase, "visible");
  assert.equal(state.active.message, "Third");
  assert.deepEqual(state.queue, []);
});

test("a toast enqueued during exit replaces the exiting toast and restarts its hold", () => {
  let state = reduce(createToastState(), "enqueue", "First");
  state = reduce(state, "entered");
  state = reduce(state, "hold-complete");
  assert.equal(state.phase, "exiting");

  state = reduce(state, "enqueue", "Replacement");
  assert.equal(state.phase, "visible");
  assert.equal(state.active.message, "Replacement");
  assert.deepEqual(state.queue, []);
});
