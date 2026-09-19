import {
  addSprite2DIndex,
  createEngine,
  createSprite2DLayer,
  createSpriteAtlasFromFrames,
  createSpriteRenderer,
  disposeEngine,
  disposeSpriteAtlas,
  disposeSpriteRenderer,
  registerSpriteRenderer,
  startEngine,
  updateSprite2DIndex,
} from "@babylonjs/lite";
import {
  DEFAULT_FONT_RESOLUTION,
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_UPSCALE,
  INITIAL_REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  createViewport,
  getCellCenter,
  getCombinedDirection,
  getDirectionForKey,
  moveWorldCell,
} from "./player-grid.js";
import { getFontOption, validateFontId } from "./font.js";
import { getPaletteStyle, validatePaletteEntries } from "./palette.js";
import {
  clearCharacter,
  createWorld,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  setCharacter,
} from "./world-grid.js";
import { createTimeSystem } from "./time-system.js";

const GLYPHS = ["W", "•", "P"];
const GLYPH_SIZE = 64;

function colorToLinearRgba({ color, alpha }) {
  const hex = color.slice(1);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  return [...channels.map((channel) => channel ** 2.2), alpha];
}

function createGlyphFrame(glyph, fontFamily) {
  const canvas = document.createElement("canvas");
  canvas.width = GLYPH_SIZE;
  canvas.height = GLYPH_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.clearRect(0, 0, GLYPH_SIZE, GLYPH_SIZE);
  context.fillStyle = "#ffffff";
  context.font = `${GLYPH_SIZE}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(glyph, GLYPH_SIZE / 2, GLYPH_SIZE / 2);
  return {
    pixels: context.getImageData(0, 0, GLYPH_SIZE, GLYPH_SIZE).data,
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
  };
}

function createViewportForWindow() {
  return createViewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    upscale: DEFAULT_UPSCALE,
    fontResolution: DEFAULT_FONT_RESOLUTION,
    gridWidth: DEFAULT_GRID_WIDTH,
    gridHeight: DEFAULT_GRID_HEIGHT,
  });
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
  container.replaceChildren(canvas);

  let engine;
  let renderer;
  let atlas;
  let layer;
  let disposed = false;
  let repeatTimer = null;
  const heldKeys = new Set();
  let viewport = createViewportForWindow();
  let world = createWorld({
    rows: Math.max(3, viewport.rows),
    columns: Math.max(3, viewport.columns),
    seed: getRandomSeedFromSearch(window.location.search),
  });
  const worldSeed = world.options.seed;
  let playerCell = world.playerStart;
  const timeSystem = createTimeSystem();
  let palette = initialPalette.map((entry) => ({ ...entry }));
  let fontId = initialFontId;
  const spriteIndexes = [];

  const clearRepeat = () => {
    if (repeatTimer !== null) {
      window.clearTimeout(repeatTimer);
      repeatTimer = null;
    }
  };

  const renderWorld = () => {
    const visibleRows = Math.min(viewport.rows, world.rows);
    const visibleColumns = Math.min(viewport.columns, world.columns);
    let sprite = 0;
    for (let y = 0; y < visibleRows; y += 1) {
      for (let x = 0; x < visibleColumns; x += 1) {
        const glyph = getVisibleGlyph(world, { x, y });
        const style = getPaletteStyle(palette, glyph);
        const center = getCellCenter({ x, y }, viewport);
        const props = {
          positionPx: [center.x, center.y],
          sizePx: [viewport.gridWidth, viewport.gridHeight],
          frame: GLYPHS.indexOf(glyph),
          color: colorToLinearRgba(style),
          visible: true,
        };
        if (spriteIndexes[sprite] === undefined) {
          spriteIndexes.push(addSprite2DIndex(layer, props));
        } else {
          updateSprite2DIndex(layer, spriteIndexes[sprite], props);
        }
        sprite += 1;
      }
    }
    for (; sprite < spriteIndexes.length; sprite += 1) {
      updateSprite2DIndex(layer, spriteIndexes[sprite], { visible: false });
    }
  };

  const movePlayer = () => {
    const direction = getCombinedDirection(heldKeys);
    if (direction.x === 0 && direction.y === 0) return;
    const nextCell = moveWorldCell(playerCell, direction, world);
    if (nextCell.x === playerCell.x && nextCell.y === playerCell.y) return;
    clearCharacter(world, playerCell);
    playerCell = nextCell;
    setCharacter(world, playerCell);
    timeSystem.advance();
    renderWorld();
  };

  const scheduleRepeat = (delay) => {
    clearRepeat();
    repeatTimer = window.setTimeout(() => {
      repeatTimer = null;
      if (heldKeys.size === 0) return;
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
    if (heldKeys.size === 0) clearRepeat();
  };

  const handleResize = () => {
    viewport = createViewportForWindow();
    world = createWorld({
      rows: Math.max(3, viewport.rows),
      columns: Math.max(3, viewport.columns),
      seed: worldSeed,
    });
    playerCell = world.playerStart;
    renderWorld();
  };

  try {
    engine = await createEngine(canvas, { maxDevicePixelRatio: 1, msaaSamples: 1 });
    atlas = createSpriteAtlasFromFrames(engine, GLYPHS.map((glyph) => createGlyphFrame(glyph, getFontOption(fontId).family)));
    layer = createSprite2DLayer(atlas, { capacity: Math.max(1, viewport.rows * viewport.columns) });
    renderer = createSpriteRenderer(engine, { layers: [layer], clearValue: { r: 0, g: 0, b: 0, a: 1 } });
    registerSpriteRenderer(renderer);
    renderWorld();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);
    await startEngine(engine);
  } catch (error) {
    clearRepeat();
    renderer && disposeSpriteRenderer(renderer);
    atlas && disposeSpriteAtlas(atlas);
    engine && disposeEngine(engine);
    container.replaceChildren();
    throw error;
  }

  return Object.freeze({
    setPalette(nextPalette) {
      validatePaletteEntries(nextPalette);
      palette = nextPalette.map((entry) => ({ ...entry }));
      renderWorld();
    },
    setFont(nextFontId) {
      validateFontId(nextFontId);
      if (nextFontId === fontId) return;
      const nextAtlas = createSpriteAtlasFromFrames(
        engine,
        GLYPHS.map((glyph) => createGlyphFrame(glyph, getFontOption(nextFontId).family)),
      );
      const nextLayer = createSprite2DLayer(nextAtlas, { capacity: Math.max(1, viewport.rows * viewport.columns) });
      const previousAtlas = atlas;
      atlas = nextAtlas;
      layer = nextLayer;
      renderer.layers[0] = nextLayer;
      spriteIndexes.length = 0;
      fontId = nextFontId;
      renderWorld();
      disposeSpriteAtlas(previousAtlas);
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
      clearRepeat();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      disposeSpriteRenderer(renderer);
      disposeSpriteAtlas(atlas);
      disposeEngine(engine);
      timeSystem.dispose();
      container.replaceChildren();
    },
  });
}
