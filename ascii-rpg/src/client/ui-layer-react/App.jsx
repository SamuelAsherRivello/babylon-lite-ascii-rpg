import { Component, Fragment, createRef, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { HexColorPicker } from "react-colorful";
import versionText from "../../../../version.txt?raw";
import changelog from "./data/changelog.json";
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
import { commitGenerationSettings, createDefaultGenerationSettings, DENSITY_LEVELS, GENERATION_DENSITY_DETAILS, GENERATION_PASS_DESCRIPTIONS, GENERATION_PASS_REALMS, getGenerationSettings, normalizeGenerationSettings, subscribeToGenerationSettings } from "./generation-settings-store.js";
import { WORLD_SIZE_DETAILS, WORLD_SIZE_LEVELS } from "../world-size-settings.js";
import { getGenerationSemanticCards } from "../game-layer-babylon-lite/world-feature-generation-registry.js";
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

const CHARACTER_SLOT_LABELS = ["Slot 01", "Slot 02", "Slot 03", "Slot 04"];
import { deriveBarColors } from "./character-colors.js";
import {
  CHARACTER_BAR_DELTA_DURATION_MS,
  getCharacterBarMaximumPercent,
  getCharacterBarSegments,
} from "./character-bar-presentation.js";
import {
  getStoredAspectMode,
  getStoredInitialCameraMode,
  isMobilePlatform,
} from "./platform-settings.js";
import { ZOOM_SCALE_STORAGE_VERSION } from "../game-layer-babylon-lite/zoom-scale.js";
import {
  getTimeSnapshot,
  getCombatStatsSnapshot,
  getExperienceSnapshot,
  getDialogSnapshot,
  getGoldSnapshot,
  getCharacterStateSnapshot,
  getKeySnapshot,
  getHealthSnapshot,
  getStaminaSnapshot,
  getLogSnapshot,
  getPlayerDeadSnapshot,
  getPlayerRecoveryReadySnapshot,
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
  subscribeToDialog,
  subscribeToGold,
  subscribeToCharacterState,
  subscribeToKey,
  subscribeToHealth,
  subscribeToStamina,
  subscribeToLog,
  subscribeToPlayerDead,
  subscribeToPlayerRecoveryReady,
  subscribeToCheckpoint,
  subscribeToRandomSeed,
  subscribeToQuest,
  subscribeToQuestEvent,
  subscribeToRealm,
  subscribeToRealmDiscovery,
  subscribeToMinimapZoom,
  restartFromCheckpoint,
  restartGame,
  sendPfxSelectionSnapshot,
  sendPfxPlacementEnabled,
} from "../bridge-layer/game-bridge.js";
import {
  CAMERA_MODE_LABELS,
  CAMERA_STORAGE_KEY,
  DEFAULT_CAMERA_MODE,
  getNextCameraMode,
} from "../bridge-layer/camera.js";
import { getNextMinimapScale } from "../game-layer-babylon-lite/systems/minimap-zoom.js";
import { performanceMonitor } from "../game-layer-babylon-lite/performance-monitor.js";
import { QuestLayout, QuestTracker, getQuestPreview } from "./quest-components.jsx";
import { LogBody } from "./log-components.jsx";
import { DeathWindow, TutorialWindow, WindowBackdrop } from "./tutorial-windows.jsx";
import { GameplaySettingsWindow } from "./gameplay-settings-window.jsx";
import { ChangelogWindow } from "./changelog-window.jsx";
import { ArgumentsWindow } from "./arguments-window.jsx";
import { CharacterDetails as ExtractedCharacterDetails } from "./character-components.jsx";
import { PaletteGlyph } from "./palette-glyph.jsx";
import { GenerationEnabledCheckbox } from "./generation-enabled-checkbox.jsx";
import { LightingWindow as ExtractedLightingWindow } from "./lighting-window.jsx";
import { DialogWindow } from "./dialog-window.jsx";
import { PfxWindow } from "./pfx-window.jsx";
import { PARTICLE_EFFECTS } from "../game-layer-babylon-lite/particle-effects.js";

import {
  fullscreenStorageKey, aspectStorageKey, developerOpenStorageKey, logOpenStorageKey,
  zoomStorageKey, zoomStorageVersionKey, overgroundAmbientStorageKey, undergroundAmbientStorageKey,
  realmStorageKey, torchLightingStorageKey, playerLightingStorageKey, torchShadowStorageKey,
  playerShadowStorageKey, gpuLightPassStorageKey, playerGpuShadowBleedRangeStorageKey,
  minimapZoomStorageKey, lightingWindowPositionStorageKey, tutorialSkipStorageKey, defaultQuestStorageKey,
  minZoom, maxZoom, getStoredZoom, getStoredMinimapZoom,
  getStoredBoolean, getStoredAmbientLight, getStoredSourceIndex,
  getStoredPlayerGpuShadowBleedRange,
} from "./stored-setting-helpers.js";
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

const repositoryUrl = "https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg";
const changelogFeaturePaths = Object.freeze({
  "Procedural generation controls": "openspec/specs/procedural-generation-settings/spec.md",
  "Developer map tools": "openspec/specs/developer-mapview/spec.md",
  "Tutorial flow polish": "openspec/specs/movement-tutorial/spec.md",
  "Floating combat text": "openspec/specs/floating-text/spec.md",
  "Responsive UI resilience": "openspec/specs/responsive-ui-layout/spec.md",
  "Developer mapview": "openspec/specs/developer-mapview/spec.md",
  "Camera recalculation": "openspec/specs/camera-modes/spec.md",
  "Glyph offset controls": "openspec/specs/glyph-background-layout/spec.md",
  "Realm discovery": "openspec/specs/fog-of-war-minimap/spec.md",
  "Performance monitoring": "openspec/specs/performance-monitoring/spec.md",
  "Enemy spawn system": "openspec/specs/enemy-spawner-system/spec.md",
  "Enemy spawning": "openspec/specs/enemy-system/spec.md",
  "Stamina combat stats": "openspec/specs/combat-stats/spec.md",
  "Single player lifecycle": "openspec/specs/player-lifecycle/spec.md",
  "Movement performance": "openspec/specs/movement-render-performance/spec.md",
  "Gameplay settings": "openspec/specs/gameplay-settings/spec.md",
  "Object spawning": "openspec/specs/object-spawner-system/spec.md",
  "Underground civilization": "openspec/specs/underground-civilization/spec.md",
  "Quest progression": "openspec/specs/questing-system/spec.md",
  "Persistent fog": "openspec/specs/fog-of-war-minimap/spec.md",
  "Draggable lighting window": "openspec/specs/draggable-lighting-window/spec.md",
  "Fogged minimap": "openspec/specs/minimap-rendering/spec.md",
  "GPU lighting": "openspec/specs/palette-grid-lighting/spec.md",
  "World view rendering": "openspec/specs/world-view-rendering/spec.md",
  "HUD layout": "openspec/specs/responsive-ui-layout/spec.md",
  "UI stylesheet organization": "openspec/specs/responsive-ui-layout/spec.md",
  "Movement tutorial": "openspec/specs/movement-tutorial/spec.md",
  "Quest system": "openspec/specs/questing-system/spec.md",
  "Character information": "openspec/specs/character-info/spec.md",
  "Minimap rendering": "openspec/specs/minimap-rendering/spec.md",
  "UI layout components": "openspec/specs/responsive-ui-layout/spec.md",
  "Aspect testing": "openspec/specs/responsive-ui-layout/spec.md",
  "Minimap markers": "openspec/specs/minimap-markers/spec.md",
  "Minimap zoom": "openspec/specs/minimap-zoom-interaction/spec.md",
  "Toast notifications": "openspec/specs/toast-notifications/spec.md",
  "Platform defaults": "openspec/specs/platform-default-settings/spec.md",
  "Release maintenance": "README.md",
  "World realms": "openspec/specs/world-realms/spec.md",
  "GPU light pass": "openspec/specs/palette-grid-lighting/spec.md",
  "Lighting window": "openspec/specs/draggable-lighting-window/spec.md",
  "Mobile support": "openspec/specs/responsive-ui-layout/spec.md",
  "Palette font choices": "openspec/specs/ascii-palette/spec.md",
  "Game time system": "openspec/specs/time-system/spec.md",
  "ASCII palette": "openspec/specs/ascii-palette/spec.md",
  "Babylon Lite runtime": "openspec/specs/game-layer-architecture/spec.md",
  "Procedural level generation": "openspec/specs/procedural-level-generation/spec.md",
  "Player grid movement": "openspec/specs/player-grid-movement/spec.md",
  "Initial project release": "README.md",
});
const uiMarginPixels = 10;
const mapGlyphs = new Set(PROJECT_MAP_GLYPHS);
const glyphDetailsWindowWidth = 220;
const glyphDetailsWindowHeight = 280;
const glyphDetailsWindowMargin = 16;
const lightingWindowMargin = 12;
const defaultLightingWindowPosition = { left: 180, top: 410 };
const defaultPfxWindowPosition = { left: 420, top: 180 };
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
  changelog: "Open released version history.",
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
    const { onClose, palette, viewState, fontId } = this.props;
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
                      <PaletteGlyph glyph={entry.glyph} color={displayColor} offsets={displayOffsets} fontFamily={getFontOption(fontId).family} />
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
                <PaletteGlyph glyph={selectedEntry.glyph} color={draft.color} offsets={draft} fontFamily={getFontOption(fontId).family} />
              </div>
              <HexColorPicker color={draft.color} onChange={this.updateColor} />
              <div className="palette_offset_controls" aria-label="Glyph offsets">
                {[
                  ["offsetX", "Offset X", -20, 20, draft.offsetX],
                  ["offsetY", "Offset Y", -20, 20, draft.offsetY],
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
          ) : null}
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
  {
    name: "GenerationOverrides (AI tester)",
    parameter: "generationOverrides",
    value: () => "disable:7,11;low:8,16",
    description: "keeps the real generation data, then disables passes 7 and 11 and sets passes 8 and 16 to Low.",
    fallback: "This argument activates AI tester mode; overrides are read-only and never write generation settings to disk.",
  },
];

