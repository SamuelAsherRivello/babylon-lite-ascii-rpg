import assert from "node:assert/strict";
import test from "node:test";
import { getEffectiveZoom } from "../../../../../src/client/game-layer-babylon-lite/zoom-scale.js";
import {
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  INITIAL_REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  SHIFT_REPEAT_INTERVAL_MS,
  EXHAUSTED_REPEAT_MULTIPLIER,
  clampCell,
  createViewport,
  getCellCenter,
  getActionForKey,
  getPixelSnappedCellBounds,
  getCenterCell,
  getCombinedDirection,
  getDirectionForKey,
  getDirectionForSwipe,
  getHeadingDirectionAfterMovement,
  getHeadingLocation,
  getInitialViewOriginForCamera,
  getPlayerScreenCenter,
  getRepeatInterval,
  getViewOriginForPreservedPlayerPosition,
  getViewOriginForPlayer,
  getViewOriginForCamera,
  getViewOriginForResize,
  moveCell,
  moveWorldCell,
} from "../../../../../src/client/game-layer-babylon-lite/characters/player/player-grid.js";

test("normalizes WASD and arrows into the same semantic actions", () => {
  assert.equal(getActionForKey("w"), "up");
  assert.equal(getActionForKey("ArrowUp"), "up");
  assert.equal(getActionForKey("a"), "left");
  assert.equal(getActionForKey("ArrowLeft"), "left");
  assert.equal(getActionForKey("s"), "down");
  assert.equal(getActionForKey("ArrowDown"), "down");
  assert.equal(getActionForKey("d"), "right");
  assert.equal(getActionForKey("ArrowRight"), "right");
  assert.equal(getActionForKey(" "), "set-bomb");
  assert.equal(getActionForKey("Enter"), null);
});

test("derives a reusable heading location from a cardinal direction", () => {
  const cell = { x: 10, y: 20 };
  assert.deepEqual(getHeadingLocation(cell, { x: 0, y: -1 }), { x: 10, y: 19 });
  assert.deepEqual(getHeadingLocation(cell, { x: 0, y: 1 }), { x: 10, y: 21 });
  assert.deepEqual(getHeadingLocation(cell, { x: -1, y: 0 }), { x: 9, y: 20 });
  assert.deepEqual(getHeadingLocation(cell, { x: 1, y: 0 }), { x: 11, y: 20 });
  assert.equal(getHeadingLocation(cell, null), null);
  assert.equal(getHeadingLocation(cell, { x: 1, y: 1 }), null);
});

test("retains cardinal heading across diagonal and failed movement", () => {
  const up = getHeadingDirectionAfterMovement(null, { x: 0, y: -1 });
  assert.deepEqual(up, { x: 0, y: -1 });
  assert.equal(getHeadingDirectionAfterMovement(null, { x: 1, y: 1 }), null);
  assert.equal(getHeadingDirectionAfterMovement(up, { x: 1, y: 1 }), up);
  assert.equal(getHeadingDirectionAfterMovement(up, { x: 0, y: 0 }), up);
  assert.deepEqual(getHeadingDirectionAfterMovement(up, { x: -1, y: 0 }), { x: -1, y: 0 });
});

test("creates remapped and upscaled logical viewports", () => {
  const oneToOne = createViewport({ screenWidth: 1280, screenHeight: 720 });
  assert.equal(oneToOne.logicalWidth, 1280);
  assert.equal(oneToOne.logicalHeight, 720);
  assert.equal(oneToOne.columns, 23);
  assert.equal(oneToOne.rows, 13);

  const upscaled = createViewport({ screenWidth: 1280, screenHeight: 720, upscale: 2 });
  assert.equal(upscaled.logicalWidth, 640);
  assert.equal(upscaled.logicalHeight, 360);
  assert.equal(upscaled.columns, 12);
  assert.equal(upscaled.rows, 7);
});

test("includes clipped edge tiles so the game view covers the full canvas", () => {
  const viewport = createViewport({ screenWidth: 332, screenHeight: 591, zoom: 5 });

  assert.ok(viewport.columns * viewport.gridWidth >= viewport.screenWidth);
  assert.ok(viewport.rows * viewport.gridHeight >= viewport.screenHeight);
});

