let gameController = null;
let timeSnapshot = 1;
let cameraModeSnapshot = "center";
let ambientLightSnapshot = 0.5;
let torchLightingSnapshot = "Med";
let playerLightingSnapshot = "X High";
let torchShadowSnapshot = "X High";
let playerShadowSnapshot = "High";
let gpuLightPassSnapshot = true;
let playerGpuShadowBleedRangeSnapshot = 2;
let minimapSnapshot = true;
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
  gameController?.setGpuLightPass?.(gpuLightPassSnapshot);
  gameController?.setPlayerGpuShadowBleedRange?.(playerGpuShadowBleedRangeSnapshot);
  gameController?.setMinimap?.(minimapSnapshot);
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
