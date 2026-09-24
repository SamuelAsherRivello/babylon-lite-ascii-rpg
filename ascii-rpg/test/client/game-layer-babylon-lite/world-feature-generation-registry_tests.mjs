import assert from "node:assert/strict";
import test from "node:test";
import objectData from "../../../src/client/game-layer-babylon-lite/data/object_data.json" with { type: "json" };
import { GENERATION_FEATURES, GENERATION_SEMANTIC_CARDS, resolveGenerationPlan, validateGenerationRegistry } from "../../../src/client/game-layer-babylon-lite/world-feature-generation-registry.js";

test("registry exposes the sixteen ordered features through nine semantic cards", () => {
  assert.equal(validateGenerationRegistry(), true);
  assert.deepEqual(GENERATION_FEATURES.map((feature) => feature.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  assert.equal(GENERATION_SEMANTIC_CARDS.length, 9);
  assert.deepEqual(GENERATION_SEMANTIC_CARDS.find((card) => card.id === "object-distribution").featureIds.includes("npc-spawner"), false);
  assert.deepEqual(GENERATION_SEMANTIC_CARDS.find((card) => card.id === "character-distribution").featureIds, ["enemy-spawner", "npc-spawner"]);
  assert.ok(GENERATION_SEMANTIC_CARDS.find((card) => card.id === "object-distribution").featureIds.includes("object-chest"));
  assert.deepEqual(GENERATION_SEMANTIC_CARDS.find((card) => card.id === "civilization-placement").featureIds, ["civilization-stairs", "civilization-doors", "civilization-homes"]);
  assert.equal(GENERATION_FEATURES.find((feature) => feature.id === "civilization-stairs").pairedRealms, true);
  assert.deepEqual(GENERATION_FEATURES.find((feature) => feature.id === "civilization-doors").realms, ["Underground"]);
  assert.deepEqual(GENERATION_FEATURES.find((feature) => feature.id === "civilization-homes").realms, ["Overground"]);
});

test("registry rejects missing generated-object registrations and prerequisite cycles", () => {
  const missingObject = objectData.objects.map((object) => object.type === "heart" ? { ...object, generation: undefined } : object);
  assert.throws(() => validateGenerationRegistry(GENERATION_FEATURES, missingObject), /Missing generated object declaration: heart/);
  const cyclic = GENERATION_FEATURES.map((feature) => feature.id === "object-heart" ? { ...feature, requires: ["object-trap"] } : feature.id === "object-trap" ? { ...feature, requires: ["object-heart"] } : feature);
  assert.throws(() => validateGenerationRegistry(cyclic), /Cyclic generation prerequisite/);
});

test("resolved plans preserve raw order and realm exclusions", () => {
  const settings = { passes: [{ id: "civilization-stairs", density: "High" }] };
  const overground = resolveGenerationPlan(settings, "Overground");
  const underground = resolveGenerationPlan(settings, "Underground");
  assert.deepEqual(overground.map((feature) => feature.order), [...overground].map((feature) => feature.order).sort((left, right) => left - right));
  assert.equal(overground.some((feature) => feature.id === "civilization-doors"), false);
  assert.equal(underground.some((feature) => feature.id === "civilization-homes"), false);
  assert.equal(overground.find((feature) => feature.id === "civilization-stairs").density, "High");
  assert.ok(underground.find((feature) => feature.id === "enemy-spawner").order > underground.find((feature) => feature.id === "civilization-doors").order);
});

test("every generated object is registered, planned, and represented by a semantic card", () => {
  const semanticIds = new Set(GENERATION_SEMANTIC_CARDS.flatMap((card) => card.featureIds));
  const plannedIds = new Set(resolveGenerationPlan().map((feature) => feature.id));
  for (const object of objectData.objects.filter((entry) => entry.IsLevelSpawned)) {
    const feature = GENERATION_FEATURES.find((entry) => entry.objectType === object.type);
    assert.ok(feature, object.type);
    assert.ok(semanticIds.has(feature.id), object.type);
    assert.ok(plannedIds.has(feature.id), object.type);
    assert.equal(feature.seedNamespace, object.generation.seedNamespace, object.type);
  }
});
