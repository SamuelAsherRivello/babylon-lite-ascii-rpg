import { getFogVisibility } from "./systems/fog-of-war-system.js";
import { getVisibleSlot } from "./visible-region.js";

export const TRAP_FRAME_COUNT = 7;
export const TRAP_FRAME_DURATION_MS = 120;

export function collectVisibleTrapRecords({ objects = [], realm, region, fog, world } = {}) {
  if (!region || !world || !fog) return [];
  return objects.filter((object) => object?.active && object.type === "trap"
    && (object.realm === undefined || object.realm === realm))
    .filter((object) => getVisibleSlot(region, object.cell) !== -1 && getFogVisibility(fog, world, object.cell) > 0)
    .map((object) => Object.freeze({ id: object.id, cell: Object.freeze({ ...object.cell }) }));
}

export function getAnimatedTrapOverlayPlacement(center, viewport, canvasOffset = { x: 0, y: 0 }) {
  const width = viewport.gridWidth;
  const height = viewport.gridHeight;
  return Object.freeze({
    left: canvasOffset.x + center.x - width / 2,
    top: canvasOffset.y + center.y + viewport.gridHeight / 2 - height,
    width,
    height,
  });
}

export function createVisibleTrapAnimator({
  frameDurationMs = TRAP_FRAME_DURATION_MS,
  now = () => performance.now(),
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (handle) => window.cancelAnimationFrame(handle),
  render = () => {},
} = {}) {
  let entries = new Map();
  let frameHandle = null;
  let disposed = false;
  const startedAt = now();
  const snapshot = (at) => [...entries.values()].map((entry) => Object.freeze({
    ...entry,
    frame: Math.floor(Math.max(0, at - startedAt) / frameDurationMs) % TRAP_FRAME_COUNT,
  }));
  const draw = (at) => render(snapshot(at));
  const schedule = () => {
    if (disposed || entries.size === 0 || frameHandle !== null) return;
    frameHandle = requestFrame((at) => {
      frameHandle = null;
      draw(at);
      schedule();
    });
  };

  return Object.freeze({
    reconcile(records = [], at = now()) {
      entries = new Map(records.map((record) => [record.id, record]));
      draw(at);
      if (entries.size === 0 && frameHandle !== null) {
        cancelFrame(frameHandle);
        frameHandle = null;
      }
      schedule();
    },
    dispose() {
      disposed = true;
      if (frameHandle !== null) cancelFrame(frameHandle);
      frameHandle = null;
      entries.clear();
      render([]);
    },
    snapshot(at = now()) { return snapshot(at); },
    get activeCount() { return entries.size; },
    get scheduled() { return frameHandle !== null; },
  });
}
