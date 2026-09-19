let gameController = null;
let timeSnapshot = 1;
let cameraModeSnapshot = "center";
let ambientLightSnapshot = 0.5;
let torchLightingSnapshot = "Med";
let playerLightingSnapshot = "Med";
let torchShadowSnapshot = "X High";
let playerShadowSnapshot = "X High";
let zoomSnapshot = null;
let lightingSnapshot = null;
const timeListeners = new Set();

export function setGameController(controller) {
  gameController = controller;
  gameController?.setCameraMode?.(cameraModeSnapshot);
  gameController?.setAmbientLight?.(ambientLightSnapshot);
  gameController?.setTorchLighting?.(torchLightingSnapshot);
  gameController?.setPlayerLighting?.(playerLightingSnapshot);
  gameController?.setTorchShadow?.(torchShadowSnapshot);
  gameController?.setPlayerShadow?.(playerShadowSnapshot);
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

export function sendLightingSnapshot(config) {
  lightingSnapshot = config;
  gameController?.setLighting(config);
}

export function sendAmbientLightSnapshot(value) {
  ambientLightSnapshot = value;
  gameController?.setAmbientLight?.(value);
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
