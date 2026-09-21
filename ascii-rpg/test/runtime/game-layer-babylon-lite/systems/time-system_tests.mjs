import assert from "node:assert/strict";
import test from "node:test";
import { createTimeSystem, formatWorldTime, INITIAL_WORLD_TIME } from "../../../../src/runtime/game-layer-babylon-lite/systems/time-system.js";
import { createStaminaSystem } from "../../../../src/runtime/game-layer-babylon-lite/systems/stamina-system.js";

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

  timeSystem.registerTickable("first", (event) => received.push(["first", event]));
  timeSystem.registerTickable("second", (event) => received.push(["second", event]));

  assert.equal(timeSystem.dispatchCurrent("session-start"), 1);
  assert.deepEqual(received, [
    ["first", { time: 1, cause: "session-start" }],
    ["second", { time: 1, cause: "session-start" }],
  ]);
});

test("newborn tickables wait until the next tick and removed tickables do not run later in a dispatch", () => {
  const timeSystem = createTimeSystem();
  const received = [];

  timeSystem.registerTickable("parent", ({ time }) => {
    received.push(`parent:${time}`);
    if (time === 2) {
      timeSystem.unregisterTickable("removed");
      timeSystem.registerTickable("newborn", ({ time: newbornTime }) => received.push(`newborn:${newbornTime}`));
    }
  });
  timeSystem.registerTickable("removed", ({ time }) => received.push(`removed:${time}`));

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
