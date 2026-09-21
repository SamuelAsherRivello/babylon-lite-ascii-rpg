import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createSolidHealthBarFrame,
  getHealthBarSpriteGeometry,
  HEALTH_BAR_LAYER_ORDER,
} from "../../../../src/runtime/game-layer-babylon-lite/systems/health-bar-renderer.js";

test("creates an opaque white tintable atlas frame", () => {
  const frame = createSolidHealthBarFrame(2);
  assert.equal(frame.name, "health-bar-solid");
  assert.equal(frame.width, 2);
  assert.equal(frame.height, 2);
  assert.deepEqual([...frame.pixels], Array(16).fill(255));
  assert.equal(HEALTH_BAR_LAYER_ORDER, 2);
});

test("centers a one-cell-wide quarter-cell-high bar above the entity", () => {
  const geometry = getHealthBarSpriteGeometry(
    { x: 100, y: 80 },
    { gridWidth: 32, gridHeight: 40 },
    0.3,
    { deltaStartRatio: 0.3, deltaWidthRatio: 0.2 },
  );

  assert.deepEqual(geometry.outline.sizePx, [32, 10]);
  assert.equal(geometry.outline.positionPx[0], 100);
  assert.ok(geometry.outline.positionPx[1] < 60);
  assert.deepEqual(geometry.track.sizePx, [30, 8]);
  assert.deepEqual(geometry.fill.sizePx, [9, 8]);
  assert.equal(geometry.fill.positionPx[0], 89.5);
  assert.deepEqual(geometry.delta.sizePx, [6, 8]);
  assert.equal(geometry.delta.positionPx[0], 97);
});

test("keeps a visible minimum fill for positive health and allows zero fill", () => {
  const low = getHealthBarSpriteGeometry({ x: 10, y: 10 }, { gridWidth: 8, gridHeight: 8 }, 0.01);
  const empty = getHealthBarSpriteGeometry({ x: 10, y: 10 }, { gridWidth: 8, gridHeight: 8 }, 0);
  assert.equal(low.fill.sizePx[0], 1);
  assert.equal(empty.fill.sizePx[0], 0);
  assert.equal(empty.delta.sizePx[0], 0);
});

test("game integration reuses, hides, resizes, animates, and disposes overlay sprites", async () => {
  const source = await readFile(new URL("../../../../src/runtime/game-layer-babylon-lite/index.js", import.meta.url), "utf8");
  for (const fragment of [
    "healthBarSprites.get(state.id)",
    "updateSprite2DIndex(healthBarLayer, indexes[index]",
    "updateSprite2DIndex(healthBarLayer, index, { visible: false })",
    "HEALTH_BAR_DELTA_COLOR",
    "states.length * 4",
    "renderHealthBars(region)",
    "scheduleHealthBarAnimation()",
    "window.cancelAnimationFrame(healthBarAnimationFrame)",
    "disposeHealthBarOverlay()",
  ]) assert.ok(source.includes(fragment), `Missing health-bar overlay integration: ${fragment}`);
});
