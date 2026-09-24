import assert from "node:assert/strict";
import test from "node:test";
import { coalesceDirtyCells, createWorldViewCache, selectWorldViewRefresh } from "../../../src/client/game-layer-babylon-lite/world-view-cache.js";

test("coalesces adjacent dirty cells into bounded rectangles", () => {
  assert.deepEqual(coalesceDirtyCells([
    { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 8, y: 4 },
  ]), [
    { x: 2, y: 1, width: 2, height: 2 }, { x: 8, y: 4, width: 1, height: 1 },
  ]);
});

test("selects reuse, partial, and full refreshes from semantic state and dirty coverage", () => {
  const previous = { compatibilityKey: "realm:a:geometry:1", contentKey: "state:1" };
  assert.equal(selectWorldViewRefresh({ previous, compatibilityKey: previous.compatibilityKey, contentKey: previous.contentKey, totalCells: 100 }).mode, "reuse");
  assert.equal(selectWorldViewRefresh({ previous, compatibilityKey: previous.compatibilityKey, contentKey: previous.contentKey, totalCells: 100, forceFull: true }).mode, "full");
  assert.equal(selectWorldViewRefresh({ previous, compatibilityKey: previous.compatibilityKey, contentKey: "state:2", totalCells: 100, cells: [{ x: 1, y: 1 }] }).mode, "partial");
  assert.equal(selectWorldViewRefresh({ previous, compatibilityKey: "realm:b:geometry:1", contentKey: "state:2", totalCells: 100, cells: [{ x: 1, y: 1 }] }).mode, "full");
  assert.equal(selectWorldViewRefresh({ previous, compatibilityKey: previous.compatibilityKey, contentKey: "state:2", totalCells: 4, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] }).mode, "full");
});

test("uses full refresh for fragmented dirty regions", () => {
  const previous = { compatibilityKey: "stable", contentKey: "one" };
  assert.equal(selectWorldViewRefresh({
    previous, compatibilityKey: "stable", contentKey: "two", totalCells: 1000, maxRectangles: 2,
    cells: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }],
  }).mode, "full");
});

test("bounds resources and releases one view without disturbing another", () => {
  const disposed = [];
  const cache = createWorldViewCache({ maxResources: 2 });
  cache.retainResource("minimap", "first", "one", (value) => disposed.push(value));
  cache.retainResource("mapview", "first", "two", (value) => disposed.push(value));
  cache.releaseView("mapview");
  assert.deepEqual(disposed, ["two"]);
  assert.deepEqual(cache.snapshot(), { views: 0, resources: 1 });
  cache.retainResource("preview", "first", "three", (value) => disposed.push(value));
  cache.retainResource("preview", "second", "four", (value) => disposed.push(value));
  assert.deepEqual(disposed, ["two", "one"]);
});

test("does not publish a cooperative render until its completed decision is committed", () => {
  const cache = createWorldViewCache();
  const input = { compatibilityKey: "mapview:one", contentKey: "one", totalCells: 64 };
  const pending = cache.evaluate("mapview", input);
  assert.equal(pending.mode, "full");
  assert.equal(cache.evaluate("mapview", input).mode, "full");
  cache.commit("mapview", pending);
  assert.equal(cache.evaluate("mapview", input).mode, "reuse");
});

test("generation resources are reusable by semantic key and clear without a committed view", () => {
  const released = [];
  const cache = createWorldViewCache({ maxResources: 2 });
  const terrain = Object.freeze({ id: "terrain" });
  cache.retainResource("generation", "terrain:1", terrain, resource => released.push(resource));
  cache.retainResource("generation", "terrain:2", 2, resource => released.push(resource));
  assert.equal(cache.getResource("generation", "terrain:1"), terrain);
  cache.retainResource("generation", "terrain:3", 3, resource => released.push(resource));
  assert.equal(cache.getResource("generation", "terrain:2"), null);
  assert.deepEqual(released, [2]);
  cache.clear();
  assert.deepEqual(released, [2, terrain, 3]);
  assert.deepEqual(cache.snapshot(), { views: 0, resources: 0 });
});
