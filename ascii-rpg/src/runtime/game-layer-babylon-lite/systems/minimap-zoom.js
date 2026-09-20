export const MINIMAP_SCALE_LEVELS = [2, 4, 1];

export function getNextMinimapScale(currentScale) {
  const selected = Number.isFinite(currentScale) ? currentScale : 2;
  const currentIndex = MINIMAP_SCALE_LEVELS.indexOf(selected);
  return MINIMAP_SCALE_LEVELS[(currentIndex + 1) % MINIMAP_SCALE_LEVELS.length];
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
