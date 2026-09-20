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
  const hudLayouts = await readFile(new URL("src/runtime/ui-layer-react/HudLayouts.jsx", appRoot), "utf8");
  const fontStore = await readFile(new URL("src/runtime/ui-layer-react/font-store.js", appRoot), "utf8");
  const paletteStore = await readFile(new URL("src/runtime/ui-layer-react/palette-store.js", appRoot), "utf8");
  const platformSettings = await readFile(new URL("src/runtime/ui-layer-react/platform-settings.js", appRoot), "utf8");
  const buttonTabOrder = await readFile(new URL("src/runtime/ui-layer-react/button-tab-order.js", appRoot), "utf8");

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
  if (!styles.includes("--portrait-ui-width: max(0px, calc(var(--presentation-frame-width) - 2 * var(--ui-margin-x, 20px)))")
    || !styles.includes("--portrait-ui-height: max(0px, calc(var(--presentation-frame-height) - 2 * var(--ui-margin-y, 20px)))")
    || !styles.includes("width: var(--portrait-ui-width)")
    || !styles.includes("height: var(--portrait-ui-height)")) {
    throw new Error("Portrait HUD regions must share the inset portrait UI frame.");
  }
  if (!styles.includes(".corner {")) {
    throw new Error("The page must define a reusable corner style.");
  }
  for (const position of ["top-left", "top-right", "bottom-left", "bottom-right"]) {
    if (!app.includes(`position="${position}"`)) {
      throw new Error(`The page must include a ${position} corner instance.`);
    }
  }
  for (const component of ["CornerLayout", "BoxLayout", "HudBlockLayout"]) {
    if (!hudLayouts.includes(`export function ${component}`)) {
      throw new Error(`The UI layer must export the shared ${component} component.`);
    }
  }
  if (!app.includes('id="version"') || !app.includes("v{versionNumber}")) {
    throw new Error("The page must show the version footer.");
  }
  if (!app.includes('action="Character"')
    || !app.includes('action="Map 🔍"')
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
    || !styles.includes("grid-auto-rows: auto")
    || !styles.includes("width: min(calc(100dvw")
    || !styles.includes("height: min(calc(100dvh")
    || !styles.includes("flex: 0 0 auto")
    || !styles.includes("height: auto")
    || !styles.includes("height: min(83px, 32%)")
    || !styles.includes("grid-template-rows: repeat(4, minmax(0, 1fr))")
    || !styles.includes("aspect-ratio: 1 / 1")
    || !styles.includes("min-height: 0")) {
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
  if (!styles.includes("--box-body-font") || !styles.includes("--hud-title-font") || !styles.includes("--hud-body-font")
    || !styles.includes("font-size: var(--hud-body-font)")
    || !styles.includes("font-size: var(--box-action-font)")) {
    throw new Error("Character content and box actions must use the shared body and action font sizes.");
  }
  if (!styles.includes("--ui-bar-icon-font") || !styles.includes("font-size: var(--ui-bar-icon-font)")) {
    throw new Error("UI bar icons must use their own shared icon font size.");
  }
  if (!app.includes('id="fps"') || !app.includes("FPS: {fps}") || !app.includes("requestAnimationFrame(updateFps)")) {
    throw new Error("The HUD must display a once-per-second browser FPS counter.");
  }
  if (!app.includes('id="windows"') || !app.includes('titleId="windows_title"') || !app.includes('title="Windows"')
    || app.includes('id="windows_2"') || app.includes('titleId="windows_2_title"') || app.includes('title="Windows - 2"')
    || !app.includes('id="settings"') || !app.includes('titleId="settings_title"') || !app.includes('title="Settings"')) {
    throw new Error("The lower-left HUD must include Windows and Settings sections.");
  }
  const windowsMarkup = app.slice(app.indexOf('id="windows"'), app.indexOf('id="stats"'));
  if (windowsMarkup.indexOf('id="ascii_palette_toggle"') > windowsMarkup.indexOf('id="arguments_toggle"')
    || windowsMarkup.indexOf('id="arguments_toggle"') > windowsMarkup.indexOf('id="lighting_window_toggle"')) {
    throw new Error("The Windows controls must be ordered Ascii, Arguments, then Lighting.");
  }
  if (!styles.includes(".corner_body") || !styles.includes(".corner_title")
    || !styles.includes(".hud_block_title") || !styles.includes(".hud_block_body")) {
    throw new Error("The page must define shared HUD title and body text styles.");
  }
  const topLeftStyle = styles.slice(styles.indexOf(".corner_top_left {"), styles.indexOf(".corner_top_right {"));
  const topRightStyle = styles.slice(styles.indexOf(".corner_top_right {"), styles.indexOf(".corner_top_left,\n.corner_top_right"));
  if (!topLeftStyle.includes("width: var(--top-panel-size)")
    || !topLeftStyle.includes("height: var(--top-panel-size)")
    || !topRightStyle.includes("width: var(--top-panel-size)")
    || !topRightStyle.includes("height: var(--top-panel-size)")) {
    throw new Error("The Character and Map boxes must use the same map-sized dimensions.");
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
  const topLeftStart = app.indexOf('position="top-left"');
  const topRightStart = app.indexOf('position="top-right"');
  if (app.slice(topLeftStart, topRightStart).includes('id="fps"')) {
    throw new Error("The upper-left corner must not display the FPS counter.");
  }
  const bottomLeftStart = app.indexOf('position="bottom-left"');
  const bottomRightStart = app.indexOf('position="bottom-right"');
  const bottomLeftMarkup = app.slice(bottomLeftStart, bottomRightStart);
  if (bottomLeftStart === -1 || !bottomLeftMarkup.includes('id="windows"') || !bottomLeftMarkup.includes('id="settings"')
    || !bottomLeftMarkup.includes('id="show_ui_toggle"') || !bottomLeftMarkup.includes("Ascii Settings")
    || !bottomLeftMarkup.includes("Fullscreen") || !bottomLeftMarkup.includes("Reset Settings")) {
    throw new Error("The lower-left HUD must contain the Windows and Settings controls.");
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
  if (!app.includes("function WindowBackdrop")
    || !app.includes('className="lighting_window tutorial_window"')
    || !app.includes("showCloseButton = true") || !app.includes("showCloseButton = false")
    || !app.includes("showBackdrop = true") || !app.includes("closeOnBackdropClick = true")
    || !app.includes("showCloseButton={false}") || !app.includes("closeOnBackdropClick")
    || !styles.includes("background: rgb(0 0 0 / 50%)")) {
    throw new Error("Lighting and tutorial windows must share the window class and configurable backdrop behavior.");
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
  if (!app.includes("getPaletteEditorPosition") || !app.includes("innerHeight") || !styles.includes("max-height: 100vh")) {
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
  if (!app.includes('id="show_ui_toggle"') || !app.includes("Show UI") || !app.includes("getPlatformSettingsDefaults().showHud")
    || !app.includes("localStorage.setItem(showUiStorageKey, showHud ? \"true\" : \"false\")")
    || !app.includes("const toggleHud") || !app.includes("setShowHud((currentShowHud) => !currentShowHud)")
    || !platformSettings.includes('matchMedia("(pointer: coarse)")') || !platformSettings.includes("zoom: 7")
    || !platformSettings.includes("showHud: false")) {
    throw new Error("Show UI must use persisted platform-specific defaults.");
  }
  if (app.indexOf('id="show_ui_toggle"') < app.indexOf('id="reset_settings"')) {
    throw new Error("Show UI must remain the bottom item in the lower-left Settings list.");
  }
  if (!app.includes('document.documentElement.dataset.hudHidden = String(!showHud)')
    || !styles.includes('html[data-hud-hidden="true"] .corner_bottom_left > :not(#settings)')
    || !styles.includes('html[data-hud-hidden="true"] #settings > .hud_block_body > :not(:has(#show_ui_toggle))')
    || !styles.includes('html[data-hud-hidden="true"] #settings > .hud_block_body > :has(#show_ui_toggle)')) {
    throw new Error("Hiding the UI must preserve the Show UI control in the lower-left Settings HUD.");
  }
  if (!app.includes("requestFullscreenOnFirstInteraction")
    || !app.includes('document.addEventListener("pointerdown", requestFullscreenOnFirstInteraction, { capture: true, once: true })')
    || !app.includes("if (!fullscreenPreferred || document.fullscreenElement || !document.documentElement.requestFullscreen) return;")) {
    throw new Error("A saved fullscreen preference must request fullscreen on the first click or tap when needed.");
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
    || !app.includes("getStoredBoolean(gpuLightPassStorageKey, true)")
    || !app.includes("localStorage.setItem(gpuLightPassStorageKey, gpuLightPass ? \"true\" : \"false\")")
    || !app.includes("localStorage.clear()")) {
    throw new Error("The GPU light pass checkbox must default on, persist, and reset with settings.");
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
  if (app.includes('id="minimap_toggle"') || app.includes("minimapStorageKey") || app.includes("sendMinimapSnapshot")
    || !gameLayer.includes("let minimapZoom = 2")) {
    throw new Error("Minimap visibility must remain always on without a settings checkbox or visibility bridge.");
  }
  if (app.includes('id="realm_toggle"') || app.includes('id="send_toast"') || app.includes("Send Toast")) {
    throw new Error("Realm and test-toast Settings buttons must not be rendered.");
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
    || !gameLayer.includes("transitionActive")
    || !gameLayer.includes("refreshDiscovery({ immediate: true })")) {
    throw new Error("Realm changes must use a game-layer-owned transition that swaps realms at full coverage and locks input.");
  }
  if (!styles.includes(".game_transition_mask")
    || !styles.includes("pointer-events: none")
    || !styles.includes("z-index: 0")
    || !styles.includes("radial-gradient")) {
    throw new Error("The transition mask must be a pointer-transparent, soft-edged game-only surface above the game canvas and below the minimap.");
  }
  if (!gameLayer.includes('minimapCanvas.addEventListener("click", handleMinimapClick)')
    || !gameLayer.includes("canHandleMinimapScale()")
    || !gameLayer.includes('minimapCanvas.removeEventListener("click", handleMinimapClick)')
    || !gameLayer.includes("subscribeToMinimapZoom(listener)")
    || !main.includes("controller.subscribeToMinimapZoom(sendMinimapZoomSnapshot)")
    || !gameBridge.includes("export function subscribeToMinimapZoom(listener)")
    || !app.includes("minimapZoomStorageKey")
    || !app.includes("useEffect(() => subscribeToMinimapZoom(setMinimapZoom), [])")
    || !gameLayer.includes("sourceColumns = Math.min(world.columns")
    || !gameLayer.includes("createWorldViewComposition")
    || !gameLayer.includes("collectWorldViewGlyphs(composition)")
    || !gameLayer.includes("renderWorldViewComposition(composition")
    || !gameLayer.includes("fog: fogOfWar")
    || !gameLayer.includes("drawOverlay: () =>")
    || styles.includes("--minimap-zoom")
    || styles.includes("transform: scale")) {
    throw new Error("Minimap content zoom must stay hidden, persist independently, preserve canvas bounds, and clean up on disposal.");
  }
  if (!styles.includes("#minimap_canvas") || !styles.includes("24vmin")
    || !styles.includes("image-rendering: pixelated") || !styles.includes("pointer-events: auto")) {
    throw new Error("The minimap must use responsive pixel-preserving sizing.");
  }
  if (!app.includes('aria-label="Map icon"') || !app.includes('onClick={activateMinimapZoom}')) {
    throw new Error("The upper-right HUD must expose the box-wide minimap map action.");
  }
  if (!app.includes("tabIndex={-1}")) {
    throw new Error("The corner UI controls must be removed from the tabbing order.");
  }
  if (!buttonTabOrder.includes("node.tabIndex !== -1")
    || !buttonTabOrder.includes("attributeFilter: [\"tabindex\"]")) {
    throw new Error("Dynamic UI controls must be removed from the tab order without creating a MutationObserver feedback loop.");
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

test("documents the event-only movement tutorial flow", async () => {
  const app = await readFile(new URL("src/runtime/ui-layer-react/App.jsx", appRoot), "utf8");
  const bridge = await readFile(new URL("src/runtime/bridge-layer/game-bridge.js", appRoot), "utf8");
  const gameLayer = await readFile(new URL("src/runtime/game-layer-babylon-lite/index.js", appRoot), "utf8");
  const styles = await readFile(new URL("src/runtime/ui-layer-react/style.css", appRoot), "utf8");
  for (const eventName of ["player moved up", "player moved down", "player moved left", "player moved right"]) {
    if (!bridge.includes(eventName) || !gameLayer.includes(`PLAYER_MOVED_EVENTS.`)) {
      throw new Error("The game-to-UI movement contract must expose all four generic player-moved events.");
    }
  }
  if (!app.includes("subscribeToPlayerMoved") || !app.includes("tutorialDirectionsRef")
    || !app.includes("Tutorial Complete.") || !app.includes('const title = "How To Play"')
    || !app.includes("Use arrow keys or swipe to move. Hold to move faster.")
    || !app.includes("How To Play") || !app.includes("Next") || !app.includes("Skip Tutorial")
    || !app.includes("tutorialSkipStorageKey") || !app.includes(">Ok</button>")
    || app.includes("Don't show me this again")
    || app.includes('aria-label="Close Tutorial"') || !app.includes("closeOnBackdropClick")
    || !app.includes("onClose={() => setTutorialPhase(\"finished\")}")) {
    throw new Error("The tutorial must be event-driven, skippable, and dismissible through its action buttons or backdrop.");
  }
  if (!styles.includes(".tutorial_window") || styles.includes(".tutorial_window_checkbox")
    || !styles.includes(".tutorial_window_primary") || !styles.includes(".tutorial_window_secondary")
    || !styles.includes(".tutorial_window_ok") || !styles.includes("width: min(960px, 45vw)")
    || !styles.includes("height: auto") || !styles.includes("min-height: 240px")
    || !styles.includes('html[data-presentation-aspect="portrait"] .tutorial_window')
    || !styles.includes("width: max(240px, min(960px, calc(var(--presentation-frame-width) * 0.9)))")
    || !styles.includes("max-height: calc(var(--presentation-frame-height) - 24px)")
    || !styles.includes(".tutorial_window_copy")
    || !styles.includes("margin: 10%") || !styles.includes("align-items: center")
    || !styles.includes("pointer-events: auto") || !styles.includes("touch-action: none")
    || !app.includes("blockTutorialInput") || !app.includes('window.addEventListener("keydown", blockTutorialInput, true)')
    || !styles.includes("font-size: 15pt")
    || !styles.includes("font-size: 10pt")) {
    throw new Error("The tutorial window must reuse the compact responsive Lighting window styling.");
  }
  if (gameLayer.includes("tutorialPhase") || gameLayer.includes("tutorialSkipStorageKey")) {
    throw new Error("Tutorial state must remain outside the gameplay layer.");
  }
});

test("documents the quest tracker, live gold bridge, and quest toasts", async () => {
  const app = await readFile(new URL("src/runtime/ui-layer-react/App.jsx", appRoot), "utf8");
  const bridge = await readFile(new URL("src/runtime/bridge-layer/game-bridge.js", appRoot), "utf8");
  const styles = await readFile(new URL("src/runtime/ui-layer-react/style.css", appRoot), "utf8");
  if (!app.includes("Quest: ${quest.title}") || !app.includes("quest_tracker_body_complete")
    || !app.includes("Quest Started: ${quest.title}.") || !app.includes("Quest Progress: ${quest.title}")
    || !app.includes("Quest Completed: ${quest.title}.")) {
    throw new Error("The React HUD must render live quest text and state-specific quest toasts.");
  }
  if (!bridge.includes("getQuestSnapshot") || !bridge.includes("subscribeToQuest")
    || !bridge.includes("getGoldSnapshot") || !bridge.includes("subscribeToGold")) {
    throw new Error("The bridge must expose quest and runtime gold snapshots.");
  }
  if (!styles.includes(".quest_tracker") || !styles.includes("top: calc(var(--top-panel-size) + 25px)")
    || !styles.includes("margin-left: 5px") || !styles.includes("text-decoration: line-through")) {
    throw new Error("The quest tracker must preserve the requested HUD spacing, indent, and completion style.");
  }
  if (!styles.includes('html[data-presentation-aspect="portrait"] .toast')
    || !styles.includes("--toast-horizontal-inset: 0px")) {
    throw new Error("Portrait presentation toasts must remain horizontally centered in the screen frame.");
  }
});

test("derives the character gold icon color from the shared palette", async () => {
  const app = await readFile(new URL("src/runtime/ui-layer-react/App.jsx", appRoot), "utf8");
  const palette = JSON.parse(await readFile(new URL("src/runtime/game-layer-babylon-lite/data/palette_data.json", appRoot), "utf8"));
  if (!app.includes('getPaletteStyle(palette, "◆")') || !app.includes("style={{ color: goldStyle.color }}")) {
    throw new Error("The character gold icon must resolve its color from the shared palette.");
  }
  if (palette.entries.find((entry) => entry.glyph === "◆")?.color !== "#ffff00") {
    throw new Error("The bundled gold glyph must default to yellow.");
  }
});
