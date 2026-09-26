import { getFogVisibility } from "./systems/fog-of-war-system.js";
import { getVisibleSlot } from "./visible-region.js";

export const SPIDER_ANIMATION_FRAMES = Object.freeze({
  idle: Object.freeze([0, 1, 2, 3, 4]),
  move: Object.freeze([0, 1, 2, 3]),
  attack: Object.freeze([0, 1, 2]),
  death: Object.freeze([0, 1, 2, 3, 4, 5, 6]),
});

export const SPIDER_ANIMATION_DURATIONS = Object.freeze({ idle: 180, move: 100, attack: 120, death: 150 });

const TRANSIENT_STATES = new Set(["move", "attack"]);

function freezeCell(cell) {
  return Object.freeze({ x: cell.x, y: cell.y });
}

function visible(record, { realm, region, fog, world }) {
  return record.realm === realm
    && getVisibleSlot(region, record.cell) !== -1
    && getFogVisibility(fog, world, record.cell) > 0;
}

export function getSpiderFramePath(assetBase, state, frame) {
  const directory = state === "move" ? "Move" : state[0].toUpperCase() + state.slice(1);
  return `${assetBase}/${directory}/${String(frame).padStart(2, "0")}.png`;
}

export function createEnemySpritePresentation({
  now = () => performance.now(),
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (handle) => window.cancelAnimationFrame(handle),
  render = () => {},
} = {}) {
  const living = new Map();
  const corpses = new Map();
  let visibleEntries = [];
  let frameHandle = null;
  let disposed = false;

  const normalize = (entry, at) => {
    const frames = SPIDER_ANIMATION_FRAMES[entry.state] ?? SPIDER_ANIMATION_FRAMES.idle;
    const duration = SPIDER_ANIMATION_DURATIONS[entry.state] ?? SPIDER_ANIMATION_DURATIONS.idle;
    const elapsed = Math.max(0, at - entry.startedAt);
    if (TRANSIENT_STATES.has(entry.state) && elapsed >= frames.length * duration) {
      entry.state = "idle";
      entry.startedAt = at;
      return normalize(entry, at);
    }
    const frame = entry.state === "death"
      ? Math.min(frames.length - 1, Math.floor(elapsed / duration))
      : Math.floor(elapsed / duration) % frames.length;
    return Object.freeze({ ...entry, cell: freezeCell(entry.cell), frame });
  };

  const snapshot = (at) => visibleEntries.map((entry) => normalize(entry, at));
  const draw = (at) => render(snapshot(at));
  const schedule = () => {
    if (disposed || visibleEntries.length === 0 || frameHandle !== null) return;
    frameHandle = requestFrame((at) => {
      frameHandle = null;
      draw(at);
      schedule();
    });
  };
  const replaceLiveRealm = (enemies, realm, at) => {
    const nextIds = new Set(enemies.map((enemy) => enemy.id));
    for (const [id, entry] of living) {
      if (entry.realm === realm && !nextIds.has(id)) living.delete(id);
    }
    for (const enemy of enemies) {
      const prior = living.get(enemy.id);
      living.set(enemy.id, {
        id: enemy.id,
        realm: enemy.realm,
        cell: freezeCell(enemy.cell),
        facing: enemy.facing,
        state: prior?.state ?? "idle",
        startedAt: prior?.startedAt ?? at,
      });
    }
  };

  return Object.freeze({
    reconcile({ enemies = [], realm, region, fog, world } = {}, at = now()) {
      if (!region || !fog || !world) {
        visibleEntries = [];
      } else {
        replaceLiveRealm(enemies.filter((enemy) => enemy?.type === "enemy" && enemy.realm === realm), realm, at);
        visibleEntries = [
          ...[...living.values()].filter((entry) => visible(entry, { realm, region, fog, world })),
          ...[...corpses.values()].filter((entry) => visible(entry, { realm, region, fog, world })),
        ];
      }
      draw(at);
      if (visibleEntries.length === 0 && frameHandle !== null) {
        cancelFrame(frameHandle);
        frameHandle = null;
      }
      schedule();
    },
    present(type, enemy, at = now()) {
      if (!enemy?.id || !enemy.cell) return;
      if (type === "death") {
        living.delete(enemy.id);
        corpses.set(enemy.id, {
          id: `corpse:${enemy.id}`,
          realm: enemy.realm,
          cell: freezeCell(enemy.cell),
          facing: enemy.facing,
          state: "death",
          startedAt: at,
        });
        return;
      }
      living.set(enemy.id, {
        id: enemy.id,
        realm: enemy.realm,
        cell: freezeCell(enemy.cell),
        facing: enemy.facing,
        state: type === "move" || type === "attack" ? type : "idle",
        startedAt: at,
      });
    },
    clearRealm(realm) {
      for (const [id, entry] of living) if (entry.realm === realm) living.delete(id);
      for (const [id, entry] of corpses) if (entry.realm === realm) corpses.delete(id);
    },
    dispose() {
      disposed = true;
      if (frameHandle !== null) cancelFrame(frameHandle);
      frameHandle = null;
      living.clear();
      corpses.clear();
      visibleEntries = [];
      render([]);
    },
    snapshot(at = now()) { return snapshot(at); },
    get corpseCount() { return corpses.size; },
  });
}
