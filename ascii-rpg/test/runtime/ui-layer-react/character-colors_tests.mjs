import assert from "node:assert/strict";
import test from "node:test";
import { deriveBarColors } from "../../../src/runtime/ui-layer-react/character-colors.js";

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

