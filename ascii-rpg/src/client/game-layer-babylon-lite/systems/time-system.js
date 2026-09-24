export const INITIAL_WORLD_TIME = 1;

export function formatWorldTime(time) {
  return String(time).padStart(5, "0");
}

export function createTimeSystem(initialTime = INITIAL_WORLD_TIME, { scheduler = null, now = () => globalThis.performance?.now?.() ?? Date.now() } = {}) {
  if (typeof now !== "function") throw new TypeError("Time system clock must be a function.");
  let time = initialTime;
  let lastTriggerAt = now();
  let tickSequence = 0;
  let lifecycleGeneration = 0;
  const pendingSince = new Map();
  const diagnostics = { completed: 0, cancelled: 0, stale: 0, failed: 0 };
  const listeners = new Set();
  const tickables = new Map();

  const dispatch = (cause, deltaTimeInMilliseconds = 0) => {
    const tickTime = time;
    const event = Object.freeze({ time: tickTime, cause });
    const tickableSnapshot = [...tickables.entries()];

    const deliver = (index) => {
      if (index >= tickableSnapshot.length) return;
      const [id, tick] = tickableSnapshot[index];
      if (tickables.get(id) === tick) tick(tickTime, deltaTimeInMilliseconds);
    };
    if (scheduler && typeof scheduler.enqueue === "function") {
      const generation = lifecycleGeneration;
      const pending = { startedAt: now(), remaining: tickableSnapshot.length };
      if (pending.remaining) pendingSince.set(pending, pending.startedAt);
      tickableSnapshot.forEach(([id, tick], index) => {
        scheduler.enqueue({
          id: `time-tick:${++tickSequence}:${id}`,
          priority: 20,
          metadata: Object.freeze({ type: "time-tick", time: tickTime, cause, id, generation }),
          run: () => {
            try {
              if (generation !== lifecycleGeneration) { diagnostics.stale += 1; return "cancelled"; }
              if (tickables.get(id) !== tick) { diagnostics.cancelled += 1; return "cancelled"; }
              deliver(index);
              diagnostics.completed += 1;
              return "done";
            } catch (error) {
              diagnostics.failed += 1;
              throw error;
            } finally {
              pending.remaining -= 1;
              if (pending.remaining === 0) pendingSince.delete(pending);
            }
          },
        });
      });
    } else {
      for (let index = 0; index < tickableSnapshot.length; index += 1) deliver(index);
    }
    for (const listener of [...listeners]) listener(time, event);

    return event;
  };

  return Object.freeze({
    getTime() {
      return time;
    },
    advance(amount = 1, cause = "movement") {
      if (!Number.isInteger(amount) || amount < 1) {
        throw new RangeError("Time advance amount must be a positive integer.");
      }

      const triggerAt = now();
      const elapsed = Math.max(0, triggerAt - lastTriggerAt);
      lastTriggerAt = triggerAt;
      for (let step = 0; step < amount; step += 1) {
        time += 1;
        dispatch(cause, step === 0 ? elapsed : 0);
      }
      return time;
    },
    dispatchCurrent(cause = "session-start") {
      dispatch(cause, 0);
      return time;
    },
    registerTickable(id, tick) {
      if (typeof id !== "string" || id.length === 0 || typeof tick !== "function" || tickables.has(id)) {
        return false;
      }
      tickables.set(id, tick);
      return true;
    },
    unregisterTickable(id) {
      return tickables.delete(id);
    },
    invalidatePending() {
      lifecycleGeneration += 1;
      if (scheduler?.cancelWhere) scheduler.cancelWhere((metadata) => metadata?.type === "time-tick");
      pendingSince.clear();
      return lifecycleGeneration;
    },
    getDiagnostics() {
      const schedulerSnapshot = scheduler?.snapshot?.() ?? {};
      const oldestPendingAt = pendingSince.size ? Math.min(...pendingSince.values()) : null;
      return Object.freeze({
        ...diagnostics,
        generation: lifecycleGeneration,
        pending: schedulerSnapshot.pending ?? 0,
        logicalTickAgeMs: oldestPendingAt === null ? 0 : Math.max(0, now() - oldestPendingAt),
        longestSliceMs: schedulerSnapshot.longestSliceMs ?? 0,
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      lifecycleGeneration += 1;
      if (scheduler?.cancelWhere) scheduler.cancelWhere((metadata) => metadata?.type === "time-tick");
      tickables.clear();
      pendingSince.clear();
      listeners.clear();
    },
  });
}
