import test from "node:test";
import assert from "node:assert/strict";
import { createGameSession } from "../../../src/client/game-layer-babylon-lite/game-session.js";
import { createWalkabilityPass } from "../../../src/client/game-layer-babylon-lite/generation-layers/walkability-generation-layer.js";
import { createCharacters } from "../../../src/client/game-layer-babylon-lite/generation-layers/player-start-generation-layer.js";
import { initializeDynamicGenerationFeatures } from "../../../src/client/game-layer-babylon-lite/generation-layers/dynamic-entity-generation-layer.js";

test("game-session factory preserves the disposable session contract", async () => {
  let disposed = false;
  const session = await createGameSession(() => ({ dispose: () => { disposed = true; } }));
  session.dispose();
  assert.equal(disposed, true);
});

test("walkability layer keeps borders blocked and shallow water walkable", () => {
  const result = createWalkabilityPass([["wall", "wall", "wall"], ["wall", "ground", "shallowWater"], ["wall", "wall", "wall"]], 3, 3);
  assert.deepEqual(result, [[false, false, false], [false, true, false], [false, false, false]]);
});

test("player-start layer places torches before the player marker", () => {
  const result = createCharacters(3, 3, { x: 1, y: 1 }, [{ x: 0, y: 0 }], "P", "T");
  assert.equal(result[0][0], "T");
  assert.equal(result[1][1], "P");
});

test("dynamic generation layer honors registry enablement", () => {
  const calls = [];
  initializeDynamicGenerationFeatures([{ id: "enemy-spawner", owner: "dynamic", enabled: true, order: 2 }, { id: "npc-spawner", owner: "dynamic", enabled: false, order: 1 }], { "enemy-spawner": () => calls.push("enemy"), "npc-spawner": () => calls.push("npc") });
  assert.deepEqual(calls, ["enemy"]);
});
