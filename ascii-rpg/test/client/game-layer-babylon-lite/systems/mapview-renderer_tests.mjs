import assert from "node:assert/strict";
import test from "node:test";
import { createWorldViewComposition } from "../../../../src/client/game-layer-babylon-lite/world-view.js";
import { createFogOfWar } from "../../../../src/client/game-layer-babylon-lite/systems/fog-of-war-system.js";
import {
  getMapviewLayout,
  getMapviewLightingFactor,
  getMapviewMarkers,
  getMapviewVisibility,
  MAPVIEW_MARKER_DEPTHS,
} from "../../../../src/client/game-layer-babylon-lite/systems/mapview-renderer.js";

function createWorld() {
  return {
    columns: 10,
    rows: 5,
    playerStart: { x: 1, y: 1 },
    torches: [{ x: 8, y: 1 }],
    questPickupIds: new Set(["gold-1"]),
    terrain: Array.from({ length: 5 }, () => Array.from({ length: 10 }, () => ({ walkable: true, glyph: "." }))),
  };
}

test("mapview layout fits the full realm inside a landscape canvas", () => {
  const world = createWorld();
  assert.deepEqual(getMapviewLayout({ width: 800, height: 600 }, world), {
    source: { x: 0, y: 0, width: 10, height: 5 },
    destination: { x: 0, y: 100, width: 800, height: 400, cellWidth: 80, cellHeight: 80 },
  });
});

test("mapview visibility renders fogged cells without mutating discovery", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  const before = fog.discovered.slice();
  const composition = createWorldViewComposition({
    world,
    fog,
    source: { x: 0, y: 0, width: 2, height: 1 },
    getGlyph: (_world, cell) => `${cell.x}`,
    getVisibility: getMapviewVisibility,
  });

  assert.deepEqual(composition.cells.map(({ discovered, visibility, glyph }) => ({ discovered, visibility, glyph })), [
    { discovered: true, visibility: 100, glyph: "0" },
    { discovered: true, visibility: 100, glyph: "1" },
  ]);
  assert.deepEqual([...fog.discovered], [...before]);
});

test("mapview uses diagnostic ambient lighting", () => {
  assert.equal(getMapviewLightingFactor(), 1);
});

test("mapview markers include diagnostic entities and no edge indicators", () => {
  const world = createWorld();
  const markers = getMapviewMarkers({
    world,
    playerCell: { x: 2, y: 2 },
    objects: [
      { id: "gold-1", type: "gold", active: true, cell: { x: 3, y: 3 } },
      { id: "heart-1", type: "heart", active: true, cell: { x: 4, y: 3 } },
      { id: "trap-1", type: "trap", active: false, cell: { x: 5, y: 3 } },
    ],
    entities: [
      { id: "enemy-1", type: "enemy", cell: { x: 6, y: 3 } },
      { id: "spawner-1", type: "enemy-spawner", cell: { x: 7, y: 3 } },
    ],
  });

  assert.deepEqual(markers.map((marker) => marker.type), ["start", "quest", "torch", "item", "enemySpawner", "enemy", "player"]);
  assert.equal(markers.some((marker) => marker.type.includes("edge")), false);
  assert.equal(markers.find((marker) => marker.type === "enemy")?.depth, MAPVIEW_MARKER_DEPTHS.enemy);
});
