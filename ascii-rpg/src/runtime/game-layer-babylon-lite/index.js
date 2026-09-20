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
  getPlayerScreenCenter,
  getRepeatInterval,
  getViewOriginForPreservedPlayerPosition,
  getViewOriginForCamera,
  moveWorldCell,
} from "./characters/player/player-grid.js";
import { normalizeCameraMode } from "../bridge-layer/camera.js";
import { getFontOption, validateFontId } from "../bridge-layer/font.js";
import { getPaletteStyle, validatePaletteEntries } from "../bridge-layer/palette.js";
import {
  clearCharacter,
  createGeneratedSeed,
  createRandom,
  createWorldRealms,
  GOLD_GLYPH,
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
  discoverCell,
  discoverFromPlayer,
  MINIMAP_WORLD_SCALE,
} from "./systems/fog-of-war-system.js";
import { getMinimapEdgeIndicators, getMinimapMarkers, getMinimapWorldCellGraphic } from "./systems/minimap-renderer.js";
import { canHandleMinimapScale, getMinimapCellLayout, getNextMinimapScale, MINIMAP_SCALE_LEVELS } from "./systems/minimap-zoom.js";
import { createTransitionSystem, TRANSITION_PHASES } from "./systems/transition-system.js";
import questData from "./data/quest_data.json";
import { createPickupSystem, selectPickupCells } from "./systems/pickup-system.js";
import { createQuestManager } from "./systems/quest-system.js";

