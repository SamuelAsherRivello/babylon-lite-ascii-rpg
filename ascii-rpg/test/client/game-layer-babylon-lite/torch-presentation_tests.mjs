import assert from "node:assert/strict";
import test from "node:test";
import { collectVisibleTorchRecords, createVisibleTorchAnimator } from "../../../src/client/game-layer-babylon-lite/torch-presentation.js";

test("visible Torch records are realm, fog, and viewport bounded", () => {
  const world = { columns: 4, rows: 3 };
  const fog = { visibility: Uint8Array.from([100, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0]) };
  const records = collectVisibleTorchRecords({
    world, fog, realm: "Overground", region: { x: 0, y: 0, columns: 2, rows: 2 },
    objects: [
      { id: "visible", type: "torch", active: true, realm: "Overground", cell: { x: 0, y: 0 } },
      { id: "fogged", type: "torch", active: true, realm: "Overground", cell: { x: 1, y: 0 } },
      { id: "offscreen", type: "torch", active: true, realm: "Overground", cell: { x: 3, y: 0 } },
      { id: "other-realm", type: "torch", active: true, realm: "Underground", cell: { x: 1, y: 1 } },
    ],
  });
  assert.deepEqual(records, [{ id: "visible", cell: { x: 0, y: 0 } }]);
});

test("one visible-set animator loops, pauses, resumes, and stops empty work", () => {
  let time = 0;
  let callback = null;
  const frames = [];
  const animator = createVisibleTorchAnimator({
    now: () => time,
    requestFrame: (next) => { callback = next; return 1; },
    cancelFrame: () => { callback = null; },
    render: (entries) => frames.push(entries.map((entry) => entry.frame)),
  });
  animator.reconcile([{ id: "torch", cell: { x: 1, y: 1 } }]);
  assert.deepEqual(frames.at(-1), [0]);
  assert.equal(animator.scheduled, true);
  time = 320;
  callback(time);
  assert.deepEqual(frames.at(-1), [2]);
  animator.pause(time);
  assert.equal(animator.scheduled, false);
  time = 960;
  assert.deepEqual(animator.snapshot().map((entry) => entry.frame), [2]);
  animator.resume(time);
  time = 1120;
  callback(time);
  assert.deepEqual(frames.at(-1), [0]);
  animator.reconcile([], time);
  assert.equal(animator.activeCount, 0);
  assert.equal(animator.scheduled, false);
});
