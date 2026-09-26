import assert from "node:assert/strict";
import test from "node:test";
import { createFogOfWar, discoverCell } from "../../../src/client/game-layer-babylon-lite/systems/fog-of-war-system.js";
import { getVisibleNpcPresentationRecords } from "../../../src/client/game-layer-babylon-lite/npc-presentation.js";

test("NPC presentation retains only active-realm, visible, discovered records", () => {
  const world = { columns: 4, rows: 2, terrain: Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => ({ walkable: true }))) };
  const fog = createFogOfWar(world);
  discoverCell(fog, world, { x: 1, y: 0 });
  const records = getVisibleNpcPresentationRecords({
    realm: "Overground", region: { x: 0, y: 0, columns: 2, rows: 1 }, fog, world,
    npcs: [
      { type: "npc", id: "visible", realm: "Overground", cell: { x: 1, y: 0 } },
      { type: "npc", id: "fogged", realm: "Overground", cell: { x: 0, y: 0 } },
      { type: "npc", id: "offscreen", realm: "Overground", cell: { x: 3, y: 0 } },
      { type: "npc", id: "other-realm", realm: "Underground", cell: { x: 1, y: 0 } },
    ],
  });

  assert.deepEqual(records.map(({ id }) => id), ["visible"]);
});
