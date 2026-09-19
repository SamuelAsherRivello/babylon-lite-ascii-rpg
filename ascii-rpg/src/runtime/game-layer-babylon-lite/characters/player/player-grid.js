export const DEFAULT_UPSCALE = 1.0;
export const DEFAULT_FONT_RESOLUTION = 1.0;
export const DEFAULT_ZOOM = 5;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 10;
export const DEFAULT_GRID_WIDTH = 32;
export const DEFAULT_GRID_HEIGHT = 32;
export const INITIAL_REPEAT_DELAY_MS = 250;
export const REPEAT_INTERVAL_MS = 125;

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
  const safeZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  const zoomScale = safeZoom / DEFAULT_ZOOM;
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
    columns: Math.max(1, Math.floor(logicalWidth / scaledGridWidth)),
    rows: Math.max(1, Math.floor(logicalHeight / scaledGridHeight)),
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
