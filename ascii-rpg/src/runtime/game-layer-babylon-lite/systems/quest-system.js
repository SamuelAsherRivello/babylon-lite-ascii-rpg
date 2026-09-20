export const QUEST_STATES = Object.freeze({
  unstarted: "unstarted",
  pending: "pending",
  complete: "complete",
});

function freezeSnapshot(snapshot) {
  return Object.freeze({ ...snapshot });
}

function getCriterionValue(criterion, values) {
  return Number(values?.[criterion.subject] ?? 0);
}

function getProgress(criterion, values, baseline) {
  const value = getCriterionValue(criterion, values);
  return criterion.mode === "relative" ? Math.max(0, value - baseline) : Math.max(0, value);
}

export function createQuestManager(definitions = [], initialValues = {}) {
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]));
  const listeners = new Set();
  let activeQuest = null;

  const snapshot = () => {
    if (!activeQuest) return null;
    return freezeSnapshot({
      id: activeQuest.definition.id,
      title: activeQuest.definition.title,
      objective: activeQuest.definition.objective,
      criterionMode: activeQuest.definition.criterion.mode,
      baseline: activeQuest.baseline,
      state: activeQuest.state,
      current: activeQuest.current,
      target: activeQuest.definition.criterion.target,
      complete: activeQuest.state === QUEST_STATES.complete,
    });
  };

  const emit = (type) => {
    const current = snapshot();
    for (const listener of listeners) listener(Object.freeze({ type, snapshot: current }));
  };

  const evaluate = (values, emitProgress = true) => {
    if (!activeQuest || activeQuest.state !== QUEST_STATES.pending) return;
    const next = Math.min(
      activeQuest.definition.criterion.target,
      getProgress(activeQuest.definition.criterion, values, activeQuest.baseline),
    );
    if (next === activeQuest.current) return;
    activeQuest.current = next;
    if (next >= activeQuest.definition.criterion.target) {
      activeQuest.state = QUEST_STATES.complete;
      emit("completed");
      return;
    }
    if (emitProgress) emit("progress");
  };

  return Object.freeze({
    startQuest(id, values = initialValues) {
      const definition = definitionsById.get(id);
      if (!definition) throw new Error(`Unknown quest definition: ${id}`);
      const criterion = definition.criterion;
      const baseline = criterion.mode === "relative" ? getCriterionValue(criterion, values) : 0;
      activeQuest = {
        definition,
        baseline,
        current: 0,
        state: QUEST_STATES.pending,
      };
      emit("started");
      evaluate(values, false);
      return snapshot();
    },
    observe(event, values = initialValues) {
      if (!activeQuest || activeQuest.state !== QUEST_STATES.pending) return snapshot();
      const criterion = activeQuest.definition.criterion;
      if (event?.type !== criterion.eventType || (criterion.pickupType && event.pickupType !== criterion.pickupType)) {
        return snapshot();
      }
      evaluate(values);
      return snapshot();
    },
    getSnapshot: snapshot,
    getActiveQuests() { return Object.freeze(activeQuest ? [snapshot()] : []); },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}
