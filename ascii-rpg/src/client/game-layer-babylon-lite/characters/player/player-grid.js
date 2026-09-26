export const DEFAULT_UPSCALE = 1.0;
export const DEFAULT_FONT_RESOLUTION = 1.0;
export { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../../zoom-scale.js";
import { DEFAULT_ZOOM, getZoomScale, MAX_ZOOM, MIN_ZOOM, normalizeZoom } from "../../zoom-scale.js";
export const DEFAULT_GRID_WIDTH = 32;
export const DEFAULT_GRID_HEIGHT = 32;
export const INITIAL_REPEAT_DELAY_MS = 250;
export const REPEAT_INTERVAL_MS = 125;
export const SHIFT_REPEAT_INTERVAL_MS = 100 / 3;
export const EXHAUSTED_REPEAT_MULTIPLIER = 3;
export const SWIPE_THRESHOLD_PX = 24;
export const CAMERA_DEADZONE_WIDTH_RATIO = 0.2;
export const CAMERA_DEADZONE_HEIGHT_RATIO = 0.2;

const keyDirections = new Map([
  ["w", { x: 0, y: -1 }],
  ["arrowup", { x: 0, y: -1 }],
  ["a", { x: -1, y: 0 }],
  ["arrowleft", { x: -1, y: 0 }],
  ["s", { x: 0, y: 1 }],
  ["arrowdown", { x: 0, y: 1 }],
  ["d", { x: 1, y: 0 }],
  ["arrowright", { x: 1, y: 0 }],
]);

export function getDirectionForKey(key) {
  return keyDirections.get(key.toLowerCase()) ?? null;
}

export function getActionForKey(key) {
  const normalizedKey = key.toLowerCase();
  if (normalizedKey === " ") return "set-bomb";
  if (normalizedKey === "w" || normalizedKey === "arrowup") return "up";
  if (normalizedKey === "a" || normalizedKey === "arrowleft") return "left";
  if (normalizedKey === "s" || normalizedKey === "arrowdown") return "down";
  if (normalizedKey === "d" || normalizedKey === "arrowright") return "right";
  return null;
}

export function getHeadingLocation(cell, direction) {
  if (!cell || !direction || Math.abs(direction.x) + Math.abs(direction.y) !== 1) return null;
  return Object.freeze({ x: cell.x + direction.x, y: cell.y + direction.y });
}

export function getHeadingDirectionAfterMovement(heading, direction) {
  if (!direction || Math.abs(direction.x) + Math.abs(direction.y) !== 1) return heading ?? null;
  return Object.freeze({ x: direction.x, y: direction.y });
}

export function getRepeatInterval(isShiftHeld, isExhausted = false) {
  const interval = isShiftHeld ? SHIFT_REPEAT_INTERVAL_MS : REPEAT_INTERVAL_MS;
  return isExhausted ? interval * EXHAUSTED_REPEAT_MULTIPLIER : interval;
}

export function getCombinedDirection(keys) {
  const direction = { x: 0, y: 0 };

  for (const key of keys) {
    const keyDirection = getDirectionForKey(key);
    if (keyDirection) {
      direction.x += keyDirection.x;
      direction.y += keyDirection.y;
    }
  }

  return {
    x: Math.sign(direction.x),
    y: Math.sign(direction.y),
  };
}

export function getDirectionForSwipe(offsetX, offsetY, threshold = SWIPE_THRESHOLD_PX) {
  if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) return null;
  if (Math.hypot(offsetX, offsetY) < threshold) return null;

  const octant = ((Math.round(Math.atan2(offsetY, offsetX) / (Math.PI / 4)) % 8) + 8) % 8;
  return [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
  ][octant];
}

