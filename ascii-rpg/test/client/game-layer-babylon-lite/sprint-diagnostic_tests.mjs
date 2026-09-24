import test from "node:test";
import assert from "node:assert/strict";
import { createSprintSamples } from "../../../src/client/game-layer-babylon-lite/sprint-diagnostic.js";

test("sprint samples measure actual frame cadence and movement", () => {
  const sampler = createSprintSamples(0);
  for (let frame = 1; frame <= 120; frame += 1) sampler.record(frame * 1000 / 60, Math.floor(frame / 3));
  const report = sampler.report("completed");
  assert.equal(report.samples.length, 2);
  assert.equal(report.minimumFps, 60);
  assert.equal(report.sustainedMovement, true);
  assert.equal(report.samples[0].moves, 20);
});

test("sprint samples reject stalled, dead, interrupted and empty runs", () => {
  const sampler = createSprintSamples(0);
  assert.equal(sampler.report("completed").sustainedMovement, false);
  sampler.record(1000, 20);
  assert.equal(sampler.report("unavailable").sustainedMovement, false);
  assert.equal(sampler.report("interrupted").sustainedMovement, false);
  sampler.record(2000, 20);
  assert.equal(sampler.report("completed").sustainedMovement, false);
});

test("slow frames and pending work remain visible in samples", () => {
  const sampler = createSprintSamples(0);
  for (let frame = 1; frame <= 40; frame += 1) sampler.record(frame * 25, frame,
    { pending: 17, logicalTickAgeMs: 100 });
  assert.deepEqual(sampler.report("completed").samples[0],
    { fps: 40, moves: 40, pendingCallbacks: 17, oldestPendingAgeMs: 100 });
});
