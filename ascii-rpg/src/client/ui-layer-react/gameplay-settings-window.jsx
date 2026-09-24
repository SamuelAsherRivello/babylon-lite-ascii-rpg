import questData from "../game-layer-babylon-lite/data/quest_data.json";
import { QuestLayout, getQuestPreview } from "./quest-components.jsx";

export function GameplaySettingsWindow({ quest, defaultQuestId, onSelectQuest, onClose }) {
  return (
    <div className="prompt_window" role="presentation">
      <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
      <section className="window gameplay_settings_window" role="dialog" aria-modal="true" aria-labelledby="gameplay_settings_title" onClick={(event) => event.stopPropagation()}>
        <div className="window_header">
          <h1 id="gameplay_settings_title" className="prompt_title">Gameplay Settings</h1>
          <div className="title_tabs" role="tablist" aria-label="Gameplay settings sections"><button className="prompt_tab" type="button" role="tab" aria-selected="true">Quests</button></div>
          <button className="prompt_button window_close" type="button" aria-label="Close Gameplay Settings" onClick={onClose}>X</button>
        </div>
        <div className="prompt_body gameplay_settings_body">
          <h2>Quests</h2>
          <p className="gameplay_settings_hint">Select a quest to set it as the Default Quest.</p>
          <div className="quest_settings_list">
            {questData.quests.map((definition) => {
              const preview = getQuestPreview(definition, quest);
              const selected = defaultQuestId === definition.id;
              return <div key={definition.id} className={`quest_settings_card${selected ? " quest_settings_card_selected" : ""}`} role="button" tabIndex={0} aria-pressed={selected} onClick={() => onSelectQuest(definition.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectQuest(definition.id); } }}>
                <QuestLayout quest={preview} ariaLabel={`Quest ${definition.title}`} />
                {selected ? <span className="quest_settings_default">Default Quest</span> : null}
              </div>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
