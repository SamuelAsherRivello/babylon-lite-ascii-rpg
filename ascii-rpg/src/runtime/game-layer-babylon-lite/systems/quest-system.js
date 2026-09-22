export const QUEST_STATES = Object.freeze({
  unstarted: "unstarted",
  pending: "pending",
  complete: "complete",
});

function freezeSnapshot(snapshot) {
  return Object.freeze({
    ...snapshot,
    steps: Object.freeze(snapshot.steps.map((step) => Object.freeze({ ...step }))),
  });
}

function getCriterionValue(criterion, values) {
  if (criterion.subject === "realmDiscoveryPercent" && criterion.realm) {
    return Number(values?.realmDiscoveryPercent?.[criterion.realm] ?? 0);
  }
  return Number(values?.[criterion.subject] ?? 0);
}

function getProgress(criterion, values, baseline) {
  const value = getCriterionValue(criterion, values);
  return criterion.mode === "relative" ? Math.max(0, value - baseline) : Math.max(0, value);
}

function getDefinitions(definition) {
  if (Array.isArray(definition.steps)) return definition.steps;
  return [{
    id: definition.id,
    label: definition.objective,
    criterion: definition.criterion,
    pickup: definition.pickup,
  }];
}

function isAnyOrderQuest(quest) {
  return quest?.definition?.completionOrder === "any";
}

function matchesCriterion(criterion, event) {
  if (event?.type !== criterion.eventType) return false;
  if (criterion.pickupType && event.pickupType !== criterion.pickupType) return false;
  if (criterion.realm && event.realm && event.realm !== criterion.realm) return false;
  return true;
}

