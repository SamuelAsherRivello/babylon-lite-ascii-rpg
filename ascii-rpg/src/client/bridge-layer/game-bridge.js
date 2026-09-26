import { getStoredInitialCameraMode, getStoredInitialZoom } from "../ui-layer-react/platform-settings.js";

let gameController = null;
let timeSnapshot = 1;
let cameraModeSnapshot = getStoredInitialCameraMode();
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
let minimapZoomSnapshot = 1;
let mapviewOpenSnapshot = false;
let aspectSnapshot = typeof localStorage !== "undefined" && localStorage.getItem("babylon-lite-ascii-rpg.aspect") === "portrait"
  ? "portrait"
  : "landscape";
let realmDiscoverySnapshot = Object.freeze({ realm: realmPreferenceSnapshot, percent: 0 });
let zoomSnapshot = getStoredInitialZoom();
let randomSeedSnapshot = null;
let lightingSnapshot = null;
let questSnapshot = null;
let goldSnapshot = 0;
let keySnapshot = 0;
let characterStateSnapshot = Object.freeze({
  slots: Object.freeze([
    Object.freeze({ slot: "Slot 01", id: "sword", glyph: "🗡", name: "Sword", health: 1000, maxHealth: 1000 }),
    Object.freeze({ slot: "Slot 02", id: "shield", glyph: "🛡", name: "Shield", health: 1000, maxHealth: 1000 }),
    Object.freeze({ slot: "Slot 03", id: "pickaxe", glyph: "⛏", name: "Pickaxe", health: 1000, maxHealth: 1000 }),
    Object.freeze({ slot: "Slot 04", id: "bomb", glyph: "●", name: "Bomb", count: 50 }),
  ]),
  gold: 0,
  keys: 0,
});
let healthSnapshot = 100;
let staminaSnapshot = Object.freeze({
  current: 50,
  maximum: 50,
  currentPercent: 50,
  previousPercent: 50,
  revision: 0,
});
let experienceSnapshot = Object.freeze({
  currentPoints: 0,
  pointsNeededForNextLevel: 100,
  currentPercent: 0,
  previousPercent: 0,
  level: 1,
  revision: 0,
});
let combatStatsSnapshot = Object.freeze({
  offense: Object.freeze({ current: 25, maximum: 25, currentPercent: 25, previousPercent: 25, revision: 0 }),
  defense: Object.freeze({ current: 25, maximum: 25, currentPercent: 25, previousPercent: 25, revision: 0 }),
});
let playerDeadSnapshot = false;
let checkpointSnapshot = Object.freeze({ active: false, revision: 0 });
let logSnapshot = [];
let dialogSnapshot = null;
const inputActionListeners = new Set();
const timeListeners = new Set();
const realmListeners = new Set();
const realmDiscoveryListeners = new Set();
const minimapZoomListeners = new Set();
const questListeners = new Set();
const questEventListeners = new Set();
const goldListeners = new Set();
const keyListeners = new Set();
const characterStateListeners = new Set();
const healthListeners = new Set();
const staminaListeners = new Set();
const experienceListeners = new Set();
const combatStatsListeners = new Set();
const playerDeadListeners = new Set();
const checkpointListeners = new Set();
const logListeners = new Set();
const playerMovedListeners = new Set();
const randomSeedListeners = new Set();
const dialogListeners = new Set();

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
  gameController?.setMapviewOpen?.(mapviewOpenSnapshot);
  gameController?.setAspectMode?.(aspectSnapshot);
  gameController?.setZoom?.(zoomSnapshot);
  if (lightingSnapshot !== null) gameController?.setLighting?.(lightingSnapshot);
}

