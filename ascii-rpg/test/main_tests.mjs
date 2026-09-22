import { readFile } from "node:fs/promises";
import test from "node:test";
import viteConfig from "../../vite.config.js";

const appRoot = new URL("../", import.meta.url);
const styleSheetFiles = [
  "styles.css",
  "character.css",
  "map.css",
  "hud.css",
  "windows.css",
  "toasts.css",
];

async function readStyles() {
  return (await Promise.all(
    styleSheetFiles.map((fileName) => readFile(new URL(`src/client/ui-layer-react/${fileName}`, appRoot), "utf8")),
  )).join("\n");
}

test("builds for the GitHub Pages project path", () => {
  if (viteConfig.base !== "/babylon-lite-ascii-rpg/") {
    throw new Error("The GitHub Pages build must use the repository project path as its Vite base.");
  }
});

test("documents the randomized desktop Portrait letterbox", async () => {
  const page = await readFile(new URL("index.html", appRoot), "utf8");
  const mapStyles = await readFile(new URL("src/client/ui-layer-react/map.css", appRoot), "utf8");
  const [mossy, chained, rail] = await Promise.all([
    readFile(new URL("src/assets/letterbox/mossy-torch-lit-ruins.png", appRoot)),
    readFile(new URL("src/assets/letterbox/subtle-chained-brick-dungeon.png", appRoot)),
    readFile(new URL("src/assets/letterbox/forest-gate-rail.png", appRoot)),
  ]);

  if (!page.includes('id="letterbox_presentation"')
    || !page.includes('class="letterbox_presentation__rail letterbox_presentation__rail--left"')
    || !page.includes('class="letterbox_presentation__rail letterbox_presentation__rail--right"')) {
    throw new Error("The page must provide an independent pair of letterbox rails behind the game and UI layers.");
  }
  if (mossy.length < 2_000_000 || chained.length < 1_900_000 || rail.length < 90_000) {
    throw new Error("The RPG must own both complete randomized backdrop assets and its existing rail asset.");
  }
  if (!page.includes('Math.random() < 0.5 ? "mossy" : "chained"')
    || !page.includes('data-letterbox-layout=""')
    || !page.includes('dataset.letterboxLayout = document.documentElement.dataset.letterboxLayout')) {
    throw new Error("The letterbox must select one local layout once while the page loads.");
  }
  for (const fragment of [
    '#letterbox_presentation {',
    'pointer-events: none',
    'z-index: 1',
    'background: url("../../assets/letterbox/mossy-torch-lit-ruins.png")',
    'background: url("../../assets/letterbox/subtle-chained-brick-dungeon.png")',
    'background: url("../../assets/letterbox/forest-gate-rail.png")',
    'html[data-presentation-aspect="portrait"] #letterbox_presentation',
    '@media (hover: hover) and (pointer: fine)',
    'transform: scaleX(-1)',
    'box-shadow: var(--letterbox-rail-finish)',
    'calc((100vw - var(--presentation-frame-width)) / 2 - var(--letterbox-rail-width))',
  ]) {
    if (!mapStyles.includes(fragment)) {
      throw new Error(`The desktop Portrait letterbox is missing its required ${fragment} contract.`);
    }
  }
  if (mapStyles.includes("stealth-steel")) {
    throw new Error("The RPG letterbox must not fetch its presentation assets from Stealth & Steel at runtime.");
  }
});

