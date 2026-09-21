import assert from "node:assert/strict";
import test from "node:test";
import { deriveBarColors } from "../../../src/runtime/ui-layer-react/character-colors.js";
import {
  CHARACTER_BAR_DELTA_DURATION_MS,
  CHARACTER_BAR_PERCENT_MAX,
  getCharacterBarMaximumPercent,
  getCharacterBarSegments,
} from "../../../src/runtime/ui-layer-react/character-bar-presentation.js";

test("bar colors derive lighter delta and darker non-black unfilled colors", () => {
  const colors = deriveBarColors("#49b7ec");

  assert.equal(colors.current, "#49b7ec");
  assert.notEqual(colors.delta, colors.current);
  assert.notEqual(colors.unfilled, colors.current);
  assert.notEqual(colors.unfilled, "#000000");
  assert.ok(Number.parseInt(colors.delta.slice(1, 3), 16) > Number.parseInt(colors.current.slice(1, 3), 16));
  assert.ok(Number.parseInt(colors.unfilled.slice(1, 3), 16) < Number.parseInt(colors.current.slice(1, 3), 16));
});

test("different base colors retain distinct derived palettes", () => {
  const healthColors = deriveBarColors("#ef3340");
  const experienceColors = deriveBarColors("#5f3df5");

  assert.notEqual(healthColors.delta, experienceColors.delta);
  assert.notEqual(healthColors.unfilled, experienceColors.unfilled);
});

test("stamina uses half of the shared 100-unit visual capacity", () => {
  const segments = getCharacterBarSegments({ currentPercent: 50 });

  assert.equal(CHARACTER_BAR_PERCENT_MAX, 100);
  assert.equal(segments.currentPercent, 50);
  assert.equal(segments.deltaWidthPercent, 0);
});

test("bar segments expose temporary increases and reductions", () => {
  assert.equal(CHARACTER_BAR_DELTA_DURATION_MS, 300);
  assert.deepEqual(
    getCharacterBarSegments({ currentPercent: 40, transitionPercent: 30 }),
    { currentPercent: 40, deltaStartPercent: 30, deltaWidthPercent: 10 },
  );
  assert.deepEqual(
    getCharacterBarSegments({ currentPercent: 18, transitionPercent: 30 }),
    { currentPercent: 18, deltaStartPercent: 18, deltaWidthPercent: 12 },
  );
});

test("bar geometry consumes percentages without interpreting nominal values", () => {
  const fullHealth = getCharacterBarSegments({ currentPercent: 100 });
  const fullExperience = getCharacterBarSegments({ currentPercent: 100 });

  assert.deepEqual(fullHealth, fullExperience);
  assert.equal(fullExperience.currentPercent, 100);
});

test("bar maximum markers use the shared visual scale", () => {
  assert.equal(getCharacterBarMaximumPercent(50), 50);
  assert.equal(getCharacterBarMaximumPercent(25), 25);
  assert.equal(getCharacterBarMaximumPercent(), 100);
  assert.equal(getCharacterBarMaximumPercent(125), 100);
});
