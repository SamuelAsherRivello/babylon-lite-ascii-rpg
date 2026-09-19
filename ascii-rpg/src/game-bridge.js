let gameController = null;
let timeSnapshot = 1;
const timeListeners = new Set();

export function setGameController(controller) {
  gameController = controller;
}

export function sendPaletteSnapshot(entries) {
  gameController?.setPalette(entries);
}

export function sendFontSnapshot(fontId) {
  gameController?.setFont(fontId);
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