const GLYPHS = ["W", "M", "•", "P", "T", "S", "◆", "~", "≈", "▓"];
const WORLD_ROWS = 512;
const WORLD_COLUMNS = 512;
const TORCHES_PER_SCREEN = 3;
const REALM_TRANSITION_COVER_HOLD_MS = 100;

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
export async function startGameLayer(container, initialPalette, initialFontId = "monospace", initialRealm = "Overground") {
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
  let gpuLightAtlas;
  let gpuLightLayer;
  let gpuLightPassEnabled = false;
  const minimapGlyphCanvases = new Map();
  let disposed = false;
  let repeatTimer = null;
  let movementRenderFrame = null;
  let minimapRenderFrame = null;
  let presentationFrame = null;
  let lastPresentationTime = 0;
  let movementLightingRefreshPending = false;
  let generationController = new AbortController();
  let generating = false;
  const heldKeys = new Set();
  let shiftHeld = false;
  const realmListeners = new Set();
  const minimapZoomListeners = new Set();
  let touchDirection = null;
  let activePointerId = null;
  let touchStart = null;
  let transitionActive = false;
  let transitionSystem = null;
  let viewport = createViewportForCanvas(canvas);
  let lastCanvasSize = {
    width: Math.max(1, canvas.clientWidth || window.innerWidth),
    height: Math.max(1, canvas.clientHeight || window.innerHeight),
  };
  let canvasResizeObserver = null;
  let world = null;
  let worldRealms = null;
  let activeRealm = initialRealm === "Underground" ? "Underground" : "Overground";
  let playerCell = null;
  let characterGold = 0;
  let questManager = null;
  let pickupSystem = null;
  const questListeners = new Set();
  const goldListeners = new Set();
  let fogOfWar = null;
  let minimapVisible = true;
  let minimapZoom = 2;
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
  let realmAmbient = { Overground: 0.9, Underground: 0.1 };
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

  const notifyQuest = (snapshot) => {
    for (const listener of questListeners) listener(snapshot);
  };

  const notifyGold = () => {
    for (const listener of goldListeners) listener(characterGold);
  };

  const renderMinimap = () => {
    if (!minimapVisible) return;
    if (!fogOfWar) return;
    minimapCanvas.hidden = false;
    const bounds = minimapCanvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const renderWidth = Math.max(1, Math.round(bounds.width * devicePixelRatio));
    const renderHeight = Math.max(1, Math.round(bounds.height * devicePixelRatio));
    if (minimapCanvas.width !== renderWidth) minimapCanvas.width = renderWidth;
    if (minimapCanvas.height !== renderHeight) minimapCanvas.height = renderHeight;
    const context = minimapCanvas.getContext("2d");
    context.imageSmoothingEnabled = false;
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
    // Pass 1: world background.
    context.globalAlpha = 1;
    context.fillStyle = "#000";
    context.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    // Pass 2: discovered world glyph rasters from the same cache as the game renderer.
    const sourceCells = [];
    const glyphs = new Set();
    for (let y = 0; y < sourceRows; y += 1) {
      for (let x = 0; x < sourceColumns; x += 1) {
        const sourceCell = { x: sourceX + x, y: sourceY + y };
        const graphic = getMinimapWorldCellGraphic(world, fogOfWar, palette, sourceCell);
        if (!graphic) continue;
        sourceCells.push({ x, y, graphic });
        glyphs.add(graphic.glyph);
      }
    }
    const visual = glyphCache.ensure(minimapZoom, minimapBaseViewport.gridWidth, glyphs);
    for (const { x, y, graphic } of sourceCells) {
      const raster = visual.rasters.get(graphic.glyph);
      if (!raster) continue;
      const cacheKey = `${graphic.glyph}:${graphic.color}:${raster.width}`;
      let glyphCanvas = minimapGlyphCanvases.get(cacheKey);
      if (!glyphCanvas) {
        glyphCanvas = document.createElement("canvas");
        glyphCanvas.width = raster.width;
        glyphCanvas.height = raster.height;
        const glyphContext = glyphCanvas.getContext("2d");
        const image = glyphContext.createImageData(raster.width, raster.height);
        const red = Number.parseInt(graphic.color.slice(1, 3), 16);
        const green = Number.parseInt(graphic.color.slice(3, 5), 16);
        const blue = Number.parseInt(graphic.color.slice(5, 7), 16);
        for (let index = 0; index < raster.pixels.length; index += 4) {
          image.data[index] = red;
          image.data[index + 1] = green;
          image.data[index + 2] = blue;
          image.data[index + 3] = raster.pixels[index + 3];
        }
        glyphContext.putImageData(image, 0, 0);
        minimapGlyphCanvases.set(cacheKey, glyphCanvas);
      }
      context.drawImage(glyphCanvas, offsetX + x * cellWidth, offsetY + y * cellHeight, cellWidth, cellHeight);
    }
    // Pass 3: markers, painted after world graphics in back-to-front order.
    context.globalAlpha = 1;
    const markerWidth = cellWidth * 0.5;
    const markerHeight = cellHeight * 0.5;
    for (const marker of getMinimapMarkers(world, fogOfWar, playerCell)) {
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
    })) {
      const offset = (indicator.offsetIndex % 3 - 1) * Math.min(cellWidth, cellHeight) * 0.55;
      const edgeX = offsetX + indicator.edge.x * cellWidth + (Math.abs(indicator.direction.x) < Math.abs(indicator.direction.y) ? offset : 0);
      const edgeY = offsetY + indicator.edge.y * cellHeight + (Math.abs(indicator.direction.x) >= Math.abs(indicator.direction.y) ? offset : 0);
      const angle = Math.atan2(indicator.direction.y, indicator.direction.x);
      const size = Math.min(cellWidth, cellHeight) * 0.8;
      context.save();
      context.translate(edgeX, edgeY);
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
    if (transitionActive) return;
    if (!canHandleMinimapScale(minimapVisible)) return;
    const nextZoom = getNextMinimapScale(minimapZoom);
    for (const listener of minimapZoomListeners) listener(nextZoom);
  };

  const refreshDiscovery = () => {
    if (!fogOfWar || !world || !playerCell) return;
    discoverFromPlayer(fogOfWar, world, playerCell);
    scheduleMinimapRender();
  };

  const activateRealm = (name, arrival = null) => {
    if (!worldRealms?.realms?.[name]) return;
    const sourceScreenCell = playerCell
      ? { x: playerCell.x - viewOrigin.x, y: playerCell.y - viewOrigin.y }
      : null;
    if (world && playerCell) clearCharacter(world, playerCell);
    activeRealm = name;
    world = worldRealms.realms[name];
    fogOfWar = world.fog;
    playerCell = arrival ?? world.playerCell ?? world.playerStart;
    world.playerCell = playerCell;
    setCharacter(world, playerCell);
    lighting = { ...lighting, ambient: realmAmbient[activeRealm] };
    // Preserve the player's current screen-cell offset across the realm swap.
    // This keeps center, deadzone, and locked-camera positions visually stable
    // instead of recentering the destination realm at its origin.
    viewOrigin = sourceScreenCell
      ? getViewOriginForPreservedPlayerPosition(playerCell, sourceScreenCell, viewport, world)
      : getViewOriginForCamera(cameraMode, playerCell, viewport, world, viewOrigin);
    refreshDiscovery();
    for (const listener of realmListeners) listener(activeRealm);
    // A realm swap changes every visible cell. Reset the submitted sprite
    // state so the destination realm is rendered immediately instead of
    // waiting for the next movement to invalidate individual cells.
    if (renderer && layer) rebuildLayer();
    renderWorld({ refreshLighting: true });
  };

  const setTransitionMask = ({ phase, value }) => {
    if (phase === TRANSITION_PHASES.IDLE) {
      transitionMask.hidden = true;
      return;
    }
    const playerCenter = playerCell
      ? getPlayerScreenCenter(playerCell, viewOrigin, viewport)
      : { x: (canvas.clientWidth || window.innerWidth) / 2, y: (canvas.clientHeight || window.innerHeight) / 2 };
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
      character: Math.max(4, Math.max(viewport.gridWidth, viewport.gridHeight) / 2),
    };
  };

  const startRealmTransition = (destination, arrival = null) => {
    if (transitionActive || !transitionSystem || !worldRealms?.realms?.[destination]) return false;
    const { cover, character } = getTransitionRadii();
    clearMovementInput();
    // Ensure the source realm's latest player position is submitted before the
    // mask becomes visible.
    renderWorld({ refreshLighting: true });
    transitionActive = true;
    const started = transitionSystem.start({
      target: "game_layer",
      from: cover,
      to: character,
      durationCovered: REALM_TRANSITION_COVER_HOLD_MS,
      onStart: () => {
        transitionMask.style.setProperty("--transition-radius", `${cover}px`);
        transitionMask.style.setProperty("--transition-feather-end", `${cover + 12}px`);
        transitionMask.hidden = false;
      },
      onCovered: () => activateRealm(destination, arrival),
      onComplete: () => {
        transitionActive = false;
        clearMovementInput();
        setTransitionMask({ phase: TRANSITION_PHASES.IDLE, value: 0 });
      },
    });
    if (!started) {
      transitionActive = false;
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

  const resolveViewForPlayer = () => {
    if (transitionActive || !world || !playerCell) return;
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

  const clearKeyboardInput = () => {
    heldKeys.clear();
    shiftHeld = false;
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
    const terrain = world.terrain[cell.y][cell.x];
    const baseColor = terrain.depth === "deep" && world.characters[cell.y][cell.x] === null
      ? colorToLinearRgba(terrain)
      : paletteColors.get(glyph) ?? colorToLinearRgba(getPaletteStyle(palette, glyph));
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
    schedulePresentation();
    metrics.visibleCells = region.count;
    return {
      renderMs: performance.now() - started,
      warmupMs: visual.warmupMs,
      submittedCells: metrics.submittedCells - submittedBefore,
      skippedCells: metrics.skippedCells - skippedBefore,
    };
  };

  // Full world lighting and sprite submission are synchronous WebGPU work.
  // Coalescing movement-driven renders prevents held input from starving
  // animation frames while preserving the final player position and lighting.
  const scheduleMovementRender = ({ refreshLighting = false } = {}) => {
    movementLightingRefreshPending ||= refreshLighting;
    if (movementRenderFrame !== null) return;
    movementRenderFrame = window.requestAnimationFrame(() => {
      movementRenderFrame = null;
      const shouldRefreshLighting = movementLightingRefreshPending;
      movementLightingRefreshPending = false;
      if (!disposed) renderWorld({ refreshLighting: shouldRefreshLighting });
    });
  };

  const cancelScheduledRenders = () => {
    if (movementRenderFrame !== null) window.cancelAnimationFrame(movementRenderFrame);
    if (minimapRenderFrame !== null) window.cancelAnimationFrame(minimapRenderFrame);
    if (presentationFrame !== null) window.cancelAnimationFrame(presentationFrame);
    movementRenderFrame = null;
    minimapRenderFrame = null;
    presentationFrame = null;
    movementLightingRefreshPending = false;
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
    viewport = createViewportForCanvas(canvas, zoom);
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
    world.playerCell = playerCell;
    pickupSystem?.collectAtCell(playerCell, { playerCell: { ...playerCell }, world });
    timeSystem.advance();
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
      if (!hasHeldMovement()) return;
      movePlayer();
      scheduleRepeat(getRepeatInterval(shiftHeld));
    }, delay);
  };

  const handleKeyDown = (event) => {
    shiftHeld = event.shiftKey;
    if (!getDirectionForKey(event.key)) return;
    if (transitionActive) return;
    event.preventDefault();
    const wasHeld = heldKeys.has(event.key);
    heldKeys.add(event.key);
    if (wasHeld || event.repeat) return;
    movePlayer();
    scheduleRepeat(INITIAL_REPEAT_DELAY_MS);
  };

  const handleKeyUp = (event) => {
    shiftHeld = event.key !== "Shift" && event.shiftKey;
    if (!getDirectionForKey(event.key)) return;
    if (transitionActive) return;
    event.preventDefault();
    heldKeys.delete(event.key);
    if (!hasHeldMovement()) clearRepeat();
  };

  const handlePointerDown = (event) => {
    if (transitionActive || !event.isPrimary || activePointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    touchStart = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (transitionActive || event.pointerId !== activePointerId || !touchStart) return;
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
    glyphCache = createGlyphVisualCache(engine, {
      fontId, fontFamily: getFontOption(fontId).family, glyphLimit: GLYPHS.length,
    });
    atlas = glyphCache.ensure(zoom, viewport.gridWidth, []).atlas;
    layer = createSprite2DLayer(atlas, { capacity: Math.max(1, viewport.rows * viewport.columns) });
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
          torchCount: getTorchCountForViewport(viewport),
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
    const collectGoldDefinition = questData.quests.find((quest) => quest.id === "collect-gold");
    questManager = createQuestManager(questData.quests, { gold: characterGold });
    pickupSystem = createPickupSystem();
    questManager.subscribe(({ snapshot }) => notifyQuest(snapshot));
    pickupSystem.subscribe((event) => {
      questManager.observe(event, { gold: characterGold });
      notifyQuest(questManager.getSnapshot());
      scheduleMinimapRender();
    });
    world.pickups = [];
    const questRandom = createRandom(`${world.options.seed}:quest:collect-gold`);
    const pickupCells = selectPickupCells(world, world.playerStart, collectGoldDefinition.pickup.distances, questRandom);
    pickupCells.forEach((cell, index) => {
      const pickup = pickupSystem.addPickup({
        id: `gold-${index + 1}`,
        type: "gold",
        cell,
        glyph: GOLD_GLYPH,
        effect: () => {
          characterGold += 1;
          notifyGold();
        },
      });
      world.pickups.push(pickup);
      world.characters[cell.y][cell.x] = GOLD_GLYPH;
    });
    questManager.startQuest("collect-gold", { gold: characterGold });
    notifyGold();
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
      else schedulePresentation();
    },
    setFont(nextFontId) {
      validateFontId(nextFontId);
      if (nextFontId === fontId) return;
      if (layer) removeSpriteRendererLayer(renderer, layer);
      glyphCache.dispose();
      minimapGlyphCanvases.clear();
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
    setRealmAmbient(nextAmbient) {
      realmAmbient = { ...realmAmbient, ...nextAmbient };
      lighting = { ...lighting, ambient: realmAmbient[activeRealm] };
      renderWorld();
    },
    setRealmPreference(realm) {
      if (realm !== activeRealm && worldRealms) startRealmTransition(realm);
    },
    travelRealm() { travelToNearestStairs(); },
    getRealm() { return activeRealm; },
    getQuestSnapshot() { return questManager?.getSnapshot() ?? null; },
    subscribeToQuest(listener) {
      questListeners.add(listener);
      if (questManager?.getSnapshot()) listener(questManager.getSnapshot());
      return () => questListeners.delete(listener);
    },
    getGold() { return characterGold; },
    subscribeToGold(listener) {
      goldListeners.add(listener);
      listener(characterGold);
      return () => goldListeners.delete(listener);
    },
    subscribeToRealm(listener) { realmListeners.add(listener); return () => realmListeners.delete(listener); },
    subscribeToMinimapZoom(listener) { minimapZoomListeners.add(listener); return () => minimapZoomListeners.delete(listener); },
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
    setMinimapZoom(nextZoom) {
      if (!MINIMAP_SCALE_LEVELS.includes(nextZoom) || nextZoom === minimapZoom) return;
      minimapZoom = nextZoom;
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
      disposeEngine(engine);
      timeSystem.dispose();
      container.replaceChildren();
    },
  });
}
