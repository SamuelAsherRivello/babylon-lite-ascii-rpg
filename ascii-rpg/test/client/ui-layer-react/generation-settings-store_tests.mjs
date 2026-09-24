import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createDefaultGenerationSettings, isV2GenerationSettingsEnvironment, normalizeGenerationSettings } from "../../../src/client/ui-layer-react/generation-settings-store.js";
import { getGenerationOverridesFromSearch, isGenerationDiagnosticsEnabled, isGenerationUrlOverrideSession } from "../../../src/client/generation-mode.js";
import { resolveGenerationProfile } from "../../../src/client/game-layer-babylon-lite/generation-profile.js";
import { getWorldSizeDimensions, WORLD_SIZE_DETAILS } from "../../../src/client/world-size-settings.js";

test("generation settings retain the ordered catalog and default malformed densities to Med", () => {
  const settings = normalizeGenerationSettings({
    passes: [
      { id: "water", density: "High" },
      { id: "cave-walls", density: "High" },
      { id: "unrecognized", density: "Low" },
    ],
  });

  assert.deepEqual(settings.passes.map((pass) => pass.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  assert.equal(settings.passes.find((pass) => pass.id === "water").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "overground-walls").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "underground-caves").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "enemy-spawner").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "npc-spawner").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "object-fireplace").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "object-chest").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "civilization-stairs").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "civilization-homes").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "player-position").configurable, false);
});

test("uses the V2 file-persistence environment contract", () => {
  assert.equal(isV2GenerationSettingsEnvironment({ development: true }), true);
  assert.equal(isV2GenerationSettingsEnvironment({ development: false }), false);
});

test("creates the World Generation Reset defaults without inheriting bundled tuning", () => {
  const defaults = createDefaultGenerationSettings({ diagnostics: true });
  assert.equal(defaults.worldSize, "Med");
  assert.ok(defaults.passes.every((pass) => pass.enabled));
  assert.ok(defaults.passes.filter((pass) => pass.configurable !== false).every((pass) => pass.density === "Med"));
});

test("V2 persistence validates and serializes the complete profile", async () => {
  const viteConfig = await readFile(new URL("../../../../vite.config.js", import.meta.url), "utf8");
  assert.ok(viteConfig.includes("typeof pass?.enabled !== \"boolean\""));
  assert.ok(viteConfig.includes("worldSize: payload.worldSize"));
});

test("defaults the split wall controls to Medium when no prior choice is saved", () => {
  const settings = normalizeGenerationSettings();
  assert.equal(settings.passes.find((pass) => pass.id === "overground-walls").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "underground-caves").density, "Med");
});

test("normalizes World Size and maps every supported selection to square per-realm dimensions", () => {
  assert.equal(normalizeGenerationSettings().worldSize, "Med");
  assert.equal(normalizeGenerationSettings({ worldSize: "High" }).worldSize, "High");
  assert.equal(normalizeGenerationSettings({ worldSize: "unsupported" }).worldSize, "Med");
  assert.deepEqual(["Low", "Med", "High"].map((worldSize) => getWorldSizeDimensions(worldSize)), [
    { rows: 128, columns: 128 },
    { rows: 256, columns: 256 },
    { rows: 512, columns: 512 },
  ]);
  assert.deepEqual(WORLD_SIZE_DETAILS, {
    Low: "Low, 128 x 128",
    Med: "Med, 256 x 256",
    High: "High, 512 x 512",
  });
});

test("defaults legacy enabled settings to true and retains a disabled pass density", () => {
  const legacy = normalizeGenerationSettings({ passes: [{ id: "water", density: "High" }] });
  const disabled = normalizeGenerationSettings({ passes: [{ id: "water", density: "High", enabled: false }, { id: "ground", enabled: false }] }, { diagnostics: true });
  assert.equal(legacy.passes.find((pass) => pass.id === "water").enabled, true);
  assert.equal(disabled.passes.find((pass) => pass.id === "water").enabled, false);
  assert.equal(disabled.passes.find((pass) => pass.id === "water").density, "High");
  assert.equal(disabled.passes.find((pass) => pass.id === "ground").enabled, true);
});

