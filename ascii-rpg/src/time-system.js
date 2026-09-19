export const INITIAL_WORLD_TIME = 1;

export function formatWorldTime(time) {
  return String(time).padStart(5, "0");
}

export function createTimeSystem(initialTime = INITIAL_WORLD_TIME) {
  let time = initialTime;
  const listeners = new Set();

  const notify = () => {
    for (const listener of listeners) listener(time);
  };

  return Object.freeze({
    getTime() {
      return time;
    },
    advance() {
      time += 1;
      notify();
      return time;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      listeners.clear();
    },
  });
}
