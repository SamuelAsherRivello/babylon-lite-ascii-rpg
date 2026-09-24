import bundledSettings from "./data/generation_settings.json" with { type: "json" };
import objectData from "./data/object_data.json" with { type: "json" };

const DENSITIES = new Set(["Low", "Med", "High"]);

export const GENERATION_DENSITY_DETAILS = Object.freeze({
  "overground-walls": Object.freeze({ Low: "30% walls, larger clumps", Med: "35% walls, larger clumps", High: "45% walls, largest clumps" }),
  "underground-caves": Object.freeze({ Low: "30% walls, smaller cave clumps", Med: "40% walls, larger cave clumps", High: "50% walls, largest cave clumps" }),
  water: Object.freeze({ Low: "5% lake chance", Med: "60% lake chance", High: "100% lake chance, nine lakes" }),
  walkability: Object.freeze({ Low: "70% connected-area target", Med: "Current connected-area target", High: "200% connected-area target, fewer walls" }),
  "object-heart": Object.freeze({ Low: "Quarter heart count", Med: "Current heart count", High: "Triple heart count" }),
  "object-chest": Object.freeze({ Low: "1 chest per realm", Med: "2 chests per realm", High: "3 chests per realm" }),
  "object-trap": Object.freeze({ Low: "Quarter trap count", Med: "Current trap count", High: "Triple trap count" }),
  "object-torch": Object.freeze({ Low: "Quarter torch count", Med: "Current torch count", High: "Triple torch count" }),
  "object-fireplace": Object.freeze({ Low: "Quarter fireplace count", Med: "Half fireplace count", High: "Current fireplace count" }),
  "npc-spawner": Object.freeze({ Low: "4 Overworld NPC spawners", Med: "8 Overworld NPC spawners", High: "12 Overworld NPC spawners" }),
  "civilization-stairs": Object.freeze({ Low: "Quarter stair count", Med: "Current stair count", High: "Triple stair count" }),
  "civilization-doors": Object.freeze({ Low: "Quarter current door chance", Med: "Current door chance", High: "Double current door chance" }),
  "civilization-homes": Object.freeze({ Low: "Quarter current home chance", Med: "Current home chance", High: "Double current home chance" }),
  "enemy-spawner": Object.freeze({ Low: "4 maximum spawners", Med: "16 maximum spawners", High: "32 maximum spawners" }),
});

export const GENERATION_PASS_DESCRIPTIONS = Object.freeze({
  ground: "Creates the fixed ground foundation before later terrain passes",
  "overground-walls": "Controls Overground wall density and clump size",
  "underground-caves": "Controls Underworld cave clump size",
  water: "Controls large lake distribution frequency",
  walkability: "Controls the minimum connected playable area and open pathways",
  "player-position": "Uses the centered player start",
  "object-heart": "Controls health pickup placement density",
  "object-chest": "Controls treasure chest placement within 50 cells of each realm start",
  "object-trap": "Controls trap placement density",
  "object-torch": "Controls torch placement density",
  "object-fireplace": "Controls fireplace placement density",
  "npc-spawner": "Controls Overworld NPC spawner count",
  "civilization-stairs": "Controls paired stair placement density",
  "civilization-doors": "Controls underground door placement chance",
  "civilization-homes": "Controls Overworld home placement chance",
  "enemy-spawner": "Controls enemy spawner placement density",
});

export const GENERATION_PASS_REALMS = Object.freeze({
  ground: "All", "overground-walls": "Overworld", "underground-caves": "Underworld", water: "All", walkability: "All", "player-position": "All",
  "object-heart": "All", "object-chest": "All", "object-trap": "All", "object-torch": "All", "object-fireplace": "Underworld",
  "npc-spawner": "Overworld", "civilization-stairs": "All", "civilization-doors": "Underworld", "civilization-homes": "Overworld", "enemy-spawner": "Underworld",
});
const declarations = new Map([
  ["ground", { owner: "terrain", realms: ["Overground", "Underground"], configurable: false, required: true, seedNamespace: "ground" }],
  ["overground-walls", { owner: "terrain", realms: ["Overground"], seedNamespace: "overground-walls" }],
  ["underground-caves", { owner: "terrain", realms: ["Underground"], seedNamespace: "underground-caves" }],
  ["water", { owner: "terrain", realms: ["Overground", "Underground"], seedNamespace: "water" }],
  ["walkability", { owner: "terrain", realms: ["Overground", "Underground"], required: true, seedNamespace: "walkability" }],
  ["player-position", { owner: "player", realms: ["Overground", "Underground"], configurable: false, required: true, requires: ["walkability"], seedNamespace: "player-position" }],
  ["object-heart", { owner: "objects", realms: ["Overground", "Underground"], requires: ["player-position"], objectType: "heart", seedNamespace: "heart:placement" }],
  ["object-chest", { owner: "objects", realms: ["Overground", "Underground"], requires: ["player-position"], objectType: "chest", seedNamespace: "chest:placement" }],
  ["object-trap", { owner: "objects", realms: ["Overground", "Underground"], requires: ["player-position"], objectType: "trap", seedNamespace: "trap:placement" }],
  ["object-torch", { owner: "objects", realms: ["Overground", "Underground"], requires: ["player-position"], objectType: "torch", seedNamespace: "torch:placement" }],
  ["npc-spawner", { owner: "dynamic", realms: ["Overground"], requires: ["player-position"], seedNamespace: "npc-spawner:placement" }],
  ["object-fireplace", { owner: "objects", realms: ["Underground"], requires: ["civilization-doors"], objectType: "fireplace", seedNamespace: "fireplace:placement" }],
  ["civilization-stairs", { owner: "civilization", realms: ["Overground", "Underground"], requires: ["player-position"], objectType: "stairs", seedNamespace: "stairs", pairedRealms: true }],
  ["civilization-doors", { owner: "civilization", realms: ["Underground"], requires: ["civilization-stairs"], seedNamespace: "civilization:placement" }],
  ["civilization-homes", { owner: "civilization", realms: ["Overground"], requires: ["civilization-stairs"], seedNamespace: "buildings:placement" }],
  ["enemy-spawner", { owner: "dynamic", realms: ["Underground"], requires: ["civilization-doors"], seedNamespace: "enemy-spawner:placement" }],
]);

