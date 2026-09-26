export const DEATH_RECOVERY_DELAY_MS = 500;

export function createDeathPresentation({
  schedule = (callback, delay) => window.setTimeout(callback, delay),
  cancel = (handle) => window.clearTimeout(handle),
} = {}) {
  let phase = "alive";
  let recoveryTimer = null;
  const listeners = new Set();

  const notify = () => {
    for (const listener of listeners) listener(phase);
  };

  const cancelRecoveryTimer = () => {
    if (recoveryTimer === null) return;
    cancel(recoveryTimer);
    recoveryTimer = null;
  };

  const reset = () => {
    const changed = phase !== "alive" || recoveryTimer !== null;
    cancelRecoveryTimer();
    phase = "alive";
    if (changed) notify();
    return changed;
  };

  return Object.freeze({
    getPhase() { return phase; },
    isRecoveryReady() { return phase === "recovery-ready"; },
    begin() {
      if (phase !== "alive") return false;
      phase = "dying";
      notify();
      return true;
    },
    completeAnimation() {
      if (phase !== "dying" || recoveryTimer !== null) return false;
      recoveryTimer = schedule(() => {
        recoveryTimer = null;
        if (phase !== "dying") return;
        phase = "recovery-ready";
        notify();
      }, DEATH_RECOVERY_DELAY_MS);
      return true;
    },
    reset,
    dispose() {
      reset();
      listeners.clear();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}
