import assert from "node:assert/strict";
import test from "node:test";
import { createPlayerLifecycle, INITIAL_PLAYER_HEALTH } from "../../../../src/client/game-layer-babylon-lite/systems/player-lifecycle.js";
import { DEATH_RECOVERY_DELAY_MS, createDeathPresentation } from "../../../../src/client/game-layer-babylon-lite/systems/death-presentation.js";

test("starts alive at the initial health and clamps healing to the maximum", () => {
  const lifecycle = createPlayerLifecycle();
  assert.equal(INITIAL_PLAYER_HEALTH, 125);
  assert.equal(lifecycle.getHealth(), INITIAL_PLAYER_HEALTH);
  assert.equal(lifecycle.isDead(), false);
  lifecycle.applyHealthDelta(100);
  assert.equal(lifecycle.getHealth(), 125);
  assert.equal(lifecycle.isDead(), false);
});

test("survives one unmitigated bomb hit at full health", () => {
  const lifecycle = createPlayerLifecycle();
  lifecycle.applyHealthDelta(-100);
  assert.equal(lifecycle.getHealth(), 25);
  assert.equal(lifecycle.isDead(), false);
});

test("clamps lethal damage to zero and publishes death once", () => {
  const lifecycle = createPlayerLifecycle({ initialHealth: 25 });
  const health = [];
  const deaths = [];
  lifecycle.subscribeToHealth((value) => health.push(value));
  lifecycle.subscribeToDeath((value) => deaths.push(value));

  lifecycle.applyHealthDelta(-25);
  lifecycle.applyHealthDelta(-25);

  assert.deepEqual(health, [25, 0]);
  assert.deepEqual(deaths, [true]);
  assert.equal(lifecycle.getHealth(), 0);
  assert.equal(lifecycle.isDead(), true);
});

test("a subscriber added after death receives the terminal state", () => {
  const lifecycle = createPlayerLifecycle({ initialHealth: 1 });
  lifecycle.applyHealthDelta(-25);
  const deaths = [];
  lifecycle.subscribeToDeath((value) => deaths.push(value));
  assert.deepEqual(deaths, [true]);
});

test("revive restores full health and publishes a living state", () => {
  const lifecycle = createPlayerLifecycle({ initialHealth: 1 });
  const deaths = [];
  lifecycle.subscribeToDeath((value) => deaths.push(value));
  lifecycle.applyHealthDelta(-1);
  lifecycle.revive();
  assert.equal(lifecycle.getHealth(), 125);
  assert.equal(lifecycle.isDead(), false);
  assert.deepEqual(deaths, [true, false]);
});

test("death presentation waits for animation completion and then exactly 500 ms", () => {
  const timers = [];
  const presentation = createDeathPresentation({
    schedule(callback, delay) {
      const timer = { callback, delay, cancelled: false };
      timers.push(timer);
      return timer;
    },
    cancel(timer) { timer.cancelled = true; },
  });
  const phases = [];
  presentation.subscribe((phase) => phases.push(phase));

  assert.equal(presentation.begin(), true);
  assert.equal(presentation.isRecoveryReady(), false);
  assert.equal(presentation.completeAnimation(), true);
  assert.equal(presentation.completeAnimation(), false);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, DEATH_RECOVERY_DELAY_MS);
  assert.equal(presentation.isRecoveryReady(), false);

  timers[0].callback();
  assert.equal(presentation.isRecoveryReady(), true);
  assert.deepEqual(phases, ["dying", "recovery-ready"]);
});

test("reset and disposal cancel pending death presentation callbacks", () => {
  const timers = [];
  const presentation = createDeathPresentation({
    schedule(callback) {
      const timer = { callback, cancelled: false };
      timers.push(timer);
      return timer;
    },
    cancel(timer) { timer.cancelled = true; },
  });

  presentation.begin();
  presentation.completeAnimation();
  presentation.reset();
  assert.equal(timers[0].cancelled, true);
  timers[0].callback();
  assert.equal(presentation.isRecoveryReady(), false);

  presentation.begin();
  presentation.completeAnimation();
  presentation.dispose();
  assert.equal(timers[1].cancelled, true);
  timers[1].callback();
  assert.equal(presentation.isRecoveryReady(), false);
});
