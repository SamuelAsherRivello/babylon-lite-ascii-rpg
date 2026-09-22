import assert from "node:assert/strict";
import test from "node:test";
import { createLogSystem } from "../../../../src/client/game-layer-babylon-lite/systems/log-system.js";

test("accepts displayable events in arrival order and publishes immutable snapshots", () => {
  const logSystem = createLogSystem();
  const received = [];
  const unsubscribe = logSystem.subscribe((snapshot) => received.push(snapshot));

  logSystem.log({ message: "First" });
  logSystem.log({ message: "Second" });

  assert.deepEqual(logSystem.getSnapshot(), ["First", "Second"]);
  assert.equal(Object.isFrozen(logSystem.getSnapshot()), true);
  assert.deepEqual(received, [[], ["First"], ["First", "Second"]]);
  assert.throws(() => logSystem.getSnapshot().push("mutated"), TypeError);

  unsubscribe();
});

test("rejects filtered, missing, empty, and non-object events", () => {
  const logSystem = createLogSystem({ shouldDisplay: (event) => event.category !== "debug" });

  assert.equal(logSystem.log({ message: "Hidden", category: "debug" }), null);
  assert.equal(logSystem.log({ message: "   \n\r  " }), null);
  assert.equal(logSystem.log({}), null);
  assert.equal(logSystem.log("not an event"), null);
  assert.deepEqual(logSystem.getSnapshot(), []);
});

test("normalizes multiline messages to one line", () => {
  const logSystem = createLogSystem();

  logSystem.log({ message: "Entered\nOverground\r\nrealm." });

  assert.deepEqual(logSystem.getSnapshot(), ["Entered Overground realm."]);
});

test("retains every entry for the full session", () => {
  const logSystem = createLogSystem();

  for (let index = 1; index <= 24; index += 1) {
    logSystem.log({ message: `Entry ${index}` });
  }

  assert.equal(logSystem.getSnapshot().length, 24);
  assert.equal(logSystem.getSnapshot()[0], "Entry 1");
  assert.equal(logSystem.getSnapshot().at(-1), "Entry 24");
});

test("supports custom formatting and disposal", () => {
  const logSystem = createLogSystem({
    formatMessage: ({ source, message }) => `[${source}] ${message}`,
  });
  const received = [];
  logSystem.subscribe((snapshot) => received.push(snapshot));

  logSystem.log({ source: "World", message: "Ready" });
  logSystem.dispose();
  assert.deepEqual(received, [[], ["[World] Ready"]]);
  assert.deepEqual(logSystem.getSnapshot(), []);
  assert.equal(logSystem.log({ message: "Ignored after disposal" }), null);
});
