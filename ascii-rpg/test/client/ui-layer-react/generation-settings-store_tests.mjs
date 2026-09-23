import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeGenerationSettings } from "../../../src/client/ui-layer-react/generation-settings-store.js";
import { resolveGenerationProfile } from "../../../src/client/game-layer-babylon-lite/generation-profile.js";

test("generation settings retain the ordered catalog and default malformed densities to Med", () => {
  const settings = normalizeGenerationSettings({
    passes: [
      { id: "water", density: "High" },
      { id: "cave-walls", density: "High" },
      { id: "unrecognized", density: "Low" },
    ],
  });

  assert.deepEqual(settings.passes.map((pass) => pass.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.equal(settings.passes.find((pass) => pass.id === "water").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "overground-walls").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "underground-caves").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "enemy-spawner").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "npc-spawner").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "object-fireplace").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "player-position").configurable, false);
});

test("defaults the split wall controls to Medium when no prior choice is saved", () => {
  const settings = normalizeGenerationSettings();
  assert.equal(settings.passes.find((pass) => pass.id === "overground-walls").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "underground-caves").density, "Med");
});

test("applies each Underground Caves density to a distinct cave wall fill", () => {
  const profileFor = (density) => resolveGenerationProfile({
    passes: [{ id: "underground-caves", density }],
  });

  assert.deepEqual(
    ["Low", "Med", "High"].map((density) => profileFor(density).caveWallFillPercents.Underground),
    [30, 40, 50],
  );
});

test("keeps the NPC setting separate and applies Fireplace Low, Med, and High density", async () => {
  const app = await readFile(new URL("../../../src/client/ui-layer-react/App.jsx", import.meta.url), "utf8");
  const gameLayer = await readFile(new URL("../../../src/client/game-layer-babylon-lite/index.js", import.meta.url), "utf8");
  assert.ok(!app.includes('"npc-spawner"'));
  assert.ok(app.includes("7. Object Distribution"));
  assert.ok(!app.includes("Object &amp; NPC Distribution"));
  assert.ok(!app.includes("Low 4 · Med 8 · High 12 Overworld NPC spawners"));
  assert.ok(app.includes('"object-fireplace"'));
  assert.ok(gameLayer.includes('getObjectDistributionCount("fireplace", previewWorld.options.seed)'));
  assert.ok(gameLayer.includes('randomObjectCount("fireplace", realm.options.seed)'));
  assert.ok(gameLayer.includes("const npcSpawnerMarkers = previewRealm === \"Overground\""));
  assert.ok(gameLayer.includes('glyph: "☺", color: "#48c774"'));
  assert.ok(gameLayer.includes("...npcSpawnerMarkers"));
  assert.ok(app.includes("const isPassAvailableInPreview"));
  assert.ok(app.includes("disabled={unavailable}"));
  assert.ok(app.includes("procedural_realm_unavailable"));
});
