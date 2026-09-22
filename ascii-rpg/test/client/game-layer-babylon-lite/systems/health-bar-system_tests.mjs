import assert from "node:assert/strict";
import test from "node:test";
import {
  createHealthBarSystem,
  HEALTH_BAR_DELTA_MS,
  HEALTH_BAR_FADE_MS,
  HEALTH_BAR_HOLD_MS,
} from "../../../../src/client/game-layer-babylon-lite/systems/health-bar-system.js";

const enemy = Object.freeze({
  id: "enemy-1",
  type: "enemy",
  realm: "Underground",
  cell: Object.freeze({ x: 4, y: 5 }),
  health: 75,
  maxHealth: 100,
});

test("fades in, holds from latest damage, and fades out at exact boundaries", () => {
  const bars = createHealthBarSystem();
  bars.recordDamage(enemy, 1_000);

  assert.equal(bars.getState("enemy-1", 1_000).alpha, 0);
  assert.equal(bars.getState("enemy-1", 1_050).alpha, 0.5);
  assert.equal(bars.getState("enemy-1", 1_000 + HEALTH_BAR_FADE_MS).alpha, 1);
  assert.equal(bars.getState("enemy-1", 1_000 + HEALTH_BAR_HOLD_MS).alpha, 1);
  assert.equal(bars.getState("enemy-1", 2_050).alpha, 0.5);
  assert.equal(bars.getState("enemy-1", 2_100), null);
});

test("updates proportional fill and extends the hold after repeated damage", () => {
  const bars = createHealthBarSystem();
  bars.recordDamage({ ...enemy, previousHealth: 100 }, 1_000);

  assert.equal(bars.getState("enemy-1", 1_000).deltaStartRatio, 0.75);
  assert.equal(bars.getState("enemy-1", 1_000).deltaWidthRatio, 0.25);
  assert.equal(bars.getState("enemy-1", 1_000 + HEALTH_BAR_DELTA_MS - 1).deltaWidthRatio, 0.25);
  assert.equal(bars.getState("enemy-1", 1_000 + HEALTH_BAR_DELTA_MS).deltaWidthRatio, 0);

  bars.recordDamage({ ...enemy, health: 40, previousHealth: 75 }, 1_900);

  assert.equal(bars.getState("enemy-1", 2_500).fillRatio, 0.4);
  assert.equal(bars.getState("enemy-1", 1_900).deltaStartRatio, 0.4);
  assert.equal(bars.getState("enemy-1", 1_900).deltaWidthRatio, 0.35);
  assert.equal(bars.getState("enemy-1", 2_900).alpha, 1);
  assert.equal(bars.getState("enemy-1", 2_950).alpha, 0.5);
});

test("uses the entity's pre-hit health when a previously hidden bar reappears", () => {
  const bars = createHealthBarSystem();
  bars.recordDamage({ ...enemy, health: 60, previousHealth: 80 }, 5_000);

  const state = bars.getState("enemy-1", 5_100);
  assert.equal(state.fillRatio, 0.6);
  assert.equal(state.deltaStartRatio, 0.6);
  assert.ok(Math.abs(state.deltaWidthRatio - 0.2) < Number.EPSILON);
});

test("never records a player health bar", () => {
  const bars = createHealthBarSystem();
  assert.equal(bars.recordDamage({ ...enemy, id: "player", type: "player" }, 1_000), null);
  assert.equal(bars.getState("player", 1_050), null);
});

test("filters active bars by realm and onscreen cell without losing offscreen timing", () => {
  const bars = createHealthBarSystem();
  bars.recordDamage(enemy, 1_000);

  assert.deepEqual(bars.getVisible(1_100, {
    realm: "Overground",
    isCellVisible: () => true,
  }), []);
  assert.deepEqual(bars.getVisible(1_100, {
    realm: "Underground",
    isCellVisible: () => false,
  }), []);
  assert.equal(bars.getVisible(1_100, {
    realm: "Underground",
    isCellVisible: () => true,
  })[0].id, "enemy-1");
});
