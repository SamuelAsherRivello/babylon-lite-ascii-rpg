import { useEffect, useState } from "react";
import { sendDialogResult, subscribeToInputAction } from "../bridge-layer/game-bridge.js";

export function DialogWindow({ dialog }) {
  const [selected, setSelected] = useState(0);
  const choices = dialog?.choices ?? [];

  useEffect(() => setSelected(0), [dialog?.id]);

  useEffect(() => {
    if (!dialog) return undefined;
    const handleAction = (action) => {
      if (action === "up" || action === "down") {
        if (choices.length > 1) {
          setSelected((current) => action === "up"
            ? (current + choices.length - 1) % choices.length
            : (current + 1) % choices.length);
        }
        return;
      }
      if (action === "right" && choices[selected]) {
        sendDialogResult(choices[selected].value);
      }
    };
    return subscribeToInputAction(handleAction);
  }, [choices, dialog, selected]);

  if (!dialog) return null;
  const modal = dialog.isModal === true;
  const select = (value) => sendDialogResult(value);
  return (
    <>
      {modal ? <div className="window_backdrop dialog_backdrop" aria-hidden="true" /> : null}
      <section className={`dialog_window ${modal ? "dialog_window_modal window" : "dialog_window_floating"}`} role="dialog" aria-modal={modal} aria-labelledby="dialog_title">
        <div className="dialog_title" id="dialog_title">{dialog.speaker}</div>
        <p className="dialog_text">{dialog.text}</p>
        <div className="dialog_choices" role="group" aria-label="Dialog choices">
          {choices.map((choice, index) => (
            <button
              className={`dialog_choice${index === selected ? " dialog_choice_selected" : ""}`}
              type="button"
              key={choice.value}
              onClick={() => select(choice.value)}
              aria-pressed={index === selected}
            >
              <span aria-hidden="true">{index === selected ? ">" : " "}</span> {choice.label}
            </button>
          ))}
        </div>
        <div className="dialog_hint">{choices.length === 1 ? "Tap Right To Accept" : "Up / Down: Choose · Right: Accept"}</div>
      </section>
    </>
  );
}