export function getDialogSnapshot() { return dialogSnapshot; }
export function subscribeToDialog(listener) {
  dialogListeners.add(listener);
  listener(dialogSnapshot);
  return () => dialogListeners.delete(listener);
}
export function sendDialogSnapshot(snapshot) {
  dialogSnapshot = snapshot ? Object.freeze({
    ...snapshot,
    anchor: snapshot.anchor ? Object.freeze({ ...snapshot.anchor }) : null,
    exclusions: Object.freeze((snapshot.exclusions ?? []).map((rect) => Object.freeze({ ...rect }))),
    choices: Object.freeze((snapshot.choices ?? []).map((choice) => Object.freeze({ ...choice }))),
  }) : null;
  for (const listener of dialogListeners) listener(dialogSnapshot);
}
export function sendDialogResult(value) {
  return gameController?.resolveDialog?.(value) ?? false;
}

export function startPerformanceSession(options) {
  return gameController?.startPerformanceSession?.(options) ?? null;
}

export function stopPerformanceSession(completion) {
  return gameController?.stopPerformanceSession?.(completion) ?? null;
}

export function getPerformanceReport() {
  return gameController?.getPerformanceReport?.() ?? null;
}

export function resetPerformanceSession() {
  gameController?.resetPerformanceSession?.();
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

export function getZoomSnapshot() { return zoomSnapshot; }

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

export function sendMapviewSnapshot(open) {
  mapviewOpenSnapshot = open === true;
  gameController?.setMapviewOpen?.(mapviewOpenSnapshot);
}

export function sendAspectSnapshot(aspect) {
  aspectSnapshot = aspect === "portrait" ? "portrait" : "landscape";
  gameController?.setAspectMode?.(aspectSnapshot);
}

export function sendMapviewRealmToggle() {
  gameController?.toggleMapviewRealm?.();
}

export function sendGenerationSettingsPreview(canvas, settings, realm, seedMode) {
  return gameController?.renderGenerationSettingsPreview?.(canvas, settings, realm, seedMode) ?? Promise.resolve();
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

export function getRealmDiscoverySnapshot() { return realmDiscoverySnapshot; }
export function subscribeToRealmDiscovery(listener) {
  realmDiscoveryListeners.add(listener);
  return () => realmDiscoveryListeners.delete(listener);
}
export function sendRealmDiscoverySnapshot(snapshot) {
  const percent = Math.min(100, Math.max(0, Math.round(Number(snapshot?.percent) || 0)));
  realmDiscoverySnapshot = Object.freeze({
    realm: snapshot?.realm === "Underground" ? "Underground" : "Overground",
    percent,
  });
  for (const listener of realmDiscoveryListeners) listener();
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
export function subscribeToQuestEvent(listener) { questEventListeners.add(listener); return () => questEventListeners.delete(listener); }
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

export function sendQuestEvent(event) {
  for (const listener of questEventListeners) listener(event);
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
export function subscribeToInputAction(listener) { inputActionListeners.add(listener); return () => inputActionListeners.delete(listener); }
export function sendInputAction(action) {
  if (!["up", "down", "left", "right"].includes(action)) return;
  for (const listener of inputActionListeners) listener(action);
}
export function getCharacterStateSnapshot() { return characterStateSnapshot; }
export function subscribeToCharacterState(listener) { characterStateListeners.add(listener); return () => characterStateListeners.delete(listener); }
export function sendCharacterStateSnapshot(state) {
  const slots = Object.freeze((state?.slots ?? []).slice(0, 4).map((item) => item ? Object.freeze({ ...item }) : null));
  characterStateSnapshot = Object.freeze({ slots, gold: Math.max(0, Number(state?.gold) || 0), keys: Math.max(0, Number(state?.keys) || 0) });
  for (const listener of characterStateListeners) listener();
}

export function getHealthSnapshot() { return healthSnapshot; }
export function subscribeToHealth(listener) { healthListeners.add(listener); return () => healthListeners.delete(listener); }
export function sendHealthSnapshot(health, maximum = 100) {
  const maxHealth = Math.max(1, Number(maximum) || 100);
  healthSnapshot = Math.max(0, Math.min(100, ((Number(health) || 0) / maxHealth) * 100));
  for (const listener of healthListeners) listener();
}

export function getStaminaSnapshot() { return staminaSnapshot; }
export function subscribeToStamina(listener) { staminaListeners.add(listener); return () => staminaListeners.delete(listener); }
export function sendStaminaSnapshot(snapshot) {
  const maximum = Math.max(0, Number(snapshot?.maximum) || 0);
  const current = Math.min(maximum, Math.max(0, Number(snapshot?.current) || 0));
  const currentPercent = Math.min(100, Math.max(0, Number(snapshot?.currentPercent) || 0));
  staminaSnapshot = Object.freeze({
    current,
    maximum,
    currentPercent,
    previousPercent: staminaSnapshot.currentPercent,
    revision: staminaSnapshot.revision + 1,
  });
  for (const listener of staminaListeners) listener();
}

export function getExperienceSnapshot() { return experienceSnapshot; }
export function subscribeToExperience(listener) { experienceListeners.add(listener); return () => experienceListeners.delete(listener); }
export function sendExperienceSnapshot(snapshot) {
  const pointsNeededForNextLevel = Math.max(1, Number(snapshot?.pointsNeededForNextLevel) || 100);
  const currentPoints = Math.min(pointsNeededForNextLevel, Math.max(0, Number(snapshot?.currentPoints) || 0));
  const currentPercent = Math.min(100, Math.max(0, (currentPoints * 100) / pointsNeededForNextLevel));
  experienceSnapshot = Object.freeze({
    currentPoints,
    pointsNeededForNextLevel,
    currentPercent,
    previousPercent: experienceSnapshot.currentPercent,
    level: Math.max(1, Math.floor(Number(snapshot?.level) || 1)),
    revision: experienceSnapshot.revision + 1,
  });
  for (const listener of experienceListeners) listener();
}

export function getCombatStatsSnapshot() { return combatStatsSnapshot; }
export function subscribeToCombatStats(listener) {
  combatStatsListeners.add(listener);
  return () => combatStatsListeners.delete(listener);
}
export function sendCombatStatsSnapshot(snapshot) {
  const normalize = (value, fallback) => {
    const maximum = Math.max(0, Number(value?.maximum) || fallback.maximum);
    const current = Math.min(maximum, Math.max(0, Number(value?.current) || 0));
    const currentPercent = Math.min(100, Math.max(0, current));
    return Object.freeze({
      current,
      maximum,
      currentPercent,
      previousPercent: fallback.currentPercent,
      revision: fallback.revision + 1,
    });
  };
  combatStatsSnapshot = Object.freeze({
    offense: normalize(snapshot?.offense, combatStatsSnapshot.offense),
    defense: normalize(snapshot?.defense, combatStatsSnapshot.defense),
  });
  for (const listener of combatStatsListeners) listener();
}

export function getPlayerDeadSnapshot() { return playerDeadSnapshot; }
export function subscribeToPlayerDead(listener) { playerDeadListeners.add(listener); return () => playerDeadListeners.delete(listener); }
export function sendPlayerDeadSnapshot(dead) {
  playerDeadSnapshot = dead === true;
  for (const listener of playerDeadListeners) listener();
}
export function getCheckpointSnapshot() { return checkpointSnapshot; }
export function subscribeToCheckpoint(listener) { checkpointListeners.add(listener); return () => checkpointListeners.delete(listener); }
export function sendCheckpointSnapshot(snapshot) {
  checkpointSnapshot = Object.freeze({ active: Boolean(snapshot?.realm && snapshot?.cell), revision: Number(snapshot?.revision) || 0 });
  for (const listener of checkpointListeners) listener();
}
export function restartFromCheckpoint() { return gameController?.restartFromCheckpoint?.() ?? false; }
export function restartGame() { return gameController?.restartGame?.() ?? false; }

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
