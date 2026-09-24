import { useEffect, useRef, useState } from "react";
import { INITIAL_CHARACTER } from "./character-data.js";
import { deriveBarColors } from "./character-colors.js";
import { CHARACTER_BAR_DELTA_DURATION_MS, getCharacterBarMaximumPercent, getCharacterBarSegments } from "./character-bar-presentation.js";
import { getPaletteStyle } from "../bridge-layer/palette.js";

const SLOT_LABELS = ["Slot 01", "Slot 02", "Slot 03", "Slot 04"];
const ROWS = [
  { key: "health", label: "Health", tooltip: "Health: The vitality of your character.", icon: "♥", color: "#ef3340" },
  { key: "stamina", label: "Stamina", tooltip: "Stamina: The movement energy of your character.", icon: "⚡", color: "#f59e0b" },
  { key: "offense", label: "Offense", tooltip: "Offense: The attack power of your character.", icon: "⚔", color: "#70e85a" },
  { key: "defense", label: "Defense", tooltip: "Defense: The protection of your character.", icon: "⛨", color: "#49b7ec" },
  { key: "experience", label: "Experience", tooltip: "Experience: The progress of your character.", icon: "✦", color: "#5f3df5" },
];

function Tooltip({ description, onShow, onHide, children, className = "" }) {
  return <span className={`setting_tooltip_target${className ? ` ${className}` : ""}`} aria-description={description} onPointerEnter={(event) => onShow(description, event.currentTarget)} onPointerDown={(event) => onShow(description, event.currentTarget)} onPointerLeave={onHide} onFocus={(event) => onShow(description, event.currentTarget)} onBlur={onHide}>{children}</span>;
}

function ItemHealthBar({ item }) {
  const maximum = Math.max(1, Number(item.maxHealth) || 1000);
  const current = Math.min(maximum, Math.max(0, Number(item.health) || 0));
  return <div className="character_item_health_bar" role="meter" aria-label={`${item.name} health`} aria-valuemin="0" aria-valuemax={maximum} aria-valuenow={current} style={{ "--character-item-health": `${(current / maximum) * 100}%` }}><span className="character_item_health_current" /></div>;
}

function Bar({ row, data, onShowTooltip, onHideTooltip }) {
  const derived = deriveBarColors(row.color);
  const [maximumPercent] = useState(() => getCharacterBarMaximumPercent(data.maximum ?? data.pointsNeededForNextLevel ?? 100));
  const [transitionPercent, setTransitionPercent] = useState(data.currentPercent);
  const settled = useRef(data.currentPercent);
  useEffect(() => { const from = data.previousPercent ?? settled.current; settled.current = data.currentPercent; setTransitionPercent(from); if (from === data.currentPercent) return undefined; const id = window.setTimeout(() => setTransitionPercent(data.currentPercent), CHARACTER_BAR_DELTA_DURATION_MS); return () => window.clearTimeout(id); }, [data.currentPercent, data.previousPercent, data.revision]);
  const segments = getCharacterBarSegments({ currentPercent: data.currentPercent, transitionPercent });
  return <div className="character_bar_row" data-stat={row.key} style={{ "--character-bar-color": row.color }}><span className="character_stat_icon" aria-hidden="true">{row.icon}</span><Tooltip className="character_bar_tooltip_target" description={row.tooltip} onShow={onShowTooltip} onHide={onHideTooltip}><div className="character_bar" role="progressbar" aria-label={row.label} aria-valuemin="0" aria-valuemax={data.maximum ?? 100} aria-valuenow={data.currentValue ?? data.currentPercent} style={{ "--character-bar-color": derived.current, "--character-bar-delta": derived.delta, "--character-bar-unfilled": derived.unfilled, "--character-bar-current": `${segments.currentPercent}%`, "--character-bar-current-max": `${maximumPercent}%`, "--character-bar-delta-start": `${segments.deltaStartPercent}%`, "--character-bar-delta-width": `${segments.deltaWidthPercent}%` }}><span className="character_bar_current" /><span className="character_bar_pending" /><span className="character_bar_current_max" aria-hidden="true" />{row.key === "experience" ? <span className="character_bar_text">O{data.level}</span> : null}</div></Tooltip></div>;
}

export function CharacterDetails({ gold = INITIAL_CHARACTER.gold.currentAmount, keys = INITIAL_CHARACTER.keys.currentAmount, health = INITIAL_CHARACTER.health.currentPercent, stamina = INITIAL_CHARACTER.stamina, combatStats = { offense: INITIAL_CHARACTER.offense, defense: INITIAL_CHARACTER.defense }, experience = INITIAL_CHARACTER.experience, slots = INITIAL_CHARACTER.slots, palette, onShowTooltip, onHideTooltip }) {
  const goldStyle = getPaletteStyle(palette, "💰");
  const keyStyle = getPaletteStyle(palette, "⚿");
  const staminaMaximum = Math.max(0, Number(stamina?.maximum) || 0);
  const staminaCurrent = Math.min(staminaMaximum, Math.max(0, Number(stamina?.current) || 0));
  const characterData = { ...INITIAL_CHARACTER, health: { ...INITIAL_CHARACTER.health, currentPercent: health, pendingPercent: health }, stamina: { ...INITIAL_CHARACTER.stamina, currentValue: staminaCurrent, maximum: staminaMaximum, previousPercent: Number(stamina?.previousPercent) || 0, revision: Number(stamina?.revision) || 0, currentPercent: Math.min(100, Math.max(0, Number(stamina?.currentPercent) || 0)), pendingPercent: Number(stamina?.previousPercent) || 0 }, offense: { ...INITIAL_CHARACTER.offense, ...(combatStats?.offense ?? {}), currentValue: combatStats?.offense?.current ?? INITIAL_CHARACTER.offense.currentValue }, defense: { ...INITIAL_CHARACTER.defense, ...(combatStats?.defense ?? {}), currentValue: combatStats?.defense?.current ?? INITIAL_CHARACTER.defense.currentValue }, experience: { ...INITIAL_CHARACTER.experience, ...(experience ?? {}) } };
  const slot = (item, index) => <Tooltip description={item?.name ?? SLOT_LABELS[index]} onShow={onShowTooltip} onHide={onHideTooltip}><div className="character_resource character_slot" aria-label={SLOT_LABELS[index]}><span className={`character_slot_text${item ? " character_item_icon" : ""}`}>{item?.glyph ?? SLOT_LABELS[index]}</span>{item ? <ItemHealthBar item={item} /> : null}</div></Tooltip>;
  return <div className="character_details" aria-label="Character details"><div className="character_bar_container">{ROWS.map((row) => <Bar key={row.key} row={row} data={characterData[row.key]} onShowTooltip={onShowTooltip} onHideTooltip={onHideTooltip} />)}</div><div className="character_slots_container"><div className="character_slots_grid"><Tooltip description="Gold: The currency of your character." onShow={onShowTooltip} onHide={onHideTooltip}><div className="character_resource" data-resource="gold" aria-label="Gold"><span className="character_resource_icon" aria-hidden="true" style={{ color: goldStyle.color }}>💰</span><span className="character_resource_value">{gold}</span></div></Tooltip>{slots.slice(0, 2).map(slot)}<Tooltip description="Keys: The keys your character is holding." onShow={onShowTooltip} onHide={onHideTooltip}><div className="character_resource" data-resource="keys" aria-label="Keys"><span className="character_resource_icon" aria-hidden="true" style={{ color: keyStyle.color }}>⚿</span><span className="character_resource_value">{keys}</span></div></Tooltip>{slots.slice(2, 4).map((item, index) => slot(item, index + 2))}</div></div></div>;
}
