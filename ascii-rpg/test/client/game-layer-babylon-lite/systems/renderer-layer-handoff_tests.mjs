import test from "node:test";
import assert from "node:assert/strict";
import { attachReplacementRendererLayer } from "../../../../src/client/game-layer-babylon-lite/systems/renderer-layer-handoff.js";

test("attaches the replacement renderer layer before removing the current layer", () => {
  const events = [];
  const currentLayer = { id: "current" };
  const nextLayer = { id: "next" };
  const result = attachReplacementRendererLayer({
    renderer: { id: "renderer" },
    currentLayer,
    nextAtlas: { id: "atlas" },
    capacity: 32,
    createLayer(atlas, options) {
      events.push(["create", atlas.id, options.capacity]);
      return nextLayer;
    },
    addLayer(renderer, layer) {
      events.push(["add", renderer.id, layer.id]);
    },
    removeLayer(renderer, layer) {
      events.push(["remove", renderer.id, layer.id]);
    },
  });

  assert.equal(result, nextLayer);
  assert.deepEqual(events, [
    ["create", "atlas", 32],
    ["add", "renderer", "next"],
    ["remove", "renderer", "current"],
  ]);
});

test("does not mutate a disposed renderer from a stale scheduled render", () => {
  const currentLayer = { id: "current" };
  const result = attachReplacementRendererLayer({
    renderer: { _disposed: true },
    currentLayer,
    nextAtlas: { id: "atlas" },
    capacity: 32,
    createLayer() { throw new Error("A disposed renderer must not create a replacement layer."); },
    addLayer() { throw new Error("A disposed renderer must not accept a replacement layer."); },
    removeLayer() { throw new Error("A disposed renderer must not remove a layer."); },
  });

  assert.equal(result, currentLayer);
});
