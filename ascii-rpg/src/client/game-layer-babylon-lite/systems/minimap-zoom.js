export const MINIMAP_SCALE_LEVELS = [1, 2, 3];
export const DEFAULT_MINIMAP_SCALE = 2;
// These are CSS-pixel cell footprints, independent of the game's nonlinear
// zoom curve. In the usual 320px panel they yield about 80, 40, and 20 cells.
const MINIMAP_CELL_SIZES = [4, 8, 16];

export function normalizeMinimapScale(value, fallback = DEFAULT_MINIMAP_SCALE) {
  const selected = Number(value);
  return MINIMAP_SCALE_LEVELS.includes(selected) ? selected : fallback;
}

export function migrateMinimapScale(value) {
  return normalizeMinimapScale(value);
}

export function getNextMinimapScale(currentScale) {
  const selected = Number(currentScale);
  const currentIndex = MINIMAP_SCALE_LEVELS.indexOf(selected);
  if (currentIndex < 0) return DEFAULT_MINIMAP_SCALE;
  return MINIMAP_SCALE_LEVELS[(currentIndex + 1) % MINIMAP_SCALE_LEVELS.length];
}

export function getMinimapCellSize(scale) {
  const selected = normalizeMinimapScale(scale);
  return MINIMAP_CELL_SIZES[MINIMAP_SCALE_LEVELS.indexOf(selected)];
}

export function canHandleMinimapScale() {
  return true;
}

export function getMinimapViewport({ columns, rows }, focusCell, scale) {
  const viewportColumns = Math.min(columns, Math.ceil(columns / scale));
  const viewportRows = Math.min(rows, Math.ceil(rows / scale));
  const maxX = columns - viewportColumns;
  const maxY = rows - viewportRows;
  return {
    x: Math.max(0, Math.min(maxX, focusCell.x - Math.floor(viewportColumns / 2))),
    y: Math.max(0, Math.min(maxY, focusCell.y - Math.floor(viewportRows / 2))),
    columns: viewportColumns,
    rows: viewportRows,
  };
}

export function getMinimapCellLayout({ width, height }, { columns, rows }, cellWidth, cellHeight) {
  const safeCellWidth = Math.max(1, cellWidth);
  const safeCellHeight = Math.max(1, cellHeight);
  return {
    cellWidth: safeCellWidth,
    cellHeight: safeCellHeight,
    offsetX: Math.max(0, (width - columns * safeCellWidth) / 2),
    offsetY: Math.max(0, (height - rows * safeCellHeight) / 2),
  };
}
