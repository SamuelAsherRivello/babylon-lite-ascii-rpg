import { TORCH_PROFILE } from "./animation-profiles.js";
import { createAnimatedTile, resolveAnimation } from "./tile-animation.js";
import { getFogVisibility } from "./systems/fog-of-war-system.js";
import { getVisibleSlot } from "./visible-region.js";

export const TORCH_FRAME_COUNT = TORCH_PROFILE.frames.length;
export const TORCH_FRAME_DURATION_MS = TORCH_PROFILE.durations[0];

export function collectVisibleTorchRecords({ objects = [], realm, region, fog, torches = [], world } = {}) {
  if (!region || !world || !fog) return [];
  const recordsByCell = new Map();
  for (const object of objects) {
    if (!object?.active || object.type !== "torch" || (object.realm !== undefined && object.realm !== realm)) continue;
    recordsByCell.set(`${object.cell.x},${object.cell.y}`, { id: object.id, cell: object.cell });
  }
  for (const cell of torches) {
    const key = `${cell.x},${cell.y}`;
    if (!recordsByCell.has(key)) recordsByCell.set(key, { id: `${realm}-torch-${key}`, cell });
  }
  return [...recordsByCell.values()]
    .filter((record) => getVisibleSlot(region, record.cell) !== -1 && getFogVisibility(fog, world, record.cell) > 0)
    .map((record) => Object.freeze({ id: record.id, cell: Object.freeze({ ...record.cell }) }));
}

export function createVisibleTorchAnimator({
  frameDurationMs = TORCH_FRAME_DURATION_MS,
  now = () => performance.now(),
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (handle) => window.cancelAnimationFrame(handle),
  render = () => {},
} = {}) {
  const animation = frameDurationMs === TORCH_FRAME_DURATION_MS ? TORCH_PROFILE
    : createAnimatedTile({ ...TORCH_PROFILE, durations: TORCH_PROFILE.frames.map(() => frameDurationMs) });
  let entries = new Map();
  let startedAt = now();
  let frameHandle = null;
  let disposed = false;

  const snapshot = (at) => {
    const { frameIndex } = resolveAnimation(animation, { realTimeMs: at }, startedAt);
    return [...entries.values()].map((entry) => Object.freeze({ ...entry, frame: frameIndex }));
  };
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
