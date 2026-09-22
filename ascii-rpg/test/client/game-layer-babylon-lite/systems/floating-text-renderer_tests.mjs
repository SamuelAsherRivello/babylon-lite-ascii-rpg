import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  FLOATING_TEXT_DAMAGE_COLOR,
  FLOATING_TEXT_HEALTH_BAR_CLEARANCE_RATIO,
  FLOATING_TEXT_HEALING_COLOR,
  FLOATING_TEXT_TRAVEL_RATIO,
  getFloatingTextColor,
  getFloatingTextStyle,
} from "../../../../src/client/game-layer-babylon-lite/systems/floating-text-renderer.js";

test("formats damage and healing color roles", () => {
  assert.equal(getFloatingTextColor("damage"), FLOATING_TEXT_DAMAGE_COLOR);
  assert.equal(getFloatingTextColor("healing"), FLOATING_TEXT_HEALING_COLOR);
  assert.equal(getFloatingTextColor("unknown"), FLOATING_TEXT_DAMAGE_COLOR);
});

test("anchors text above health-bar space and moves up by ten percent of grid width", () => {
  const style = getFloatingTextStyle(
    { x: 100, y: 80 },
    { gridWidth: 40, gridHeight: 50 },
    { text: "-3", colorRole: "damage", alpha: 0.5, progress: 1 },
  );

  assert.equal(FLOATING_TEXT_TRAVEL_RATIO, 0.1);
  assert.equal(FLOATING_TEXT_HEALTH_BAR_CLEARANCE_RATIO, 0.35);
  assert.equal(style.text, "-3");
  assert.equal(style.color, FLOATING_TEXT_DAMAGE_COLOR);
  assert.equal(style.alpha, 0.5);
  assert.deepEqual(style.positionPx, [100, 33.5]);
  assert.equal(style.travelPx, 4);
  assert.equal(style.clearancePx, 17.5);
});

test("game integration owns floating text outside minimap and React bridge", async () => {
  const source = await readFile(new URL("../../../../src/client/game-layer-babylon-lite/index.js", import.meta.url), "utf8");
  for (const fragment of [
    "createFloatingTextSystem()",
    "const applyPlayerHealthDelta = (delta",
    "const previousHealth = playerLifecycle.getHealth();",
    "const appliedDelta = nextHealth - previousHealth;",
    "applyPlayerHealthDelta(2)",
    "applyPlayerHealthDelta(-25)",
    "applyPlayerHealthDelta(-amount)",
    "recordVisibleFloatingTextDelta",
    "if (!world || realm !== activeRealm || !cell || delta === 0) return null;",
    "if (!isFloatingTextCellVisible(region, cell)) return null;",
    "const appliedDelta = (Number(entity.health) || 0) - (Number(entity.previousHealth) || 0);",
    "renderFloatingTexts(region)",
    "scheduleFloatingTextAnimation()",
    "disposeFloatingTextOverlay()",
    "floatingTextLayer.replaceChildren()",
    "floatingTextSystem.clear()",
  ]) assert.ok(source.includes(fragment), `Missing floating-text integration: ${fragment}`);

  assert.ok(!source.includes("sendFloatingText"), "Floating text must not be sent through the React bridge.");
});

test("floating text styles use a dedicated namespace and import path", async () => {
  const styles = await readFile(new URL("../../../../src/client/ui-layer-react/floating-text.css", import.meta.url), "utf8");
  const entrypoint = await readFile(new URL("../../../../src/client/ui-layer-react/styles.css", import.meta.url), "utf8");

  assert.ok(entrypoint.includes('@import "./floating-text.css";'));
  for (const fragment of [
    ".floating_text_layer",
    ".floating_text",
    "--floating-text-x",
    "--floating-text-y",
    "--floating-text-alpha",
    "--floating-text-color",
  ]) assert.ok(styles.includes(fragment), `Missing floating-text style ownership: ${fragment}`);
});
