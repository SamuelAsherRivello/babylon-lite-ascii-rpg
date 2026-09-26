import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getHealthBarSpriteGeometry } from "../../../../src/client/game-layer-babylon-lite/systems/health-bar-renderer.js";

test("centers a one-cell-wide eighth-cell-high bar above the entity", () => {
  const geometry = getHealthBarSpriteGeometry(
    { x: 100, y: 80 },
    { gridWidth: 32, gridHeight: 40 },
    0.3,
    { deltaStartRatio: 0.3, deltaWidthRatio: 0.2 },
  );

  assert.deepEqual(geometry.outline.sizePx, [32, 5]);
  assert.equal(geometry.outline.positionPx[0], 100);
  assert.ok(geometry.outline.positionPx[1] < 60);
  assert.deepEqual(geometry.track.sizePx, [30, 3]);
  assert.deepEqual(geometry.fill.sizePx, [9, 3]);
  assert.equal(geometry.fill.positionPx[0], 89.5);
  assert.deepEqual(geometry.delta.sizePx, [6, 3]);
  assert.equal(geometry.delta.positionPx[0], 97);
});

test("keeps a visible minimum fill for positive health and allows zero fill", () => {
  const low = getHealthBarSpriteGeometry({ x: 10, y: 10 }, { gridWidth: 8, gridHeight: 8 }, 0.01);
  const empty = getHealthBarSpriteGeometry({ x: 10, y: 10 }, { gridWidth: 8, gridHeight: 8 }, 0);
  assert.equal(low.fill.sizePx[0], 1);
  assert.equal(empty.fill.sizePx[0], 0);
  assert.equal(empty.delta.sizePx[0], 0);
});

test("game integration renders health bars in the top world-space HUD layer", async () => {
  const source = await readFile(new URL("../../../../src/client/game-layer-babylon-lite/index.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../../../src/client/ui-layer-react/floating-text.css", import.meta.url), "utf8");
  for (const fragment of [
    "healthBarElements.get(state.id)",
    "healthBarOverlay.className = \"health_bar_overlay\"",
    "healthBarOverlay.append(element)",
    "const entity = occupancy?.get(state.id)",
    "entity?.realm === activeRealm",
    "x: entity.cell.x - region.x",
    "y: entity.cell.y - region.y",
    "element.children[0]",
    "element.children[1]",
    "element.children[2]",
    "renderHealthBars(region)",
    "scheduleHealthBarAnimation()",
    "window.cancelAnimationFrame(healthBarAnimationFrame)",
    "disposeHealthBarOverlay()",
  ]) assert.ok(source.includes(fragment), `Missing health-bar overlay integration: ${fragment}`);
  for (const fragment of [".health_bar_overlay", "z-index: 3", ".health_bar__track", ".health_bar__fill", ".health_bar__delta"]) {
    assert.ok(styles.includes(fragment), `Missing top-layer health-bar presentation: ${fragment}`);
  }
});
