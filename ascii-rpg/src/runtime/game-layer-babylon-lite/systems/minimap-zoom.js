export const MINIMAP_SCALE_LEVELS = [1, 5, 10];

export function getNextMinimapScale(currentScale) {
  const selected = Number.isFinite(currentScale) ? currentScale : 5;
  return MINIMAP_SCALE_LEVELS.find((scale) => scale > selected) ?? MINIMAP_SCALE_LEVELS[0];
}

export function canHandleMinimapScale(minimapVisible) {
  return minimapVisible === true;
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