export const GENERATION_FEATURES = Object.freeze(bundledSettings.passes.map((pass) => Object.freeze({
  ...pass,
  ...declarations.get(pass.id),
  requires: Object.freeze([...(declarations.get(pass.id)?.requires ?? [])]),
})).sort((left, right) => left.order - right.order));

export const GENERATION_SEMANTIC_CARDS = Object.freeze([
  ...GENERATION_FEATURES.filter((feature) => feature.order <= 6).map((feature) => Object.freeze({ id: feature.id, title: feature.title, featureIds: Object.freeze([feature.id]) })),
  Object.freeze({ id: "object-distribution", title: "Object Distribution", featureIds: Object.freeze(["object-heart", "object-chest", "object-trap", "object-torch", "object-fireplace"]) }),
  Object.freeze({ id: "civilization-placement", title: "Civilization Placement", featureIds: Object.freeze(["civilization-stairs", "civilization-doors", "civilization-homes"]) }),
  Object.freeze({ id: "character-distribution", title: "Character Distribution", featureIds: Object.freeze(["enemy-spawner", "npc-spawner"]) }),
]);

export function validateGenerationRegistry(features = GENERATION_FEATURES, catalog = objectData.objects) {
  const byId = new Map();
  const catalogByType = new Map(catalog.map((object) => [object.type, object]));
  for (const feature of features) {
    if (!feature?.id || byId.has(feature.id)) throw new TypeError(`Unknown or duplicate generation feature: ${feature?.id ?? "missing"}.`);
    if (!Number.isInteger(feature.order) || feature.order < 1 || !Array.isArray(feature.realms) || feature.realms.length === 0) throw new TypeError(`Invalid generation declaration: ${feature.id}.`);
    if (feature.configurable !== false && !DENSITIES.has(feature.density)) throw new TypeError(`Missing density setting for generation feature: ${feature.id}.`);
    if (feature.objectType) {
      const object = catalogByType.get(feature.objectType);
      if (!object?.IsLevelSpawned || object.generation?.passId !== feature.id) throw new TypeError(`Missing generated object declaration: ${feature.objectType}.`);
    }
    byId.set(feature.id, feature);
  }
  for (const object of catalog) if (object.IsLevelSpawned && ![...byId.values()].some((feature) => feature.objectType === object.type)) {
    throw new TypeError(`Missing generation feature for object: ${object.type}.`);
  }
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new TypeError(`Cyclic generation prerequisite: ${id}.`);
    const feature = byId.get(id);
    if (!feature) throw new TypeError(`Unknown generation prerequisite: ${id}.`);
    visiting.add(id);
    for (const requiredId of feature.requires ?? []) visit(requiredId);
    visiting.delete(id);
    visited.add(id);
  };
  for (const feature of features) visit(feature.id);
  return true;
}

export function resolveGenerationPlan(settings = { passes: [] }, realm = null) {
  validateGenerationRegistry();
  const selectedById = new Map((settings.passes ?? []).map((pass) => [pass.id, pass]));
  return Object.freeze(GENERATION_FEATURES.filter((feature) => !realm || feature.realms.includes(realm)).map((feature) => Object.freeze({
    ...feature,
    density: feature.configurable === false ? feature.density : selectedById.get(feature.id)?.density ?? feature.density,
    enabled: feature.required === true ? true : selectedById.get(feature.id)?.enabled !== false,
  })));
}

export function getGenerationSemanticCards() { return GENERATION_SEMANTIC_CARDS; }

validateGenerationRegistry();