test("documents the plain safe-area template", async () => {
  const page = await readFile(new URL("index.html", appRoot), "utf8");
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  const main = await readFile(new URL("src/main.jsx", appRoot), "utf8");
  const gameLayer = await readFile(new URL("src/client/game-layer-babylon-lite/index.js", appRoot), "utf8");
  const gameBridge = await readFile(new URL("src/client/bridge-layer/game-bridge.js", appRoot), "utf8");
  const camera = await readFile(new URL("src/client/bridge-layer/camera.js", appRoot), "utf8");
  const styles = await readStyles();
  const hudLayouts = await readFile(new URL("src/client/ui-layer-react/HudLayouts.jsx", appRoot), "utf8");
  const fontStore = await readFile(new URL("src/client/ui-layer-react/font-store.js", appRoot), "utf8");
  const paletteStore = await readFile(new URL("src/client/ui-layer-react/palette-store.js", appRoot), "utf8");
  const platformSettings = await readFile(new URL("src/client/ui-layer-react/platform-settings.js", appRoot), "utf8");
  const buttonTabOrder = await readFile(new URL("src/client/ui-layer-react/button-tab-order.js", appRoot), "utf8");

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
  if (!app.includes("const uiMarginPixels = 10")) {
    throw new Error("The UI margin must be set from a single 10px target.");
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
  if (!styles.includes("inset: var(--ui-margin-y, 10px) var(--ui-margin-x, 10px)")) {
    throw new Error("The page must apply percentage-based UI margins with a 10px fallback.");
  }
  if (!styles.includes("--portrait-ui-width: max(0px, calc(var(--presentation-frame-width) - 2 * var(--ui-margin-x, 10px)))")
    || !styles.includes("--portrait-ui-height: max(0px, calc(var(--presentation-frame-height) - 2 * var(--ui-margin-y, 10px)))")
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
  const statsMarkup = app.slice(app.indexOf('id="stats"'), app.indexOf('id="settings"'));
  if (statsMarkup.indexOf('id="fps"') > statsMarkup.indexOf('id="version"')
    || app.slice(app.indexOf('id="settings"'), app.indexOf('position="bottom-right"')).includes('id="version"')) {
    throw new Error("The version display must be directly below FPS in the Info section.");
  }
  if (!app.includes('action="Character"')
    || !app.includes('action="Map 🔍"')
    || !app.includes("World: 1 Realm: {activeRealmLabel} ({realmDiscovery.percent}%)")
    || !app.includes("Player discovered ${realmDiscovery.percent}% of Realm ${activeRealmLabel} of World 1")
    || !app.includes('className="hud_tooltip_target"')
    || !app.includes("<SettingTooltipTarget description={realmDiscoveryTitle}")
    || !app.includes('<SettingTooltipTarget description="Elapsed time units since game started"')
    || !app.includes("useSyncExternalStore(subscribeToRealmDiscovery, getRealmDiscoverySnapshot, getRealmDiscoverySnapshot)")
    || !styles.includes(".hud_tooltip_target")
    || app.includes("data-tooltip={description}")
    || app.includes("title={description}")
    || styles.includes(".setting_tooltip_target::after")
    || styles.includes("content: attr(data-tooltip)")
    || styles.includes("cursor: help")
    || !styles.includes("max-width: calc(100vw - 16px)")
    || !app.includes("function formatTooltipDescription(description)")
    || !app.includes('replace(/\\?+/g, "")')
    || !app.includes('<SettingTooltipTarget className="character_bar_tooltip_target"')
    || app.includes("title={row.tooltip}")
    || app.includes('title="Gold: The currency of your character."')
    || app.includes('title="Keys: The keys your character is holding."')
    || !styles.includes(".character_bar_tooltip_target")
    || !styles.includes("font-family: inherit")
    || !styles.includes("font-size: var(--box-body-font)")
    || !styles.includes("font-weight: 400")
    || !app.includes('className="settings_tooltip"')
    || !app.includes('String(worldTime).padStart(5, "0")')
    || !styles.includes(".minimap_status")
    || !styles.includes("pointer-events: auto")) {
    throw new Error("The top HUD must display box actions with right-aligned compact world, realm, discovered, and time status below the minimap.");
  }
  const lowerLeftMarkup = app.slice(app.indexOf('position="bottom-left"'), app.indexOf('position="bottom-right"'));
  for (const requiredTooltip of [
    "settingsHelp.repository",
    "settingsHelp.asciiPalette",
    "settingsHelp.gameplaySettings",
    "settingsHelp.arguments",
    "settingsHelp.lighting",
    "settingsHelp.fps",
    "settingsHelp.version",
    "settingsHelp.fullscreen",
    "settingsHelp.aspect",
    "settingsHelp.camera",
    "settingsHelp.zoom",
    "settingsHelp.reset",
  ]) {
    if (!lowerLeftMarkup.includes(requiredTooltip)) {
      throw new Error(`The lower-left HUD line for ${requiredTooltip} must have a full-line tooltip.`);
    }
  }
  if (!gameLayer.includes('import { createLogSystem } from "./systems/log-system.js"')
    || !gameLayer.includes("const logSystem = createLogSystem()")
    || gameLayer.includes("const appendLog =")
    || !gameBridge.includes("Object.freeze(Array.isArray(entries) ? [...entries] : [])")
    || !app.includes("function LogBody({ entries })")
    || !app.includes("isLogScrollAtBottom(body)")
    || !app.includes("SIGNED_NUMBER_PATTERN")
    || !app.includes("log_number_positive")
    || !app.includes("log_number_negative")
    || !styles.includes(".log_number_positive")
    || !styles.includes(".log_number_negative")) {
    throw new Error("The Log System must own game log events, immutable bridge snapshots, and scroll-aware React rendering.");
  }
  const characterData = await readFile(new URL("src/client/ui-layer-react/character-data.js", appRoot), "utf8");
  for (const requiredFragment of [
    "startingPercent: 100",
    "startingValue: 50",
    "maximum: 50",
    "startingPercent: 25",
    "startingPercent: 0",
    "pointsNeededForNextLevel: 100",
    "currentAmount: 0",
    "keys: Object.freeze({ startingAmount: 0, currentAmount: 0 })",
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
  if (!styles.includes("grid-template-columns: repeat(3, var(--character-slot-size))")
    || !styles.includes("grid-template-rows: minmax(var(--character-bars-min-height), auto) minmax(0, 1fr)")
    || !styles.includes("--character-bars-min-height: calc((var(--character-bar-height) * 5) + (var(--character-bar-gap) * 4))")
    || !styles.includes("container-type: size")
    || !styles.includes("calc((100cqw - (var(--character-slot-gap) * 2)) / 3)")
    || !styles.includes("calc((100cqh - var(--character-slot-gap)) / 2)")
    || !styles.includes("grid-template-rows: repeat(2, var(--character-slot-size))")
    || !styles.includes("width: min(calc(100dvw")
    || !styles.includes("height: 100%")
    || !styles.includes("max-height: calc(100dvh")
    || !styles.includes(".corner_top_left > .box_layout")
    || !styles.includes("padding: 4px 4px 14px")
    || !styles.includes("padding: 0")
    || !styles.includes("padding-left: 0")
    || !styles.includes("height: var(--character-bars-min-height)")
    || !styles.includes("grid-template-rows: repeat(5, var(--character-bar-height))")
    || !styles.includes("border: 1px solid var(--box-border-color)")
    || !styles.includes("--character-bar-gap: 5px")
    || !styles.includes(".character_slots_grid")
    || !styles.includes(".character_slot")
    || !styles.includes("width: var(--character-slot-size)")
    || !styles.includes("height: var(--character-slot-size)")
    || !styles.includes("min-height: 0")) {
    throw new Error("Character resources and empty inventory slots must share a six-cell grid.");
  }
  for (const requiredFragment of [
    'className="character_details"',
    'data-stat={row.key}',
    'role="progressbar"',
    'data-resource="gold"',
    'data-resource="keys"',
    '>⚿</span>',
    'icon: "♥"',
    'icon: "⚡"',
    'label: "Stamina"',
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
    || !styles.includes(".character_bar_current_max") || !styles.includes("--character-bar-current-max")
    || !styles.includes("--character-bar-delta") || !styles.includes("--character-bar-unfilled")) {
    throw new Error("Character stat bars must expose current, max marker, derived delta, and derived unfilled sections.");
  }
  if (!app.includes("CHARACTER_BAR_DELTA_DURATION_MS")
    || !app.includes("getCharacterBarMaximumPercent")
    || !app.includes("getCharacterBarSegments")
    || !app.includes("setTransitionPercent(fromPercent)")) {
    throw new Error("Every Character bar must use model-supplied percentages and the transient delta lifecycle.");
  }
  if (!app.includes("getStaminaSnapshot") || !app.includes("subscribeToStamina")
    || !app.includes("aria-valuemax={data.maximum ?? 100}")
    || !app.includes("currentValue: staminaCurrent")
    || !app.includes("stamina={stamina}")) {
    throw new Error("The Character HUD must render authoritative current/max stamina through the narrow bridge.");
  }
  for (const requiredFragment of [
    "createStaminaSystem()",
    "staminaSystem,",
    'event?.cause === "movement"',
    'timeSystem.advance(1, "movement")',
    "getRepeatInterval(shiftHeld, exhaustedAtAttempt)",
    "getStaminaSnapshot() { return staminaSystem.getSnapshot(); }",
  ]) {
    if (!gameLayer.includes(requiredFragment)) {
      throw new Error(`The game layer must implement authoritative stamina behavior through ${requiredFragment}.`);
    }
  }
  if (gameLayer.includes("staminaSystem.spendForMovement")) {
    throw new Error("Walking and sprinting must not spend stamina.");
  }
  if (!gameBridge.includes("currentPercent: 25")
    || !gameBridge.includes("previousPercent: 25")
    || !gameBridge.includes("export function sendStaminaSnapshot(snapshot)")
    || !main.includes("controller.subscribeToStamina?.(sendStaminaSnapshot)")) {
    throw new Error("Stamina must cross the existing immutable game-to-React bridge.");
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
  if (!app.includes('titleId="stats_title"') || !app.includes('title="Info"')) {
    throw new Error("The lower-left HUD stats section must be labeled Info.");
  }
  const windowsMarkup = app.slice(app.indexOf('id="windows"'), app.indexOf('id="stats"'));
  if (windowsMarkup.indexOf('id="arguments_toggle"') > windowsMarkup.indexOf('id="ascii_palette_toggle"')
    || windowsMarkup.indexOf('id="ascii_palette_toggle"') > windowsMarkup.indexOf('id="gameplay_settings_toggle"')
    || windowsMarkup.indexOf('id="gameplay_settings_toggle"') > windowsMarkup.indexOf('id="lighting_window_toggle"')) {
    throw new Error("The Windows controls must be ordered alphabetically by visible label.");
  }
  if (!windowsMarkup.includes('className="windows_control_row"')
    || !windowsMarkup.includes('className="corner_body windows_control_separator" aria-hidden="true">/</span>')
    || !windowsMarkup.includes("Args")
    || windowsMarkup.includes("Arguments\n")
    || !styles.includes(".windows_control_row")
    || !styles.includes(".windows_control_separator")
    || !styles.includes("grid-template-columns: max-content max-content max-content")) {
    throw new Error("The Windows controls must render as two compact slash-separated two-button rows.");
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
  if (!gameLayer.includes("getViewOriginForResize")
    || !gameLayer.includes("reapplyCameraMode: true")
    || !gameLayer.includes("world && playerCell")) {
    throw new Error("Viewport changes must reapply the active camera only when playable world state exists.");
  }
  if (!gameLayer.includes("CAMERA_RESOLVE_INTENTS")
    || !gameLayer.includes('initial: "initial"')
    || !gameLayer.includes('activeMode: "active-mode"')
    || !gameLayer.includes('resize: "resize"')
    || !gameLayer.includes('reapply: "reapply"')
    || !gameLayer.includes('transitionPreserve: "transition-preserve"')
    || !gameLayer.includes("const resolveCameraOrigin =")
    || !gameLayer.includes("commit = true")) {
    throw new Error("Camera origin changes must route through named game-layer resolver intents.");
  }
  if (!gameLayer.includes("resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.initial)")
    || !gameLayer.includes("resolveCameraOrigin(sourceScreenCell")
    || !gameLayer.includes("resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.activeMode, { targetCell: nextCell, direction, commit: false })")
    || !gameLayer.includes("setAspectMode()")
    || !gameLayer.includes("rebuildViewport({ reapplyCameraMode: true });")
    || !app.includes("sendAspectSnapshot(aspectMode)")
    || !gameBridge.includes("sendAspectSnapshot")
    || !gameBridge.includes("setAspectMode?.(aspectSnapshot)")) {
    throw new Error("Camera mode must be considered for startup, realm, movement, aspect, and bridge trigger paths.");
  }
  if ((!gameLayer.includes("hideGameCell(slot)") && !gameLayer.includes("renderFogBackingCell"))
    || !gameLayer.includes("for (let slot = region.count; slot < spriteIndexes.length; slot += 1)")
    || !gameLayer.includes("resetLayerSprites();")
    || !gameLayer.includes("renderWorld({ refreshLighting: true });")
    || !gameLayer.includes("? CAMERA_RESOLVE_INTENTS.transitionPreserve")) {
    throw new Error("Camera-triggered renders must reconcile stale cells and preserve covered realm transition presentation.");
  }
  if (!gameLayer.includes("canvas.clientWidth || window.innerWidth")
    || !gameLayer.includes("canvas.clientHeight || window.innerHeight")
    || !gameLayer.includes("new ResizeObserver(handleResize)")
    || !gameLayer.includes("reapplyCameraMode: true")
    || !gameLayer.includes("lastDevicePixelRatio")
    || !gameLayer.includes("watchBrowserZoom")
    || !gameLayer.includes("cameraModeReapplyAfterTransition")) {
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
  if (bottomLeftStart === -1 || !bottomLeftMarkup.includes('id="developer_box"') || !bottomLeftMarkup.includes('>Dev</button>')
    || !bottomLeftMarkup.includes('id="windows"') || !bottomLeftMarkup.includes('id="settings"') || !bottomLeftMarkup.includes("Ascii")
    || bottomLeftMarkup.includes("Ascii Settings") || bottomLeftMarkup.includes("Gameplay Settings")
    || !bottomLeftMarkup.includes("Fullscreen") || !bottomLeftMarkup.includes("Reset Settings") || bottomLeftMarkup.includes('id="show_ui_toggle"')) {
    throw new Error("The lower-left Dev panel must contain the retained Windows and Settings controls without the Developer toggle.");
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
    || !app.includes("showCloseButton={true}") || !app.includes("closeOnBackdropClick")
    || !styles.includes("background: rgb(0 0 0 / 50%)")) {
    throw new Error("Lighting and tutorial windows must share the window class and configurable backdrop behavior.");
  }
  const closeLightingStart = app.indexOf('aria-label="Close Lighting"');
  const closeLightingMarkup = app.slice(app.lastIndexOf("<button", closeLightingStart), app.indexOf("</button>", closeLightingStart));
  if (closeLightingMarkup.includes("aria-description") || app.slice(Math.max(0, closeLightingStart - 300), closeLightingStart).includes("SettingTooltipTarget")) {
    throw new Error("Close controls must not show a tooltip.");
  }
  if (!app.includes('id="arguments_title"') || !app.includes("randomSeed") || !app.includes("skipTutorial")) {
    throw new Error("The Arguments window must document randomSeed and skipTutorial URL arguments.");
  }
  if (!app.includes("getRandomSeedSnapshot") || !app.includes("subscribeToRandomSeed")
    || !app.includes("value: (seedValue) => seedValue") || !app.includes("randomSeed={randomSeed}")) {
    throw new Error("The randomSeed URL argument example must use the current session seed.");
  }
  if (!app.includes('getUrlBooleanArgument(window.location.href, "skipTutorial")')) {
    throw new Error("skipTutorial must default to false and skip the tutorial only when its URL value is true.");
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
  if (!app.includes('className="palette_grid"') || !app.includes('className="palette_index"') || !app.includes('className="palette_glyph"') || !styles.includes("flex-direction: column") || !styles.includes("white-space: nowrap") || !styles.includes("overflow: hidden")) {
    throw new Error("The Ascii Settings overlay must render a compact index and glyph grid.");
  }
  if (!app.includes('"in-maps"') || !app.includes('"customized"') || !app.includes("Filter: ") || !app.includes("Sort: ") || !app.includes("InMaps") || !app.includes(">\n                #\n") || !app.includes(">\n                Abc\n") || !app.includes(">\n                Group\n") || !app.includes("content_options") || !app.includes("palette_group_header") || !app.includes("getPaletteGroupLabel") || !styles.includes("grid-template-columns: repeat(auto-fill, minmax(72px, 1fr))") || !styles.includes("font-size: 10pt")) {
    throw new Error("The Glyphs tab must provide labeled filter and index/alphabet/group sort options.");
  }
  if (!app.includes("paletteViewState") || !app.includes("setPaletteViewState") || app.includes("sessionStorage")) {
    throw new Error("Palette filter and sort choices must last for the page session without surviving refresh.");
  }
  if (!app.includes("HexColorPicker") || !app.includes("createGlyphRasterCanvas") || !app.includes("rasterizeCompositeGlyph(") || !app.includes("colorToLinearRgba({ color, alpha: 1 })") || !app.includes("backgroundDarkness={backgroundDarkness}") || !app.includes("const displayColor = entryId === selectedEntryId && draft ? draft.color : entry.color") || !app.includes("const displayOffsets = entryId === selectedEntryId && draft ? draft : getPaletteEntryOffsets(entry)") || !app.includes("<PaletteGlyph glyph={selectedEntry.glyph}") || !app.includes("offsets={draft}") || !app.includes("Offset X") || !app.includes("Offset Y") || !app.includes("Offset Scale") || app.includes("colorize fontFamily") || app.includes("palette_alpha_control") || !app.includes('aria-label="Glyph Details"') || !app.includes("Confirm") || !app.includes("Reset") || !app.includes("Cancel")) {
    throw new Error("The Glyph Details window must use the shared composite glyph renderer, no alpha control, glyph offset sliders, Confirm, Reset, and Cancel controls.");
  }
  const confirmStart = app.indexOf("confirmEdit = async");
  const confirmEnd = app.indexOf("acknowledgeWarning", confirmStart);
  if (!app.slice(confirmStart, confirmEnd).includes("this.cancelEdit()") || !app.includes("{asciiPaletteOpen ? (")) {
    throw new Error("Confirming a glyph must close only its editor and keep the main palette window open.");
  }
  if (!app.includes("getGlyphDetailsWindowPosition") || !app.includes("containerBounds.height") || !styles.includes(".glyph_details_window") || !styles.includes("max-height: calc(100% - 32px)")) {
    throw new Error("The Glyph Details window must remain inside the Ascii Settings window at every glyph position.");
  }
  if (!app.includes("Hide warning") || !app.includes("Local palette change") || !app.includes("PALETTE_WARNING_KEY")) {
    throw new Error("The deployed palette persistence warning must include the Hide warning choice.");
  }
  if (!app.includes('aria-label="Close Ascii Settings"') || !app.includes(">\n              X\n")) {
    throw new Error("The Ascii Settings overlay must provide an X close control.");
  }
  if (!app.includes(">\n                Layout\n") || !app.includes("Glyph Background") || !app.includes("Background Darkness")
    || !app.includes('min="0"') || !app.includes('max="100"') || !app.includes('step="1"')
    || !app.includes("DEFAULT_GLYPH_BACKGROUND") || !app.includes("DEFAULT_BACKGROUND_DARKNESS")
    || !app.includes("glyphBackgroundStorageKey") || !app.includes("backgroundDarknessStorageKey")) {
    throw new Error("The Ascii Settings Layout tab must expose persisted glyph background and darkness controls.");
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
  if (!app.includes("developerOpenStorageKey") || !app.includes("useState(() => getStoredBoolean(developerOpenStorageKey, false))")
    || !app.includes("localStorage.setItem(developerOpenStorageKey, developerOpen ? \"true\" : \"false\")")
    || !app.includes('className={`developer_panel ${developerOpen ? "developer_panel_open" : "developer_panel_closed"}`}')
    || !app.includes('className="developer_box_body"') || !app.includes('titleClassName="developer-title"')
    || !app.includes('bodyClassName="developer-body-text"') || app.includes('id="show_ui_toggle"')
    || !platformSettings.includes('matchMedia("(pointer: coarse)")') || !platformSettings.includes("zoom: 5")
    || platformSettings.includes("SHOW_UI_STORAGE_KEY") || platformSettings.includes("getStoredShowHud")) {
    throw new Error("Dev must be persisted closed by default and retire the Show UI setting.");
  }
  if (!app.includes("logOpenStorageKey")
    || !app.includes("useState(() => getStoredBoolean(logOpenStorageKey, true))")
    || !app.includes("localStorage.setItem(logOpenStorageKey, logOpen ? \"true\" : \"false\")")) {
    throw new Error("The Log corner open state must persist and restore locally.");
  }
  if (!styles.includes(".developer_box_body") || !styles.includes("overflow: hidden")
    || !styles.includes(".developer-title") || !styles.includes(".developer-body-text")
    || !styles.includes("font-size: 8pt") || styles.includes("data-hud-hidden")
    || main.includes("initializeHudHiddenDataset")) {
    throw new Error("The Dev panel must use scoped 8pt no-scroll styling without the retired HUD-hidden behavior.");
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
    || !app.includes("localStorage.clear()")
    || !app.includes('localStorage.setItem(realmStorageKey, "Overground")')) {
    throw new Error("The GPU light pass checkbox must default on, persist, and reset with settings, including an Overground realm.");
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
  if (!gameLayer.includes('id = "minimap_canvas"') || !gameLayer.includes("createFogMapsForWorld")
    || !gameLayer.includes("discoverFromPlayer") || !gameLayer.includes("getRealmDiscoveryPercent")
    || !gameLayer.includes("subscribeToRealmDiscovery")
    || !gameLayer.includes("getMinimapWorldCellGraphic")
    || !gameLayer.includes("getMinimapMarkers") || !gameLayer.includes("visual.rasters")
    || gameLayer.includes("context.fillText")) {
    throw new Error("The game layer must own fog discovery and actual world-graphic minimap rendering.");
  }
  if (!gameLayer.includes('transitionMask.className = "game_transition_mask"')
    || !gameLayer.includes("createTransitionSystem")
    || !gameLayer.includes("startRealmTransition")
    || !gameLayer.includes("onCovered: () => activateRealm")
    || !gameLayer.includes("onOpening: () =>")
    || !gameLayer.includes("gameplayInputLocked")
    || !gameLayer.includes("if (gameplayInputLocked) return;")
    || !gameLayer.includes("attachReplacementRendererLayer")
    || !gameLayer.includes("presentImmediately();")
    || !gameLayer.includes("transitionActive")
    || !gameLayer.includes("refreshDiscovery({ immediate: true })")) {
    throw new Error("Realm changes must use a game-layer-owned transition that swaps realms at full coverage and locks input.");
  }
  if (!styles.includes(".game_transition_mask")
    || !styles.includes("pointer-events: none")
    || !styles.includes("z-index: 0")
    || !styles.includes("radial-gradient")
    || !styles.includes("--transition-color: #000")
    || !styles.includes("background: #000")) {
    throw new Error("The transition mask must be a pointer-transparent, soft-edged game-only surface above the game canvas and below the minimap.");
  }
  if (!gameLayer.includes("const REALM_TRANSITION_CLOSE_MS = 500")
    || !gameLayer.includes("const REALM_TRANSITION_OPEN_MS = 500")
    || !gameLayer.includes("const INITIAL_TRANSITION_OPEN_MS = 1000")
    || !gameLayer.includes("durationIn: INITIAL_TRANSITION_OPEN_MS")) {
    throw new Error("Realm transitions must use 500ms close/open phases and startup must use a 1000ms reveal.");
  }
  const initialRealmState = gameLayer.indexOf("playerCell = world.playerStart;");
  const initialRealmLog = gameLayer.indexOf("logSystem.log({ message: `Entered the ${activeRealm} Realm` });", initialRealmState);
  const objectSpawnerSetup = gameLayer.indexOf("objectSpawnerSystem = createObjectSpawnerSystem", initialRealmState);
  if (initialRealmState < 0 || initialRealmLog < 0 || objectSpawnerSetup < 0 || initialRealmLog > objectSpawnerSetup) {
    throw new Error("The initial realm must be logged as soon as the player enters it during game startup.");
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
    || !gameLayer.includes("rasterizeCompositeGlyph(glyph, family, size, paletteColors.get(getFacingGlyph(glyph))")
    || !gameLayer.includes("buildGpuLightPassSamples(minimapRegion, minimapLightField, lighting.ambient")
    || !gameLayer.includes('context.globalCompositeOperation = "lighter"')
    || styles.includes("--minimap-zoom")
    || styles.includes(".minimap_status {\n  transform: scale")
    || styles.includes("#minimap_canvas {\n  transform: scale")) {
    throw new Error("Minimap content zoom must stay hidden, persist independently, preserve canvas bounds, and clean up on disposal.");
  }
  if (!styles.includes("#minimap_canvas") || !styles.includes("24vmin")
    || !styles.includes("image-rendering: pixelated") || !styles.includes("pointer-events: auto")) {
    throw new Error("The minimap must use responsive pixel-preserving sizing.");
  }
  if (!app.includes('aria-label="Map icon"') || !app.includes('onClick={activateMinimapZoom}')) {
    throw new Error("The upper-right HUD must expose the box-wide minimap map action.");
  }
  const infoMarkup = app.slice(app.indexOf('id="stats"'), app.indexOf('id="settings"'));
  if (!app.includes('id="mapview_toggle"')
    || !infoMarkup.includes('id="mapview_toggle"')
    || windowsMarkup.includes('id="mapview_toggle"')
    || !app.includes("sendMapviewSnapshot(mapviewOpen)")
    || !app.includes('id="mapview_overlay"')
    || !app.includes('aria-label="Map"')
    || !app.includes('aria-label="Close Map"')
    || !app.includes(">X</button>")
    || !app.includes("Toggle Realm")
    || !app.includes("sendMapviewRealmToggle")
    || app.includes('id="mapview_title"')
    || app.includes("mapview_header")
    || app.includes(">Close</button>")
    || !gameBridge.includes("export function sendMapviewSnapshot(open)")
    || !gameLayer.includes('mapviewCanvas.id = "mapview_canvas"')
    || !gameLayer.includes("getMapviewVisibility")
    || !gameLayer.includes("getMapviewLightingFactor")
    || !gameLayer.includes("getMapviewMarkers")
    || !gameLayer.includes("setMapviewOpen(open)")
    || !gameLayer.includes("toggleMapviewRealm()")
    || !gameLayer.includes("renderWorldViewCompositionCooperatively(composition")
    || !gameLayer.includes("cancelMapviewRender()")
    || !gameLayer.includes("mapviewRenderJob = renderJob")
    || !gameLayer.includes("mapviewRealm = activeRealm")
    || !gameLayer.includes("worldRealms?.realms?.[mapviewRealm] ?? world")
    || !gameLayer.includes("mapviewGlyphCanvases.clear()")
    || !gameLayer.includes("mapviewCanvas.width = 1")
    || !gameLayer.includes("mapviewCanvas.height = 1")
    || !gameBridge.includes("export function sendMapviewRealmToggle()")
    || !styles.includes("#mapview_canvas")
    || !styles.includes(".mapview_overlay")
    || !styles.includes(".mapview_controls")
    || !styles.includes(".mapview_realm_toggle")
    || !styles.includes('html[data-mapview-open="true"] #ui_layer > :not(#mapview_overlay)')
    || !styles.includes("visibility: hidden")
    || !styles.includes("bottom: var(--ui-margin-y, 10px)")
    || !styles.includes("left: var(--ui-margin-x, 10px)")) {
    throw new Error("The Developer Info Map option must open a game-layer-owned fullscreen mapview with lower-left close and realm toggle controls.");
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
    "const heldModifierKeys = new Set();",
    "heldModifierKeys.clear();",
    'const isShiftKey = event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight";',
    "shiftHeld = heldModifierKeys.size > 0 || event.shiftKey;",
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
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  const bridge = await readFile(new URL("src/client/bridge-layer/game-bridge.js", appRoot), "utf8");
  const gameLayer = await readFile(new URL("src/client/game-layer-babylon-lite/index.js", appRoot), "utf8");
  const styles = await readStyles();
  for (const eventName of ["player moved up", "player moved down", "player moved left", "player moved right"]) {
    if (!bridge.includes(eventName) || !gameLayer.includes(`PLAYER_MOVED_EVENTS.`)) {
      throw new Error("The game-to-UI movement contract must expose all four generic player-moved events.");
    }
  }
  if (!app.includes("subscribeToPlayerMoved") || !app.includes("tutorialDirectionsRef")
    || !app.includes("You completed the tutorial. Enjoy the game!") || !app.includes('const title = "How To Play"')
    || !app.includes("Move the player")
    || !app.includes("Use arrow keys (or swipe touch) to move")
    || !app.includes("Hold shift (or hold touch) to move faster")
    || !app.includes("How To Play") || !app.includes("Next") || !app.includes("Skip Tutorial")
    || !app.includes("tutorialSkipStorageKey") || !app.includes(">Ok</button>")
    || app.includes("Don't show me this again")
    || !app.includes('aria-label="Close Tutorial"') || !app.includes("showCloseButton") || !app.includes("closeOnBackdropClick")
    || !app.includes("onClose={() => setTutorialPhase(\"finished\")}")) {
    throw new Error("The tutorial must be event-driven, skippable, and dismissible through its action buttons, close control, or backdrop.");
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

test("documents Escape dismissal for closeable windows", async () => {
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  for (const required of [
    'event.key !== "Escape"',
    "closeTopmostWindow",
    "setProceduralSettingsOpen(false)",
    "setGameplaySettingsOpen(false)",
    "setArgumentsOpen(false)",
    "setAsciiPaletteOpen(false)",
    "setLightingWindowOpen(false)",
    'setTutorialPhase("finished")',
    'window.addEventListener("keydown", closeTopmostWindow, true)',
  ]) {
    if (!app.includes(required)) {
      throw new Error("Escape must close exactly one of the closeable utility or tutorial windows.");
    }
  }
});

test("documents the player death lifecycle and recovery prompt", async () => {
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  const bridge = await readFile(new URL("src/client/bridge-layer/game-bridge.js", appRoot), "utf8");
  const main = await readFile(new URL("src/main.jsx", appRoot), "utf8");
  const gameLayer = await readFile(new URL("src/client/game-layer-babylon-lite/index.js", appRoot), "utf8");
  const objectData = await readFile(new URL("src/client/game-layer-babylon-lite/data/object_data.json", appRoot), "utf8");
  const styles = await readStyles();
  if (!objectData.includes('"amount": -25') || !objectData.includes('"Lost -25 Health from Trap"')
    || !gameLayer.includes("createPlayerLifecycle") || !gameLayer.includes("playerLifecycle.isDead()")
    || !gameLayer.includes("applyHealthDelta(-25)")) {
    throw new Error("The game layer must own the lethal Trap consequence and player-death boundary.");
  }
  if (!bridge.includes("getPlayerDeadSnapshot") || !bridge.includes("subscribeToPlayerDead")
    || !bridge.includes("sendPlayerDeadSnapshot") || !main.includes("sendPlayerDeadSnapshot")) {
    throw new Error("The bridge must expose the immutable player-dead snapshot to React.");
  }
  if (!app.includes("function DeathWindow") || !app.includes(">Adventure</div>")
    || !app.includes("You have died.") || !app.includes("<li>XP: 00</li>")
    || !app.includes("<li>Gold: 00</li>") || !app.includes("<li>Time: 00</li>")
    || !app.includes(">Restart Game</button>") || !app.includes("window.location.reload()")
    || !app.includes("blockDeadRunInput")) {
    throw new Error("The death prompt must preserve the exact Adventure copy and restart behavior.");
  }
  if (!styles.includes(".death_window_summary")) {
    throw new Error("The death prompt summary must have dedicated compact list styling.");
  }
});

test("documents the quest tracker, live gold bridge, and quest toasts", async () => {
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  const bridge = await readFile(new URL("src/client/bridge-layer/game-bridge.js", appRoot), "utf8");
  const styles = await readStyles();
  if (!app.includes("Quest: ${quest.title}") || !app.includes("quest_tracker_step_complete")
    || !app.includes("quest_tracker_title_complete")
    || !app.includes("quest_tracker_marker") || !app.includes("isActiveStep") || !app.includes('quest.state === "pending"')
    || !app.includes("quest.steps") || !app.includes("step.label") || !app.includes("!step.hideProgress && step.target > 1")
    || !app.includes("subscribeToQuestEvent") || !app.includes("Quest Started: ${quest.title}.") || !app.includes("Quest Progress: ${changedStep.label}")
    || !app.includes("Quest Completed: ${quest.title}.")) {
    throw new Error("The React HUD must render live quest text and state-specific quest toasts.");
  }
  if (!bridge.includes("getQuestSnapshot") || !bridge.includes("subscribeToQuest")
    || !bridge.includes("getGoldSnapshot") || !bridge.includes("subscribeToGold")) {
    throw new Error("The bridge must expose quest and client gold snapshots.");
  }
  if (!styles.includes(".quest_tracker") || !styles.includes(".quest_tracker_marker")
    || !styles.includes(".quest_tracker_title_complete")
    || !styles.includes("border-left: 7px solid #ffff00") || !styles.includes("top: calc(var(--top-panel-size) + 12.5px)")
    || !styles.includes("margin-left: 5px") || !styles.includes("text-decoration: line-through")) {
    throw new Error("The quest tracker must preserve the requested HUD spacing, indent, and completion style.");
  }
  if (!styles.includes('html[data-presentation-aspect="portrait"] .toast')
    || !styles.includes("--toast-horizontal-inset: 0px")
    || !styles.includes("width: calc(100vw - 40px)")
    || !styles.includes("max-width: calc(100vw - 40px)")
    || !styles.includes("min-height: 78px")) {
    throw new Error("Portrait presentation toasts must remain horizontally centered in the screen frame.");
  }
});

test("documents the Gameplay Settings quest selector and default persistence", async () => {
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  const questData = JSON.parse(await readFile(new URL("src/client/game-layer-babylon-lite/data/quest_data.json", appRoot), "utf8"));
  const gameLayer = await readFile(new URL("src/client/game-layer-babylon-lite/index.js", appRoot), "utf8");
  const bridge = await readFile(new URL("src/client/bridge-layer/game-bridge.js", appRoot), "utf8");
  const styles = await readStyles();
  if (!app.includes('id="gameplay_settings_toggle"') || !app.includes("Gameplay Settings")
    || !app.includes('id="gameplay_settings_title"') || !app.includes(">Quests</h2>")
    || !app.includes('role="tablist" aria-label="Gameplay settings sections"')
    || !app.includes('className="prompt_tab" type="button" role="tab" aria-selected="true"')
    || !app.includes("questData.quests.map") || !app.includes("Default Quest")
    || !app.includes("defaultQuestStorageKey") || !app.includes("localStorage.setItem(defaultQuestStorageKey, id)")
    || !app.includes("startQuest(id)") || !app.includes("QuestLayout")) {
    throw new Error("Gameplay Settings must provide the quest catalog, selection, and default persistence.");
  }
  if (questData.quests.length < 2 || !questData.quests.some((definition) => definition.id === "unlock-a-door")) {
    throw new Error("The Gameplay Settings quest tab must be backed by the complete quest catalog, including Unlock A Door.");
  }
  if (!gameLayer.includes('babylon-lite-ascii-rpg.default-quest') || !gameLayer.includes("initialQuestId")
    || !gameLayer.includes("startQuest(id)")) {
    throw new Error("The game layer must restore and validate the saved default quest.");
  }
  if (!bridge.includes("export function startQuest(id)")) {
    throw new Error("The bridge must expose quest selection without exposing game internals.");
  }
  if (!styles.includes(".quest_settings_card") || !styles.includes(".quest_settings_list")
    || !styles.includes(".gameplay_settings_body") || !styles.includes("overflow: auto")) {
    throw new Error("Gameplay Settings must use a bounded, scrollable quest card layout.");
  }
});

test("derives the character gold icon color from the shared palette", async () => {
  const app = await readFile(new URL("src/client/ui-layer-react/App.jsx", appRoot), "utf8");
  const palette = JSON.parse(await readFile(new URL("src/client/game-layer-babylon-lite/data/palette_data.json", appRoot), "utf8"));
  if (!app.includes('getPaletteStyle(palette, "💰")') || !app.includes("style={{ color: goldStyle.color }}")) {
    throw new Error("The character gold icon must resolve its color from the shared palette.");
  }
  if (palette.entries.find((entry) => entry.glyph === "💰")?.color !== "#ffff00") {
    throw new Error("The bundled gold glyph must default to yellow.");
  }
});
