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
  const app = await readFile(new URL("src/runtime/ui-layer-react/App.jsx", appRoot), "utf8");
  const main = await readFile(new URL("src/main.jsx", appRoot), "utf8");
  const gameLayer = await readFile(new URL("src/runtime/game-layer-babylon-lite/index.js", appRoot), "utf8");
  const gameBridge = await readFile(new URL("src/runtime/bridge-layer/game-bridge.js", appRoot), "utf8");
  const camera = await readFile(new URL("src/runtime/bridge-layer/camera.js", appRoot), "utf8");
  const styles = await readFile(new URL("src/runtime/ui-layer-react/style.css", appRoot), "utf8");
  const fontStore = await readFile(new URL("src/runtime/ui-layer-react/font-store.js", appRoot), "utf8");
  const paletteStore = await readFile(new URL("src/runtime/ui-layer-react/palette-store.js", appRoot), "utf8");
  const platformSettings = await readFile(new URL("src/runtime/ui-layer-react/platform-settings.js", appRoot), "utf8");

  if (!page.includes("<title>Ascii RPG</title>")) {
    throw new Error("The browser title must identify the project.");
  }
  if (!page.includes('id="game_layer"')) {
    throw new Error("The page needs a dedicated Babylon Lite game layer.");
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
  if (!app.includes('className="top_panel_action">Character</div>')
    || !app.includes('className="top_panel_action">Map 🔍</div>')
    || !app.includes("World 1 Floor {activeRealm === \"Underground\" ? \"-1\" : \"1\"}")
    || !app.includes('String(worldTime).padStart(5, "0")')
    || !styles.includes(".minimap_status")) {
    throw new Error("The top HUD must display box actions with right-aligned world, floor, and time status below the minimap.");
  }
  const characterData = await readFile(new URL("src/runtime/ui-layer-react/character-data.js", appRoot), "utf8");
  for (const requiredFragment of [
    "startingPercent: 80",
    "startingPercent: 10",
    "startingPercent: 0",
    "pointsNeededForNextLevel: 100",
    "currentAmount: 0",
    "currentWeight: 0",
    "capacity: 0",
  ]) {
    if (!characterData.includes(requiredFragment)) {
      throw new Error(`The character model must define ${requiredFragment}.`);
    }
  }
  if (app.includes('className="character_stat_label"')) {
    throw new Error("Character stat bars must not render redundant text labels.");
  }
  if (app.includes('className="character_resource_label"')) {
    throw new Error("Character resource rows must not render Gold or Carrying text labels.");
  }
  for (const slot of ["Slot 01", "Slot 02", "Slot 03", "Slot 04"]) {
    if (!app.includes(slot)) {
      throw new Error(`The character info panel must include the empty ${slot} placeholder.`);
    }
  }
  if (!styles.includes("grid-template-columns: repeat(3, minmax(0, 1fr))")
    || !styles.includes("grid-template-rows: repeat(2, auto)")
    || !styles.includes("width: 70%")
    || !styles.includes("aspect-ratio: 1 / 1")
    || !styles.includes("aspect-ratio: 1 / 1")
    || !styles.includes("overflow: visible") || !styles.includes("min-height: 0")) {
    throw new Error("Character resources and empty inventory slots must share a six-cell grid.");
  }
  for (const requiredFragment of [
    'className="character_details"',
    'data-stat={row.key}',
    'role="progressbar"',
    'data-resource="gold"',
    'data-resource="carrying"',
    'icon: "♥"',
    'icon: "⚔"',
    'icon: "⛨"',
    'icon: "✦"',
    'color={row.color}',
  ]) {
    if (!app.includes(requiredFragment)) {
      throw new Error(`The character details UI must include ${requiredFragment}.`);
    }
  }
  if (!styles.includes(".character_bar_current") || !styles.includes(".character_bar_pending")
    || !styles.includes("--character-bar-delta") || !styles.includes("--character-bar-unfilled")) {
    throw new Error("Character stat bars must expose current, derived delta, and derived unfilled sections.");
  }
  if (!styles.includes("--box-body-font") || !styles.includes("font-size: var(--box-body-font)")
    || !styles.includes("font-size: var(--box-action-font)")) {
    throw new Error("Character content and box actions must use the shared body and action font sizes.");
  }
  if (!styles.includes("--ui-bar-icon-font") || !styles.includes("font-size: var(--ui-bar-icon-font)")) {
    throw new Error("UI bar icons must use their own shared icon font size.");
  }
  if (!app.includes('id="fps"') || !app.includes("FPS: {fps}") || !app.includes("requestAnimationFrame(updateFps)")) {
    throw new Error("The HUD must display a once-per-second browser FPS counter.");
  }
  if (!app.includes('id="windows"') || !app.includes('id="windows_title"') || !app.includes("Windows - 1")
    || !app.includes('id="windows_2"') || !app.includes('id="windows_2_title"') || !app.includes("Windows - 2")) {
    throw new Error("The lower-left HUD must include Windows - 1 and Windows - 2 sections.");
  }
  if (!app.includes('id="settings"') || !app.includes('id="settings_title"') || !app.includes("Settings")) {
    throw new Error("The lower-left HUD must include a Settings section.");
  }
  if (!styles.includes(".corner_body") || !styles.includes(".corner_title")) {
    throw new Error("The page must define shared corner body and title text styles.");
  }
  if (!app.includes('id="lighting_torch_toggle"') || !app.includes('id="lighting_player_toggle"')
    || !app.includes('id="shadow_torch_toggle"') || !app.includes('id="shadow_player_toggle"')
    || !app.includes('id="ambient_overground_control"') || !app.includes('id="ambient_underground_control"') || !app.includes("Ambient Overground") || !app.includes("Ambient Underground")
    || !app.includes('id="player_gpu_shadow_bleed_range"')
    || !app.includes("formatLightingProfile") || !app.includes("formatShadowProfile")) {
    throw new Error("The Lighting window must include all independent lighting, shadow, and ambient controls.");
  }
  const torchLightingStart = app.indexOf('id="lighting_torch_toggle"');
  const torchShadowStart = app.indexOf('id="shadow_torch_toggle"');
  const playerLightingStart = app.indexOf('id="lighting_player_toggle"');
  const playerShadowStart = app.indexOf('id="shadow_player_toggle"');
  if (main.includes("GameCanvas") || main.includes('createRoot(document.getElementById("game_layer"))')) {
    throw new Error("React must mount only UI and must not own the Babylon Lite game canvas.");
  }
  if (!main.includes("startGameLayer") || !gameLayer.includes("@babylonjs/lite")) {
    throw new Error("The game layer must start Babylon Lite outside React.");
  }
  if (!gameLayer.includes("navigator.gpu") || !gameLayer.includes("container.replaceChildren()")) {
    throw new Error("A WebGPU startup failure must leave the game layer unloaded without a canvas fallback.");
  }
  if (!gameLayer.includes("canvas.clientWidth || window.innerWidth")
    || !gameLayer.includes("canvas.clientHeight || window.innerHeight")
    || !gameLayer.includes("new ResizeObserver(handleResize)")) {
    throw new Error("The game viewport must follow the canvas dimensions available in the browser.");
  }
  const topLeftStart = app.indexOf('className="corner corner_top_left"');
  const topRightStart = app.indexOf('className="corner corner_top_right"');
  if (app.slice(topLeftStart, topRightStart).includes('id="fps"')) {
    throw new Error("The upper-left corner must not display the FPS counter.");
  }
  const windowsStart = app.indexOf('id="windows"');
  const windows2Start = app.indexOf('id="windows_2"');
  const statsStart = app.indexOf('id="stats"');
  const settingsStart = app.indexOf('id="settings"');
  if (windowsStart === -1 || windows2Start === -1 || statsStart === -1 || settingsStart === -1 || !(windowsStart < windows2Start && windows2Start < statsStart && statsStart < settingsStart)) {
    throw new Error("Windows - 1, Windows - 2, Stats, and Settings must appear in lower-left order.");
  }
  const windowsMarkup = app.slice(windowsStart, windows2Start);
  const windows2Markup = app.slice(windows2Start, statsStart);
  const settingsMarkup = app.slice(settingsStart, app.indexOf("</section>", settingsStart));
  if (!windowsMarkup.includes('id="ascii_palette_toggle"') || !windowsMarkup.includes("Ascii Settings")) {
    throw new Error("The Windows section must include the Ascii Settings option.");
  }
  if (!windowsMarkup.includes('id="arguments_toggle"') || !windowsMarkup.includes("Arguments")) {
    throw new Error("The Windows section must include the Arguments option.");
  }
  if (!windows2Markup.includes('id="lighting_window_toggle"') || !windows2Markup.includes(">\n              Lighting\n")
    || windows2Markup.includes('id="ascii_palette_toggle"') || windows2Markup.includes('id="arguments_toggle"')) {
    throw new Error("Windows - 2 must contain only the Lighting launcher.");
  }
  const statsMarkup = app.slice(statsStart, settingsStart);
  if (!statsMarkup.includes('id="stats_title"') || !statsMarkup.includes("Stats") || !statsMarkup.includes('id="fps"')) {
    throw new Error("The Stats section must appear below Windows and contain the FPS counter.");
  }
  if (settingsMarkup.includes('id="ascii_palette_toggle"') || settingsMarkup.includes('id="arguments_toggle"')) {
    throw new Error("Window launchers must not be duplicated in the Settings section.");
  }
  if (settingsMarkup.includes('id="lighting_window_toggle"') || settingsMarkup.includes('id="gpu_light_pass_toggle"') || settingsMarkup.includes('id="lighting_torch_toggle"')) {
    throw new Error("Settings must not expose Lighting controls or its launcher.");
  }
  const lightingWindowStart = app.indexOf('id="lighting_window"');
  const lightingWindowMarkup = app.slice(lightingWindowStart, app.indexOf("</section>", lightingWindowStart));
  if (lightingWindowStart === -1 || !lightingWindowMarkup.includes('id="lighting_window_title"')
    || !lightingWindowMarkup.includes('className="corner_title"') || !lightingWindowMarkup.includes('className="corner_body settings_option"')
    || !lightingWindowMarkup.includes('id="gpu_light_pass_toggle"') || !lightingWindowMarkup.includes('id="ambient_overground_control"') || !lightingWindowMarkup.includes('id="ambient_underground_control"')) {
    throw new Error("The Lighting window must reuse corner text styles and contain every lighting control.");
  }
  const ambientStart = lightingWindowMarkup.indexOf('id="ambient_overground_control"');
  const gpuStart = lightingWindowMarkup.indexOf('id="gpu_light_pass_toggle"');
  const playerStart = lightingWindowMarkup.indexOf('id="lighting_player_toggle"');
  const playerGpuStart = lightingWindowMarkup.indexOf('id="player_gpu_shadow_bleed_range"');
  const playerShadowWindowStart = lightingWindowMarkup.indexOf('id="shadow_player_toggle"');
  if (!(ambientStart < gpuStart && gpuStart < playerStart && playerStart < playerGpuStart && playerGpuStart < playerShadowWindowStart && playerShadowWindowStart < torchLightingStart && torchLightingStart < torchShadowStart)
    || !lightingWindowMarkup.includes("GPU Light Pass") || lightingWindowMarkup.includes("Lighting GPU Light Pass") || lightingWindowMarkup.includes("Light Ambient")) {
    throw new Error("Lighting controls must use short labels in alphabetic order.");
  }
  if (!app.includes('aria-label="Close Lighting"') || !app.includes("onPointerDown={beginDrag}")
    || !app.includes("onPointerMove={moveDrag}") || !app.includes("getLightingWindowPosition")
    || !styles.includes(".lighting_window") || !styles.includes(".lighting_window_titlebar")
    || !styles.includes("touch-action: none")) {
    throw new Error("The Lighting window must provide a draggable title bar and accessible close action.");
  }
  if (!app.includes("onClick={() => setLightingWindowOpen((isOpen) => !isOpen)}")
    || !app.includes("lightingWindowPositionStorageKey")
    || !app.includes("useState(getStoredLightingWindowPosition)")
    || !app.includes("localStorage.setItem(lightingWindowPositionStorageKey, JSON.stringify(lightingWindowPosition))")) {
    throw new Error("The Lighting launcher must toggle its window and restore its last saved position.");
  }
  const closeLightingStart = app.indexOf('aria-label="Close Lighting"');
  const closeLightingMarkup = app.slice(app.lastIndexOf("<button", closeLightingStart), app.indexOf("</button>", closeLightingStart));
  if (closeLightingMarkup.includes("aria-description") || app.slice(Math.max(0, closeLightingStart - 300), closeLightingStart).includes("SettingTooltipTarget")) {
    throw new Error("Close controls must not show a tooltip.");
  }
  if (!app.includes('id="arguments_title"') || !app.includes("randomSeed")) {
    throw new Error("The Arguments window must document the randomSeed URL argument.");
  }
  if (!app.includes('value: "123"') || !app.includes("?randomSeed=123")) {
    throw new Error("The randomSeed URL argument example must use 123 as its default.");
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
    throw new Error("The Ascii Settings overlay must render a compact index and glyph grid.");
  }
  if (!app.includes('"in-maps"') || !app.includes('"customized"') || !app.includes("Filter: ") || !app.includes("Sort: ") || !app.includes("InMaps") || !app.includes(">\n                #\n") || !app.includes(">\n                Abc\n") || !app.includes(">\n                Group\n") || !app.includes("content_options") || !app.includes("palette_group_header") || !app.includes("getPaletteGroupLabel") || !styles.includes("grid-template-columns: repeat(auto-fill, minmax(72px, 1fr))") || !styles.includes("font-size: 10pt")) {
    throw new Error("The Glyphs tab must provide labeled filter and index/alphabet/group sort options.");
  }
  if (!app.includes("paletteViewState") || !app.includes("setPaletteViewState") || app.includes("sessionStorage")) {
    throw new Error("Palette filter and sort choices must last for the page session without surviving refresh.");
  }
  if (!app.includes("HexColorPicker") || app.includes("palette_alpha_control") || !app.includes("Confirm") || !app.includes("Reset") || !app.includes("Cancel")) {
    throw new Error("The palette glyph editor must include a color picker, no alpha control, Confirm, Reset, and Cancel controls.");
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
  if (!app.includes('aria-label="Close Ascii Settings"') || !app.includes(">\n              X\n")) {
    throw new Error("The Ascii Settings overlay must provide an X close control.");
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
  if (!styles.includes(".window") || !styles.includes("inset: clamp(8px, 6dvh, 25px) clamp(8px, 6dvw, 25px)")) {
    throw new Error("The Ascii Palette window must keep a responsive inset on every side.");
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
  if (!app.includes('id="aspect_toggle"') || !app.includes("Aspect (Lanscape)")
    || !app.includes("Aspect (Portrait)") || !app.includes("aspectStorageKey")
    || !app.includes("getStoredAspectMode") || !app.includes("localStorage.setItem(aspectStorageKey, aspectMode)")
    || !app.includes("dataset.presentationAspect = aspectMode") || !app.includes("const toggleAspectMode")) {
    throw new Error("The Settings section must provide the persisted aspect testing toggle.");
  }
  if (!app.includes("settingsHelp.aspect") || !app.includes("Switch between landscape and portrait testing presentation.")) {
    throw new Error("The aspect setting must provide the existing Settings tooltip behavior.");
  }
  if (!platformSettings.includes('storedValue === "portrait" ? "portrait" : "landscape"')) {
    throw new Error("The aspect setting must default invalid and missing stored values to landscape.");
  }
  if (!styles.includes('html[data-presentation-aspect="portrait"] #game_layer')
    || !styles.includes("calc(100vh * 9 / 16)") || !styles.includes("calc(100vw * 16 / 9)")
    || !styles.includes("@media (pointer: coarse)") || !styles.includes("width: 100vw")) {
    throw new Error("Portrait presentation must use a desktop 9:16 frame and fill a coarse-pointer mobile viewport.");
  }
  if (!app.includes('id="show_ui_toggle"') || !app.includes("Show UI") || !app.includes("getPlatformSettingsDefaults().showHud")
    || !app.includes("localStorage.setItem(showUiStorageKey, showHud ? \"true\" : \"false\")")
    || !app.includes("const toggleHud") || !app.includes("setShowHud((currentShowHud) => !currentShowHud)")
    || !platformSettings.includes('matchMedia("(pointer: coarse)")') || !platformSettings.includes("zoom: 7")
    || !platformSettings.includes("showHud: false")) {
    throw new Error("The Settings section must use persisted platform-specific Show UI defaults.");
  }
  if (!app.includes('{showHud ? (\n        <>\n          <div\n            className="corner corner_top_right"')
    || !app.includes('{showHud ? (\n        <div className="corner corner_bottom_right"')
    || !app.includes("{showHud ? <>\n          <a className=\"project_link\"")) {
    throw new Error("Hiding the UI must remove the upper-right and lower-corner HUD while retaining the lower-left Show UI control.");
  }
  if (!app.includes('id="camera_mode_toggle"')
    || !camera.includes("CameraMode (Center)")
    || !camera.includes("CameraMode (Deadzone)")
    || !camera.includes("CameraMode (Lock)")
    || !app.includes("CAMERA_STORAGE_KEY")) {
    throw new Error("The Settings section must include the persisted three-mode camera control.");
  }
  if (!app.includes('id="zoom_control"') || !app.includes('aria-label="Zoom in"') || !app.includes('aria-label="Zoom out"')) {
    throw new Error("The Settings section must include bounded zoom controls.");
  }
  if (!app.includes('id="reset_settings"') || !app.includes("localStorage.clear()")) {
    throw new Error("The Settings section must include a local-storage reset control.");
  }
  if (app.includes('requestFullscreenOnFirstClick')
    || app.includes('document.addEventListener("click", requestFullscreenOnFirstClick, true)')) {
    throw new Error("Menu clicks must not trigger an implicit fullscreen request.");
  }
  if (!app.includes("zoomStorageKey") || !app.includes("overgroundAmbientStorageKey") || !app.includes("undergroundAmbientStorageKey")
    || !app.includes("localStorage.setItem(zoomStorageKey")
    || !app.includes("localStorage.setItem(overgroundAmbientStorageKey") || !app.includes("localStorage.setItem(undergroundAmbientStorageKey")) {
    throw new Error("The Settings values must persist zoom and ambient lighting choices locally.");
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
  if (!app.includes('id="gpu_light_pass_toggle"') || !app.includes("GPU Light Pass")
    || !app.includes("getStoredBoolean(gpuLightPassStorageKey, false)")
    || !app.includes("localStorage.setItem(gpuLightPassStorageKey, gpuLightPass ? \"true\" : \"false\")")
    || !app.includes("localStorage.clear()")) {
    throw new Error("The GPU light pass checkbox must default off, persist, and reset with settings.");
  }
  if (!viteConfig.plugins.some((plugin) => plugin?.name === "ascii-palette-persistence")) {
    throw new Error("Vite must provide the local disk persistence plugin for ASCII palette and font edits.");
  }
  if (!fontStore.includes("import.meta.env.DEV || typeof window === \"undefined\"")) {
    throw new Error("Vite font state must come from the checked-in font file, not local storage.");
  }
  if (!paletteStore.includes("import.meta.env.DEV || typeof window === \"undefined\"")) {
    throw new Error("Vite palette state must come from the checked-in palette file, not local storage.");
  }
  if (!app.includes("requestFullscreen") || !app.includes("exitFullscreen")) {
    throw new Error("The fullscreen setting must toggle the browser fullscreen API.");
  }
  if (!app.includes("https://github.com/SamuelAsherRivello/babylon-lite-ascii-rpg")) {
    throw new Error("The page must link to the project repository.");
  }
  if (!app.includes('id="minimap_toggle"') || !app.includes("Minimap")
    || !app.includes("minimapStorageKey") || !app.includes("sendMinimapSnapshot")) {
    throw new Error("Settings must provide a persisted Minimap visibility checkbox.");
  }
  if (!gameLayer.includes('id = "minimap_canvas"') || !gameLayer.includes("createFogOfWar")
    || !gameLayer.includes("discoverFromPlayer") || !gameLayer.includes("getMinimapWorldCellGraphic")
    || !gameLayer.includes("getMinimapMarkers") || !gameLayer.includes("visual.rasters")
    || gameLayer.includes("context.fillText")) {
    throw new Error("The game layer must own fog discovery and actual world-graphic minimap rendering.");
  }
  if (!gameLayer.includes('transitionMask.className = "game_transition_mask"')
    || !gameLayer.includes("createTransitionSystem")
    || !gameLayer.includes("startRealmTransition")
    || !gameLayer.includes("onCovered: () => activateRealm")
    || !gameLayer.includes("transitionActive")) {
    throw new Error("Realm changes must use a game-layer-owned transition that swaps realms at full coverage and locks input.");
  }
  if (!styles.includes(".game_transition_mask")
    || !styles.includes("pointer-events: none")
    || !styles.includes("z-index: 2")
    || !styles.includes("radial-gradient")) {
    throw new Error("The transition mask must be a pointer-transparent, soft-edged game-layer surface.");
  }
  if (!gameLayer.includes('minimapCanvas.addEventListener("click", handleMinimapClick)')
    || !gameLayer.includes("canHandleMinimapScale(minimapVisible)")
    || !gameLayer.includes('minimapCanvas.removeEventListener("click", handleMinimapClick)')
    || !gameLayer.includes("subscribeToMinimapZoom(listener)")
    || !main.includes("controller.subscribeToMinimapZoom(sendMinimapZoomSnapshot)")
    || !gameBridge.includes("export function subscribeToMinimapZoom(listener)")
    || !app.includes("minimapZoomStorageKey")
    || !app.includes("useEffect(() => subscribeToMinimapZoom(setMinimapZoom), [])")
    || !gameLayer.includes("sourceColumns = Math.min(world.columns")
    || !gameLayer.includes("getMinimapWorldCellGraphic")
    || !gameLayer.includes("// Pass 1: world background.")
    || !gameLayer.includes("// Pass 2: discovered world glyph rasters from the same cache as the game renderer.")
    || !gameLayer.includes("// Pass 3: markers, painted after world graphics in back-to-front order.")
    || styles.includes("--minimap-zoom")
    || styles.includes("transform: scale")) {
    throw new Error("Minimap content zoom must stay hidden, persist independently, preserve canvas bounds, and clean up on disposal.");
  }
  if (!styles.includes("#minimap_canvas") || !styles.includes("24vmin")
    || !styles.includes("image-rendering: pixelated") || !styles.includes("pointer-events: auto")) {
    throw new Error("The minimap must use responsive pixel-preserving sizing.");
  }
  const bottomLeftStart = app.indexOf('className="corner corner_bottom_left"');
  if (!app.includes('aria-label="Map icon"') || !app.includes('onClick={activateMinimapZoom}')) {
    throw new Error("The upper-right HUD must expose the box-wide minimap map action.");
  }
  const lowerLeftMarkup = app.slice(bottomLeftStart, windowsStart);
  if (!lowerLeftMarkup.includes("GitHubMark")) {
    throw new Error("The GitHub link must appear immediately above the Windows section.");
  }
  if (!app.includes("tabIndex={-1}")) {
    throw new Error("The corner UI controls must be removed from the tabbing order.");
  }
  for (const requiredSourceFragment of [
    "touch-action: none",
    "getDirectionForSwipe",
    "canvas.addEventListener(\"pointerdown\"",
    "canvas.addEventListener(\"pointerup\"",
    "canvas.addEventListener(\"pointercancel\"",
    "canvas.addEventListener(\"lostpointercapture\"",
    "window.addEventListener(\"orientationchange\"",
    "const handlePageHide = () => {\n    clearMovementInput();",
    "const clearKeyboardInput = () => {\n    heldKeys.clear();\n    shiftHeld = false;",
    "const handleWindowBlur = () => {\n    clearMovementInput();",
    "window.addEventListener(\"blur\", handleWindowBlur)",
    "window.removeEventListener(\"blur\", handleWindowBlur)",
    "dispose() {\n      if (disposed) return;\n      disposed = true;\n      clearMovementInput();",
  ]) {
    if (!`${styles}\n${gameLayer}`.includes(requiredSourceFragment)) {
      throw new Error("Canvas swipe input must stay scoped to the game canvas and clean up on every stop path.");
    }
  }
  if (!styles.includes("touch-action: none") || !gameLayer.includes("clearTouchInput")) {
    throw new Error("Canvas swipe input must stay scoped to the game canvas and clean up on lifecycle changes.");
  }
  if (!styles.includes("@media (orientation: landscape)") || !styles.includes(".hud_section + .hud_section")
    || !styles.includes(".font_editor_body") || !styles.includes("overflow-wrap: anywhere")) {
    throw new Error("Responsive HUD, palette, and Font layout rules must keep controls contained.");
  }
  if (page.includes('src="/src/main.js"')) {
    throw new Error("The safe-area template should not load an application module.");
  }
});
