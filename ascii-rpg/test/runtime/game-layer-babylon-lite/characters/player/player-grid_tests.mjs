import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  INITIAL_REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  SHIFT_REPEAT_INTERVAL_MS,
  clampCell,
  createViewport,
  getCellCenter,
  getCenterCell,
  getCombinedDirection,
  getDirectionForKey,
  getDirectionForSwipe,
  getRepeatInterval,
  getViewOriginForPlayer,
  getViewOriginForCamera,
  moveCell,
} from "../../../../../src/runtime/game-layer-babylon-lite/characters/player/player-grid.js";

test("creates one-to-one and upscaled logical viewports", () => {
  const oneToOne = createViewport({ screenWidth: 1280, screenHeight: 720 });
  assert.equal(oneToOne.logicalWidth, 1280);
  assert.equal(oneToOne.logicalHeight, 720);
  assert.equal(oneToOne.columns, 40);
  assert.equal(oneToOne.rows, 22);

  const upscaled = createViewport({ screenWidth: 1280, screenHeight: 720, upscale: 2 });
  assert.equal(upscaled.logicalWidth, 640);
  assert.equal(upscaled.logicalHeight, 360);
  assert.equal(upscaled.columns, 20);
  assert.equal(upscaled.rows, 11);
});

test("changes glyph density with bounded zoom while keeping zoom 5 at the current size", () => {
  const zoomedOut = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: MIN_ZOOM });
  const current = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: DEFAULT_ZOOM });
  const zoomedIn = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: MAX_ZOOM });

  assert.deepEqual(
    { columns: current.columns, rows: current.rows, gridWidth: current.gridWidth },
    { columns: 40, rows: 22, gridWidth: 32 },
  );
  assert.deepEqual(
    { columns: zoomedOut.columns, rows: zoomedOut.rows, gridWidth: zoomedOut.gridWidth },
    { columns: 200, rows: 112, gridWidth: 6.4 },
  );
  assert.deepEqual(
    { columns: zoomedIn.columns, rows: zoomedIn.rows, gridWidth: zoomedIn.gridWidth },
    { columns: 20, rows: 11, gridWidth: 64 },
  );
  assert.equal(createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 100 }).zoom, MAX_ZOOM);
  assert.equal(createViewport({ screenWidth: 1280, screenHeight: 720, zoom: -2 }).zoom, MIN_ZOOM);
});

test("centers the viewport on zoom and clamps it to the world", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 5 });
  const world = { columns: 100, rows: 80 };

  assert.deepEqual(getViewOriginForPlayer({ x: 50, y: 40 }, viewport, world), { x: 30, y: 29 });
  assert.deepEqual(getViewOriginForPlayer({ x: 0, y: 0 }, viewport, world), { x: 0, y: 0 });
  assert.deepEqual(getViewOriginForPlayer({ x: 99, y: 79 }, viewport, world), { x: 60, y: 58 });
});

test("camera center and deadzone resolve bounded origins", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 5 });
  const world = { columns: 100, rows: 80 };
  assert.deepEqual(
    getViewOriginForCamera("center", { x: 50, y: 40 }, viewport, world, { x: 0, y: 0 }),
    { x: 30, y: 29 },
  );
  assert.deepEqual(
    getViewOriginForCamera("deadzone", { x: 59, y: 50 }, viewport, world, { x: 30, y: 29 }),
    { x: 31, y: 35 },
  );
  assert.deepEqual(
    getViewOriginForCamera("deadzone", { x: 50, y: 40 }, viewport, world, { x: 30, y: 29 }),
    { x: 30, y: 29 },
  );
});

