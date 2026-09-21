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
import {
  DEFAULT_FONT_RESOLUTION,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_UPSCALE,
  INITIAL_REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  createViewport,
  getCellCenter,
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
import { getPaletteStyle, validatePaletteEntries } from "../bridge-layer/palette.js";
import { PLAYER_MOVED_EVENTS, sendKeySnapshot, sendPlayerMovedEvent } from "../bridge-layer/game-bridge.js";
import {
  clearCharacter,
  createGeneratedSeed,
  createRandom,
  createWorldRealms,
  PROJECT_MAP_GLYPHS,
  GOLD_GLYPH,
  HEALTH_GLYPH,
  TRAP_GLYPH,
  TORCH_GLYPH,
  STAIR_GLYPH,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  normalizePlayerMarkers,
  setCharacter,
} from "./systems/world-system.js";
import { createTimeSystem } from "./systems/time-system.js";
import { createGlyphRasterCanvas, createGlyphVisualCache, rasterizeCompositeGlyph, rasterizeGlyph } from "./glyph-visual-cache.js";
import { getVisibleRegion, getVisibleSlot, shouldUpdateVisibleSprite } from "./visible-region.js";
import { collectWorldViewGlyphs, createWorldViewComposition, renderWorldViewComposition } from "./world-view.js";
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
  discoverFromPlayer,
  discoverStartingArea,
  getFogVisibility,
  isDiscovered,
} from "./systems/fog-of-war-system.js";
import { findNearestNavigationTarget, getMinimapEdgeIndicators, getMinimapIndicatorSafeArea, getMinimapMarkers, getMinimapWorldCellGraphic, MINIMAP_INDICATOR_MIN_SIZE, MINIMAP_INDICATOR_SAFE_INSET } from "./systems/minimap-renderer.js";
import { canHandleMinimapScale, getMinimapCellLayout, getNextMinimapScale, MINIMAP_SCALE_LEVELS } from "./systems/minimap-zoom.js";
import { createTransitionSystem, TRANSITION_PHASES } from "./systems/transition-system.js";
import questData from "./data/quest_data.json";
import objectData from "./data/object_data.json";
import { createObjectSpawnerSystem, selectObjectCells } from "./systems/object-spawner-system.js";
import { createQuestManager } from "./systems/quest-system.js";
import { createLogSystem } from "./systems/log-system.js";
import { createGameplayEventSystem } from "./systems/gameplay-event-system.js";
import { createRealmSystem } from "./systems/realm-system.js";
import { createPlayerLifecycle } from "./systems/player-lifecycle.js";
import { createCivilizationGroups, isCardinalDirection } from "./systems/civilization-system.js";
import { attachReplacementRendererLayer } from "./systems/renderer-layer-handoff.js";
import { createCoalescedFrameScheduler } from "./movement-render-scheduler.js";

const GLYPHS = PROJECT_MAP_GLYPHS;
const WORLD_ROWS = 512;
const WORLD_COLUMNS = 512;
const TORCHES_PER_SCREEN = 3;
const REALM_TRANSITION_CLOSE_MS = 500;
const REALM_TRANSITION_COVER_HOLD_MS = 100;
const REALM_TRANSITION_OPEN_MS = 500;
const INITIAL_TRANSITION_OPEN_MS = 1000;
const INITIAL_SPRITE_LAYER_CAPACITY = 4096;
const STARTING_FOG_CLEAR_ZOOM = 5;

