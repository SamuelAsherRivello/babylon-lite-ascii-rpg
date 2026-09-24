import {
  GENERATION_DENSITY_DETAILS,
  GENERATION_FEATURES,
  GENERATION_PASS_DESCRIPTIONS,
  GENERATION_PASS_REALMS,
} from "../game-layer-babylon-lite/generation-layers/generation-layer-registry.js";

// Compatibility exports for UI consumers while the registry owns the catalog.
export { GENERATION_DENSITY_DETAILS, GENERATION_PASS_DESCRIPTIONS, GENERATION_PASS_REALMS };
import { DEFAULT_WORLD_SIZE, normalizeWorldSize } from "../world-size-settings.js";
import { getGenerationOverridesFromSearch, isGenerationDiagnosticsEnabled, isGenerationUrlOverrideSession } from "../generation-mode.js";

const bundledSettings = Object.freeze({ version: 1, worldSize: DEFAULT_WORLD_SIZE, passes: GENERATION_FEATURES });

export const GENERATION_SETTINGS_STORAGE_KEY = "babylon-lite-ascii-rpg.generation-settings";
export const DENSITY_LEVELS = Object.freeze(["Low", "Med", "High"]);

export function isV2GenerationSettingsEnvironment({ development = import.meta.env?.DEV === true } = {}) {
  return development === true;
}

const isV2Environment = isV2GenerationSettingsEnvironment();

export function normalizeGenerationSettings(value, { diagnostics = isGenerationDiagnosticsEnabled() } = {}) {
  const bundledById = new Map(bundledSettings.passes.map((pass) => [pass.id, pass]));
  const selectedById = new Map((Array.isArray(value?.passes) ? value.passes : []).map((pass) => [pass?.id, pass]));
  const legacyCaveWallsDensity = selectedById.get("cave-walls")?.density;
  const legacyCivilizationDensity = selectedById.get("civilization")?.density;
  const normalized = {
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
      enabled: pass.required === true ? true : selectedById.get(pass.id)?.enabled !== false,
    }))),
  };
  if (diagnostics && isGenerationUrlOverrideSession()) {
    const parameters = new URLSearchParams(globalThis.location?.search ?? "");
    const overrides = getGenerationOverridesFromSearch();
    const urlDensity = parameters.get("generationDensity");
    const layerValue = parameters.get("worldGenerationLayersEnabled");
    const enabledOrders = layerValue === null ? undefined : new Set(layerValue.split(",").map((part) => Number.parseInt(part.trim(), 10)).filter((order) => Number.isInteger(order) && order > 0));
    if (DENSITY_LEVELS.includes(urlDensity) || enabledOrders?.size || overrides) {
      normalized.passes = Object.freeze(normalized.passes.map((pass) => Object.freeze({
        ...pass,
        ...(DENSITY_LEVELS.includes(urlDensity) && pass.configurable !== false ? { density: urlDensity } : {}),
        ...(enabledOrders?.size ? { enabled: pass.required === true || enabledOrders.has(pass.order) } : {}),
        ...(overrides?.disable.includes(pass.order) ? { enabled: false } : {}),
        ...(overrides?.low.includes(pass.order) && pass.configurable !== false ? { density: "Low" } : {}),
      })));
    }
  }
  return Object.freeze(normalized);
}

export function createDefaultGenerationSettings({ diagnostics = isGenerationDiagnosticsEnabled() } = {}) {
  return normalizeGenerationSettings({
    worldSize: DEFAULT_WORLD_SIZE,
    passes: GENERATION_FEATURES.map((pass) => ({ ...pass, density: "Med", enabled: true })),
  }, { diagnostics });
}

function readLocalSettings() {
  if (isV2Environment || typeof window === "undefined" || isGenerationUrlOverrideSession()) return null;
  try {
    const stored = window.localStorage.getItem(GENERATION_SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

let settings = normalizeGenerationSettings(readLocalSettings() ?? (isV2Environment ? bundledSettings : undefined));
if (!isV2Environment && typeof window !== "undefined" && !isGenerationDiagnosticsEnabled() && !isGenerationUrlOverrideSession()) {
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

export const generationSettingsReady = isV2Environment && typeof window !== "undefined" && !isGenerationUrlOverrideSession()
  ? loadRemoteSettings().then(replaceSettings).catch(() => {})
  : Promise.resolve();

export async function commitGenerationSettings(nextSettings) {
  const next = normalizeGenerationSettings(nextSettings);
  if (isGenerationUrlOverrideSession()) {
    replaceSettings(next);
    return;
  }
  if (isV2Environment) {
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
