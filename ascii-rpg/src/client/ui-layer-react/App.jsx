import { Component, Fragment, createRef, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { HexColorPicker } from "react-colorful";
import versionText from "../../../../version.txt?raw";
import {
  commitFont,
  getFontId,
  getSavedFontId,
  previewFont,
  restoreFontPreview,
  subscribeToFont,
} from "./font-store.js";
import { DEFAULT_FONT_ID, FONT_OPTIONS, getFontOption } from "../bridge-layer/font.js";
import { commitPalette, getPalette, subscribeToPalette } from "./palette-store.js";
import { commitGenerationSettings, DENSITY_LEVELS, GENERATION_DENSITY_DETAILS, GENERATION_PASS_DESCRIPTIONS, GENERATION_PASS_REALMS, getGenerationSettings, normalizeGenerationSettings, subscribeToGenerationSettings } from "./generation-settings-store.js";
import { sendGenerationSettingsPreview } from "../bridge-layer/game-bridge.js";
import {
  filterPaletteEntries,
  DEFAULT_GLYPH_OFFSET_SCALE,
  DEFAULT_GLYPH_OFFSET_X,
  DEFAULT_GLYPH_OFFSET_Y,
  DEFAULT_PALETTE_COLOR,
  getPaletteGroup,
  getPaletteGroupLabel,
  getPaletteEntryId,
  getPaletteEntryOffsets,
  PALETTE_WARNING_KEY,
  sortPaletteEntries,
  getPaletteStyle,
} from "../bridge-layer/palette.js";
import { getUrlBooleanArgument, withUrlArgument } from "./url-arguments.js";
import { ToastProvider, useToast } from "./ToastProvider.jsx";
import { BoxLayout, CornerLayout, HudBlockLayout } from "./HudLayouts.jsx";
import { removeFocusableElementsFromTabOrder } from "./button-tab-order.js";
import { INITIAL_CHARACTER } from "./character-data.js";
import { deriveBarColors } from "./character-colors.js";
import {
  CHARACTER_BAR_DELTA_DURATION_MS,
  getCharacterBarMaximumPercent,
  getCharacterBarSegments,
} from "./character-bar-presentation.js";
import { createGlyphRasterCanvas, rasterizeCompositeGlyph, getGlyphRasterSize } from "../game-layer-babylon-lite/glyph-visual-cache.js";
import { colorToLinearRgba } from "../game-layer-babylon-lite/palette-color-cache.js";
import { DEFAULT_ZOOM } from "../game-layer-babylon-lite/zoom-scale.js";
import {
  getStoredAspectMode,
  getStoredBooleanValue,
  getStoredInitialZoom,
  isMobilePlatform,
} from "./platform-settings.js";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_SCALE_STORAGE_VERSION } from "../game-layer-babylon-lite/zoom-scale.js";
import {
  getTimeSnapshot,
  getCombatStatsSnapshot,
  getExperienceSnapshot,
  getGoldSnapshot,
  getKeySnapshot,
  getHealthSnapshot,
  getStaminaSnapshot,
  getLogSnapshot,
  getPlayerDeadSnapshot,
  getCheckpointSnapshot,
  getRandomSeedSnapshot,
  getQuestSnapshot,
  getRealmDiscoverySnapshot,
  startQuest,
  getRealmSnapshot,
  sendRealmAmbientSnapshot,
  sendRealmPreferenceSnapshot,
  sendCameraModeSnapshot,
  sendGpuLightPassSnapshot,
  sendGlyphBackgroundSnapshot,
  sendBackgroundDarknessSnapshot,
  sendMinimapZoomSnapshot,
  sendMapviewRealmToggle,
  sendMapviewSnapshot,
  sendAspectSnapshot,
  sendPlayerGpuShadowBleedRangeSnapshot,
  sendPlayerLightingSnapshot,
  sendPlayerShadowSnapshot,
  sendPaletteSnapshot,
  sendTorchLightingSnapshot,
  sendTorchShadowSnapshot,
  sendZoomSnapshot,
  subscribeToPlayerMoved,
  subscribeToTime,
  subscribeToCombatStats,
  subscribeToExperience,
  subscribeToGold,
  subscribeToKey,
  subscribeToHealth,
  subscribeToStamina,
  subscribeToLog,
  subscribeToPlayerDead,
  subscribeToCheckpoint,
  subscribeToRandomSeed,
  subscribeToQuest,
  subscribeToQuestEvent,
  subscribeToRealm,
  subscribeToRealmDiscovery,
  subscribeToMinimapZoom,
  restartFromCheckpoint,
  restartGame,
} from "../bridge-layer/game-bridge.js";
import {
  CAMERA_MODE_LABELS,
  CAMERA_STORAGE_KEY,
  DEFAULT_CAMERA_MODE,
  getNextCameraMode,
  normalizeCameraMode,
} from "../bridge-layer/camera.js";
import { getNextMinimapScale, migrateMinimapScale } from "../game-layer-babylon-lite/systems/minimap-zoom.js";
import { performanceMonitor } from "../game-layer-babylon-lite/performance-monitor.js";
import { isLogScrollAtBottom } from "./log-scroll.js";
import {
  AMBIENT_LIGHT_STEP,
  LIGHTING_PROFILES,
  LIGHTING_SOURCE_STATES,
  SHADOW_PROFILES,
  PLAYER_GPU_SHADOW_BLEED_RANGES,
} from "../game-layer-babylon-lite/lighting.js";
import {
  PROJECT_MAP_GLYPHS,
} from "../game-layer-babylon-lite/systems/world-system.js";
import questData from "../game-layer-babylon-lite/data/quest_data.json";

const fullscreenStorageKey = "babylon-lite-ascii-rpg.fullscreen";
const aspectStorageKey = "babylon-lite-ascii-rpg.aspect";
const developerOpenStorageKey = "babylon-lite-ascii-rpg.developer-open";
const logOpenStorageKey = "babylon-lite-ascii-rpg.log-open";
const zoomStorageKey = "babylon-lite-ascii-rpg.zoom";
const zoomStorageVersionKey = "babylon-lite-ascii-rpg.zoom-version";
const overgroundAmbientStorageKey = "babylon-lite-ascii-rpg.ambient-overground";
const undergroundAmbientStorageKey = "babylon-lite-ascii-rpg.ambient-underground";
const realmStorageKey = "babylon-lite-ascii-rpg.active-realm";
const torchLightingStorageKey = "babylon-lite-ascii-rpg.torch-lighting";
const playerLightingStorageKey = "babylon-lite-ascii-rpg.player-lighting";
const torchShadowStorageKey = "babylon-lite-ascii-rpg.torch-shadow";
const playerShadowStorageKey = "babylon-lite-ascii-rpg.player-shadow";
const gpuLightPassStorageKey = "babylon-lite-ascii-rpg.gpu-light-pass";
const playerGpuShadowBleedRangeStorageKey = "babylon-lite-ascii-rpg.player-gpu-shadow-bleed-range";
const glyphBackgroundStorageKey = "babylon-lite-ascii-rpg.glyph-background";
const backgroundDarknessStorageKey = "babylon-lite-ascii-rpg.background-darkness";
const minimapZoomStorageKey = "babylon-lite-ascii-rpg.minimap-zoom";
const lightingWindowPositionStorageKey = "babylon-lite-ascii-rpg.lighting-window-position";
const tutorialSkipStorageKey = "babylon-lite-ascii-rpg.tutorial-skip";
const defaultQuestStorageKey = "babylon-lite-ascii-rpg.default-quest";
const minZoom = MIN_ZOOM;
const maxZoom = MAX_ZOOM;
const repositoryUrl = "https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg";
const uiMarginPixels = 10;
const mapGlyphs = new Set(PROJECT_MAP_GLYPHS);
const glyphDetailsWindowWidth = 220;
const glyphDetailsWindowHeight = 280;
const glyphDetailsWindowMargin = 16;
const lightingWindowMargin = 12;
const defaultLightingWindowPosition = { left: 180, top: 410 };
const DEFAULT_GLYPH_BACKGROUND = true;
const DEFAULT_BACKGROUND_DARKNESS = 50;
// The full character catalog is still available through the All filter, but
// opening settings should not synchronously mount hundreds of controls while
// the WebGPU game is rendering.
const defaultPaletteViewState = { filter: "in-maps", sortBy: "index", sortDirection: "ascending" };
const lightingValueHelp = "R Radius · M Maximum · F Falloff";
const shadowValueHelp = "O Occlusion · B Bleed";
const ambientValueHelp = "0 dark · 1 bright";

function formatTooltipDescription(description) {
  const text = String(description ?? "").trim().replace(/\?+/g, "");
  if (!text) return "";
  return /[.!]$/.test(text) ? text : `${text}.`;
}

const settingsHelp = Object.freeze({
  fullscreen: "Toggle fullscreen.",
  aspect: "Switch between landscape and portrait testing presentation.",
  repository: "Open the project repository on GitHub.",
  windowsSection: "Open utility windows.",
  asciiPalette: "Open ASCII palette controls.",
  gameplaySettings: "Open gameplay controls.",
  proceduralSettings: "Open procedural level-generation controls.",
  mapview: "Open the developer map.",
  arguments: "Open client argument details.",
  statsSection: "View live performance and version information.",
  fps: "Current rendered frames per second.",
  version: "Current game version.",
  settingsSection: "Adjust display and developer settings.",
  lighting: "Open lighting controls.",
  closeLighting: "Close lighting controls.",
  gpuLightPass: "Toggle soft GPU light glow.",
  playerGpuShadowBleedRange: "Cycle the bounded player shadow edge range in grid cells.",
  camera: "Cycle camera mode.",
  torchLighting: `Cycle torch light. ${lightingValueHelp}`,
  playerLighting: `Cycle player light. ${lightingValueHelp}`,
  torchShadow: `Cycle torch shadows. ${shadowValueHelp}`,
  playerShadow: `Cycle player shadows. ${shadowValueHelp}`,
  ambientIncrease: `Brighten overall light. ${ambientValueHelp}`,
  ambientDecrease: `Dim overall light. ${ambientValueHelp}`,
  zoomIn: "Make map glyphs larger.",
  zoom: "Current map glyph zoom level.",
  zoomOut: "Make map glyphs smaller.",
  reset: "Clear local storage and reload.",
});

function getStoredZoom() {
  return getStoredInitialZoom();
}

function getStoredMinimapZoom() {
  const storedZoom = Number.parseInt(localStorage.getItem(minimapZoomStorageKey), 10);
  return migrateMinimapScale(storedZoom);
}

function getStoredBoolean(storageKey, defaultValue) {
  return getStoredBooleanValue(localStorage.getItem(storageKey), defaultValue);
}

function getStoredBackgroundDarkness() {
  const storedValue = localStorage.getItem(backgroundDarknessStorageKey);
  if (storedValue === null || storedValue.trim() === "") return DEFAULT_BACKGROUND_DARKNESS;

  const stored = Number(storedValue);
  return Number.isInteger(stored) && stored >= 0 && stored <= 100
    ? stored
    : DEFAULT_BACKGROUND_DARKNESS;
}

function getStoredAmbientLight(storageKey, fallback) {
  const stored = Number.parseFloat(localStorage.getItem(storageKey));
  return Number.isFinite(stored) ? Math.min(1, Math.max(0, stored)) : fallback;
}

function getStoredSourceIndex(storageKey, defaultIndex) {
  const storedIndex = Number.parseInt(localStorage.getItem(storageKey), 10);
  return Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < LIGHTING_SOURCE_STATES.length
    ? storedIndex
    : defaultIndex;
}

