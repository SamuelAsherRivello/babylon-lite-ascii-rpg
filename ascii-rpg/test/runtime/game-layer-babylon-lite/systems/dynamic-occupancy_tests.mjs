import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicOccupancy, getDynamicVisibleGlyph } from "../../../../src/runtime/game-layer-babylon-lite/systems/dynamic-occupancy.js";
import { PLAYER_GLYPH, getVisibleGlyph, normalizePlayerMarkers } from "../../../../src/runtime/game-layer-babylon-lite/systems/world-system.js";

test("claims cells with stable unique entity identities", () => {
  const occupancy = createDynamicOccupancy();
  const enemy = occupancy.claim({ id: "enemy-1", type: "enemy", glyph: "E", cell: { x: 4, y: 7 } });

  assert.equal(enemy?.id, "enemy-1");
  assert.equal(occupancy.getAt({ x: 4, y: 7 })?.id, "enemy-1");
  assert.equal(occupancy.claim({ id: "enemy-1", type: "enemy", cell: { x: 5, y: 7 } }), null);
  assert.equal(occupancy.claim({ id: "enemy-2", type: "enemy", cell: { x: 4, y: 7 } }), null);
});

test("moves an entity exclusively and reveals its emptied cell", () => {
  const occupancy = createDynamicOccupancy();
  occupancy.claim({ id: "player", type: "player", glyph: "P", cell: { x: 1, y: 1 } });
  occupancy.claim({ id: "enemy-1", type: "enemy", glyph: "E", cell: { x: 3, y: 1 } });

  assert.equal(occupancy.move("player", { x: 2, y: 1 }), true);
  assert.equal(occupancy.getAt({ x: 1, y: 1 }), null);
  assert.equal(occupancy.getAt({ x: 2, y: 1 })?.id, "player");
  assert.equal(occupancy.move("player", { x: 3, y: 1 }), false);
  assert.deepEqual(occupancy.get("player")?.cell, { x: 2, y: 1 });
});

test("updates entity state without changing identity or occupancy and removes cleanly", () => {
  const occupancy = createDynamicOccupancy();
  occupancy.claim({ id: "spawner-1", type: "enemy-spawner", health: 100, cell: { x: 9, y: 2 } });

  const updated = occupancy.update("spawner-1", { health: 95, id: "changed", cell: { x: 0, y: 0 } });
  assert.equal(updated?.id, "spawner-1");
  assert.equal(updated?.health, 95);
  assert.deepEqual(updated?.cell, { x: 9, y: 2 });
  assert.equal(occupancy.remove("spawner-1")?.id, "spawner-1");
  assert.equal(occupancy.getAt({ x: 9, y: 2 }), null);
});

test("lists entities in claim order with optional type filtering", () => {
  const occupancy = createDynamicOccupancy();
  occupancy.claim({ id: "player", type: "player", cell: { x: 1, y: 1 } });
  occupancy.claim({ id: "enemy-1", type: "enemy", cell: { x: 2, y: 1 } });
  occupancy.claim({ id: "enemy-2", type: "enemy", cell: { x: 3, y: 1 } });

  assert.deepEqual(occupancy.getAll().map(({ id }) => id), ["player", "enemy-1", "enemy-2"]);
  assert.deepEqual(occupancy.getAll("enemy").map(({ id }) => id), ["enemy-1", "enemy-2"]);
});

test("owns the player glyph without leaving a duplicate world character marker", () => {
  const world = {
    rows: 1,
    columns: 2,
    terrain: [[{ glyph: "." }, { glyph: "." }]],
    characters: [[PLAYER_GLYPH, null]],
    objects: [],
  };
  const occupancy = createDynamicOccupancy();
  normalizePlayerMarkers(world);
  occupancy.claim({ id: "player", type: "player", glyph: PLAYER_GLYPH, cell: { x: 0, y: 0 } });

  assert.deepEqual(world.characters, [[null, null]]);
  assert.equal(getDynamicVisibleGlyph(occupancy, world, { x: 0, y: 0 }, getVisibleGlyph), PLAYER_GLYPH);
  occupancy.move("player", { x: 1, y: 0 });
  assert.equal(getDynamicVisibleGlyph(occupancy, world, { x: 0, y: 0 }, getVisibleGlyph), ".");
  assert.equal(getDynamicVisibleGlyph(occupancy, world, { x: 1, y: 0 }, getVisibleGlyph), PLAYER_GLYPH);
});
