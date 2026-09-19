import assert from "node:assert/strict";
import test from "node:test";
import { createTimeSystem, formatWorldTime, INITIAL_WORLD_TIME } from "../../../../src/runtime/game-layer-babylon-lite/systems/time-system.js";

test("starts world time at one and formats it with five digits", () => {
  const timeSystem = createTimeSystem();

  assert.equal(INITIAL_WORLD_TIME, 1);
  assert.equal(timeSystem.getTime(), 1);
  assert.equal(formatWorldTime(timeSystem.getTime()), "00001");
  assert.equal(formatWorldTime(100000), "100000");
});

test("advances world time and notifies subscribers once per advance", () => {
  const timeSystem = createTimeSystem();
  const received = [];
  const unsubscribe = timeSystem.subscribe(() => received.push(timeSystem.getTime()));

  assert.equal(timeSystem.advance(), 2);
  assert.equal(timeSystem.advance(), 3);
  assert.deepEqual(received, [2, 3]);

  unsubscribe();
  timeSystem.advance();
  assert.deepEqual(received, [2, 3]);
});
