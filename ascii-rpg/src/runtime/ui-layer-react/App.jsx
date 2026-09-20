import { Component, Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
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
import {
  filterPaletteEntries,
  DEFAULT_PALETTE_COLOR,
  getPaletteGroup,
  getPaletteGroupLabel,
  getPaletteEntryId,
  PALETTE_WARNING_KEY,
  sortPaletteEntries,
} from "../bridge-layer/palette.js";
import { withUrlArgument } from "./url-arguments.js";
import {
  getTimeSnapshot,
  sendAmbientLightSnapshot,
  sendCameraModeSnapshot,
  sendGpuLightPassSnapshot,
  sendMinimapSnapshot,
  sendPlayerGpuShadowBleedRangeSnapshot,
  sendPlayerLightingSnapshot,
  sendPlayerShadowSnapshot,
  sendPaletteSnapshot,
  sendTorchLightingSnapshot,
  sendTorchShadowSnapshot,
  sendZoomSnapshot,
  subscribeToTime,
} from "../bridge-layer/game-bridge.js";
import {
  CAMERA_MODE_LABELS,
  CAMERA_STORAGE_KEY,
  DEFAULT_CAMERA_MODE,
  getNextCameraMode,
  normalizeCameraMode,
} from "../bridge-layer/camera.js";
import { formatWorldTime } from "../game-layer-babylon-lite/systems/time-system.js";
import {
  AMBIENT_LIGHT_STEP,
  LIGHTING_PROFILES,
  LIGHTING_SOURCE_STATES,
  SHADOW_PROFILES,
  PLAYER_GPU_SHADOW_BLEED_RANGES,
} from "../game-layer-babylon-lite/lighting.js";
import {
  DEEP_WATER_GLYPH,
  FLOOR_GLYPH,
  MEDIUM_WATER_GLYPH,
  PLAYER_GLYPH,
  SHALLOW_WATER_GLYPH,
  WALL_GLYPH,
} from "../game-layer-babylon-lite/systems/world-system.js";

const fullscreenStorageKey = "babylon-lite-ascii-rpg.fullscreen";
const showUiStorageKey = "babylon-lite-ascii-rpg.show-ui";
const zoomStorageKey = "babylon-lite-ascii-rpg.zoom";
const ambientLightStorageKey = "babylon-lite-ascii-rpg.ambient-light";
const torchLightingStorageKey = "babylon-lite-ascii-rpg.torch-lighting";
const playerLightingStorageKey = "babylon-lite-ascii-rpg.player-lighting";
const torchShadowStorageKey = "babylon-lite-ascii-rpg.torch-shadow";
const playerShadowStorageKey = "babylon-lite-ascii-rpg.player-shadow";
const gpuLightPassStorageKey = "babylon-lite-ascii-rpg.gpu-light-pass";
const playerGpuShadowBleedRangeStorageKey = "babylon-lite-ascii-rpg.player-gpu-shadow-bleed-range";
const minimapStorageKey = "babylon-lite-ascii-rpg.minimap";
const lightingWindowPositionStorageKey = "babylon-lite-ascii-rpg.lighting-window-position";
const minZoom = 1;
const maxZoom = 10;
const defaultZoom = 5;
const repositoryUrl = "https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg";
const uiMarginPixels = 20;
const mapGlyphs = new Set([
  WALL_GLYPH,
  FLOOR_GLYPH,
  PLAYER_GLYPH,
  SHALLOW_WATER_GLYPH,
  MEDIUM_WATER_GLYPH,
  DEEP_WATER_GLYPH,
]);
const paletteEditorWidth = 286;
const paletteEditorHeight = 340;
const paletteEditorMargin = 16;
const lightingWindowMargin = 12;
const defaultLightingWindowPosition = { left: 252, top: 52 };
const defaultPaletteViewState = { filter: "all", sortBy: "index", sortDirection: "ascending" };
const lightingValueHelp = "R Radius · M Maximum · F Falloff";
const shadowValueHelp = "O Occlusion · B Bleed";
const ambientValueHelp = "0 dark · 1 bright";
const settingsHelp = Object.freeze({
  fullscreen: "Toggle fullscreen.",
  showUi: "Show or hide the HUD.",
  lighting: "Open lighting controls.",
  closeLighting: "Close lighting controls.",
  gpuLightPass: "Toggle soft GPU light glow.",
  minimap: "Show or hide the exploration minimap.",
  playerGpuShadowBleedRange: "Cycle the bounded player shadow edge range in grid cells.",
  camera: "Cycle camera mode.",
  torchLighting: `Cycle torch light. ${lightingValueHelp}`,
  playerLighting: `Cycle player light. ${lightingValueHelp}`,
  torchShadow: `Cycle torch shadows. ${shadowValueHelp}`,
  playerShadow: `Cycle player shadows. ${shadowValueHelp}`,
  ambientIncrease: `Brighten overall light. ${ambientValueHelp}`,
  ambientDecrease: `Dim overall light. ${ambientValueHelp}`,
  zoomIn: "Make map glyphs larger.",
  zoomOut: "Make map glyphs smaller.",
  reset: "Clear local storage and reload.",
});

function getStoredZoom() {
  const storedZoom = Number.parseInt(localStorage.getItem(zoomStorageKey), 10);
  return Number.isInteger(storedZoom) ? Math.min(maxZoom, Math.max(minZoom, storedZoom)) : defaultZoom;
}

function getStoredBoolean(storageKey, defaultValue) {
  const storedValue = localStorage.getItem(storageKey);
  return storedValue === null ? defaultValue : storedValue === "true";
}

function getStoredAmbientLight() {
  const stored = Number.parseFloat(localStorage.getItem(ambientLightStorageKey));
  return Number.isFinite(stored) ? Math.min(1, Math.max(0, stored)) : 0.6;
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

export function getPaletteEditorPosition(anchor, viewport = { width: window.innerWidth, height: window.innerHeight }) {
  const availableHeight = Math.max(0, viewport.height - paletteEditorMargin * 2);
  const editorHeight = Math.min(paletteEditorHeight, availableHeight);
  const maxLeft = Math.max(paletteEditorMargin, viewport.width - paletteEditorWidth - paletteEditorMargin);
  const maxTop = Math.max(paletteEditorMargin, viewport.height - editorHeight - paletteEditorMargin);
  const preferredTop = anchor.top + editorHeight <= viewport.height - paletteEditorMargin
    ? anchor.top
    : anchor.top - editorHeight - paletteEditorMargin;

  return {
    top: Math.min(Math.max(preferredTop, paletteEditorMargin), maxTop),
    left: Math.min(Math.max(anchor.left + 12, paletteEditorMargin), maxLeft),
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

function SettingTooltipTarget({ description, onShow, onHide, children }) {
  return (
    <span
      className="setting_tooltip_target"
      onPointerEnter={(event) => onShow(description, event.currentTarget)}
      onPointerLeave={onHide}
      onFocus={(event) => onShow(description, event.currentTarget)}
      onBlur={onHide}
    >
      {children}
    </span>
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
  ambientLight,
  onAmbientLightChange,
  onShowTooltip,
  onHideTooltip,
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
    <section
      ref={windowRef}
      id="lighting_window"
      className="lighting_window"
      aria-labelledby="lighting_window_title"
      style={position}
    >
      <div
        className="lighting_window_titlebar"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div id="lighting_window_title" className="corner_title">Lighting</div>
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
      </div>
      <div className="lighting_window_body">
        <div id="ambient_light_control" className="corner_body zoom_control" aria-label="Ambient">
          <span>Ambient</span>
          <SettingTooltipTarget description={settingsHelp.ambientIncrease} onShow={onShowTooltip} onHide={onHideTooltip}>
            <button type="button" aria-label="Increase ambient light" aria-description={settingsHelp.ambientIncrease} onClick={() => onAmbientLightChange(AMBIENT_LIGHT_STEP)} disabled={ambientLight >= 1}>+</button>
          </SettingTooltipTarget>
          <span aria-live="polite">{ambientLight.toFixed(1)}</span>
          <SettingTooltipTarget description={settingsHelp.ambientDecrease} onShow={onShowTooltip} onHide={onHideTooltip}>
            <button type="button" aria-label="Decrease ambient light" aria-description={settingsHelp.ambientDecrease} onClick={() => onAmbientLightChange(-AMBIENT_LIGHT_STEP)} disabled={ambientLight <= 0}>-</button>
          </SettingTooltipTarget>
        </div>
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
  );
}

export class PromptWindow extends Component {
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
      draft: { color: entry.color },
      anchor: { top: bounds.top, left: bounds.right },
    });
  };

  updateColor = (color) => this.setState((state) => ({ draft: { ...state.draft, color } }));

  resetEdit = () => this.setState({
    draft: { color: DEFAULT_PALETTE_COLOR },
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
    const editorPosition = anchor ? getPaletteEditorPosition(anchor) : null;
    const visibleEntries = sortPaletteEntries(
      filterPaletteEntries(palette, filter, mapGlyphs),
      sortBy,
      sortDirection,
    );

    return (
      <div className="prompt_window" role="presentation">
        <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
        <section
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
                    <span className="palette_glyph" style={{ color: entry.color }}>
                      {entry.glyph}
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>
          {selectedEntry && draft && editorPosition ? (
            <div
              className="palette_editor"
              style={{ top: `${editorPosition.top}px`, left: `${editorPosition.left}px` }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="palette_preview" style={{ color: draft.color }}>
                {selectedEntry.glyph}
              </div>
              <HexColorPicker color={draft.color} onChange={this.updateColor} />
              <div className="palette_editor_actions">
                <button type="button" onClick={this.confirmEdit}>Confirm</button>
                <button type="button" onClick={this.resetEdit}>Reset</button>
                <button type="button" onClick={this.cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : null}
          </> : (
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
              <div className="palette_editor_actions">
                <button type="button" onClick={this.confirmFontEdit}>Confirm</button>
                <button type="button" onClick={this.resetFontDraft}>Reset</button>
                <button type="button" onClick={this.cancelFontEdit}>Cancel</button>
              </div>
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
    value: "123",
    example: "?randomSeed=123",
    description: "fixes the generated level seed.",
  },
];

function applyUrlArgument(name, value) {
  const nextUrl = withUrlArgument(window.location.href, name, value);
  window.location.assign(nextUrl.href);
}

export function ArgumentsWindow({ onClose }) {
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
          {argumentBlocks.map((argument) => (
            <section className="argument_block" key={argument.parameter}>
              <h2>{argument.name}</h2>
              <ul className="window_list">
                <li>
                  <button
                    className="argument_code"
                    type="button"
                    onClick={() => applyUrlArgument(argument.parameter, argument.value)}
                  >
                    <code>{argument.example}</code>
                  </button>{" "}
                  {argument.description}
                </li>
                <li>Without it, each new level receives a fresh random seed.</li>
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [settingTooltip, setSettingTooltip] = useState(null);
  const [settingTooltipPosition, setSettingTooltipPosition] = useState({ top: 0, left: 0 });
  const settingTooltipRef = useRef(null);
  const [showHud, setShowHud] = useState(() => getStoredBoolean(showUiStorageKey, true));
  const [fullscreenPreferred, setFullscreenPreferred] = useState(() => {
    return localStorage.getItem(fullscreenStorageKey) === "true";
  });
  const [cameraMode, setCameraMode] = useState(() => normalizeCameraMode(localStorage.getItem(CAMERA_STORAGE_KEY)));
  const [zoom, setZoom] = useState(getStoredZoom);
  const [ambientLight, setAmbientLight] = useState(getStoredAmbientLight);
  const [gpuLightPass, setGpuLightPass] = useState(() => getStoredBoolean(gpuLightPassStorageKey, true));
  const [minimap, setMinimap] = useState(() => getStoredBoolean(minimapStorageKey, true));
  const [playerGpuShadowBleedRange, setPlayerGpuShadowBleedRange] = useState(getStoredPlayerGpuShadowBleedRange);
  const [torchLightingIndex, setTorchLightingIndex] = useState(() => getStoredSourceIndex(torchLightingStorageKey, 1));
  const [playerLightingIndex, setPlayerLightingIndex] = useState(() => getStoredSourceIndex(playerLightingStorageKey, 4));
  const [torchShadowIndex, setTorchShadowIndex] = useState(() => getStoredSourceIndex(torchShadowStorageKey, 4));
  const [playerShadowIndex, setPlayerShadowIndex] = useState(() => getStoredSourceIndex(playerShadowStorageKey, 3));
  const [lightingWindowOpen, setLightingWindowOpen] = useState(false);
  const [lightingWindowPosition, setLightingWindowPosition] = useState(getStoredLightingWindowPosition);
  const [asciiPaletteOpen, setAsciiPaletteOpen] = useState(false);
  const [argumentsOpen, setArgumentsOpen] = useState(false);
  const [paletteError, setPaletteError] = useState("");
  const [paletteViewState, setPaletteViewState] = useState(defaultPaletteViewState);
  const palette = useSyncExternalStore(subscribeToPalette, getPalette, getPalette);
  const fontId = useSyncExternalStore(subscribeToFont, getFontId, getFontId);
  const savedFontId = useSyncExternalStore(subscribeToFont, getSavedFontId, getSavedFontId);
  const worldTime = useSyncExternalStore(subscribeToTime, getTimeSnapshot, getTimeSnapshot);
  const [fps, setFps] = useState(0);

  const versionNumber = versionText.trim().replace(/^version=/, "").replace(/^v/, "");

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
      setSettingTooltipPosition({
        left: Math.min(Math.max(anchor.left, gap), leftLimit),
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

  useEffect(() => {
    localStorage.setItem(showUiStorageKey, showHud ? "true" : "false");
  }, [showHud]);

  useEffect(() => {
    localStorage.setItem(CAMERA_STORAGE_KEY, cameraMode);
    sendCameraModeSnapshot(cameraMode);
  }, [cameraMode]);

  useEffect(() => {
    localStorage.setItem(zoomStorageKey, String(zoom));
    sendZoomSnapshot(zoom);
  }, [zoom]);

  useEffect(() => {
    localStorage.setItem(ambientLightStorageKey, String(ambientLight));
    sendAmbientLightSnapshot(ambientLight);
  }, [ambientLight]);

  useEffect(() => {
    localStorage.setItem(gpuLightPassStorageKey, gpuLightPass ? "true" : "false");
    sendGpuLightPassSnapshot(gpuLightPass);
  }, [gpuLightPass]);

  useEffect(() => {
    localStorage.setItem(minimapStorageKey, minimap ? "true" : "false");
    sendMinimapSnapshot(minimap);
  }, [minimap]);

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
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (!document.fullscreenElement) {
          setFullscreenPreferred(true);
        }
      }
    } catch {
      setFullscreenPreferred(false);
    }
  };

  const toggleHud = () => {
    setSettingTooltip(null);
    setShowHud((currentShowHud) => !currentShowHud);
  };

  const changeZoom = (amount) => {
    setZoom((currentZoom) => {
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, currentZoom + amount));
      if (nextZoom !== currentZoom) sendZoomSnapshot(nextZoom);
      return nextZoom;
    });
  };

  const cycleCameraMode = () => setCameraMode((current) => getNextCameraMode(current));

  const changeAmbientLight = (amount) => {
    setAmbientLight((current) => Math.min(1, Math.max(0, Math.round((current + amount) * 100) / 100)));
  };

  const cycleLighting = (setter) => {
    setter((currentIndex) => (currentIndex + 1) % LIGHTING_SOURCE_STATES.length);
  };
  const cyclePlayerGpuShadowBleedRange = () => setPlayerGpuShadowBleedRange((current) => {
    const index = PLAYER_GPU_SHADOW_BLEED_RANGES.indexOf(current);
    return PLAYER_GPU_SHADOW_BLEED_RANGES[(index + 1) % PLAYER_GPU_SHADOW_BLEED_RANGES.length];
  });

  const resetSettings = () => {
    localStorage.clear();
    window.location.reload();
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
      <div className="corner corner_top_left">
        <div id="project_title" className="corner_body">
          Ascii RPG
        </div>
        <div id="time" className="corner_body">
          Time: {formatWorldTime(worldTime)}
        </div>
      </div>
      {showHud ? (
        <div className="corner corner_top_right" aria-hidden="true"></div>
      ) : null}
      <div className="corner corner_bottom_left">
        {showHud ? <>
          <a className="project_link" href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label="View the repository on GitHub" tabIndex={-1}>
            <GitHubMark />
          </a>
          <section className="hud_section" id="windows" aria-labelledby="windows_title">
          <div id="windows_title" className="corner_title">
            Windows - 1
          </div>
          <button
            id="ascii_palette_toggle"
            className="corner_body settings_option"
            type="button"
            tabIndex={-1}
            onClick={() => setAsciiPaletteOpen(true)}
          >
            Ascii Settings
          </button>
          <button
            id="arguments_toggle"
            className="corner_body settings_option"
            type="button"
            tabIndex={-1}
            onClick={() => setArgumentsOpen(true)}
          >
            Arguments
          </button>
        </section>
        <section className="hud_section" id="windows_2" aria-labelledby="windows_2_title">
          <div id="windows_2_title" className="corner_title">
            Windows - 2
          </div>
          <SettingTooltipTarget description={settingsHelp.lighting} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button
              id="lighting_window_toggle"
              className="corner_body settings_option"
              type="button"
              aria-expanded={lightingWindowOpen}
              aria-controls="lighting_window"
              aria-description={settingsHelp.lighting}
              tabIndex={-1}
              onClick={() => setLightingWindowOpen((isOpen) => !isOpen)}
            >
              Lighting
            </button>
          </SettingTooltipTarget>
        </section>
        <section className="hud_section" id="stats" aria-labelledby="stats_title">
          <div id="stats_title" className="corner_title">
            Stats
          </div>
          <div id="fps" className="corner_body">
            FPS: {fps}
          </div>
        </section>
        <section className="hud_section" id="settings" aria-labelledby="settings_title">
          <div id="settings_title" className="corner_title">
            Settings
          </div>
          <SettingTooltipTarget description={settingsHelp.fullscreen} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button
              id="fullscreen_toggle"
              className="corner_body settings_option"
              type="button"
              aria-pressed={fullscreenPreferred}
              aria-description={settingsHelp.fullscreen}
              tabIndex={-1}
              onClick={toggleFullscreen}
            >
              <span>Fullscreen</span>
              <span id="fullscreen_checkbox" aria-hidden="true">
                {fullscreenPreferred ? "☑" : "☐"}
              </span>
            </button>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.showUi} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button
              id="show_ui_toggle"
              className="corner_body settings_option"
              type="button"
              aria-pressed={showHud}
              aria-description={settingsHelp.showUi}
              tabIndex={-1}
              onClick={toggleHud}
            >
              <span>Show UI</span>
              <span id="show_ui_checkbox" aria-hidden="true">
                {showHud ? "☑" : "☐"}
              </span>
            </button>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.minimap} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button
              id="minimap_toggle"
              className="corner_body settings_option"
              type="button"
              aria-pressed={minimap}
              aria-description={settingsHelp.minimap}
              tabIndex={-1}
              onClick={() => setMinimap((enabled) => !enabled)}
            >
              <span>Minimap</span>
              <span id="minimap_checkbox" aria-hidden="true">
                {minimap ? "☑" : "☐"}
              </span>
            </button>
          </SettingTooltipTarget>
          <SettingTooltipTarget description={settingsHelp.camera} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button
              id="camera_mode_toggle"
              className="corner_body settings_option"
              type="button"
              aria-label="Camera mode"
              aria-description={settingsHelp.camera}
              tabIndex={-1}
              onClick={cycleCameraMode}
            >
              {CAMERA_MODE_LABELS[cameraMode] ?? CAMERA_MODE_LABELS[DEFAULT_CAMERA_MODE]}
            </button>
          </SettingTooltipTarget>
          <div id="zoom_control" className="corner_body zoom_control" aria-label="Zoom">
            <span>Zoom</span>
            <SettingTooltipTarget description={settingsHelp.zoomIn} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button type="button" aria-label="Zoom in" aria-description={settingsHelp.zoomIn} onClick={() => changeZoom(1)} disabled={zoom >= maxZoom}>+</button>
            </SettingTooltipTarget>
            <span aria-live="polite">{zoom}</span>
            <SettingTooltipTarget description={settingsHelp.zoomOut} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
              <button type="button" aria-label="Zoom out" aria-description={settingsHelp.zoomOut} onClick={() => changeZoom(-1)} disabled={zoom <= minZoom}>-</button>
            </SettingTooltipTarget>
          </div>
          <SettingTooltipTarget description={settingsHelp.reset} onShow={showSettingTooltip} onHide={hideSettingTooltip}>
            <button
              id="reset_settings"
              className="corner_body settings_option"
              type="button"
              aria-label="Reset Settings"
              aria-description={settingsHelp.reset}
              tabIndex={-1}
              onClick={resetSettings}
            >
              Reset Settings
            </button>
          </SettingTooltipTarget>
        </section>
        </> : (
          <button
            id="show_ui_toggle"
            className="corner_body settings_option"
            type="button"
            aria-pressed={showHud}
            aria-description={settingsHelp.showUi}
            tabIndex={-1}
            onClick={toggleHud}
          >
            <span>Show UI</span>
            <span id="show_ui_checkbox" aria-hidden="true">
              {showHud ? "☑" : "☐"}
            </span>
          </button>
        )}
      </div>
      {showHud ? (
        <div className="corner corner_bottom_right">
          <span id="version" className="corner_body">
            v{versionNumber}
          </span>
        </div>
      ) : null}
      {showHud && lightingWindowOpen ? (
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
          ambientLight={ambientLight}
          onAmbientLightChange={changeAmbientLight}
          onShowTooltip={showSettingTooltip}
          onHideTooltip={hideSettingTooltip}
        />
      ) : null}
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
      {argumentsOpen ? <ArgumentsWindow onClose={() => setArgumentsOpen(false)} /> : null}
    </>
  );
}
