import assert from "node:assert/strict";
import test from "node:test";
import { createFogOfWar, discoverCell, discoverFromPlayer, getMinimapCoverage } from "../../../../src/runtime/game-layer-babylon-lite/systems/fog-of-war-system.js";
import { findNearestNavigationTarget, getMinimapEdgeIndicators, getMinimapIndicatorSafeArea, getMinimapMarkers, getMinimapWorldCellGraphic, getMinimapWorldGraphic, getMinimapWorldPixel, MINIMAP_INDICATOR_MIN_SIZE, MINIMAP_INDICATOR_SAFE_INSET, MINIMAP_MARKER_DEPTHS } from "../../../../src/runtime/game-layer-babylon-lite/systems/minimap-renderer.js";
import { canHandleMinimapScale, getMinimapCellLayout, getMinimapViewport, getNextMinimapScale, migrateMinimapScale } from "../../../../src/runtime/game-layer-babylon-lite/systems/minimap-zoom.js";

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

test("minimap pixel opacity follows partial persistent cell visibility", () => {
  const world = createWorld();
  world.fogUnclearRadius = 4;
  const fog = createFogOfWar(world);
  discoverFromPlayer(fog, world, { x: 5, y: 5 });
  const pixel = getMinimapWorldPixel(world, fog, palette, { x: 0, y: 0 });
  assert.equal(pixel.opacity, getMinimapCoverage(fog, { x: 0, y: 0 }));
  assert.ok(pixel.opacity > 0 && pixel.opacity < 1);
});

test("unwalkable cells do not contribute content or fog opacity", () => {
  const world = createWorld();
  world.terrain[0][0] = { walkable: false, glyph: "P" };
  const fog = createFogOfWar(world);
  assert.equal(discoverCell(fog, world, { x: 0, y: 0 }), false);
  assert.deepEqual(getMinimapWorldPixel(world, fog, palette, { x: 0, y: 0 }), { color: "#000000", opacity: 0 });
});

test("minimap markers use the approved depth order without object markers", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  const player = { x: 1, y: 1 };

  assert.deepEqual(getMinimapMarkers(world, fog, player), [
    { type: "start", color: "#00ff00", depth: MINIMAP_MARKER_DEPTHS.start, cell: { x: 1, y: 1 } },
    { type: "player", color: "#ffff00", depth: MINIMAP_MARKER_DEPTHS.player, cell: { x: 1, y: 1 } },
  ]);

  discoverCell(fog, world, player);
  assert.deepEqual(getMinimapMarkers(world, fog, player), [
    { type: "start", color: "#00ff00", depth: MINIMAP_MARKER_DEPTHS.start, cell: { x: 1, y: 1 } },
    { type: "player", color: "#ffff00", depth: MINIMAP_MARKER_DEPTHS.player, cell: { x: 1, y: 1 } },
  ]);

  discoverCell(fog, world, { x: 7, y: 8 });
  assert.equal(getMinimapMarkers(world, fog, player).some((marker) => marker.type === "torch"), false);

  const markers = getMinimapMarkers(world, fog, world.torches[0]);
  assert.deepEqual(markers, [
    { type: "start", color: "#00ff00", depth: MINIMAP_MARKER_DEPTHS.start, cell: { x: 1, y: 1 } },
    { type: "player", color: "#ffff00", depth: MINIMAP_MARKER_DEPTHS.player, cell: { x: 8, y: 8 } },
  ]);
});

test("quest pickup markers ignore fog and project off-screen as directional chevrons", () => {
  const world = createWorld();
  world.pickups = [
    { id: "gold-1", active: true, cell: { x: 2, y: 2 } },
    { id: "gold-2", active: true, cell: { x: 9, y: 1 } },
  ];
  const fog = createFogOfWar(world);
  const markers = getMinimapMarkers(world, fog, { x: 1, y: 1 });
  assert.equal(markers.some((marker) => marker.type === "quest" && marker.pickupId === "gold-1"), true);
  const indicators = getMinimapEdgeIndicators(world, { x: 1, y: 1 }, { x: 0, y: 0, columns: 5, rows: 5 });
  assert.equal(indicators.length, 1);
  assert.equal(indicators[0].type, "quest-edge");
  assert.equal(indicators[0].pickupId, "gold-2");
});

