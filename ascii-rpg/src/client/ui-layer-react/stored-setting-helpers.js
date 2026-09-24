import { getStoredBooleanValue, getStoredInitialZoom } from "./platform-settings.js";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_SCALE_STORAGE_VERSION } from "../game-layer-babylon-lite/zoom-scale.js";
import { getNextMinimapScale, migrateMinimapScale } from "../game-layer-babylon-lite/systems/minimap-zoom.js";
import { LIGHTING_SOURCE_STATES, PLAYER_GPU_SHADOW_BLEED_RANGES } from "../game-layer-babylon-lite/lighting.js";

export const fullscreenStorageKey = "babylon-lite-ascii-rpg.fullscreen";
export const aspectStorageKey = "babylon-lite-ascii-rpg.aspect";
export const developerOpenStorageKey = "babylon-lite-ascii-rpg.developer-open";
export const logOpenStorageKey = "babylon-lite-ascii-rpg.log-open";
export const zoomStorageKey = "babylon-lite-ascii-rpg.zoom";
export const zoomStorageVersionKey = "babylon-lite-ascii-rpg.zoom-version";
export const overgroundAmbientStorageKey = "babylon-lite-ascii-rpg.ambient-overground";
export const undergroundAmbientStorageKey = "babylon-lite-ascii-rpg.ambient-underground";
export const realmStorageKey = "babylon-lite-ascii-rpg.active-realm";
export const torchLightingStorageKey = "babylon-lite-ascii-rpg.torch-lighting";
export const playerLightingStorageKey = "babylon-lite-ascii-rpg.player-lighting";
export const torchShadowStorageKey = "babylon-lite-ascii-rpg.torch-shadow";
export const playerShadowStorageKey = "babylon-lite-ascii-rpg.player-shadow";
export const gpuLightPassStorageKey = "babylon-lite-ascii-rpg.gpu-light-pass";
export const playerGpuShadowBleedRangeStorageKey = "babylon-lite-ascii-rpg.player-gpu-shadow-bleed-range";
export const glyphBackgroundStorageKey = "babylon-lite-ascii-rpg.glyph-background";
export const backgroundDarknessStorageKey = "babylon-lite-ascii-rpg.background-darkness";
export const minimapZoomStorageKey = "babylon-lite-ascii-rpg.minimap-zoom";
export const lightingWindowPositionStorageKey = "babylon-lite-ascii-rpg.lighting-window-position";
export const tutorialSkipStorageKey = "babylon-lite-ascii-rpg.tutorial-skip";
export const defaultQuestStorageKey = "babylon-lite-ascii-rpg.default-quest";
export const minZoom = MIN_ZOOM;
export const maxZoom = MAX_ZOOM;
export const DEFAULT_BACKGROUND_DARKNESS = 50;

export function getStoredZoom() {
  return getStoredInitialZoom();
}

export function getStoredMinimapZoom() {
  return migrateMinimapScale(Number.parseInt(localStorage.getItem(minimapZoomStorageKey), 10));
}

export function getStoredBoolean(storageKey, defaultValue) {
  return getStoredBooleanValue(localStorage.getItem(storageKey), defaultValue);
}

export function getStoredBackgroundDarkness() {
  const storedValue = localStorage.getItem(backgroundDarknessStorageKey);
  if (storedValue === null || storedValue.trim() === "") return DEFAULT_BACKGROUND_DARKNESS;
  const stored = Number(storedValue);
  return Number.isInteger(stored) && stored >= 0 && stored <= 100 ? stored : DEFAULT_BACKGROUND_DARKNESS;
}

export function getStoredAmbientLight(storageKey, fallback) {
  const stored = Number.parseFloat(localStorage.getItem(storageKey));
  return Number.isFinite(stored) ? Math.min(1, Math.max(0, stored)) : fallback;
}

export function getStoredSourceIndex(storageKey, defaultIndex) {
  const storedIndex = Number.parseInt(localStorage.getItem(storageKey), 10);
  return Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < LIGHTING_SOURCE_STATES.length
    ? storedIndex
    : defaultIndex;
}

export function getStoredPlayerGpuShadowBleedRange() {
  const storedValue = localStorage.getItem(playerGpuShadowBleedRangeStorageKey);
  if (storedValue === null) return 2;
  const stored = Number(storedValue);
  return PLAYER_GPU_SHADOW_BLEED_RANGES.includes(stored) ? stored : 2;
}

export { getNextMinimapScale, ZOOM_SCALE_STORAGE_VERSION };
