import assert from "node:assert/strict";
import test from "node:test";
import { createTimeSystem, formatWorldTime, INITIAL_WORLD_TIME } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { createStaminaSystem } from "../../../../src/client/game-layer-babylon-lite/systems/stamina-system.js";

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
  const unsubscribe = timeSystem.subscribe((time, event) => received.push({ time, event }));

  assert.equal(timeSystem.advance(), 2);
  assert.equal(timeSystem.advance(1, "combat"), 3);
  assert.deepEqual(received, [
    { time: 2, event: { time: 2, cause: "movement" } },
    { time: 3, event: { time: 3, cause: "combat" } },
  ]);

  unsubscribe();
  timeSystem.advance();
  assert.equal(received.length, 2);
});

test("dispatches registered tickables in stable order at the current startup time", () => {
  const timeSystem = createTimeSystem();
  const received = [];

  timeSystem.registerTickable("first", (time, delta) => received.push(["first", time, delta]));
  timeSystem.registerTickable("second", (time, delta) => received.push(["second", time, delta]));

  assert.equal(timeSystem.dispatchCurrent("session-start"), 1);
  assert.deepEqual(received, [
    ["first", 1, 0],
    ["second", 1, 0],
  ]);
});

test("newborn tickables wait until the next tick and removed tickables do not run later in a dispatch", () => {
  const timeSystem = createTimeSystem();
  const received = [];

  timeSystem.registerTickable("parent", (time) => {
    received.push(`parent:${time}`);
    if (time === 2) {
      timeSystem.unregisterTickable("removed");
      timeSystem.registerTickable("newborn", (newbornTime) => received.push(`newborn:${newbornTime}`));
    }
  });
  timeSystem.registerTickable("removed", (time) => received.push(`removed:${time}`));

  timeSystem.advance();
  assert.deepEqual(received, ["parent:2"]);

  timeSystem.advance();
  assert.deepEqual(received, ["parent:2", "parent:3", "newborn:3"]);
});

test("rejects duplicate tickable identities and unregisters by identity", () => {
  const timeSystem = createTimeSystem();
  const tick = () => {};

  assert.equal(timeSystem.registerTickable("enemy-1", tick), true);
  assert.equal(timeSystem.registerTickable("enemy-1", tick), false);
  assert.equal(timeSystem.unregisterTickable("enemy-1"), true);
  assert.equal(timeSystem.unregisterTickable("enemy-1"), false);
});

test("lets movement-only stamina recovery ignore combat ticks", () => {
  const timeSystem = createTimeSystem();
  const stamina = createStaminaSystem({ initialStamina: 10 });
  timeSystem.subscribe((time, event) => {
    if (event.cause === "movement") stamina.recoverForTimeTick();
  });

  timeSystem.advance(1, "combat");
  assert.equal(stamina.getCurrent(), 10);
  timeSystem.advance(1, "movement");
  assert.equal(stamina.getCurrent(), 20);
});

test("captures trigger-time delta and assigns it only to the first tick in a batch", () => {
  let now = 100;
  const timeSystem = createTimeSystem(1, { now: () => now });
  const received = [];
  timeSystem.registerTickable("system", (time, delta) => received.push([time, delta]));

  now = 1100;
  assert.equal(timeSystem.advance(3), 4);
  assert.deepEqual(received, [[2, 1000], [3, 0], [4, 0]]);
});

test("delivers scheduled tick work in registration order without repeating it per frame", () => {
  const jobs = [];
  const scheduler = {
    enqueue(job) { jobs.push(job); return { id: job.id }; },
  };
  const timeSystem = createTimeSystem(1, { scheduler, now: () => 0 });
  const received = [];
  timeSystem.registerTickable("first", (time, delta) => received.push(["first", time, delta]));
  timeSystem.registerTickable("second", (time, delta) => received.push(["second", time, delta]));

  timeSystem.advance(2);
  assert.deepEqual(received, []);
  jobs.forEach((job) => job.run({}));
  assert.deepEqual(received, [["first", 2, 0], ["second", 2, 0], ["first", 3, 0], ["second", 3, 0]]);
});

test("invalidates pending scheduled ticks without allowing stale delivery", () => {
  const jobs = [];
  const scheduler = {
    enqueue(job) { jobs.push(job); return { id: job.id }; },
    cancelWhere(predicate) { jobs.filter((job) => predicate(job.metadata)).forEach((job) => { job.cancelled = true; }); },
    snapshot() { return { pending: jobs.length }; },
  };
  const timeSystem = createTimeSystem(1, { scheduler, now: () => 0 });
  const received = [];
  timeSystem.registerTickable("system", (time) => received.push(time));
  timeSystem.advance();
  assert.equal(timeSystem.getDiagnostics().pending, 1);
  timeSystem.invalidatePending();
  jobs.forEach((job) => job.run({}));
  assert.deepEqual(received, []);
  assert.equal(timeSystem.getDiagnostics().stale, 1);
  assert.equal(timeSystem.getDiagnostics().logicalTickAgeMs, 0);
});

test("pending tick age tracks the final callback and clears across realm invalidation", () => {
  const jobs = [];
  let clock = 10;
  const time = createTimeSystem(1, { now: () => clock, scheduler: { enqueue: job => jobs.push(job) } });
  time.registerTickable("first", () => {});
  time.registerTickable("last", () => {});
  time.advance();
  clock = 50;
  jobs[0].run();
  assert.equal(time.getDiagnostics().logicalTickAgeMs, 40);
  jobs[1].run();
  assert.equal(time.getDiagnostics().logicalTickAgeMs, 0);
  time.advance();
  clock = 100;
  time.invalidatePending();
  assert.equal(time.getDiagnostics().logicalTickAgeMs, 0);
});
