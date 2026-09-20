let gameController = null;
let timeSnapshot = 1;
let cameraModeSnapshot = "center";
let realmAmbientSnapshot = { Overground: 0.9, Underground: 0.1 };
let realmPreferenceSnapshot = typeof localStorage !== "undefined" && localStorage.getItem("babylon-lite-ascii-rpg.active-realm") === "Underground"
  ? "Underground"
  : "Overground";
let torchLightingSnapshot = "Med";
let playerLightingSnapshot = "X High";
let torchShadowSnapshot = "X High";
let playerShadowSnapshot = "High";
let gpuLightPassSnapshot = false;
let playerGpuShadowBleedRangeSnapshot = 2;
let minimapSnapshot = true;
let minimapZoomSnapshot = 5;
let zoomSnapshot = null;
let lightingSnapshot = null;
const timeListeners = new Set();
const realmListeners = new Set();
const minimapZoomListeners = new Set();

export function setGameController(controller) {
  gameController = controller;
  gameController?.setCameraMode?.(cameraModeSnapshot);
  gameController?.setRealmAmbient?.(realmAmbientSnapshot);
  gameController?.setRealmPreference?.(realmPreferenceSnapshot);
  gameController?.setTorchLighting?.(torchLightingSnapshot);
  gameController?.setPlayerLighting?.(playerLightingSnapshot);
  gameController?.setTorchShadow?.(torchShadowSnapshot);
  gameController?.setPlayerShadow?.(playerShadowSnapshot);
  gameController?.setGpuLightPass?.(gpuLightPassSnapshot);
  gameController?.setPlayerGpuShadowBleedRange?.(playerGpuShadowBleedRangeSnapshot);
  gameController?.setMinimap?.(minimapSnapshot);
  gameController?.setMinimapZoom?.(minimapZoomSnapshot);
  if (zoomSnapshot !== null) gameController?.setZoom?.(zoomSnapshot);
  if (lightingSnapshot !== null) gameController?.setLighting?.(lightingSnapshot);
}

export function sendPaletteSnapshot(entries) {
  gameController?.setPalette(entries);
}

export function sendFontSnapshot(fontId) {
  gameController?.setFont(fontId);
}

export function sendZoomSnapshot(zoom) {
  zoomSnapshot = zoom;
  gameController?.setZoom(zoom);
}

export function sendMinimapZoomSnapshot(zoom) {
  minimapZoomSnapshot = zoom;
  gameController?.setMinimapZoom?.(zoom);
  for (const listener of minimapZoomListeners) listener(zoom);
}

export function subscribeToMinimapZoom(listener) {
  minimapZoomListeners.add(listener);
  return () => minimapZoomListeners.delete(listener);
}

export function sendLightingSnapshot(config) {
  lightingSnapshot = config;
  gameController?.setLighting(config);
}

export function sendRealmAmbientSnapshot(values) {
  realmAmbientSnapshot = { ...realmAmbientSnapshot, ...values };
  gameController?.setRealmAmbient?.(realmAmbientSnapshot);
}

export function sendRealmPreferenceSnapshot(realm) {
  realmPreferenceSnapshot = realm === "Underground" ? "Underground" : "Overground";
  gameController?.setRealmPreference?.(realmPreferenceSnapshot);
}

export function travelRealm() {
  gameController?.travelRealm?.();
}

export function getRealmSnapshot() { return realmPreferenceSnapshot; }
export function subscribeToRealm(listener) { realmListeners.add(listener); return () => realmListeners.delete(listener); }
export function sendRealmSnapshot(realm) {
  realmPreferenceSnapshot = realm === "Underground" ? "Underground" : "Overground";
  for (const listener of realmListeners) listener();
}

export function sendTorchLightingSnapshot(profile) {
  torchLightingSnapshot = profile;
  gameController?.setTorchLighting?.(profile);
}

export function sendPlayerLightingSnapshot(profile) {
  playerLightingSnapshot = profile;
  gameController?.setPlayerLighting?.(profile);
}

export function sendTorchShadowSnapshot(profile) {
  torchShadowSnapshot = profile;
  gameController?.setTorchShadow?.(profile);
}

export function sendPlayerShadowSnapshot(profile) {
  playerShadowSnapshot = profile;
  gameController?.setPlayerShadow?.(profile);
}

export function sendGpuLightPassSnapshot(enabled) {
  gpuLightPassSnapshot = enabled === true;
  gameController?.setGpuLightPass?.(gpuLightPassSnapshot);
}

export function sendPlayerGpuShadowBleedRangeSnapshot(range) {
  playerGpuShadowBleedRangeSnapshot = range;
  gameController?.setPlayerGpuShadowBleedRange?.(range);
}

export function sendMinimapSnapshot(enabled) {
  minimapSnapshot = enabled === true;
  gameController?.setMinimap?.(minimapSnapshot);
}

export function sendCameraModeSnapshot(mode) {
  cameraModeSnapshot = mode;
  gameController?.setCameraMode(mode);
}

export function getTimeSnapshot() {
  return timeSnapshot;
}

export function subscribeToTime(listener) {
  timeListeners.add(listener);
  return () => timeListeners.delete(listener);
}

export function sendTimeSnapshot(time) {
  timeSnapshot = time;
  for (const listener of timeListeners) listener();
}
