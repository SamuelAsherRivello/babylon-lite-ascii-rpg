import assert from "node:assert/strict";
import test from "node:test";
import { AStarUtility } from "../../../../src/client/game-layer-babylon-lite/utilities/a-star-utility.js";

function world(columns = 8, rows = 8) {
  return {
    columns,
    rows,
    terrain: Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({ walkable: true }))),
  };
}

function assertCardinal(path) {
  for (let index = 1; index < path.length; index += 1) {
    assert.equal(Math.abs(path[index].x - path[index - 1].x) + Math.abs(path[index].y - path[index - 1].y), 1);
  }
}

test("AStarUtility returns a deterministic cardinal path around blockers", () => {
  const map = world();
  for (let y = 0; y < 7; y += 1) map.terrain[y][3].walkable = false;
  const path = AStarUtility.findPath(map, { x: 1, y: 1 }, { x: 6, y: 1 });
  assert.ok(path);
  assertCardinal(path);
  assert.deepEqual(path[0], { x: 1, y: 1 });
  assert.deepEqual(path.at(-1), { x: 6, y: 1 });
  assert.ok(path.some((cell) => cell.y === 7));
});

test("AStarUtility finds nearest cells deterministically and reports unreachable targets", () => {
  const map = world(5, 5);
  const nearest = AStarUtility.findNearest(map, { x: 2, y: 2 }, [{ x: 4, y: 2 }, { x: 0, y: 2 }]);
  assert.deepEqual(nearest?.cell, { x: 0, y: 2 });
  map.terrain[1][2].walkable = false;
  map.terrain[2][1].walkable = false;
  map.terrain[2][3].walkable = false;
  map.terrain[3][2].walkable = false;
  assert.equal(AStarUtility.findPath(map, { x: 2, y: 2 }, { x: 0, y: 2 }), null);
});

test("AStarUtility distance fields honor blockers and maximum distance", () => {
  const map = world(5, 5);
  const field = AStarUtility.createDistanceField(map, { x: 2, y: 2 }, {
    isBlocked: (cell) => cell.x === 3 && cell.y === 2,
    maxDistance: 2,
  });
  assert.equal(field.getDistance({ x: 3, y: 2 }), -1);
  assert.equal(field.getDistance({ x: 2, y: 0 }), 2);
  assert.equal(field.getDistance({ x: 2, y: 4 }), 2);
  assert.equal(field.getDistance({ x: 0, y: 2 }), -1);
});

test("AStarUtility keeps realm-local paths local and uses an explicit paired-stair transition", () => {
  const overworld = world(6, 6);
  const underworld = world(6, 6);
  const route = AStarUtility.findRealmRoute({
    from: { realm: "Overground", cell: { x: 1, y: 1 } },
    to: { realm: "Underworld", cell: { x: 4, y: 4 } },
    worldFor: (realm) => realm === "Overground" ? overworld : underworld,
    pairedStairs: [{ x: 2, y: 2 }],
  });
  assert.equal(route, null);
  const crossRealm = AStarUtility.findRealmRoute({
    from: { realm: "Overground", cell: { x: 1, y: 1 } },
    to: { realm: "Underworld", cell: { x: 4, y: 4 } },
    worldFor: (realm) => realm === "Overground" ? overworld : underworld,
    allowCrossRealm: true,
    pairedStairs: [{ x: 2, y: 2 }],
  });
  assert.equal(crossRealm?.segments.length, 3);
  assert.equal(crossRealm?.segments[1].transition, "stairs");
  assert.deepEqual(crossRealm?.segments[2].cells.at(-1), { x: 4, y: 4 });
});
