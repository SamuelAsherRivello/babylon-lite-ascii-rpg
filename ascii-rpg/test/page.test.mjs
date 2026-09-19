import { readFile } from "node:fs/promises";
import test from "node:test";
import viteConfig from "../../vite.config.js";

const appRoot = new URL("../", import.meta.url);

test("builds for the GitHub Pages project path", () => {
  if (viteConfig.base !== "/babylon-lite-ascii-rpg/") {
    throw new Error("The GitHub Pages build must use the repository project path as its Vite base.");
  }
});

test("documents the plain safe-area template", async () => {
  const page = await readFile(new URL("index.html", appRoot), "utf8");
  const app = await readFile(new URL("src/App.jsx", appRoot), "utf8");
  const styles = await readFile(new URL("src/style.css", appRoot), "utf8");

  if (!page.includes("<title>Ascii RPG</title>")) {
    throw new Error("The browser title must identify the project.");
  }
  if (!page.includes('id="content_layer"')) {
    throw new Error("The page needs a dedicated application content layer.");
  }
  if (!page.includes('id="ui_layer"')) {
    throw new Error("The page needs a separate HTML UI layer.");
  }
  if (!page.includes('src="/src/main.jsx"')) {
    throw new Error("The page must load the React application module.");
  }
  if (!app.includes("const uiMarginPixels = 20")) {
    throw new Error("The UI margin must be set from a single 20px target.");
  }
  if (!app.includes("--ui-margin-x") || !app.includes("--ui-margin-y")) {
    throw new Error("The UI margin must use separate percentage values for horizontal and vertical sides.");
  }
  if (!app.includes("window.innerWidth") || !app.includes("window.innerHeight")) {
    throw new Error("The UI margin percentages must be calculated from the viewport dimensions.");
  }
  if (!app.includes('window.addEventListener("resize", syncUiMargin)')) {
    throw new Error("The UI margin percentages must stay current when the viewport resizes.");
  }
  if (!styles.includes("inset: var(--ui-margin-y, 20px) var(--ui-margin-x, 20px)")) {
    throw new Error("The page must apply percentage-based UI margins with a 20px fallback.");
  }
  if (!styles.includes(".corner {")) {
    throw new Error("The page must define a reusable corner style.");
  }
  for (const cornerClass of ["corner_top_left", "corner_top_right", "corner_bottom_left", "corner_bottom_right"]) {
    if (!app.includes(`className="corner ${cornerClass}"`)) {
      throw new Error(`The page must include a ${cornerClass} corner instance.`);
    }
  }
  if (!app.includes('id="version"')) {
    throw new Error("The page must show the version footer.");
  }
  if (!app.includes("v{versionNumber}")) {
    throw new Error("The version corner must display versions in v0.0.0 format.");
  }
  if (!app.includes("Settings")) {
    throw new Error("The page must include a lower-left Settings section.");
  }
  if (!styles.includes(".corner_body") || !styles.includes(".corner_title")) {
    throw new Error("The page must define shared corner body and title text styles.");
  }
  if (!app.includes('id="ascii_palette_toggle"') || !app.includes("Ascii Palette")) {
    throw new Error("The Settings section must include the Ascii Palette option.");
  }
  if (!app.includes('id="arguments_toggle"') || !app.includes("Arguments")) {
    throw new Error("The Settings section must include the Arguments option.");
  }
  if (!app.includes('id="arguments_title"') || !app.includes("randomSeed")) {
    throw new Error("The Arguments window must document the randomSeed URL argument.");
  }
  if (!app.includes('className="argument_code"') || !app.includes("window.location.assign") || !app.includes("withUrlArgument")) {
    throw new Error("Argument examples must be clickable URL actions that preserve and update query arguments.");
  }
  if (!app.includes("class PromptWindow extends Component")) {
    throw new Error("The Ascii Palette overlay must be implemented as a PromptWindow React class.");
  }
  if (!app.includes('className="window"') || !app.includes('className="window_backdrop"')) {
    throw new Error("The Ascii Palette overlay must include a Window and WindowBackdrop.");
  }
  if (!app.includes('className="palette_grid"') || !app.includes('className="palette_index"') || !app.includes('className="palette_glyph"')) {
    throw new Error("The Ascii Palette overlay must render a compact index and glyph grid.");
  }
  if (!app.includes('"in-maps"') || !app.includes('"customized"') || !app.includes("Sort by index") || !app.includes("Sort alphabetically")) {
    throw new Error("The palette overlay must provide map/customized filters and index/alphabet sorting controls.");
  }
  if (!app.includes("paletteViewState") || !app.includes("setPaletteViewState") || app.includes("sessionStorage")) {
    throw new Error("Palette filter and sort choices must last for the page session without surviving refresh.");
  }
  if (!app.includes("HexColorPicker") || !app.includes('type="range"') || !app.includes("Confirm") || !app.includes("Reset") || !app.includes("Cancel")) {
    throw new Error("The palette glyph editor must include a color picker, alpha range, Confirm, Reset, and Cancel controls.");
  }
  const confirmStart = app.indexOf("confirmEdit = async");
  const confirmEnd = app.indexOf("acknowledgeWarning", confirmStart);
  if (!app.slice(confirmStart, confirmEnd).includes("this.cancelEdit()") || !app.includes("{asciiPaletteOpen ? (")) {
    throw new Error("Confirming a glyph must close only its editor and keep the main palette window open.");
  }
  if (!app.includes("getPaletteEditorPosition") || !app.includes("innerHeight") || !styles.includes("max-height: calc(100vh - 32px)")) {
    throw new Error("The palette editor must remain completely onscreen at every glyph position.");
  }
  if (!app.includes("Hide warning") || !app.includes("Local palette change") || !app.includes("PALETTE_WARNING_KEY")) {
    throw new Error("The deployed palette persistence warning must include the Hide warning choice.");
  }
  if (!app.includes('aria-label="Close Ascii Palette"') || !app.includes(">\n              X\n")) {
    throw new Error("The Ascii Palette overlay must provide an X close control.");
  }
  if (!app.includes('className="window_backdrop" aria-hidden="true" onClick={onClose}') || !app.includes("event.stopPropagation()")) {
    throw new Error("Clicks outside the Ascii Palette window must close it without closing from inside the window.");
  }
  if (!app.includes("event.stopPropagation();\n                    this.selectEntry(entry, event);")) {
    throw new Error("Clicking a palette glyph must stay inside the palette window and open its editor.");
  }
  if (!styles.includes(".window_backdrop") || !styles.includes("z-index: 0") || !styles.includes("background: #000")) {
    throw new Error("The Ascii Palette overlay must fully block and darken the app behind it.");
  }
  if (!styles.includes(".window") || !styles.includes("inset: 100px")) {
    throw new Error("The Ascii Palette window must use a 100px margin on every side.");
  }
  if (!styles.includes(".prompt_title") || !styles.includes("font-size: 16pt")) {
    throw new Error("Prompt titles must use the larger prompt title style.");
  }
  if (!styles.includes(".prompt_body") || !styles.includes(".prompt_button")) {
    throw new Error("Prompts must define shared body and button styles.");
  }
  if (!app.includes('id="settings_title"') || !app.includes('className="corner_title"')) {
    throw new Error("The Settings heading must use the bold corner title style.");
  }
  if (!app.includes('id="fullscreen_toggle"') || !app.includes('className="corner_body settings_option"')) {
    throw new Error("The fullscreen setting must use the shared corner body style.");
  }
  if (!app.includes("Fullscreen")) {
    throw new Error("The Settings section must include the Fullscreen option line.");
  }
  if (app.includes("Fullscreen (")) {
    throw new Error("The Fullscreen setting must not wrap the checkbox emoji in parentheses.");
  }
  if (!app.includes("☐") || !app.includes("☑")) {
    throw new Error("The fullscreen setting must use empty and checked checkbox emoji.");
  }
  if (!app.includes("localStorage.setItem(fullscreenStorageKey")) {
    throw new Error("The fullscreen setting must persist its preference locally.");
  }
  if (!app.includes("requestFullscreen") || !app.includes("exitFullscreen")) {
    throw new Error("The fullscreen setting must toggle the browser fullscreen API.");
  }
  if (!app.includes("https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg")) {
    throw new Error("The page must link to the project repository.");
  }
  if (!app.includes("tabIndex={-1}")) {
    throw new Error("The corner UI controls must be removed from the tabbing order.");
  }
  if (page.includes('src="/src/main.js"')) {
    throw new Error("The safe-area template should not load an application module.");
  }
});
