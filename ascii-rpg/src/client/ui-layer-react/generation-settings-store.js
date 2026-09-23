import bundledSettings from "../game-layer-babylon-lite/data/generation_settings.json" with { type: "json" };

export const GENERATION_SETTINGS_STORAGE_KEY = "babylon-lite-ascii-rpg.generation-settings";
export const DENSITY_LEVELS = Object.freeze(["Low", "Med", "High"]);
export const GENERATION_DENSITY_DETAILS = Object.freeze({
  ground: Object.freeze({ Low: "70% walkable target", Med: "Current walkable target", High: "120% walkable target" }),
  "overground-walls": Object.freeze({ Low: "30% walls, larger clumps", Med: "35% walls, larger clumps", High: "45% walls, largest clumps" }),
  "underground-caves": Object.freeze({ Low: "30% walls, smaller cave clumps", Med: "40% walls, larger cave clumps", High: "50% walls, largest cave clumps" }),
  water: Object.freeze({ Low: "5% lake chance", Med: "30% lake chance", High: "Guaranteed nine lakes" }),
  walkability: Object.freeze({ Low: "70% of current floor target", Med: "Current floor target", High: "200% floor target, open tunnels" }),
  "object-heart": Object.freeze({ Low: "Quarter heart count", Med: "Current heart count", High: "Triple heart count" }),
  "object-trap": Object.freeze({ Low: "Quarter trap count", Med: "Current trap count", High: "Triple trap count" }),
  "object-torch": Object.freeze({ Low: "Quarter torch count", Med: "Current torch count", High: "Triple torch count" }),
  "object-fireplace": Object.freeze({ Low: "Quarter fireplace count", Med: "Current fireplace count", High: "Triple fireplace count" }),
  "npc-spawner": Object.freeze({ Low: "4 Overworld NPC spawners", Med: "8 Overworld NPC spawners", High: "12 Overworld NPC spawners" }),
  civilization: Object.freeze({ Low: "Quarter current chance", Med: "Current chance", High: "Double current chance" }),
  "enemy-spawner": Object.freeze({ Low: "4 maximum spawners", Med: "16 maximum spawners", High: "32 maximum spawners" }),
});

export const GENERATION_PASS_DESCRIPTIONS = Object.freeze({
  ground: "Controls the walkable terrain target",
  "overground-walls": "Controls Overground wall density and clump size",
  "underground-caves": "Controls Underworld cave clump size",
  water: "Controls large lake distribution frequency",
  walkability: "Controls the connected floor target",
  "player-position": "Uses the centered player start",
  "object-heart": "Controls health pickup placement density",
  "object-trap": "Controls trap placement density",
  "object-torch": "Controls torch placement density",
  "object-fireplace": "Controls fireplace placement density",
  "npc-spawner": "Controls Overworld NPC spawner count",
  civilization: "Controls underground civilization placement chance",
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
  civilization: "Underworld",
  "enemy-spawner": "Underworld",
});

const isDevelopment = import.meta.env?.DEV === true;

export function normalizeGenerationSettings(value) {
  const bundledById = new Map(bundledSettings.passes.map((pass) => [pass.id, pass]));
  const selectedById = new Map((value?.passes ?? []).map((pass) => [pass?.id, pass?.density]));
  const legacyCaveWallsDensity = selectedById.get("cave-walls");
  return Object.freeze({
    version: 1,
    passes: Object.freeze([...bundledById.values()].map((pass) => Object.freeze({
      ...pass,
      density: DENSITY_LEVELS.includes(selectedById.get(pass.id))
        ? selectedById.get(pass.id)
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
