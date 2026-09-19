export const DEFAULT_UPSCALE = 1.0;
export const DEFAULT_FONT_RESOLUTION = 1.0;
export const DEFAULT_ZOOM = 5;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 10;
export const DEFAULT_GRID_WIDTH = 32;
export const DEFAULT_GRID_HEIGHT = 32;
export const INITIAL_REPEAT_DELAY_MS = 250;
export const REPEAT_INTERVAL_MS = 125;
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
