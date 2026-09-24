export function WindowBackdrop({ visible, closesOnClick, onClose }) {
  if (!visible) return null;
  return <div className="window_backdrop" aria-hidden="true" onClick={closesOnClick ? onClose : undefined} />;
}

export function TutorialWindow({ complete, onConfirm, onSkip, showCloseButton = false, showBackdrop = true, closeOnBackdropClick = true, onClose }) {
  const title = "How To Play";
  const titleId = complete ? "tutorial_complete_title" : "tutorial_title";
  return (
    <>
      <WindowBackdrop visible={showBackdrop} closesOnClick={closeOnBackdropClick} onClose={onClose} />
      <section id={complete ? "tutorial_complete_window" : "tutorial_window"} className="lighting_window tutorial_window" role="dialog" aria-modal="true" aria-labelledby={titleId} data-close-button-visible={showCloseButton} onPointerDown={(event) => event.stopPropagation()} onPointerMove={(event) => event.stopPropagation()}>
        <div className="lighting_window_titlebar tutorial_window_titlebar">
          <div id={titleId} className="corner_title">{title}</div>
          {showCloseButton ? <button className="corner_body settings_option lighting_window_close" type="button" aria-label="Close Tutorial" tabIndex={-1} onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>X</button> : null}
        </div>
        <div className="lighting_window_body tutorial_window_body">
          {complete ? <p className="corner_body tutorial_window_copy">You completed the tutorial. Enjoy the game!</p> : <div className="corner_body tutorial_window_copy tutorial_window_instructions"><p>Move the player</p><ul><li>Use arrow keys (or swipe touch) to move</li><li>Hold shift (or hold touch) to move faster</li></ul></div>}
          <div className="tutorial_window_actions">
            {complete ? <button className="corner_body tutorial_window_primary tutorial_window_ok" type="button" onClick={onConfirm}>Ok</button> : <><button className="corner_body tutorial_window_primary" type="button" onClick={onConfirm}>Next</button><button className="corner_body tutorial_window_secondary" type="button" onClick={onSkip}>Skip Tutorial</button></>}
          </div>
        </div>
      </section>
    </>
  );
}

export function DeathWindow({ checkpointActive, onRestartFromCheckpoint, onRestartGame }) {
  return (
    <>
      <WindowBackdrop visible closesOnClick={false} />
      <section id="death_window" className="lighting_window tutorial_window death_window" role="dialog" aria-modal="true" aria-labelledby="death_title" onPointerDown={(event) => event.stopPropagation()} onPointerMove={(event) => event.stopPropagation()}>
        <div className="lighting_window_titlebar tutorial_window_titlebar"><div id="death_title" className="corner_title">Adventure</div></div>
        <div className="lighting_window_body tutorial_window_body">
          <p className="corner_body tutorial_window_copy">You have died.</p>
          <ul className="corner_body death_window_summary"><li>XP: 00</li><li>Gold: 00</li><li>Time: 00</li></ul>
          <div className="tutorial_window_actions"><button className="corner_body tutorial_window_primary" type="button" disabled={!checkpointActive} onClick={onRestartFromCheckpoint}>Restart from checkpoint</button><button className="corner_body tutorial_window_primary" type="button" onClick={onRestartGame}>Restart game</button></div>
        </div>
      </section>
    </>
  );
}
