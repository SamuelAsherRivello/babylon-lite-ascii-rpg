import { normalizeCameraMode } from "./camera.js";

let gameController = null;
let timeSnapshot = 1;
let cameraModeSnapshot = normalizeCameraMode(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("babylon-lite-ascii-rpg.camera-mode")
    : null,
);
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
let glyphBackgroundSnapshot = true;
let backgroundDarknessSnapshot = 50;
let minimapZoomSnapshot = 2;
let zoomSnapshot = null;
let randomSeedSnapshot = null;
let lightingSnapshot = null;
let questSnapshot = null;
let goldSnapshot = 0;
let keySnapshot = 0;
let healthSnapshot = 80;
let playerDeadSnapshot = false;
let logSnapshot = [];
const timeListeners = new Set();
const realmListeners = new Set();
const minimapZoomListeners = new Set();
const questListeners = new Set();
const goldListeners = new Set();
const keyListeners = new Set();
const healthListeners = new Set();
const playerDeadListeners = new Set();
const logListeners = new Set();
const playerMovedListeners = new Set();
const randomSeedListeners = new Set();

export const PLAYER_MOVED_EVENTS = Object.freeze({
  up: "player moved up",
  down: "player moved down",
  left: "player moved left",
  right: "player moved right",
});

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
  gameController?.setGlyphBackground?.(glyphBackgroundSnapshot);
  gameController?.setBackgroundDarkness?.(backgroundDarknessSnapshot);
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

export function getRandomSeedSnapshot() { return randomSeedSnapshot; }
export function subscribeToRandomSeed(listener) {
  randomSeedListeners.add(listener);
  return () => randomSeedListeners.delete(listener);
}
export function sendRandomSeedSnapshot(seed) {
  const nextSeed = seed == null ? null : String(seed);
  if (nextSeed === randomSeedSnapshot) return;
  randomSeedSnapshot = nextSeed;
  for (const listener of randomSeedListeners) listener();
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

export function sendGlyphBackgroundSnapshot(enabled) {
  glyphBackgroundSnapshot = enabled === true;
  gameController?.setGlyphBackground?.(glyphBackgroundSnapshot);
}

export function sendBackgroundDarknessSnapshot(darkness) {
  const value = Number(darkness);
  if (!Number.isInteger(value)) return;
  backgroundDarknessSnapshot = Math.min(100, Math.max(0, value));
  gameController?.setBackgroundDarkness?.(backgroundDarknessSnapshot);
}

export function getQuestSnapshot() { return questSnapshot; }
export function subscribeToQuest(listener) { questListeners.add(listener); return () => questListeners.delete(listener); }
export function startQuest(id) {
  return gameController?.startQuest?.(id) ?? null;
}
export function sendQuestSnapshot(snapshot) {
  questSnapshot = Object.isFrozen(snapshot) ? snapshot : Object.freeze({
    ...snapshot,
    steps: Object.freeze((snapshot.steps ?? []).map((step) => Object.freeze({ ...step }))),
  });
  for (const listener of questListeners) listener();
}

export function getGoldSnapshot() { return goldSnapshot; }
export function subscribeToGold(listener) { goldListeners.add(listener); return () => goldListeners.delete(listener); }
export function sendGoldSnapshot(gold) {
  goldSnapshot = Number(gold) || 0;
  for (const listener of goldListeners) listener();
}

export function getKeySnapshot() { return keySnapshot; }
export function subscribeToKey(listener) { keyListeners.add(listener); return () => keyListeners.delete(listener); }
export function sendKeySnapshot(keys) {
  keySnapshot = Math.max(0, Math.floor(Number(keys) || 0));
  for (const listener of keyListeners) listener();
}

export function getHealthSnapshot() { return healthSnapshot; }
export function subscribeToHealth(listener) { healthListeners.add(listener); return () => healthListeners.delete(listener); }
export function sendHealthSnapshot(health) {
  healthSnapshot = Math.max(0, Math.min(100, Number(health) || 0));
  for (const listener of healthListeners) listener();
}

export function getPlayerDeadSnapshot() { return playerDeadSnapshot; }
export function subscribeToPlayerDead(listener) { playerDeadListeners.add(listener); return () => playerDeadListeners.delete(listener); }
export function sendPlayerDeadSnapshot(dead) {
  playerDeadSnapshot = dead === true;
  for (const listener of playerDeadListeners) listener();
}

export function getLogSnapshot() { return logSnapshot; }
export function subscribeToLog(listener) { logListeners.add(listener); return () => logListeners.delete(listener); }
export function sendLogSnapshot(entries) {
  logSnapshot = Object.freeze(Array.isArray(entries) ? [...entries] : []);
  for (const listener of logListeners) listener();
}

export function subscribeToPlayerMoved(listener) {
  playerMovedListeners.add(listener);
  return () => playerMovedListeners.delete(listener);
}

export function sendPlayerMovedEvent(eventName) {
  if (!Object.values(PLAYER_MOVED_EVENTS).includes(eventName)) return;
  for (const listener of playerMovedListeners) listener(eventName);
}

export function sendCameraModeSnapshot(mode) {
  cameraModeSnapshot = mode;
  gameController?.setCameraMode(mode);
}

export function getCameraModeSnapshot() {
  return cameraModeSnapshot;
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