function getStoredPlayerGpuShadowBleedRange() {
  const storedValue = localStorage.getItem(playerGpuShadowBleedRangeStorageKey);
  if (storedValue === null) return 2;
  const stored = Number(storedValue);
  return PLAYER_GPU_SHADOW_BLEED_RANGES.includes(stored) ? stored : 2;
}

export function getGlyphDetailsWindowPosition(anchor, containerBounds = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, scrollLeft: 0, scrollTop: 0 }) {
  const availableHeight = Math.max(0, containerBounds.height - glyphDetailsWindowMargin * 2);
  const detailsHeight = Math.min(glyphDetailsWindowHeight, availableHeight);
  const scrollLeft = containerBounds.scrollLeft ?? 0;
  const scrollTop = containerBounds.scrollTop ?? 0;
  const minLeft = scrollLeft + glyphDetailsWindowMargin;
  const minTop = scrollTop + glyphDetailsWindowMargin;
  const maxLeft = Math.max(minLeft, scrollLeft + containerBounds.width - glyphDetailsWindowWidth - glyphDetailsWindowMargin);
  const maxTop = Math.max(minTop, scrollTop + containerBounds.height - detailsHeight - glyphDetailsWindowMargin);
  const anchorTop = anchor.top - containerBounds.top + scrollTop;
  const anchorRight = anchor.left - containerBounds.left + scrollLeft;
  const preferredTop = anchorTop + detailsHeight <= scrollTop + containerBounds.height - glyphDetailsWindowMargin
    ? anchorTop
    : anchorTop - detailsHeight - glyphDetailsWindowMargin;

  return {
    top: Math.min(Math.max(preferredTop, minTop), maxTop),
    left: Math.min(Math.max(anchorRight + 12, minLeft), maxLeft),
  };
}

export function getLightingWindowPosition(position, dimensions, viewport = { width: window.innerWidth, height: window.innerHeight }) {
  const maxLeft = Math.max(lightingWindowMargin, viewport.width - dimensions.width - lightingWindowMargin);
  const maxTop = Math.max(lightingWindowMargin, viewport.height - dimensions.height - lightingWindowMargin);
  return {
    left: Math.min(Math.max(position.left, lightingWindowMargin), maxLeft),
    top: Math.min(Math.max(position.top, lightingWindowMargin), maxTop),
  };
}

function getStoredLightingWindowPosition() {
  try {
    const storedPosition = JSON.parse(localStorage.getItem(lightingWindowPositionStorageKey));
    return Number.isFinite(storedPosition?.left) && Number.isFinite(storedPosition?.top)
      ? { left: storedPosition.left, top: storedPosition.top }
      : defaultLightingWindowPosition;
  } catch {
    return defaultLightingWindowPosition;
  }
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" fill="#f5f5f5">
      <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.82c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.4A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
    </svg>
  );
}

const characterBarRows = [
  { key: "health", label: "Health", tooltip: "Health: The vitality of your character.", icon: "♥", color: "#ef3340" },
  { key: "stamina", label: "Stamina", tooltip: "Stamina: The movement energy of your character.", icon: "⚡", color: "#f59e0b" },
  { key: "offense", label: "Offense", tooltip: "Offense: The attack power of your character.", icon: "⚔", color: "#70e85a" },
  { key: "defense", label: "Defense", tooltip: "Defense: The protection of your character.", icon: "⛨", color: "#49b7ec" },
  { key: "experience", label: "Experience", tooltip: "Experience: The progress of your character.", icon: "✦", color: "#5f3df5" },
];