export function createViewport({
  screenWidth,
  screenHeight,
  upscale = DEFAULT_UPSCALE,
  zoom = DEFAULT_ZOOM,
  gridWidth = DEFAULT_GRID_WIDTH,
  gridHeight = DEFAULT_GRID_HEIGHT,
  fontResolution = DEFAULT_FONT_RESOLUTION,
}) {
  const safeUpscale = upscale > 0 ? upscale : DEFAULT_UPSCALE;
  const safeZoom = normalizeZoom(zoom);
  const zoomScale = getZoomScale(safeZoom);
  const scaledGridWidth = gridWidth * zoomScale;
  const scaledGridHeight = gridHeight * zoomScale;
  const logicalWidth = screenWidth / safeUpscale;
  const logicalHeight = screenHeight / safeUpscale;

  return {
    screenWidth,
    screenHeight,
    logicalWidth,
    logicalHeight,
    upscale: safeUpscale,
    zoom: safeZoom,
    fontResolution,
    gridWidth: scaledGridWidth,
    gridHeight: scaledGridHeight,
    // Include an edge tile whenever the canvas ends between grid boundaries.
    // Rendering complete tiles only leaves an uncovered strip along the right
    // and bottom of any viewport whose dimensions are not exact multiples of
    // the displayed grid size. The GPU clips the partial tile to the canvas.
    columns: Math.max(1, Math.ceil(logicalWidth / scaledGridWidth)),
    rows: Math.max(1, Math.ceil(logicalHeight / scaledGridHeight)),
  };
}

export function getCenterCell(viewport) {
  return {
    x: Math.floor(viewport.columns / 2),
    y: Math.floor(viewport.rows / 2),
  };
}

export function getViewOriginForPlayer(playerCell, viewport, world) {
  const visibleColumns = Math.min(viewport.columns, world.columns);
  const visibleRows = Math.min(viewport.rows, world.rows);
  const maxX = Math.max(0, world.columns - visibleColumns);
  const maxY = Math.max(0, world.rows - visibleRows);

  return {
    x: Math.min(Math.max(playerCell.x - Math.floor(visibleColumns / 2), 0), maxX),
    y: Math.min(Math.max(playerCell.y - Math.floor(visibleRows / 2), 0), maxY),
  };
}

function getVisibleDimensions(viewport, world) {
  return {
    columns: Math.min(viewport.columns, world.columns),
    rows: Math.min(viewport.rows, world.rows),
  };
}

function clampViewOrigin(origin, viewport, world) {
  const { columns, rows } = getVisibleDimensions(viewport, world);
  return {
    x: Math.min(Math.max(origin.x, 0), Math.max(0, world.columns - columns)),
    y: Math.min(Math.max(origin.y, 0), Math.max(0, world.rows - rows)),
  };
}

export function getViewOriginForDeadzone(playerCell, viewport, world, previousOrigin) {
  const { columns, rows } = getVisibleDimensions(viewport, world);
  const centerX = Math.floor(columns / 2);
  const centerY = Math.floor(rows / 2);
  const halfWidth = Math.floor(columns * CAMERA_DEADZONE_WIDTH_RATIO);
  const halfHeight = Math.floor(rows * CAMERA_DEADZONE_HEIGHT_RATIO);
  const current = clampViewOrigin(previousOrigin, viewport, world);
  const localX = playerCell.x - current.x;
  const localY = playerCell.y - current.y;
  let x = current.x;
  let y = current.y;
  if (localX < centerX - halfWidth) x = playerCell.x - (centerX - halfWidth);
  if (localX > centerX + halfWidth) x = playerCell.x - (centerX + halfWidth);
  if (localY < centerY - halfHeight) y = playerCell.y - (centerY - halfHeight);
  if (localY > centerY + halfHeight) y = playerCell.y - (centerY + halfHeight);
  return clampViewOrigin({ x, y }, viewport, world);
}

export function getViewOriginForCamera(mode, playerCell, viewport, world, previousOrigin, direction = { x: 0, y: 0 }) {
  if (mode === "lock") {
    const current = clampViewOrigin(previousOrigin, viewport, world);
    const { columns, rows } = getVisibleDimensions(viewport, world);
    const localX = playerCell.x - current.x;
    const localY = playerCell.y - current.y;
    let x = current.x;
    let y = current.y;
    if (localX < 0) x = playerCell.x - (columns - 1);
    if (localX >= columns) x = playerCell.x;
    if (localY < 0) y = playerCell.y - (rows - 1);
    if (localY >= rows) y = playerCell.y;
    const candidate = clampViewOrigin({ x, y }, viewport, world);
    const candidateLocalX = playerCell.x - candidate.x;
    const candidateLocalY = playerCell.y - candidate.y;
    const wrappedX = direction.x !== 0 && (localX < 0 || localX >= columns);
    const wrappedY = direction.y !== 0 && (localY < 0 || localY >= rows);
    if ((wrappedX && candidateLocalX !== (direction.x < 0 ? columns - 1 : 0))
      || (wrappedY && candidateLocalY !== (direction.y < 0 ? rows - 1 : 0))) return null;
    return candidate;
  }
  if (mode === "deadzone") return getViewOriginForDeadzone(playerCell, viewport, world, previousOrigin);
  return getViewOriginForPlayer(playerCell, viewport, world);
}

