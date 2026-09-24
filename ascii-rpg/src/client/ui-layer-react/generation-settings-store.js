import { GENERATION_FEATURES } from "../game-layer-babylon-lite/generation-layers/generation-layer-registry.js";
import { DEFAULT_WORLD_SIZE, normalizeWorldSize } from "../world-size-settings.js";
import { isGenerationDiagnosticsEnabled } from "../generation-mode.js";

const bundledSettings = Object.freeze({ version: 1, worldSize: DEFAULT_WORLD_SIZE, passes: GENERATION_FEATURES });

export const GENERATION_SETTINGS_STORAGE_KEY = "babylon-lite-ascii-rpg.generation-settings";
export const DENSITY_LEVELS = Object.freeze(["Low", "Med", "High"]);
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
  ground: "All",
  "overground-walls": "Overworld",
  "underground-caves": "Underworld",
  water: "All",
  walkability: "All",
  "player-position": "All",
  "object-heart": "All",
  "object-chest": "All",
  "object-trap": "All",
  "object-torch": "All",
  "object-fireplace": "Underworld",
  "npc-spawner": "Overworld",
  "civilization-stairs": "All",
  "civilization-doors": "Underworld",
  "civilization-homes": "Overworld",
  "enemy-spawner": "Underworld",
});

const isDevelopment = import.meta.env?.DEV === true;

export function normalizeGenerationSettings(value, { diagnostics = isGenerationDiagnosticsEnabled() } = {}) {
  const bundledById = new Map(bundledSettings.passes.map((pass) => [pass.id, pass]));
  const selectedById = new Map((Array.isArray(value?.passes) ? value.passes : []).map((pass) => [pass?.id, pass]));
  const legacyCaveWallsDensity = selectedById.get("cave-walls")?.density;
  const legacyCivilizationDensity = selectedById.get("civilization")?.density;
  return Object.freeze({
    version: 1,
    worldSize: normalizeWorldSize(value?.worldSize),
    passes: Object.freeze([...bundledById.values()].map((pass) => Object.freeze({
      ...pass,
      density: pass.configurable === false
        ? pass.density
        : DENSITY_LEVELS.includes(selectedById.get(pass.id)?.density)
        ? selectedById.get(pass.id).density
        : pass.id === "civilization-doors" && DENSITY_LEVELS.includes(legacyCivilizationDensity)
          ? legacyCivilizationDensity
        : ["overground-walls", "underground-caves"].includes(pass.id) && DENSITY_LEVELS.includes(legacyCaveWallsDensity)
          ? legacyCaveWallsDensity
          : !diagnostics || ["npc-spawner", "enemy-spawner"].includes(pass.id)
            ? "Med"
            : pass.density,
      enabled: !diagnostics || pass.required === true ? true : selectedById.get(pass.id)?.enabled !== false,
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

let settings = normalizeGenerationSettings(readLocalSettings() ?? (isDevelopment ? bundledSettings : undefined));
if (!isDevelopment && typeof window !== "undefined" && !isGenerationDiagnosticsEnabled()) {
  try { window.localStorage.setItem(GENERATION_SETTINGS_STORAGE_KEY, JSON.stringify(settings)); } catch { /* Read-only storage still permits play. */ }
}
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
