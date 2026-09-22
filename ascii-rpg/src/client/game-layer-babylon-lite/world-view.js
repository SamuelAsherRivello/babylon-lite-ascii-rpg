import { getFogVisibility } from "./systems/fog-of-war-system.js";

function normalizeRectangle(rectangle, world) {
  const width = Math.max(0, Math.min(
    Number.isFinite(rectangle?.width) ? Math.floor(rectangle.width) : 0,
    world.columns,
  ));
  const height = Math.max(0, Math.min(
    Number.isFinite(rectangle?.height) ? Math.floor(rectangle.height) : 0,
    world.rows,
  ));
  const x = Math.max(0, Math.min(
    Number.isFinite(rectangle?.x) ? Math.floor(rectangle.x) : 0,
    Math.max(0, world.columns - width),
  ));
  const y = Math.max(0, Math.min(
    Number.isFinite(rectangle?.y) ? Math.floor(rectangle.y) : 0,
    Math.max(0, world.rows - height),
  ));
  return { x, y, width, height, count: width * height };
}

export function createWorldViewComposition({
  world,
  fog,
  source,
  destination = {},
  getGlyph,
  discovered,
  getVisibility = getFogVisibility,
  onlyDiscovered = false,
} = {}) {
  if (!world || !Number.isInteger(world.columns) || !Number.isInteger(world.rows)) {
    throw new TypeError("World-view composition requires a generated world.");
  }
  if (typeof getGlyph !== "function") {
    throw new TypeError("World-view composition requires a glyph resolver.");
  }
  const region = normalizeRectangle(source, world);
  const resolveVisibility = typeof discovered === "function"
    ? (fogState, currentWorld, cell) => discovered(fogState, currentWorld, cell) ? 100 : 0
    : getVisibility;
  const cells = [];
  for (let localY = 0; localY < region.height; localY += 1) {
    for (let localX = 0; localX < region.width; localX += 1) {
      const cell = { x: region.x + localX, y: region.y + localY };
      const visibility = resolveVisibility(fog, world, cell);
      const isVisible = visibility > 0;
      if (onlyDiscovered && !isVisible) continue;
      cells.push({
        cell,
        localX,
        localY,
        slot: localY * region.width + localX,
        discovered: isVisible,
        visibility,
        glyph: isVisible ? getGlyph(world, cell) : null,
      });
    }
  }
  return Object.freeze({
    region,
    destination: Object.freeze({ ...destination }),
    cells: Object.freeze(cells),
  });
}

export function collectWorldViewGlyphs(composition) {
  const glyphs = new Set();
  for (const cell of composition?.cells ?? []) {
    if (cell.discovered && cell.glyph !== null) glyphs.add(cell.glyph);
  }
  return glyphs;
}

export function renderWorldViewComposition(composition, {
  drawBackground,
  drawCell,
  drawOverlay,
} = {}) {
  if (!composition) return { cells: 0, discoveredCells: 0 };
  drawBackground?.(composition.destination, composition.region);
  let discoveredCells = 0;
  for (const cell of composition.cells) {
    if (cell.discovered) discoveredCells += 1;
    drawCell?.(cell, composition.destination, composition.region);
  }
  drawOverlay?.(composition.destination, composition.region);
  return { cells: composition.cells.length, discoveredCells };
}

function defaultScheduleFrame(callback) {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 0);
}

function defaultCancelFrame(handle) {
  if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(handle);
    return;
  }
  clearTimeout(handle);
}

export function renderWorldViewCompositionCooperatively(composition, {
  drawBackground,
  drawCell,
  drawOverlay,
  sliceMs = 8,
  scheduleFrame = defaultScheduleFrame,
  cancelFrame = defaultCancelFrame,
  now = () => performance.now(),
} = {}) {
  let cancelled = false;
  let frameHandle = null;
  let cellIndex = 0;
  let discoveredCells = 0;
  const result = { cells: composition?.cells.length ?? 0, discoveredCells: 0, cancelled: false };

  let resolveFinished;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
  });

  const finish = () => {
    frameHandle = null;
    result.cancelled = cancelled;
    result.discoveredCells = discoveredCells;
    resolveFinished({ ...result });
  };

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    if (frameHandle !== null) {
      cancelFrame(frameHandle);
      frameHandle = null;
    }
    finish();
  };

  if (!composition) {
    finish();
    return { cancel, finished, get cancelled() { return cancelled; } };
  }

  drawBackground?.(composition.destination, composition.region);

  const renderBatch = () => {
    frameHandle = null;
    if (cancelled) {
      finish();
      return;
    }
    const batchStart = now();
    while (cellIndex < composition.cells.length) {
      if (cancelled) {
        finish();
        return;
      }
      const cell = composition.cells[cellIndex];
      cellIndex += 1;
      if (cell.discovered) discoveredCells += 1;
      drawCell?.(cell, composition.destination, composition.region);
      if (cellIndex < composition.cells.length && now() - batchStart >= sliceMs) {
        frameHandle = scheduleFrame(renderBatch);
        return;
      }
    }
    if (!cancelled) drawOverlay?.(composition.destination, composition.region);
    finish();
  };

  renderBatch();

  return {
    cancel,
    finished,
    get cancelled() {
      return cancelled;
    },
  };
}
