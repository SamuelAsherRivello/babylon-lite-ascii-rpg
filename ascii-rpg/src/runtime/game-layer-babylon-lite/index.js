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
  startEngine,
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
  getViewOriginForCamera,
  moveWorldCell,
} from "./characters/player/player-grid.js";
import { normalizeCameraMode } from "../bridge-layer/camera.js";
import { getFontOption, validateFontId } from "../bridge-layer/font.js";
import { getPaletteStyle, validatePaletteEntries } from "../bridge-layer/palette.js";
import {
  clearCharacter,
  createGeneratedSeed,
  createWorldCooperative,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  setCharacter,
} from "./systems/world-system.js";
import { createTimeSystem } from "./systems/time-system.js";
import { createGlyphVisualCache } from "./glyph-visual-cache.js";
import { collectVisibleGlyphs, getVisibleRegion, getVisibleSlot, shouldUpdateVisibleSprite } from "./visible-region.js";
import { colorToLinearRgba, reconcilePaletteColors } from "./palette-color-cache.js";
import {
  applyLightingToColor,
  createLightingConfig,
  createSceneLightingFieldCache,
  DEFAULT_LIGHTING,
  getLightingProfile,
  getShadowProfile,
} from "./lighting.js";
import { buildGpuLightPassSamples, createGpuLightPassFrame, GPU_LIGHT_PASS_COLOR } from "./gpu-light-pass.js";
import {
  createFogOfWar,
  discoverFromPlayer,
} from "./systems/fog-of-war-system.js";
import { getMinimapWorldPixel } from "./systems/minimap-renderer.js";

const GLYPHS = ["W", "•", "P", "T", "~", "≈", "▓"];
const WORLD_ROWS = 512;
const WORLD_COLUMNS = 512;
const TORCHES_PER_SCREEN = 3;

function createViewportForWindow(zoom = DEFAULT_ZOOM) {
  return createViewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    upscale: DEFAULT_UPSCALE,
    zoom,
    fontResolution: DEFAULT_FONT_RESOLUTION,
    gridWidth: DEFAULT_GRID_WIDTH,
    gridHeight: DEFAULT_GRID_HEIGHT,
  });
}

function getTorchCountForViewport(viewport) {
  const worldArea = WORLD_ROWS * WORLD_COLUMNS;
  const visibleScreenArea = Math.max(1, viewport.rows * viewport.columns);
  return Math.max(
    TORCHES_PER_SCREEN,
    Math.round((worldArea / visibleScreenArea) * TORCHES_PER_SCREEN),
  );
}

/**
 * Starts the non-React Babylon Lite game runtime and returns its narrow UI bridge.
 * The bridge deliberately exposes palette snapshots and disposal only.
 */
