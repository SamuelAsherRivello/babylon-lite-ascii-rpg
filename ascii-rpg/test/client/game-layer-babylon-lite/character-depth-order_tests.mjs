import assert from "node:assert/strict";
import test from "node:test";
import { getCharacterDepthOrder } from "../../../src/client/game-layer-babylon-lite/character-depth-order.js";

test("character depth puts larger world y positions in front", () => {
  const player = Object.freeze({ type: "player", cell: Object.freeze({ x: 2, y: 5 }) });
  const enemy = Object.freeze({ type: "enemy", id: "enemy-1", cell: Object.freeze({ x: 2, y: 3 }) });
  const npc = Object.freeze({ type: "npc", id: "npc-1", cell: Object.freeze({ x: 2, y: 7 }) });
  const before = structuredClone([player, enemy, npc]);

  const order = getCharacterDepthOrder([player, enemy, npc]);

  assert.deepEqual(order.map(({ id, zIndex }) => ({ id, zIndex })), [
    { id: "enemy:enemy-1", zIndex: 1 },
    { id: "player", zIndex: 2 },
    { id: "npc:npc-1", zIndex: 3 },
  ]);
  assert.deepEqual([player, enemy, npc], before);
});

test("character depth has a stable fallback for equal y positions", () => {
  const records = [
    { type: "npc", id: "b", cell: { x: 4, y: 6 } },
    { type: "enemy", id: "a", cell: { x: 1, y: 6 } },
    { type: "player", cell: { x: 2, y: 6 } },
  ];

  assert.deepEqual(getCharacterDepthOrder(records), getCharacterDepthOrder([...records].reverse()));
});