function getInitialSpriteLayerCapacity(viewport) {
  return Math.max(1, Math.min(INITIAL_SPRITE_LAYER_CAPACITY, viewport.rows * viewport.columns));
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
 * Starts the non-React Babylon Lite game runtime and returns its narrow UI bridge.
 * The bridge deliberately exposes only the UI-facing game state and controls.
 */
export async function startGameLayer(container, initialPalette, initialFontId = "monospace", initialRealm = "Overground", initialCameraMode = "lock") {
  if (!container || !navigator.gpu) {
    throw new Error("Babylon Lite requires WebGPU; the game world was not started.");
  }

  validatePaletteEntries(initialPalette);
  validateFontId(initialFontId);
  const canvas = document.createElement("canvas");
  canvas.id = "game_canvas";
  canvas.setAttribute("aria-label", "Ascii RPG game");
  const minimapCanvas = document.createElement("canvas");
  minimapCanvas.id = "minimap_canvas";
  minimapCanvas.setAttribute("aria-label", "Exploration minimap");
  const transitionMask = document.createElement("div");
  transitionMask.className = "game_transition_mask";
  transitionMask.setAttribute("aria-hidden", "true");
  transitionMask.hidden = true;
  container.replaceChildren(canvas, minimapCanvas, transitionMask);

  let engine;
  let renderer;
  let atlas;
  let layer;
  let glyphCache;
  let minimapGlyphCache;
  let gpuLightAtlas;
  let gpuLightLayer;
  let gpuLightPassEnabled = false;
  const minimapGlyphCanvases = new Map();
  const minimapGpuLightSamples = [];
  let disposed = false;
  let repeatTimer = null;
  let minimapRenderFrame = null;
  let presentationFrame = null;
  let lastPresentationTime = 0;
  let movementRenderScheduler = null;
  let generationController = new AbortController();
  let generating = false;
  const heldKeys = new Set();
  const heldModifierKeys = new Set();
  let shiftHeld = false;
  const realmListeners = new Set();
  const minimapZoomListeners = new Set();
  let touchDirection = null;
  let activePointerId = null;
  let touchStart = null;
  let transitionActive = false;
  let gameplayInputLocked = false;
  let transitionSystem = null;
  let transitionCenter = null;
  let playerRenderCenter = null;
  let viewport = createViewportForCanvas(canvas);
  let lastCanvasSize = {
    width: Math.max(1, canvas.clientWidth || window.innerWidth),
    height: Math.max(1, canvas.clientHeight || window.innerHeight),
  };
  let canvasResizeObserver = null;
  let world = null;
  let worldRealms = null;
  let sessionSeed = null;
  let activeRealm = initialRealm === "Underground" ? "Underground" : "Overground";
  let playerCell = null;
  let characterGold = 0;
  let characterKeys = 0;
  const playerLifecycle = createPlayerLifecycle();
  let questManager = null;
  let objectSpawnerSystem = null;
  const questListeners = new Set();
  const questEventListeners = new Set();
  const goldListeners = new Set();
  let fogOfWar = null;
  let minimapZoom = 2;
  let viewOrigin = { x: 0, y: 0 };
  let initialWorldRenderComplete = false;
  let startupCameraModeReapplyPending = false;
  let cameraMode = normalizeCameraMode(initialCameraMode);
  const timeSystem = createTimeSystem();
  const logSystem = createLogSystem();
  const gameplayEvents = createGameplayEventSystem();
  const realmSystem = createRealmSystem({ eventSystem: gameplayEvents });
  let palette = initialPalette.map((entry) => ({ ...entry }));
  let paletteColors = reconcilePaletteColors(null, palette).colors;
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
  let zoom = DEFAULT_ZOOM;
  let glyphBackgroundEnabled = true;
  let backgroundDarkness = 50;
  const spriteIndexes = [];
  const spriteStates = [];
  const gpuLightSpriteIndexes = [];
  const gpuLightSpriteStates = [];
  const gpuLightSamples = [];
  let gpuLightActiveSlots = new Uint8Array(0);
  const metrics = {
    visibleCells: 0, submittedCells: 0, skippedCells: 0, glyphWarmupMs: 0,
    generationMs: null, firstVisibleRenderMs: null, totalReadyMs: null,
    lastZoomRerenderMs: null, lastZoomWarmupMs: null,
    generationYields: 0, generationWaitMs: 0, generationPhases: {},
  };

  const notifyQuest = (snapshot) => {
    for (const listener of questListeners) listener(snapshot);
  };

  const notifyGold = () => {
    for (const listener of goldListeners) listener(characterGold);
  };

  const notifyKeys = () => {
    sendKeySnapshot(characterKeys);
  };

  const getMinimapNavigationMarkers = () => {
    const activeStep = questManager?.getSnapshot()?.steps.find((step) => step.active);
    const navigation = activeStep?.navigation;
    if (!navigation) return [];
    const target = findNearestNavigationTarget(world, playerCell, navigation);
    return target ? [{ id: navigation, cell: target.cell }] : [];
  };

  const renderMinimap = () => {
    if (!fogOfWar) return;
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
    // The minimap uses the game canvas dimensions to select its source cells,
    // then maps those cells into its own fixed canvas. This keeps matching
    // game/minimap zooms on the same viewport composition instead of making a
    // smaller minimap panel define a different camera.
    const gameScreenWidth = canvas.clientWidth || window.innerWidth;
    const gameScreenHeight = canvas.clientHeight || window.innerHeight;
    const minimapBaseViewport = createViewport({
      screenWidth: gameScreenWidth,
      screenHeight: gameScreenHeight,
      upscale: DEFAULT_UPSCALE,
      zoom: minimapZoom,
      fontResolution: DEFAULT_FONT_RESOLUTION,
      gridWidth: DEFAULT_GRID_WIDTH,
      gridHeight: DEFAULT_GRID_HEIGHT,
    });
    const minimapPixelRatio = devicePixelRatio;
    const fixedCellWidth = minimapBaseViewport.gridWidth * minimapPixelRatio;
    const fixedCellHeight = minimapBaseViewport.gridHeight * minimapPixelRatio;
    const sourceColumns = Math.min(world.columns,
      Math.max(1, minimapBaseViewport.columns),
      Math.max(1, Math.floor(minimapCanvas.width / fixedCellWidth)),
    );
    const sourceRows = Math.min(
      world.rows,
      Math.max(1, minimapBaseViewport.rows),
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
    const composition = createWorldViewComposition({
      world,
      fog: fogOfWar,
      source: { x: sourceX, y: sourceY, width: sourceColumns, height: sourceRows },
      destination,
      getGlyph: getVisibleGlyph,
    });
    const minimapRegion = {
      x: sourceX,
      y: sourceY,
      columns: sourceColumns,
      rows: sourceRows,
      count: sourceColumns * sourceRows,
    };
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
        if (isDiscovered(fogOfWar, world, {
          x: sourceX + sample.x,
          y: sourceY + sample.y,
        })) minimapGpuLightSamples.push(sample);
      }
    }
    const visual = minimapGlyphCache.ensure(
      minimapZoom,
      minimapBaseViewport.gridWidth,
      collectWorldViewGlyphs(composition),
    );
    renderWorldViewComposition(composition, {
      drawBackground: () => {
        context.globalAlpha = 1;
        context.fillStyle = "#000";
        context.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
      },
      drawCell: ({ localX, localY, glyph, discovered, visibility }) => {
        if (!discovered) return;
        const graphic = getMinimapWorldCellGraphic(world, fogOfWar, palette, {
          x: sourceX + localX,
          y: sourceY + localY,
        });
        if (!graphic) return;
        const raster = visual.rasters.get(glyph);
        if (!raster) return;
        const lightingFactor = minimapLightField.getFactor({ x: sourceX + localX, y: sourceY + localY });
        const fogOpacity = visibility / 100;
        const baseColor = paletteColors.get(glyph) ?? colorToLinearRgba(getPaletteStyle(palette, glyph));
        const litColor = linearRgbaToRendererHex(applyLightingToColor(baseColor, lightingFactor));
        const cacheKey = `${graphic.glyph}:${litColor}:${lightingFactor.toFixed(6)}:${fogOpacity.toFixed(2)}:${raster.width}`;
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
        context.drawImage(
          glyphCanvas,
          offsetX + localX * cellWidth,
          offsetY + localY * cellHeight,
          cellWidth,
          cellHeight,
        );
      },
      drawOverlay: () => {
        context.globalAlpha = 1;
        if (minimapGpuLightSamples.length > 0) {
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
        for (const marker of getMinimapMarkers(world, fogOfWar, playerCell, { navigationMarkers })) {
          const markerWorldX = marker.cell.x;
          const markerWorldY = marker.cell.y;
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
        for (const indicator of getMinimapEdgeIndicators(world, playerCell, {
          x: sourceX, y: sourceY, columns: sourceColumns, rows: sourceRows,
        }, { navigationMarkers })) {
          const offset = (indicator.offsetIndex % 3 - 1) * Math.min(cellWidth, cellHeight) * 0.55;
          const edgeX = offsetX + indicator.edge.x * cellWidth + (Math.abs(indicator.direction.x) < Math.abs(indicator.direction.y) ? offset : 0);
          const edgeY = offsetY + indicator.edge.y * cellHeight + (Math.abs(indicator.direction.x) >= Math.abs(indicator.direction.y) ? offset : 0);
          const angle = Math.atan2(indicator.direction.y, indicator.direction.x);
          const size = Math.max(MINIMAP_INDICATOR_MIN_SIZE * devicePixelRatio, Math.min(cellWidth, cellHeight) * 0.8);
          const arrowExtent = size * 0.6;
          const safeEdgeX = Math.min(safeArea.right - arrowExtent, Math.max(safeArea.left + arrowExtent, edgeX));
          const safeEdgeY = Math.min(safeArea.bottom - arrowExtent, Math.max(safeArea.top + arrowExtent, edgeY));
          context.save();
          context.translate(safeEdgeX, safeEdgeY);
          context.rotate(angle);
          context.fillStyle = indicator.color;
          context.beginPath();
          context.moveTo(size * 0.6, 0);
          context.lineTo(-size * 0.45, -size * 0.45);
          context.lineTo(-size * 0.45, size * 0.45);
          context.closePath();
          context.fill();
          context.restore();
        }
      },
    });
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
  const scheduleMinimapRender = () => {
    if (minimapRenderFrame !== null) return;
    minimapRenderFrame = window.requestAnimationFrame(() => {
      minimapRenderFrame = null;
      if (!disposed) renderMinimap();
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
    if (immediate) renderMinimap();
    else scheduleMinimapRender();
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
  };

  const activateRealm = (name, arrival = null) => {
    if (!worldRealms?.realms?.[name]) return;
    const sourceScreenCell = playerCell
      ? { x: playerCell.x - viewOrigin.x, y: playerCell.y - viewOrigin.y }
      : null;
    if (world && playerCell) clearCharacter(world, playerCell);
    activeRealm = name;
    world = worldRealms.realms[name];
    logSystem.log({ message: `Entered the ${activeRealm} Realm` });
    realmSystem.enter(activeRealm);
    fogOfWar = world.fog;
    playerCell = arrival ?? world.playerCell ?? world.playerStart;
    normalizePlayerMarkers(world);
    world.playerCell = playerCell;
    setCharacter(world, playerCell);
    lighting = { ...lighting, ambient: realmAmbient[activeRealm] };
    // Preserve the player's current screen-cell offset across the realm swap.
    // This keeps center, deadzone, and locked-camera positions visually stable
    // instead of recentering the destination realm at its origin.
    viewOrigin = sourceScreenCell
      ? getViewOriginForPreservedPlayerPosition(playerCell, sourceScreenCell, viewport, world)
      : getViewOriginForCamera(cameraMode, playerCell, viewport, world, viewOrigin);
    for (const listener of realmListeners) listener(activeRealm);
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
        setTransitionMask({ phase: TRANSITION_PHASES.IDLE, value: 0 });
        transitionCenter = null;
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
        gameplayInputLocked = false;
        clearMovementInput();
      },
      onComplete: () => {
        transitionActive = false;
        gameplayInputLocked = false;
        clearMovementInput();
        setTransitionMask({ phase: TRANSITION_PHASES.IDLE, value: 0 });
        transitionCenter = null;
      },
    });
    if (!started) {
      transitionActive = false;
      gameplayInputLocked = false;
      transitionCenter = null;
      return false;
    }
    transitionSystem.begin(performance.now());
    return true;
  };

  const findNearestStairPath = () => {
    if (!world || !playerCell || !world.stairs?.length) return null;
    const startKey = `${playerCell.x},${playerCell.y}`;
    const parents = new Map([[startKey, null]]);
    const queue = [{ ...playerCell }];
    const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const cell = queue[cursor];
      if (world.stairs.some((stair) => stair.x === cell.x && stair.y === cell.y)) {
        const path = [];
        for (let key = `${cell.x},${cell.y}`; key !== null; key = parents.get(key)) {
          const [x, y] = key.split(",").map(Number);
          path.push({ x, y });
        }
        return path.reverse();
      }
      for (const direction of directions) {
        const next = { x: cell.x + direction.x, y: cell.y + direction.y };
        const key = `${next.x},${next.y}`;
        if (parents.has(key) || !world.terrain[next.y]?.[next.x]?.walkable) continue;
        parents.set(key, `${cell.x},${cell.y}`);
        queue.push(next);
      }
    }
    return null;
  };

  const travelToNearestStairs = () => {
    const path = findNearestStairPath();
    if (!path?.length) return;
    const stair = path.at(-1);
    clearCharacter(world, playerCell);
    playerCell = stair;
    world.playerCell = playerCell;
    setCharacter(world, playerCell);
    timeSystem.advance(path.length);
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
    if (transitionActive || !world || !playerCell) return;
    viewOrigin = initial
      ? getInitialViewOriginForCamera(cameraMode, playerCell, viewport, world)
      : getViewOriginForCamera(cameraMode, playerCell, viewport, world, viewOrigin);
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
    glyphLimit: GLYPHS.length,
    rasterize: (glyph, family, size) => glyphBackgroundEnabled
      ? rasterizeCompositeGlyph(glyph, family, size, paletteColors.get(glyph) ?? [1, 1, 1], backgroundDarkness)
      : rasterizeGlyph(glyph, family, size),
  });

  const createMinimapGlyphCache = () => createGlyphVisualCache(engine, {
    fontId,
    fontFamily: getFontOption(fontId).family,
    glyphLimit: GLYPHS.length,
    rasterize: (glyph, family, size) => glyphBackgroundEnabled
      ? rasterizeCompositeGlyph(glyph, family, size, paletteColors.get(glyph) ?? [1, 1, 1], backgroundDarkness)
      : rasterizeGlyph(glyph, family, size),
  });

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

  const hideGameCell = (slot) => {
    if (!spriteStates[slot]?.visible) return;
    updateSprite2DIndex(layer, spriteIndexes[slot], { visible: false });
    spriteStates[slot].visible = false;
  };

  const renderCell = (region, x, y, frames, lightField, glyphOverride = null, visibility = 100) => {
    const slot = y * region.columns + x;
    const cell = { x: region.x + x, y: region.y + y };
    const glyph = glyphOverride ?? getVisibleGlyph(world, cell);
    const frame = frames.get(glyph);
    if (frame === undefined) throw new Error(`Missing cached glyph frame: ${glyph}`);
    const terrain = world.terrain[cell.y][cell.x];
    const baseColor = terrain.depth === "deep" && world.characters[cell.y][cell.x] === null
      ? colorToLinearRgba(terrain)
      : paletteColors.get(glyph) ?? colorToLinearRgba(getPaletteStyle(palette, glyph));
    const lightingFactor = lightField.getFactor(cell);
    const previous = spriteStates[slot];
    const center = getRenderedCellCenter({ x, y }, viewport, world);
    if (playerCell && cell.x === playerCell.x && cell.y === playerCell.y) {
      playerRenderCenter = center;
    }
    if (!shouldUpdateVisibleSprite(previous, glyph, frame, baseColor, lightingFactor, visibility)) {
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
    const renderWidth = Math.max(farZoomFootprint, viewport.gridWidth);
    const renderHeight = Math.max(farZoomFootprint, viewport.gridHeight);
    const props = {
      positionPx: [center.x, center.y],
      sizePx: [renderWidth, renderHeight],
      frame, color, visible: true,
    };
    if (spriteIndexes[slot] === undefined) spriteIndexes[slot] = addSprite2DIndex(layer, props);
    else updateSprite2DIndex(layer, spriteIndexes[slot], props);
    spriteStates[slot] = {
      glyph, frame, color, baseColor, lightingFactor, fogVisibility: visibility, visible: true,
    };
    metrics.submittedCells += 1;
  };

  const renderWorld = ({ refreshLighting = false } = {}) => {
    if (!world || !renderer) return { renderMs: 0, warmupMs: 0 };
    if (!initialWorldRenderComplete) {
      viewOrigin = getInitialViewOriginForCamera(cameraMode, playerCell, viewport, world);
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
      getGlyph: getVisibleGlyph,
    });
    const visual = glyphCache.ensure(
      zoom,
      viewport.gridWidth,
      collectWorldViewGlyphs(composition),
    );
    metrics.glyphWarmupMs += visual.warmupMs;
    if (visual.atlas !== atlas) rebuildLayer(visual.atlas);
    const lightField = lightingFieldCache.get(world, region, objectSpawnerSystem?.getLightingSources(world) ?? world.torches, playerCell, lighting);
    renderWorldViewComposition(composition, {
      drawCell: ({ localX, localY, slot, glyph, discovered, visibility }) => {
        if (!discovered) {
          hideGameCell(slot);
          return;
        }
        renderCell(region, localX, localY, visual.frames, lightField, glyph, visibility);
      },
    });
    for (let slot = region.count; slot < spriteIndexes.length; slot += 1) {
      if (spriteStates[slot]?.visible) {
        updateSprite2DIndex(layer, spriteIndexes[slot], { visible: false });
        spriteStates[slot].visible = false;
      }
    }
    renderGpuLightPass(region, lightField);
    schedulePresentation();
    metrics.visibleCells = region.count;
    return {
      renderMs: performance.now() - started,
      warmupMs: visual.warmupMs,
      submittedCells: metrics.submittedCells - submittedBefore,
      skippedCells: metrics.skippedCells - skippedBefore,
    };
  };

  movementRenderScheduler = createCoalescedFrameScheduler({
    scheduleFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    render: ({ refreshLighting = false } = {}) => {
      if (!disposed) renderWorld({ refreshLighting });
    },
  });

  // Full world lighting and sprite submission are synchronous WebGPU work.
  // Coalescing movement-driven renders prevents held input from starving
  // animation frames while preserving the final player position and lighting.
  const scheduleMovementRender = ({ refreshLighting = false } = {}) => {
    movementRenderScheduler?.schedule({ refreshLighting });
  };

  const cancelScheduledRenders = () => {
    movementRenderScheduler?.cancel();
    if (minimapRenderFrame !== null) window.cancelAnimationFrame(minimapRenderFrame);
    if (presentationFrame !== null) window.cancelAnimationFrame(presentationFrame);
    minimapRenderFrame = null;
    presentationFrame = null;
  };

  const renderChangedWorldCells = (cells) => {
    if (!world || !renderer) return;
    const region = getVisibleRegion(viewport, world, viewOrigin);
    const visibleCells = cells.filter((cell) => getVisibleSlot(region, cell) !== -1 &&
      isDiscovered(fogOfWar, world, cell));
    if (visibleCells.length === 0) return;
    const glyphs = visibleCells.map((cell) => getVisibleGlyph(world, cell));
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

  const rebuildViewport = ({ centerOnPlayer = false, zoomChanged = false, recalculateCamera = false } = {}) => {
    const previousViewport = viewport;
    viewport = createViewportForCanvas(canvas, zoom);
    if (centerOnPlayer) {
      resolveViewForPlayer();
    } else if (recalculateCamera && world && playerCell) {
      viewOrigin = getViewOriginForResize(
        cameraMode,
        playerCell,
        previousViewport,
        viewport,
        world,
        viewOrigin,
      );
    } else {
      clampViewOrigin();
    }
    if (renderer) {
      if (!zoomChanged) rebuildLayer();
      return renderWorld();
    }
    return { renderMs: 0, warmupMs: 0 };
  };

  const movePlayer = () => {
    if (playerLifecycle.isDead() || gameplayInputLocked) {
      clearMovementInput();
      return;
    }
    if (!world || !playerCell) return;
    const direction = getHeldDirection();
    if (direction.x === 0 && direction.y === 0) return;
    const attemptedCell = { x: playerCell.x + direction.x, y: playerCell.y + direction.y };
    if (isCardinalDirection(direction)) {
      const doorInteraction = objectSpawnerSystem?.interactAtCell(attemptedCell, {
        world,
        keyCount: characterKeys,
        spendKey: () => {
          if (characterKeys <= 0) return false;
          characterKeys -= 1;
          notifyKeys();
          return true;
        },
        log: (message) => logSystem.log({ message }),
      });
      if (doorInteraction?.handled) {
        if (doorInteraction.opened) scheduleMinimapRender();
        scheduleMovementRender();
        return;
      }
    }
    const nextCell = moveWorldCell(playerCell, direction, world);
    if (nextCell.x === playerCell.x && nextCell.y === playerCell.y) return;
    const previousCell = playerCell;
    const nextOrigin = getViewOriginForCamera(cameraMode, nextCell, viewport, world, viewOrigin, direction);
    if (!nextOrigin) return;
    clearCharacter(world, playerCell);
    playerCell = nextCell;
    setCharacter(world, playerCell);
    world.playerCell = playerCell;
    objectSpawnerSystem?.collideAtCell(playerCell, { playerCell: { ...playerCell }, world });
    if (playerLifecycle.isDead()) {
      clearMovementInput();
      return;
    }
    timeSystem.advance();
    if (direction.x === 0 && direction.y === -1) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.up);
    else if (direction.x === 0 && direction.y === 1) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.down);
    else if (direction.x === -1 && direction.y === 0) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.left);
    else if (direction.x === 1 && direction.y === 0) sendPlayerMovedEvent(PLAYER_MOVED_EVENTS.right);
    viewOrigin = nextOrigin;
    if (world.stairs?.some((stair) => stair.x === playerCell.x && stair.y === playerCell.y)) {
      const destination = activeRealm === "Overground" ? "Underground" : "Overground";
      startRealmTransition(destination, playerCell);
      return;
    }
    refreshDiscovery();
    // Player lighting is a moving source. Re-render the complete visible
    // region after every move so cells behind the player lose its former light
    // contribution instead of retaining a trail.
    scheduleMovementRender({ refreshLighting: true });
  };

  const scheduleRepeat = (delay) => {
    clearRepeat();
    repeatTimer = window.setTimeout(() => {
      repeatTimer = null;
      if (playerLifecycle.isDead() || !hasHeldMovement()) return;
      movePlayer();
      scheduleRepeat(getRepeatInterval(shiftHeld));
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
    movePlayer();
    scheduleRepeat(INITIAL_REPEAT_DELAY_MS);
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
    // Babylon updates the canvas backing buffer itself. A ResizeObserver must
    // not treat that as a new layout and recursively submit another full frame.
    if (nextCanvasSize.width === lastCanvasSize.width && nextCanvasSize.height === lastCanvasSize.height) return;
    lastCanvasSize = nextCanvasSize;
    clearTouchInput();
    rebuildViewport();
    renderMinimap();
    if (generating && !world) {
      generationController.abort();
      generationController = new AbortController();
    }
  };

  const handlePageHide = () => {
    clearMovementInput();
    cancelScheduledRenders();
    generationController.abort();
  };
  window.addEventListener("pagehide", handlePageHide);

  const handleWindowBlur = () => {
    clearMovementInput();
  };
  window.addEventListener("blur", handleWindowBlur);

  try {
    // Sprite coordinates are CSS pixels in Babylon Lite; a DPR > 1 currently
    // halves their apparent footprint, leaving much of the canvas empty.
    engine = await createEngine(canvas, { maxDevicePixelRatio: 1, msaaSamples: 1 });
    glyphCache = createGameGlyphCache();
    minimapGlyphCache = createMinimapGlyphCache();
    atlas = glyphCache.ensure(zoom, viewport.gridWidth, []).atlas;
    layer = createSprite2DLayer(atlas, { capacity: getInitialSpriteLayerCapacity(viewport) });
    renderer = createSpriteRenderer(engine, { layers: [layer], clearValue: { r: 0, g: 0, b: 0, a: 1 } });
    registerSpriteRenderer(renderer);
    await startEngine(engine);
    stopEngine(engine);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
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
    const seed = getRandomSeedFromSearch(window.location.search) ?? createGeneratedSeed();
    sessionSeed = seed;
    while (!world) {
      const currentController = generationController;
      generationStarted = performance.now();
      metrics.generationYields = 0;
      metrics.generationWaitMs = 0;
      metrics.generationPhases = {};
      try {
        const candidate = await createWorldRealms({
          rows: WORLD_ROWS,
          columns: WORLD_COLUMNS,
          torchCount: getTorchCountForViewport(viewport, seed),
          seed,
          initialRealm: activeRealm,
        }, {
          signal: currentController.signal,
          sliceMs: 12,
          onPhase: (phase) => { metrics.generationPhases[phase] = performance.now() - generationStarted; },
          onYield: (waitMs) => { metrics.generationYields += 1; metrics.generationWaitMs += waitMs; },
        });
        if (currentController !== generationController || currentController.signal.aborted) continue;
        worldRealms = candidate;
        for (const realm of Object.values(worldRealms.realms)) realm.fog = createFogOfWar(realm);
        world = worldRealms.realms[activeRealm];
      } catch (error) {
        if (error.name === "AbortError" && currentController !== generationController) continue;
        throw error;
      }
    }
    generating = false;
    metrics.generationMs = performance.now() - generationStarted;
    playerCell = world.playerStart;
    world.playerCell = playerCell;
    fogOfWar = world.fog;
    logSystem.log({ message: `Entered the ${activeRealm} Realm` });
    objectSpawnerSystem = createObjectSpawnerSystem({ catalog: objectData.objects, eventSystem: gameplayEvents });
    const addObjectToRealm = (realm, definition) => {
      const object = objectSpawnerSystem.addObject({ ...definition, realm });
      realm.objects.push(object);
      realm.characters[object.cell.y][object.cell.x] = object.glyph;
      return object;
    };
    const randomObjectCount = (type, seed) => getObjectDistributionCount(type, seed);
    for (const [realmName, realm] of Object.entries(worldRealms.realms)) {
      realm.objects = [];
      realm.pickups = realm.objects;
      realm.questPickupIds = new Set();
      for (const torch of realm.torches ?? []) addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-torch-${torch.x}-${torch.y}`,
        type: "torch", cell: torch, effect: () => {},
      });
      for (const stair of realm.stairs ?? []) addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-stairs-${stair.x}-${stair.y}`,
        type: "stairs", cell: stair, effect: () => {},
      });
      const heartCells = selectObjectCells(realm, realm.playerStart, randomObjectCount("heart", realm.options.seed), createRandom(`${realm.options.seed}:heart:placement`), { minimumDistance: 3, reserved: new Set() });
      heartCells.forEach((cell, index) => addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-heart-${index + 1}`,
        type: "heart", cell,
        effect: () => {
          if (playerLifecycle.isDead()) return;
          playerLifecycle.applyHealthDelta(2);
          logSystem.log({ message: "Collected +2 Health from Heart" });
        },
      }));
      const trapCells = selectObjectCells(realm, realm.playerStart, randomObjectCount("trap", realm.options.seed), createRandom(`${realm.options.seed}:trap:placement`), { minimumDistance: 3, reserved: new Set(heartCells.map((cell) => `${cell.x},${cell.y}`)) });
      trapCells.forEach((cell, index) => addObjectToRealm(realm, {
        id: `${realmName.toLowerCase()}-trap-${index + 1}`,
        type: "trap", cell,
        effect: () => {
          if (playerLifecycle.isDead()) return;
          playerLifecycle.applyHealthDelta(-25);
          logSystem.log({ message: "Lost -25 Health from Trap" });
        },
      }));
      if (realmName === "Underground") {
        const civilizationGroups = createCivilizationGroups(realm, {
          random: createRandom(`${realm.options.seed}:civilization:placement`),
          chance: import.meta.env.DEV ? 0.5 : undefined,
        });
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
      } else {
        realm.civilizationGroups = [];
      }
    }
    questManager = createQuestManager(questData.quests, { gold: characterGold }, {
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
        const nextSnapshot = questManager.startNextQuest({ gold: characterGold });
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
    });
    gameplayEvents.subscribe((event) => {
      questManager.observe(event, { gold: characterGold });
      notifyQuest(questManager.getSnapshot());
      if (event.type === "pickup-collected") scheduleMinimapRender();
    });
    const startQuestInCurrentRealm = (id) => {
      const snapshot = questManager?.startQuest(id, { gold: characterGold }) ?? null;
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
    normalizePlayerMarkers(world);
    setCharacter(world, playerCell);
    notifyGold();
    notifyKeys();
    refreshStartingDiscovery();
    refreshDiscovery();
    resolveViewForPlayer({ initial: true });
    const firstRender = renderWorld();
    metrics.firstVisibleRenderMs = firstRender.renderMs;
    startInitialReveal();
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
    clearMovementInput();
    cancelScheduledRenders();
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    canvasResizeObserver?.disconnect();
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerStop);
    canvas.removeEventListener("pointercancel", handlePointerStop);
    canvas.removeEventListener("lostpointercapture", handlePointerStop);
    renderer && disposeSpriteRenderer(renderer);
    glyphCache?.dispose();
    minimapGlyphCache?.dispose();
    engine && disposeEngine(engine);
    container.replaceChildren();
    throw error;
  }

  return Object.freeze({
    setPalette(nextPalette) {
      validatePaletteEntries(nextPalette);
      palette = nextPalette.map((entry) => ({ ...entry }));
      const { colors, changed } = reconcilePaletteColors(paletteColors, palette);
      paletteColors = colors;
      if (glyphBackgroundEnabled) {
        rebuildGameGlyphCache();
        rebuildMinimapGlyphCache();
        renderWorld();
        renderMinimap();
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
      renderMinimap();
      if (gpuLightPassEnabled) renderWorld();
      else schedulePresentation();
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
      renderWorld();
      renderMinimap();
    },
    setZoom(nextZoom) {
      if (!Number.isFinite(nextZoom)) return;
      const selected = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(nextZoom)));
      if (selected === zoom) return;
      const started = performance.now();
      zoom = selected;
      let result;
      if (startupCameraModeReapplyPending) {
        viewport = createViewportForCanvas(canvas, zoom);
        if (world && playerCell) {
          viewOrigin = getInitialViewOriginForCamera(cameraMode, playerCell, viewport, world);
        }
        startupCameraModeReapplyPending = false;
        result = renderer ? renderWorld() : { renderMs: 0, warmupMs: 0 };
      } else {
        result = rebuildViewport({ centerOnPlayer: true, zoomChanged: true });
      }
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
      renderWorld();
      renderMinimap();
    },
    setRealmAmbient(nextAmbient) {
      realmAmbient = { ...realmAmbient, ...nextAmbient };
      lighting = { ...lighting, ambient: realmAmbient[activeRealm] };
      renderWorld();
      renderMinimap();
    },
    setRealmPreference(realm) {
      if (realm !== activeRealm && worldRealms) startRealmTransition(realm);
    },
    travelRealm() { travelToNearestStairs(); },
    getRealm() { return activeRealm; },
    startQuest(id) {
      if (!questData.quests.some((definition) => definition.id === id)) return null;
      const snapshot = questManager?.startQuest(id, { gold: characterGold }) ?? null;
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
    subscribeToGold(listener) {
      goldListeners.add(listener);
      listener(characterGold);
      return () => goldListeners.delete(listener);
    },
    getHealth() { return playerLifecycle.getHealth(); },
    subscribeToHealth(listener) {
      return playerLifecycle.subscribeToHealth(listener);
    },
    getPlayerDead() { return playerLifecycle.isDead(); },
    subscribeToPlayerDead(listener) {
      return playerLifecycle.subscribeToDeath(listener);
    },
    getLogSnapshot() { return logSystem.getSnapshot(); },
    subscribeToLog(listener) {
      return logSystem.subscribe(listener);
    },
    subscribeToRealm(listener) { realmListeners.add(listener); return () => realmListeners.delete(listener); },
    subscribeToMinimapZoom(listener) { minimapZoomListeners.add(listener); return () => minimapZoomListeners.delete(listener); },
    setTorchLighting(profile) {
      lighting = { ...lighting, torchProfile: getLightingProfile(profile).config };
      renderWorld();
      renderMinimap();
    },
    setPlayerLighting(profile) {
      lighting = { ...lighting, playerProfile: getLightingProfile(profile).config };
      refreshDiscovery();
      renderWorld();
      renderMinimap();
    },
    setTorchShadow(profile) {
      lighting = { ...lighting, torchShadow: getShadowProfile(profile).config };
      renderWorld();
      renderMinimap();
    },
    setPlayerShadow(profile) {
      lighting = { ...lighting, playerShadow: getShadowProfile(profile).config };
      renderWorld();
      renderMinimap();
    },
    setPlayerGpuShadowBleedRange(range) {
      lighting = { ...lighting, playerGpuShadowBleedRange: Number(range) };
      renderWorld();
      renderMinimap();
    },
    setGlyphBackground(enabled) {
      const nextEnabled = enabled === true;
      if (nextEnabled === glyphBackgroundEnabled) return;
      glyphBackgroundEnabled = nextEnabled;
      rebuildGameGlyphCache();
      rebuildMinimapGlyphCache();
      renderWorld();
      renderMinimap();
    },
    setBackgroundDarkness(darkness) {
      if (!Number.isInteger(darkness)) return;
      const nextDarkness = Math.min(100, Math.max(0, darkness));
      if (nextDarkness === backgroundDarkness) return;
      backgroundDarkness = nextDarkness;
      if (glyphBackgroundEnabled) {
        rebuildGameGlyphCache();
        rebuildMinimapGlyphCache();
        renderWorld();
        renderMinimap();
      }
    },
    setGpuLightPass(enabled) {
      const nextEnabled = enabled === true;
      if (nextEnabled === gpuLightPassEnabled) return;
      gpuLightPassEnabled = nextEnabled;
      renderWorld({ refreshLighting: true });
      renderMinimap();
    },
    setMinimapZoom(nextZoom) {
      if (!MINIMAP_SCALE_LEVELS.includes(nextZoom) || nextZoom === minimapZoom) return;
      minimapZoom = nextZoom;
      renderMinimap();
    },
    setCameraMode(nextMode) {
      const selected = normalizeCameraMode(nextMode);
      if (selected === cameraMode) {
        startupCameraModeReapplyPending = true;
        if (world && playerCell) rebuildViewport({ centerOnPlayer: true });
        return;
      }
      startupCameraModeReapplyPending = false;
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
      disposed = true;
      clearMovementInput();
      generationController.abort();
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      canvasResizeObserver?.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerStop);
      canvas.removeEventListener("pointercancel", handlePointerStop);
      canvas.removeEventListener("lostpointercapture", handlePointerStop);
      minimapCanvas.removeEventListener("click", handleMinimapClick);
      cancelScheduledRenders();
      transitionSystem.dispose();
      transitionMask.remove();
      if (typeof disposeGpuLightPass === "function") disposeGpuLightPass();
      disposeSpriteRenderer(renderer);
      glyphCache.dispose();
      minimapGlyphCache.dispose();
      disposeEngine(engine);
      timeSystem.dispose();
      logSystem.dispose();
      container.replaceChildren();
    },
  });
}
