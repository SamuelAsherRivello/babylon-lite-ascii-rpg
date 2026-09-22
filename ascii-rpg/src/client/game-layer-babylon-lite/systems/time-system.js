export const INITIAL_WORLD_TIME = 1;

export function formatWorldTime(time) {
  return String(time).padStart(5, "0");
}

export function createTimeSystem(initialTime = INITIAL_WORLD_TIME) {
  let time = initialTime;
  const listeners = new Set();
  const tickables = new Map();

  const dispatch = (cause) => {
    const event = Object.freeze({ time, cause });
    const tickableSnapshot = [...tickables.entries()];

    for (const [id, tick] of tickableSnapshot) {
      if (tickables.get(id) === tick) tick(event);
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

      for (let step = 0; step < amount; step += 1) {
        time += 1;
        dispatch(cause);
      }
      return time;
    },
    dispatchCurrent(cause = "session-start") {
      dispatch(cause);
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
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      tickables.clear();
      listeners.clear();
    },
  });
}
