function normalizeLine(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

export function createLogSystem({
  shouldDisplay = () => true,
  formatMessage = (event) => event.message,
} = {}) {
  const entries = [];
  const listeners = new Set();
  let active = true;
  let snapshot = Object.freeze([]);

  const publish = () => {
    snapshot = Object.freeze([...entries]);
    for (const listener of listeners) listener(snapshot);
  };

  return Object.freeze({
    log(event) {
      if (!active || !event || typeof event !== "object" || !shouldDisplay(event)) return null;
      const line = normalizeLine(formatMessage(event));
      if (!line) return null;
      entries.push(line);
      publish();
      return line;
    },
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (!active) return;
      active = false;
      listeners.clear();
      entries.length = 0;
      snapshot = Object.freeze([]);
    },
  });
}