export async function startGameLayer(container, initialPalette, initialFontId = "monospace") {
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
  container.replaceChildren(canvas, minimapCanvas);

  let engine;
  let renderer;
  let atlas;
  let layer;
  let glyphCache;
  let gpuLightAtlas;
  let gpuLightLayer;
  let gpuLightPassEnabled = true;
  let disposed = false;
  let repeatTimer = null;
  let generationController = new AbortController();
  let generating = false;
  const heldKeys = new Set();
  let touchDirection = null;
  let activePointerId = null;
  let touchStart = null;
  let viewport = createViewportForWindow();
  let world = null;
  let playerCell = null;
  let fogOfWar = null;
  let minimapVisible = true;
  let viewOrigin = { x: 0, y: 0 };
  let cameraMode = "center";
  const timeSystem = createTimeSystem();
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
  const lightingFieldCache = createSceneLightingFieldCache();
  let fontId = initialFontId;
  let zoom = DEFAULT_ZOOM;
  const spriteIndexes = [];
  const spriteStates = [];
  const gpuLightSpriteIndexes = [];
  const gpuLightSpriteStates = [];
  const metrics = {
    visibleCells: 0, submittedCells: 0, skippedCells: 0, glyphWarmupMs: 0,
    generationMs: null, firstVisibleRenderMs: null, totalReadyMs: null,
    lastZoomRerenderMs: null, lastZoomWarmupMs: null,
    generationYields: 0, generationWaitMs: 0, generationPhases: {},
  };

  const renderMinimap = () => {
    if (!fogOfWar || !minimapVisible) return;
    minimapCanvas.hidden = false;
    if (minimapCanvas.width !== fogOfWar.minimapColumns) minimapCanvas.width = fogOfWar.minimapColumns;
    if (minimapCanvas.height !== fogOfWar.minimapRows) minimapCanvas.height = fogOfWar.minimapRows;
    const context = minimapCanvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    for (let y = 0; y < fogOfWar.minimapRows; y += 1) {
      for (let x = 0; x < fogOfWar.minimapColumns; x += 1) {
        const pixel = getMinimapWorldPixel(world, fogOfWar, palette, { x, y });
        if (pixel.opacity <= 0) continue;
        context.globalAlpha = pixel.opacity;
        context.fillStyle = pixel.color;
        context.fillRect(x, y, 1, 1);
      }
    }
    context.globalAlpha = 1;
  };

  const refreshDiscovery = () => {
    if (!fogOfWar || !world || !playerCell) return;
    discoverFromPlayer(fogOfWar, world, playerCell, lighting.playerProfile);
    renderMinimap();
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

  const resolveViewForPlayer = () => {
    if (!world || !playerCell) return;
    viewOrigin = getViewOriginForCamera(cameraMode, playerCell, viewport, world, viewOrigin);
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

  const rebuildLayer = (nextAtlas = atlas) => {
    if (renderer && layer) removeSpriteRendererLayer(renderer, layer);
    atlas = nextAtlas;
    layer = createSprite2DLayer(atlas, { capacity: Math.max(1, viewport.rows * viewport.columns) });
    if (renderer) addSpriteRendererLayer(renderer, layer);
    spriteIndexes.length = 0;
    spriteStates.length = 0;
  };

  const disposeGpuLightPass = () => {
    if (renderer && gpuLightLayer) removeSpriteRendererLayer(renderer, gpuLightLayer);
    gpuLightLayer = undefined;
    gpuLightSpriteIndexes.length = 0;
    gpuLightSpriteStates.length = 0;
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
    const samples = buildGpuLightPassSamples(region, lightField, lighting.ambient);
    const activeSlots = new Set();
    for (const sample of samples) {
      activeSlots.add(sample.slot);
      const center = getCellCenter(sample, viewport);
      const props = {
        positionPx: [center.x, center.y],
        sizePx: [viewport.gridWidth, viewport.gridHeight],
        frame: 0,
        color: [...GPU_LIGHT_PASS_COLOR, Math.min(0.16, sample.intensity * 0.16)],
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
      if (gpuLightSpriteStates[slot] && !activeSlots.has(slot)) {
        updateSprite2DIndex(gpuLightLayer, gpuLightSpriteIndexes[slot], { visible: false });
        gpuLightSpriteStates[slot] = false;
      }
    }
  };

  const renderCell = (region, x, y, frames, lightField) => {
    const slot = y * region.columns + x;
    const cell = { x: region.x + x, y: region.y + y };
    const glyph = getVisibleGlyph(world, cell);
    const frame = frames.get(glyph);
    if (frame === undefined) throw new Error(`Missing cached glyph frame: ${glyph}`);
    const baseColor = paletteColors.get(glyph) ?? colorToLinearRgba(getPaletteStyle(palette, glyph));
    const lightingFactor = lightField.getFactor(cell);
    const previous = spriteStates[slot];
    if (!shouldUpdateVisibleSprite(previous, glyph, frame, baseColor, lightingFactor)) {
      metrics.skippedCells += 1;
      return;
    }
    const color = applyLightingToColor(baseColor, lightingFactor);
    const center = getCellCenter({ x, y }, viewport);
    const props = {
      positionPx: [center.x, center.y],
      sizePx: [viewport.gridWidth, viewport.gridHeight],
      frame, color, visible: true,
    };
    if (spriteIndexes[slot] === undefined) spriteIndexes[slot] = addSprite2DIndex(layer, props);
    else updateSprite2DIndex(layer, spriteIndexes[slot], props);
    spriteStates[slot] = {
      glyph, frame, color, baseColor, lightingFactor, visible: true,
    };
    metrics.submittedCells += 1;
  };

  const renderWorld = ({ refreshLighting = false } = {}) => {
    if (!world || !renderer) return { renderMs: 0, warmupMs: 0 };
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
    const glyphs = collectVisibleGlyphs(world, region, getVisibleGlyph);
    const visual = glyphCache.ensure(zoom, viewport.gridWidth, glyphs);
    metrics.glyphWarmupMs += visual.warmupMs;
    if (visual.atlas !== atlas) rebuildLayer(visual.atlas);
    const lightField = lightingFieldCache.get(world, region, world.torches, playerCell, lighting);
    for (let y = 0; y < region.rows; y += 1) {
      for (let x = 0; x < region.columns; x += 1) renderCell(region, x, y, visual.frames, lightField);
    }
    for (let slot = region.count; slot < spriteIndexes.length; slot += 1) {
      if (spriteStates[slot]?.visible) {
        updateSprite2DIndex(layer, spriteIndexes[slot], { visible: false });
        spriteStates[slot].visible = false;
      }
    }
    renderGpuLightPass(region, lightField);
    metrics.visibleCells = region.count;
    return {
      renderMs: performance.now() - started,
      warmupMs: visual.warmupMs,
      submittedCells: metrics.submittedCells - submittedBefore,
      skippedCells: metrics.skippedCells - skippedBefore,
    };
  };

  const renderChangedWorldCells = (cells) => {
    if (!world || !renderer) return;
    const region = getVisibleRegion(viewport, world, viewOrigin);
    const visibleCells = cells.filter((cell) => getVisibleSlot(region, cell) !== -1);
    if (visibleCells.length === 0) return;
    const glyphs = visibleCells.map((cell) => getVisibleGlyph(world, cell));
    const visual = glyphCache.ensure(zoom, viewport.gridWidth, glyphs);
    metrics.glyphWarmupMs += visual.warmupMs;
    const lightField = lightingFieldCache.get(world, region, world.torches, playerCell, lighting);
    for (const cell of visibleCells) {
      renderCell(region, cell.x - region.x, cell.y - region.y, visual.frames, lightField);
    }
  };

  const rebuildViewport = ({ centerOnPlayer = false, zoomChanged = false } = {}) => {
    viewport = createViewportForWindow(zoom);
    if (centerOnPlayer) {
      resolveViewForPlayer();
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
    if (!world || !playerCell) return;
    const direction = getHeldDirection();
    if (direction.x === 0 && direction.y === 0) return;
    const nextCell = moveWorldCell(playerCell, direction, world);
    if (nextCell.x === playerCell.x && nextCell.y === playerCell.y) return;
    const previousCell = playerCell;
    const nextOrigin = getViewOriginForCamera(cameraMode, nextCell, viewport, world, viewOrigin, direction);
    if (!nextOrigin) return;
    clearCharacter(world, playerCell);
    playerCell = nextCell;
    setCharacter(world, playerCell);
    timeSystem.advance();
    viewOrigin = nextOrigin;
    refreshDiscovery();
    // Player lighting is a moving source. Re-render the complete visible
    // region after every move so cells behind the player lose its former light
    // contribution instead of retaining a trail.
    renderWorld({ refreshLighting: true });
  };

  const scheduleRepeat = (delay) => {
    clearRepeat();
    repeatTimer = window.setTimeout(() => {
      repeatTimer = null;
      if (!hasHeldMovement()) return;
      movePlayer();
      scheduleRepeat(REPEAT_INTERVAL_MS);
    }, delay);
  };

  const handleKeyDown = (event) => {
    if (!getDirectionForKey(event.key)) return;
    event.preventDefault();
    const wasHeld = heldKeys.has(event.key);
    heldKeys.add(event.key);
    if (wasHeld || event.repeat) return;
    movePlayer();
    scheduleRepeat(INITIAL_REPEAT_DELAY_MS);
  };

  const handleKeyUp = (event) => {
    if (!getDirectionForKey(event.key)) return;
    event.preventDefault();
    heldKeys.delete(event.key);
    if (!hasHeldMovement()) clearRepeat();
  };

  const handlePointerDown = (event) => {
    if (!event.isPrimary || activePointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    touchStart = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (event.pointerId !== activePointerId || !touchStart) return;
    const nextDirection = getDirectionForSwipe(
      event.clientX - touchStart.x,
      event.clientY - touchStart.y,
    );
    if (!nextDirection) return;
    event.preventDefault();
    const wasMoving = touchDirection !== null;
    touchDirection = nextDirection;
    if (wasMoving) return;
    movePlayer();
    scheduleRepeat(INITIAL_REPEAT_DELAY_MS);
  };

  const handlePointerStop = (event) => {
    if (event.pointerId !== activePointerId) return;
    clearTouchInput();
  };

  const handleResize = () => {
    clearTouchInput();
    rebuildViewport();
    renderMinimap();
    if (generating && !world) {
      generationController.abort();
      generationController = new AbortController();
    }
  };

  const handlePageHide = () => {
    clearTouchInput();
    generationController.abort();
  };
  window.addEventListener("pagehide", handlePageHide);

  try {
    // Sprite coordinates are CSS pixels in Babylon Lite; a DPR > 1 currently
    // halves their apparent footprint, leaving much of the canvas empty.
    engine = await createEngine(canvas, { maxDevicePixelRatio: 1, msaaSamples: 1 });
    glyphCache = createGlyphVisualCache(engine, {
      fontId, fontFamily: getFontOption(fontId).family, glyphLimit: GLYPHS.length,
    });
    atlas = glyphCache.ensure(zoom, viewport.gridWidth, []).atlas;
    layer = createSprite2DLayer(atlas, { capacity: Math.max(1, viewport.rows * viewport.columns) });
    renderer = createSpriteRenderer(engine, { layers: [layer], clearValue: { r: 0, g: 0, b: 0, a: 1 } });
    registerSpriteRenderer(renderer);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerStop);
    canvas.addEventListener("pointercancel", handlePointerStop);
    canvas.addEventListener("lostpointercapture", handlePointerStop);
    await startEngine(engine);
    generating = true;
    let generationStarted;
    const seed = getRandomSeedFromSearch(window.location.search) ?? createGeneratedSeed();
    while (!world) {
      const currentController = generationController;
      generationStarted = performance.now();
      metrics.generationYields = 0;
      metrics.generationWaitMs = 0;
      metrics.generationPhases = {};
      try {
        const candidate = await createWorldCooperative({
          rows: WORLD_ROWS,
          columns: WORLD_COLUMNS,
          torchCount: getTorchCountForViewport(viewport),
          seed,
        }, {
          signal: currentController.signal,
          sliceMs: 12,
          onPhase: (phase) => { metrics.generationPhases[phase] = performance.now() - generationStarted; },
          onYield: (waitMs) => { metrics.generationYields += 1; metrics.generationWaitMs += waitMs; },
        });
        if (currentController !== generationController || currentController.signal.aborted) continue;
        world = candidate;
      } catch (error) {
        if (error.name === "AbortError" && currentController !== generationController) continue;
        throw error;
      }
    }
    generating = false;
    metrics.generationMs = performance.now() - generationStarted;
    playerCell = world.playerStart;
    fogOfWar = createFogOfWar(world);
    refreshDiscovery();
    resolveViewForPlayer();
    const firstRender = renderWorld();
    metrics.firstVisibleRenderMs = firstRender.renderMs;
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
    clearTouchInput();
    clearRepeat();
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerStop);
    canvas.removeEventListener("pointercancel", handlePointerStop);
    canvas.removeEventListener("lostpointercapture", handlePointerStop);
    renderer && disposeSpriteRenderer(renderer);
    glyphCache?.dispose();
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
    },
    setFont(nextFontId) {
      validateFontId(nextFontId);
      if (nextFontId === fontId) return;
      if (layer) removeSpriteRendererLayer(renderer, layer);
      glyphCache.dispose();
      fontId = nextFontId;
      glyphCache = createGlyphVisualCache(engine, {
        fontId, fontFamily: getFontOption(fontId).family, glyphLimit: GLYPHS.length,
      });
      layer = null;
      atlas = null;
      renderWorld();
    },
    setZoom(nextZoom) {
      if (!Number.isFinite(nextZoom)) return;
      const selected = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(nextZoom)));
      if (selected === zoom) return;
      const started = performance.now();
      zoom = selected;
      const result = rebuildViewport({ centerOnPlayer: true, zoomChanged: true });
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
    setLighting(nextLighting) {
      const legacyLighting = createLightingConfig(nextLighting);
      lighting = { ...lighting, ambient: legacyLighting.ambient, torchProfile: legacyLighting };
      renderWorld();
    },
    setAmbientLight(nextAmbient) {
      if (!Number.isFinite(nextAmbient)) return;
      lighting = { ...lighting, ambient: Math.min(1, Math.max(0, nextAmbient)) };
      renderWorld();
    },
    setTorchLighting(profile) {
      lighting = { ...lighting, torchProfile: getLightingProfile(profile).config };
      renderWorld();
    },
    setPlayerLighting(profile) {
      lighting = { ...lighting, playerProfile: getLightingProfile(profile).config };
      refreshDiscovery();
      renderWorld();
    },
    setTorchShadow(profile) {
      lighting = { ...lighting, torchShadow: getShadowProfile(profile).config };
      renderWorld();
    },
    setPlayerShadow(profile) {
      lighting = { ...lighting, playerShadow: getShadowProfile(profile).config };
      renderWorld();
    },
    setPlayerGpuShadowBleedRange(range) {
      lighting = { ...lighting, playerGpuShadowBleedRange: Number(range) };
      renderWorld();
    },
    setGpuLightPass(enabled) {
      const nextEnabled = enabled === true;
      if (nextEnabled === gpuLightPassEnabled) return;
      gpuLightPassEnabled = nextEnabled;
      renderWorld({ refreshLighting: true });
    },
    setMinimap(enabled) {
      minimapVisible = enabled === true;
      minimapCanvas.hidden = !minimapVisible;
      renderMinimap();
    },
    setCameraMode(nextMode) {
      const selected = normalizeCameraMode(nextMode);
      if (selected === cameraMode) return;
      cameraMode = selected;
      resolveViewForPlayer();
      renderWorld();
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
      clearTouchInput();
      clearRepeat();
      generationController.abort();
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerStop);
      canvas.removeEventListener("pointercancel", handlePointerStop);
      canvas.removeEventListener("lostpointercapture", handlePointerStop);
      if (typeof disposeGpuLightPass === "function") disposeGpuLightPass();
      disposeSpriteRenderer(renderer);
      glyphCache.dispose();
      disposeEngine(engine);
      timeSystem.dispose();
      container.replaceChildren();
    },
  });
}