test("changes glyph density with logarithmically remapped zoom", () => {
  const zoomedOut = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: MIN_ZOOM });
  const current = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: DEFAULT_ZOOM });
  const zoomedIn = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: MAX_ZOOM });

  assert.deepEqual(
    { columns: current.columns, rows: current.rows, gridWidth: current.gridWidth },
    { columns: 23, rows: 13, gridWidth: 56.96 },
  );
  assert.deepEqual(
    { columns: zoomedOut.columns, rows: zoomedOut.rows, gridWidth: zoomedOut.gridWidth },
    { columns: 2000, rows: 1125, gridWidth: 0.64 },
  );
  assert.deepEqual(
    { columns: zoomedIn.columns, rows: zoomedIn.rows, gridWidth: zoomedIn.gridWidth },
    { columns: 20, rows: 12, gridWidth: 64 },
  );
  assert.equal(createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 100 }).zoom, MAX_ZOOM);
  assert.equal(createViewport({ screenWidth: 1280, screenHeight: 720, zoom: -2 }).zoom, MIN_ZOOM);
});

test("centers the viewport on zoom and clamps it to the world", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 });
  const world = { columns: 100, rows: 80 };

  assert.deepEqual(getViewOriginForPlayer({ x: 50, y: 40 }, viewport, world), { x: 40, y: 34 });
  assert.deepEqual(getViewOriginForPlayer({ x: 0, y: 0 }, viewport, world), { x: 0, y: 0 });
  assert.deepEqual(getViewOriginForPlayer({ x: 99, y: 79 }, viewport, world), { x: 80, y: 68 });
});

test("camera center and deadzone resolve bounded origins", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 });
  const world = { columns: 100, rows: 80 };
  assert.deepEqual(
    getViewOriginForCamera("center", { x: 50, y: 40 }, viewport, world, { x: 0, y: 0 }),
    { x: 40, y: 34 },
  );
  assert.deepEqual(
    getViewOriginForCamera("deadzone", { x: 59, y: 50 }, viewport, world, { x: 30, y: 29 }),
    { x: 45, y: 42 },
  );
  assert.deepEqual(
    getViewOriginForCamera("deadzone", { x: 50, y: 40 }, viewport, world, { x: 30, y: 29 }),
    { x: 36, y: 32 },
  );
});

test("camera lock shifts the viewport to show a player entering from the opposite edge", () => {
  const viewport = createViewport({ screenWidth: 640, screenHeight: 352, zoom: 10 });
  const world = { columns: 100, rows: 80 };
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 60, y: 20 }, viewport, world, { x: 40, y: 20 }, { x: 1, y: 0 }),
    { x: 60, y: 20 },
  );
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 39, y: 20 }, viewport, world, { x: 40, y: 20 }, { x: -1, y: 0 }),
    { x: 30, y: 20 },
  );
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 50, y: 31 }, viewport, world, { x: 40, y: 20 }, { x: 0, y: 1 }),
    { x: 50, y: 31 },
  );
  assert.deepEqual(
    getViewOriginForCamera("lock", { x: 50, y: 19 }, viewport, world, { x: 40, y: 20 }, { x: 0, y: -1 }),
    { x: 50, y: 14 },
  );
  assert.equal(
    getViewOriginForCamera("lock", { x: -1, y: 20 }, viewport, world, { x: 0, y: 20 }, { x: -1, y: 0 }),
    null,
  );
});

test("restarts each camera mode with a stable player position and moves one unit", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 });
  const world = {
    columns: 100,
    rows: 80,
    terrain: Array.from({ length: 80 }, () => Array.from({ length: 100 }, () => ({ walkable: true }))),
  };
  const initialPlayer = { x: 60, y: 40 };

  for (const mode of ["center", "deadzone", "lock"]) {
    const viewOrigin = getInitialViewOriginForCamera(mode, initialPlayer, viewport, world);
    const restartedPlayer = { ...initialPlayer };
    const movedPlayer = moveWorldCell(restartedPlayer, { x: 1, y: 0 }, world);

    assert.deepEqual(restartedPlayer, initialPlayer, `${mode} restart changed the player cell`);
    assert.deepEqual(movedPlayer, { x: initialPlayer.x + 1, y: initialPlayer.y }, `${mode} input did not move one unit`);
    assert.deepEqual(
      getPlayerScreenCenter(restartedPlayer, viewOrigin, viewport),
      getCellCenter(getCenterCell(viewport), viewport),
      `${mode} mode must start with the player centered`,
    );
    assert.ok(viewOrigin.x >= 0 && viewOrigin.y >= 0, `${mode} startup view must be bounded`);
    assert.ok(viewOrigin.x <= world.columns - viewport.columns, `${mode} startup x view must be bounded`);
    assert.ok(viewOrigin.y <= world.rows - viewport.rows, `${mode} startup y view must be bounded`);
  }
});