export function getInitialViewOriginForCamera(_mode, playerCell, viewport, world) {
  return getViewOriginForPlayer(playerCell, viewport, world);
}

export function clampCell(cell, viewport) {
  return {
    x: Math.min(Math.max(cell.x, 0), viewport.columns - 1),
    y: Math.min(Math.max(cell.y, 0), viewport.rows - 1),
  };
}

export function moveCell(cell, direction, viewport) {
  const nextCell = {
    x: cell.x + direction.x,
    y: cell.y + direction.y,
  };

  return clampCell(nextCell, viewport);
}

export function moveWorldCell(cell, direction, world) {
  const nextCell = {
    x: cell.x + direction.x,
    y: cell.y + direction.y,
  };

  if (
    nextCell.x < 0 ||
    nextCell.y < 0 ||
    nextCell.x >= world.columns ||
    nextCell.y >= world.rows
  ) {
    return cell;
  }

  return world.terrain[nextCell.y][nextCell.x].walkable ? nextCell : cell;
}

export function getCellCenter(cell, viewport) {
  return {
    x: cell.x * viewport.gridWidth + viewport.gridWidth / 2,
    y: cell.y * viewport.gridHeight + viewport.gridHeight / 2,
  };
}

// Adjacent sprites with fractional dimensions can be rasterized on different
// sides of a physical pixel.  Use inclusive pixel coverage for each cell so
// their bounds meet (or share one edge pixel) at every displayed zoom.
export function getPixelSnappedCellBounds(cell, viewport, offset = { x: 0, y: 0 }) {
  const offsetX = Number.isFinite(offset.x) ? offset.x : 0;
  const offsetY = Number.isFinite(offset.y) ? offset.y : 0;
  const left = Math.floor(offsetX + cell.x * viewport.gridWidth);
  const right = Math.ceil(offsetX + (cell.x + 1) * viewport.gridWidth);
  const top = Math.floor(offsetY + cell.y * viewport.gridHeight);
  const bottom = Math.ceil(offsetY + (cell.y + 1) * viewport.gridHeight);
  return {
    center: { x: (left + right) / 2, y: (top + bottom) / 2 },
    size: { width: right - left, height: bottom - top },
  };
}

export function getPlayerScreenCenter(playerCell, viewOrigin, viewport) {
  return getCellCenter({
    x: playerCell.x - viewOrigin.x,
    y: playerCell.y - viewOrigin.y,
  }, viewport);
}

export function getViewOriginForPreservedPlayerPosition(playerCell, screenCell, viewport, world) {
  return clampViewOrigin({
    x: playerCell.x - screenCell.x,
    y: playerCell.y - screenCell.y,
  }, viewport, world);
}

export function getViewOriginForResize(mode, playerCell, previousViewport, viewport, world, previousOrigin) {
  if (mode !== "lock") {
    return getViewOriginForCamera(mode, playerCell, viewport, world, previousOrigin);
  }

  const screenCell = {
    x: playerCell.x - previousOrigin.x,
    y: playerCell.y - previousOrigin.y,
  };
  const previousVisibleColumns = Math.min(previousViewport.columns, world.columns);
  const previousVisibleRows = Math.min(previousViewport.rows, world.rows);
  const visibleColumns = Math.min(viewport.columns, world.columns);
  const visibleRows = Math.min(viewport.rows, world.rows);
  if (screenCell.x >= 0 && screenCell.x < previousVisibleColumns
    && screenCell.y >= 0 && screenCell.y < previousVisibleRows
    && screenCell.x < visibleColumns && screenCell.y < visibleRows) {
    return getViewOriginForPreservedPlayerPosition(playerCell, screenCell, viewport, world);
  }

  return getViewOriginForCamera(mode, playerCell, viewport, world, previousOrigin);
}
