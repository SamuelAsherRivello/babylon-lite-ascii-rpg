import { useEffect, useRef } from "react";
import {
  DEFAULT_FONT_RESOLUTION,
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_UPSCALE,
  INITIAL_REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  clampCell,
  createViewport,
  getCellCenter,
  getCenterCell,
  getCombinedDirection,
  getDirectionForKey,
  moveCell,
} from "./player-grid.js";

const PLAYER_GLYPH = "P";
const PLAYER_FONT_FAMILY = "monospace";

function drawPlayer(canvas, viewport, playerCell) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  canvas.width = Math.max(1, Math.ceil(viewport.logicalWidth));
  canvas.height = Math.max(1, Math.ceil(viewport.logicalHeight));
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f5f5f5";
  context.font = `${viewport.gridHeight * viewport.fontResolution}px ${PLAYER_FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const center = getCellCenter(playerCell, viewport);
  context.fillText(PLAYER_GLYPH, center.x, center.y);
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
    let playerCell = getCenterCell(viewport);
    let repeatTimer = null;

    const redraw = () => {
      drawPlayer(canvas, viewport, playerCell);
    };

    const movePlayer = () => {
      const direction = getCombinedDirection(heldKeys);
      if (direction.x === 0 && direction.y === 0) {
        return;
      }

      playerCell = moveCell(playerCell, direction, viewport);
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
      playerCell = clampCell(playerCell, viewport);
      redraw();
    };

    redraw();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      if (repeatTimer !== null) {
        window.clearTimeout(repeatTimer);
      }
    };
  }, []);

  return <canvas ref={canvasRef} id="game_canvas" aria-label="Ascii RPG game" />;
}