test("keeps the iris center on the player across every camera mode and zoom", () => {
  const world = { columns: 256, rows: 256 };
  const playerCell = { x: 90, y: 70 };
  const modes = ["center", "deadzone", "lock"];
  const viewportCenter = { x: 1280 / 2, y: 720 / 2 };
  let verified = 0;

  for (const mode of modes) {
    for (let zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom += 1) {
      const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom });
      const viewOrigin = getViewOriginForCamera(mode, playerCell, viewport, world, { x: 40, y: 30 });
      const center = getPlayerScreenCenter(playerCell, viewOrigin, viewport);

      assert.ok(Number.isFinite(center.x));
      assert.ok(Number.isFinite(center.y));
      assert.deepEqual(center, getCellCenter({
        x: playerCell.x - viewOrigin.x,
        y: playerCell.y - viewOrigin.y,
      }, viewport));
      verified += 1;
    }
  }

  assert.equal(verified, 30);
  assert.notDeepEqual(
    getPlayerScreenCenter(playerCell, getViewOriginForCamera("deadzone", playerCell,
      createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 }), world, { x: 40, y: 30 }),
      createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 })),
    viewportCenter,
  );
});

test("preserves the player's screen position when changing realms", () => {
  const world = { columns: 256, rows: 256 };
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 });
  const sourcePlayer = { x: 90, y: 70 };
  const sourceOrigin = { x: 70, y: 55 };
  const destinationPlayer = { x: 90, y: 70 };
  const sourceCenter = getPlayerScreenCenter(sourcePlayer, sourceOrigin, viewport);
  const destinationOrigin = getViewOriginForPreservedPlayerPosition(
    destinationPlayer,
    { x: sourcePlayer.x - sourceOrigin.x, y: sourcePlayer.y - sourceOrigin.y },
    viewport,
    world,
  );

  assert.deepEqual(getPlayerScreenCenter(destinationPlayer, destinationOrigin, viewport), sourceCenter);
});

test("recalculates camera origins for a resized viewport without moving the player", () => {
  const world = { columns: 256, rows: 256 };
  const landscape = createViewport({ screenWidth: 640, screenHeight: 352, zoom: 10 });
  const portrait = createViewport({ screenWidth: 352, screenHeight: 640, zoom: 10 });
  const playerCell = { x: 90, y: 70 };
  const previousOrigin = { x: 80, y: 60 };

  const centered = getViewOriginForResize(
    "center", playerCell, landscape, portrait, world, previousOrigin,
  );
  assert.deepEqual(
    { x: playerCell.x - centered.x, y: playerCell.y - centered.y },
    getCenterCell(portrait),
  );

  const deadzone = getViewOriginForResize(
    "deadzone", playerCell, landscape, portrait, world, previousOrigin,
  );
  assert.ok(deadzone.x >= 0 && deadzone.y >= 0);
  assert.ok(deadzone.x <= world.columns - portrait.columns);
  assert.ok(deadzone.y <= world.rows - portrait.rows);
  const deadzoneScreenCell = {
    x: playerCell.x - deadzone.x,
    y: playerCell.y - deadzone.y,
  };
  const deadzoneHalfWidth = Math.floor(portrait.columns * 0.2);
  const deadzoneHalfHeight = Math.floor(portrait.rows * 0.2);
  assert.ok(Math.abs(deadzoneScreenCell.x - Math.floor(portrait.columns / 2)) <= deadzoneHalfWidth);
  assert.ok(Math.abs(deadzoneScreenCell.y - Math.floor(portrait.rows / 2)) <= deadzoneHalfHeight);

  const locked = getViewOriginForResize(
    "lock", playerCell, landscape, portrait, world, { x: 89, y: 69 },
  );
  assert.deepEqual(locked, { x: 89, y: 69 });
  assert.deepEqual(
    { x: playerCell.x - locked.x, y: playerCell.y - locked.y },
    { x: 1, y: 1 },
  );
});

