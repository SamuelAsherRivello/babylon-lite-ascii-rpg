import { useEffect, useRef } from "react";
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
import {
  clearCharacter,
  createWorld,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  setCharacter,
} from "./world-grid.js";
import { getPalette, subscribeToPalette } from "./palette-store.js";
import { getPaletteStyle } from "./palette.js";

const PLAYER_FONT_FAMILY = "monospace";

export function drawWorld(canvas, viewport, world, palette = getPalette()) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  canvas.width = Math.max(1, Math.ceil(viewport.logicalWidth));
  canvas.height = Math.max(1, Math.ceil(viewport.logicalHeight));
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `${viewport.gridHeight * viewport.fontResolution}px ${PLAYER_FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const visibleRows = Math.min(viewport.rows, world.rows);
  const visibleColumns = Math.min(viewport.columns, world.columns);
  for (let y = 0; y < visibleRows; y += 1) {
    for (let x = 0; x < visibleColumns; x += 1) {
      const glyph = getVisibleGlyph(world, { x, y });
      if (!glyph) {
        continue;
      }

      const style = getPaletteStyle(palette, glyph);
      context.fillStyle = style.color;
      context.globalAlpha = style.alpha;
      const center = getCellCenter({ x, y }, viewport);
      context.fillText(glyph, center.x, center.y);
    }
  }
  context.globalAlpha = 1;
}

export function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const heldKeys = new Set();
    let viewport = createViewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      upscale: DEFAULT_UPSCALE,
      fontResolution: DEFAULT_FONT_RESOLUTION,
      gridWidth: DEFAULT_GRID_WIDTH,
      gridHeight: DEFAULT_GRID_HEIGHT,
    });
    let world = createWorld({
      rows: Math.max(3, viewport.rows),
      columns: Math.max(3, viewport.columns),
      seed: getRandomSeedFromSearch(window.location.search),
    });
    let playerCell = world.playerStart;
    let palette = getPalette();
    let repeatTimer = null;

    const redraw = () => {
      drawWorld(canvas, viewport, world, palette);
    };

    const movePlayer = () => {
      const direction = getCombinedDirection(heldKeys);
      if (direction.x === 0 && direction.y === 0) {
        return;
      }

      const nextCell = moveWorldCell(playerCell, direction, world);
      if (nextCell.x === playerCell.x && nextCell.y === playerCell.y) {
        return;
      }

      clearCharacter(world, playerCell);
      playerCell = nextCell;
      setCharacter(world, playerCell);
      redraw();
    };

    const scheduleRepeat = (delay) => {
      if (repeatTimer !== null) {
        window.clearTimeout(repeatTimer);
      }

      repeatTimer = window.setTimeout(() => {
        repeatTimer = null;
        if (heldKeys.size === 0) {
          return;
        }

        movePlayer();
        scheduleRepeat(REPEAT_INTERVAL_MS);
      }, delay);
    };

    const handleKeyDown = (event) => {
      if (!getDirectionForKey(event.key)) {
        return;
      }

      event.preventDefault();
      const wasHeld = heldKeys.has(event.key);
      heldKeys.add(event.key);

      if (wasHeld || event.repeat) {
        return;
      }

      movePlayer();
      scheduleRepeat(INITIAL_REPEAT_DELAY_MS);
    };

    const handleKeyUp = (event) => {
      if (!getDirectionForKey(event.key)) {
        return;
      }

      event.preventDefault();
      heldKeys.delete(event.key);
      if (heldKeys.size === 0 && repeatTimer !== null) {
        window.clearTimeout(repeatTimer);
        repeatTimer = null;
      }
    };

    const handleResize = () => {
      viewport = createViewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        upscale: DEFAULT_UPSCALE,
        fontResolution: DEFAULT_FONT_RESOLUTION,
        gridWidth: DEFAULT_GRID_WIDTH,
        gridHeight: DEFAULT_GRID_HEIGHT,
      });
      redraw();
    };

    redraw();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);
    const unsubscribePalette = subscribeToPalette((nextPalette) => {
      palette = nextPalette;
      redraw();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      unsubscribePalette();
      if (repeatTimer !== null) {
        window.clearTimeout(repeatTimer);
      }
    };
  }, []);

  return <canvas ref={canvasRef} id="game_canvas" aria-label="Ascii RPG game" />;
}
