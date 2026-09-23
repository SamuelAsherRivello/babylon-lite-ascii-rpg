import assert from "node:assert/strict";
import test from "node:test";
import { createPlayerLifecycle, INITIAL_PLAYER_HEALTH } from "../../../../src/client/game-layer-babylon-lite/systems/player-lifecycle.js";

test("starts alive at the initial health and clamps healing to the maximum", () => {
  const lifecycle = createPlayerLifecycle();
  assert.equal(INITIAL_PLAYER_HEALTH, 100);
  assert.equal(lifecycle.getHealth(), INITIAL_PLAYER_HEALTH);
  assert.equal(lifecycle.isDead(), false);
  lifecycle.applyHealthDelta(100);
  assert.equal(lifecycle.getHealth(), 100);
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
  assert.equal(lifecycle.getHealth(), 100);
  assert.equal(lifecycle.isDead(), false);
  assert.deepEqual(deaths, [true, false]);
});
