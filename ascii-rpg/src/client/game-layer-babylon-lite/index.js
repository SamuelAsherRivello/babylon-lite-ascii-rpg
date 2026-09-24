import { isGenerationDiagnosticsEnabled } from "../generation-mode.js";
import { startSprintDiagnostic } from "./sprint-diagnostic.js";
import {
  addSpriteRendererLayer,
  addSprite2DIndex,
  createEngine,
  createSpriteAtlasFromFrames,
  createSprite2DLayer,
  createSpriteRenderer,
  disposeEngine,
  disposeSpriteAtlas,
  disposeSpriteRenderer,
  removeSpriteRendererLayer,
  registerSpriteRenderer,
  renderFrame,
  resizeEngine,
  startEngine,
  stopEngine,
  spriteBlendAdditive,
  updateSprite2DIndex,
} from "@babylonjs/lite";
import { getBrowserZoomCompensation, getBrowserZoomFactor } from "./browser-zoom-compensation.js";
import {
  DEFAULT_FONT_RESOLUTION,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_UPSCALE,
  INITIAL_REPEAT_DELAY_MS,
  createViewport,
  getCellCenter,
  getPixelSnappedCellBounds,
  getCombinedDirection,
  getDirectionForKey,
  getDirectionForSwipe,
  getRepeatInterval,
  getInitialViewOriginForCamera,
  getViewOriginForPreservedPlayerPosition,
  getViewOriginForCamera,
  getViewOriginForResize,
  moveWorldCell,
} from "./characters/player/player-grid.js";
import { normalizeCameraMode } from "../bridge-layer/camera.js";
import { getFontOption, validateFontId } from "../bridge-layer/font.js";
import { getPaletteEntryId, getPaletteEntryOffsets, getPaletteStyle, validatePaletteEntries } from "../bridge-layer/palette.js";
import { PLAYER_MOVED_EVENTS, sendKeySnapshot, sendPlayerMovedEvent } from "../bridge-layer/game-bridge.js";
import {
  createGeneratedSeed,
  createRandom,
  createWorldRealms,
  PROJECT_MAP_GLYPHS,
  PLAYER_GLYPH,
  GOLD_GLYPH,
  HEALTH_GLYPH,
  TRAP_GLYPH,
  CLOSED_CHEST_GLYPH,
  WALL_GLYPH,
  MOUNTAIN_GLYPH,
  TORCH_GLYPH,
  FIREPLACE_GLYPH,
  STAIR_GLYPH,
  getRandomSeedFromSearch,
  getWorldGenerationLayersEnabledFromSearch,
  getVisibleGlyph,
  normalizePlayerMarkers,
} from "./world-state-facade.js";
import { createTimeSystem } from "./systems/time-system.js";
import { FACING_LEFT, FACING_RIGHT, createGlyphRasterCanvas, createGlyphVisualCache, getFacingGlyph, getFacingGlyphKey, getGlyphOffsetsFromKey, getGlyphOffsetKey, getOffsetGlyphKey, rasterizeCompositeGlyph, rasterizeGlyph, rasterizeSolidGlyph } from "./glyph-visual-cache.js";
import { getVisibleRegion, getVisibleSlot, shouldUpdateVisibleSprite } from "./visible-region.js";
import { collectWorldViewGlyphs, createWorldViewComposition, renderWorldViewComposition, renderWorldViewCompositionCooperatively } from "./world-view.js";
import { colorToLinearRgba, linearRgbaToRendererHex, reconcilePaletteColors } from "./palette-color-cache.js";
import {
  applyLightingToColor,
  createLightingConfig,
  createSceneLightingFieldCache,
  DEFAULT_LIGHTING,
  getLightingProfile,
  getShadowProfile,
} from "./lighting.js";
import { buildGpuLightPassSamples, createGpuLightPassFrame, getGpuLightPassAlpha, GPU_LIGHT_PASS_COLOR } from "./gpu-light-pass.js";
import {
  createFogOfWar,
  createFogMapsForWorld,
  ensureFogMetrics,
  discoverCell,
  discoverFromPlayer,
  discoverStartingArea,
  getFogVisibility,
  getRealmDiscoveryPercent,
  isDiscovered,
} from "./systems/fog-of-war-system.js";
import { findNearestNavigationTarget, getMinimapEdgeIndicators, getMinimapIndicatorSafeArea, getMinimapMarkers, getMinimapWorldCellGraphic, MINIMAP_INDICATOR_MIN_SIZE, MINIMAP_INDICATOR_SAFE_INSET } from "./systems/minimap-renderer.js";
import { AStarUtility } from "./utilities/a-star-utility.js";
import { canHandleMinimapScale, getMinimapCellLayout, getMinimapCellSize, getNextMinimapScale, MINIMAP_SCALE_LEVELS } from "./systems/minimap-zoom.js";
import { createTransitionSystem, TRANSITION_PHASES } from "./systems/transition-system.js";
import questData from "./data/quest_data.json";
import objectData from "./data/object_data.json";
import { createObjectSpawnerSystem, placeDeclaredLevelObjects, selectObjectCells } from "./systems/object-spawner-system.js";
import { createQuestManager } from "./systems/quest-system.js";
import { createLogSystem } from "./systems/log-system.js";
import { createGameplayEventSystem } from "./systems/gameplay-event-system.js";
import { createRealmSystem } from "./systems/realm-system.js";
import { createPlayerLifecycle } from "./systems/player-lifecycle.js";
import { createStaminaSystem } from "./systems/stamina-system.js";
import { createExperienceSystem } from "./systems/experience-system.js";
import { calculatePlayerDamageTaken, createCombatStatsSystem } from "./systems/combat-stats-system.js";
import { createCivilizationGroups, isCardinalDirection } from "./systems/civilization-system.js";
import { createOverworldBuildings, getIndexedBuildingGlyph, getBuildingPresentationDirtyCells } from "./systems/building-system.js";
import { createDynamicOccupancy, getDynamicVisibleGlyph } from "./systems/dynamic-occupancy.js";
import { createEnemySystem } from "./systems/enemy-system.js";
import { createEnemySpawnerSystem, selectEnemySpawnerCells } from "./systems/enemy-spawner-system.js";
import { createNpcSystem } from "./systems/npc-system.js";
import { createNpcSpawnerSystem, selectNpcSpawnerCells } from "./systems/npc-spawner-system.js";
import { getMapviewLayout, getMapviewLightingFactor, getMapviewMarkers } from "./systems/mapview-renderer.js";
import { resolvePlayerCombatTurn } from "./systems/combat-system.js";
import { damageMountainTarget, getDiggableMountainTarget } from "./systems/mountain-system.js";
import { createCharacterState, createContactTarget, damageCharacterItem, DEFAULT_CHARACTER_STATE, resolveCharacterContact } from "./systems/character-state-contact-system.js";
import { createHealthBarSystem } from "./systems/health-bar-system.js";
import { createFloatingTextSystem } from "./systems/floating-text-system.js";
import { getFloatingTextStyle } from "./systems/floating-text-renderer.js";
import {
  createSolidHealthBarFrame,
  getHealthBarSpriteGeometry,
  HEALTH_BAR_DELTA_COLOR,
  HEALTH_BAR_FILL_COLOR,
  HEALTH_BAR_LAYER_ORDER,
  HEALTH_BAR_OUTLINE_COLOR,
  HEALTH_BAR_TRACK_COLOR,
} from "./systems/health-bar-renderer.js";
import { attachReplacementRendererLayer } from "./systems/renderer-layer-handoff.js";
import { createCoalescedFrameScheduler } from "./movement-render-scheduler.js";
import { createDeferredWorkScheduler } from "./deferred-work-scheduler.js";
import { PERFORMANCE_SCENARIOS, performanceMonitor } from "./performance-monitor.js";
import { createRendererLifecycle } from "./renderer-lifecycle.js";
import { createVisualInvalidation } from "./visual-invalidation.js";
import { createWorldViewCache } from "./world-view-cache.js";
import { resolveGenerationProfile } from "./generation-profile.js";
import { createGameSession } from "./game-session.js";
import { initializeDynamicGenerationFeatures } from "./generation-layers/dynamic-entity-generation-layer.js";
import { createRenderSchedulingController } from "./game-session/render-scheduling-controller.js";
import { createInputController } from "./game-session/input-controller.js";
import { createRenderControllers } from "./game-session/render-controller.js";
import { resolveGenerationPlan } from "./world-feature-generation-registry.js";
import { getWorldSizeDimensions } from "../world-size-settings.js";

const GLYPHS = PROJECT_MAP_GLYPHS;
const FOG_BACKING_GLYPH = "\u0000fog-backing";
const FOG_BACKING_COLOR = Object.freeze([0.06, 0.06, 0.06, 1]);
// Match default emoji presentation or an explicit emoji variation selector.
// This makes a newly added emoji automatically use the world-view footprint
// below, while text-presentation symbols such as ♥ and ☠ retain normal sizing.
const EMOJI_PRESENTATION_PATTERN = /\p{Emoji_Presentation}/u;
const EMOJI_VARIATION_SELECTOR = "\uFE0F";
const MINIMAP_EMOJI_CELL_RATIO = 0.7;
const TORCHES_PER_SCREEN = 3;
const REALM_TRANSITION_CLOSE_MS = 500;
const REALM_TRANSITION_COVER_HOLD_MS = 100;
const REALM_TRANSITION_OPEN_MS = 500;
const INITIAL_TRANSITION_OPEN_MS = 1000;
const INITIAL_SPRITE_LAYER_CAPACITY = 4096;
const STARTING_FOG_CLEAR_ZOOM = 5;
const PROCEDURAL_PREVIEW_OBJECT_ICON_SIZE = Object.freeze({
  minimumPixels: 12,
  maximumPixels: 36,
  cellMultiplier: 6,
});
const CAMERA_RESOLVE_INTENTS = Object.freeze({
  initial: "initial",
  activeMode: "active-mode",
  resize: "resize",
  reapply: "reapply",
  transitionPreserve: "transition-preserve",
});

function getInitialSpriteLayerCapacity(viewport) {
  return Math.max(1, Math.min(INITIAL_SPRITE_LAYER_CAPACITY, viewport.rows * viewport.columns));
}

export function startGameLayer(...args) {
  return createGameSession(createGameSessionImplementation, ...args);
}

function getMinimapGlyphBounds(glyph, x, y, cellWidth, cellHeight) {
  const displayGlyph = getFacingGlyph(glyph);
  const isEmoji = EMOJI_PRESENTATION_PATTERN.test(displayGlyph)
    || displayGlyph.includes(EMOJI_VARIATION_SELECTOR);
  if (!isEmoji) return { x, y, width: cellWidth, height: cellHeight };
  const width = cellWidth * MINIMAP_EMOJI_CELL_RATIO;
  const height = cellHeight * MINIMAP_EMOJI_CELL_RATIO;
  return { x: x + (cellWidth - width) / 2, y: y + (cellHeight - height) / 2, width, height };
}

function getSettingsPreviewGlyphBounds(realm, glyph, x, y, cellWidth, cellHeight, devicePixelRatio) {
  const normalBounds = getMinimapGlyphBounds(glyph, x, y, cellWidth, cellHeight);
  const emphasizedGlyph = realm === "Underground" ? WALL_GLYPH : MOUNTAIN_GLYPH;
  if (getFacingGlyph(glyph) !== emphasizedGlyph) return normalBounds;
  const size = Math.max(
    16 * devicePixelRatio,
    Math.min(48 * devicePixelRatio, Math.min(cellWidth, cellHeight) * 8),
  );
  return {
    x: x + (cellWidth - size) / 2,
    y: y + (cellHeight - size) / 2,
    width: size,
    height: size,
  };
}

function getRenderedCellCenter(cell, viewport, world) {
  const worldFitsHorizontally = viewport.columns >= world.columns;
  const worldFitsVertically = viewport.rows >= world.rows;
  const offsetX = worldFitsHorizontally
    ? Math.max(0, (viewport.screenWidth - world.columns * viewport.gridWidth) / 2)
    : 0;
  const offsetY = worldFitsVertically
    ? Math.max(0, (viewport.screenHeight - world.rows * viewport.gridHeight) / 2)
    : 0;
  return {
    x: offsetX + cell.x * viewport.gridWidth + viewport.gridWidth / 2,
    y: offsetY + cell.y * viewport.gridHeight + viewport.gridHeight / 2,
  };
}

function getRenderedCellSpriteBounds(cell, viewport, world) {
  const worldFitsHorizontally = viewport.columns >= world.columns;
  const worldFitsVertically = viewport.rows >= world.rows;
  return getPixelSnappedCellBounds(cell, viewport, {
    x: worldFitsHorizontally
      ? Math.max(0, (viewport.screenWidth - world.columns * viewport.gridWidth) / 2)
      : 0,
    y: worldFitsVertically
      ? Math.max(0, (viewport.screenHeight - world.rows * viewport.gridHeight) / 2)
      : 0,
  });
}

function createViewportForCanvas(canvas, zoom = DEFAULT_ZOOM) {
  const screenWidth = canvas.clientWidth || window.innerWidth;
  const screenHeight = canvas.clientHeight || window.innerHeight;

  return createViewport({
    screenWidth,
    screenHeight,
    upscale: DEFAULT_UPSCALE,
    zoom,
    fontResolution: DEFAULT_FONT_RESOLUTION,
    gridWidth: DEFAULT_GRID_WIDTH,
    gridHeight: DEFAULT_GRID_HEIGHT,
  });
}

function getObjectDistributionCount(type, seed) {
  const distribution = objectData.objects.find((object) => object.type === type)?.distribution;
  if (!distribution?.minCount || !distribution?.maxCount) return 0;
  return distribution.minCount + Math.floor(createRandom(`${seed}:${type}:count`)() * (distribution.maxCount - distribution.minCount + 1));
}

function getTorchCountForViewport(viewport, seed) {
  void viewport;
  return getObjectDistributionCount("torch", seed);
}

/**
 * Starts the non-React Babylon Lite game client and returns its narrow UI bridge.
 * The bridge deliberately exposes only the UI-facing game state and controls.
 */
