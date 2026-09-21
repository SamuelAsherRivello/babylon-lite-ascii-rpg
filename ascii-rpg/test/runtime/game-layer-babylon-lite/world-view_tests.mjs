import assert from "node:assert/strict";
import test from "node:test";
import {
  collectWorldViewGlyphs,
  createWorldViewComposition,
  renderWorldViewComposition,
} from "../../../src/runtime/game-layer-babylon-lite/world-view.js";
import { createViewport, getViewOriginForCamera } from "../../../src/runtime/game-layer-babylon-lite/characters/player/player-grid.js";
import { createFogOfWar, discoverCell } from "../../../src/runtime/game-layer-babylon-lite/systems/fog-of-war-system.js";

function createWorld(columns = 5, rows = 4) {
  return { columns, rows };
}

test("world-view composition clamps source rectangles and records only bounded cells", () => {
  const world = createWorld();
  const composition = createWorldViewComposition({
    world,
    fog: {},
    source: { x: 99, y: -2, width: 3, height: 2 },
    getGlyph: (_world, cell) => `${cell.x}:${cell.y}`,
    discovered: () => true,
  });
  assert.deepEqual(composition.region, { x: 2, y: 0, width: 3, height: 2, count: 6 });
  assert.deepEqual(composition.cells.map(({ cell }) => cell), [
    { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
    { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  ]);
});

test("world-view composition shares fog eligibility and excludes hidden glyphs", () => {
  const world = createWorld(3, 2);
  const composition = createWorldViewComposition({
    world,
    fog: {},
    source: { x: 0, y: 0, width: 3, height: 2 },
    getGlyph: (_world, cell) => cell.x === 1 ? "P" : ".",
    discovered: (_fog, _world, cell) => cell.x !== 1,
  });
  assert.deepEqual([...collectWorldViewGlyphs(composition)], ["."]);
  assert.equal(composition.cells.find(({ cell }) => cell.x === 1).glyph, null);
});

test("world-view composition renders background, cells, and overlay in order", () => {
  const order = [];
  const composition = createWorldViewComposition({
    world: createWorld(2, 1),
    fog: {},
    source: { x: 0, y: 0, width: 2, height: 1 },
    getGlyph: () => ".",
    discovered: () => true,
  });
  renderWorldViewComposition(composition, {
    drawBackground: () => order.push("background"),
    drawCell: (cell) => order.push(`glyph:${cell.localX}`),
    drawOverlay: () => order.push("overlay"),
  });
  assert.deepEqual(order, ["background", "glyph:0", "glyph:1", "overlay"]);
});

test("world-view rendering queries persistent fog without mutating discovery", () => {
  const world = {
    ...createWorld(4, 1),
    terrain: [Array.from({ length: 4 }, () => ({ walkable: true }))],
  };
  const fog = createFogOfWar(world);
  discoverCell(fog, world, { x: 1, y: 0 });
  const before = fog.discovered.slice();
  const composition = createWorldViewComposition({
    world,
    fog,
    source: { x: 0, y: 0, width: 4, height: 1 },
    getGlyph: () => ".",
  });
  const drawn = [];
  renderWorldViewComposition(composition, {
    drawCell: ({ cell, discovered }) => {
      if (discovered) drawn.push(cell.x);
    },
  });
  assert.deepEqual(drawn, [1]);
  assert.deepEqual([...fog.discovered], [...before]);
});

test("full game-view composition reconciles reused slots for undiscovered cells", () => {
  const world = createWorld(2, 1);
  const slotVisible = [true, false];
  const renderGameView = (discoveredX) => {
    const composition = createWorldViewComposition({
      world,
      fog: {},
      source: { x: 0, y: 0, width: 2, height: 1 },
      getGlyph: (_world, cell) => cell.x === 0 ? "P" : ".",
      discovered: (_fog, _world, cell) => cell.x === discoveredX,
    });
    renderWorldViewComposition(composition, {
      drawCell: ({ slot, discovered }) => {
        slotVisible[slot] = discovered;
      },
    });
  };

  renderGameView(1);
  assert.deepEqual(slotVisible, [false, true]);
  renderGameView(0);
  assert.deepEqual(slotVisible, [true, false]);
});

test("Camera Lock source shifts hide newly exposed undiscovered edge slots", () => {
  const viewport = createViewport({ screenWidth: 640, screenHeight: 352, zoom: 10 });
  const world = createWorld(100, 80);
  const previousOrigin = { x: 50, y: 20 };
  const previousPlayer = { x: 59, y: 20 };
  const nextPlayer = { x: 60, y: 20 };
  const nextOrigin = getViewOriginForCamera("lock", nextPlayer, viewport, world, previousOrigin, { x: 1, y: 0 });
  assert.deepEqual(nextOrigin, { x: 60, y: 20 });
  assert.equal(previousPlayer.x - previousOrigin.x, viewport.columns - 1);
  assert.equal(nextPlayer.x - nextOrigin.x, 0);

  const slotVisible = Array(viewport.columns).fill(false);
  const renderRow = (origin, discovered) => {
    const composition = createWorldViewComposition({
      world,
      fog: {},
      source: { x: origin.x, y: origin.y, width: viewport.columns, height: 1 },
      getGlyph: (_world, cell) => cell.x === nextPlayer.x ? "P" : ".",
      discovered,
    });
    renderWorldViewComposition(composition, {
      drawCell: ({ slot, discovered: isDiscovered }) => {
        slotVisible[slot] = isDiscovered;
      },
    });
  };

  renderRow(previousOrigin, () => true);
  assert.equal(slotVisible[viewport.columns - 1], true);
  renderRow(nextOrigin, (_fog, _world, cell) => cell.x !== nextOrigin.x + viewport.columns - 1);
  assert.equal(slotVisible[0], true);
  assert.equal(slotVisible[viewport.columns - 1], false);
});
