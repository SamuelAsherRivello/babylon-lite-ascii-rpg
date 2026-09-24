import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  migrateLegacyZoom,
  normalizeZoom,
} from "../game-layer-babylon-lite/zoom-scale.js";
import { CAMERA_MODES, CAMERA_STORAGE_KEY } from "../bridge-layer/camera.js";

export const PC_SETTINGS_DEFAULTS = Object.freeze({
  cameraMode: "deadzone",
  zoom: 5,
});

export const MOBILE_SETTINGS_DEFAULTS = Object.freeze({
  ...PC_SETTINGS_DEFAULTS,
  cameraMode: "center",
});

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

export function getStoredInitialZoom({
  storage = typeof localStorage === "undefined" ? null : localStorage,
  matchMedia,
} = {}) {
  const defaults = getPlatformSettingsDefaults(matchMedia);
  return getMigratedStoredZoomValue(
    storage?.getItem("babylon-lite-ascii-rpg.zoom") ?? null,
    defaults.zoom,
    storage?.getItem("babylon-lite-ascii-rpg.zoom-version") ?? null,
  );
}

export function getStoredInitialCameraMode({
  storage = typeof localStorage === "undefined" ? null : localStorage,
  matchMedia,
} = {}) {
  const storedMode = storage?.getItem(CAMERA_STORAGE_KEY) ?? null;
  return CAMERA_MODES.includes(storedMode)
    ? storedMode
    : getPlatformSettingsDefaults(matchMedia).cameraMode;
}

export { MAX_ZOOM, MIN_ZOOM };

export function getStoredBooleanValue(storedValue, fallback) {
  return storedValue === null ? fallback : storedValue === "true";
}

export function getStoredAspectMode(storedValue) {
  return storedValue === "portrait" ? "portrait" : "landscape";
}
