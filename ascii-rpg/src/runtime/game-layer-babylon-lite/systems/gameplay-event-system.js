function freezeEvent(event) {
  return Object.freeze({
    ...event,
    cell: event?.cell ? Object.freeze({ ...event.cell }) : undefined,
  });
}

export function createGameplayEventSystem() {
  const listeners = new Set();

  return Object.freeze({
    publish(event) {
      if (!event?.type) throw new TypeError("A gameplay event needs a type.");
      const frozen = freezeEvent(event);
      for (const listener of listeners) listener(frozen);
      return frozen;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}
