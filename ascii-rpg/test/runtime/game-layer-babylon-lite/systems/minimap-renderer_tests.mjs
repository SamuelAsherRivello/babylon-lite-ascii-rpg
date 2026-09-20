import assert from "node:assert/strict";
import test from "node:test";
import { createFogOfWar, discoverCell } from "../../../../src/runtime/game-layer-babylon-lite/systems/fog-of-war-system.js";
import { getMinimapWorldPixel } from "../../../../src/runtime/game-layer-babylon-lite/systems/minimap-renderer.js";

function createWorld() {
  return {
    rows: 10,
    columns: 10,
    terrain: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ({ walkable: true, glyph: "." }))),
    characters: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => null)),
  };
}

const palette = [
  { glyph: ".", color: "#00ff00", alpha: 1 },
  { glyph: "P", color: "#ff0000", alpha: 1 },
];

test("minimap pixels are black and transparent before discovery", () => {
  const world = createWorld();
  const pixel = getMinimapWorldPixel(world, createFogOfWar(world), palette, { x: 0, y: 0 });
  assert.deepEqual(pixel, { color: "#000000", opacity: 0 });
});

test("minimap uses discovered world content and proportional fog opacity", () => {
  const world = createWorld();
  world.characters[0][0] = "P";
  const fog = createFogOfWar(world);
  discoverCell(fog, world, { x: 0, y: 0 });
  const partial = getMinimapWorldPixel(world, fog, palette, { x: 0, y: 0 });
  assert.deepEqual(partial, { color: "#ff0000", opacity: 0.01 });

  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 10; x += 1) discoverCell(fog, world, { x, y });
  }
  const complete = getMinimapWorldPixel(world, fog, palette, { x: 0, y: 0 });
  assert.equal(complete.opacity, 1);
  assert.equal(complete.color, "#03fc00");
});

test("unwalkable cells do not contribute content or fog opacity", () => {
  const world = createWorld();
  world.terrain[0][0] = { walkable: false, glyph: "P" };
  const fog = createFogOfWar(world);
  assert.equal(discoverCell(fog, world, { x: 0, y: 0 }), false);
  assert.deepEqual(getMinimapWorldPixel(world, fog, palette, { x: 0, y: 0 }), { color: "#000000", opacity: 0 });
});