async function createGameSessionImplementation(container, initialPalette, initialFontId = "monospace", initialRealm = "Overground", initialCameraMode = "lock", generationSettings = { passes: [] }, initialZoom = DEFAULT_ZOOM) {
  if (!container || !navigator.gpu) {
    throw new Error("Babylon Lite requires WebGPU; the game world was not started.");
  }

  validatePaletteEntries(initialPalette);
  validateFontId(initialFontId);
  const diagnostics = isGenerationDiagnosticsEnabled();
  let stopSprintDiagnostic = null;
  const enabledLayerOrders = diagnostics ? getWorldGenerationLayersEnabledFromSearch(window.location.search) : undefined;
  const runtimeGenerationSettings = enabledLayerOrders === undefined ? generationSettings : {
    ...generationSettings,
    passes: generationSettings.passes.map((pass) => ({
      ...pass,
      enabled: pass.required === true || enabledLayerOrders.includes(pass.order),
    })),
  };
  const worldDimensions = getWorldSizeDimensions(runtimeGenerationSettings.worldSize);
  const { caveWallFillPercents, caveSmoothingIterationsByRealm, walkabilityWallOffset, waterFillPercent, waterLakeCount, minWalkableMultiplier, objectCountMultipliers, chestCount, torchCountMultiplier, stairsCountMultiplier, fireplaceDensity, civilizationChanceMultiplier, homeChanceMultiplier, maxEnemySpawners, npcSpawnerCount, playerStartMode } = resolveGenerationProfile(runtimeGenerationSettings);
  const generationPlan = resolveGenerationPlan(runtimeGenerationSettings);
  const plannedFeature = (id) => generationPlan.find((feature) => feature.id === id);
  const featureEnabled = (id) => plannedFeature(id)?.enabled !== false;
  const featureSeedNamespace = (id) => plannedFeature(id)?.seedNamespace ?? id;
  const canvas = document.createElement("canvas");
  canvas.id = "game_canvas";
  canvas.setAttribute("aria-label", "Ascii RPG game");
  const minimapCanvas = document.createElement("canvas");
  minimapCanvas.id = "minimap_canvas";
  minimapCanvas.setAttribute("aria-label", "Exploration minimap");
  const mapviewCanvas = document.createElement("canvas");
  mapviewCanvas.id = "mapview_canvas";
  mapviewCanvas.setAttribute("aria-label", "Developer mapview");
  mapviewCanvas.hidden = true;
  const transitionMask = document.createElement("div");
  transitionMask.className = "game_transition_mask";
  transitionMask.setAttribute("aria-hidden", "true");
  transitionMask.hidden = true;
  const floatingTextLayer = document.createElement("div");
  floatingTextLayer.className = "floating_text_layer";
  floatingTextLayer.setAttribute("aria-hidden", "true");
  container.replaceChildren(canvas, minimapCanvas, mapviewCanvas, transitionMask, floatingTextLayer);

  let engine;
  let renderer;
  let atlas;
  let layer;
  let glyphCache;
  let minimapGlyphCache;
  let gpuLightAtlas;
  let gpuLightLayer;
  let healthBarAtlas;
  let healthBarLayer;
  let gpuLightPassEnabled = false;
  const minimapGlyphCanvases = new Map();
  const mapviewGlyphCanvases = new Map();
  const settingsMapGlyphCanvases = new Map();
  const minimapGpuLightSamples = [];
  let disposed = false;
  const deferredWorkScheduler = createDeferredWorkScheduler({
    scheduleFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    isVisible: () => !disposed && document.visibilityState !== "hidden",
    sliceMs: 4,
    presentationFrames: 2,
  });
  const rendererLifecycle = createRendererLifecycle();
  const visualInvalidation = createVisualInvalidation();
  const worldViewCache = createWorldViewCache({ maxResources: 4 });
  let playable = false;
  let repeatTimer = null;
  let minimapRenderFrame = null;
  let mapviewRenderFrame = null;
  let minimapContentRevision = 0;
  let mapviewContentRevision = 0;
  let minimapDirtyCells = [];
  let minimapForceFull = false;
  let mapviewDirtyCells = [];
  let mapviewForceFull = false;
  let presentationFrame = null;
  let healthBarAnimationFrame = null;
  let floatingTextAnimationFrame = null;
  let lastPresentationTime = 0;
  let movementRenderScheduler = null;
  let generationController = new AbortController();
  let generating = false;
  const heldKeys = new Set();
  const heldModifierKeys = new Set();
  let shiftHeld = false;
  const realmListeners = new Set();
  const realmDiscoveryListeners = new Set();
  const minimapZoomListeners = new Set();
  let touchDirection = null;
  let activePointerId = null;
  let touchStart = null;
  let transitionActive = false;
  let initialRevealActive = false;
  let gameplayInputLocked = true;
  let mapviewOpen = false;
  let mapviewRealm = null;
  let mapviewRenderJob = null;
  let inputController = null;
  let renderControllers = null;
  let settingsMapRenderJob = null;
  let settingsMapGenerationController = null;
  let settingsMapPreviewRevision = 0;
  let settingsMapPreviewCanvas = null;
  let transitionSystem = null;
  let transitionCenter = null;
  let playerRenderCenter = null;
  let zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(Number(initialZoom) || DEFAULT_ZOOM)));
  let viewport = createViewportForCanvas(canvas, zoom);
  let lastCanvasSize = {
    width: Math.max(1, canvas.clientWidth || window.innerWidth),
    height: Math.max(1, canvas.clientHeight || window.innerHeight),
  };
  let lastDevicePixelRatio = window.devicePixelRatio || 1;
  const baselineDevicePixelRatio = lastDevicePixelRatio;
  const baselineBrowserZoomFactor = getBrowserZoomFactor({
    outerWidth: window.outerWidth,
    innerWidth: window.innerWidth,
    devicePixelRatio: baselineDevicePixelRatio,
  });
  let canvasResizeObserver = null;
  let browserZoomMediaQuery = null;
  let aspectRebuildFrame = null;
  let activeAspectMode = document.documentElement.dataset.presentationAspect === "portrait"
    ? "portrait"
    : "landscape";
  const applyBrowserZoomCompensation = () => {
    const compensation = getBrowserZoomCompensation({
      currentDevicePixelRatio: getBrowserZoomFactor({
        outerWidth: window.outerWidth,
        innerWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio || 1,
      }),
      baselineDevicePixelRatio: baselineBrowserZoomFactor,
      isCoarsePointer: window.matchMedia?.("(pointer: coarse)")?.matches === true,
    });
    container.style.setProperty("--game-browser-zoom", String(compensation.ratio));
    container.style.setProperty("--game-browser-zoom-inverse", String(compensation.inverse));
  };
  applyBrowserZoomCompensation();
  let world = null;
  let worldRealms = null;
  let sessionSeed = null;
  let activeRealm = initialRealm === "Underground" ? "Underground" : "Overground";
  mapviewRealm = activeRealm;
  let playerCell = null;
  let playerFacing = FACING_LEFT;
  let characterGold = 0;
  let characterKeys = 0;
  let characterState = createCharacterState(DEFAULT_CHARACTER_STATE);
  const playerLifecycle = createPlayerLifecycle();
  let checkpoint = null;
  let checkpointRevision = 0;
  const checkpointListeners = new Set();
  let questManager = null;
  let objectSpawnerSystem = null;
  let enemySystem = null;
  let enemySpawnerSystem = null;
  let npcSystem = null;
  let npcSpawnerSystem = null;
  let mountainSystem = null;
  const dynamicOccupancies = new Map();
  const staticOccupancyIndexes = new Map();
  const healthBarSystem = createHealthBarSystem();
  const floatingTextSystem = createFloatingTextSystem();
  const questListeners = new Set();
  const questEventListeners = new Set();
  const goldListeners = new Set();
  const characterStateListeners = new Set();
  let fogOfWar = null;
  let minimapZoom = 1;
  let viewOrigin = { x: 0, y: 0 };
  let initialWorldRenderComplete = false;
  let initialPlayableRenderComplete = false;
  let cameraModeReapplyAfterTransition = false;
  let cameraMode = normalizeCameraMode(initialCameraMode);
  const timeSystem = createTimeSystem(undefined, { scheduler: deferredWorkScheduler });
  const staminaSystem = createStaminaSystem();
  const experienceSystem = createExperienceSystem();
  const combatStatsSystem = createCombatStatsSystem({ staminaSystem });
  const stopStaminaTimeRecovery = timeSystem.subscribe((time, event) => {
    if (event?.cause === "movement") staminaSystem.recoverForTimeTick();
  });
  const logSystem = createLogSystem();
  const gameplayEvents = createGameplayEventSystem();
  const realmSystem = createRealmSystem({ eventSystem: gameplayEvents });
  let palette = initialPalette.map((entry) => ({ ...entry }));
  let paletteColors = reconcilePaletteColors(null, palette).colors;
  let paletteOffsets = new Map(palette.map((entry) => [entry.glyph, getPaletteEntryOffsets(entry)]));
  let lighting = {
    ambient: DEFAULT_LIGHTING.ambient,
    torchProfile: getLightingProfile("Med").config,
    playerProfile: getLightingProfile("X High").config,
    torchShadow: getShadowProfile("X High").config,
    playerShadow: getShadowProfile("High").config,
    playerGpuShadowBleedRange: 2,
  };
  let realmAmbient = { Overground: 0.9, Underground: 0.1 };
  const lightingFieldCache = createSceneLightingFieldCache();
  let fontId = initialFontId;
  let glyphBackgroundEnabled = true;
  let backgroundDarkness = 50;
  const spriteIndexes = [];
  const spriteStates = [];
  const gpuLightSpriteIndexes = [];
  const gpuLightSpriteStates = [];
  const gpuLightSamples = [];
  const healthBarSprites = new Map();
  const floatingTextElements = new Map();
  let gpuLightActiveSlots = new Uint8Array(0);
  const metrics = {
    visibleCells: 0, submittedCells: 0, skippedCells: 0, glyphWarmupMs: 0,
    generationMs: null, firstVisibleRenderMs: null, totalReadyMs: null,
    lastZoomRerenderMs: null, lastZoomWarmupMs: null,
    generationYields: 0, generationWaitMs: 0, generationPhases: {},
  };
  const unsubscribeDeferredWorkMetrics = deferredWorkScheduler.subscribe((event) => {
    if (!performanceMonitor.isActive()) return;
    const context = { feature: event.metadata?.type ?? "unknown", state: event.state ?? "pending" };
    if (event.type === "started") performanceMonitor.recordPhase("deferred-queue-wait", event.waitMs, context);
    if (event.type === "settled") {
      performanceMonitor.recordPhase("deferred-work", event.durationMs, context);
      if (deferredWorkScheduler.snapshot().pending === 0) {
        performanceMonitor.markMilestone("deferred-complete");
        if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) performanceMonitor.stop("completed");
      }
    }
  });

  const getPerformanceEnvironment = () => ({
    viewport: {
      width: canvas.clientWidth || window.innerWidth,
      height: canvas.clientHeight || window.innerHeight,
    },
    devicePixelRatio: window.devicePixelRatio || 1,
    zoom,
    visibility: document.visibilityState,
    focused: document.hasFocus?.() ?? true,
  });
  performanceMonitor.updateEnvironment(getPerformanceEnvironment());

  const finishStartupPerformance = () => {
    if (performanceMonitor.getActiveScenario() !== PERFORMANCE_SCENARIOS.STARTUP) return;
    performanceMonitor.markMilestone("input-ready");
    if (deferredWorkScheduler.snapshot().pending === 0) {
      performanceMonitor.markMilestone("deferred-complete");
      performanceMonitor.stop("completed");
    }
  };

  const getOccupancyForWorld = (targetWorld = world) => dynamicOccupancies.get(targetWorld?.realmName) ?? null;
  const getClientVisibleRecord = (targetWorld, cell) => getOccupancyForWorld(targetWorld)?.getAt(cell) ?? null;
  const getBuildingOverlayGlyph = (targetWorld, cell) => getIndexedBuildingGlyph(targetWorld?.buildings, cell, targetWorld.playerCell ?? playerCell);
  const getClientVisibleGlyph = (targetWorld, cell) => {
    const dynamicGlyph = getDynamicVisibleGlyph(getOccupancyForWorld(targetWorld), targetWorld, cell, () => null);
    return dynamicGlyph ?? targetWorld?.characters?.[cell.y]?.[cell.x] ?? getBuildingOverlayGlyph(targetWorld, cell) ?? getVisibleGlyph(targetWorld, cell);
  };
  const markPlayable = () => {
    playable = true;
    gameplayInputLocked = mapviewOpen;
    performanceMonitor.markPlayable();
  };
  const getClientVisibleGlyphKey = (targetWorld, cell) => {
    const record = getClientVisibleRecord(targetWorld, cell);
    const glyph = record?.glyph ?? targetWorld?.characters?.[cell.y]?.[cell.x] ?? getBuildingOverlayGlyph(targetWorld, cell) ?? getVisibleGlyph(targetWorld, cell);
    return getOffsetGlyphKey(getFacingGlyphKey(glyph, record?.facing), paletteOffsets.get(glyph));
  };
  const setPlayerFacingFromDirection = (direction) => {
    if (direction.x === 0) return;
    playerFacing = direction.x > 0 ? FACING_RIGHT : FACING_LEFT;
    getOccupancyForWorld()?.update("player", { facing: playerFacing });
  };

  const notifyQuest = (snapshot) => {
    for (const listener of questListeners) listener(snapshot);
  };

  const notifyGold = () => {
    for (const listener of goldListeners) listener(characterGold);
  };

  const notifyCharacterState = () => {
    for (const listener of characterStateListeners) listener(characterState);
  };

  const wearCharacterItem = (itemId, amount) => {
    if (!(Number(amount) > 0)) return;
    const nextState = damageCharacterItem(characterState, itemId, amount);
    if (nextState === characterState) return;
    characterState = nextState;
    notifyCharacterState();
  };

  const notifyKeys = () => {
    sendKeySnapshot(characterKeys);
  };

  const getRealmDiscoverySnapshot = () => Object.freeze({
    realm: activeRealm,
    percent: getRealmDiscoveryPercent(fogOfWar),
  });

  const getQuestValues = () => Object.freeze({
    gold: characterGold,
    realmDiscoveryPercent: Object.freeze(Object.fromEntries(
      Object.entries(worldRealms?.realms ?? {}).map(([realmName, realm]) => [
        realmName,
        getRealmDiscoveryPercent(realm.fog),
      ]),
    )),
  });

  let lastRealmDiscoverySnapshot = null;
  const notifyRealmDiscovery = () => {
    const snapshot = getRealmDiscoverySnapshot();
    if (
      lastRealmDiscoverySnapshot &&
      lastRealmDiscoverySnapshot.realm === snapshot.realm &&
      lastRealmDiscoverySnapshot.percent === snapshot.percent
    ) return;
    lastRealmDiscoverySnapshot = snapshot;
    questManager?.observe({ type: "realm-discovery-changed", realm: snapshot.realm }, getQuestValues());
    if (questManager) notifyQuest(questManager.getSnapshot());
    for (const listener of realmDiscoveryListeners) listener(snapshot);
  };

  const getMinimapNavigationMarkers = () => {
    const activeStep = questManager?.getSnapshot()?.steps.find((step) => step.active);
    const navigation = activeStep?.navigation;
    if (!navigation) return [];
    const target = findNearestNavigationTarget(world, playerCell, navigation);
    return target ? [{ id: navigation, cell: target.cell }] : [];
  };

  const renderMinimap = ({ contentRevision = null, dirtyCells = [], forceFull = false } = {}) => {
    // The minimap must use the fog record owned by the exact world/realm it
    // is rendering. The variable fallback keeps startup compatible while the
    // generated realm world is being assigned.
    const activeFog = world?.fog ?? fogOfWar;
    if (!activeFog) return;
    ensureFogMetrics(activeFog, world);
    const started = performance.now();
    if (minimapGlyphCanvases.size > 8192) minimapGlyphCanvases.clear();
    minimapCanvas.hidden = false;
    const bounds = minimapCanvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const renderWidth = Math.max(1, Math.round(bounds.width * devicePixelRatio));
    const renderHeight = Math.max(1, Math.round(bounds.height * devicePixelRatio));
    if (minimapCanvas.width !== renderWidth) minimapCanvas.width = renderWidth;
    if (minimapCanvas.height !== renderHeight) minimapCanvas.height = renderHeight;
    const context = minimapCanvas.getContext("2d");
    // Match the sprite atlas' linear sampling when the shared glyph raster is
    // reduced into the minimap's destination cells.
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const minimapPixelRatio = devicePixelRatio;
    const fixedCellWidth = getMinimapCellSize(minimapZoom) * minimapPixelRatio;
    const fixedCellHeight = fixedCellWidth;
    const sourceColumns = Math.min(world.columns, Math.max(1, Math.floor(minimapCanvas.width / fixedCellWidth)));
    const sourceRows = Math.min(
      world.rows,
      Math.max(1, Math.floor(minimapCanvas.height / fixedCellHeight)),
    );
    // A fixed-footprint minimap is necessarily a crop when its panel is
    // smaller than the game viewport. Keep that crop centered on the player
    // so it remains useful without changing the cell scale.
    const sourceX = Math.max(0, Math.min(
      world.columns - sourceColumns,
      playerCell.x - Math.floor(sourceColumns / 2),
    ));
    const sourceY = Math.max(0, Math.min(
      world.rows - sourceRows,
      playerCell.y - Math.floor(sourceRows / 2),
    ));
    const layout = getMinimapCellLayout(
      { width: minimapCanvas.width, height: minimapCanvas.height },
      { columns: sourceColumns, rows: sourceRows },
      fixedCellWidth,
      fixedCellHeight,
    );
    const { cellWidth, cellHeight, offsetX, offsetY } = layout;
    const destination = {
      x: offsetX,
      y: offsetY,
      width: sourceColumns * cellWidth,
      height: sourceRows * cellHeight,
      cellWidth,
      cellHeight,
    };
    const minimapRegion = {
      x: sourceX,
      y: sourceY,
      columns: sourceColumns,
      rows: sourceRows,
      count: sourceColumns * sourceRows,
    };
    const revision = contentRevision ?? ++minimapContentRevision;
    const cacheDecision = worldViewCache.evaluate("minimap", {
      compatibilityKey: `${activeRealm}:${minimapCanvas.width}x${minimapCanvas.height}:${minimapZoom}:${sourceX},${sourceY}:${sourceColumns}x${sourceRows}`,
      contentKey: String(revision),
      totalCells: minimapRegion.count,
      cells: dirtyCells,
      forceFull,
    });
    if (cacheDecision.mode === "reuse") {
      if (performanceMonitor.isActive()) {
        performanceMonitor.recordPhase("minimap", performance.now() - started, {
          visibleCells: minimapRegion.count,
          zoom: minimapZoom,
          warmupMs: 0,
          refresh: "reuse",
          dirtyCoverage: 0,
          dirtyRectangles: 0,
          retainedResources: worldViewCache.snapshot().resources,
        });
      }
      return;
    }
    const composition = createWorldViewComposition({
      world,
      fog: activeFog,
      source: { x: sourceX, y: sourceY, width: sourceColumns, height: sourceRows },
      destination,
      getGlyph: getClientVisibleGlyphKey,
      dirtyCells: cacheDecision.mode === "partial" ? cacheDecision.dirtyCells : null,
    });
    const minimapLightField = lightingFieldCache.get(
      world,
      minimapRegion,
      objectSpawnerSystem?.getLightingSources(world) ?? world.torches,
      playerCell,
      lighting,
    );
    minimapGpuLightSamples.length = 0;
    if (gpuLightPassEnabled) {
      const samples = buildGpuLightPassSamples(minimapRegion, minimapLightField, lighting.ambient, gpuLightSamples);
      for (const sample of samples) {
        if (isDiscovered(activeFog, world, {
          x: sourceX + sample.x,
          y: sourceY + sample.y,
        })) minimapGpuLightSamples.push(sample);
      }
    }
    const visual = minimapGlyphCache.ensure(
      minimapZoom,
      fixedCellWidth,
      collectWorldViewGlyphs(composition),
    );
    const dirtyCellKeys = new Set(cacheDecision.dirtyCells.map((cell) => `${cell.x},${cell.y}`));
    renderWorldViewComposition(composition, {
      drawBackground: () => {
        if (cacheDecision.mode === "partial") return;
        context.globalAlpha = 1;
        context.fillStyle = "#000";
        context.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
      },
      drawCell: ({ localX, localY, glyph, discovered, visibility }) => {
        const worldCell = { x: sourceX + localX, y: sourceY + localY };
        if (cacheDecision.mode === "partial" && !dirtyCellKeys.has(`${worldCell.x},${worldCell.y}`)) return;
        if (cacheDecision.mode === "partial") {
          context.globalAlpha = 1;
          context.fillStyle = "#000";
          context.fillRect(offsetX + localX * cellWidth, offsetY + localY * cellHeight, cellWidth, cellHeight);
        }
        if (!discovered) return;
        const graphic = getMinimapWorldCellGraphic(world, activeFog, palette, {
          x: worldCell.x,
          y: worldCell.y,
        }, glyph);
        if (!graphic) return;
        const raster = visual.rasters.get(glyph);
        if (!raster) return;
        const lightingFactor = minimapLightField.getFactor({ x: sourceX + localX, y: sourceY + localY });
        const fogOpacity = visibility / 100;
        const baseGlyph = getFacingGlyph(graphic.glyph);
        const baseColor = paletteColors.get(baseGlyph) ?? colorToLinearRgba(getPaletteStyle(palette, baseGlyph));
        const litColor = linearRgbaToRendererHex(applyLightingToColor(baseColor, lightingFactor));
        // The raster depends on the final tint and fog alpha, not the
        // unrounded light factor which produced that same tint.
        const cacheKey = `${glyph}:${litColor}:${fogOpacity.toFixed(2)}:${raster.width}`;
        let glyphCanvas = minimapGlyphCanvases.get(cacheKey);
        if (!glyphCanvas) {
          glyphCanvas = createGlyphRasterCanvas(raster, litColor, {
            // `litColor` already contains the complete game lighting result.
            // Applying lighting again through alpha or color scaling makes
            // the minimap differ from the game view.
            alphaScale: fogOpacity,
            colorScale: 1,
            tint: true,
          });
          minimapGlyphCanvases.set(cacheKey, glyphCanvas);
        }
        const glyphBounds = getMinimapGlyphBounds(
          glyph,
          offsetX + localX * cellWidth,
          offsetY + localY * cellHeight,
          cellWidth,
          cellHeight,
        );
        context.drawImage(glyphCanvas, glyphBounds.x, glyphBounds.y, glyphBounds.width, glyphBounds.height);
      },
      drawOverlay: () => {
        context.globalAlpha = 1;
        if (cacheDecision.mode !== "partial" && minimapGpuLightSamples.length > 0) {
          context.save();
          context.globalCompositeOperation = "lighter";
          for (const sample of minimapGpuLightSamples) {
            const centerX = offsetX + (sample.x + 0.5) * cellWidth;
            const centerY = offsetY + (sample.y + 0.5) * cellHeight;
            // Match the game GPU light sprite: one cell footprint and the same
            // cubic falloff. A broader linear gradient makes neighboring map
            // cells accumulate extra warm light.
            const radius = Math.max(cellWidth, cellHeight) * 0.5;
            const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            const alpha = Math.min(0.16, sample.intensity * 0.16);
            const [red, green, blue] = GPU_LIGHT_PASS_COLOR.map((channel) => Math.round(channel * 255));
            glow.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
            for (const distanceRatio of [0.25, 0.5, 0.75]) {
              glow.addColorStop(distanceRatio, `rgba(${red}, ${green}, ${blue}, ${alpha * getGpuLightPassAlpha(distanceRatio)})`);
            }
            glow.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
            context.fillStyle = glow;
            context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
          }
          context.restore();
        }
        const safeArea = getMinimapIndicatorSafeArea(
          minimapCanvas.width,
          minimapCanvas.height,
          MINIMAP_INDICATOR_SAFE_INSET * devicePixelRatio,
        );
        const markerWidth = cellWidth * 0.5;
        const markerHeight = cellHeight * 0.5;
        const navigationMarkers = getMinimapNavigationMarkers();
        for (const marker of getMinimapMarkers(world, activeFog, playerCell, { navigationMarkers })) {
          const markerWorldX = marker.cell.x;
          const markerWorldY = marker.cell.y;
          if (cacheDecision.mode === "partial" && !dirtyCellKeys.has(`${markerWorldX},${markerWorldY}`)) continue;
          if (markerWorldX < sourceX || markerWorldX >= sourceX + sourceColumns ||
              markerWorldY < sourceY || markerWorldY >= sourceY + sourceRows) continue;
          context.fillStyle = marker.color;
          context.fillRect(
            offsetX + (markerWorldX - sourceX) * cellWidth + (cellWidth - markerWidth) / 2,
            offsetY + (markerWorldY - sourceY) * cellHeight + (cellHeight - markerHeight) / 2,
            markerWidth,
            markerHeight,
          );
        }
      },
    });
    if (performanceMonitor.isActive()) {
      performanceMonitor.recordPhase("minimap", performance.now() - started, {
        visibleCells: minimapRegion.count,
        zoom: minimapZoom,
        warmupMs: visual.warmupMs ?? 0,
        refresh: cacheDecision.mode,
        dirtyCoverage: cacheDecision.coverage,
        dirtyRectangles: cacheDecision.rectangles.length,
        retainedResources: worldViewCache.snapshot().resources,
      });
    }
    worldViewCache.commit("minimap", cacheDecision);
  };

  const cancelMapviewRender = () => {
    if (!mapviewRenderJob) return;
    mapviewRenderJob.cancel();
    mapviewRenderJob = null;
  };

  const releaseMapviewResources = () => {
    cancelMapviewRender();
    worldViewCache.releaseView("mapview");
    const context = mapviewCanvas.getContext("2d");
    context.clearRect(0, 0, mapviewCanvas.width, mapviewCanvas.height);
    mapviewGlyphCanvases.clear();
    mapviewCanvas.width = 1;
    mapviewCanvas.height = 1;
  };

  const renderMapview = ({ contentRevision = null, dirtyCells = [], forceFull = false } = {}) => {
    if (!mapviewOpen || !world || !minimapGlyphCache) return;
    const mapviewWorld = worldRealms?.realms?.[mapviewRealm] ?? world;
    const started = performance.now();
    if (mapviewGlyphCanvases.size > 16384) mapviewGlyphCanvases.clear();
    mapviewCanvas.hidden = false;
    const bounds = mapviewCanvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const renderWidth = Math.max(1, Math.round((bounds.width || window.innerWidth) * devicePixelRatio));
    const renderHeight = Math.max(1, Math.round((bounds.height || window.innerHeight) * devicePixelRatio));
    if (mapviewCanvas.width !== renderWidth) mapviewCanvas.width = renderWidth;
    if (mapviewCanvas.height !== renderHeight) mapviewCanvas.height = renderHeight;
    const context = mapviewCanvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const { source, destination } = getMapviewLayout({ width: mapviewCanvas.width, height: mapviewCanvas.height }, mapviewWorld);
    const revision = contentRevision ?? ++mapviewContentRevision;
    const cacheDecision = worldViewCache.evaluate("mapview", {
      compatibilityKey: `${mapviewWorld.realmName ?? mapviewRealm}:${mapviewCanvas.width}x${mapviewCanvas.height}:${source.width}x${source.height}:${destination.cellWidth}x${destination.cellHeight}`,
      contentKey: String(revision),
      totalCells: source.width * source.height,
      cells: dirtyCells,
      forceFull: forceFull || mapviewRenderJob !== null,
    });
    if (cacheDecision.mode === "reuse") {
      if (performanceMonitor.isActive()) {
        performanceMonitor.recordPhase("mapview", performance.now() - started, {
          refresh: "reuse", dirtyCoverage: 0, dirtyRectangles: 0,
          visibleCells: source.width * source.height, retainedResources: worldViewCache.snapshot().resources,
        });
      }
      return;
    }
    cancelMapviewRender();
    const composition = createWorldViewComposition({
      world: mapviewWorld,
      fog: mapviewWorld.fog ?? fogOfWar,
      source,
      destination,
      getGlyph: getClientVisibleGlyphKey,
      dirtyCells: cacheDecision.mode === "partial" ? cacheDecision.dirtyCells : null,
    });
    const visual = minimapGlyphCache.ensure(1, destination.cellWidth, collectWorldViewGlyphs(composition));
    const dirtyCellKeys = new Set(cacheDecision.dirtyCells.map((cell) => `${cell.x},${cell.y}`));
    const renderJob = renderWorldViewCompositionCooperatively(composition, {
      drawBackground: () => {
        if (cacheDecision.mode === "partial") return;
        context.globalAlpha = 1;
        context.fillStyle = "#000";
        context.fillRect(0, 0, mapviewCanvas.width, mapviewCanvas.height);
      },
      drawCell: ({ cell, localX, localY, glyph, discovered }) => {
        if (cacheDecision.mode === "partial" && !dirtyCellKeys.has(`${cell.x},${cell.y}`)) return;
        if (cacheDecision.mode === "partial") {
          context.globalAlpha = 1;
          context.fillStyle = "#000";
          context.fillRect(
            destination.x + localX * destination.cellWidth,
            destination.y + localY * destination.cellHeight,
            destination.cellWidth,
            destination.cellHeight,
          );
        }
        if (!discovered) return;
        const raster = visual.rasters.get(glyph);
        if (!raster) return;
        const baseGlyph = getFacingGlyph(getClientVisibleGlyph(mapviewWorld, cell));
        const baseColor = paletteColors.get(baseGlyph) ?? colorToLinearRgba(getPaletteStyle(palette, baseGlyph));
        const litColor = linearRgbaToRendererHex(applyLightingToColor(baseColor, getMapviewLightingFactor()));
        const cacheKey = `${glyph}:${litColor}:1:${raster.width}`;
        let glyphCanvas = mapviewGlyphCanvases.get(cacheKey);
        if (!glyphCanvas) {
          glyphCanvas = createGlyphRasterCanvas(raster, litColor, { alphaScale: 1, colorScale: 1, tint: true });
          mapviewGlyphCanvases.set(cacheKey, glyphCanvas);
        }
        const glyphBounds = getMinimapGlyphBounds(
          glyph,
          destination.x + localX * destination.cellWidth,
          destination.y + localY * destination.cellHeight,
          destination.cellWidth,
          destination.cellHeight,
        );
        context.drawImage(glyphCanvas, glyphBounds.x, glyphBounds.y, glyphBounds.width, glyphBounds.height);
      },
      drawOverlay: () => {
        const markerWidth = Math.max(2 * devicePixelRatio, destination.cellWidth * 0.7);
        const markerHeight = Math.max(2 * devicePixelRatio, destination.cellHeight * 0.7);
        const occupancy = getOccupancyForWorld(mapviewWorld);
        const markers = getMapviewMarkers({
          world: mapviewWorld,
          playerCell: mapviewWorld.realmName === activeRealm ? playerCell : null,
          objects: objectSpawnerSystem?.getActiveObjects?.(mapviewWorld.realmName) ?? [],
          entities: occupancy?.getAll?.().filter((entity) => entity.id !== "player") ?? [],
        });
        for (const marker of markers) {
          if (cacheDecision.mode === "partial" && !dirtyCellKeys.has(`${marker.cell.x},${marker.cell.y}`)) continue;
          if (!isDiscovered(mapviewWorld.fog ?? fogOfWar, mapviewWorld, marker.cell)) continue;
          context.fillStyle = marker.color;
          if (marker.shape === "ring") {
            const centerX = destination.x + (marker.cell.x + 0.5) * destination.cellWidth;
            const centerY = destination.y + (marker.cell.y + 0.5) * destination.cellHeight;
            const radius = Math.max(
              12 * devicePixelRatio,
              Math.min(28 * devicePixelRatio, Math.min(destination.cellWidth, destination.cellHeight) * 8),
            );
            context.globalAlpha = 1;
            context.strokeStyle = marker.color;
            context.lineWidth = Math.max(2 * devicePixelRatio, radius * 0.08);
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.stroke();
          }
          context.fillRect(
            destination.x + marker.cell.x * destination.cellWidth + (destination.cellWidth - markerWidth) / 2,
            destination.y + marker.cell.y * destination.cellHeight + (destination.cellHeight - markerHeight) / 2,
            markerWidth,
            markerHeight,
          );
        }
      },
      sliceMs: 24,
      budgetCheckInterval: 256,
      scheduleFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    });
    mapviewRenderJob = renderJob;
    renderJob.finished.then(() => {
      if (mapviewRenderJob !== renderJob) return;
      mapviewRenderJob = null;
      if (!renderJob.cancelled) worldViewCache.commit("mapview", cacheDecision);
      if (!renderJob.cancelled && performanceMonitor.isActive()) {
        performanceMonitor.recordPhase("mapview", performance.now() - started, {
          refresh: cacheDecision.mode,
          dirtyCoverage: cacheDecision.coverage,
          dirtyRectangles: cacheDecision.rectangles.length,
          visibleCells: source.width * source.height,
          retainedResources: worldViewCache.snapshot().resources,
        });
      }
    });
    return renderJob.finished;
  };

  const cancelSettingsMapPreview = ({ release = true } = {}) => {
    settingsMapPreviewRevision += 1;
    if (release || settingsMapRenderJob) worldViewCache.releaseView("settings-preview");
    if (release) {
      worldViewCache.releaseView("settings-generation");
      settingsMapPreviewCanvas = null;
      settingsMapGlyphCanvases.clear();
    }
    settingsMapGenerationController?.abort();
    settingsMapGenerationController = null;
    settingsMapRenderJob?.cancel();
    settingsMapRenderJob = null;
  };

  const renderGenerationSettingsPreview = async (targetCanvas, previewSettings, previewRealm = "Overground", seedMode = "random") => {
    cancelSettingsMapPreview({ release: !targetCanvas });
    if (!targetCanvas || !minimapGlyphCache || disposed) return Promise.resolve();
    const revision = settingsMapPreviewRevision;
    const started = performance.now();
    const controller = new AbortController();
    settingsMapGenerationController = controller;
    const profile = resolveGenerationProfile(previewSettings);
    const previewDimensions = getWorldSizeDimensions(previewSettings.worldSize);
    const previewPlan = resolveGenerationPlan(previewSettings, previewRealm === "Underground" ? "Underground" : "Overground");
    const previewFeatureEnabled = (id) => previewPlan.find((feature) => feature.id === id)?.enabled !== false;
    const previewSeedNamespace = (id) => previewPlan.find((feature) => feature.id === id)?.seedNamespace ?? id;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round((targetCanvas.clientWidth || 1) * devicePixelRatio));
    const height = Math.max(1, Math.round((targetCanvas.clientHeight || 1) * devicePixelRatio));
    const previewSeed = seedMode === "0" ? "settings-map-view:0" : `settings-map-view:${sessionSeed ?? "preview"}`;
    const cacheDecision = worldViewCache.evaluate("settings-preview", {
      compatibilityKey: `${previewRealm}:${width}x${height}:${previewDimensions.columns}x${previewDimensions.rows}:${fontId}`,
      contentKey: JSON.stringify([previewSeed, previewSettings, palette, [...paletteOffsets]]),
      totalCells: previewDimensions.columns * previewDimensions.rows,
      forceFull: settingsMapPreviewCanvas !== targetCanvas || targetCanvas.width !== width || targetCanvas.height !== height,
    });
    if (cacheDecision.mode === "reuse") return;
    settingsMapPreviewCanvas = targetCanvas;
    const generationOptions = {
        rows: previewDimensions.rows,
        columns: previewDimensions.columns,
        torchCount: previewFeatureEnabled("object-torch") ? Math.round(12 * profile.torchCountMultiplier) : 0,
        stairCount: previewFeatureEnabled("civilization-stairs") ? Math.max(0, Math.round(getObjectDistributionCount("stairs", previewSeed) * profile.stairsCountMultiplier)) : 0,
        seed: previewSeed,
        initialRealm: previewRealm === "Underground" ? "Underground" : "Overground",
        wallFillPercents: profile.caveWallFillPercents,
        wallFillOffset: profile.walkabilityWallOffset,
        smoothingIterationsByRealm: profile.caveSmoothingIterationsByRealm,
        waterFillPercent: profile.waterFillPercent,
        waterLakeCount: profile.waterLakeCount,
        caveEnabledByRealm: { Overground: previewFeatureEnabled("overground-walls"), Underground: previewFeatureEnabled("underground-caves") },
        waterEnabled: previewFeatureEnabled("water"),
        minWalkableMultiplier: profile.minWalkableMultiplier,
        playerStartMode: profile.playerStartMode,
    };
    const generationKey = JSON.stringify(generationOptions);
    let previewRealms;
    try {
      previewRealms = worldViewCache.getResource("settings-generation", generationKey)
        ?? await createWorldRealms(generationOptions, { signal: controller.signal, sliceMs: 8 });
    } catch (error) {
      if (error.name === "AbortError") return;
      throw error;
    }
    if (disposed || revision !== settingsMapPreviewRevision || controller !== settingsMapGenerationController) return;
    // Preview-owned generation is read-only: marker placement never mutates it,
    // and no gameplay, fog, or AI consumer receives these retained realms.
    worldViewCache.retainResource("settings-generation", generationKey, previewRealms);
    const previewWorld = previewRealms.realms[previewRealm === "Underground" ? "Underground" : "Overground"];
    // Preview-only markers make post-terrain generation passes inspectable without
    // changing the preview world, the active world, or persisted settings.
    const enemySpawnerMarkers = previewRealm === "Underground" && previewFeatureEnabled("enemy-spawner")
      ? selectEnemySpawnerCells(previewWorld, {
        realm: "Underground",
        random: createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("enemy-spawner")}`),
        maxSpawners: profile.maxEnemySpawners,
      }).cells.map((cell) => ({ ...cell, kind: "enemy-spawner" }))
      : [];
    const npcSpawnerMarkers = previewRealm === "Overground" && previewFeatureEnabled("npc-spawner")
      ? selectNpcSpawnerCells(previewWorld, {
        realm: "Overground",
        count: profile.npcSpawnerCount,
        random: createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("npc-spawner")}`),
      }).cells.map((cell) => ({ ...cell, kind: "npc-spawner", glyph: "☺", color: "#48c774" }))
      : [];
    // Like trap markers, these make Civilization's otherwise subtle door and key
    // glyphs readable in the low-resolution procedural preview without mutating
    // the preview world or its live-generation counterpart.
    const civilizationMarkers = previewRealm === "Underground" && previewFeatureEnabled("civilization-doors")
      ? createCivilizationGroups(previewWorld, {
        random: createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("civilization-doors")}`),
        chance: Math.min(0.9, (import.meta.env.DEV ? 0.5 : 0.1) * profile.civilizationChanceMultiplier),
      }).flatMap((group) => [
        { ...group.door, kind: "civilization-door", primary: true, glyph: "█", color: "#d6a55a" },
        ...group.keys.map((cell) => ({ ...cell, kind: "civilization-key", primary: false, glyph: "⚿", color: "#ffd166" })),
      ])
      : [];
    const homeMarkers = previewRealm === "Overground" && previewFeatureEnabled("civilization-homes")
      ? createOverworldBuildings(previewWorld, {
        random: createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("civilization-homes")}`),
        chance: Math.min(0.9, (import.meta.env.DEV ? 0.5 : 0.1) * profile.homeChanceMultiplier),
      }).map((building) => ({ ...building.origin, chestCell: building.chestCell, kind: "home", glyph: "^", color: "#d6a55a" }))
      : [];
    const houseChestMarkers = homeMarkers.map((building) => ({ ...building.chestCell, kind: "chest", glyph: CLOSED_CHEST_GLYPH, color: "#ffff00" }));
    const heartCount = previewFeatureEnabled("object-heart") ? Math.max(0, Math.round(getObjectDistributionCount("heart", previewWorld.options.seed) * profile.objectCountMultipliers.heart)) : 0;
    const heartCells = selectObjectCells(previewWorld, previewWorld.playerStart, heartCount, createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("object-heart")}`), { minimumDistance: 3, reserved: new Set() });
    const trapCount = previewFeatureEnabled("object-trap") ? Math.max(0, Math.round(getObjectDistributionCount("trap", previewWorld.options.seed) * profile.objectCountMultipliers.trap)) : 0;
    const trapCells = selectObjectCells(previewWorld, previewWorld.playerStart, trapCount, createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("object-trap")}`), { minimumDistance: 3, reserved: new Set(heartCells.map((cell) => `${cell.x},${cell.y}`)) });
    const chestCells = selectObjectCells(previewWorld, previewWorld.playerStart, previewFeatureEnabled("object-chest") ? profile.chestCount : 0, createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("object-chest")}`), {
      minimumDistance: 3,
      maximumDistance: 50,
      reserved: new Set([...heartCells, ...trapCells].map((cell) => `${cell.x},${cell.y}`)),
    });
    const fireplaceCount = previewRealm === "Underground" && previewFeatureEnabled("object-fireplace")
      ? Math.max(0, Math.round(getObjectDistributionCount("fireplace", previewWorld.options.seed) * profile.objectCountMultipliers.fireplace))
      : 0;
    const fireplaceCells = selectObjectCells(previewWorld, previewWorld.playerStart,
      fireplaceCount,
      createRandom(`${previewWorld.options.seed}:${previewSeedNamespace("object-fireplace")}`), {
        minimumDistance: 3,
        reserved: new Set([...heartCells, ...trapCells].map((cell) => `${cell.x},${cell.y}`)),
      });
    const proceduralSettingsMarkers = [
      ...enemySpawnerMarkers,
      ...npcSpawnerMarkers,
      ...civilizationMarkers,
      ...homeMarkers,
      ...houseChestMarkers,
      ...(previewFeatureEnabled("civilization-stairs") ? previewWorld.stairs ?? [] : []).map((cell) => ({ ...cell, kind: "stairs", glyph: STAIR_GLYPH, color: "#f5f5f5" })),
      ...heartCells.map((cell) => ({ ...cell, kind: "heart", glyph: "♥", color: "#ff4f6d" })),
      ...chestCells.map((cell) => ({ ...cell, kind: "chest", glyph: CLOSED_CHEST_GLYPH, color: "#ffff00" })),
      ...trapCells.map((cell) => ({ ...cell, kind: "trap", glyph: "☠", color: "#ffd166" })),
      ...fireplaceCells.map((cell) => ({ ...cell, kind: "fireplace", glyph: FIREPLACE_GLYPH, color: "#ff6b35" })),
      ...(previewFeatureEnabled("object-torch") ? previewWorld.torches ?? [] : []).map((cell) => ({ ...cell, kind: "torch", glyph: "🕯", color: "#ffe066" })),
    ];
    if (targetCanvas.width !== width) targetCanvas.width = width;
    if (targetCanvas.height !== height) targetCanvas.height = height;
    const context = targetCanvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const { source, destination } = getMapviewLayout({ width, height }, previewWorld);
    const composition = createWorldViewComposition({
      world: previewWorld,
      source,
      destination,
      getGlyph: (preview, cell) => {
        const glyph = getVisibleGlyph(preview, cell);
        return getOffsetGlyphKey(getFacingGlyphKey(glyph), paletteOffsets.get(glyph));
      },
      getVisibility: () => 100,
    });
    const visual = minimapGlyphCache.ensure(1, destination.cellWidth, collectWorldViewGlyphs(composition));
    const renderJob = renderWorldViewCompositionCooperatively(composition, {
      drawBackground: () => {
        context.globalAlpha = 1;
        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);
      },
      drawCell: ({ cell, localX, localY, glyph }) => {
        if (revision !== settingsMapPreviewRevision) return;
        const raster = visual.rasters.get(glyph);
        if (!raster) return;
        const baseGlyph = getFacingGlyph(getVisibleGlyph(previewWorld, cell));
        const litColor = linearRgbaToRendererHex(applyLightingToColor(paletteColors.get(baseGlyph) ?? colorToLinearRgba(getPaletteStyle(palette, baseGlyph)), getMapviewLightingFactor()));
        const cacheKey = `${glyph}:${litColor}:1:${raster.width}`;
        let glyphCanvas = settingsMapGlyphCanvases.get(cacheKey);
        if (!glyphCanvas) {
          glyphCanvas = createGlyphRasterCanvas(raster, litColor, { alphaScale: 1, colorScale: 1, tint: true });
          settingsMapGlyphCanvases.set(cacheKey, glyphCanvas);
        }
        const glyphBounds = getSettingsPreviewGlyphBounds(
          previewRealm,
          glyph,
          destination.x + localX * destination.cellWidth,
          destination.y + localY * destination.cellHeight,
          destination.cellWidth,
          destination.cellHeight,
        );
        context.drawImage(glyphCanvas, glyphBounds.x, glyphBounds.y, glyphBounds.width, glyphBounds.height);
      },
      drawOverlay: (mapDestination, region) => {
        if (revision !== settingsMapPreviewRevision) return;
        context.save();
        context.fillStyle = "#e63946";
        context.strokeStyle = "#ffffff";
        context.lineWidth = Math.max(1, devicePixelRatio);
        const markerSize = Math.max(5 * devicePixelRatio, Math.min(mapDestination.cellWidth, mapDestination.cellHeight) * 2);
        const objectGlyphSize = Math.max(
          PROCEDURAL_PREVIEW_OBJECT_ICON_SIZE.minimumPixels * devicePixelRatio,
          Math.min(
            PROCEDURAL_PREVIEW_OBJECT_ICON_SIZE.maximumPixels * devicePixelRatio,
            Math.min(mapDestination.cellWidth, mapDestination.cellHeight)
              * PROCEDURAL_PREVIEW_OBJECT_ICON_SIZE.cellMultiplier,
          ),
        );
        for (const marker of proceduralSettingsMarkers) {
          const centerX = mapDestination.x + (marker.x - region.x + 0.5) * mapDestination.cellWidth;
          const centerY = mapDestination.y + (marker.y - region.y + 0.5) * mapDestination.cellHeight;
          if (marker.kind === "enemy-spawner") {
            context.fillStyle = "#e63946";
            context.fillRect(centerX - markerSize / 2, centerY - markerSize / 2, markerSize, markerSize);
            context.strokeRect(centerX - markerSize / 2, centerY - markerSize / 2, markerSize, markerSize);
            continue;
          }
          context.fillStyle = marker.color;
          // Procedural preview objects must remain legible above the dense map
          // background. This applies to every glyph marker, including Chest,
          // paired Stairs, and Civilization Doors.
          context.font = `${objectGlyphSize}px serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
            context["fillText"](marker.glyph, centerX, centerY);
          context.fillStyle = "#e63946";
        }
        context.restore();
      },
      sliceMs: 16,
      budgetCheckInterval: 256,
      scheduleFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    });
    settingsMapRenderJob = renderJob;
    renderJob.finished.then(() => {
      if (settingsMapRenderJob !== renderJob) return;
      settingsMapRenderJob = null;
      if (!renderJob.cancelled) worldViewCache.commit("settings-preview", cacheDecision);
      if (!renderJob.cancelled && performanceMonitor.isActive()) {
        performanceMonitor.recordPhase("settings-preview", performance.now() - started, {
          refresh: cacheDecision.mode,
          dirtyCoverage: cacheDecision.coverage,
          dirtyRectangles: cacheDecision.rectangles.length,
          visibleCells: source.width * source.height,
          retainedResources: worldViewCache.snapshot().resources,
        });
      }
    });
    return renderJob.finished;
  };

  const schedulePresentation = () => {
    if (!engine || disposed || presentationFrame !== null) return;
    presentationFrame = window.requestAnimationFrame((now) => {
      presentationFrame = null;
      const delta = lastPresentationTime ? now - lastPresentationTime : 16.667;
      lastPresentationTime = now;
      resizeEngine(engine);
      renderFrame(engine, Math.max(0, delta));
    });
  };

  const presentImmediately = () => {
    if (!engine || disposed) return;
    if (presentationFrame !== null) {
      window.cancelAnimationFrame(presentationFrame);
      presentationFrame = null;
    }
    renderFrame(engine, 0);
  };

  // Movement can repeat faster than a display can paint, especially while
  // Shift is held. Keep the newest world state, but perform at most one
  // expensive minimap paint per animation frame so input tasks keep yielding.
  const scheduleMinimapRender = ({ invalidate = true, dirtyCells = [], forceFull = false } = {}) => {
    if (invalidate) minimapContentRevision += 1;
    minimapDirtyCells.push(...dirtyCells);
    minimapForceFull ||= forceFull;
    if (minimapRenderFrame !== null) return;
    minimapRenderFrame = window.requestAnimationFrame(() => {
      minimapRenderFrame = null;
      const nextDirtyCells = minimapDirtyCells;
      const nextForceFull = minimapForceFull;
      minimapDirtyCells = [];
      minimapForceFull = false;
      if (!disposed) renderMinimap({ contentRevision: minimapContentRevision, dirtyCells: nextDirtyCells, forceFull: nextForceFull });
    });
  };

  const handleMinimapClick = () => {
    if (gameplayInputLocked) return;
    if (!canHandleMinimapScale()) return;
    const nextZoom = getNextMinimapScale(minimapZoom);
    for (const listener of minimapZoomListeners) listener(nextZoom);
  };

  const refreshDiscovery = ({ immediate = false } = {}) => {
    if (!fogOfWar || !world || !playerCell) return;
    discoverFromPlayer(fogOfWar, world, playerCell);
    notifyRealmDiscovery();
    if (immediate) renderMinimap();
    else scheduleMovementRender({ fog: true, force: false });
  };

  const refreshStartingDiscovery = () => {
    if (!fogOfWar || !world || !playerCell) return;
    const coverage = world.startingFogClearCoverage ?? { x: 1, y: 1 };
    const startingViewport = createViewportForCanvas(canvas, STARTING_FOG_CLEAR_ZOOM);
    discoverStartingArea(fogOfWar, world, playerCell, {
      viewportColumns: startingViewport.columns,
      viewportRows: startingViewport.rows,
      coverageX: coverage.x,
      coverageY: coverage.y,
    });
    notifyRealmDiscovery();
  };

  const resolveCameraOrigin = (intent = CAMERA_RESOLVE_INTENTS.activeMode, {
    previousViewport = viewport,
    screenCell = null,
    targetCell = playerCell,
    direction = { x: 0, y: 0 },
    commit = true,
  } = {}) => {
    if (transitionActive && !(initialRevealActive && initialPlayableRenderComplete)) {
      if (intent === CAMERA_RESOLVE_INTENTS.initial
        || intent === CAMERA_RESOLVE_INTENTS.reapply) {
        cameraModeReapplyAfterTransition = true;
      }
      return false;
    }
    if (!world || !targetCell) return false;
    let nextOrigin = null;
    if (intent === CAMERA_RESOLVE_INTENTS.initial
      || intent === CAMERA_RESOLVE_INTENTS.reapply) {
      nextOrigin = getInitialViewOriginForCamera(cameraMode, targetCell, viewport, world);
    } else if (intent === CAMERA_RESOLVE_INTENTS.resize) {
      nextOrigin = getViewOriginForResize(
        cameraMode,
        targetCell,
        previousViewport,
        viewport,
        world,
        viewOrigin,
      );
    } else if (intent === CAMERA_RESOLVE_INTENTS.transitionPreserve && screenCell) {
      nextOrigin = getViewOriginForPreservedPlayerPosition(targetCell, screenCell, viewport, world);
    } else {
      nextOrigin = getViewOriginForCamera(cameraMode, targetCell, viewport, world, viewOrigin, direction);
    }
    if (!nextOrigin) return false;
    if (commit) viewOrigin = nextOrigin;
    return nextOrigin;
  };

  const activateRealm = (name, arrival = null) => {
    if (!worldRealms?.realms?.[name]) return;
    timeSystem.invalidatePending();
    const sourceScreenCell = playerCell
      ? { x: playerCell.x - viewOrigin.x, y: playerCell.y - viewOrigin.y }
      : null;
    getOccupancyForWorld()?.remove("player");
    activeRealm = name;
    world = worldRealms.realms[name];
    logSystem.log({ message: `Entered the ${activeRealm} Realm` });
    realmSystem.enter(activeRealm);
    fogOfWar = world.fog;
    playerCell = arrival ?? world.playerCell ?? world.playerStart;
    normalizePlayerMarkers(world);
    world.playerCell = playerCell;
    getOccupancyForWorld()?.claim({
      id: "player", type: "player", glyph: PLAYER_GLYPH, facing: playerFacing, realm: activeRealm, cell: playerCell,
    });
    lighting = { ...lighting, ambient: realmAmbient[activeRealm] };
    // Preserve the player's current screen-cell offset across the realm swap.
    // This keeps center, deadzone, and locked-camera positions visually stable
    // instead of recentering the destination realm at its origin.
    resolveCameraOrigin(sourceScreenCell
      ? CAMERA_RESOLVE_INTENTS.transitionPreserve
      : CAMERA_RESOLVE_INTENTS.activeMode, { screenCell: sourceScreenCell });
    for (const listener of realmListeners) listener(activeRealm);
    notifyRealmDiscovery();
    // Discover the destination around the arriving player before rendering it.
    // Rendering first leaves every destination cell hidden until movement causes
    // the next world repaint, which makes the first transition end on black.
    refreshStartingDiscovery();
    refreshDiscovery({ immediate: true });
    // A realm swap changes every visible cell. Clear the submitted sprites in
    // place instead of removing/re-adding the Babylon layer at the exact
    // covered -> opening boundary. Replacing the layer here can expose an
    // empty/new layer for one presentation frame while the transition mask
    // starts opening.
    resetLayerSprites();
    renderWorld({ refreshLighting: true });
    // The transition system runs from its own RAF. Present the destination
    // layer synchronously while the mask is still fully closed, rather than
    // allowing the opening phase to race the normal presentation RAF.
    presentImmediately();
  };

  const setTransitionMask = ({ phase, value }) => {
    if (phase === TRANSITION_PHASES.IDLE) {
      transitionMask.classList.remove("game_transition_mask_covered");
      transitionMask.hidden = true;
      return;
    }
    transitionMask.classList.toggle(
      "game_transition_mask_covered",
      phase === TRANSITION_PHASES.COVERED,
    );
    const playerCenter = transitionCenter ?? getTransitionCenter();
    transitionMask.style.setProperty("--transition-center-x", `${playerCenter.x}px`);
    transitionMask.style.setProperty("--transition-center-y", `${playerCenter.y}px`);
    transitionMask.hidden = false;
    const radius = Math.max(0, value);
    transitionMask.style.setProperty("--transition-radius", `${radius}px`);
    transitionMask.style.setProperty("--transition-feather-end", `${radius + 12}px`);
  };

  const getTransitionRadii = () => {
    const width = Math.max(1, canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, canvas.clientHeight || window.innerHeight);
    return {
      cover: Math.hypot(width, height),
    };
  };

  const getTransitionCenter = () => {
    const renderCenter = playerRenderCenter ?? (playerCell && world
      ? getRenderedCellCenter({
        x: playerCell.x - viewOrigin.x,
        y: playerCell.y - viewOrigin.y,
      }, viewport, world)
      : null);
    if (!renderCenter) {
      return {
        x: (canvas.clientWidth || window.innerWidth) / 2,
        y: (canvas.clientHeight || window.innerHeight) / 2,
      };
    }

    // Sprite positions are expressed in the canvas render target's pixels,
    // while the CSS mask uses the transformed element's CSS pixels. Convert
    // through the live bounds so DPR, portrait framing, and transforms all
    // keep the aperture over the rendered player.
    const canvasBounds = canvas.getBoundingClientRect();
    const maskBounds = transitionMask.getBoundingClientRect();
    const renderWidth = Math.max(1, canvas.width || canvasBounds.width);
    const renderHeight = Math.max(1, canvas.height || canvasBounds.height);
    return {
      x: canvasBounds.left - maskBounds.left + (renderCenter.x / renderWidth) * canvasBounds.width,
      y: canvasBounds.top - maskBounds.top + (renderCenter.y / renderHeight) * canvasBounds.height,
    };
  };

  const startInitialReveal = () => {
    if (transitionActive || !transitionSystem || !playerCell) return false;
    const { cover } = getTransitionRadii();
    transitionCenter = getTransitionCenter();
    transitionActive = true;
    initialRevealActive = true;
    const started = transitionSystem.start({
      target: "game_layer",
      // Startup begins at the closed aperture and uses only the opening half
      // of the realm transition to reveal the already-rendered player.
      from: cover,
      to: 0,
      durationOut: 1,
      durationCovered: 0,
      durationIn: INITIAL_TRANSITION_OPEN_MS,
      startPhase: TRANSITION_PHASES.OPENING,
      onStart: () => {
        transitionMask.classList.remove("game_transition_mask_covered");
        transitionMask.hidden = false;
      },
      onComplete: () => {
        transitionActive = false;
        initialRevealActive = false;
        setTransitionMask({ phase: TRANSITION_PHASES.IDLE, value: 0 });
        transitionCenter = null;
        reapplyCameraModeAfterTransition();
        finishStartupPerformance();
      },
    });
    if (!started) {
      transitionActive = false;
      transitionCenter = null;
      return false;
    }
    transitionMask.style.setProperty("--transition-radius", "0px");
    transitionMask.style.setProperty("--transition-feather-end", "12px");
    transitionSystem.begin(performance.now());
    return true;
  };

  const startRealmTransition = (destination, arrival = null) => {
    if (transitionActive || !transitionSystem || !worldRealms?.realms?.[destination]) return false;
    timeSystem.invalidatePending();
    const { cover } = getTransitionRadii();
    clearMovementInput();
    // Ensure the source realm's latest player position is submitted before the
    // mask becomes visible.
    renderWorld({ refreshLighting: true });
    // Keep the aperture anchored to the source realm's screen position. The
    // destination swap changes playerCell/viewOrigin, so recalculating this
    // during opening makes a second transition appear at the cusp.
    transitionCenter = getTransitionCenter();
    transitionActive = true;
    gameplayInputLocked = true;
    const started = transitionSystem.start({
      target: "game_layer",
      from: cover,
      // Fully close the aperture before swapping realms. Leaving a player-
      // sized transparent hole exposes the old/new layer during the handoff.
      to: 0,
      durationOut: REALM_TRANSITION_CLOSE_MS,
      durationCovered: REALM_TRANSITION_COVER_HOLD_MS,
      durationIn: REALM_TRANSITION_OPEN_MS,
      onStart: () => {
        transitionMask.classList.remove("game_transition_mask_covered");
        transitionMask.style.setProperty("--transition-radius", `${cover}px`);
        transitionMask.style.setProperty("--transition-feather-end", `${cover + 12}px`);
        transitionMask.hidden = false;
      },
      onCovered: () => activateRealm(destination, arrival),
      onOpening: () => {
        gameplayInputLocked = mapviewOpen;
        clearMovementInput();
      },
      onComplete: () => {
        transitionActive = false;
        gameplayInputLocked = mapviewOpen;
        clearMovementInput();
        setTransitionMask({ phase: TRANSITION_PHASES.IDLE, value: 0 });
        transitionCenter = null;
        reapplyCameraModeAfterTransition();
      },
    });
    if (!started) {
      transitionActive = false;
      gameplayInputLocked = mapviewOpen;
      transitionCenter = null;
      return false;
    }
    transitionSystem.begin(performance.now());
    return true;
  };

  const findNearestStairPath = () => {
    if (!world || !playerCell || !world.stairs?.length) return null;
    return AStarUtility.findNearest(world, playerCell, world.stairs)?.path ?? null;
  };

  const travelToNearestStairs = () => {
    const path = findNearestStairPath();
    if (!path?.length) return;
    const stair = path.at(-1);
    if (!getOccupancyForWorld()?.move("player", stair)) return;
    for (let index = 1; index < path.length; index += 1) {
      setPlayerFacingFromDirection({ x: path[index].x - path[index - 1].x, y: path[index].y - path[index - 1].y });
    }
    playerCell = { ...stair };
    world.playerCell = playerCell;
    for (const cell of path) discoverCell(fogOfWar, world, cell);
    notifyRealmDiscovery();
    timeSystem.advance(path.length, "movement");
    resolveViewForPlayer();
    renderMinimap();
    const destination = activeRealm === "Overground" ? "Underground" : "Overground";
    startRealmTransition(destination, playerCell);
  };

  const clampViewOrigin = () => {
    if (!world) return;
    const visibleColumns = Math.min(viewport.columns, world.columns);
    const visibleRows = Math.min(viewport.rows, world.rows);
    const maxX = Math.max(0, world.columns - visibleColumns);
    const maxY = Math.max(0, world.rows - visibleRows);
    viewOrigin = {
      x: Math.min(Math.max(viewOrigin.x, 0), maxX),
      y: Math.min(Math.max(viewOrigin.y, 0), maxY),
    };
  };

  const resolveViewForPlayer = ({ initial = false } = {}) => {
    resolveCameraOrigin(initial ? CAMERA_RESOLVE_INTENTS.initial : CAMERA_RESOLVE_INTENTS.activeMode);
  };

  const clearRepeat = () => {
    if (repeatTimer !== null) {
      window.clearTimeout(repeatTimer);
      repeatTimer = null;
    }
  };

  const getHeldDirection = () => {
    const keyboardDirection = getCombinedDirection(heldKeys);
    return {
      x: Math.sign(keyboardDirection.x + (touchDirection?.x ?? 0)),
      y: Math.sign(keyboardDirection.y + (touchDirection?.y ?? 0)),
    };
  };

  const hasHeldMovement = () => heldKeys.size > 0 || touchDirection !== null;

  const clearTouchInput = () => {
    activePointerId = null;
    touchStart = null;
    touchDirection = null;
    if (!hasHeldMovement()) clearRepeat();
  };

  const clearKeyboardInput = () => {
    heldKeys.clear();
    shiftHeld = false;
    heldModifierKeys.clear();
    if (!hasHeldMovement()) clearRepeat();
  };

  const clearMovementInput = () => {
    clearKeyboardInput();
    clearTouchInput();
    clearRepeat();
  };

  transitionSystem = createTransitionSystem({
    onUpdate: setTransitionMask,
  });

  const createGameGlyphCache = () => createGlyphVisualCache(engine, {
    fontId,
    fontFamily: getFontOption(fontId).family,
    glyphLimit: GLYPHS.length + 3,
    rasterize: (glyph, family, size) => glyph === FOG_BACKING_GLYPH
      ? rasterizeSolidGlyph(size)
      : glyphBackgroundEnabled
      ? rasterizeCompositeGlyph(glyph, family, size, paletteColors.get(getFacingGlyph(glyph)) ?? [1, 1, 1], backgroundDarkness, getGlyphOffsetsFromKey(glyph))
      : rasterizeGlyph(glyph, family, size, "#ffffff", getGlyphOffsetsFromKey(glyph)),
  });

  const createMinimapGlyphCache = () => createGlyphVisualCache(engine, {
    fontId,
    fontFamily: getFontOption(fontId).family,
    glyphLimit: GLYPHS.length + 2,
    // World-view canvases already paint each cell's terrain/background.  A
    // composite glyph adds a second, full-cell opaque backing behind emoji
    // such as the player and gold, making that backing larger than markers.
    // Keep the game-view composite cache separate; minimap-derived views only
    // need the glyph's transparent raster, with its palette scale and offset.
    rasterize: (glyph, family, size) => glyph === FOG_BACKING_GLYPH
      ? rasterizeSolidGlyph(size)
      : rasterizeGlyph(glyph, family, size, "#ffffff", getGlyphOffsetsFromKey(glyph)),
  });

  const collectChangedOffsetGlyphs = (previousPalette, nextPalette) => {
    const previousById = new Map(previousPalette.map((entry) => [getPaletteEntryId(entry), entry]));
    const changedGlyphs = new Set();
    for (const entry of nextPalette) {
      const previous = previousById.get(getPaletteEntryId(entry));
      if (!previous) {
        changedGlyphs.add(entry.glyph);
        continue;
      }
      if (getGlyphOffsetKey(getPaletteEntryOffsets(previous)) !== getGlyphOffsetKey(getPaletteEntryOffsets(entry))) {
        changedGlyphs.add(entry.glyph);
      }
    }
    return changedGlyphs;
  };

  const rebuildGameGlyphCache = () => {
    if (renderer && layer) removeSpriteRendererLayer(renderer, layer);
    glyphCache?.dispose();
    glyphCache = createGameGlyphCache();
    layer = null;
    atlas = null;
  };

  const rebuildMinimapGlyphCache = () => {
    minimapGlyphCache?.dispose();
    minimapGlyphCache = createMinimapGlyphCache();
    minimapGlyphCanvases.clear();
    mapviewGlyphCanvases.clear();
  };

  const rebuildLayer = (nextAtlas = atlas) => {
    const previousLayer = layer;
    atlas = nextAtlas;
    layer = attachReplacementRendererLayer({
      renderer,
      currentLayer: previousLayer,
      nextAtlas: atlas,
      capacity: getInitialSpriteLayerCapacity(viewport),
      createLayer: createSprite2DLayer,
      addLayer: addSpriteRendererLayer,
      removeLayer: removeSpriteRendererLayer,
    });
    spriteIndexes.length = 0;
    spriteStates.length = 0;
  };

  const resetLayerSprites = () => {
    if (layer) {
      for (const index of spriteIndexes) {
        if (index !== undefined) updateSprite2DIndex(layer, index, { visible: false });
      }
    }
    spriteIndexes.length = 0;
    spriteStates.length = 0;
  };

  const disposeGpuLightPass = () => {
    if (renderer && gpuLightLayer) removeSpriteRendererLayer(renderer, gpuLightLayer);
    gpuLightLayer = undefined;
    gpuLightSpriteIndexes.length = 0;
    gpuLightSpriteStates.length = 0;
    gpuLightSamples.length = 0;
    gpuLightActiveSlots = new Uint8Array(0);
    if (gpuLightAtlas) disposeSpriteAtlas(gpuLightAtlas);
    gpuLightAtlas = undefined;
  };

  const ensureGpuLightPass = (capacity) => {
    if (gpuLightLayer && gpuLightLayer._capacity >= capacity) return;
    disposeGpuLightPass();
    gpuLightAtlas = createSpriteAtlasFromFrames(engine, [createGpuLightPassFrame()], { sampling: "linear" });
    gpuLightLayer = createSprite2DLayer(gpuLightAtlas, {
      capacity: Math.max(1, capacity), blendMode: spriteBlendAdditive, order: 1,
    });
    addSpriteRendererLayer(renderer, gpuLightLayer);
  };

  const renderGpuLightPass = (region, lightField) => {
    if (!gpuLightPassEnabled) {
      if (gpuLightLayer) gpuLightLayer.visible = false;
      return;
    }
    ensureGpuLightPass(region.count);
    gpuLightLayer.visible = true;
    if (gpuLightActiveSlots.length < region.count) gpuLightActiveSlots = new Uint8Array(region.count);
    const samples = buildGpuLightPassSamples(region, lightField, lighting.ambient, gpuLightSamples);
    for (const sample of samples) {
      const visibility = getFogVisibility(fogOfWar, world, {
        x: region.x + sample.x,
        y: region.y + sample.y,
      });
      if (visibility <= 0) continue;
      gpuLightActiveSlots[sample.slot] = 1;
      const center = getCellCenter(sample, viewport);
      const props = {
        positionPx: [center.x, center.y],
        sizePx: [viewport.gridWidth, viewport.gridHeight],
        frame: 0,
        color: [...GPU_LIGHT_PASS_COLOR, Math.min(0.16, sample.intensity * 0.16) * (visibility / 100)],
        visible: true,
      };
      if (gpuLightSpriteIndexes[sample.slot] === undefined) {
        gpuLightSpriteIndexes[sample.slot] = addSprite2DIndex(gpuLightLayer, props);
      } else {
        updateSprite2DIndex(gpuLightLayer, gpuLightSpriteIndexes[sample.slot], props);
      }
      gpuLightSpriteStates[sample.slot] = true;
    }
    for (let slot = 0; slot < gpuLightSpriteIndexes.length; slot += 1) {
      if (gpuLightSpriteStates[slot] && gpuLightActiveSlots[slot] !== 1) {
        updateSprite2DIndex(gpuLightLayer, gpuLightSpriteIndexes[slot], { visible: false });
        gpuLightSpriteStates[slot] = false;
      }
      gpuLightActiveSlots[slot] = 0;
    }
  };

  const disposeHealthBarOverlay = () => {
    if (renderer && healthBarLayer) removeSpriteRendererLayer(renderer, healthBarLayer);
    healthBarLayer = undefined;
    healthBarSprites.clear();
    if (healthBarAtlas) disposeSpriteAtlas(healthBarAtlas);
    healthBarAtlas = undefined;
  };

  const ensureHealthBarOverlay = (capacity) => {
    if (healthBarLayer && healthBarLayer._capacity >= capacity) return;
    disposeHealthBarOverlay();
    healthBarAtlas = createSpriteAtlasFromFrames(engine, [createSolidHealthBarFrame()], { sampling: "linear" });
    healthBarLayer = createSprite2DLayer(healthBarAtlas, {
      capacity: Math.max(3, capacity), order: HEALTH_BAR_LAYER_ORDER,
    });
    addSpriteRendererLayer(renderer, healthBarLayer);
  };

  const renderHealthBars = (region, now = performance.now()) => {
    if (!world || !renderer) return false;
    const occupancy = getOccupancyForWorld();
    const states = healthBarSystem.getVisible(now, {
      realm: activeRealm,
      isCellVisible: () => true,
    }).map((state) => ({ state, entity: occupancy?.get(state.id) ?? state }))
      .filter(({ entity }) => getVisibleSlot(region, entity.cell) !== -1
        && isDiscovered(fogOfWar, world, entity.cell));

    if (states.length > 0) ensureHealthBarOverlay(states.length * 4);
    const activeIds = new Set();
    for (const { state, entity } of states) {
      activeIds.add(state.id);
      const center = getRenderedCellCenter({
        x: state.cell.x - region.x,
        y: state.cell.y - region.y,
      }, viewport, world);
      const geometry = getHealthBarSpriteGeometry(center, viewport, state.fillRatio, {
        deltaStartRatio: state.deltaStartRatio,
        deltaWidthRatio: state.deltaWidthRatio,
      });
      const definitions = [
        { geometry: geometry.outline, color: HEALTH_BAR_OUTLINE_COLOR, visible: true },
        { geometry: geometry.track, color: HEALTH_BAR_TRACK_COLOR, visible: true },
        { geometry: geometry.fill, color: HEALTH_BAR_FILL_COLOR, visible: geometry.fill.sizePx[0] > 0 },
        { geometry: geometry.delta, color: HEALTH_BAR_DELTA_COLOR, visible: geometry.delta.sizePx[0] > 0 },
      ];
      let indexes = healthBarSprites.get(state.id);
      if (!indexes) {
        indexes = definitions.map(({ geometry: spriteGeometry, color, visible }) => addSprite2DIndex(healthBarLayer, {
          positionPx: spriteGeometry.positionPx,
          sizePx: spriteGeometry.sizePx,
          frame: 0,
          color: [...color, state.alpha],
          visible,
        }));
        healthBarSprites.set(state.id, indexes);
      } else {
        definitions.forEach(({ geometry: spriteGeometry, color, visible }, index) => updateSprite2DIndex(healthBarLayer, indexes[index], {
          positionPx: spriteGeometry.positionPx,
          sizePx: spriteGeometry.sizePx,
          color: [...color, state.alpha],
          visible,
        }));
      }
    }
    for (const [id, indexes] of healthBarSprites) {
      if (activeIds.has(id)) continue;
      for (const index of indexes) updateSprite2DIndex(healthBarLayer, index, { visible: false });
    }
    return states.length > 0;
  };

  const scheduleHealthBarAnimation = () => {
    if (!engine || disposed || healthBarAnimationFrame !== null) return;
    healthBarAnimationFrame = window.requestAnimationFrame((now) => {
      healthBarAnimationFrame = null;
      const region = world ? getVisibleRegion(viewport, world, viewOrigin) : null;
      if (region) renderHealthBars(region, now);
      resizeEngine(engine);
      renderFrame(engine, 0);
      if (healthBarSystem.hasActive(now)) scheduleHealthBarAnimation();
    });
  };

  const disposeFloatingTextOverlay = () => {
    floatingTextLayer.replaceChildren();
    floatingTextElements.clear();
  };

  const isFloatingTextCellVisible = (region, targetCell, targetWorld = world) => Boolean(targetWorld)
    && getVisibleSlot(region, targetCell) !== -1
    && isDiscovered(fogOfWar, targetWorld, targetCell);

  const renderFloatingTexts = (region, now = performance.now()) => {
    if (!world || !region) return false;
    const states = floatingTextSystem.getVisible(now, {
      realm: activeRealm,
      isCellVisible: (cell) => isFloatingTextCellVisible(region, cell),
    });
    const activeIds = new Set();
    for (const state of states) {
      activeIds.add(state.id);
      let element = floatingTextElements.get(state.id);
      if (!element) {
        element = document.createElement("div");
        element.className = "floating_text";
        floatingTextLayer.append(element);
        floatingTextElements.set(state.id, element);
      }
      const center = getRenderedCellCenter({
        x: state.cell.x - region.x,
        y: state.cell.y - region.y,
      }, viewport, world);
      const style = getFloatingTextStyle(center, viewport, state);
      element.textContent = style.text;
      element.dataset.role = state.colorRole;
      element.style.setProperty("--floating-text-x", `${style.positionPx[0]}px`);
      element.style.setProperty("--floating-text-y", `${style.positionPx[1]}px`);
      element.style.setProperty("--floating-text-alpha", `${style.alpha}`);
      element.style.setProperty("--floating-text-color", style.color);
    }
    for (const [id, element] of floatingTextElements) {
      if (activeIds.has(id)) continue;
      element.remove();
      floatingTextElements.delete(id);
    }
    return states.length > 0;
  };

  const scheduleFloatingTextAnimation = () => {
    if (disposed || floatingTextAnimationFrame !== null) return;
    floatingTextAnimationFrame = window.requestAnimationFrame((now) => {
      floatingTextAnimationFrame = null;
      const region = world ? getVisibleRegion(viewport, world, viewOrigin) : null;
      if (region) renderFloatingTexts(region, now);
      if (engine) {
        resizeEngine(engine);
        renderFrame(engine, 0);
      }
      if (floatingTextSystem.hasActive(now)) scheduleFloatingTextAnimation();
    });
  };

  const recordVisibleFloatingTextDelta = ({ entityId = null, type = "entity", realm = activeRealm, cell, delta, at = performance.now() } = {}) => {
    if (!world || realm !== activeRealm || !cell || delta === 0) return null;
    const region = getVisibleRegion(viewport, world, viewOrigin);
    if (!isFloatingTextCellVisible(region, cell)) return null;
    const state = floatingTextSystem.recordDelta({ entityId, type, realm, cell, delta, at });
    if (!state) return null;
    renderFloatingTexts(region, at);
    scheduleFloatingTextAnimation();
    return state;
  };

  const hideGameCell = (slot) => {
    if (!spriteStates[slot]?.visible) return;
    updateSprite2DIndex(layer, spriteIndexes[slot], { visible: false });
    spriteStates[slot].visible = false;
  };

  const renderFogBackingCell = (region, x, y, frames) => {
    const slot = y * region.columns + x;
    const frame = frames.get(FOG_BACKING_GLYPH);
    if (frame === undefined) throw new Error("Missing cached fog backing frame.");
    const previous = spriteStates[slot];
    if (!shouldUpdateVisibleSprite(previous, FOG_BACKING_GLYPH, frame, FOG_BACKING_COLOR, 1, 0, FOG_BACKING_GLYPH)) {
      metrics.skippedCells += 1;
      return;
    }
    const spriteBounds = getRenderedCellSpriteBounds({ x, y }, viewport, world);
    const props = {
      positionPx: [spriteBounds.center.x, spriteBounds.center.y],
      sizePx: [spriteBounds.size.width, spriteBounds.size.height],
      frame,
      color: FOG_BACKING_COLOR,
      visible: true,
    };
    if (spriteIndexes[slot] === undefined) spriteIndexes[slot] = addSprite2DIndex(layer, props);
    else updateSprite2DIndex(layer, spriteIndexes[slot], props);
    spriteStates[slot] = {
      glyph: FOG_BACKING_GLYPH, visualGlyph: FOG_BACKING_GLYPH, frame, color: FOG_BACKING_COLOR,
      baseColor: FOG_BACKING_COLOR, lightingFactor: 1, fogVisibility: 0, visible: true,
    };
    metrics.submittedCells += 1;
  };

  const renderCell = (region, x, y, frames, lightField, glyphOverride = null, visibility = 100) => {
    const slot = y * region.columns + x;
    const cell = { x: region.x + x, y: region.y + y };
    const glyph = glyphOverride ?? getClientVisibleGlyph(world, cell);
    const visualGlyph = getClientVisibleGlyphKey(world, cell);
    const frame = frames.get(visualGlyph);
    if (frame === undefined) throw new Error(`Missing cached glyph frame: ${visualGlyph}`);
    const terrain = world.terrain[cell.y][cell.x];
    const baseColor = terrain.depth === "deep" && glyph === terrain.glyph
      ? colorToLinearRgba(terrain)
      : paletteColors.get(glyph) ?? colorToLinearRgba(getPaletteStyle(palette, glyph));
    const lightingFactor = lightField.getFactor(cell);
    const previous = spriteStates[slot];
    const spriteBounds = getRenderedCellSpriteBounds({ x, y }, viewport, world);
    const center = spriteBounds.center;
    if (playerCell && cell.x === playerCell.x && cell.y === playerCell.y) {
      playerRenderCenter = center;
    }
    if (!shouldUpdateVisibleSprite(previous, glyph, frame, baseColor, lightingFactor, visibility, visualGlyph)) {
      metrics.skippedCells += 1;
      return;
    }
    const fogOpacity = visibility / 100;
    const litColor = glyphBackgroundEnabled
      ? [lightingFactor, lightingFactor, lightingFactor, lightingFactor]
      : applyLightingToColor(baseColor, lightingFactor);
    const color = [...litColor.slice(0, 3), litColor[3] * fogOpacity];
    // At displayed zoom 1 the nominal cell is 0.64px wide. Preserve the
    // nominal grid positions, but give each glyph a small screen-space
    // footprint so the explored area at the farthest zoom remains inspectable
    // instead of collapsing into an effectively invisible sub-pixel cluster.
    const farZoomFootprint = zoom === MIN_ZOOM ? 4 : 0;
    const renderWidth = Math.max(farZoomFootprint, spriteBounds.size.width);
    const renderHeight = Math.max(farZoomFootprint, spriteBounds.size.height);
    const props = {
      positionPx: [center.x, center.y],
      sizePx: [renderWidth, renderHeight],
      frame, color, visible: true,
    };
    if (spriteIndexes[slot] === undefined) spriteIndexes[slot] = addSprite2DIndex(layer, props);
    else updateSprite2DIndex(layer, spriteIndexes[slot], props);
    spriteStates[slot] = {
      glyph, visualGlyph, frame, color, baseColor, lightingFactor, fogVisibility: visibility, visible: true,
    };
    metrics.submittedCells += 1;
  };

  const renderWorld = ({ refreshLighting = false } = {}) => {
    if (!world || !renderer) return { renderMs: 0, warmupMs: 0 };
    if (!initialWorldRenderComplete) {
      resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.initial);
      initialWorldRenderComplete = true;
    }
    const started = performance.now();
    const submittedBefore = metrics.submittedCells;
    const skippedBefore = metrics.skippedCells;
    const region = getVisibleRegion(viewport, world, viewOrigin);
    viewOrigin = { x: region.x, y: region.y };
    if (refreshLighting) {
      // The player is a moving light source. Invalidate the cached lighting
      // value before repainting so the old source position cannot remain in a
      // sprite slot when the calculated factor happens to be unchanged.
      for (let slot = 0; slot < region.count; slot += 1) {
        if (spriteStates[slot]?.visible) spriteStates[slot].lightingFactor = undefined;
      }
    }
    const composition = createWorldViewComposition({
      world,
      fog: fogOfWar,
      source: {
        x: region.x, y: region.y, width: region.columns, height: region.rows,
      },
      destination: {
        x: 0, y: 0, width: viewport.screenWidth, height: viewport.screenHeight,
      },
      getGlyph: getClientVisibleGlyphKey,
    });
    const visual = glyphCache.ensure(
      zoom,
      viewport.gridWidth,
      new Set([...collectWorldViewGlyphs(composition), FOG_BACKING_GLYPH]),
    );
    metrics.glyphWarmupMs += visual.warmupMs;
    if (visual.atlas !== atlas) rebuildLayer(visual.atlas);
    const lightField = lightingFieldCache.get(world, region, objectSpawnerSystem?.getLightingSources(world) ?? world.torches, playerCell, lighting);
    renderWorldViewComposition(composition, {
      drawCell: ({ localX, localY, slot, glyph, discovered, visibility }) => {
        if (!discovered) {
          renderFogBackingCell(region, localX, localY, visual.frames);
          return;
        }
        renderCell(region, localX, localY, visual.frames, lightField, getClientVisibleGlyph(world, {
          x: region.x + localX,
          y: region.y + localY,
        }), visibility);
      },
    });
    for (let slot = region.count; slot < spriteIndexes.length; slot += 1) {
      if (spriteStates[slot]?.visible) {
        updateSprite2DIndex(layer, spriteIndexes[slot], { visible: false });
        spriteStates[slot].visible = false;
      }
    }
    renderGpuLightPass(region, lightField);
    renderHealthBars(region);
    renderFloatingTexts(region);
    if (healthBarSystem.hasActive(performance.now())) scheduleHealthBarAnimation();
    if (floatingTextSystem.hasActive(performance.now())) scheduleFloatingTextAnimation();
    schedulePresentation();
    metrics.visibleCells = region.count;
    const renderMs = performance.now() - started;
    const result = {
      renderMs,
      warmupMs: visual.warmupMs,
      submittedCells: metrics.submittedCells - submittedBefore,
      skippedCells: metrics.skippedCells - skippedBefore,
    };
    if (performanceMonitor.isActive()) {
      performanceMonitor.recordPhase("main-world", renderMs, {
        visibleCells: region.count,
        submittedCells: result.submittedCells,
        skippedCells: result.skippedCells,
        warmupMs: result.warmupMs,
        zoom,
        refresh: "full",
        dirtyCoverage: 1,
        dirtyRectangles: 1,
        retainedResources: worldViewCache.snapshot().resources,
      });
    }
    return result;
  };

  renderControllers = createRenderControllers({
    minimap: renderMinimap,
    mapview: renderMapview,
    preview: renderGenerationSettingsPreview,
    world: renderWorld,
  });

  // Mapview composition is cooperative, but repeatedly starting it cancels and
  // rebuilds a large canvas job. UI changes therefore share one current-frame
  // request before they touch any renderer-owned surface.
  const scheduleMapviewRender = ({ invalidate = true, dirtyCells = [], forceFull = false } = {}) => {
    if (invalidate) mapviewContentRevision += 1;
    mapviewDirtyCells.push(...dirtyCells);
    mapviewForceFull ||= forceFull;
    if (mapviewRenderFrame !== null) return;
    mapviewRenderFrame = window.requestAnimationFrame(() => {
      mapviewRenderFrame = null;
      const nextDirtyCells = mapviewDirtyCells;
      const nextForceFull = mapviewForceFull;
      mapviewDirtyCells = [];
      mapviewForceFull = false;
      if (!disposed) renderMapview({ contentRevision: mapviewContentRevision, dirtyCells: nextDirtyCells, forceFull: nextForceFull });
    });
  };

  movementRenderScheduler = createCoalescedFrameScheduler({
    scheduleFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    render: ({ refreshLighting = false, dirtyCells = [], revisions = {} } = {}, previous = {}) => {
      if (disposed) return;
      if (revisions.world !== previous?.revisions?.world) {
        const region = world ? getVisibleRegion(viewport, world, viewOrigin) : null;
        const cacheDecision = worldViewCache.evaluate("world", {
          compatibilityKey: `${activeRealm}:${zoom}:${viewport.screenWidth}x${viewport.screenHeight}:${region?.x ?? 0},${region?.y ?? 0}:${region?.columns ?? 0}x${region?.rows ?? 0}`,
          contentKey: String(revisions.world),
          totalCells: region?.count ?? 0,
          cells: dirtyCells,
          forceFull: refreshLighting,
        });
        if (cacheDecision.mode === "full") renderWorld({ refreshLighting });
        else if (cacheDecision.mode === "partial") renderWorldDirtyCells(cacheDecision.dirtyCells, cacheDecision);
        worldViewCache.commit("world", cacheDecision);
      }
      if (revisions.minimap !== previous?.revisions?.minimap) {
        renderMinimap({ dirtyCells, forceFull: refreshLighting || gpuLightPassEnabled });
      }
    },
    merge: (previous, next) => ({
      refreshLighting: previous.refreshLighting || next.refreshLighting,
      dirtyCells: [...(previous.dirtyCells ?? []), ...(next.dirtyCells ?? [])],
      revisions: next.revisions,
    }),
  });

  // Full world lighting and sprite submission are synchronous WebGPU work.
  // Coalescing movement-driven renders prevents held input from starving
  // animation frames while preserving the final player position and lighting.
  const scheduleMovementRender = ({ refreshLighting = false, player = false, viewport = false, fog = false, lightingChanged = false, paletteChanged = false, markers = false, gpuEffect = false, dirtyCells = [], force = true } = {}) => {
    if (refreshLighting) lightingFieldCache.invalidate();
    const revisions = visualInvalidation.invalidate({
      player: player || force, viewport, fog, lighting: refreshLighting || lightingChanged || force, palette: paletteChanged, markers: markers || force, gpuEffect,
    });
    movementRenderScheduler?.schedule({ refreshLighting, dirtyCells, revisions });
  };

  const scheduleVisualRefresh = ({ refreshLighting = false, mapview = true } = {}) => {
    scheduleMovementRender({ refreshLighting, viewport: true, paletteChanged: true, gpuEffect: true });
    scheduleMinimapRender();
    if (mapview) scheduleMapviewRender();
  };

  const cancelScheduledRendersImplementation = () => {
    movementRenderScheduler?.cancel();
    if (minimapRenderFrame !== null) window.cancelAnimationFrame(minimapRenderFrame);
    if (mapviewRenderFrame !== null) window.cancelAnimationFrame(mapviewRenderFrame);
    if (presentationFrame !== null) window.cancelAnimationFrame(presentationFrame);
    if (healthBarAnimationFrame !== null) window.cancelAnimationFrame(healthBarAnimationFrame);
    if (floatingTextAnimationFrame !== null) window.cancelAnimationFrame(floatingTextAnimationFrame);
    minimapRenderFrame = null;
    mapviewRenderFrame = null;
    presentationFrame = null;
    healthBarAnimationFrame = null;
    floatingTextAnimationFrame = null;
  };
  const renderSchedulingController = createRenderSchedulingController({ cancelAll: cancelScheduledRendersImplementation });
  const cancelScheduledRenders = () => renderSchedulingController.cancel();

  const renderChangedWorldCells = (cells) => {
    if (!world || !renderer) return;
    const region = getVisibleRegion(viewport, world, viewOrigin);
    const visibleCells = cells.filter((cell) => getVisibleSlot(region, cell) !== -1 &&
      isDiscovered(fogOfWar, world, cell));
    if (visibleCells.length === 0) return;
    const glyphs = visibleCells.map((cell) => getClientVisibleGlyphKey(world, cell));
    const visual = glyphCache.ensure(zoom, viewport.gridWidth, glyphs);
    metrics.glyphWarmupMs += visual.warmupMs;
    const lightField = lightingFieldCache.get(world, region, objectSpawnerSystem?.getLightingSources(world) ?? world.torches, playerCell, lighting);
    for (const cell of visibleCells) {
      renderCell(
        region,
        cell.x - region.x,
        cell.y - region.y,
        visual.frames,
        lightField,
        null,
        getFogVisibility(fogOfWar, world, cell),
      );
    }
  };

  const renderWorldDirtyCells = (cells, cacheDecision) => {
    if (!world || !renderer) return;
    const started = performance.now();
    const submittedBefore = metrics.submittedCells;
    const skippedBefore = metrics.skippedCells;
    const region = getVisibleRegion(viewport, world, viewOrigin);
    renderChangedWorldCells(cells);
    const lightField = lightingFieldCache.get(
      world,
      region,
      objectSpawnerSystem?.getLightingSources(world) ?? world.torches,
      playerCell,
      lighting,
    );
    renderGpuLightPass(region, lightField);
    // These overlays are independently retained. Refreshing their small
    // visible sets keeps a static-cell patch visually equivalent to a full
    // composition without rebuilding the world region or light pass.
    renderHealthBars(region);
    renderFloatingTexts(region);
    schedulePresentation();
    const renderMs = performance.now() - started;
    if (performanceMonitor.isActive()) {
      performanceMonitor.recordPhase("main-world", renderMs, {
        visibleCells: region.count,
        submittedCells: metrics.submittedCells - submittedBefore,
        skippedCells: metrics.skippedCells - skippedBefore,
        warmupMs: 0,
        zoom,
        refresh: "partial",
        dirtyCoverage: cacheDecision.coverage,
        dirtyRectangles: cacheDecision.rectangles.length,
        retainedResources: worldViewCache.snapshot().resources,
      });
    }
  };

  const rebuildViewport = ({
    centerOnPlayer = false,
    zoomChanged = false,
    recalculateCamera = false,
    reapplyCameraMode = false,
  } = {}) => {
    const previousViewport = viewport;
    viewport = createViewportForCanvas(canvas, zoom);
    if (reapplyCameraMode) {
      resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.reapply);
    } else if (centerOnPlayer) {
      resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.activeMode);
    } else if (recalculateCamera && world && playerCell) {
      resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.resize, { previousViewport });
    } else {
      clampViewOrigin();
    }
    if (renderer) {
      if (!zoomChanged) rebuildLayer();
      return renderWorld();
    }
    return { renderMs: 0, warmupMs: 0 };
  };

  const reapplyCameraModeAfterTransition = () => {
    if (!cameraModeReapplyAfterTransition) return;
    cameraModeReapplyAfterTransition = false;
    rebuildViewport({ reapplyCameraMode: true });
    renderMinimap();
    renderMapview();
  };

  const getPlayerLightInfluenceCells = (previousCell, nextCell) => {
    if (!world) return [];
    const radius = Math.ceil(lighting.playerProfile.radius) + lighting.playerGpuShadowBleedRange;
    const cells = [];
    for (const source of [previousCell, nextCell]) {
      if (!source) continue;
      for (let y = Math.max(0, source.y - radius); y <= Math.min(world.rows - 1, source.y + radius); y += 1) {
        for (let x = Math.max(0, source.x - radius); x <= Math.min(world.columns - 1, source.x + radius); x += 1) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  };

  const movePlayerImplementation = () => {
    const exhaustedAtAttempt = staminaSystem.getCurrent() === 0;
    if (playerLifecycle.isDead() || gameplayInputLocked) {
      clearMovementInput();
      return exhaustedAtAttempt;
    }
    if (!world || !playerCell) return exhaustedAtAttempt;
    const direction = getHeldDirection();
    if (direction.x === 0 && direction.y === 0) return exhaustedAtAttempt;
    const attemptedCell = { x: playerCell.x + direction.x, y: playerCell.y + direction.y };
    const occupant = getOccupancyForWorld()?.getAt(attemptedCell)
      ?? getDiggableMountainTarget(world, activeRealm, attemptedCell);
    const cardinal = isCardinalDirection(direction);
    const object = cardinal ? objectSpawnerSystem?.getActiveObjectAtCell(attemptedCell, { world }) : null;
    const target = cardinal && (occupant || object)
      ? createContactTarget({ kind: occupant?.type ?? object.type, cell: attemptedCell, occupant, object })
      : null;
    const interactWithObject = () => objectSpawnerSystem?.interactAtCell(attemptedCell, {
      world,
      keyCount: characterKeys,
      spendKey: () => {
        if (characterKeys <= 0) return false;
        characterKeys -= 1;
        notifyKeys();
        return true;
      },
      log: (message) => logSystem.log({ message }),
      playerCell,
      random: createRandom(`${world.options.seed}:${attemptedCell.x},${attemptedCell.y}:chest-reward`),
      createChestRewardEffect: (type) => type === "heart" ? applyHeartEffect : () => {},
    });
    characterState = createCharacterState({ ...characterState, gold: characterGold, keys: characterKeys });
    const contact = target ? resolveCharacterContact(characterState, target, {
      sword: {
        canHandle: (candidate) => ["enemy", "enemy-spawner"].includes(candidate.kind),
        handle: () => resolvePlayerCombatTurn(occupant, {
          timeSystem, staminaSystem, experienceSystem, combatStatsSystem, enemySystem,
          spawnerSystem: enemySpawnerSystem, mountainSystem,
        }),
      },
      pickaxe: {
        canHandle: (candidate) => candidate.kind === "mountain",
        handle: () => resolvePlayerCombatTurn(occupant, {
          timeSystem, staminaSystem, experienceSystem, combatStatsSystem, enemySystem,
          spawnerSystem: enemySpawnerSystem, mountainSystem,
        }),
      },
      keys: {
        canHandle: (candidate, state) => candidate.kind === "door" && state.keys > 0,
        handle: interactWithObject,
      },
      body: {
        canHandle: (candidate) => candidate.kind === "chest",
        handle: interactWithObject,
      },
    }) : null;
    if (contact?.handled) {
      if (contact.outcome?.handled) {
        if (contact.capability === "sword") wearCharacterItem("sword", contact.outcome.appliedDamage);
        if (contact.capability === "pickaxe") wearCharacterItem("pickaxe", contact.outcome.appliedDamage);
        const doorInteraction = contact.outcome;
        if (doorInteraction.opened && doorInteraction.object.type === "door") {
          lightingFieldCache.invalidate();
          staticOccupancyIndexes.get(activeRealm)?.delete(attemptedCell.y * world.columns + attemptedCell.x);
        }
        const dirtyCells = [attemptedCell];
        if (doorInteraction.reward?.cell) {
          dirtyCells.push(doorInteraction.reward.cell);
          staticOccupancyIndexes.get(activeRealm)?.add(doorInteraction.reward.cell.y * world.columns + doorInteraction.reward.cell.x);
        }
        scheduleMovementRender({ player: true, refreshLighting: doorInteraction.opened && doorInteraction.object.type === "chest", dirtyCells, force: true });
        scheduleMapviewRender({ dirtyCells });
      }
      scheduleMovementRender({ player: true, dirtyCells: occupant?.cell ? [occupant.cell] : [] });
      scheduleMinimapRender();
      return staminaSystem.getCurrent() === 0;
    }
    if (isCardinalDirection(direction)) {
      const doorInteraction = interactWithObject();
      if (doorInteraction?.handled) {
        if (doorInteraction.opened && doorInteraction.object.type === "door") {
          lightingFieldCache.invalidate();
          staticOccupancyIndexes.get(activeRealm)?.delete(attemptedCell.y * world.columns + attemptedCell.x);
        }
        // A chest mutates two static cells at once: its own glyph and the
        // reward's chosen neighboring cell. Include both in the partial render
        // request. A first-ever Heart also needs a full one-time redraw so its
        // glyph is initialized even when the Heart generation pass is off.
         const dirtyCells = [attemptedCell];
         if (doorInteraction.reward?.cell) {
           dirtyCells.push(doorInteraction.reward.cell);
           staticOccupancyIndexes.get(activeRealm)?.add(
             doorInteraction.reward.cell.y * world.columns + doorInteraction.reward.cell.x,
           );
         }
         scheduleMovementRender({
           player: true,
           refreshLighting: doorInteraction.opened && doorInteraction.object.type === "chest",
           dirtyCells,
           force: true,
         });
        scheduleMapviewRender({ dirtyCells });
        return exhaustedAtAttempt;
      }
      if (target && ["enemy", "enemy-spawner", "mountain"].includes(target.kind)) {
        timeSystem.advance(1, "movement");
        return staminaSystem.getCurrent() === 0;
      }
    }
    const nextCell = moveWorldCell(playerCell, direction, world);
    if (nextCell.x === playerCell.x && nextCell.y === playerCell.y) return exhaustedAtAttempt;
    const nextOrigin = resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.activeMode, { targetCell: nextCell, direction, commit: false });
    if (!nextOrigin) return exhaustedAtAttempt;
    if (!getOccupancyForWorld()?.move("player", nextCell)) return exhaustedAtAttempt;
    const previousPlayerCell = playerCell;
    setPlayerFacingFromDirection(direction);
    playerCell = { ...nextCell };
    world.playerCell = playerCell;
    const objectCollision = objectSpawnerSystem?.collideAtCell(playerCell, { playerCell: { ...playerCell }, world });
    if (objectCollision?.pickupId) {
      staticOccupancyIndexes.get(activeRealm)?.delete(playerCell.y * world.columns + playerCell.x);
    }
    if (playerLifecycle.isDead()) {
      clearMovementInput();
      return exhaustedAtAttempt;
    }
    timeSystem.advance(1, "movement");
    if (playerLifecycle.isDead()) {
      clearMovementInput();
      scheduleMovementRender({ refreshLighting: true });
      return exhaustedAtAttempt;
    }
    if (direction.x === 0 && direction.y === -1) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.up);
    else if (direction.x === 0 && direction.y === 1) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.down);
    else if (direction.x === -1 && direction.y === 0) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.left);
    else if (direction.x === 1 && direction.y === 0) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.right);
    viewOrigin = nextOrigin;
    if (world.stairs?.some((stair) => stair.x === playerCell.x && stair.y === playerCell.y)) {
      refreshDiscovery();
      const destination = activeRealm === "Overground" ? "Underground" : "Overground";
      startRealmTransition(destination, playerCell);
      return exhaustedAtAttempt;
    }
    refreshDiscovery();
    // Player lighting is a moving source. The lighting field is recomputed for
    // the new position and renderCell compares its factor with each submitted
    // sprite, so only visibly changed on-screen cells are uploaded. Forcing
    // every visible slot dirty here made sprint resubmit the whole region.
    const buildingDirtyCells = getBuildingPresentationDirtyCells(world.buildings, previousPlayerCell, playerCell);
    scheduleMovementRender({ player: true, dirtyCells: [...getPlayerLightInfluenceCells(previousPlayerCell, playerCell), ...buildingDirtyCells] });
    if (buildingDirtyCells.length) scheduleMapviewRender({ dirtyCells: buildingDirtyCells });
    return exhaustedAtAttempt;
  };

  const movePlayer = () => {
    if (!performanceMonitor.isActive()) return movePlayerImplementation();
    const started = performance.now();
    try { return movePlayerImplementation(); }
    finally { performanceMonitor.recordPhase("player-move", performance.now() - started); }
  };

  const scheduleRepeat = (delay) => {
    clearRepeat();
    repeatTimer = window.setTimeout(() => {
      repeatTimer = null;
      if (playerLifecycle.isDead() || !hasHeldMovement()) return;
      const exhaustedAtAttempt = movePlayer();
      scheduleRepeat(getRepeatInterval(shiftHeld, exhaustedAtAttempt));
    }, delay);
  };

  const handleKeyDown = (event) => {
    if (playerLifecycle.isDead()) return;
    const isShiftKey = event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight";
    if (isShiftKey) {
      heldModifierKeys.add(event.code || event.key);
      shiftHeld = true;
      return;
    }
    const movementKey = event.key.toLowerCase();
    if (!getDirectionForKey(movementKey)) return;
    shiftHeld = heldModifierKeys.size > 0 || event.shiftKey;
    if (gameplayInputLocked) return;
    event.preventDefault();
    const wasHeld = heldKeys.has(movementKey);
    heldKeys.add(movementKey);
    if (wasHeld || event.repeat) return;
    const exhaustedAtAttempt = movePlayer();
    scheduleRepeat(exhaustedAtAttempt
      ? getRepeatInterval(shiftHeld, true)
      : INITIAL_REPEAT_DELAY_MS);
  };

  const handleKeyUp = (event) => {
    const isShiftKey = event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight";
    if (isShiftKey) {
      heldModifierKeys.delete(event.code || event.key);
      shiftHeld = heldModifierKeys.size > 0;
      return;
    }
    const movementKey = event.key.toLowerCase();
    if (!getDirectionForKey(movementKey)) return;
    if (gameplayInputLocked) return;
    event.preventDefault();
    heldKeys.delete(movementKey);
    shiftHeld = heldModifierKeys.size > 0 || event.shiftKey;
    if (!hasHeldMovement()) clearRepeat();
  };

  const handlePointerDown = (event) => {
    if (playerLifecycle.isDead() || gameplayInputLocked || !event.isPrimary || activePointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    touchStart = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (playerLifecycle.isDead() || gameplayInputLocked || event.pointerId !== activePointerId || !touchStart) return;
    const nextDirection = getDirectionForSwipe(
      event.clientX - touchStart.x,
      event.clientY - touchStart.y,
    );
    if (!nextDirection) return;
    event.preventDefault();
    const wasMoving = touchDirection !== null;
    touchDirection = nextDirection;
    if (wasMoving) return;
    const exhaustedAtAttempt = movePlayer();
    scheduleRepeat(exhaustedAtAttempt
      ? getRepeatInterval(shiftHeld, true)
      : INITIAL_REPEAT_DELAY_MS);
  };

  const handlePointerStop = (event) => {
    if (event.pointerId !== activePointerId) return;
    clearTouchInput();
  };

  const handleResize = () => {
    const nextCanvasSize = {
      width: Math.max(1, canvas.clientWidth || window.innerWidth),
      height: Math.max(1, canvas.clientHeight || window.innerHeight),
    };
    const nextDevicePixelRatio = window.devicePixelRatio || 1;
    // Babylon updates the canvas backing buffer itself. A ResizeObserver must
    // not treat that as a new layout and recursively submit another full frame.
    // Browser zoom can leave the CSS dimensions unchanged while changing DPR.
    if (nextCanvasSize.width === lastCanvasSize.width
      && nextCanvasSize.height === lastCanvasSize.height
      && nextDevicePixelRatio === lastDevicePixelRatio) return;
    lastCanvasSize = nextCanvasSize;
    lastDevicePixelRatio = nextDevicePixelRatio;
    applyBrowserZoomCompensation();
    watchBrowserZoom();
    clearTouchInput();
    // Browser zoom changes the canvas' CSS dimensions. Reapply the selected
    // camera mode against that new viewport so the player returns to its
    // camera-mode starting position instead of retaining a stale screen cell.
    rebuildViewport({ reapplyCameraMode: true });
    renderMinimap();
    renderMapview();
    if (generating && !world) {
      generationController.abort();
      generationController = new AbortController();
    }
  };

  const watchBrowserZoom = () => {
    browserZoomMediaQuery?.removeEventListener("change", handleResize);
    browserZoomMediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    browserZoomMediaQuery.addEventListener("change", handleResize, { once: true });
  };

  const handlePageHide = () => {
    clearMovementInput();
    cancelScheduledRenders();
    generationController.abort();
  };
  window.addEventListener("pagehide", handlePageHide);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      clearMovementInput();
      cancelScheduledRenders();
      return;
    }
    if (!disposed && world) {
      deferredWorkScheduler.resume();
      scheduleVisualRefresh({ refreshLighting: true });
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  const handleDeviceLost = (token, info) => {
    if (!rendererLifecycle.isActive(token)) return;
    clearMovementInput();
    cancelScheduledRenders();
    gameplayInputLocked = true;
    performanceMonitor.stop("unavailable");
    canvas.dataset.renderingState = "unavailable";
    canvas.setAttribute("aria-label", "Ascii RPG game unavailable");
    console.error("ASCII RPG WebGPU device lost; no fallback renderer is available.", info);
  };

  const handleWindowBlur = () => {
    clearMovementInput();
  };
  window.addEventListener("blur", handleWindowBlur);

  try {
    // Sprite coordinates are CSS pixels in Babylon Lite; a DPR > 1 currently
    // halves their apparent footprint, leaving much of the canvas empty.
    engine = await createEngine(canvas, { maxDevicePixelRatio: 1, msaaSamples: 1 });
    const lifecycleToken = rendererLifecycle.begin();
    glyphCache = createGameGlyphCache();
    minimapGlyphCache = createMinimapGlyphCache();
    atlas = glyphCache.ensure(zoom, viewport.gridWidth, []).atlas;
    layer = createSprite2DLayer(atlas, { capacity: getInitialSpriteLayerCapacity(viewport) });
    renderer = createSpriteRenderer(engine, { layers: [layer], clearValue: { r: 0, g: 0, b: 0, a: 1 } });
    registerSpriteRenderer(renderer);
    await startEngine(engine);
    stopEngine(engine);
    // Preserve the Babylon Lite-only architecture on device loss: the client
    // becomes unavailable rather than constructing an alternate renderer.
    engine._device?.lost?.then((info) => handleDeviceLost(lifecycleToken, info));
    inputController = createInputController({
      windowTarget: window,
      canvas,
      minimapCanvas,
      handlers: {
        keyDown: handleKeyDown,
        keyUp: handleKeyUp,
        resize: handleResize,
        pointerDown: handlePointerDown,
        pointerMove: handlePointerMove,
        pointerStop: handlePointerStop,
        minimapClick: handleMinimapClick,
      },
    });
    // The controller owns the legacy input contract formerly expressed by
    // window.addEventListener("orientationchange", handleResize) and its
    // matching window.removeEventListener("orientationchange", handleResize)
    // cleanup, along with the canvas pointer listeners.
    watchBrowserZoom();
    canvasResizeObserver = new ResizeObserver(handleResize);
    canvasResizeObserver.observe(canvas);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerStop);
    canvas.addEventListener("pointercancel", handlePointerStop);
    canvas.addEventListener("lostpointercapture", handlePointerStop);
    minimapCanvas.addEventListener("click", handleMinimapClick);
    generating = true;
    let generationStarted;
    let lastGenerationPhaseAt;
    const seed = getRandomSeedFromSearch(window.location.search) ?? createGeneratedSeed();
    sessionSeed = seed;
    while (!world) {
      const currentController = generationController;
      generationStarted = performance.now();
      lastGenerationPhaseAt = generationStarted;
      metrics.generationYields = 0;
      metrics.generationWaitMs = 0;
      metrics.generationPhases = {};
      try {
        const candidate = await createWorldRealms({
          rows: worldDimensions.rows,
          columns: worldDimensions.columns,
          torchCount: featureEnabled("object-torch") ? Math.round(getTorchCountForViewport(viewport, seed) * torchCountMultiplier) : 0,
          stairCount: featureEnabled("civilization-stairs") ? Math.max(0, Math.round(getObjectDistributionCount("stairs", seed) * stairsCountMultiplier)) : 0,
          seed,
          initialRealm: activeRealm,
          wallFillPercents: caveWallFillPercents,
          wallFillOffset: walkabilityWallOffset,
          smoothingIterationsByRealm: caveSmoothingIterationsByRealm,
          waterFillPercent,
          waterLakeCount,
          caveEnabledByRealm: {
            Overground: featureEnabled("overground-walls"),
            Underground: featureEnabled("underground-caves"),
          },
          waterEnabled: featureEnabled("water"),
          minWalkableMultiplier,
          playerStartMode,
        }, {
          signal: currentController.signal,
          sliceMs: 12,
          onPhase: ({ realm, phase }) => {
            const timestamp = performance.now();
            const key = `${realm}:${phase}`;
            metrics.generationPhases[key] = timestamp - generationStarted;
            if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) {
              performanceMonitor.recordPhase("generation-phase", timestamp - lastGenerationPhaseAt, { realm, feature: phase });
            }
            lastGenerationPhaseAt = timestamp;
          },
          onAttempt: ({ realm, attempt }) => {
            if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) performanceMonitor.recordAttempt({ realm, feature: "world-generation", attempt });
          },
          onYield: ({ realm, waitMs }) => {
            metrics.generationYields += 1; metrics.generationWaitMs += waitMs;
            if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) performanceMonitor.recordYieldWait(waitMs, { realm, feature: "world-generation" });
          },
        });
        if (currentController !== generationController || currentController.signal.aborted) continue;
        worldRealms = candidate;
        const activeFog = createFogOfWar(worldRealms.realms[activeRealm], { deferMetrics: true });
        worldRealms.realms[activeRealm].fog = activeFog;
        world = worldRealms.realms[activeRealm];
      } catch (error) {
        if (error.name === "AbortError" && currentController !== generationController) continue;
        throw error;
      }
    }
    generating = false;
    metrics.generationMs = performance.now() - generationStarted;
    if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) {
      performanceMonitor.recordPhase("generation", metrics.generationMs, {
        yields: metrics.generationYields,
        waitMs: metrics.generationWaitMs,
      });
      performanceMonitor.mark("generation-complete");
    }
    playerCell = world.playerStart;
    world.playerCell = playerCell;
    fogOfWar = world.fog;

    // A terrain preview is not complete-world readiness. Keep input and the
    // reveal locked until static placement, actors, fog and lighting agree.
    world.realmName = activeRealm;
    world.objects = [];
    world.pickups = world.objects;
    world.questPickupIds = new Set();
    const initialOccupancy = createDynamicOccupancy();
    world.dynamicOccupancy = initialOccupancy;
    dynamicOccupancies.set(activeRealm, initialOccupancy);
    staticOccupancyIndexes.set(activeRealm, new Set());
    initialOccupancy.claim({
      id: "player", type: "player", glyph: PLAYER_GLYPH, facing: playerFacing,
      realm: activeRealm, cell: playerCell,
    });
    resolveViewForPlayer({ initial: true });
    const initialPlayableRender = renderWorld();
    metrics.firstVisibleRenderMs = initialPlayableRender.renderMs;
    initialPlayableRenderComplete = true;
    if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) {
      performanceMonitor.mark("terrain-preview-submitted");
    }
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    const deferredRealms = Object.fromEntries(Object.entries(worldRealms.realms)
      .filter(([realmName]) => !worldRealms.realms[realmName].fog));
    const deferredFogMaps = createFogMapsForWorld({ realms: deferredRealms });
    for (const [realmName, fog] of Object.entries(deferredFogMaps)) worldRealms.realms[realmName].fog = fog;

    logSystem.log({ message: `Entered the ${activeRealm} Realm` });
    objectSpawnerSystem = createObjectSpawnerSystem({ catalog: objectData.objects, eventSystem: gameplayEvents });
    const addObjectToRealm = (realm, definition) => {
      const object = objectSpawnerSystem.addObject({ ...definition, realm });
      realm.objects.push(object);
      realm.characters[object.cell.y][object.cell.x] = object.glyph;
      return object;
    };
    const applyHeartEffect = () => {
      if (playerLifecycle.isDead()) return;
      applyPlayerHealthDelta(2);
      logSystem.log({ message: "Collected +2 Health from Heart" });
    };
    const saveCheckpoint = (realmName, cell) => {
      checkpoint = Object.freeze({ realm: realmName, cell: Object.freeze({ ...cell }), revision: ++checkpointRevision });
      for (const listener of checkpointListeners) listener(checkpoint);
    };
    const generatedObjectFeature = (type) => generationPlan.find((feature) => feature.objectType === type);
    const randomObjectCount = (type, seed) => {
      const feature = generatedObjectFeature(type);
      if (!feature) throw new RangeError(`Missing generation feature for object: ${type}.`);
      return Math.max(0, Math.round(getObjectDistributionCount(type, seed) * (objectCountMultipliers[type] ?? 1)));
    };
    for (const [realmName, realm] of Object.entries(worldRealms.realms)) {
      realm.objects = realm.objects ?? [];
      realm.pickups = realm.objects;
      realm.questPickupIds = new Set();
      for (const torch of featureEnabled("object-torch") ? realm.torches ?? [] : []) addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-torch-${torch.x}-${torch.y}`,
        type: "torch", cell: torch, effect: () => {},
      });
      for (const stair of featureEnabled("civilization-stairs") ? realm.stairs ?? [] : []) addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-stairs-${stair.x}-${stair.y}`,
        type: "stairs", cell: stair, effect: () => {},
      });
      const realmPlan = generationPlan.filter((feature) => feature.enabled && feature.realms.includes(realmName));
      const objectPlacements = placeDeclaredLevelObjects({
        world: realm,
        start: realm.playerStart,
        catalog: objectData.objects,
        features: realmPlan.filter((feature) => ["heart", "chest", "trap"].includes(feature.objectType)),
        realm: realmName,
        countFor: (feature) => feature.objectType === "chest" ? chestCount : randomObjectCount(feature.objectType, realm.options.seed),
        randomFor: (feature) => createRandom(`${realm.options.seed}:${feature.seedNamespace}`),
      });
      objectPlacements.forEach(({ definition, cells }) => cells.forEach((cell, index) => addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-${definition.type}-${index + 1}`,
        type: definition.type,
        cell,
        effect: definition.type === "heart" ? applyHeartEffect : definition.type === "trap" ? () => {
          if (playerLifecycle.isDead()) return;
          // The game-layer Trap consequence delegates to playerLifecycle.applyHealthDelta(-25).
          applyPlayerHealthDelta(-25);
          logSystem.log({ message: "Lost -25 Health from Trap" });
        } : () => {},
      })));
      if (realmName === "Overground" && featureEnabled("civilization-homes")) {
        const reserved = new Set(realm.objects.map((object) => `${object.cell.x},${object.cell.y}`));
        const buildings = createOverworldBuildings(realm, {
        random: createRandom(`${realm.options.seed}:${featureSeedNamespace("civilization-homes")}`),
          chance: Math.min(0.9, (import.meta.env.DEV ? 0.5 : 0.1) * homeChanceMultiplier),
          reserved,
        });
        realm.buildings = buildings;
        realm.civilizationGroups = [];
        buildings.forEach((building) => {
          for (const cell of building.walls) {
            realm.terrain[cell.y][cell.x].naturalWalkable = realm.terrain[cell.y][cell.x].walkable;
            realm.terrain[cell.y][cell.x].walkable = false;
          }
          realm.terrain[building.door.y][building.door.x].naturalWalkable = realm.terrain[building.door.y][building.door.x].walkable;
          realm.terrain[building.door.y][building.door.x].walkable = false;
          addObjectToRealm(realm, {
            id: `${building.id}-door`, type: "door", cell: building.door, glyph: "█", openGlyph: "□", buildingId: building.id, effect: () => {},
          });
          addObjectToRealm(realm, {
            id: `${building.id}-key`, type: "key", cell: building.key, buildingId: building.id,
            effect: () => { characterKeys += 1; notifyKeys(); logSystem.log({ message: "The key was collected." }); },
          });
          addObjectToRealm(realm, {
            id: `${building.id}-chest`, type: "chest", cell: building.chestCell, buildingId: building.id, effect: () => {},
          });
        });
      } else if (realmName === "Underground") {
        const civilizationGroups = featureEnabled("civilization-doors") ? createCivilizationGroups(realm, {
          random: createRandom(`${realm.options.seed}:${featureSeedNamespace("civilization-doors")}`),
          chance: Math.min(0.9, (import.meta.env.DEV ? 0.5 : 0.1) * civilizationChanceMultiplier),
        }) : [];
        realm.civilizationGroups = civilizationGroups;
        civilizationGroups.forEach((group, groupIndex) => {
          const groupPrefix = `${realmName.toLowerCase()}-civilization-${groupIndex + 1}`;
          const fenceGlyph = group.orientation === "horizontal" ? "─" : "│";
          const closedDoorGlyph = "█";
          const openDoorGlyph = "□";
          for (const cell of group.cells) {
            realm.terrain[cell.y][cell.x].naturalWalkable = realm.terrain[cell.y][cell.x].walkable;
            realm.terrain[cell.y][cell.x].walkable = false;
            if (cell.x === group.door.x && cell.y === group.door.y) {
              addObjectToRealm(realm, {
                id: `${groupPrefix}-door`,
                type: "door",
                cell,
                glyph: closedDoorGlyph,
                openGlyph: openDoorGlyph,
                orientation: group.orientation,
                effect: () => {},
              });
            } else {
              addObjectToRealm(realm, {
                id: `${groupPrefix}-fence-${cell.x}-${cell.y}`,
                type: "fence",
                cell,
                glyph: fenceGlyph,
                orientation: group.orientation,
                effect: () => {},
              });
            }
          }
          group.keys.forEach((cell, keyIndex) => addObjectToRealm(realm, {
            id: `${groupPrefix}-key-${keyIndex + 1}`,
            type: "key",
            cell,
            effect: () => {
              characterKeys += 1;
              notifyKeys();
              logSystem.log({ message: "The key was collected." });
            },
          }));
        });
        const fireplaceCells = featureEnabled("object-fireplace") ? selectObjectCells(
          realm,
          realm.playerStart,
          randomObjectCount("fireplace", realm.options.seed),
          createRandom(`${realm.options.seed}:${featureSeedNamespace("object-fireplace")}`),
          { minimumDistance: 3, reserved: new Set(realm.objects.map((object) => `${object.cell.x},${object.cell.y}`)) },
        ) : [];
        fireplaceCells.forEach((cell, index) => addObjectToRealm(realm, {
          id: `${realmName.toLowerCase()}-fireplace-${index + 1}`,
          type: "fireplace",
          cell,
          glyph: FIREPLACE_GLYPH,
          effect: () => saveCheckpoint(realmName, cell),
        }));
      } else {
        realm.civilizationGroups = [];
        realm.buildings = [];
      }
    }
    questManager = createQuestManager(questData.quests, getQuestValues(), {
      requestPickup: ({ type, distances }) => {
        if (type !== "gold") return;
        const goldObjects = objectSpawnerSystem.requestPickupObjects({
          type, world, start: world.playerStart, distances,
          random: createRandom(`${world.options.seed}:quest:collect-gold`),
          realm: world, idPrefix: `${activeRealm.toLowerCase()}-gold`,
          effect: () => {
            characterGold += 1;
            notifyGold();
            logSystem.log({ message: "Collected +1 Gold from Gold" });
          },
        });
        world.objects.push(...goldObjects);
        for (const object of goldObjects) world.questPickupIds.add(object.id);
        for (const object of goldObjects) world.characters[object.cell.y][object.cell.x] = object.glyph;
      },
    });
    questManager.subscribe((event) => {
      if (event.type === "completed") {
        notifyQuest(event.snapshot);
        for (const listener of questEventListeners) listener(event);
        const nextSnapshot = questManager.startNextQuest(getQuestValues());
        if (nextSnapshot?.id !== event.snapshot?.id) {
          notifyQuest(nextSnapshot);
          for (const listener of questEventListeners) listener(Object.freeze({ type: "started", snapshot: nextSnapshot }));
        }
      } else {
        notifyQuest(event.snapshot);
        if (event.type === "started") {
          for (const listener of questEventListeners) listener(event);
        }
      }
      scheduleMinimapRender();
      renderMapview();
    });
    gameplayEvents.subscribe((event) => {
      questManager.observe(event, getQuestValues());
      notifyQuest(questManager.getSnapshot());
      if (event.type === "pickup-collected") {
        scheduleMinimapRender();
        renderMapview();
      }
    });
    const startQuestInCurrentRealm = (id) => {
      const snapshot = questManager?.startQuest(id, getQuestValues()) ?? null;
      if (snapshot) realmSystem.enter(activeRealm);
      return questManager?.getSnapshot() ?? snapshot;
    };
    const storedDefaultQuestId = localStorage.getItem("babylon-lite-ascii-rpg.default-quest");
    const initialQuestId = questData.quests.some((definition) => definition.id === storedDefaultQuestId)
      ? storedDefaultQuestId
      : questData.quests[0]?.id;
    if (initialQuestId && storedDefaultQuestId !== initialQuestId) {
      localStorage.setItem("babylon-lite-ascii-rpg.default-quest", initialQuestId);
    }
    startQuestInCurrentRealm(initialQuestId);

    for (const [realmName, realm] of Object.entries(worldRealms.realms)) {
      realm.realmName = realmName;
      normalizePlayerMarkers(realm);
      realm.dynamicOccupancy = realm.dynamicOccupancy ?? createDynamicOccupancy();
      dynamicOccupancies.set(realmName, realm.dynamicOccupancy);
      staticOccupancyIndexes.set(realmName, new Set([
        ...(realm.objects ?? []).filter((object) => object.active !== false && !(object.type === "door" && object.open))
          .map((object) => object.cell.y * realm.columns + object.cell.x),
        ...(realm.buildings ?? []).flatMap((building) => [...building.cells, building.key]
          .map((cell) => cell.y * realm.columns + cell.x)),
      ]));
    }
    getOccupancyForWorld()?.claim({
      id: "player", type: "player", glyph: PLAYER_GLYPH, facing: playerFacing, realm: activeRealm, cell: playerCell,
    });

    const underground = worldRealms.realms.Underground;
    const undergroundOccupancy = dynamicOccupancies.get("Underground");
    const isStaticOccupied = (cell, realmName) => {
      const realm = worldRealms.realms[realmName];
      return Boolean(realm && staticOccupancyIndexes.get(realmName)?.has(cell.y * realm.columns + cell.x));
    };
    const isStaticOccupiedIndex = (x, y, realmName) => {
      const realm = worldRealms.realms[realmName];
      return Boolean(realm && staticOccupancyIndexes.get(realmName)?.has(y * realm.columns + x));
    };
    const scheduleEntityRender = () => {
      scheduleMovementRender({ player: true, fog: true, markers: true, force: false });
      scheduleMapviewRender();
    };
    const applyPlayerHealthDelta = (delta, at = performance.now()) => {
      if (playerLifecycle.isDead()) return 0;
      const previousHealth = playerLifecycle.getHealth();
      const nextHealth = playerLifecycle.applyHealthDelta(delta);
      const appliedDelta = nextHealth - previousHealth;
      if (appliedDelta !== 0) {
        recordVisibleFloatingTextDelta({
          entityId: "player",
          type: "player",
          realm: activeRealm,
          cell: playerCell,
          delta: appliedDelta,
          at,
        });
      }
      return appliedDelta;
    };
    const recordEntityDamage = (entity, at) => {
      healthBarSystem.recordDamage(entity, at);
      const appliedDelta = (Number(entity.health) || 0) - (Number(entity.previousHealth) || 0);
      recordVisibleFloatingTextDelta({
        entityId: entity.id,
        type: entity.type,
        realm: entity.realm,
        cell: entity.cell,
        delta: appliedDelta,
        at,
      });
      scheduleEntityRender();
      scheduleHealthBarAnimation();
    };
    mountainSystem = {
      damage: (target, amount) => {
        const result = damageMountainTarget(target, amount);
        if (!result.handled) return result;
        logSystem.log({ message: `Player dug Mountain for -${result.appliedDamage} Health` });
        recordEntityDamage(result.target, performance.now());
        if (result.killed) {
          scheduleMovementRender({ refreshLighting: true });
          scheduleMinimapRender();
          renderMapview();
        }
        return result;
      },
    };
    const initializeEnemySpawners = () => {
    enemySystem = createEnemySystem({
      timeSystem,
      occupancy: undergroundOccupancy,
      getPlayerState: (realmName) => activeRealm === realmName ? {
        realm: realmName,
        cell: playerCell,
        world: worldRealms.realms[realmName],
        alive: !playerLifecycle.isDead(),
      } : null,
      damagePlayer: (amount) => {
        if (playerLifecycle.isDead()) return;
        applyPlayerHealthDelta(-amount);
        if (playerLifecycle.isDead()) clearMovementInput();
      },
      combatStatsSystem,
      resolveIncomingContact: ({ enemy, event, maximumDamage }) => {
        characterState = createCharacterState({ ...characterState, gold: characterGold, keys: characterKeys });
        const result = resolveCharacterContact(characterState, createContactTarget({
          kind: "enemy-attack",
          cell: playerCell,
          enemy,
          event,
        }), {
          shield: {
            canHandle: (target, character) => target.kind === "enemy-attack" && character.slots.some((item) => item?.id === "shield"),
            handle: () => {
              const defense = combatStatsSystem?.getDefenseSnapshot?.();
              const damage = defense ? calculatePlayerDamageTaken(maximumDamage, defense.current, defense.maximum) : maximumDamage;
              wearCharacterItem("shield", damage);
              return damage;
            },
          },
          body: {
            canHandle: (target) => target.kind === "enemy-attack",
            handle: () => maximumDamage,
          },
        });
        return { handled: result.handled, damage: result.outcome };
      },
      isStaticOccupied,
      isStaticOccupiedIndex,
      log: (message) => logSystem.log({ message }),
      onDamage: recordEntityDamage,
      onChange: scheduleEntityRender,
    });
    enemySpawnerSystem = createEnemySpawnerSystem({
      timeSystem,
      occupancy: undergroundOccupancy,
      spawnEnemy: (request) => enemySystem.addEnemy(request),
      isWalkable: (cell, realmName) => Boolean(worldRealms.realms[realmName]?.terrain?.[cell.y]?.[cell.x]?.walkable),
      isStaticOccupied,
      randomFor: (spawner, spawnTime) => createRandom(`${underground.options.seed}:${spawner.id}:${spawnTime}`),
      log: (message) => logSystem.log({ message }),
      onDamage: recordEntityDamage,
      onChange: scheduleEntityRender,
    });
    const spawnerDistribution = featureEnabled("enemy-spawner") ? selectEnemySpawnerCells(underground, {
      realm: "Underground",
      random: createRandom(`${underground.options.seed}:${featureSeedNamespace("enemy-spawner")}`),
      includeDevelopmentBonus: import.meta.env.DEV,
      maxSpawners: maxEnemySpawners,
    }) : { normalCells: [], bonusCell: null };
    spawnerDistribution.normalCells.forEach((cell, index) => enemySpawnerSystem.addSpawner({
      id: `underground-enemy-spawner-${index + 1}`,
      realm: "Underground",
      cell,
      bornAtTime: timeSystem.getTime(),
    }));
    if (spawnerDistribution.bonusCell) enemySpawnerSystem.addSpawner({
      id: "underground-enemy-spawner-development",
      realm: "Underground",
      cell: spawnerDistribution.bonusCell,
      bornAtTime: timeSystem.getTime(),
    });
    };
    const overground = worldRealms.realms.Overground;
    const overgroundOccupancy = dynamicOccupancies.get("Overground");
    const initializeNpcSpawners = () => {
    npcSystem = createNpcSystem({
      timeSystem,
      occupancy: overgroundOccupancy,
      worldFor: (realmName) => worldRealms.realms[realmName],
      getPlayerState: (realmName) => activeRealm === realmName ? { realm: realmName, cell: playerCell, alive: !playerLifecycle.isDead() } : null,
      resolvePlayerContact: ({ npc, player, event }) => {
        characterState = createCharacterState({ ...characterState, gold: characterGold, keys: characterKeys });
        return resolveCharacterContact(characterState, createContactTarget({ kind: "npc", cell: player.cell, npc, event }), {});
      },
      isWalkable: (cell, realmName) => Boolean(worldRealms.realms[realmName]?.terrain?.[cell.y]?.[cell.x]?.walkable),
      isStaticOccupied,
      randomFor: (npc, tick) => createRandom(`${overground.options.seed}:${npc.id}:${tick}`),
      onChange: scheduleEntityRender,
      deferredScheduler: deferredWorkScheduler,
      isActive: () => !disposed,
      isRealmActive: (realmName) => activeRealm === realmName,
    });
    npcSpawnerSystem = createNpcSpawnerSystem({
      timeSystem,
      occupancy: overgroundOccupancy,
      spawnNpc: (request) => npcSystem.addNpc(request),
      worldFor: (realmName) => worldRealms.realms[realmName],
      isWalkable: (cell, realmName) => Boolean(worldRealms.realms[realmName]?.terrain?.[cell.y]?.[cell.x]?.walkable),
      isStaticOccupied,
      randomFor: (spawner, tick) => createRandom(`${overground.options.seed}:${spawner.id}:${tick}`),
      onChange: scheduleEntityRender,
    });
    (featureEnabled("npc-spawner") ? selectNpcSpawnerCells(overground, {
      realm: "Overground",
      count: npcSpawnerCount,
      random: createRandom(`${overground.options.seed}:${featureSeedNamespace("npc-spawner")}`),
    }) : { cells: [] }).cells.forEach((cell, index) => npcSpawnerSystem.addSpawner({
      id: `overground-npc-spawner-${index + 1}`,
      realm: "Overground",
      cell,
      bornAtTime: timeSystem.getTime(),
    }));
    };
    const initializeDynamicFeature = Object.freeze({
      "npc-spawner": initializeNpcSpawners,
      "enemy-spawner": initializeEnemySpawners,
    });
    initializeDynamicGenerationFeatures(
      generationPlan.filter((feature) => feature.owner === "dynamic" && feature.enabled),
      initializeDynamicFeature,
    );
    performanceMonitor.markMilestone("complete-visible-placement");
    timeSystem.dispatchCurrent("session-start");
    notifyGold();
    notifyKeys();
    refreshStartingDiscovery();
    refreshDiscovery();
    if (!initialPlayableRenderComplete) resolveViewForPlayer({ initial: true });
    const firstRender = renderWorld();
    renderMinimap();
    renderMapview();
    metrics.firstVisibleRenderMs = firstRender.renderMs;
    if (performanceMonitor.getActiveScenario() === PERFORMANCE_SCENARIOS.STARTUP) {
      performanceMonitor.markMilestone("first-complete-view-submitted");
    }
    markPlayable();
    startInitialReveal();
    if (!transitionActive) finishStartupPerformance();
    metrics.totalReadyMs = performance.now() - generationStarted;
    console.info("ASCII RPG render readiness", JSON.stringify({
      generationMs: metrics.generationMs,
      firstVisibleRenderMs: metrics.firstVisibleRenderMs,
      totalReadyMs: metrics.totalReadyMs,
      readyTargetMs: 1000,
      readyIdealMs: 100,
      readyTargetMet: metrics.totalReadyMs < 1000,
      generationYields: metrics.generationYields,
      generationWaitMs: metrics.generationWaitMs,
      generationPhases: metrics.generationPhases,
      visibleCells: metrics.visibleCells,
      submittedCells: firstRender.submittedCells,
      skippedCells: firstRender.skippedCells,
      cache: glyphCache.snapshot(),
    }));
  } catch (error) {
    performanceMonitor.failStartup(error?.message ?? error, "unavailable");
    rendererLifecycle.beginDisposal();
    clearMovementInput();
    cancelScheduledRenders();
    renderControllers?.minimap.dispose();
    renderControllers?.mapview.dispose();
    renderControllers?.preview.dispose();
    renderControllers?.world.dispose();
    window.removeEventListener("pagehide", handlePageHide);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    inputController?.dispose();
    browserZoomMediaQuery?.removeEventListener("change", handleResize);
    canvasResizeObserver?.disconnect();
    disposeHealthBarOverlay();
    disposeFloatingTextOverlay();
    renderer && disposeSpriteRenderer(renderer);
    glyphCache?.dispose();
    minimapGlyphCache?.dispose();
    engine && disposeEngine(engine);
    container.replaceChildren();
    throw error;
  }

  if (diagnostics && new URLSearchParams(window.location.search).get("performanceSprint") === "true") {
    stopSprintDiagnostic = startSprintDiagnostic({
      monitor: performanceMonitor,
      durationMs: Math.min(60000, Math.max(4000, Number(new URLSearchParams(window.location.search).get("performanceDurationMs")) || 8000)),
      read: () => ({ disposed, locked: gameplayInputLocked || transitionActive, realm: activeRealm,
        cell: playerCell, rows: world.rows, columns: world.columns, dead: playerLifecycle.isDead(),
        exhausted: staminaSystem.getCurrent() === 0, ticks: timeSystem.getDiagnostics() }),
      canEnter: (cell) => world.terrain?.[cell.y]?.[cell.x]?.walkable === true
        && !getOccupancyForWorld()?.getAt(cell)
        && !staticOccupancyIndexes.get(activeRealm)?.has(cell.y * world.columns + cell.x)
        && !world.stairs?.some((stair) => stair.x === cell.x && stair.y === cell.y),
      keyDown: handleKeyDown, keyUp: handleKeyUp, changeRealm: (realm) => startRealmTransition(realm),
    });
  }

  return Object.freeze({
    startPerformanceSession(options = {}) {
      const session = performanceMonitor.start({
        ...options,
        awaitPlayable: !playable,
        environment: { ...getPerformanceEnvironment(), ...(options.environment ?? {}) },
      });
      if (playable) performanceMonitor.markPlayable();
      return session;
    },
    stopPerformanceSession(completion) {
      return performanceMonitor.stop(completion);
    },
    getPerformanceReport() {
      return performanceMonitor.getReport();
    },
    resetPerformanceSession() {
      performanceMonitor.reset();
    },
    setPalette(nextPalette) {
      validatePaletteEntries(nextPalette);
      const offsetChanged = collectChangedOffsetGlyphs(palette, nextPalette);
      palette = nextPalette.map((entry) => ({ ...entry }));
      const { colors, changed } = reconcilePaletteColors(paletteColors, palette);
      paletteColors = colors;
      paletteOffsets = new Map(palette.map((entry) => [entry.glyph, getPaletteEntryOffsets(entry)]));
      if (glyphBackgroundEnabled || offsetChanged.size > 0) {
        rebuildGameGlyphCache();
        rebuildMinimapGlyphCache();
        scheduleVisualRefresh();
        return;
      }
      for (let slot = 0; slot < spriteStates.length; slot += 1) {
        const state = spriteStates[slot];
        if (!state?.visible || !changed.has(state.glyph)) continue;
        const baseColor = paletteColors.get(state.glyph);
        const color = applyLightingToColor(baseColor, state.lightingFactor);
        updateSprite2DIndex(layer, spriteIndexes[slot], { color });
        state.baseColor = baseColor;
        state.color = color;
        metrics.submittedCells += 1;
      }
      if (gpuLightPassEnabled) scheduleVisualRefresh();
      else {
        scheduleMinimapRender();
        scheduleMapviewRender();
        schedulePresentation();
      }
    },
    setFont(nextFontId) {
      validateFontId(nextFontId);
      if (nextFontId === fontId) return;
      if (layer) removeSpriteRendererLayer(renderer, layer);
      glyphCache.dispose();
      minimapGlyphCache.dispose();
      minimapGlyphCanvases.clear();
      fontId = nextFontId;
      glyphCache = createGameGlyphCache();
      rebuildMinimapGlyphCache();
      layer = null;
      atlas = null;
      scheduleVisualRefresh();
    },
    setZoom(nextZoom) {
      if (!Number.isFinite(nextZoom)) return;
      const selected = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(nextZoom)));
      if (selected === zoom) return;
      const started = performance.now();
      zoom = selected;
      // A zoom changes the number of visible cells. Reapply the active
      // camera mode instead of preserving Lock/Deadzone's old screen cell.
      const result = rebuildViewport({ reapplyCameraMode: true, zoomChanged: true });
      metrics.lastZoomWarmupMs = result.warmupMs;
      metrics.lastZoomRerenderMs = performance.now() - started - result.warmupMs;
      console.info("ASCII RPG zoom render", JSON.stringify({
        zoom,
        visibleCells: metrics.visibleCells,
        warmupMs: metrics.lastZoomWarmupMs,
        rerenderMs: metrics.lastZoomRerenderMs,
        targetMs: 1000 / 60,
        targetMet: metrics.lastZoomRerenderMs <= 1000 / 60,
        submittedCells: result.submittedCells,
        skippedCells: result.skippedCells,
        cache: glyphCache.snapshot(),
      }));
    },
    getRandomSeed() { return sessionSeed; },
    setLighting(nextLighting) {
      const legacyLighting = createLightingConfig(nextLighting);
      lighting = { ...lighting, ambient: legacyLighting.ambient, torchProfile: legacyLighting };
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setRealmAmbient(nextAmbient) {
      realmAmbient = { ...realmAmbient, ...nextAmbient };
      lighting = { ...lighting, ambient: realmAmbient[activeRealm] };
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setRealmPreference(realm) {
      if (realm !== activeRealm && worldRealms) startRealmTransition(realm);
    },
    travelRealm() { travelToNearestStairs(); },
    getRealm() { return activeRealm; },
    getRealmDiscoverySnapshot,
    startQuest(id) {
      if (!questData.quests.some((definition) => definition.id === id)) return null;
      const snapshot = questManager?.startQuest(id, getQuestValues()) ?? null;
      if (snapshot) realmSystem.enter(activeRealm);
      return questManager?.getSnapshot() ?? snapshot;
    },
    getQuestSnapshot() { return questManager?.getSnapshot() ?? null; },
    subscribeToQuest(listener) {
      questListeners.add(listener);
      if (questManager?.getSnapshot()) listener(questManager.getSnapshot());
      return () => questListeners.delete(listener);
    },
    subscribeToQuestEvent(listener) {
      questEventListeners.add(listener);
      return () => questEventListeners.delete(listener);
    },
    getGold() { return characterGold; },
    getCharacterState() { return characterState; },
    subscribeToCharacterState(listener) {
      characterStateListeners.add(listener);
      listener(characterState);
      return () => characterStateListeners.delete(listener);
    },
    subscribeToGold(listener) {
      goldListeners.add(listener);
      listener(characterGold);
      return () => goldListeners.delete(listener);
    },
    getHealth() { return playerLifecycle.getHealth(); },
    subscribeToHealth(listener) {
      return playerLifecycle.subscribeToHealth(listener);
    },
    getStaminaSnapshot() { return staminaSystem.getSnapshot(); },
    subscribeToStamina(listener) {
      return staminaSystem.subscribe(listener);
    },
    getExperienceSnapshot() { return experienceSystem.getSnapshot(); },
    subscribeToExperience(listener) {
      return experienceSystem.subscribe(listener);
    },
    getCombatStatsSnapshot() { return combatStatsSystem.getSnapshot(); },
    subscribeToCombatStats(listener) {
      return combatStatsSystem.subscribe(listener);
    },
    getPlayerDead() { return playerLifecycle.isDead(); },
    subscribeToPlayerDead(listener) {
      return playerLifecycle.subscribeToDeath(listener);
    },
    getCheckpointSnapshot() { return checkpoint ?? Object.freeze({ realm: null, cell: null, revision: checkpointRevision }); },
    subscribeToCheckpoint(listener) { checkpointListeners.add(listener); return () => checkpointListeners.delete(listener); },
    restartFromCheckpoint() {
      if (!playerLifecycle.isDead() || !checkpoint) return false;
      clearMovementInput();
      if (checkpoint.realm !== activeRealm) activateRealm(checkpoint.realm, checkpoint.cell);
      else {
        getOccupancyForWorld()?.move("player", checkpoint.cell);
        playerCell = { ...checkpoint.cell };
        world.playerCell = playerCell;
        resolveCameraOrigin(CAMERA_RESOLVE_INTENTS.activeMode);
        refreshDiscovery({ immediate: true });
      }
      playerLifecycle.revive();
      scheduleMovementRender({ refreshLighting: true });
      scheduleMinimapRender();
      renderMapview();
      return true;
    },
    restartGame() {
      const url = new URL(window.location.href);
      url.searchParams.set("randomSeed", sessionSeed);
      window.location.assign(url);
      return true;
    },
    getLogSnapshot() { return logSystem.getSnapshot(); },
    subscribeToLog(listener) {
      return logSystem.subscribe(listener);
    },
    subscribeToRealm(listener) { realmListeners.add(listener); return () => realmListeners.delete(listener); },
    subscribeToRealmDiscovery(listener) {
      realmDiscoveryListeners.add(listener);
      listener(getRealmDiscoverySnapshot());
      return () => realmDiscoveryListeners.delete(listener);
    },
    subscribeToMinimapZoom(listener) { minimapZoomListeners.add(listener); return () => minimapZoomListeners.delete(listener); },
    setTorchLighting(profile) {
      lighting = { ...lighting, torchProfile: getLightingProfile(profile).config };
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setPlayerLighting(profile) {
      lighting = { ...lighting, playerProfile: getLightingProfile(profile).config };
      refreshDiscovery();
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setTorchShadow(profile) {
      lighting = { ...lighting, torchShadow: getShadowProfile(profile).config };
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setPlayerShadow(profile) {
      lighting = { ...lighting, playerShadow: getShadowProfile(profile).config };
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setPlayerGpuShadowBleedRange(range) {
      lighting = { ...lighting, playerGpuShadowBleedRange: Number(range) };
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setGlyphBackground(enabled) {
      const nextEnabled = enabled === true;
      if (nextEnabled === glyphBackgroundEnabled) return;
      glyphBackgroundEnabled = nextEnabled;
      rebuildGameGlyphCache();
      rebuildMinimapGlyphCache();
      scheduleVisualRefresh({ mapview: false });
    },
    setBackgroundDarkness(darkness) {
      if (!Number.isInteger(darkness)) return;
      const nextDarkness = Math.min(100, Math.max(0, darkness));
      if (nextDarkness === backgroundDarkness) return;
      backgroundDarkness = nextDarkness;
      if (glyphBackgroundEnabled) {
        rebuildGameGlyphCache();
        rebuildMinimapGlyphCache();
        scheduleVisualRefresh();
      }
    },
    setGpuLightPass(enabled) {
      const nextEnabled = enabled === true;
      if (nextEnabled === gpuLightPassEnabled) return;
      gpuLightPassEnabled = nextEnabled;
      scheduleVisualRefresh({ refreshLighting: true });
    },
    setMinimapZoom(nextZoom) {
      if (!MINIMAP_SCALE_LEVELS.includes(nextZoom) || nextZoom === minimapZoom) return;
      minimapZoom = nextZoom;
      scheduleMinimapRender();
    },
    setMapviewOpen(open) {
      const nextOpen = open === true;
      if (nextOpen === mapviewOpen) {
        if (mapviewOpen) scheduleMapviewRender({ invalidate: false });
        else releaseMapviewResources();
        return;
      }
      mapviewOpen = nextOpen;
      gameplayInputLocked = nextOpen || transitionActive;
      clearMovementInput();
      mapviewCanvas.hidden = !nextOpen;
      if (nextOpen) {
        mapviewRealm = activeRealm;
        scheduleMapviewRender();
      }
      else {
        releaseMapviewResources();
        mapviewRealm = activeRealm;
      }
    },
    setAspectMode(nextAspect) {
      const selectedAspect = nextAspect === "portrait" ? "portrait" : "landscape";
      if (selectedAspect === activeAspectMode) return;
      activeAspectMode = selectedAspect;
      if (aspectRebuildFrame !== null) window.cancelAnimationFrame(aspectRebuildFrame);
      aspectRebuildFrame = window.requestAnimationFrame(() => {
        // The React aspect update changes the canvas' CSS frame. Wait for the
        // following presentation frame so clientWidth/clientHeight describe the
        // active layout rather than the outgoing presentation frame.
        aspectRebuildFrame = window.requestAnimationFrame(() => {
          aspectRebuildFrame = null;
          // A user-selected aspect change must reapply the active camera so the
          // player is centered in the newly committed presentation frame.
          rebuildViewport({ reapplyCameraMode: true });
          scheduleMinimapRender();
          scheduleMapviewRender();
        });
      });
    },
    toggleMapviewRealm() {
      if (!mapviewOpen || !worldRealms?.realms) return;
      const realms = Object.keys(worldRealms.realms);
      if (realms.length < 2) return;
      const index = Math.max(0, realms.indexOf(mapviewRealm));
      mapviewRealm = realms[(index + 1) % realms.length];
      scheduleMapviewRender();
    },
    renderGenerationSettingsPreview(targetCanvas, previewSettings, previewRealm, seedMode) {
      return renderControllers?.preview.render(targetCanvas, previewSettings, previewRealm, seedMode);
    },
    setCameraMode(nextMode) {
      const selected = normalizeCameraMode(nextMode);
      if (selected === cameraMode) return;
      cameraMode = selected;
      rebuildViewport({ centerOnPlayer: true });
    },
    getTime() {
      return timeSystem.getTime();
    },
    subscribeToTime(listener) {
      return timeSystem.subscribe(listener);
    },
    dispose() {
      if (disposed) return;
      stopSprintDiagnostic?.();
      disposed = true;
      rendererLifecycle.beginDisposal();
      clearMovementInput();
      generationController.abort();
      renderControllers?.minimap.dispose();
      renderControllers?.mapview.dispose();
      renderControllers?.preview.dispose();
      renderControllers?.world.dispose();
      cancelSettingsMapPreview();
      if (aspectRebuildFrame !== null) {
        window.cancelAnimationFrame(aspectRebuildFrame);
        aspectRebuildFrame = null;
      }
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      browserZoomMediaQuery?.removeEventListener("change", handleResize);
      canvasResizeObserver?.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerStop);
      canvas.removeEventListener("pointercancel", handlePointerStop);
      canvas.removeEventListener("lostpointercapture", handlePointerStop);
      minimapCanvas.removeEventListener("click", handleMinimapClick);
      cancelScheduledRenders();
      cancelMapviewRender();
      npcSystem?.dispose();
      unsubscribeDeferredWorkMetrics();
      deferredWorkScheduler.dispose();
      transitionSystem.dispose();
      transitionMask.remove();
      if (typeof disposeGpuLightPass === "function") disposeGpuLightPass();
      disposeHealthBarOverlay();
      disposeFloatingTextOverlay();
      disposeSpriteRenderer(renderer);
      glyphCache.dispose();
      minimapGlyphCache.dispose();
      releaseMapviewResources();
      worldViewCache.clear();
      disposeEngine(engine);
      stopStaminaTimeRecovery();
      staminaSystem.dispose();
      experienceSystem.dispose();
      combatStatsSystem.dispose();
      healthBarSystem.clear();
      floatingTextSystem.clear();
      for (const occupancy of dynamicOccupancies.values()) occupancy.clear();
      dynamicOccupancies.clear();
      staticOccupancyIndexes.clear();
      timeSystem.dispose();
      logSystem.dispose();
      container.replaceChildren();
    },
  });
}
