export const TRANSITION_PHASES = Object.freeze({
  IDLE: "idle",
  CLOSING: "closing",
  COVERED: "covered",
  OPENING: "opening",
});

export const DEFAULT_TRANSITION_DURATION_MS = 2000;

const clampProgress = (value) => Math.min(1, Math.max(0, value));

const defaultInterpolate = (from, to, progress) => from + (to - from) * progress;

/**
 * Coordinates a two-phase transition without owning a particular renderer.
 * The caller supplies the animation value and receives lifecycle events while
 * the system remains deterministic under an injected frame scheduler.
 */
export function createTransitionSystem({
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (frame) => window.cancelAnimationFrame(frame),
  onUpdate = () => {},
} = {}) {
  let active = null;
  let nextId = 0;

  const emit = (eventName, payload) => {
    active?.callbacks?.[eventName]?.(payload);
  };

  const update = (phase, progress, timestamp) => {
    if (!active) return;
    const clamped = clampProgress(progress);
    const value = phase === TRANSITION_PHASES.OPENING
      ? active.interpolate(active.to, active.from, clamped)
      : active.interpolate(active.from, active.to, clamped);
    onUpdate({
      id: active.id,
      target: active.target,
      phase,
      progress: clamped,
      value,
      timestamp,
    });
  };

  const schedule = () => {
    if (active) active.frame = requestFrame(step);
  };

  function step(timestamp) {
    if (!active) return;
    const current = active;
    const elapsed = Math.max(0, timestamp - current.phaseStartedAt);
    const progress = clampProgress(elapsed / current.phaseDuration);

    if (current.phase === TRANSITION_PHASES.CLOSING) {
      update(TRANSITION_PHASES.CLOSING, progress, timestamp);
      if (progress < 1) {
        schedule();
        return;
      }

      current.phase = TRANSITION_PHASES.COVERED;
      update(TRANSITION_PHASES.COVERED, 1, timestamp);
      emit("covered", {
        id: current.id,
        target: current.target,
        phase: TRANSITION_PHASES.COVERED,
        timestamp,
      });
      if (current.durationCovered > 0) {
        current.phaseStartedAt = timestamp;
        current.phaseDuration = current.durationCovered;
        schedule();
        return;
      }
      current.phase = TRANSITION_PHASES.OPENING;
      current.phaseStartedAt = timestamp;
      current.phaseDuration = current.durationIn;
      update(TRANSITION_PHASES.OPENING, 0, timestamp);
      schedule();
      return;
    }

    if (current.phase === TRANSITION_PHASES.COVERED) {
      update(TRANSITION_PHASES.COVERED, progress, timestamp);
      if (progress < 1) {
        schedule();
        return;
      }
      current.phase = TRANSITION_PHASES.OPENING;
      current.phaseStartedAt = timestamp;
      current.phaseDuration = current.durationIn;
      update(TRANSITION_PHASES.OPENING, 0, timestamp);
      schedule();
      return;
    }

    update(TRANSITION_PHASES.OPENING, progress, timestamp);
    if (progress < 1) {
      schedule();
      return;
    }

    const completed = {
      id: current.id,
      target: current.target,
      phase: TRANSITION_PHASES.IDLE,
      timestamp,
    };
    active = null;
    onUpdate(completed);
    current.callbacks?.complete?.(completed);
  }

  const start = ({
    target = "game_layer",
    from,
    to,
    durationOut = DEFAULT_TRANSITION_DURATION_MS,
    durationCovered = 0,
    durationIn = DEFAULT_TRANSITION_DURATION_MS,
    interpolate = defaultInterpolate,
    onStart,
    onCovered,
    onComplete,
  } = {}) => {
    if (active) return false;
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      throw new TypeError("A transition requires finite from and to values.");
    }
    if (!Number.isFinite(durationCovered) || durationCovered < 0 || !(durationOut > 0) || !(durationIn > 0)) {
      throw new RangeError("Transition durations must be valid and greater than zero for closing/opening.");
    }

    const id = ++nextId;
    active = {
      id,
      target,
      from,
      to,
      interpolate,
      durationCovered,
      durationIn,
      phase: TRANSITION_PHASES.CLOSING,
      phaseDuration: durationOut,
      phaseStartedAt: undefined,
      frame: null,
      callbacks: { complete: onComplete, covered: onCovered },
    };
    const started = {
      id,
      target,
      phase: TRANSITION_PHASES.CLOSING,
    };
    onStart?.(started);
    emit("start", started);
    return true;
  };

  const begin = (timestamp) => {
    if (!active || active.phaseStartedAt !== undefined) return false;
    active.phaseStartedAt = timestamp;
    update(TRANSITION_PHASES.CLOSING, 0, timestamp);
    schedule();
    return true;
  };

  const dispose = () => {
    if (!active) return;
    if (active.frame !== null) cancelFrame(active.frame);
    active = null;
  };

  return Object.freeze({
    start,
    begin,
    dispose,
    isActive: () => active !== null,
    getPhase: () => active?.phase ?? TRANSITION_PHASES.IDLE,
  });
}
