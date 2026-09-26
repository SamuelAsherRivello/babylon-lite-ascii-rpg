import assert from "node:assert/strict";
import test from "node:test";
import {
  collectVisibleTrapRecords,
  createVisibleTrapAnimator,
  getAnimatedTrapOverlayPlacement,
} from "../../../src/client/game-layer-babylon-lite/trap-presentation.js";

test("visible Trap records are realm, fog, and viewport bounded", () => {
  const world = { columns: 4, rows: 3 };
  const fog = { visibility: Uint8Array.from([100, 0, 0, 0, 100, 100, 0, 0, 0, 0, 0, 0]) };
  const records = collectVisibleTrapRecords({
    world, fog, realm: "Overground", region: { x: 0, y: 0, columns: 2, rows: 2 },
    objects: [
      { id: "visible", type: "trap", active: true, realm: "Overground", cell: { x: 0, y: 0 } },
      { id: "runtime-snapshot", type: "trap", active: true, cell: { x: 0, y: 1 } },
      { id: "fogged", type: "trap", active: true, realm: "Overground", cell: { x: 1, y: 0 } },
      { id: "offscreen", type: "trap", active: true, realm: "Overground", cell: { x: 3, y: 0 } },
      { id: "other-realm", type: "trap", active: true, realm: "Underground", cell: { x: 1, y: 1 } },
    ],
  });
  assert.deepEqual(records, [
    { id: "visible", cell: { x: 0, y: 0 } },
    { id: "runtime-snapshot", cell: { x: 0, y: 1 } },
  ]);
});

test("Trap overlays are bottom-centered over their logical grid cell", () => {
  assert.deepEqual(getAnimatedTrapOverlayPlacement(
    { x: 80, y: 40 }, { gridWidth: 32, gridHeight: 32 }, { x: 12, y: 8 },
  ), { left: 76, top: 32, width: 32, height: 32 });
});

test("one visible-set Trap animator loops seven frames and cleans up", () => {
  let time = 0;
  let callback = null;
  let cancelled = 0;
  const frames = [];
  const animator = createVisibleTrapAnimator({
    now: () => time,
    requestFrame: (next) => { callback = next; return 1; },
    cancelFrame: () => { cancelled += 1; callback = null; },
    render: (entries) => frames.push(entries.map((entry) => entry.frame)),
  });
  animator.reconcile([{ id: "trap", cell: { x: 1, y: 1 } }]);
  assert.deepEqual(frames.at(-1), [0]);
  assert.equal(animator.scheduled, true);
  time = 720;
  callback(time);
  assert.deepEqual(frames.at(-1), [6]);
  time = 840;
  callback(time);
  assert.deepEqual(frames.at(-1), [0]);
  animator.reconcile([], time);
  assert.equal(animator.activeCount, 0);
  assert.equal(animator.scheduled, false);
  animator.reconcile([{ id: "trap", cell: { x: 1, y: 1 } }], time);
  animator.dispose();
  assert.equal(animator.scheduled, false);
  assert.equal(cancelled, 2);
  assert.deepEqual(frames.at(-1), []);
});