test("reapplying a camera mode after browser zoom centers the player", () => {
  const world = { columns: 256, rows: 256 };
  const playerCell = { x: 90, y: 70 };
  const initialViewport = createViewport({ screenWidth: 960, screenHeight: 540, zoom: 9 });
  const zoomedViewport = createViewport({ screenWidth: 960, screenHeight: 540, zoom: 5 });

  for (const mode of ["center", "deadzone", "lock"]) {
    const initialOrigin = getInitialViewOriginForCamera(mode, playerCell, initialViewport, world);
    const origin = getInitialViewOriginForCamera(mode, playerCell, zoomedViewport, world);
    assert.notDeepEqual(
      { x: playerCell.x - initialOrigin.x, y: playerCell.y - initialOrigin.y },
      getCenterCell(zoomedViewport),
      `${mode} must not retain its old-zoom screen cell`,
    );
    assert.deepEqual(
      { x: playerCell.x - origin.x, y: playerCell.y - origin.y },
      getCenterCell(zoomedViewport),
      `${mode} must center the player when reapplied after browser zoom`,
    );
  }
});

test("recalculates resized camera origins at world boundaries", () => {
  const world = { columns: 20, rows: 20 };
  const previousViewport = createViewport({ screenWidth: 640, screenHeight: 352, zoom: 10 });
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: 10 });
  const playerCell = { x: 1, y: 1 };

  for (const mode of ["center", "deadzone", "lock"]) {
    const origin = getViewOriginForResize(
      mode, playerCell, previousViewport, viewport, world, { x: 0, y: 0 },
    );
    assert.deepEqual(origin, { x: 0, y: 0 }, `${mode} resize must clamp at the world boundary`);
  }
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

test("centers and clamps the player while retaining partial edge cells", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720 });
  const center = getCenterCell(viewport);
  assert.deepEqual(center, { x: 11, y: 6 });
  assert.deepEqual(getCellCenter(center, viewport), { x: 655.0400000000001, y: 370.24 });
  assert.deepEqual(clampCell({ x: -1, y: 99 }, viewport), { x: 0, y: 12 });
  assert.deepEqual(moveCell({ x: 0, y: 0 }, { x: -1, y: -1 }, viewport), { x: 0, y: 0 });
  assert.deepEqual(
    moveCell({ x: 20, y: 11 }, { x: 1, y: 1 }, viewport),
    { x: 21, y: 12 },
  );
  assert.equal(viewport.gridWidth, DEFAULT_GRID_WIDTH * (getEffectiveZoom(DEFAULT_ZOOM) / 5));
  assert.equal(viewport.gridHeight, DEFAULT_GRID_HEIGHT * (getEffectiveZoom(DEFAULT_ZOOM) / 5));
});

test("pixel-snapped tile bounds cover every fractional-zoom edge", () => {
  const viewport = createViewport({ screenWidth: 1280, screenHeight: 720, zoom: DEFAULT_ZOOM });
  const first = getPixelSnappedCellBounds({ x: 0, y: 0 }, viewport);
  const second = getPixelSnappedCellBounds({ x: 1, y: 0 }, viewport);
  const below = getPixelSnappedCellBounds({ x: 0, y: 1 }, viewport);

  assert.deepEqual(first, { center: { x: 28.5, y: 28.5 }, size: { width: 57, height: 57 } });
  assert.equal(first.center.x + first.size.width / 2 >= second.center.x - second.size.width / 2, true);
  assert.equal(first.center.y + first.size.height / 2 >= below.center.y - below.size.height / 2, true);
});

test("uses the agreed held-key timing constants", () => {
  assert.equal(INITIAL_REPEAT_DELAY_MS, 250);
  assert.equal(REPEAT_INTERVAL_MS, 125);
  assert.equal(SHIFT_REPEAT_INTERVAL_MS, 100 / 3);
  assert.equal(EXHAUSTED_REPEAT_MULTIPLIER, 3);
  assert.equal(getRepeatInterval(false), REPEAT_INTERVAL_MS);
  assert.equal(getRepeatInterval(true), SHIFT_REPEAT_INTERVAL_MS);
  assert.equal(getRepeatInterval(false, true), 375);
  assert.equal(getRepeatInterval(true, true), 100);
});