function applyUrlArgument(name, value) {
  const nextUrl = withUrlArgument(window.location.href, name, value);
  window.location.assign(nextUrl.href);
}

export function ProceduralSettingsWindow({ settings, randomSeed, onConfirm, onClose }) {
  const [draft, setDraft] = useState(() => normalizeGenerationSettings(settings));
  const [previewRealm, setPreviewRealm] = useState("Overground");
  const [previewSeed, setPreviewSeed] = useState(() => randomSeed === "0" ? "0" : "random");
  const [previewViewport, setPreviewViewport] = useState({ zoom: 1, x: 0, y: 0 });
  const [previewLoading, setPreviewLoading] = useState(true);
  const [error, setError] = useState("");
  const previewCanvasRef = useRef(null);
  const semanticCards = getGenerationSemanticCards();
  const objectCard = semanticCards.find((card) => card.id === "object-distribution");
  const civilizationCard = semanticCards.find((card) => card.id === "civilization-placement");
  const characterCard = semanticCards.find((card) => card.id === "character-distribution");
  const objectPassIds = new Set(objectCard.featureIds);
  const civilizationPassIds = new Set(civilizationCard.featureIds);
  const characterPassIds = new Set(characterCard.featureIds);
  const orderedPasses = [...draft.passes].sort((left, right) => left.order - right.order);
  const objectPasses = orderedPasses.filter((pass) => objectPassIds.has(pass.id));
  const previewRealmScope = previewRealm === "Underground" ? "Underworld" : "Overworld";
  const isPassAvailableInPreview = (pass) => {
    const scope = GENERATION_PASS_REALMS[pass.id] ?? "All";
    return scope === "All" || scope === previewRealmScope;
  };
  const previewDragRef = useRef(null);

  useEffect(() => {
    let current = true;
    setPreviewLoading(true);
    Promise.resolve()
      .then(() => current ? sendGenerationSettingsPreview(previewCanvasRef.current, draft, previewRealm, previewSeed) : undefined)
      .catch((nextError) => {
        if (current) setError(nextError.message || "Unable to render generation preview.");
      })
      .finally(() => {
        if (current) setPreviewLoading(false);
      });
    return () => {
      current = false;
    };
  }, [draft, previewRealm, previewSeed]);
  useEffect(() => () => { sendGenerationSettingsPreview(null, null); }, []);

  const startPreviewRedraw = (update) => {
    setPreviewLoading(true);
    update();
  };

  const selectDensity = (id, density) => startPreviewRedraw(() => setDraft((current) => normalizeGenerationSettings({
      ...current,
      passes: current.passes.map((pass) => pass.id === id ? { ...pass, density } : pass),
    })));
  const selectWorldSize = (worldSize) => startPreviewRedraw(() => setDraft((current) => normalizeGenerationSettings({ ...current, worldSize })));
  const setEnabled = (id, enabled) => startPreviewRedraw(() => setDraft((current) => normalizeGenerationSettings({
    ...current, passes: current.passes.map((pass) => pass.id === id ? { ...pass, enabled } : pass),
  })));
  const setMacroEnabled = (ids, enabled) => startPreviewRedraw(() => setDraft((current) => normalizeGenerationSettings({
    ...current, passes: current.passes.map((pass) => ids.has(pass.id) ? { ...pass, enabled } : pass),
  })));
  const macroCheckbox = (card) => {
    // Macro toggles intentionally use the complete card membership. A child
    // can belong to another realm than the active preview, but its setting
    // must still follow the macro checkbox.
    const children = card.featureIds.map((id) => draft.passes.find((pass) => pass.id === id)).filter(Boolean);
    const enabled = children.every((pass) => pass.enabled);
    return <GenerationEnabledCheckbox title={card.title} enabled={enabled} mixed={!enabled && children.some((pass) => pass.enabled)} onChange={() => setMacroEnabled(new Set(card.featureIds), !enabled)} />;
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
    startPreviewRedraw(() => setDraft(createDefaultGenerationSettings()));
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
            <button className="prompt_tab" type="button" role="tab" aria-selected="true">World Generation</button>
          </div>
          <button className="prompt_button window_close" type="button" aria-label="Close Procedural" onClick={onClose}>X</button>
        </div>
        <div className="prompt_body procedural_settings_body">
          <div className="procedural_settings_options">
            {previewLoading ? <div className="procedural_preview_blocker" role="status" aria-live="polite"><span>Loading</span></div> : null}
            <div className="procedural_settings_options_scroll">
              <h2>Procedural World Generation Passes</h2>
              <p className="gameplay_settings_hint">Set the density &amp; distribution to feed the system.<br /><span className="procedural_settings_notice">Some of these buttons apparently do nothing yet</span></p>
              <div className="quest_settings_list">
                <section className="quest_settings_card procedural_object_settings_card" aria-label="World Settings, pass 1">
                  <div className="procedural_object_settings_header">
                    <h3>1. World Settings</h3>
                    <span className="procedural_settings_description">Sets the size before terrain generation</span>
                  </div>
                  <div className="procedural_object_density_row">
                    <span>World Size</span>
                    <div className="procedural_density_controls procedural_object_density_controls" role="group" aria-label="World Size">
                      {WORLD_SIZE_LEVELS.map((worldSize) => (
                        <button key={worldSize} className={`prompt_button${draft.worldSize === worldSize ? " procedural_density_selected" : ""}`} type="button" aria-pressed={draft.worldSize === worldSize} title={WORLD_SIZE_DETAILS[worldSize]} onClick={() => selectWorldSize(worldSize)}>
                          {worldSize}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="procedural_object_density_row">
                    <span>Realm Count: 2</span>
                  </div>
                </section>
                {orderedPasses.filter((pass) => pass.order <= 6).map((pass) => {
                  const unavailable = !isPassAvailableInPreview(pass);
                  return <section key={pass.id} className={`quest_settings_card procedural_settings_card${unavailable ? " procedural_realm_unavailable" : ""}`} aria-label={`${pass.title}, pass ${pass.order + 1}`} aria-disabled={unavailable}>
                <h3>{pass.order + 1}. {pass.title}</h3>
                {pass.configurable === false ? <div className="procedural_density_controls procedural_density_controls_static"><span className="procedural_realm_scope procedural_realm_scope_static">Realms: {GENERATION_PASS_REALMS[pass.id]}</span><span className="procedural_no_settings">No Settings</span><GenerationEnabledCheckbox title={pass.title} enabled={pass.enabled} disabled={pass.required === true} onChange={() => setEnabled(pass.id, !pass.enabled)} /></div> : <div className="procedural_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                  <span className="procedural_realm_scope">Realms: {GENERATION_PASS_REALMS[pass.id]}</span>
                  {DENSITY_LEVELS.map((density) => (
                    <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                      {density}
                    </button>
                  ))}
                  <GenerationEnabledCheckbox title={pass.title} enabled={pass.enabled} disabled={pass.required === true} onChange={() => setEnabled(pass.id, !pass.enabled)} />
                </div>}
                <span className="procedural_settings_description">{GENERATION_PASS_DESCRIPTIONS[pass.id]}</span>
              </section>
                })}
                <section className="quest_settings_card procedural_object_settings_card" aria-label="Object Distribution, pass 8">
                  <div className="procedural_object_settings_header">
                    <h3>8. {objectCard.title}</h3>
                    <span className="procedural_settings_description">Controls objects</span>
                    <span className="procedural_realm_scope procedural_group_enabled">Realms: All{macroCheckbox(objectCard)}</span>
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
                        <GenerationEnabledCheckbox title={pass.title} enabled={pass.enabled} onChange={() => setEnabled(pass.id, !pass.enabled)} />
                      </div>
                    </div>
                  })}
                </section>
                <section className="quest_settings_card procedural_object_settings_card" aria-label="Civilization Placement, pass 9">
                  <div className="procedural_object_settings_header">
                    <h3>9. {civilizationCard.title}</h3>
                    <span className="procedural_settings_description">Controls Stairs, Doors, and Homes placement</span>
                    <span className="procedural_group_enabled">{macroCheckbox(civilizationCard)}</span>
                  </div>
                  {orderedPasses.filter((pass) => civilizationPassIds.has(pass.id)).map((pass) => {
                    const unavailable = !isPassAvailableInPreview(pass);
                    return <div key={pass.id} className={`procedural_object_density_row${unavailable ? " procedural_realm_unavailable" : ""}`} aria-disabled={unavailable}>
                      <span>{pass.title}{["civilization-doors", "civilization-homes"].includes(pass.id) ? ` · Realm: ${GENERATION_PASS_REALMS[pass.id]}` : ""}</span>
                      <div className="procedural_density_controls procedural_object_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                        {DENSITY_LEVELS.map((density) => (
                          <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                            {density}
                          </button>
                        ))}
                        <GenerationEnabledCheckbox title={pass.title} enabled={pass.enabled} onChange={() => setEnabled(pass.id, !pass.enabled)} />
                      </div>
                    </div>
                  })}
                </section>
                <section className="quest_settings_card procedural_object_settings_card" aria-label="Character Distribution, pass 10">
                  <div className="procedural_object_settings_header">
                    <h3>10. {characterCard.title}</h3>
                    <span className="procedural_settings_description">Controls character placement</span>
                    <span className="procedural_group_enabled">{macroCheckbox(characterCard)}</span>
                  </div>
                  {characterCard.featureIds.map((id) => orderedPasses.find((pass) => pass.id === id)).filter(Boolean).map((pass) => {
                    const unavailable = !isPassAvailableInPreview(pass);
                    return <div key={pass.id} className={`procedural_object_density_row${unavailable ? " procedural_realm_unavailable" : ""}`} aria-disabled={unavailable}>
                      <span>{pass.title.replace(" Spawner Distribution", "").replace(" Spawner", "")} · Realm: {GENERATION_PASS_REALMS[pass.id]}</span>
                      <div className="procedural_density_controls procedural_object_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                        {DENSITY_LEVELS.map((density) => (
                          <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                            {density}
                          </button>
                        ))}
                        <GenerationEnabledCheckbox title={pass.title} enabled={pass.enabled} onChange={() => setEnabled(pass.id, !pass.enabled)} />
                      </div>
                    </div>
                  })}
                </section>
                {orderedPasses.filter((pass) => pass.order > 6 && !objectPassIds.has(pass.id) && !civilizationPassIds.has(pass.id) && !characterPassIds.has(pass.id)).map((pass, index) => {
                  const unavailable = !isPassAvailableInPreview(pass);
                  return <section key={pass.id} className={`quest_settings_card procedural_settings_card${unavailable ? " procedural_realm_unavailable" : ""}`} aria-label={`${pass.title}, pass ${pass.order + 1}`} aria-disabled={unavailable}>
                <h3>{10 + index}. {pass.title}</h3>
                <div className="procedural_density_controls" role="group" aria-label={`${pass.title} density and distribution`}>
                  <span className="procedural_realm_scope">Realms: {GENERATION_PASS_REALMS[pass.id]}</span>
                  {DENSITY_LEVELS.map((density) => (
                    <button key={density} className={`prompt_button${pass.density === density ? " procedural_density_selected" : ""}`} type="button" aria-pressed={pass.density === density} title={GENERATION_DENSITY_DETAILS[pass.id][density]} disabled={unavailable} onClick={() => selectDensity(pass.id, density)}>
                      {density}
                    </button>
                  ))}
                  <GenerationEnabledCheckbox title={pass.title} enabled={pass.enabled} disabled={pass.required === true} onChange={() => setEnabled(pass.id, !pass.enabled)} />
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
                <button className="prompt_button" type="button" aria-pressed={previewRealm === "Underground"} onClick={() => startPreviewRedraw(() => setPreviewRealm((realm) => realm === "Overground" ? "Underground" : "Overground"))}>{previewRealm === "Overground" ? "Overworld" : "Underworld"}</button>
                <button className="prompt_button" type="button" aria-pressed={previewSeed === "0"} onClick={() => startPreviewRedraw(() => setPreviewSeed((seed) => seed === "random" ? "0" : "random"))}>{previewSeed === "random" ? "Seed=Random" : "Seed=0"}</button>
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
  const [cameraMode, setCameraMode] = useState(getStoredInitialCameraMode);
  const [zoom, setZoom] = useState(getStoredZoom);
  const [minimapZoom, setMinimapZoom] = useState(getStoredMinimapZoom);
  const [overgroundAmbient, setOvergroundAmbient] = useState(() => getStoredAmbientLight(overgroundAmbientStorageKey, 0.9));
  const [undergroundAmbient, setUndergroundAmbient] = useState(() => getStoredAmbientLight(undergroundAmbientStorageKey, 0.1));
  const [gpuLightPass, setGpuLightPass] = useState(() => getStoredBoolean(gpuLightPassStorageKey, true));
  const [playerGpuShadowBleedRange, setPlayerGpuShadowBleedRange] = useState(getStoredPlayerGpuShadowBleedRange);
  const [torchLightingIndex, setTorchLightingIndex] = useState(() => getStoredSourceIndex(torchLightingStorageKey, 1));
  const [playerLightingIndex, setPlayerLightingIndex] = useState(() => getStoredSourceIndex(playerLightingStorageKey, 4));
  const [torchShadowIndex, setTorchShadowIndex] = useState(() => getStoredSourceIndex(torchShadowStorageKey, 4));
  const [playerShadowIndex, setPlayerShadowIndex] = useState(() => getStoredSourceIndex(playerShadowStorageKey, 3));
  const [lightingWindowOpen, setLightingWindowOpen] = useState(false);
  const [pfxWindowOpen, setPfxWindowOpen] = useState(false);
  const [pfxSelection, setPfxSelection] = useState(PARTICLE_EFFECTS[0]?.name ?? null);
  const [pfxWindowPosition, setPfxWindowPosition] = useState(defaultPfxWindowPosition);
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
  const [changelogOpen, setChangelogOpen] = useState(false);
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
  const characterState = useSyncExternalStore(subscribeToCharacterState, getCharacterStateSnapshot, getCharacterStateSnapshot);
  const health = useSyncExternalStore(subscribeToHealth, getHealthSnapshot, getHealthSnapshot);
  const stamina = useSyncExternalStore(subscribeToStamina, getStaminaSnapshot, getStaminaSnapshot);
  const combatStats = useSyncExternalStore(subscribeToCombatStats, getCombatStatsSnapshot, getCombatStatsSnapshot);
  const experience = useSyncExternalStore(subscribeToExperience, getExperienceSnapshot, getExperienceSnapshot);
  const dialog = useSyncExternalStore(subscribeToDialog, getDialogSnapshot, getDialogSnapshot);
  const log = useSyncExternalStore(subscribeToLog, getLogSnapshot, getLogSnapshot);
  const playerDead = useSyncExternalStore(subscribeToPlayerDead, getPlayerDeadSnapshot, getPlayerDeadSnapshot);
  const playerRecoveryReady = useSyncExternalStore(subscribeToPlayerRecoveryReady, getPlayerRecoveryReadySnapshot, getPlayerRecoveryReadySnapshot);
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
        pfxWindowOpen && (() => setPfxWindowOpen(false)),
        (tutorialPhase === "initial" || tutorialPhase === "complete") && (() => setTutorialPhase("finished")),
      ].find(Boolean);
      if (!closeAction) return;

      event.preventDefault();
      event.stopPropagation();
      closeAction();
    };

    window.addEventListener("keydown", closeTopmostWindow, true);
    return () => window.removeEventListener("keydown", closeTopmostWindow, true);
  }, [argumentsOpen, asciiPaletteOpen, gameplaySettingsOpen, lightingWindowOpen, pfxWindowOpen, proceduralSettingsOpen, tutorialPhase]);

  useEffect(() => {
    if (!playerDead) return undefined;
    const blockDeadRunInput = (event) => {
      const target = event.target;
      const isUiControl = target instanceof HTMLElement && target.closest("button, input, select, textarea, [contenteditable=true]");
      const isGameplayKey = event.type === "keydown" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", " ", "Space", "Shift"].includes(event.key);
      const isCanvasPointer = event.type === "pointerdown" && target instanceof HTMLElement && target.closest("#game_canvas");
      if ((!isGameplayKey || isUiControl) && !isCanvasPointer) return;
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
    sendPfxSelectionSnapshot(pfxSelection);
  }, [pfxSelection]);

  useEffect(() => {
    sendPfxPlacementEnabled(pfxWindowOpen);
    return () => sendPfxPlacementEnabled(false);
  }, [pfxWindowOpen]);

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
          <ExtractedCharacterDetails
            gold={gold}
            keys={keys}
            slots={characterState.slots}
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
            <SettingTooltipTarget description={settingsHelp.changelog} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="changelog_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.changelog} tabIndex={-1} onClick={() => setChangelogOpen(true)}>
                Changelog
              </button>
            </SettingTooltipTarget>
            <span className="corner_body windows_control_separator" aria-hidden="true">/</span>
            <SettingTooltipTarget description={settingsHelp.gameplaySettings} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="gameplay_settings_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.gameplaySettings} tabIndex={-1} onClick={() => setGameplaySettingsOpen(true)}>
                Gameplay
              </button>
            </SettingTooltipTarget>
          </div>
          <div className="windows_control_row">
            <SettingTooltipTarget description={settingsHelp.lighting} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="lighting_window_toggle" className="corner_body settings_option" type="button" aria-expanded={lightingWindowOpen} aria-controls="lighting_window" aria-description={settingsHelp.lighting} tabIndex={-1} onClick={() => setLightingWindowOpen((isOpen) => !isOpen)}>
                Lighting
              </button>
            </SettingTooltipTarget>
            <span className="corner_body windows_control_separator" aria-hidden="true">/</span>
            <SettingTooltipTarget description={settingsHelp.proceduralSettings} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button id="procedural_settings_toggle" className="corner_body settings_option" type="button" aria-description={settingsHelp.proceduralSettings} tabIndex={-1} onClick={() => setProceduralSettingsOpen(true)}>
                Procedural
              </button>
            </SettingTooltipTarget>
            <button id="pfx_window_toggle" className="corner_body settings_option" type="button" aria-expanded={pfxWindowOpen} aria-controls="pfx_window" onClick={() => setPfxWindowOpen((isOpen) => !isOpen)}>PFX</button>
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
        <ExtractedLightingWindow
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
          SettingTooltipTarget={SettingTooltipTarget}
          settingsHelp={settingsHelp}
          ambientStep={AMBIENT_LIGHT_STEP}
          getWindowPosition={getLightingWindowPosition}
          showCloseButton
          showBackdrop
          closeOnBackdropClick
        />
      ) : null}
      {pfxWindowOpen ? <PfxWindow
        position={pfxWindowPosition}
        selected={pfxSelection}
        onSelect={setPfxSelection}
        onPositionChange={setPfxWindowPosition}
        onClose={() => setPfxWindowOpen(false)}
        getWindowPosition={getLightingWindowPosition}
      /> : null}
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
      {playerRecoveryReady ? <DeathWindow checkpointActive={checkpoint.active} onRestartFromCheckpoint={restartFromCheckpoint} onRestartGame={restartGame} /> : null}
      <DialogWindow dialog={dialog} />
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
      {argumentsOpen ? <ArgumentsWindow onClose={() => setArgumentsOpen(false)} randomSeed={randomSeed} argumentBlocks={argumentBlocks} onApplyArgument={applyUrlArgument} /> : null}
      {gameplaySettingsOpen ? (
        <GameplaySettingsWindow
          quest={quest}
          defaultQuestId={defaultQuestId}
          onSelectQuest={selectDefaultQuest}
          onClose={() => setGameplaySettingsOpen(false)}
        />
      ) : null}
      {changelogOpen ? <ChangelogWindow onClose={() => setChangelogOpen(false)} repositoryUrl={repositoryUrl} featurePaths={changelogFeaturePaths} /> : null}
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
