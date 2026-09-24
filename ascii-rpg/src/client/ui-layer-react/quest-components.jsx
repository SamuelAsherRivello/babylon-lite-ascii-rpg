import { HudBlockLayout } from "./HudLayouts.jsx";

export function QuestTracker({ quest }) {
  if (!quest) return null;
  return <QuestLayout quest={quest} className="quest_tracker" ariaLabel="Current quest" />;
}

export function QuestLayout({ quest, className = "", ariaLabel, onClick, onKeyDown }) {
  const steps = quest.steps ?? [{
    id: quest.id,
    label: quest.objective,
    state: quest.state,
    current: quest.current,
    target: quest.target,
    complete: quest.complete,
  }];
  return (
    <HudBlockLayout
      as="div"
      className={className}
      aria-label={ariaLabel}
      titleClassName={`quest_tracker_title${quest.complete ? " quest_tracker_title_complete" : ""}`}
      bodyClassName="quest_tracker_body"
      title={`Quest: ${quest.title}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {steps.map((step) => {
        const isActiveStep = step.active ?? (step.id === quest.activeStepId || steps.length === 1);
        return (
          <div key={step.id} className={`quest_tracker_step${step.complete ? " quest_tracker_step_complete" : ""}`}>
            <span className={`quest_tracker_marker${quest.state === "pending" && !quest.complete && isActiveStep ? "" : " quest_tracker_marker_empty"}`} aria-hidden="true" />
            <span className="quest_tracker_step_label">{step.label}{!step.hideProgress && step.target > 1 ? ` ${step.current} of ${step.target}` : ""}</span>
          </div>
        );
      })}
    </HudBlockLayout>
  );
}

export function getQuestPreview(definition, activeQuest) {
  if (definition.id === activeQuest?.id) return activeQuest;
  return {
    ...definition,
    state: "unstarted",
    complete: false,
    steps: (definition.steps ?? [{ id: definition.id, label: definition.objective, criterion: definition.criterion }]).map((step) => ({
      id: step.id,
      label: step.label,
      current: 0,
      target: step.criterion?.target ?? 1,
      complete: false,
    })),
  };
}
