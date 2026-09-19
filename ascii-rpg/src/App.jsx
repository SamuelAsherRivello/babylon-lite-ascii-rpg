import { Component, useEffect, useState, useSyncExternalStore } from "react";
import { HexColorPicker } from "react-colorful";
import versionText from "../../version.txt?raw";
import { commitPalette, getPalette, subscribeToPalette } from "./palette-store.js";
import {
  filterPaletteEntries,
  DEFAULT_PALETTE_ALPHA,
  DEFAULT_PALETTE_COLOR,
  getPaletteEntryId,
  PALETTE_WARNING_KEY,
  sortPaletteEntries,
} from "./palette.js";
import { withUrlArgument } from "./url-arguments.js";
import { FLOOR_GLYPH, PLAYER_GLYPH, WALL_GLYPH } from "./world-grid.js";

const fullscreenStorageKey = "babylon-lite-ascii-rpg.fullscreen";
const repositoryUrl = "https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg";
const uiMarginPixels = 20;
const mapGlyphs = new Set([WALL_GLYPH, FLOOR_GLYPH, PLAYER_GLYPH]);
const paletteEditorWidth = 286;
const paletteEditorHeight = 340;
const paletteEditorMargin = 16;
const defaultPaletteViewState = { filter: "all", sortBy: "index", sortDirection: "ascending" };

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

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" fill="#f5f5f5">
      <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.82c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.4A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
    </svg>
  );
}

export class PromptWindow extends Component {
  state = {
    selectedEntryId: null,
    draft: null,
    anchor: null,
    warningVisible: false,
    hideWarning: false,
  };

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
      draft: { color: entry.color, alpha: entry.alpha },
      anchor: { top: bounds.top, left: bounds.right },
    });
  };

  updateColor = (color) => this.setState((state) => ({ draft: { ...state.draft, color } }));

  updateAlpha = (event) => this.setState((state) => ({
    draft: { ...state.draft, alpha: Number(event.target.value) },
  }));

  resetEdit = () => this.setState({
    draft: { color: DEFAULT_PALETTE_COLOR, alpha: DEFAULT_PALETTE_ALPHA },
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

  render() {
    const { onClose, palette, viewState } = this.props;
    const {
      selectedEntryId,
      draft,
      anchor,
      warningVisible,
      hideWarning,
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
            <h1 id="ascii_palette_title" className="prompt_title">Ascii Palette</h1>
            <button
              className="prompt_button window_close"
              type="button"
              aria-label="Close Ascii Palette"
              onClick={onClose}
            >
              X
            </button>
          </div>
          <div className="palette_controls" aria-label="Palette filters and sorting">
            <div className="palette_filter_group" aria-label="Palette filters">
              {["all", "in-maps", "customized"].map((filterValue) => (
                <button
                  className="palette_control_button"
                  type="button"
                  key={filterValue}
                  aria-pressed={filter === filterValue}
                  onClick={() => this.setFilter(filterValue)}
                >
                  {filterValue === "in-maps" ? "InMaps" : filterValue[0].toUpperCase() + filterValue.slice(1)}
                </button>
              ))}
            </div>
            <div className="palette_sort_group" aria-label="Palette sorting">
              <button
                className="palette_control_button"
                type="button"
                aria-label={`Sort by index ${sortBy === "index" ? sortDirection : "ascending"}`}
                aria-pressed={sortBy === "index"}
                onClick={() => this.toggleSort("index")}
              >
                #
              </button>
              <button
                className="palette_control_button"
                type="button"
                aria-label={`Sort alphabetically ${sortBy === "alphabet" ? sortDirection : "ascending"}`}
                aria-pressed={sortBy === "alphabet"}
                onClick={() => this.toggleSort("alphabet")}
              >
                Abc
              </button>
            </div>
          </div>
          <div className="palette_grid">
            {visibleEntries.map((entry) => {
              const entryId = getPaletteEntryId(entry);
              return (
                <button
                  className="palette_cell"
                  key={entryId}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    this.selectEntry(entry, event);
                  }}
                >
                  <span className="palette_index">{entry.code ?? entry.unicode}</span>
                  <span className="palette_glyph" style={{ color: entry.color, opacity: entry.alpha }}>
                    {entry.glyph}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedEntry && draft && editorPosition ? (
            <div
              className="palette_editor"
              style={{ top: `${editorPosition.top}px`, left: `${editorPosition.left}px` }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="palette_preview" style={{ color: draft.color, opacity: draft.alpha }}>
                {selectedEntry.glyph}
              </div>
              <HexColorPicker color={draft.color} onChange={this.updateColor} />
              <label className="palette_alpha_control">
                Alpha
                <input type="range" min="0" max="1" step="0.01" value={draft.alpha} onChange={this.updateAlpha} />
                <span>{draft.alpha.toFixed(2)}</span>
              </label>
              <div className="palette_editor_actions">
                <button type="button" onClick={this.confirmEdit}>Confirm</button>
                <button type="button" onClick={this.resetEdit}>Reset</button>
                <button type="button" onClick={this.cancelEdit}>Cancel</button>
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
    value: "value",
    example: "?randomSeed=value",
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
  const [fullscreenPreferred, setFullscreenPreferred] = useState(() => {
    return localStorage.getItem(fullscreenStorageKey) === "true";
  });
  const [asciiPaletteOpen, setAsciiPaletteOpen] = useState(false);
  const [argumentsOpen, setArgumentsOpen] = useState(false);
  const [paletteError, setPaletteError] = useState("");
  const [paletteViewState, setPaletteViewState] = useState(defaultPaletteViewState);
  const palette = useSyncExternalStore(subscribeToPalette, getPalette, getPalette);

  const versionNumber = versionText.trim().replace(/^version=/, "").replace(/^v/, "");

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

  const commitPaletteEntry = async (entryId, draft) => {
    const nextPalette = palette.map((entry) =>
      getPaletteEntryId(entry) === entryId ? { ...entry, ...draft } : entry,
    );
    try {
      setPaletteError("");
      await commitPalette(nextPalette);
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
      </div>
      <div className="corner corner_top_right">
        <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label="View the repository on GitHub" tabIndex={-1}>
          <GitHubMark />
        </a>
      </div>
      <div className="corner corner_bottom_left">
        <section id="settings" aria-labelledby="settings_title">
          <div id="settings_title" className="corner_title">
            Settings
          </div>
          <button
            id="fullscreen_toggle"
            className="corner_body settings_option"
            type="button"
            aria-pressed={fullscreenPreferred}
            tabIndex={-1}
            onClick={toggleFullscreen}
          >
            <span>Fullscreen</span>
            <span id="fullscreen_checkbox" aria-hidden="true">
              {fullscreenPreferred ? "☑" : "☐"}
            </span>
          </button>
          <button
            id="ascii_palette_toggle"
            className="corner_body settings_option"
            type="button"
            tabIndex={-1}
            onClick={() => setAsciiPaletteOpen(true)}
          >
            Ascii Palette
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
      </div>
      <div className="corner corner_bottom_right">
        <span id="version" className="corner_body">
          v{versionNumber}
        </span>
      </div>
      {asciiPaletteOpen ? (
        <PromptWindow
          palette={palette}
          viewState={paletteViewState}
          onViewStateChange={setPaletteViewState}
          error={paletteError}
          onCommit={commitPaletteEntry}
          onClose={() => setAsciiPaletteOpen(false)}
        />
      ) : null}
      {argumentsOpen ? <ArgumentsWindow onClose={() => setArgumentsOpen(false)} /> : null}
    </>
  );
}
