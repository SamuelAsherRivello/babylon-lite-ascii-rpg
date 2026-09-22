import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  migrateLegacyZoom,
  normalizeZoom,
} from "../game-layer-babylon-lite/zoom-scale.js";

export const PC_SETTINGS_DEFAULTS = Object.freeze({
  zoom: 5,
  showHud: false,
});

export const MOBILE_SETTINGS_DEFAULTS = Object.freeze({
  ...PC_SETTINGS_DEFAULTS,
  showHud: false,
});

export const SHOW_UI_STORAGE_KEY = "babylon-lite-ascii-rpg.show-ui";

export function isMobilePlatform(matchMedia = globalThis.window?.matchMedia) {
  return typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
}

export function getPlatformSettingsDefaults(matchMedia) {
  return isMobilePlatform(matchMedia) ? MOBILE_SETTINGS_DEFAULTS : PC_SETTINGS_DEFAULTS;
}

export function getStoredZoomValue(storedValue, fallback, minZoom, maxZoom) {
  const storedZoom = Number.parseInt(storedValue, 10);
  return Number.isInteger(storedZoom) ? Math.min(maxZoom, Math.max(minZoom, storedZoom)) : fallback;
}

export function getMigratedStoredZoomValue(storedValue, fallback = DEFAULT_ZOOM, storageVersion = null) {
  if (storedValue === null || storedValue === undefined) return fallback;
  if (storageVersion === "2") return normalizeZoom(storedValue, fallback);
  return migrateLegacyZoom(storedValue);
}

export { MAX_ZOOM, MIN_ZOOM };

export function getStoredBooleanValue(storedValue, fallback) {
  return storedValue === null ? fallback : storedValue === "true";
}

export function getStoredShowHud(storage = globalThis.localStorage, matchMedia) {
  const defaults = getPlatformSettingsDefaults(matchMedia);
  try {
    return getStoredBooleanValue(storage?.getItem(SHOW_UI_STORAGE_KEY) ?? null, defaults.showHud);
  } catch {
    return defaults.showHud;
  }
}

export function initializeHudHiddenDataset(documentRef = globalThis.document, storage, matchMedia) {
  if (!documentRef?.documentElement) return;
  documentRef.documentElement.dataset.hudHidden = String(!getStoredShowHud(storage, matchMedia));
}

export function getStoredAspectMode(storedValue) {
  return storedValue === "portrait" ? "portrait" : "landscape";
}
