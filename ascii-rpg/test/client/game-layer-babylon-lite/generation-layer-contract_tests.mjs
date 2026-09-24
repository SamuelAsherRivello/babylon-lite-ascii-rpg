import test from "node:test";
import assert from "node:assert/strict";
import { createGameSession } from "../../../src/client/game-layer-babylon-lite/game-session.js";
import { createInputController } from "../../../src/client/game-layer-babylon-lite/game-session/input-controller.js";
import { createRenderControllers } from "../../../src/client/game-layer-babylon-lite/game-session/render-controller.js";
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

test("input controller binds and disposes the session input boundary", () => {
  const targets = ["window", "canvas", "minimap"].map((name) => ({
    name,
    added: [],
    removed: [],
    addEventListener(type, handler) { this.added.push([type, handler]); },
    removeEventListener(type, handler) { this.removed.push([type, handler]); },
  }));
  const handlers = {
    keyDown() {}, keyUp() {}, resize() {}, pointerDown() {}, pointerMove() {}, pointerStop() {}, minimapClick() {},
  };
  const controller = createInputController({ windowTarget: targets[0], canvas: targets[1], minimapCanvas: targets[2], handlers });
  assert.equal(targets.reduce((count, target) => count + target.added.length, 0), 10);
  controller.dispose();
  controller.dispose();
  assert.equal(targets.reduce((count, target) => count + target.removed.length, 0), 10);
});

test("render controllers share a disposable renderer boundary", async () => {
  const cancelled = [];
  const render = (name) => () => ({ cancel: () => cancelled.push(name) });
  const controllers = createRenderControllers({
    minimap: render("minimap"),
    mapview: render("mapview"),
    preview: render("preview"),
    world: render("world"),
  });
  controllers.minimap.render();
  controllers.mapview.render();
  controllers.preview.render();
  controllers.world.render();
  controllers.minimap.dispose();
  controllers.mapview.dispose();
  controllers.preview.dispose();
  controllers.world.dispose();
  assert.deepEqual(cancelled, ["minimap", "mapview", "preview", "world"]);
  await controllers.preview.render();
});
