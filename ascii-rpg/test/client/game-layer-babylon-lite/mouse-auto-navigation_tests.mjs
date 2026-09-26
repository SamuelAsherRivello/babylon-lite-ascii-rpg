import assert from "node:assert/strict";
import test from "node:test";
import { getMouseAutoNavigationNextCell, isMouseAutoNavigationCellAvailable, resolveMouseAutoNavigationTarget } from "../../../src/client/game-layer-babylon-lite/mouse-auto-navigation.js";

function world(columns = 8, rows = 8) {
  return { columns, rows, terrain: Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({ walkable: true }))) };
}

test("mouse navigation keeps a directly reachable cursor target and returns a cardinal next step", () => {
  const map = world();
  const playerCell = { x: 1, y: 1 };
  const target = resolveMouseAutoNavigationTarget({ world: map, playerCell, pointerCell: { x: 4, y: 1 } });
  assert.deepEqual(target, { x: 4, y: 1 });
  assert.deepEqual(getMouseAutoNavigationNextCell({ world: map, playerCell, targetCell: target }), { x: 2, y: 1 });
});

test("automatic navigation excludes terrain, static objects, and dynamic occupants but exempts the player source", () => {
  const map = world(3, 1);
  map.terrain[0][0].walkable = false;
  assert.equal(isMouseAutoNavigationCellAvailable({ world: map, cell: { x: 0, y: 0 }, playerCell: { x: 0, y: 0 } }), false);
  assert.equal(isMouseAutoNavigationCellAvailable({ world: map, cell: { x: 1, y: 0 }, playerCell: { x: 1, y: 0 }, isStaticOccupied: () => true, isDynamicallyOccupied: () => true }), true);
  assert.equal(isMouseAutoNavigationCellAvailable({ world: map, cell: { x: 2, y: 0 }, playerCell: { x: 1, y: 0 }, isStaticOccupied: () => true }), false);
  assert.equal(isMouseAutoNavigationCellAvailable({ world: map, cell: { x: 2, y: 0 }, playerCell: { x: 1, y: 0 }, isDynamicallyOccupied: () => true }), false);
});

test("mouse navigation rejects an unavailable exact cursor cell instead of choosing a fallback", () => {
  const map = world(5, 5);
  const blocked = (cell) => (cell.x === 2 && cell.y === 2)
    || (cell.x === 2 && cell.y === 1) || (cell.x === 1 && cell.y === 2)
    || (cell.x === 3 && cell.y === 2) || (cell.x === 2 && cell.y === 3);
  const target = resolveMouseAutoNavigationTarget({ world: map, playerCell: { x: 0, y: 0 }, pointerCell: { x: 2, y: 2 }, isBlocked: blocked });
  assert.equal(target, null);
});

test("mouse navigation refuses a walkable direct target beyond the bounded route", () => {
  const map = world(60, 1);
  assert.equal(resolveMouseAutoNavigationTarget({ world: map, playerCell: { x: 0, y: 0 }, pointerCell: { x: 51, y: 0 }, maxSteps: 50 }), null);
  assert.equal(getMouseAutoNavigationNextCell({ world: map, playerCell: { x: 0, y: 0 }, targetCell: { x: 51, y: 0 }, maxSteps: 50 }), null);
});

test("mouse navigation re-routes around changed blockers without stepping into them", () => {
  const map = world(5, 3);
  const next = getMouseAutoNavigationNextCell({
    world: map,
    playerCell: { x: 0, y: 1 },
    targetCell: { x: 4, y: 1 },
    isBlocked: (cell) => cell.x === 1 && cell.y === 1,
  });
  assert.deepEqual(next, { x: 0, y: 0 });
});
