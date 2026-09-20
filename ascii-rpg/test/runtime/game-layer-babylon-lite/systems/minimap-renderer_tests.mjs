import assert from "node:assert/strict";
import test from "node:test";
import { createFogOfWar, discoverCell } from "../../../../src/runtime/game-layer-babylon-lite/systems/fog-of-war-system.js";
import { getMinimapMarkers, getMinimapWorldCellGraphic, getMinimapWorldGraphic, getMinimapWorldPixel, MINIMAP_MARKER_DEPTHS } from "../../../../src/runtime/game-layer-babylon-lite/systems/minimap-renderer.js";
import { canHandleMinimapScale, getMinimapCellLayout, getMinimapViewport, getNextMinimapScale } from "../../../../src/runtime/game-layer-babylon-lite/systems/minimap-zoom.js";

function createWorld() {
  return {
    rows: 10,
    columns: 10,
    terrain: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ({ walkable: true, glyph: "." }))),
    characters: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => null)),
    playerStart: { x: 1, y: 1 },
    torches: [{ x: 8, y: 8 }],
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

test("minimap world graphics preserve discovered glyphs and palette colors", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  world.characters[0][0] = "P";
  discoverCell(fog, world, { x: 0, y: 0 });
  assert.deepEqual(getMinimapWorldGraphic(world, fog, palette, { x: 0, y: 0 }), {
    glyph: "P",
    color: "#ff0000",
  });
  assert.equal(getMinimapWorldGraphic(world, fog, palette, { x: 1, y: 1 }), null);
  assert.deepEqual(getMinimapWorldCellGraphic(world, fog, palette, { x: 0, y: 0 }), {
    glyph: "P",
    color: "#ff0000",
  });
  assert.equal(getMinimapWorldCellGraphic(world, fog, palette, { x: 1, y: 1 }), null);
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

test("minimap markers use the approved depth order and exact torch discovery", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  const player = { x: 1, y: 1 };

  assert.deepEqual(getMinimapMarkers(world, fog, player), []);

  discoverCell(fog, world, player);
  assert.deepEqual(getMinimapMarkers(world, fog, player), [
    { type: "start", color: "#00ff00", depth: MINIMAP_MARKER_DEPTHS.start, cell: { x: 1, y: 1 } },
    { type: "player", color: "#ffff00", depth: MINIMAP_MARKER_DEPTHS.player, cell: { x: 1, y: 1 } },
  ]);

  discoverCell(fog, world, { x: 7, y: 8 });
  assert.equal(getMinimapMarkers(world, fog, player).some((marker) => marker.type === "torch"), false);

  discoverCell(fog, world, world.torches[0]);
  const markers = getMinimapMarkers(world, fog, world.torches[0]);
  assert.deepEqual(markers, [
    { type: "start", color: "#00ff00", depth: MINIMAP_MARKER_DEPTHS.start, cell: { x: 1, y: 1 } },
    { type: "torch", color: "#ffffff", depth: MINIMAP_MARKER_DEPTHS.torch, cell: { x: 8, y: 8 } },
    { type: "player", color: "#ffff00", depth: MINIMAP_MARKER_DEPTHS.player, cell: { x: 8, y: 8 } },
  ]);
});

test("minimap scale cycles through the designated levels and wraps", () => {
  assert.equal(getNextMinimapScale(2), 4);
  assert.equal(getNextMinimapScale(4), 1);
  assert.equal(getNextMinimapScale(1), 2);
  assert.equal(getNextMinimapScale(7), 2);
});

test("minimap zoom changes the rendered viewport without changing canvas bounds", () => {
  assert.deepEqual(
    getMinimapViewport({ columns: 52, rows: 52 }, { x: 26, y: 26 }, 1),
    { x: 0, y: 0, columns: 52, rows: 52 },
  );
  assert.deepEqual(
    getMinimapViewport({ columns: 52, rows: 52 }, { x: 26, y: 26 }, 5),
    { x: 21, y: 21, columns: 11, rows: 11 },
  );
  assert.deepEqual(
    getMinimapViewport({ columns: 52, rows: 52 }, { x: 26, y: 26 }, 10),
    { x: 23, y: 23, columns: 6, rows: 6 },
  );
});

test("hidden minimaps do not accept scale input", () => {
  assert.equal(canHandleMinimapScale(true), true);
  assert.equal(canHandleMinimapScale(false), false);
});

test("matching minimap zoom keeps the game cell footprint instead of stretching to canvas bounds", () => {
  assert.deepEqual(getMinimapCellLayout(
    { width: 320, height: 240 },
    { columns: 25, rows: 18 },
    6.4,
    6.4,
  ), {
    cellWidth: 6.4,
    cellHeight: 6.4,
    offsetX: 80,
    offsetY: 62.4,
  });
});
