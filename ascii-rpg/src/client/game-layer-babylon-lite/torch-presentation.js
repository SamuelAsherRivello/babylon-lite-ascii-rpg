import { getFogVisibility } from "./systems/fog-of-war-system.js";
import { getVisibleSlot } from "./visible-region.js";

export const TORCH_FRAME_COUNT = 3;
export const TORCH_FRAME_DURATION_MS = 160;

export function collectVisibleTorchRecords({ objects = [], realm, region, fog, world } = {}) {
  if (!region || !world || !fog) return [];
  return objects.filter((object) => object?.active && object.type === "torch" && object.realm === realm)
    .filter((object) => getVisibleSlot(region, object.cell) !== -1 && getFogVisibility(fog, world, object.cell) > 0)
    .map((object) => Object.freeze({ id: object.id, cell: Object.freeze({ ...object.cell }) }));
}

export function createVisibleTorchAnimator({
  frameDurationMs = TORCH_FRAME_DURATION_MS,
  now = () => performance.now(),
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (handle) => window.cancelAnimationFrame(handle),
  render = () => {},
} = {}) {
  let entries = new Map();
  let paused = false;
  let pausedAt = 0;
  let pausedDuration = 0;
  let startedAt = now();
  let frameHandle = null;
  let disposed = false;

  const elapsedAt = (at) => Math.max(0, (paused ? pausedAt : at) - startedAt - pausedDuration);
  const snapshot = (at) => [...entries.values()].map((entry) => Object.freeze({
    ...entry,
    frame: Math.floor(elapsedAt(at) / frameDurationMs) % TORCH_FRAME_COUNT,
  }));
  const draw = (at) => render(snapshot(at));
  const schedule = () => {
    if (disposed || paused || entries.size === 0 || frameHandle !== null) return;
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
    pause(at = now()) {
      if (disposed || paused) return;
      paused = true;
      pausedAt = at;
      if (frameHandle !== null) cancelFrame(frameHandle);
      frameHandle = null;
    },
    resume(at = now()) {
      if (disposed || !paused) return;
      pausedDuration += Math.max(0, at - pausedAt);
      paused = false;
      draw(at);
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
    get paused() { return paused; },
    get activeCount() { return entries.size; },
    get scheduled() { return frameHandle !== null; },
  });
}