test("camera lock shifts the viewport to show a player entering from the opposite edge", () => {
  const viewport = createViewport({ screenWidth: 640, screenHeight: 352, zoom: 5 });
  const world = { columns: 100, rows: 80 };
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 60, y: 20 }, viewport, world, { x: 40, y: 20 }, { x: 1, y: 0 }),
    { x: 60, y: 20 },
  );
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 39, y: 20 }, viewport, world, { x: 40, y: 20 }, { x: -1, y: 0 }),
    { x: 20, y: 20 },
  );
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 50, y: 31 }, viewport, world, { x: 40, y: 20 }, { x: 0, y: 1 }),
    { x: 40, y: 31 },
  );
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 50, y: 19 }, viewport, world, { x: 40, y: 20 }, { x: 0, y: -1 }),
    { x: 40, y: 9 },
  );
  assert.equal(
    getViewOriginForCamera("lock", { x: -1, y: 20 }, viewport, world, { x: 0, y: 20 }, { x: -1, y: 0 }),
    null,
  );
});

test("maps WASD and arrow keys to the same directions", () => {
  assert.deepEqual(getDirectionForKey("w"), getDirectionForKey("ArrowUp"));
  assert.deepEqual(getDirectionForKey("a"), getDirectionForKey("ArrowLeft"));
  assert.deepEqual(getDirectionForKey("s"), getDirectionForKey("ArrowDown"));
  assert.deepEqual(getDirectionForKey("d"), getDirectionForKey("ArrowRight"));
});

test("combines orthogonal keys into normalized eight-way directions", () => {
  assert.deepEqual(getCombinedDirection(["w", "a"]), { x: -1, y: -1 });
  assert.deepEqual(getCombinedDirection(["ArrowDown", "d"]), { x: 1, y: 1 });
  assert.deepEqual(getCombinedDirection(["w"]), { x: 0, y: -1 });
  assert.deepEqual(getCombinedDirection([]), { x: 0, y: 0 });
});

test("maps thresholded swipes to the nearest of eight directions", () => {
  assert.equal(getDirectionForSwipe(23, 0), null);
  assert.deepEqual(getDirectionForSwipe(24, 0), { x: 1, y: 0 });
  assert.deepEqual(getDirectionForSwipe(0, -30), { x: 0, y: -1 });
  assert.deepEqual(getDirectionForSwipe(-30, 0), { x: -1, y: 0 });
  assert.deepEqual(getDirectionForSwipe(0, 30), { x: 0, y: 1 });
  assert.deepEqual(getDirectionForSwipe(30, 30), { x: 1, y: 1 });
  assert.deepEqual(getDirectionForSwipe(-30, -30), { x: -1, y: -1 });
});

test("uses diagonal direction at the equal-angle sector boundary", () => {
  assert.deepEqual(getDirectionForSwipe(30, 30 * Math.tan(Math.PI / 8)), { x: 1, y: 1 });
  assert.deepEqual(getDirectionForSwipe(-30, -30 * Math.tan(Math.PI / 8)), { x: -1, y: -1 });
});

test("centers and clamps the player to complete grid cells", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720 });
  const center = getCenterCell(viewport);
  assert.deepEqual(center, { x: 20, y: 11 });
  assert.deepEqual(getCellCenter(center, viewport), { x: 656, y: 368 });
  assert.deepEqual(clampCell({ x: -1, y: 99 }, viewport), { x: 0, y: 21 });
  assert.deepEqual(moveCell({ x: 0, y: 0 }, { x: -1, y: -1 }, viewport), { x: 0, y: 0 });
  assert.deepEqual(
    moveCell({ x: 20, y: 11 }, { x: 1, y: 1 }, viewport),
    { x: 21, y: 12 },
  );
  assert.equal(viewport.gridWidth, DEFAULT_GRID_WIDTH);
  assert.equal(viewport.gridHeight, DEFAULT_GRID_HEIGHT);
});

test("uses the agreed held-key timing constants", () => {
  assert.equal(INITIAL_REPEAT_DELAY_MS, 250);
  assert.equal(REPEAT_INTERVAL_MS, 125);
  assert.equal(SHIFT_REPEAT_INTERVAL_MS, 100 / 3);
  assert.equal(getRepeatInterval(false), REPEAT_INTERVAL_MS);
  assert.equal(getRepeatInterval(true), SHIFT_REPEAT_INTERVAL_MS);
});
