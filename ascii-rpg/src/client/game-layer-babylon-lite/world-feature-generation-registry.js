import bundledSettings from "./data/generation_settings.json" with { type: "json" };
import objectData from "./data/object_data.json" with { type: "json" };

const DENSITIES = new Set(["Low", "Med", "High"]);
const declarations = new Map([
  ["ground", { owner: "terrain", realms: ["Overground", "Underground"], configurable: false, seedNamespace: "ground" }],
  ["overground-walls", { owner: "terrain", realms: ["Overground"], seedNamespace: "overground-walls" }],
  ["underground-caves", { owner: "terrain", realms: ["Underground"], seedNamespace: "underground-caves" }],
  ["water", { owner: "terrain", realms: ["Overground", "Underground"], seedNamespace: "water" }],
  ["walkability", { owner: "terrain", realms: ["Overground", "Underground"], seedNamespace: "walkability" }],
  ["player-position", { owner: "player", realms: ["Overground", "Underground"], configurable: false, requires: ["walkability"], seedNamespace: "player-position" }],
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
  const densityById = new Map((settings.passes ?? []).map((pass) => [pass.id, pass.density]));
  return Object.freeze(GENERATION_FEATURES.filter((feature) => !realm || feature.realms.includes(realm)).map((feature) => Object.freeze({
    ...feature,
    density: feature.configurable === false ? feature.density : densityById.get(feature.id) ?? feature.density,
  })));
}

export function getGenerationSemanticCards() { return GENERATION_SEMANTIC_CARDS; }

validateGenerationRegistry();