test("nearest-stairs navigation marker is rendered in the viewport or at its edge", () => {
  const world = createWorld();
  const fog = createFogOfWar(world);
  const navigationMarkers = [{ id: "nearest-stairs", cell: { x: 8, y: 8 } }];
  const markers = getMinimapMarkers(world, fog, { x: 1, y: 1 }, { navigationMarkers });
  assert.deepEqual(markers.at(-2), {
    type: "navigation", color: "#ffff00", depth: MINIMAP_MARKER_DEPTHS.quest,
    markerId: "nearest-stairs", cell: { x: 8, y: 8 },
  });
  const indicators = getMinimapEdgeIndicators(world, { x: 1, y: 1 }, { x: 0, y: 0, columns: 5, rows: 5 }, { navigationMarkers });
  assert.equal(indicators.at(-1).type, "navigation-edge");
  assert.equal(indicators.at(-1).markerId, "nearest-stairs");
});

test("active quest navigation resolves the closest one stairs, key, or door", () => {
  const world = createWorld();
  world.stairs = [{ x: 8, y: 8 }, { x: 2, y: 1 }];
  world.objects = [
    { id: "key-near", type: "key", active: true, cell: { x: 3, y: 1 } },
    { id: "key-far", type: "key", active: true, cell: { x: 8, y: 8 } },
    { id: "door-near", type: "door", open: false, active: true, cell: { x: 5, y: 1 } },
    { id: "door-open", type: "door", open: true, active: true, cell: { x: 2, y: 2 } },
  ];
  world.terrain[1][5].walkable = false;
  assert.deepEqual(findNearestNavigationTarget(world, { x: 1, y: 1 }, "nearest-stairs").cell, { x: 2, y: 1 });
  assert.deepEqual(findNearestNavigationTarget(world, { x: 1, y: 1 }, "nearest-key").cell, { x: 3, y: 1 });
  assert.deepEqual(findNearestNavigationTarget(world, { x: 1, y: 1 }, "nearest-door").cell, { x: 5, y: 1 });
  const markers = getMinimapMarkers(world, createFogOfWar(world), { x: 1, y: 1 }, {
    navigationMarkers: [{ id: "nearest-key", cell: { x: 3, y: 1 } }],
  });
  assert.equal(markers.filter((marker) => marker.type === "navigation").length, 1);
});

test("minimap markers come from quest-owned pickup ids, not object pickup types", () => {
  const world = createWorld();
  world.objects = [
    { id: "gold-1", IsPickup: true, active: true, cell: { x: 2, y: 2 } },
    { id: "heart-1", IsPickup: true, active: true, cell: { x: 3, y: 3 } },
  ];
  world.questPickupIds = new Set(["gold-1"]);
  const fog = createFogOfWar(world);
  const markers = getMinimapMarkers(world, fog, { x: 1, y: 1 });
  assert.deepEqual(markers.filter((marker) => marker.type === "quest").map((marker) => marker.pickupId), ["gold-1"]);
});

test("minimap indicators use a visible inset safe area", () => {
  assert.equal(MINIMAP_INDICATOR_SAFE_INSET, 5);
  assert.equal(MINIMAP_INDICATOR_MIN_SIZE, 9.6);
  assert.deepEqual(getMinimapIndicatorSafeArea(320, 240), {
    left: 5,
    top: 5,
    right: 315,
    bottom: 235,
  });
});

test("minimap scale cycles through the designated levels and wraps", () => {
  assert.equal(getNextMinimapScale(1), 2);
  assert.equal(getNextMinimapScale(2), 3);
  assert.equal(getNextMinimapScale(3), 1);
  assert.equal(getNextMinimapScale(7), 2);
});

test("minimap migration preserves its independent scale states", () => {
  assert.equal(migrateMinimapScale(1), 1);
  assert.equal(migrateMinimapScale(2), 2);
  assert.equal(migrateMinimapScale(3), 3);
  assert.equal(migrateMinimapScale(4), 2);
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

test("always-visible minimaps accept scale input", () => {
  assert.equal(canHandleMinimapScale(), true);
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
