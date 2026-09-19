import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  INITIAL_REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  clampCell,
  createViewport,
  getCellCenter,
  getCenterCell,
  getCombinedDirection,
  getDirectionForKey,
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
});