function CharacterBarRow({ row, data, color, onShowTooltip, onHideTooltip }) {
  const text = row.key === "experience" ? `O${data.level}` : null;
  const derivedColors = deriveBarColors(color);
  const currentPercent = data.currentPercent;
  const initialMaximum = data.maximum ?? data.pointsNeededForNextLevel ?? 100;
  const [maximumPercent] = useState(() => getCharacterBarMaximumPercent(initialMaximum));
  const [transitionPercent, setTransitionPercent] = useState(currentPercent);
  const settledPercentRef = useRef(currentPercent);
  const previousPercent = data.previousPercent;
  const revision = data.revision;
  const segments = getCharacterBarSegments({ currentPercent, transitionPercent });

  useEffect(() => {
    const fromPercent = previousPercent ?? settledPercentRef.current;
    settledPercentRef.current = currentPercent;
    setTransitionPercent(fromPercent);
    if (fromPercent === currentPercent) return undefined;

    const timeoutId = window.setTimeout(() => {
      setTransitionPercent(currentPercent);
    }, CHARACTER_BAR_DELTA_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [currentPercent, previousPercent, revision]);

  return (
    <div className="character_bar_row" data-stat={row.key} style={{ "--character-bar-color": color }}>
      <span className="character_stat_icon" aria-hidden="true">{row.icon}</span>
      <SettingTooltipTarget className="character_bar_tooltip_target" description={row.tooltip} onShow={onShowTooltip} onHide={onHideTooltip}>
        <div
          className="character_bar"
          role="progressbar"
          aria-label={row.label}
          aria-valuemin="0"
          aria-valuemax={data.maximum ?? 100}
          aria-valuenow={data.currentValue ?? data.currentPercent}
          style={{
            "--character-bar-color": derivedColors.current,
            "--character-bar-delta": derivedColors.delta,
            "--character-bar-unfilled": derivedColors.unfilled,
            "--character-bar-current": `${segments.currentPercent}%`,
            "--character-bar-current-max": `${maximumPercent}%`,
            "--character-bar-delta-start": `${segments.deltaStartPercent}%`,
            "--character-bar-delta-width": `${segments.deltaWidthPercent}%`,
          }}
        >
          <span className="character_bar_current" />
          <span className="character_bar_pending" />
          <span className="character_bar_current_max" aria-hidden="true" />
          {text ? <span className="character_bar_text">{text}</span> : null}
        </div>
      </SettingTooltipTarget>
    </div>
  );
}

function CharacterDetails({
  gold = INITIAL_CHARACTER.gold.currentAmount,
  keys = INITIAL_CHARACTER.keys.currentAmount,
  health = INITIAL_CHARACTER.health.currentPercent,
  stamina = INITIAL_CHARACTER.stamina,
  combatStats = { offense: INITIAL_CHARACTER.offense, defense: INITIAL_CHARACTER.defense },
  experience = INITIAL_CHARACTER.experience,
  palette,
  onShowTooltip,
  onHideTooltip,
}) {
  const goldStyle = getPaletteStyle(palette, "💰");
  const keyStyle = getPaletteStyle(palette, "⚿");
  const staminaMaximum = Math.max(0, Number(stamina?.maximum) || 0);
  const staminaCurrent = Math.min(staminaMaximum, Math.max(0, Number(stamina?.current) || 0));
  const staminaCurrentPercent = Math.min(100, Math.max(0, Number(stamina?.currentPercent) || 0));
  const staminaPreviousPercent = Math.min(100, Math.max(0, Number(stamina?.previousPercent) || 0));
  const characterData = {
    ...INITIAL_CHARACTER,
    health: { ...INITIAL_CHARACTER.health, currentPercent: health, pendingPercent: health },
    stamina: {
      ...INITIAL_CHARACTER.stamina,
      currentValue: staminaCurrent,
      maximum: staminaMaximum,
      previousPercent: staminaPreviousPercent,
      revision: Number(stamina?.revision) || 0,
      currentPercent: staminaCurrentPercent,
      pendingPercent: staminaPreviousPercent,
    },
    offense: {
      ...INITIAL_CHARACTER.offense,
      ...(combatStats?.offense ?? {}),
      currentValue: combatStats?.offense?.current ?? INITIAL_CHARACTER.offense.currentValue,
    },
    defense: {
      ...INITIAL_CHARACTER.defense,
      ...(combatStats?.defense ?? {}),
      currentValue: combatStats?.defense?.current ?? INITIAL_CHARACTER.defense.currentValue,
    },
    experience: {
      ...INITIAL_CHARACTER.experience,
      ...(experience ?? {}),
    },
  };
  return (
    <div className="character_details" aria-label="Character details">
      <div className="character_bar_container">
        {characterBarRows.map((row) => (
          <CharacterBarRow
            key={row.key}
            row={row}
            color={row.color}
            data={characterData[row.key]}
            onShowTooltip={onShowTooltip}
            onHideTooltip={onHideTooltip}
          />
        ))}
      </div>
      <div className="character_slots_container">
        <div className="character_slots_grid">
          <SettingTooltipTarget description="Gold: The currency of your character." onShow={onShowTooltip} onHide={onHideTooltip}>
            <div className="character_resource" data-resource="gold" aria-label="Gold">
              <span className="character_resource_icon" aria-hidden="true" style={{ color: goldStyle.color }}>💰</span>
              <span className="character_resource_value">{gold}</span>
            </div>
          </SettingTooltipTarget>
          {["Slot 01", "Slot 02"].map((slot) => (
            <SettingTooltipTarget description={slot} onShow={onShowTooltip} onHide={onHideTooltip} key={slot}>
              <div className="character_resource character_slot" aria-label={slot}>
                <span className="character_slot_text">{slot}</span>
              </div>
            </SettingTooltipTarget>
          ))}
          <SettingTooltipTarget description="Keys: The keys your character is holding." onShow={onShowTooltip} onHide={onHideTooltip}>
            <div className="character_resource" data-resource="keys" aria-label="Keys">
              <span className="character_resource_icon" aria-hidden="true" style={{ color: keyStyle.color }}>⚿</span>
              <span className="character_resource_value">{keys}</span>
            </div>
          </SettingTooltipTarget>
          {["Slot 03", "Slot 04"].map((slot) => (
            <SettingTooltipTarget description={slot} onShow={onShowTooltip} onHide={onHideTooltip} key={slot}>
              <div className="character_resource character_slot" aria-label={slot}>
                <span className="character_slot_text">{slot}</span>
              </div>
            </SettingTooltipTarget>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestTracker({ quest }) {
  if (!quest) return null;
  return <QuestLayout quest={quest} className="quest_tracker" ariaLabel="Current quest" />;
}

function QuestLayout({ quest, className = "", ariaLabel, onClick, onKeyDown }) {
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

function getQuestPreview(definition, activeQuest) {
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

const SIGNED_NUMBER_PATTERN = /[+-]\d+(?:\.\d+)?/g;

function renderLogEntry(entry) {
  const text = String(entry);
  const parts = text.split(SIGNED_NUMBER_PATTERN);
  const numbers = text.match(SIGNED_NUMBER_PATTERN) ?? [];

  return parts.reduce((rendered, part, index) => {
    rendered.push(part);
    const number = numbers[index];
    if (number) {
      rendered.push(<span className={number.startsWith("+") ? "log_number_positive" : "log_number_negative"} key={`${number}-${index}`}>{number}</span>);
    }
    return rendered;
  }, []);
}

function LogBody({ entries }) {
  const bodyRef = useRef(null);
  const followBottomRef = useRef(true);

  useLayoutEffect(() => {
    if (followBottomRef.current && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;

    const updateScrollState = () => {
      followBottomRef.current = isLogScrollAtBottom(body);
    };

    updateScrollState();
    body.addEventListener("scroll", updateScrollState, { passive: true });
    return () => body.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <div ref={bodyRef} className="log_box_body" aria-label="Log entries">
      {entries?.length ? entries.map((entry, index) => <div className="log_entry" key={`${entry}-${index}`}>{renderLogEntry(entry)}</div>) : null}
    </div>
  );
}

function SettingTooltipTarget({ description, onShow, onHide, children, as: Element = "span", className = "", ...props }) {
  const tooltipDescription = formatTooltipDescription(description);
  return (
    <Element
      {...props}
      className={`setting_tooltip_target${className ? ` ${className}` : ""}`}
      aria-description={tooltipDescription}
      onPointerEnter={(event) => onShow(tooltipDescription, event.currentTarget)}
      onPointerDown={(event) => onShow(tooltipDescription, event.currentTarget)}
      onClick={(event) => onShow(tooltipDescription, event.currentTarget)}
      onPointerLeave={onHide}
      onFocus={(event) => onShow(tooltipDescription, event.currentTarget)}
      onBlur={onHide}
    >
      {children}
    </Element>
  );
}

function WindowBackdrop({ visible, closesOnClick, onClose }) {
  if (!visible) return null;
  return <div className="window_backdrop" aria-hidden="true" onClick={closesOnClick ? onClose : undefined} />;
}

function TutorialWindow({ complete, onConfirm, onSkip, showCloseButton = false, showBackdrop = true, closeOnBackdropClick = true, onClose }) {
  const title = "How To Play";
  const titleId = complete ? "tutorial_complete_title" : "tutorial_title";

  return (
    <>
      <WindowBackdrop visible={showBackdrop} closesOnClick={closeOnBackdropClick} onClose={onClose} />
      <section
        id={complete ? "tutorial_complete_window" : "tutorial_window"}
        className="lighting_window tutorial_window"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-close-button-visible={showCloseButton}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        >
          <div className="lighting_window_titlebar tutorial_window_titlebar">
            <div id={titleId} className="corner_title">{title}</div>
            {showCloseButton ? (
              <button
                className="corner_body settings_option lighting_window_close"
                type="button"
                aria-label="Close Tutorial"
                tabIndex={-1}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onClose}
              >
                X
              </button>
            ) : null}
          </div>
        <div className="lighting_window_body tutorial_window_body">
          {complete ? (
            <p className="corner_body tutorial_window_copy">You completed the tutorial. Enjoy the game!</p>
          ) : (
            <div className="corner_body tutorial_window_copy tutorial_window_instructions">
              <p>Move the player</p>
              <ul>
                <li>Use arrow keys (or swipe touch) to move</li>
                <li>Hold shift (or hold touch) to move faster</li>
              </ul>
            </div>
          )}
          <div className="tutorial_window_actions">
            {complete ? (
              <button className="corner_body tutorial_window_primary tutorial_window_ok" type="button" onClick={onConfirm}>Ok</button>
            ) : (
              <>
                <button className="corner_body tutorial_window_primary" type="button" onClick={onConfirm}>Next</button>
                <button className="corner_body tutorial_window_secondary" type="button" onClick={onSkip}>Skip Tutorial</button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function DeathWindow({ checkpointActive, onRestartFromCheckpoint, onRestartGame }) {
  return (
    <>
      <WindowBackdrop visible closesOnClick={false} />
      <section
        id="death_window"
        className="lighting_window tutorial_window death_window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="death_title"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
      >
        <div className="lighting_window_titlebar tutorial_window_titlebar">
          <div id="death_title" className="corner_title">Adventure</div>
        </div>
        <div className="lighting_window_body tutorial_window_body">
          <p className="corner_body tutorial_window_copy">You have died.</p>
          <ul className="corner_body death_window_summary">
            <li>XP: 00</li>
            <li>Gold: 00</li>
            <li>Time: 00</li>
          </ul>
          <div className="tutorial_window_actions">
            <button className="corner_body tutorial_window_primary" type="button" disabled={!checkpointActive} onClick={onRestartFromCheckpoint}>Restart from checkpoint</button>
            <button className="corner_body tutorial_window_primary" type="button" onClick={onRestartGame}>Restart game</button>
          </div>
        </div>
      </section>
    </>
  );
}

function LightingWindow({
  position,
  onPositionChange,
  onClose,
  gpuLightPass,
  onGpuLightPassChange,
  playerGpuShadowBleedRange,
  onPlayerGpuShadowBleedRangeChange,
  torchLightingLabel,
  onTorchLightingChange,
  torchShadowLabel,
  onTorchShadowChange,
  playerLightingLabel,
  onPlayerLightingChange,
  playerShadowLabel,
  onPlayerShadowChange,
  overgroundAmbient,
  undergroundAmbient,
  onOvergroundAmbientChange,
  onUndergroundAmbientChange,
  onShowTooltip,
  onHideTooltip,
  showCloseButton = true,
  showBackdrop = true,
  closeOnBackdropClick = true,
}) {
  const windowRef = useRef(null);
  const dragStartRef = useRef(null);

  const clampPosition = (nextPosition) => {
    const rect = windowRef.current?.getBoundingClientRect();
    return getLightingWindowPosition(nextPosition, {
      width: rect?.width ?? 360,
      height: rect?.height ?? 320,
    });
  };

  useLayoutEffect(() => {
    const keepWindowReachable = () => {
      onPositionChange((currentPosition) => clampPosition(currentPosition));
    };
    keepWindowReachable();
    window.addEventListener("resize", keepWindowReachable);
    return () => window.removeEventListener("resize", keepWindowReachable);
  }, []);

  const beginDrag = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      position,
    };
  };

  const moveDrag = (event) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    onPositionChange(clampPosition({
      left: dragStart.position.left + event.clientX - dragStart.x,
      top: dragStart.position.top + event.clientY - dragStart.y,
    }));
  };

  const endDrag = (event) => {
    if (dragStartRef.current?.pointerId === event.pointerId) {
      dragStartRef.current = null;
    }
  };

  return (
    <>
      <WindowBackdrop visible={showBackdrop} closesOnClick={closeOnBackdropClick} onClose={onClose} />
      <section
        ref={windowRef}
        id="lighting_window"
        className="lighting_window"
        aria-labelledby="lighting_window_title"
        style={position}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="lighting_window_titlebar"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onLostPointerCapture={endDrag}
        >
          <div id="lighting_window_title" className="corner_title">Lighting</div>
          {showCloseButton ? (
            <button
              className="corner_body settings_option lighting_window_close"
              type="button"
              aria-label="Close Lighting"
              tabIndex={-1}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onClose}
            >
              X
            </button>
          ) : null}
        </div>
        <div className="lighting_window_body">
        <div id="ambient_overground_control" className="corner_body zoom_control" aria-label="Ambient Overground">
          <span>Ambient Overground</span>
          <SettingTooltipTarget description={settingsHelp.ambientIncrease} onShow={onShowTooltip} onHide={onHideTooltip}>
            <button type="button" aria-label="Increase Overground ambient light" aria-description={settingsHelp.ambientIncrease} onClick={() => onOvergroundAmbientChange(AMBIENT_LIGHT_STEP)} disabled={overgroundAmbient >= 1}>+</button>
          </SettingTooltipTarget>
          <span aria-live="polite">{overgroundAmbient.toFixed(1)}</span>
          <SettingTooltipTarget description={settingsHelp.ambientDecrease} onShow={onShowTooltip} onHide={onHideTooltip}>
            <button type="button" aria-label="Decrease Overground ambient light" aria-description={settingsHelp.ambientDecrease} onClick={() => onOvergroundAmbientChange(-AMBIENT_LIGHT_STEP)} disabled={overgroundAmbient <= 0}>-</button>
          </SettingTooltipTarget>
        </div>
        <div id="ambient_underground_control" className="corner_body zoom_control" aria-label="Ambient Underground"><span>Ambient Underground</span><button type="button" onClick={() => onUndergroundAmbientChange(AMBIENT_LIGHT_STEP)}>+</button><span>{undergroundAmbient.toFixed(1)}</span><button type="button" onClick={() => onUndergroundAmbientChange(-AMBIENT_LIGHT_STEP)}>-</button></div>
        <SettingTooltipTarget description={settingsHelp.gpuLightPass} onShow={onShowTooltip} onHide={onHideTooltip}>
          <button
            id="gpu_light_pass_toggle"
            className="corner_body settings_option"
            type="button"
            aria-pressed={gpuLightPass}
            aria-label="GPU Light Pass"
            aria-description={settingsHelp.gpuLightPass}
            tabIndex={-1}
            onClick={onGpuLightPassChange}
          >
            <span>GPU Light Pass</span>
            <span id="gpu_light_pass_checkbox" aria-hidden="true">{gpuLightPass ? "☑" : "☐"}</span>
          </button>
        </SettingTooltipTarget>
        <SettingTooltipTarget description={settingsHelp.playerLighting} onShow={onShowTooltip} onHide={onHideTooltip}>
          <button id="lighting_player_toggle" className="corner_body settings_option" type="button" aria-label="Cycle player lighting" aria-description={settingsHelp.playerLighting} tabIndex={-1} onClick={onPlayerLightingChange}>{playerLightingLabel}</button>
        </SettingTooltipTarget>
        <SettingTooltipTarget description={settingsHelp.playerGpuShadowBleedRange} onShow={onShowTooltip} onHide={onHideTooltip}>
          <button id="player_gpu_shadow_bleed_range" className="corner_body settings_option" type="button" aria-label="Player GPU Shadow Bleed Range" aria-description={settingsHelp.playerGpuShadowBleedRange} tabIndex={-1} onClick={onPlayerGpuShadowBleedRangeChange}>Player GPU Shadow Bleed Range ({playerGpuShadowBleedRange})</button>
        </SettingTooltipTarget>
        <SettingTooltipTarget description={settingsHelp.playerShadow} onShow={onShowTooltip} onHide={onHideTooltip}>
          <button id="shadow_player_toggle" className="corner_body settings_option" type="button" aria-label="Cycle player shadow" aria-description={settingsHelp.playerShadow} tabIndex={-1} onClick={onPlayerShadowChange}>{playerShadowLabel}</button>
        </SettingTooltipTarget>
        <SettingTooltipTarget description={settingsHelp.torchLighting} onShow={onShowTooltip} onHide={onHideTooltip}>
          <button id="lighting_torch_toggle" className="corner_body settings_option" type="button" aria-label="Cycle torch lighting" aria-description={settingsHelp.torchLighting} tabIndex={-1} onClick={onTorchLightingChange}>{torchLightingLabel}</button>
        </SettingTooltipTarget>
        <SettingTooltipTarget description={settingsHelp.torchShadow} onShow={onShowTooltip} onHide={onHideTooltip}>
          <button id="shadow_torch_toggle" className="corner_body settings_option" type="button" aria-label="Cycle torch shadow" aria-description={settingsHelp.torchShadow} tabIndex={-1} onClick={onTorchShadowChange}>{torchShadowLabel}</button>
        </SettingTooltipTarget>
        </div>
      </section>
    </>
  );
}

function PaletteGlyph({ glyph, color, fontFamily, offsets = null, backgroundDarkness = 50 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const size = getGlyphRasterSize(DEFAULT_ZOOM, 32);
    const raster = rasterizeCompositeGlyph(
      glyph,
      fontFamily,
      size,
      colorToLinearRgba({ color, alpha: 1 }),
      backgroundDarkness,
      offsets ?? undefined,
    );
    canvas.width = raster.width;
    canvas.height = raster.height;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(createGlyphRasterCanvas(raster), 0, 0);
    return undefined;
  }, [backgroundDarkness, color, fontFamily, glyph, offsets?.offsetScale, offsets?.offsetX, offsets?.offsetY]);

  return <canvas ref={canvasRef} className="palette_glyph_canvas" aria-label={glyph} />;
}

export class PromptWindow extends Component {
  windowRef = createRef();

  state = {
    activeTab: "palette",
    selectedEntryId: null,
    draft: null,
    anchor: null,
    fontDraftId: this.props.savedFontId,
    fontDraftDirty: false,
    warningVisible: false,
    hideWarning: false,
  };

  componentDidUpdate(previousProps) {
    if (previousProps.savedFontId !== this.props.savedFontId && !this.state.fontDraftDirty) {
      this.setState({ fontDraftId: this.props.savedFontId });
    }
  }

  setFilter = (filter) => this.props.onViewStateChange({ ...this.props.viewState, filter });

  toggleSort = (sortBy) => {
    const { viewState } = this.props;
    this.props.onViewStateChange({
      ...viewState,
      sortBy,
      sortDirection: viewState.sortBy === sortBy && viewState.sortDirection === "ascending"
        ? "descending"
        : "ascending",
    });
  };

  selectEntry = (entry, event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    this.setState({
      selectedEntryId: getPaletteEntryId(entry),
      draft: { color: entry.color, ...getPaletteEntryOffsets(entry) },
      anchor: { top: bounds.top, left: bounds.right },
    });
  };

  updateColor = (color) => this.setState((state) => ({ draft: { ...state.draft, color } }));

  updateOffset = (name, value) => this.setState((state) => ({
    draft: { ...state.draft, [name]: Number.parseInt(value, 10) },
  }));

  resetEdit = () => this.setState({
    draft: {
      color: DEFAULT_PALETTE_COLOR,
      offsetX: DEFAULT_GLYPH_OFFSET_X,
      offsetY: DEFAULT_GLYPH_OFFSET_Y,
      offsetScale: DEFAULT_GLYPH_OFFSET_SCALE,
    },
  });

  cancelEdit = () => this.setState({ selectedEntryId: null, draft: null, anchor: null });

  confirmEdit = async () => {
    const { onCommit } = this.props;
    const { selectedEntryId, draft } = this.state;
    if (!selectedEntryId || !draft) return;
    const result = await onCommit(selectedEntryId, draft);
    if (result?.ok) {
      this.cancelEdit();
      if (result.warning) this.setState({ warningVisible: true, hideWarning: false });
    }
  };

  acknowledgeWarning = () => {
    if (this.state.hideWarning) window.localStorage.setItem(PALETTE_WARNING_KEY, "true");
    this.setState({ warningVisible: false, hideWarning: false });
  };

  selectTab = (activeTab) => {
    this.setState((state) => ({
      activeTab,
      fontDraftId: activeTab === "font" && !state.fontDraftDirty ? this.props.savedFontId : state.fontDraftId,
    }));
  };

  updateFontDraft = (event) => {
    const fontId = event.target.value;
    this.setState({ fontDraftId: fontId, fontDraftDirty: true });
    this.props.onPreviewFont(fontId);
  };

  resetFontDraft = () => {
    this.setState({ fontDraftId: DEFAULT_FONT_ID, fontDraftDirty: true });
    this.props.onPreviewFont(DEFAULT_FONT_ID);
  };

  cancelFontEdit = () => {
    this.props.onCancelFont();
    this.setState({ fontDraftId: this.props.savedFontId, fontDraftDirty: false });
  };

  confirmFontEdit = async () => {
    const result = await this.props.onCommitFont(this.state.fontDraftId);
    if (result?.ok) {
      if (result.warning) this.setState({ warningVisible: true, hideWarning: false });
      this.props.onClose();
    }
  };

  render() {
    const { onClose, palette, viewState, fontId, glyphBackground, backgroundDarkness, onGlyphBackgroundChange, onBackgroundDarknessChange } = this.props;
    const {
      selectedEntryId,
      draft,
      anchor,
      warningVisible,
      hideWarning,
      activeTab,
      fontDraftId,
    } = this.state;
    const { filter, sortBy, sortDirection } = viewState;
    const selectedEntry = palette.find((entry) => getPaletteEntryId(entry) === selectedEntryId);
    const windowElement = this.windowRef.current;
    const windowRect = windowElement?.getBoundingClientRect();
    const windowBounds = windowElement && windowRect
      ? {
        left: windowRect.left,
        top: windowRect.top,
        width: windowRect.width,
        height: windowRect.height,
        scrollLeft: windowElement.scrollLeft,
        scrollTop: windowElement.scrollTop,
      }
      : null;
    const glyphDetailsWindowPosition = anchor && windowBounds ? getGlyphDetailsWindowPosition(anchor, windowBounds) : null;
    const visibleEntries = sortPaletteEntries(
      filterPaletteEntries(palette, filter, mapGlyphs),
      sortBy,
      sortDirection,
    );

    return (
      <div className="prompt_window" role="presentation">
        <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
        <section
          ref={this.windowRef}
          className="window"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ascii_palette_title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="window_header">
            <h1 id="ascii_palette_title" className="prompt_title">Ascii Settings</h1>
            <div className="title_tabs" role="tablist" aria-label="Ascii settings sections">
              <button
                className="prompt_tab"
                type="button"
                role="tab"
                aria-selected={activeTab === "palette"}
                onClick={() => this.selectTab("palette")}
              >
                Glyphs
              </button>
              <span aria-hidden="true"> / </span>
              <button
                className="prompt_tab"
                type="button"
                role="tab"
                aria-selected={activeTab === "font"}
                onClick={() => this.selectTab("font")}
              >
                Fonts
              </button>
              <span aria-hidden="true"> / </span>
              <button
                className="prompt_tab"
                type="button"
                role="tab"
                aria-selected={activeTab === "layout"}
                onClick={() => this.selectTab("layout")}
              >
                Layout
              </button>
            </div>
            <button
              className="prompt_button window_close"
              type="button"
              aria-label="Close Ascii Settings"
              onClick={onClose}
            >
              X
            </button>
          </div>
          {activeTab === "palette" ? <>
          <div className="content_options" aria-label="Glyph filter and sort options">
            <div className="content_option_group" aria-label="Glyph filters">
              <span className="content_option_label">Filter: </span>
              {["all", "in-maps", "customized"].map((filterValue) => (
                <button
                  className="content_option_button"
                  type="button"
                  key={filterValue}
                  aria-pressed={filter === filterValue}
                  onClick={() => this.setFilter(filterValue)}
                >
                  {filterValue === "in-maps" ? "InMaps" : filterValue[0].toUpperCase() + filterValue.slice(1)}
                </button>
              ))}
            </div>
            <div className="content_option_group" aria-label="Glyph sorting">
              <span className="content_option_label">Sort: </span>
              <button
                className="content_option_button"
                type="button"
                aria-label={`Sort by index ${sortBy === "index" ? sortDirection : "ascending"}`}
                aria-pressed={sortBy === "index"}
                onClick={() => this.toggleSort("index")}
              >
                #
              </button>
              <button
                className="content_option_button"
                type="button"
                aria-label={`Sort alphabetically ${sortBy === "alphabet" ? sortDirection : "ascending"}`}
                aria-pressed={sortBy === "alphabet"}
                onClick={() => this.toggleSort("alphabet")}
              >
                Abc
              </button>
              <button
                className="content_option_button"
                type="button"
                aria-label={`Sort by group ${sortBy === "group" ? sortDirection : "ascending"}`}
                aria-pressed={sortBy === "group"}
                onClick={() => this.toggleSort("group")}
              >
                Group
              </button>
            </div>
          </div>
          <div className="palette_grid" data-grouped={sortBy === "group" ? "true" : "false"}>
            {visibleEntries.map((entry, index) => {
              const entryId = getPaletteEntryId(entry);
              const displayColor = entryId === selectedEntryId && draft ? draft.color : entry.color;
              const displayOffsets = entryId === selectedEntryId && draft ? draft : getPaletteEntryOffsets(entry);
              const groupHeaderVisible = sortBy === "group"
                && (index === 0 || getPaletteGroup(entry) !== getPaletteGroup(visibleEntries[index - 1]));
              return (
                <Fragment key={entryId}>
                  {groupHeaderVisible ? (
                    <div className="palette_group_header" role="heading" aria-level="3">
                      {getPaletteGroupLabel(entry)}
                    </div>
                  ) : null}
                  <button
                    className="palette_cell"
                    type="button"
                    onClick={(event) => {
                    event.stopPropagation();
                    this.selectEntry(entry, event);
                    }}
                  >
                    <span className="palette_index">{entry.code ?? entry.unicode}</span>
                    <span className="palette_glyph">
                      <PaletteGlyph glyph={entry.glyph} color={displayColor} offsets={displayOffsets} backgroundDarkness={backgroundDarkness} fontFamily={getFontOption(fontId).family} />
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>
          {selectedEntry && draft && glyphDetailsWindowPosition ? (
            <div
              className="glyph_details_window"
              role="dialog"
              aria-label="Glyph Details"
              style={{ top: `${glyphDetailsWindowPosition.top}px`, left: `${glyphDetailsWindowPosition.left}px` }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="glyph_details_preview">
                <PaletteGlyph glyph={selectedEntry.glyph} color={draft.color} offsets={draft} backgroundDarkness={backgroundDarkness} fontFamily={getFontOption(fontId).family} />
              </div>
              <HexColorPicker color={draft.color} onChange={this.updateColor} />
              <div className="palette_offset_controls" aria-label="Glyph offsets">
                {[
                  ["offsetX", "Offset X", -10, 10, draft.offsetX],
                  ["offsetY", "Offset Y", -10, 10, draft.offsetY],
                  ["offsetScale", "Offset Scale", -100, 100, draft.offsetScale],
                ].map(([name, label, min, max, value]) => (
                  <label className="palette_offset_control" key={name}>
                    <span>{label}</span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step="1"
                      value={value}
                      onChange={(event) => this.updateOffset(name, event.target.value)}
                    />
                    <span>{name === "offsetScale" ? `${value}%` : value}</span>
                  </label>
                ))}
              </div>
              <div className="glyph_details_actions">
                <button type="button" onClick={this.confirmEdit}>Confirm</button>
                <button type="button" onClick={this.resetEdit}>Reset</button>
                <button type="button" onClick={this.cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : null}
          </> : activeTab === "font" ? (
            <div className="font_editor_body">
              <label className="font_select_label" htmlFor="ascii_font_select">Font</label>
              <select
                id="ascii_font_select"
                className="font_select"
                value={fontDraftId ?? fontId}
                onChange={this.updateFontDraft}
              >
                {FONT_OPTIONS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
              </select>
              <div className="font_preview" style={{ fontFamily: getFontOption(fontDraftId ?? fontId).family }}>
                W • P
              </div>
              <div className="glyph_details_actions">
                <button type="button" onClick={this.confirmFontEdit}>Confirm</button>
                <button type="button" onClick={this.resetFontDraft}>Reset</button>
                <button type="button" onClick={this.cancelFontEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="layout_editor_body">
              <div className="layout_control_group" role="group" aria-labelledby="glyph_background_label">
                <span id="glyph_background_label" className="layout_control_label">Glyph Background</span>
                <div className="layout_choice_group">
                  {[true, false].map((enabled) => (
                    <button
                      key={String(enabled)}
                      className="content_option_button"
                      type="button"
                      aria-pressed={glyphBackground === enabled}
                      onClick={() => onGlyphBackgroundChange(enabled)}
                    >
                      {enabled ? "On" : "Off"}
                    </button>
                  ))}
                </div>
              </div>
              <label className="layout_control_group" htmlFor="background_darkness">
                <span className="layout_control_label">Background Darkness</span>
                <span className="layout_slider_value">{backgroundDarkness}</span>
                <input
                  id="background_darkness"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={backgroundDarkness}
                  onChange={(event) => onBackgroundDarknessChange(Number(event.target.value))}
                />
              </label>
            </div>
          )}
          {warningVisible ? (
            <div className="palette_warning" role="alertdialog" aria-labelledby="palette_warning_title">
              <h2 id="palette_warning_title">Local palette change</h2>
              <p>This change is saved only in this browser and will not update the published game.</p>
              <label>
                <input
                  type="checkbox"
                  checked={hideWarning}
                  onChange={(event) => this.setState({ hideWarning: event.target.checked })}
                />
                Hide warning
              </label>
              <button type="button" onClick={this.acknowledgeWarning}>Continue</button>
            </div>
          ) : null}
          {this.props.error ? <div className="palette_error" role="alert">{this.props.error}</div> : null}
        </section>
      </div>
    );
  }
}

const argumentBlocks = [
  {
    name: "RandomSeed",
    parameter: "randomSeed",
    value: (seedValue) => seedValue,
    description: "fixes the generated level seed.",
    fallback: "Without it, each new level receives a fresh random seed.",
  },
  {
    name: "SkipTutorial",
    parameter: "skipTutorial",
    value: () => "true",
    description: "skips the tutorial for this page load.",
    fallback: "Without it, the tutorial starts unless the saved browser setting skips it.",
  },
];

function applyUrlArgument(name, value) {
  const nextUrl = withUrlArgument(window.location.href, name, value);
  window.location.assign(nextUrl.href);
}

export function ArgumentsWindow({ onClose, randomSeed }) {
  const seedValue = randomSeed ?? "";
  return (
    <div className="prompt_window" role="presentation">
      <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
      <section
        className="window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="arguments_title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window_header">
          <h1 id="arguments_title" className="prompt_title">Arguments</h1>
          <button
            className="prompt_button window_close"
            type="button"
            aria-label="Close Arguments"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className="prompt_body window_body">
          {argumentBlocks.map((argument) => {
            const value = argument.value(seedValue);
            const example = `?${argument.parameter}=${encodeURIComponent(value)}`;
            return (
            <section className="argument_block" key={argument.parameter}>
              <h2>{argument.name}</h2>
              <ul className="window_list">
                <li>
                  <button
                    className="argument_code"
                    type="button"
                    disabled={!value}
                    onClick={() => applyUrlArgument(argument.parameter, value)}
                  >
                    <code>{example}</code>
                  </button>{" "}
                  {argument.description}
                </li>
                <li>{argument.fallback}</li>
              </ul>
            </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function GameplaySettingsWindow({ quest, defaultQuestId, onSelectQuest, onClose }) {
  return (
    <div className="prompt_window" role="presentation">
      <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
      <section
        className="window gameplay_settings_window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameplay_settings_title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window_header">
          <h1 id="gameplay_settings_title" className="prompt_title">Gameplay Settings</h1>
          <div className="title_tabs" role="tablist" aria-label="Gameplay settings sections">
            <button className="prompt_tab" type="button" role="tab" aria-selected="true">
              Quests
            </button>
          </div>
          <button className="prompt_button window_close" type="button" aria-label="Close Gameplay Settings" onClick={onClose}>X</button>
        </div>
        <div className="prompt_body gameplay_settings_body">
          <h2>Quests</h2>
          <p className="gameplay_settings_hint">Select a quest to set it as the Default Quest.</p>
          <div className="quest_settings_list">
            {questData.quests.map((definition) => {
              const preview = getQuestPreview(definition, quest);
              const selected = defaultQuestId === definition.id;
              return (
                <div
                  key={definition.id}
                  className={`quest_settings_card${selected ? " quest_settings_card_selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => onSelectQuest(definition.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectQuest(definition.id);
                    }
                  }}
                >
                  <QuestLayout quest={preview} ariaLabel={`Quest ${definition.title}`} />
                  {selected ? <span className="quest_settings_default">Default Quest</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProceduralSettingsWindow({ settings, randomSeed, onConfirm, onClose }) {
  const [draft, setDraft] = useState(() => normalizeGenerationSettings(settings));
  const [previewRealm, setPreviewRealm] = useState("Overground");
  const [previewSeed, setPreviewSeed] = useState(() => randomSeed === "0" ? "0" : "random");
  const [previewViewport, setPreviewViewport] = useState({ zoom: 1, x: 0, y: 0 });
  const [error, setError] = useState("");
  const previewCanvasRef = useRef(null);
  const objectPassIds = new Set(["object-heart", "object-trap", "object-torch", "object-fireplace", "npc-spawner"]);
  const civilizationPassIds = new Set(["civilization-doors"]);
  const orderedPasses = [...draft.passes].sort((left, right) => left.order - right.order);
  const objectPasses = orderedPasses.filter((pass) => objectPassIds.has(pass.id));
  const previewRealmScope = previewRealm === "Underground" ? "Underworld" : "Overworld";
  const isPassAvailableInPreview = (pass) => {
    const scope = GENERATION_PASS_REALMS[pass.id] ?? "All";
    return scope === "All" || scope === previewRealmScope;
  };
  const previewDragRef = useRef(null);

  useEffect(() => {
    sendGenerationSettingsPreview(previewCanvasRef.current, draft, previewRealm, previewSeed);
    return () => sendGenerationSettingsPreview(null, null);
  }, [draft, previewRealm, previewSeed]);

  const selectDensity = (id, density) => {
    setDraft((current) => normalizeGenerationSettings({
      ...current,
      passes: current.passes.map((pass) => pass.id === id ? { ...pass, density } : pass),
    }));
  };

  const confirm = async () => {
    try {
      setError("");
      await onConfirm(draft);
    } catch (nextError) {
      setError(nextError.message || "Unable to save generation settings.");
    }
  };

  const resetDraft = () => {
    setError("");
    setDraft(normalizeGenerationSettings({ passes: [] }));
  };

  const constrainPreviewViewport = (viewport, bounds) => {
    const maxX = Math.max(0, (bounds.width * (viewport.zoom - 1)) / 2);
    const maxY = Math.max(0, (bounds.height * (viewport.zoom - 1)) / 2);
    return {
      ...viewport,
      x: Math.max(-maxX, Math.min(maxX, viewport.x)),
      y: Math.max(-maxY, Math.min(maxY, viewport.y)),
    };
  };

  const zoomPreview = (event) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const direction = event.deltaY < 0 ? 1 : -1;
    setPreviewViewport((current) => {
      const zoom = Math.max(1, Math.min(4, current.zoom + (direction * 0.25)));
      if (zoom === current.zoom) return current;
      const scale = zoom / current.zoom;
      const cursorX = event.clientX - bounds.left - (bounds.width / 2);
      const cursorY = event.clientY - bounds.top - (bounds.height / 2);
      return constrainPreviewViewport({
        zoom,
        x: (1 - scale) * cursorX + (scale * current.x),
        y: (1 - scale) * cursorY + (scale * current.y),
      }, bounds);
    });
  };

  const startPreviewPan = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    previewDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const panPreview = (event) => {
    const drag = previewDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPreviewViewport((current) => constrainPreviewViewport({
      ...current,
      x: current.x + event.clientX - drag.x,
      y: current.y + event.clientY - drag.y,
    }, bounds));
    previewDragRef.current = { ...drag, x: event.clientX, y: event.clientY };
  };

  const stopPreviewPan = (event) => {
    if (previewDragRef.current?.pointerId !== event.pointerId) return;
    previewDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="prompt_window" role="presentation">
      <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
      <section className="window gameplay_settings_window procedural_settings_window" role="dialog" aria-modal="true" aria-labelledby="procedural_settings_title" onClick={(event) => event.stopPropagation()}>
        <div className="window_header">
          <h1 id="procedural_settings_title" className="prompt_title">Procedural</h1>
          <div className="title_tabs" role="tablist" aria-label="Procedural settings sections">
            <button className="prompt_tab" type="button" role="tab" aria-selected="true">Level Generation</button>
          </div>
          <button className="prompt_button window_close" type="button" aria-label="Close Procedural" onClick={onClose}>X</button>
        </div>
        <div className="prompt_body procedural_settings_body">
          <div className="procedural_settings_options">
            <div className="procedural_settings_options_scroll">
              <h2>Procedural Level Generation Passes</h2>
              <p className="gameplay_settings_hint">Set the density &amp; distribution to feed the system.<br /><span className="procedural_settings_notice">Some of these buttons apparently do nothing yet</span></p>
              <div className="quest_settings_list">
                {orderedPasses.filter((pass) => pass.order <= 6).map((pass) => {
                  const unavailable = !isPassAvailableInPreview(pass);
                  return <section key={pass.id} className={`quest_settings_card procedural_settings_card${unavailable ? " procedural_realm_unavailable" : ""}`} aria-label={`${pass.title}, pass ${pass.order}`} aria-disabled={unavailable}>
                <h3>{pass.order}. {pass.title}</h3>
                {pass.configurable === false ? <div className="procedural_density_controls procedural_density_controls_static"><span className="procedural_realm_scope procedural_realm_scope_static">Realms: {GENERATION_PASS_REALMS[pass.id]}</span><span className="procedural_no_settings">No Settings</span></div> : <div className="procedural_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                  <span className="procedural_realm_scope">Realms: {GENERATION_PASS_REALMS[pass.id]}</span>
                  {DENSITY_LEVELS.map((density) => (
                    <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                      {density}
                    </button>
                  ))}
                </div>}
                <span className="procedural_settings_description">{GENERATION_PASS_DESCRIPTIONS[pass.id]}</span>
              </section>
                })}
                <section className="quest_settings_card procedural_object_settings_card" aria-label="Object and NPC Distribution, pass 7">
                  <div className="procedural_object_settings_header">
                    <h3>7. Object &amp; NPC Distribution</h3>
                    <span className="procedural_settings_description">Controls world object placement and Overworld NPC density</span>
                    <span className="procedural_realm_scope">Realms: All</span>
                  </div>
                  {objectPasses.map((pass) => {
                    const unavailable = !isPassAvailableInPreview(pass);
                    return <div key={pass.id} className={`procedural_object_density_row${unavailable ? " procedural_realm_unavailable" : ""}`} aria-disabled={unavailable}>
                      <span>{pass.title.replace(" Distribution", "")}</span>
                      <div className="procedural_density_controls procedural_object_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                        {DENSITY_LEVELS.map((density) => (
                          <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>
                  })}
                </section>
                <section className="quest_settings_card procedural_object_settings_card" aria-label="Civilization, pass 8">
                  <div className="procedural_object_settings_header">
                    <h3>8. Civilization</h3>
                    <span className="procedural_settings_description">Controls Underground civilization placement</span>
                    <span className="procedural_realm_scope">Realms: Underworld</span>
                  </div>
                  {orderedPasses.filter((pass) => civilizationPassIds.has(pass.id)).map((pass) => {
                    const unavailable = !isPassAvailableInPreview(pass);
                    return <div key={pass.id} className={`procedural_object_density_row${unavailable ? " procedural_realm_unavailable" : ""}`} aria-disabled={unavailable}>
                      <span>{pass.title}</span>
                      <div className="procedural_density_controls procedural_object_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                        {DENSITY_LEVELS.map((density) => (
                          <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>
                  })}
                </section>
                {orderedPasses.filter((pass) => pass.order > 6 && !objectPassIds.has(pass.id) && !civilizationPassIds.has(pass.id)).map((pass, index) => {
                  const unavailable = !isPassAvailableInPreview(pass);
                  return <section key={pass.id} className={`quest_settings_card procedural_settings_card${unavailable ? " procedural_realm_unavailable" : ""}`} aria-label={`${pass.title}, pass ${pass.order}`} aria-disabled={unavailable}>
                <h3>{9 + index}. {pass.title}</h3>
                <div className="procedural_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                  <span className="procedural_realm_scope">Realms: {GENERATION_PASS_REALMS[pass.id]}</span>
                  {DENSITY_LEVELS.map((density) => (
                    <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                      {density}
                    </button>
                  ))}
                </div>
                <span className="procedural_settings_description">{GENERATION_PASS_DESCRIPTIONS[pass.id]}</span>
              </section>
                })}
              </div>
            </div>
            <div className="procedural_settings_actions">
              <div className="procedural_settings_actions_left">
                <button className="prompt_button" type="button" onClick={confirm}>Confirm</button>
                <button className="prompt_button" type="button" onClick={resetDraft}>Reset</button>
                <button className="prompt_button" type="button" onClick={onClose}>Cancel</button>
              </div>
              <div className="procedural_settings_actions_right">
                <button className="prompt_button" type="button" aria-pressed={previewRealm === "Underground"} onClick={() => setPreviewRealm((realm) => realm === "Overground" ? "Underground" : "Overground")}>{previewRealm === "Overground" ? "Overworld" : "Underworld"}</button>
                <button className="prompt_button" type="button" aria-pressed={previewSeed === "0"} onClick={() => setPreviewSeed((seed) => seed === "random" ? "0" : "random")}>{previewSeed === "random" ? "Seed=Random" : "Seed=0"}</button>
              </div>
              {error ? <span className="procedural_settings_error" role="alert">{error}</span> : null}
            </div>
          </div>
          <div className="settings_map_view" aria-label="Generation settings map preview" onWheel={zoomPreview} onPointerDown={startPreviewPan} onPointerMove={panPreview} onPointerUp={stopPreviewPan} onPointerCancel={stopPreviewPan}>
            <canvas id="settings-map-view" ref={previewCanvasRef} aria-label="Settings map view preview" style={{ transform: `translate(${previewViewport.x}px, ${previewViewport.y}px) scale(${previewViewport.zoom})` }} />
            <span className="settings_map_low_rez">Low Rez.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppContent() {
  const { enqueueToast } = useToast();
  const [settingTooltip, setSettingTooltip] = useState(null);
  const [settingTooltipPosition, setSettingTooltipPosition] = useState({ top: 0, left: 0 });
  const settingTooltipRef = useRef(null);
  const [fullscreenPreferred, setFullscreenPreferred] = useState(() => {
    return localStorage.getItem(fullscreenStorageKey) === "true";
  });
  const fullscreenRequestInProgressRef = useRef(false);
  const [aspectMode, setAspectMode] = useState(() => getStoredAspectMode(localStorage.getItem(aspectStorageKey)));
  const [cameraMode, setCameraMode] = useState(() => normalizeCameraMode(localStorage.getItem(CAMERA_STORAGE_KEY)));
  const [zoom, setZoom] = useState(getStoredZoom);
  const [minimapZoom, setMinimapZoom] = useState(getStoredMinimapZoom);
  const [overgroundAmbient, setOvergroundAmbient] = useState(() => getStoredAmbientLight(overgroundAmbientStorageKey, 0.9));
  const [undergroundAmbient, setUndergroundAmbient] = useState(() => getStoredAmbientLight(undergroundAmbientStorageKey, 0.1));
  const [gpuLightPass, setGpuLightPass] = useState(() => getStoredBoolean(gpuLightPassStorageKey, true));
  const [playerGpuShadowBleedRange, setPlayerGpuShadowBleedRange] = useState(getStoredPlayerGpuShadowBleedRange);
  const [glyphBackground, setGlyphBackground] = useState(() => getStoredBoolean(glyphBackgroundStorageKey, DEFAULT_GLYPH_BACKGROUND));
  const [backgroundDarkness, setBackgroundDarkness] = useState(getStoredBackgroundDarkness);
  const [torchLightingIndex, setTorchLightingIndex] = useState(() => getStoredSourceIndex(torchLightingStorageKey, 1));
  const [playerLightingIndex, setPlayerLightingIndex] = useState(() => getStoredSourceIndex(playerLightingStorageKey, 4));
  const [torchShadowIndex, setTorchShadowIndex] = useState(() => getStoredSourceIndex(torchShadowStorageKey, 4));
  const [playerShadowIndex, setPlayerShadowIndex] = useState(() => getStoredSourceIndex(playerShadowStorageKey, 3));
  const [lightingWindowOpen, setLightingWindowOpen] = useState(false);
  const [mapviewOpen, setMapviewOpen] = useState(false);
  const [developerOpen, setDeveloperOpen] = useState(() => getStoredBoolean(developerOpenStorageKey, false));
  const [logOpen, setLogOpen] = useState(() => getStoredBoolean(logOpenStorageKey, true));
  const [lightingWindowPosition, setLightingWindowPosition] = useState(getStoredLightingWindowPosition);
  const [tutorialPhase, setTutorialPhase] = useState(() => (
    getUrlBooleanArgument(window.location.href, "skipTutorial") || getStoredBoolean(tutorialSkipStorageKey, false)
      ? "finished"
      : "initial"
  ));
  const tutorialDirectionsRef = useRef(new Set());
  const [asciiPaletteOpen, setAsciiPaletteOpen] = useState(false);
  const [gameplaySettingsOpen, setGameplaySettingsOpen] = useState(false);
  const [proceduralSettingsOpen, setProceduralSettingsOpen] = useState(false);
  const generationSettings = useSyncExternalStore(subscribeToGenerationSettings, getGenerationSettings, getGenerationSettings);
  const [defaultQuestId, setDefaultQuestId] = useState(() => {
    const stored = localStorage.getItem(defaultQuestStorageKey);
    const fallback = questData.quests[0]?.id ?? "";
    const next = questData.quests.some((definition) => definition.id === stored) ? stored : fallback;
    if (next && stored !== next) localStorage.setItem(defaultQuestStorageKey, next);
    return next;
  });
  const [argumentsOpen, setArgumentsOpen] = useState(false);
  const [paletteError, setPaletteError] = useState("");
  const [paletteViewState, setPaletteViewState] = useState(defaultPaletteViewState);
  const palette = useSyncExternalStore(subscribeToPalette, getPalette, getPalette);
  const fontId = useSyncExternalStore(subscribeToFont, getFontId, getFontId);
  const savedFontId = useSyncExternalStore(subscribeToFont, getSavedFontId, getSavedFontId);
  const worldTime = useSyncExternalStore(subscribeToTime, getTimeSnapshot, getTimeSnapshot);
  const activeRealm = useSyncExternalStore(subscribeToRealm, getRealmSnapshot, getRealmSnapshot);
  const realmDiscovery = useSyncExternalStore(subscribeToRealmDiscovery, getRealmDiscoverySnapshot, getRealmDiscoverySnapshot);
  const quest = useSyncExternalStore(subscribeToQuest, getQuestSnapshot, getQuestSnapshot);
  const gold = useSyncExternalStore(subscribeToGold, getGoldSnapshot, getGoldSnapshot);
  const keys = useSyncExternalStore(subscribeToKey, getKeySnapshot, getKeySnapshot);
  const health = useSyncExternalStore(subscribeToHealth, getHealthSnapshot, getHealthSnapshot);
  const stamina = useSyncExternalStore(subscribeToStamina, getStaminaSnapshot, getStaminaSnapshot);
  const combatStats = useSyncExternalStore(subscribeToCombatStats, getCombatStatsSnapshot, getCombatStatsSnapshot);
  const experience = useSyncExternalStore(subscribeToExperience, getExperienceSnapshot, getExperienceSnapshot);
  const log = useSyncExternalStore(subscribeToLog, getLogSnapshot, getLogSnapshot);
  const playerDead = useSyncExternalStore(subscribeToPlayerDead, getPlayerDeadSnapshot, getPlayerDeadSnapshot);
  const checkpoint = useSyncExternalStore(subscribeToCheckpoint, getCheckpointSnapshot, getCheckpointSnapshot);
  const randomSeed = useSyncExternalStore(subscribeToRandomSeed, getRandomSeedSnapshot, getRandomSeedSnapshot);
  const previousQuestRef = useRef(null);
  const [fps, setFps] = useState(0);

  const versionNumber = versionText.trim().replace(/^version=/, "").replace(/^v/, "");

  useEffect(() => {
    if (localStorage.getItem(tutorialSkipStorageKey) === null) {
      localStorage.setItem(tutorialSkipStorageKey, "false");
    }
  }, []);

  useEffect(() => {
    if (tutorialPhase !== "tracking") return undefined;
    return subscribeToPlayerMoved((eventName) => {
      tutorialDirectionsRef.current.add(eventName);
      if (tutorialDirectionsRef.current.size === 4) setTutorialPhase("complete");
    });
  }, [tutorialPhase]);

  useEffect(() => {
    if (tutorialPhase !== "initial" && tutorialPhase !== "complete") return undefined;
    const blockTutorialInput = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".tutorial_window button")) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", blockTutorialInput, true);
    return () => window.removeEventListener("keydown", blockTutorialInput, true);
  }, [tutorialPhase]);

  useEffect(() => {
    const closeTopmostWindow = (event) => {
      if (event.key !== "Escape") return;

      const closeAction = [
        proceduralSettingsOpen && (() => setProceduralSettingsOpen(false)),
        gameplaySettingsOpen && (() => setGameplaySettingsOpen(false)),
        argumentsOpen && (() => setArgumentsOpen(false)),
        asciiPaletteOpen && (() => setAsciiPaletteOpen(false)),
        lightingWindowOpen && (() => setLightingWindowOpen(false)),
        (tutorialPhase === "initial" || tutorialPhase === "complete") && (() => setTutorialPhase("finished")),
      ].find(Boolean);
      if (!closeAction) return;

      event.preventDefault();
      event.stopPropagation();
      closeAction();
    };

    window.addEventListener("keydown", closeTopmostWindow, true);
    return () => window.removeEventListener("keydown", closeTopmostWindow, true);
  }, [argumentsOpen, asciiPaletteOpen, gameplaySettingsOpen, lightingWindowOpen, proceduralSettingsOpen, tutorialPhase]);

  useEffect(() => {
    if (!playerDead) return undefined;
    const blockDeadRunInput = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".death_window button")) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", blockDeadRunInput, true);
    window.addEventListener("pointerdown", blockDeadRunInput, true);
    return () => {
      window.removeEventListener("keydown", blockDeadRunInput, true);
      window.removeEventListener("pointerdown", blockDeadRunInput, true);
    };
  }, [playerDead]);

  useLayoutEffect(() => {
    if (!settingTooltip || !settingTooltipRef.current) return;

    const placeTooltip = () => {
      const anchor = settingTooltip.anchor.getBoundingClientRect();
      const tooltip = settingTooltipRef.current.getBoundingClientRect();
      const gap = 8;
      const leftLimit = Math.max(gap, window.innerWidth - tooltip.width - gap);
      const topLimit = Math.max(gap, window.innerHeight - tooltip.height - gap);
      const top = anchor.top - tooltip.height - gap >= gap
        ? anchor.top - tooltip.height - gap
        : anchor.bottom + gap;
      const preferredLeft = anchor.right - tooltip.width >= gap
        ? anchor.right - tooltip.width
        : anchor.left;
      setSettingTooltipPosition({
        left: Math.min(Math.max(preferredLeft, gap), leftLimit),
        top: Math.min(Math.max(top, gap), topLimit),
      });
    };

    placeTooltip();
    window.addEventListener("resize", placeTooltip);
    return () => window.removeEventListener("resize", placeTooltip);
  }, [settingTooltip]);

  const showSettingTooltip = (description, anchor) => {
    setSettingTooltip({ description, anchor });
  };

  const hideSettingTooltip = () => setSettingTooltip(null);

  useEffect(() => {
    let frameCount = 0;
    let sampleStart = performance.now();
    let frameId = 0;

    const updateFps = (timestamp) => {
      if (performanceMonitor.isActive()) performanceMonitor.recordFrame(timestamp);
      frameCount += 1;
      const elapsed = timestamp - sampleStart;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        sampleStart = timestamp;
      }
      frameId = window.requestAnimationFrame(updateFps);
    };

    frameId = window.requestAnimationFrame(updateFps);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    return subscribeToQuestEvent((event) => {
      const quest = event.snapshot;
      if (event.type === "completed") enqueueToast(`Quest Completed: ${quest.title}.`);
      else if (event.type === "started") enqueueToast(`Quest Started: ${quest.title}.`);
    });
  }, [enqueueToast]);

  useEffect(() => {
    if (!quest) return;
    const previous = previousQuestRef.current;
    if (!previous && quest.state === "pending") enqueueToast(`Quest Started: ${quest.title}.`);
    else if (previous) {
      const previousSteps = new Map((previous.steps ?? []).map((step) => [step.id, step]));
      const changedStep = (quest.steps ?? []).find((step) => {
        const prior = previousSteps.get(step.id);
        return prior && (step.current > prior.current || (step.complete && !prior.complete));
      });
      if (changedStep) {
        enqueueToast(!changedStep.hideProgress && changedStep.target > 1
          ? `Quest Progress: ${changedStep.label} ${changedStep.current} of ${changedStep.target}.`
          : `Quest Progress: ${changedStep.label}.`);
      }
    }
    previousQuestRef.current = quest;
  }, [enqueueToast, quest]);

  const checkpointToastRevision = useRef(0);
  useEffect(() => {
    if (checkpoint.revision > checkpointToastRevision.current) enqueueToast("You saved a checkpoint.");
    checkpointToastRevision.current = checkpoint.revision;
  }, [checkpoint, enqueueToast]);

  useEffect(() => {
    const uiLayer = document.getElementById("ui_layer");
    const syncUiMargin = () => {
      uiLayer?.style.setProperty("--ui-margin-x", `${(uiMarginPixels / window.innerWidth) * 100}%`);
      uiLayer?.style.setProperty("--ui-margin-y", `${(uiMarginPixels / window.innerHeight) * 100}%`);
    };

    syncUiMargin();
    window.addEventListener("resize", syncUiMargin);
    return () => window.removeEventListener("resize", syncUiMargin);
  }, []);

  useEffect(() => {
    localStorage.setItem(fullscreenStorageKey, fullscreenPreferred ? "true" : "false");
  }, [fullscreenPreferred]);

  useLayoutEffect(() => {
    localStorage.setItem(aspectStorageKey, aspectMode);
    document.documentElement.dataset.presentationAspect = aspectMode;
    sendAspectSnapshot(aspectMode);
  }, [aspectMode]);

  useEffect(() => {
    localStorage.setItem(developerOpenStorageKey, developerOpen ? "true" : "false");
  }, [developerOpen]);

  useEffect(() => {
    localStorage.setItem(logOpenStorageKey, logOpen ? "true" : "false");
  }, [logOpen]);

  useEffect(() => {
    sendMapviewSnapshot(mapviewOpen);
    document.documentElement.dataset.mapviewOpen = String(mapviewOpen);
    return () => {
      sendMapviewSnapshot(false);
      delete document.documentElement.dataset.mapviewOpen;
    };
  }, [mapviewOpen]);

  useEffect(() => {
    localStorage.setItem(CAMERA_STORAGE_KEY, cameraMode);
    sendCameraModeSnapshot(cameraMode);
  }, [cameraMode]);

  useEffect(() => {
    localStorage.setItem(zoomStorageKey, String(zoom));
    localStorage.setItem(zoomStorageVersionKey, ZOOM_SCALE_STORAGE_VERSION);
    sendZoomSnapshot(zoom);
  }, [zoom]);

  useEffect(() => {
    localStorage.setItem(minimapZoomStorageKey, String(minimapZoom));
    sendMinimapZoomSnapshot(minimapZoom);
  }, [minimapZoom]);

  useEffect(() => subscribeToMinimapZoom(setMinimapZoom), []);

  useEffect(() => { localStorage.setItem(overgroundAmbientStorageKey, String(overgroundAmbient)); localStorage.setItem(undergroundAmbientStorageKey, String(undergroundAmbient)); sendRealmAmbientSnapshot({ Overground: overgroundAmbient, Underground: undergroundAmbient }); }, [overgroundAmbient, undergroundAmbient]);
  useEffect(() => { localStorage.setItem(realmStorageKey, activeRealm); sendRealmPreferenceSnapshot(activeRealm); }, [activeRealm]);

  useEffect(() => {
    localStorage.setItem(gpuLightPassStorageKey, gpuLightPass ? "true" : "false");
    sendGpuLightPassSnapshot(gpuLightPass);
  }, [gpuLightPass]);

  useEffect(() => {
    localStorage.setItem(playerGpuShadowBleedRangeStorageKey, String(playerGpuShadowBleedRange));
    sendPlayerGpuShadowBleedRangeSnapshot(playerGpuShadowBleedRange);
  }, [playerGpuShadowBleedRange]);

  useEffect(() => {
    localStorage.setItem(glyphBackgroundStorageKey, glyphBackground ? "true" : "false");
    sendGlyphBackgroundSnapshot(glyphBackground);
  }, [glyphBackground]);

  useEffect(() => {
    localStorage.setItem(backgroundDarknessStorageKey, String(backgroundDarkness));
    sendBackgroundDarknessSnapshot(backgroundDarkness);
  }, [backgroundDarkness]);

  useEffect(() => {
    localStorage.setItem(torchLightingStorageKey, String(torchLightingIndex));
    sendTorchLightingSnapshot(LIGHTING_SOURCE_STATES[torchLightingIndex]);
  }, [torchLightingIndex]);

  useEffect(() => {
    localStorage.setItem(playerLightingStorageKey, String(playerLightingIndex));
    sendPlayerLightingSnapshot(LIGHTING_SOURCE_STATES[playerLightingIndex]);
  }, [playerLightingIndex]);

  useEffect(() => {
    localStorage.setItem(torchShadowStorageKey, String(torchShadowIndex));
    sendTorchShadowSnapshot(LIGHTING_SOURCE_STATES[torchShadowIndex]);
  }, [torchShadowIndex]);

  useEffect(() => {
    localStorage.setItem(playerShadowStorageKey, String(playerShadowIndex));
    sendPlayerShadowSnapshot(LIGHTING_SOURCE_STATES[playerShadowIndex]);
  }, [playerShadowIndex]);

  useEffect(() => {
    localStorage.setItem(lightingWindowPositionStorageKey, JSON.stringify(lightingWindowPosition));
  }, [lightingWindowPosition]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setFullscreenPreferred(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } else if (document.documentElement.requestFullscreen && !fullscreenRequestInProgressRef.current) {
        fullscreenRequestInProgressRef.current = true;
        await document.documentElement.requestFullscreen();
        if (!document.fullscreenElement) {
          setFullscreenPreferred(true);
        }
      }
    } catch {
      setFullscreenPreferred(false);
    } finally {
      fullscreenRequestInProgressRef.current = false;
    }
  };

  const toggleAspectMode = () => {
    setSettingTooltip(null);
    setAspectMode((currentMode) => currentMode === "landscape" ? "portrait" : "landscape");
  };

  const changeZoom = (amount) => {
    setZoom((currentZoom) => {
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, currentZoom + amount));
      if (nextZoom !== currentZoom) sendZoomSnapshot(nextZoom);
      return nextZoom;
    });
  };

  const activateDetails = () => {};

  const activateMinimapZoom = () => {
    setMinimapZoom((currentZoom) => {
      const nextZoom = getNextMinimapScale(currentZoom);
      sendMinimapZoomSnapshot(nextZoom);
      return nextZoom;
    });
  };

  const handleTopPanelKeyDown = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const cycleCameraMode = () => setCameraMode((current) => getNextCameraMode(current));

  const changeRealmAmbient = (setter, amount) => setter((current) => Math.min(1, Math.max(0, Math.round((current + amount) * 100) / 100)));

  const cycleLighting = (setter) => {
    setter((currentIndex) => (currentIndex + 1) % LIGHTING_SOURCE_STATES.length);
  };
  const cyclePlayerGpuShadowBleedRange = () => setPlayerGpuShadowBleedRange((current) => {
    const index = PLAYER_GPU_SHADOW_BLEED_RANGES.indexOf(current);
    return PLAYER_GPU_SHADOW_BLEED_RANGES[(index + 1) % PLAYER_GPU_SHADOW_BLEED_RANGES.length];
  });

  const resetSettings = () => {
    localStorage.clear();
    localStorage.setItem(realmStorageKey, "Overground");
    window.location.reload();
  };

  const selectDefaultQuest = (id) => {
    if (!questData.quests.some((definition) => definition.id === id)) return;
    localStorage.setItem(defaultQuestStorageKey, id);
    setDefaultQuestId(id);
    startQuest(id);
  };

  const confirmTutorial = () => {
    localStorage.setItem(tutorialSkipStorageKey, "false");
    if (tutorialPhase === "initial") {
      tutorialDirectionsRef.current.clear();
      setTutorialPhase("tracking");
    } else if (tutorialPhase === "complete") {
      setTutorialPhase("finished");
    }
  };

  const skipTutorial = () => {
    localStorage.setItem(tutorialSkipStorageKey, "true");
    setTutorialPhase("finished");
  };

  const formatLightingProfile = (index) => {
    const profile = LIGHTING_PROFILES[index];
    const { radius, maximum, falloffExponent } = profile.config;
    return `${profile.label} (R${radius} M${maximum} F${falloffExponent})`;
  };
  const formatShadowProfile = (index) => {
    const profile = SHADOW_PROFILES[index];
    const { occlusion, bleed } = profile.config;
    return `${profile.label} (O${occlusion} B${bleed})`;
  };
  const torchLightingLabel = `Torch - ${formatLightingProfile(torchLightingIndex)}`;
  const playerLightingLabel = `Player - ${formatLightingProfile(playerLightingIndex)}`;
  const torchShadowLabel = `Torch Shadow - ${formatShadowProfile(torchShadowIndex)}`;
  const playerShadowLabel = `Player Shadow - ${formatShadowProfile(playerShadowIndex)}`;
  const activeRealmLabel = activeRealm === "Underground" ? "-1" : "1";
  const realmDiscoveryTitle = `Player discovered ${realmDiscovery.percent}% of Realm ${activeRealmLabel} of World 1`;

  const commitPaletteEntry = async (entryId, draft) => {
    const nextPalette = palette.map((entry) =>
      getPaletteEntryId(entry) === entryId ? { ...entry, ...draft } : entry,
    );
    try {
      setPaletteError("");
      await commitPalette(nextPalette);
      sendPaletteSnapshot(nextPalette);
      return { ok: true, warning: !import.meta.env.DEV && window.localStorage.getItem(PALETTE_WARNING_KEY) !== "true" };
    } catch (error) {
      setPaletteError(error.message);
      return { ok: false };
    }
  };
  const confirmGenerationSettings = async (nextSettings) => {
    await commitGenerationSettings(nextSettings);
    window.location.reload();
  };

  const commitFontSelection = async (nextFontId) => {
    try {
      setPaletteError("");
      await commitFont(nextFontId);
      return { ok: true, warning: !import.meta.env.DEV && window.localStorage.getItem(PALETTE_WARNING_KEY) !== "true" };
    } catch (error) {
      setPaletteError(error.message);
      return { ok: false };
    }
  };

  return (
    <>
      <CornerLayout
        position="top-left"
        role="button"
        tabIndex={-1}
        aria-label="Character details"
        onClick={activateDetails}
        onKeyDown={(event) => handleTopPanelKeyDown(event, activateDetails)}
      >
        <BoxLayout action="Character">
          <CharacterDetails
            gold={gold}
            keys={keys}
            health={health}
            stamina={stamina}
            combatStats={combatStats}
            experience={experience}
            palette={palette}
            onShowTooltip={showSettingTooltip}
            onHideTooltip={hideSettingTooltip}
          />
        </BoxLayout>
      </CornerLayout>
      <QuestTracker quest={quest} />
      {true ? (
        <>
          <CornerLayout
            position="top-right"
            role="button"
            tabIndex={-1}
            aria-label="Map icon"
            onClick={activateMinimapZoom}
            onKeyDown={(event) => handleTopPanelKeyDown(event, activateMinimapZoom)}
          >
            <BoxLayout action="Map 🔍" />
          </CornerLayout>
          <div className="minimap_status" aria-label="World status">
            <SettingTooltipTarget description={realmDiscoveryTitle} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <span className="hud_tooltip_target">World: 1 Realm: {activeRealmLabel} ({realmDiscovery.percent}%)</span>
            </SettingTooltipTarget>
            <SettingTooltipTarget description="Elapsed time units since game started" onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <span id="time" className="hud_tooltip_target">Time: {String(worldTime).padStart(5, "0")}</span>
            </SettingTooltipTarget>
          </div>
        </>
      ) : null}
      <CornerLayout
        position="bottom-left"
        className={`developer_panel ${developerOpen ? "developer_panel_open" : "developer_panel_closed"}`}
        aria-label="Developer tools"
      >
        {developerOpen ? (
          <BoxLayout
            id="developer_box"
            className="developer_box"
            actionPosition="top"
            action={<button className="developer_action" type="button" aria-expanded="true" aria-controls="developer_box" onClick={() => setDeveloperOpen(false)}>Dev</button>}
          >
            <div className="developer_box_body">
        <SettingTooltipTarget description={settingsHelp.repository} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
          <a className="project_link" href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label="View the repository on GitHub" aria-description={settingsHelp.repository} tabIndex={-1}>
            <GitHubMark />
          </a>
        </SettingTooltipTarget>
        <HudBlockLayout className="hud_section" id="windows" aria-labelledby="windows_title" titleId="windows_title" titleClassName="developer-title" bodyClassName="developer-body-text" title="Windows">
          <div className="windows_control_row">
            <SettingTooltipTarget description={settingsHelp.arguments} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="arguments_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.arguments} tabIndex={-1} onClick={() => setArgumentsOpen(true)}>
                Args
              </button>
            </SettingTooltipTarget>
            <span className="corner_body windows_control_separator" aria-hidden="true">/</span>
            <SettingTooltipTarget description={settingsHelp.asciiPalette} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="ascii_palette_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.asciiPalette} tabIndex={-1} onClick={() => setAsciiPaletteOpen(true)}>
                Ascii
              </button>
            </SettingTooltipTarget>
          </div>
          <div className="windows_control_row">
            <SettingTooltipTarget description={settingsHelp.gameplaySettings} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="gameplay_settings_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.gameplaySettings} tabIndex={-1} onClick={() => setGameplaySettingsOpen(true)}>
                Gameplay
              </button>
            </SettingTooltipTarget>
          </div>
          <div className="windows_control_row">
            <SettingTooltipTarget description={settingsHelp.proceduralSettings} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="procedural_settings_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.proceduralSettings} tabIndex={-1} onClick={() => setProceduralSettingsOpen(true)}>
                Procedural
              </button>
            </SettingTooltipTarget>
            <span className="corner_body windows_control_separator" aria-hidden="true">/</span>
            <SettingTooltipTarget description={settingsHelp.lighting} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="lighting_window_toggle" className="corner_body settings_option" type="button" aria-expanded={lightingWindowOpen} aria-controls="lighting_window" aria-description={settingsHelp.lighting} tabIndex={-1} onClick={() => setLightingWindowOpen((isOpen) => !isOpen)}>
                Lighting
              </button>
            </SettingTooltipTarget>
          </div>
        </HudBlockLayout>
        <HudBlockLayout className="hud_section" id="stats" aria-labelledby="stats_title" titleId="stats_title" titleClassName="developer-title" bodyClassName="developer-body-text" title="Info">
          <SettingTooltipTarget description={`${settingsHelp.fps} Current value: ${fps}.`} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <div id="fps" className="corner_body">FPS: {fps}</div>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={`${settingsHelp.version} ${versionNumber}.`} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <span id="version" className="corner_body">v{versionNumber}</span>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.mapview} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button id="mapview_toggle" className="corner_body settings_option" type="button" aria-expanded={mapviewOpen} aria-controls="mapview_overlay" aria-description={settingsHelp.mapview} tabIndex={-1} onClick={() => setMapviewOpen(true)}>
              Map
            </button>
          </SettingTooltipTarget>
        </HudBlockLayout>
        <HudBlockLayout className="hud_section" id="settings" aria-labelledby="settings_title" titleId="settings_title" titleClassName="developer-title" bodyClassName="developer-body-text" title="Settings">
          <SettingTooltipTarget description={settingsHelp.fullscreen} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button id="fullscreen_toggle" className="corner_body settings_option" type="button" aria-pressed={fullscreenPreferred} aria-description={settingsHelp.fullscreen} tabIndex={-1} onClick={toggleFullscreen}>
              <span>Fullscreen</span><span id="fullscreen_checkbox" aria-hidden="true">{fullscreenPreferred ? "☑" : "☐"}</span>
            </button>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.aspect} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button id="aspect_toggle" className="corner_body settings_option" type="button" aria-pressed={aspectMode === "portrait"} aria-description={settingsHelp.aspect} tabIndex={-1} onClick={toggleAspectMode}>
              {aspectMode === "portrait" ? "Aspect (Portrait)" : "Aspect (Landscape)"}
            </button>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.camera} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button id="camera_mode_toggle" className="corner_body settings_option" type="button" aria-label="Camera mode" aria-description={settingsHelp.camera} tabIndex={-1} onClick={cycleCameraMode}>
              {CAMERA_MODE_LABELS[cameraMode] ?? CAMERA_MODE_LABELS[DEFAULT_CAMERA_MODE]}
            </button>
          </SettingTooltipTarget>
          <SettingTooltipTarget as="div" id="zoom_control" className="corner_body zoom_control" aria-label="Zoom" description={`${settingsHelp.zoom} Current value: ${zoom}.`} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <span>Zoom</span>
            <button type="button" aria-label="Zoom in" onClick={() => changeZoom(1)} disabled={zoom >= maxZoom}>+</button>
            <span aria-live="polite">{zoom}</span>
            <button type="button" aria-label="Zoom out" onClick={() => changeZoom(-1)} disabled={zoom <= minZoom}>-</button>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.reset} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button id="reset_settings" className="corner_body settings_option" type="button" aria-label="Reset Settings" aria-description={settingsHelp.reset} tabIndex={-1} onClick={resetSettings}>Reset Settings</button>
          </SettingTooltipTarget>
        </HudBlockLayout>
            </div>
          </BoxLayout>
        ) : (
          <button className="developer_action developer_launcher" type="button" aria-expanded="false" aria-controls="developer_box" onClick={() => setDeveloperOpen(true)}>Dev</button>
        )}
      </CornerLayout>
      <CornerLayout
        position="bottom-right"
        className={`log_panel ${logOpen ? "log_panel_open" : "log_panel_closed"}`}
        aria-label="Log"
      >
        {logOpen ? (
          <BoxLayout
            id="log_box"
            className="log_box"
            actionPosition="top"
            action={<button className="log_action" type="button" aria-expanded="true" aria-controls="log_box" onClick={() => setLogOpen(false)}>Log</button>}
          >
            <LogBody entries={log} />
          </BoxLayout>
        ) : (
          <button className="log_action log_launcher" type="button" aria-expanded="false" aria-controls="log_box" onClick={() => setLogOpen(true)}>Log</button>
        )}
      </CornerLayout>
      {true && lightingWindowOpen ? (
        <LightingWindow
          position={lightingWindowPosition}
          onPositionChange={setLightingWindowPosition}
          onClose={() => setLightingWindowOpen(false)}
          gpuLightPass={gpuLightPass}
          onGpuLightPassChange={() => setGpuLightPass((enabled) => !enabled)}
          playerGpuShadowBleedRange={playerGpuShadowBleedRange}
          onPlayerGpuShadowBleedRangeChange={cyclePlayerGpuShadowBleedRange}
          torchLightingLabel={torchLightingLabel}
          onTorchLightingChange={() => cycleLighting(setTorchLightingIndex)}
          torchShadowLabel={torchShadowLabel}
          onTorchShadowChange={() => cycleLighting(setTorchShadowIndex)}
          playerLightingLabel={playerLightingLabel}
          onPlayerLightingChange={() => cycleLighting(setPlayerLightingIndex)}
          playerShadowLabel={playerShadowLabel}
          onPlayerShadowChange={() => cycleLighting(setPlayerShadowIndex)}
          overgroundAmbient={overgroundAmbient}
          undergroundAmbient={undergroundAmbient}
          onOvergroundAmbientChange={(amount) => changeRealmAmbient(setOvergroundAmbient, amount)}
          onUndergroundAmbientChange={(amount) => changeRealmAmbient(setUndergroundAmbient, amount)}
          onShowTooltip={showSettingTooltip}
          onHideTooltip={hideSettingTooltip}
          showCloseButton
          showBackdrop
          closeOnBackdropClick
        />
      ) : null}
      {mapviewOpen ? (
        <div id="mapview_overlay" className="mapview_overlay" role="dialog" aria-modal="true" aria-label="Map">
          <div className="mapview_controls">
            <button className="mapview_close" type="button" aria-label="Close Map" onClick={() => setMapviewOpen(false)}>X</button>
            <button className="mapview_realm_toggle" type="button" onClick={sendMapviewRealmToggle}>Toggle Realm</button>
          </div>
        </div>
      ) : null}
      {!playerDead && (tutorialPhase === "initial" || tutorialPhase === "complete") ? (
        <TutorialWindow
          complete={tutorialPhase === "complete"}
          onConfirm={confirmTutorial}
          onSkip={skipTutorial}
          showCloseButton={true}
          showBackdrop
          closeOnBackdropClick
          onClose={() => setTutorialPhase("finished")}
        />
      ) : null}
      {playerDead ? <DeathWindow checkpointActive={checkpoint.active} onRestartFromCheckpoint={restartFromCheckpoint} onRestartGame={restartGame} /> : null}
      {settingTooltip ? (
        <div
          ref={settingTooltipRef}
          className="settings_tooltip"
          role="tooltip"
          style={settingTooltipPosition}
        >
          {settingTooltip.description}
        </div>
      ) : null}
      {asciiPaletteOpen ? (
        <PromptWindow
          palette={palette}
          fontId={fontId}
          savedFontId={savedFontId}
          glyphBackground={glyphBackground}
          backgroundDarkness={backgroundDarkness}
          onGlyphBackgroundChange={setGlyphBackground}
          onBackgroundDarknessChange={setBackgroundDarkness}
          viewState={paletteViewState}
          onViewStateChange={setPaletteViewState}
          error={paletteError}
          onCommit={commitPaletteEntry}
          onPreviewFont={previewFont}
          onCommitFont={commitFontSelection}
          onCancelFont={restoreFontPreview}
          onClose={() => setAsciiPaletteOpen(false)}
        />
      ) : null}
      {argumentsOpen ? <ArgumentsWindow onClose={() => setArgumentsOpen(false)} randomSeed={randomSeed} /> : null}
      {gameplaySettingsOpen ? (
        <GameplaySettingsWindow
          quest={quest}
          defaultQuestId={defaultQuestId}
          onSelectQuest={selectDefaultQuest}
          onClose={() => setGameplaySettingsOpen(false)}
        />
      ) : null}
      {proceduralSettingsOpen ? <ProceduralSettingsWindow settings={generationSettings} randomSeed={randomSeed} onConfirm={confirmGenerationSettings} onClose={() => setProceduralSettingsOpen(false)} /> : null}
    </>
  );
}

export function App() {
  useLayoutEffect(() => removeFocusableElementsFromTabOrder(document.getElementById("ui_layer")), []);

  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