test("keeps optional enablement independent across compound child selections", () => {
  const settings = normalizeGenerationSettings({
    passes: [
      { id: "civilization-doors", density: "High", enabled: false },
      { id: "enemy-spawner", density: "Low", enabled: true },
    ],
  }, { diagnostics: true });
  assert.equal(settings.passes.find((pass) => pass.id === "civilization-doors").enabled, false);
  assert.equal(settings.passes.find((pass) => pass.id === "enemy-spawner").enabled, true);
});

test("preserves every layer's enabled state and defaults Med independently of catalog values", () => {
  const defaults = normalizeGenerationSettings(undefined, { diagnostics: false });
  assert.equal(defaults.worldSize, "Med");
  assert.ok(defaults.passes.every(pass => pass.enabled && pass.density === "Med"));
  assert.deepEqual(normalizeGenerationSettings({ passes: "invalid" }, { diagnostics: false }), defaults);
  const stored = normalizeGenerationSettings({ worldSize: "High", passes: [{ id: "water", enabled: false, density: "High" }, { id: "object-chest", density: "bad" }] }, { diagnostics: false });
  assert.equal(stored.worldSize, "High");
  assert.equal(stored.passes.find(pass => pass.id === "water").enabled, false);
  assert.equal(stored.passes.find(pass => pass.id === "water").density, "High");
  assert.equal(stored.passes.find(pass => pass.id === "object-chest").density, "Med");
  assert.equal(isGenerationDiagnosticsEnabled({ development: false, search: "?worldGenerationLayersEnabled=1" }), false);
  assert.equal(isGenerationDiagnosticsEnabled({ development: false, search: "?generationDiagnostics=true" }), true);
  assert.equal(isGenerationDiagnosticsEnabled({ development: true, search: "" }), true);
  assert.equal(isGenerationUrlOverrideSession("?generationDiagnostics=true&generationDensity=Low"), true);
  assert.equal(isGenerationUrlOverrideSession("?generationDensity=Low"), false);
  assert.deepEqual(getGenerationOverridesFromSearch("?generationOverrides=disable:7,11;low:8,16"), { disable: [7, 11], low: [8, 16] });
  assert.equal(getGenerationOverridesFromSearch("?generationOverrides=bad"), undefined);
});

test("migrates legacy Civilization density to the Doors sublayer", () => {
  const settings = normalizeGenerationSettings({ passes: [{ id: "civilization", density: "High" }] });
  assert.equal(settings.passes.find((pass) => pass.id === "civilization-doors").density, "High");
  assert.equal(settings.passes.some((pass) => pass.id === "civilization"), false);
});

