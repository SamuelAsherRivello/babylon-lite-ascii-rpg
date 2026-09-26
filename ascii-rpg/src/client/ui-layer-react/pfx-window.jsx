import { DraggableWindow } from "./draggable-window.jsx";
import { PARTICLE_EFFECTS } from "../game-layer-babylon-lite/particle-effects.js";

export function PfxWindow({ position, selected, onSelect, onPositionChange, onClose, getWindowPosition }) {
  return <DraggableWindow id="pfx_window" title="PFX" position={position} onPositionChange={onPositionChange} onClose={onClose} getWindowPosition={getWindowPosition} className="lighting_window pfx_window" bodyClassName="pfx_window_body" showBackdrop={false}>
    <div role="listbox" aria-label="Particle effects">
      {PARTICLE_EFFECTS.map((effect) => <button key={effect.name} type="button" role="option" aria-selected={selected === effect.name} className={`corner_body settings_option pfx_effect_option${selected === effect.name ? " pfx_effect_selected" : ""}`} onClick={() => onSelect(effect.name)}>{effect.name}</button>)}
    </div>
  </DraggableWindow>;
}
