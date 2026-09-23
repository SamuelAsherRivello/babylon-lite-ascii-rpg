import bundledSettings from "../game-layer-babylon-lite/data/generation_settings.json" with { type: "json" };

export const GENERATION_SETTINGS_STORAGE_KEY = "babylon-lite-ascii-rpg.generation-settings";
export const DENSITY_LEVELS = Object.freeze(["Low", "Med", "High"]);
export const GENERATION_DENSITY_DETAILS = Object.freeze({
  "overground-walls": Object.freeze({ Low: "30% walls, larger clumps", Med: "35% walls, larger clumps", High: "45% walls, largest clumps" }),
  "underground-caves": Object.freeze({ Low: "30% walls, smaller cave clumps", Med: "40% walls, larger cave clumps", High: "50% walls, largest cave clumps" }),
  water: Object.freeze({ Low: "5% lake chance", Med: "60% lake chance", High: "100% lake chance, nine lakes" }),
  walkability: Object.freeze({ Low: "70% connected-area target", Med: "Current connected-area target", High: "200% connected-area target, fewer walls" }),
  "object-heart": Object.freeze({ Low: "Quarter heart count", Med: "Current heart count", High: "Triple heart count" }),
  "object-trap": Object.freeze({ Low: "Quarter trap count", Med: "Current trap count", High: "Triple trap count" }),
  "object-torch": Object.freeze({ Low: "Quarter torch count", Med: "Current torch count", High: "Triple torch count" }),
  "object-fireplace": Object.freeze({ Low: "Quarter fireplace count", Med: "Half fireplace count", High: "Current fireplace count" }),
  "npc-spawner": Object.freeze({ Low: "4 Overworld NPC spawners", Med: "8 Overworld NPC spawners", High: "12 Overworld NPC spawners" }),
  "civilization-doors": Object.freeze({ Low: "Quarter current door chance", Med: "Current door chance", High: "Double current door chance" }),
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
  "object-trap": "Controls trap placement density",
  "object-torch": "Controls torch placement density",
  "object-fireplace": "Controls fireplace placement density",
  "npc-spawner": "Controls Overworld NPC spawner count",
  "civilization-doors": "Controls underground door placement chance",
  "enemy-spawner": "Controls enemy spawner placement density",
});

export const GENERATION_PASS_REALMS = Object.freeze({
  ground: "All",
  "overground-walls": "Overworld",
  "underground-caves": "Underworld",
  water: "All",
  walkability: "All",
  "player-position": "All",
  "object-heart": "All",
  "object-trap": "All",
  "object-torch": "All",
  "object-fireplace": "Underworld",
  "npc-spawner": "Overworld",
  "civilization-doors": "Underworld",
  "enemy-spawner": "Underworld",
});

const isDevelopment = import.meta.env?.DEV === true;

export function normalizeGenerationSettings(value) {
  const bundledById = new Map(bundledSettings.passes.map((pass) => [pass.id, pass]));
  const selectedById = new Map((value?.passes ?? []).map((pass) => [pass?.id, pass?.density]));
  const legacyCaveWallsDensity = selectedById.get("cave-walls");
  const legacyCivilizationDensity = selectedById.get("civilization");
  return Object.freeze({
    version: 1,
    passes: Object.freeze([...bundledById.values()].map((pass) => Object.freeze({
      ...pass,
      density: pass.configurable === false
        ? pass.density
        : DENSITY_LEVELS.includes(selectedById.get(pass.id))
        ? selectedById.get(pass.id)
        : pass.id === "civilization-doors" && DENSITY_LEVELS.includes(legacyCivilizationDensity)
          ? legacyCivilizationDensity
        : ["overground-walls", "underground-caves"].includes(pass.id) && DENSITY_LEVELS.includes(legacyCaveWallsDensity)
          ? legacyCaveWallsDensity
          : pass.density,
    }))),
  });
}

function readLocalSettings() {
  if (isDevelopment || typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(GENERATION_SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

let settings = normalizeGenerationSettings(readLocalSettings() ?? bundledSettings);
const listeners = new Set();

export function getGenerationSettings() { return settings; }
export function subscribeToGenerationSettings(listener) { listeners.add(listener); return () => listeners.delete(listener); }

function replaceSettings(next) {
  settings = normalizeGenerationSettings(next);
  for (const listener of listeners) listener();
}

async function loadRemoteSettings() {
  const response = await fetch(`/__ascii_generation_settings?cache=${Date.now()}`);
  if (!response.ok) throw new Error("Unable to load the local generation settings file.");
  return response.json();
}

export const generationSettingsReady = isDevelopment && typeof window !== "undefined"
  ? loadRemoteSettings().then(replaceSettings).catch(() => {})
  : Promise.resolve();

export async function commitGenerationSettings(nextSettings) {
  const next = normalizeGenerationSettings(nextSettings);
  if (isDevelopment) {
    const response = await fetch("/__ascii_generation_settings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next),
    });
    if (!response.ok) throw new Error("The local generation settings file could not be written.");
  } else {
    window.localStorage.setItem(GENERATION_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  }
  replaceSettings(next);
}

export async function commitGenerationDensity(id, density) {
  if (!DENSITY_LEVELS.includes(density) || !settings.passes.some((pass) => pass.id === id)) return;
  return commitGenerationSettings({ ...settings, passes: settings.passes.map((pass) => (pass.id === id ? { ...pass, density } : pass)) });
}