export function createQuestManager(definitions = [], initialValues = {}, { requestPickup = () => {} } = {}) {
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]));
  const listeners = new Set();
  const completedQuestIds = new Set();
  let activeQuest = null;

  const snapshot = () => {
    if (!activeQuest) return null;
    const currentStep = activeQuest.steps[activeQuest.activeStepIndex]
      ?? activeQuest.steps.find((step) => step.state !== QUEST_STATES.complete)
      ?? activeQuest.steps.at(-1);
    const criterion = currentStep?.definition.criterion ?? {};
    const steps = activeQuest.steps.map((step) => ({
      id: step.definition.id,
      label: step.definition.label,
      state: step.state,
      active: step.index === activeQuest.activeStepIndex,
      navigation: step.definition.navigation ?? null,
      current: step.current,
      target: step.definition.criterion.target ?? 1,
      complete: step.state === QUEST_STATES.complete,
      ...(step.definition.showProgress ? { showProgress: true } : {}),
      ...(step.definition.hideProgress ? { hideProgress: true } : {}),
    }));
    return freezeSnapshot({
      id: activeQuest.definition.id,
      title: activeQuest.definition.title,
      objective: currentStep?.definition.label ?? activeQuest.definition.objective,
      criterionMode: criterion.mode,
      baseline: currentStep?.baseline ?? 0,
      state: activeQuest.state,
      current: currentStep?.current ?? 0,
      target: criterion.target ?? 1,
      activeStepId: currentStep?.definition.id ?? null,
      steps,
      complete: activeQuest.state === QUEST_STATES.complete,
    });
  };

  const emit = (type) => {
    const current = snapshot();
    for (const listener of listeners) listener(Object.freeze({ type, snapshot: current }));
  };

  const refreshActiveStepIndex = () => {
    if (!isAnyOrderQuest(activeQuest)) return;
    const nextStep = activeQuest.steps.find((step) => step.state !== QUEST_STATES.complete);
    activeQuest.activeStepIndex = nextStep?.index ?? activeQuest.steps.length - 1;
  };

  const completeQuestIfReady = () => {
    if (!activeQuest || activeQuest.state !== QUEST_STATES.pending) return false;
    if (!activeQuest.steps.every((step) => step.state === QUEST_STATES.complete)) return false;
    activeQuest.state = QUEST_STATES.complete;
    completedQuestIds.add(activeQuest.definition.id);
    refreshActiveStepIndex();
    emit("completed");
    return true;
  };

  const activateStep = (step, values) => {
    step.state = QUEST_STATES.pending;
    step.baseline = step.definition.criterion.mode === "relative"
      ? getCriterionValue(step.definition.criterion, values)
      : 0;
    if (step.definition.pickup) {
      requestPickup(Object.freeze({
        ...step.definition.pickup,
        questId: activeQuest.definition.id,
        stepId: step.definition.id,
      }));
    }
  };

  const evaluate = (step, values, emitProgress = true) => {
    if (!activeQuest || activeQuest.state !== QUEST_STATES.pending || !step || step.state === QUEST_STATES.complete) return;
    const criterion = step.definition.criterion;
    const target = criterion.target ?? 1;
    const next = criterion.mode === "event"
      ? target
      : Math.min(target, getProgress(criterion, values, step.baseline));
    if (next === step.current) return;
    step.current = next;
    if (next < target) {
      if (emitProgress) emit("progress");
      return;
    }
    step.state = QUEST_STATES.complete;
    emit("step-completed");
    if (isAnyOrderQuest(activeQuest)) {
      refreshActiveStepIndex();
      completeQuestIfReady();
      return;
    }
    const nextIndex = step.index + 1;
    if (nextIndex >= activeQuest.steps.length) {
      completeQuestIfReady();
      return;
    }
    activeQuest.activeStepIndex = nextIndex;
    const nextStep = activeQuest.steps[nextIndex];
    activateStep(nextStep, values);
    emit("step-started");
    if (nextStep.definition.criterion.mode !== "event") evaluate(nextStep, values, false);
  };

  return Object.freeze({
    startQuest(id, values = initialValues) {
      const definition = definitionsById.get(id);
      if (!definition) throw new Error(`Unknown quest definition: ${id}`);
      activeQuest = {
        definition,
        steps: getDefinitions(definition).map((stepDefinition, index) => ({
          definition: stepDefinition,
          index,
          baseline: 0,
          current: 0,
          state: index === 0 || definition.completionOrder === "any"
            ? QUEST_STATES.pending
            : QUEST_STATES.unstarted,
        })),
        activeStepIndex: 0,
        state: QUEST_STATES.pending,
      };
      emit("started");
      const firstStep = activeQuest.steps[0];
      if (isAnyOrderQuest(activeQuest)) {
        for (const step of activeQuest.steps) {
          activateStep(step, values);
          if (step.definition.criterion.mode !== "event") evaluate(step, values, false);
        }
      } else {
        activateStep(firstStep, values);
        if (firstStep.definition.criterion.mode !== "event") evaluate(firstStep, values, false);
      }
      return snapshot();
    },
    startNextQuest(values = initialValues) {
      const currentId = activeQuest?.definition.id;
      const currentIndex = definitions.findIndex((definition) => definition.id === currentId);
      const nextDefinition = definitions
        .slice(Math.max(0, currentIndex + 1))
        .find((definition) => !completedQuestIds.has(definition.id));
      if (!nextDefinition) return snapshot();
      return this.startQuest(nextDefinition.id, values);
    },
    observe(event, values = initialValues) {
      if (!activeQuest || activeQuest.state !== QUEST_STATES.pending) return snapshot();
      if (isAnyOrderQuest(activeQuest)) {
        for (const step of activeQuest.steps) {
          if (step.state === QUEST_STATES.complete) continue;
          if (matchesCriterion(step.definition.criterion, event)) evaluate(step, values);
          if (activeQuest.state === QUEST_STATES.complete) break;
        }
        return snapshot();
      }
      const step = activeQuest.steps[activeQuest.activeStepIndex];
      if (!matchesCriterion(step.definition.criterion, event)) return snapshot();
      evaluate(step, values);
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