test("keeps Ground as a fixed baseline and gives Walkability sole ownership of connected-area profiles", async () => {
  const settings = normalizeGenerationSettings({
    passes: [
      { id: "ground", density: "High" },
      { id: "walkability", density: "Low" },
    ],
  });
  const app = await readFile(new URL("../../../src/client/ui-layer-react/App.jsx", import.meta.url), "utf8");

  assert.equal(settings.passes.find((pass) => pass.id === "ground").configurable, false);
  assert.equal(settings.passes.find((pass) => pass.id === "ground").density, "Med");
  assert.ok(app.includes("No Settings"));
  assert.ok(app.includes("procedural_density_controls_static"));
  assert.deepEqual(
    ["Low", "Med", "High"].map((density) => resolveGenerationProfile({
      passes: [
        { id: "ground", density: "High" },
        { id: "walkability", density },
      ],
    }).minWalkableMultiplier),
    [0.7, 1, 2],
  );
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

test("keeps every Water density within the generator's valid range", () => {
  const waterFillPercents = ["Low", "Med", "High"].map((density) => resolveGenerationProfile({
    passes: [{ id: "water", density }],
  }).waterFillPercent);

  assert.deepEqual(waterFillPercents, [5, 60, 100]);
});

test("keeps Object and Character Distribution in their separate procedural cards", async () => {
  const app = await readFile(new URL("../../../src/client/ui-layer-react/App.jsx", import.meta.url), "utf8");
  const generationCheckbox = await readFile(new URL("../../../src/client/ui-layer-react/generation-enabled-checkbox.jsx", import.meta.url), "utf8");
  const gameLayer = await readFile(new URL("../../../src/client/game-layer-babylon-lite/index.js", import.meta.url), "utf8");
  assert.ok(app.includes("getGenerationSemanticCards"));
  assert.ok(app.includes('aria-label="World Settings, pass 1"'));
  assert.ok(app.includes("1. World Settings"));
  assert.ok(app.includes("World Generation"));
  assert.ok(app.includes("Procedural World Generation Passes"));
  assert.ok(app.includes("Realm Count: 2"));
  assert.ok(app.includes("WORLD_SIZE_DETAILS[worldSize]"));
  assert.ok(app.includes('aria-label="Object Distribution, pass 8"'));
  assert.ok(app.includes("Controls objects"));
  assert.ok(app.includes('aria-label="Character Distribution, pass 10"'));
  assert.ok(app.includes("10. {characterCard.title}"));
  assert.ok(app.includes("Realm: {GENERATION_PASS_REALMS[pass.id]}"));
  assert.ok(!app.includes("Low 4 · Med 8 · High 12 Overworld NPC spawners"));
  assert.ok(gameLayer.includes('getObjectDistributionCount("fireplace", previewWorld.options.seed)'));
  assert.ok(gameLayer.includes('randomObjectCount("fireplace", realm.options.seed)'));
  assert.ok(gameLayer.includes("const npcSpawnerMarkers = previewRealm === \"Overground\""));
  assert.ok(gameLayer.includes('glyph: "☺", color: "#48c774"'));
  assert.ok(gameLayer.includes("...npcSpawnerMarkers"));
  assert.ok(gameLayer.includes("const civilizationMarkers = previewRealm === \"Underground\""));
  assert.ok(gameLayer.includes('glyph: "█", color: "#d6a55a"'));
  assert.ok(gameLayer.includes('glyph: "⚿", color: "#ffd166"'));
  assert.ok(gameLayer.includes('primary: true, glyph: "█"'));
  assert.ok(gameLayer.includes('primary: false, glyph: "⚿"'));
  assert.ok(gameLayer.includes("...civilizationMarkers"));
  assert.ok(gameLayer.includes("const homeMarkers = previewRealm === \"Overground\""));
  assert.ok(gameLayer.includes("const previewPlan = resolveGenerationPlan(previewSettings"));
  assert.ok(gameLayer.includes("const previewSeedNamespace"));
  assert.ok(gameLayer.includes('previewSeedNamespace("civilization-homes")'));
  assert.ok(gameLayer.includes('kind: "home", glyph: "^", color: "#d6a55a"'));
  assert.ok(gameLayer.includes("...homeMarkers"));
  assert.ok(gameLayer.includes('previewFeatureEnabled("civilization-stairs") ? previewWorld.stairs ?? [] : []'));
  assert.ok(gameLayer.includes("const PROCEDURAL_PREVIEW_OBJECT_ICON_SIZE = Object.freeze({"));
  assert.ok(gameLayer.includes("minimumPixels: 12,"));
  assert.ok(gameLayer.includes("maximumPixels: 36,"));
  assert.ok(gameLayer.includes("cellMultiplier: 6,"));
  assert.ok(gameLayer.includes("const objectGlyphSize = Math.max("));
  assert.ok(gameLayer.includes("* PROCEDURAL_PREVIEW_OBJECT_ICON_SIZE.cellMultiplier"));
  assert.ok(app.includes("const isPassAvailableInPreview"));
  assert.ok(app.includes("disabled={unavailable}"));
  assert.ok(app.includes("procedural_realm_unavailable"));
  assert.ok(app.includes('aria-label="Civilization Placement, pass 9"'));
  assert.ok(app.includes("9. {civilizationCard.title}"));
  assert.ok(app.includes("Controls Stairs, Doors, and Homes placement"));
  assert.ok(app.includes('["civilization-doors", "civilization-homes"].includes(pass.id)'));
  assert.ok(generationCheckbox.includes("function GenerationEnabledCheckbox"));
  assert.ok(generationCheckbox.includes('title={disabled ? `${title} must remain enabled` : `${action} ${title}`}'));
  assert.ok(generationCheckbox.includes("checkboxRef.current.indeterminate = mixed"));
  assert.ok(app.includes("const setMacroEnabled = (ids, enabled)"));
  assert.ok(app.includes("ids.has(pass.id) ? { ...pass, enabled } : pass"));
  assert.ok(app.includes("setMacroEnabled(new Set(card.featureIds), !enabled)"));
  assert.ok(app.includes("const children = card.featureIds.map((id) => draft.passes.find((pass) => pass.id === id)).filter(Boolean)"));
  assert.ok(gameLayer.includes("caveEnabledByRealm: {"));
  assert.ok(gameLayer.includes("waterEnabled: previewFeatureEnabled(\"water\")"));
  assert.ok(gameLayer.includes("waterEnabled: featureEnabled(\"water\")"));
  assert.ok(gameLayer.includes("const previewDimensions = getWorldSizeDimensions(previewSettings.worldSize)"));
  assert.ok(gameLayer.includes("rows: previewDimensions.rows"));
  assert.ok(gameLayer.includes("columns: previewDimensions.columns"));
  assert.ok(gameLayer.includes("const worldDimensions = getWorldSizeDimensions(runtimeGenerationSettings.worldSize)"));
  assert.ok(gameLayer.includes("rows: worldDimensions.rows"));
  assert.ok(gameLayer.includes("columns: worldDimensions.columns"));
  assert.ok(gameLayer.includes("featureEnabled(\"civilization-doors\") ? createCivilizationGroups"));
  assert.ok(gameLayer.includes("featureEnabled(\"enemy-spawner\") ? selectEnemySpawnerCells"));

  const fireplaceCounts = ["Low", "Med", "High"].map((density) => resolveGenerationProfile({
    passes: [{ id: "object-fireplace", density }],
  }).objectCountMultipliers.fireplace);
  assert.deepEqual(fireplaceCounts, [0.25, 0.5, 1]);
});

test("applies Doors density to civilization placement", () => {
  const chanceMultipliers = ["Low", "Med", "High"].map((density) => resolveGenerationProfile({
    passes: [{ id: "civilization-doors", density }],
  }).civilizationChanceMultiplier);
  assert.deepEqual(chanceMultipliers, [0.25, 1, 2]);
});

test("applies Homes density independently to Overworld building placement", () => {
  const multipliers = ["Low", "Med", "High"].map((density) => resolveGenerationProfile({
    passes: [{ id: "civilization-homes", density }],
  }).homeChanceMultiplier);
  assert.deepEqual(multipliers, [0.25, 1, 2]);
  const settings = normalizeGenerationSettings({ passes: [{ id: "civilization-doors", density: "High" }] });
  assert.equal(settings.passes.find((pass) => pass.id === "civilization-homes").density, "Med");
});

test("maps Chest Low, Med, and High settings to one, two, and three chests", () => {
  const chestCounts = ["Low", "Med", "High"].map((density) => resolveGenerationProfile({
    passes: [{ id: "object-chest", density }],
  }).chestCount);
  assert.deepEqual(chestCounts, [1, 2, 3]);
});

test("keeps the paired Stairs profile independent from Hearts", () => {
  const profile = (heart, stairs) => resolveGenerationProfile({
    passes: [{ id: "object-heart", density: heart }, { id: "civilization-stairs", density: stairs }],
  });
  assert.deepEqual(["Low", "Med", "High"].map((density) => profile("High", density).stairsCountMultiplier), [0.25, 1, 3]);
  assert.equal(profile("Low", "High").stairsCountMultiplier, 3);
  assert.equal(profile("Low", "High").objectCountMultipliers.heart, 0.25);
});
