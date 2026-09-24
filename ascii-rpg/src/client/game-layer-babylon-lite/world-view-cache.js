const DEFAULT_PARTIAL_COVERAGE = 0.35;
const DEFAULT_MAX_RECTANGLES = 24;
const DEFAULT_MAX_RESOURCES = 8;

function finiteInteger(value, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function cellKey(cell) {
  return `${Math.floor(cell.x)},${Math.floor(cell.y)}`;
}

function normalizeCell(cell) {
  if (!Number.isFinite(cell?.x) || !Number.isFinite(cell?.y)) return null;
  return { x: Math.floor(cell.x), y: Math.floor(cell.y) };
}

function sameRectangle(left, right) {
  return left.x === right.x && left.y === right.y && left.width === right.width && left.height === right.height;
}

export function coalesceDirtyCells(cells = []) {
  const rows = new Map();
  for (const sourceCell of cells) {
    const cell = normalizeCell(sourceCell);
    if (!cell) continue;
    const row = rows.get(cell.y) ?? new Set();
    row.add(cell.x);
    rows.set(cell.y, row);
  }

  const active = new Map();
  const rectangles = [];
  for (const y of [...rows.keys()].sort((left, right) => left - right)) {
    const xValues = [...rows.get(y)].sort((left, right) => left - right);
    const runs = [];
    for (let index = 0; index < xValues.length;) {
      const start = xValues[index];
      let end = start;
      index += 1;
      while (index < xValues.length && xValues[index] === end + 1) {
        end = xValues[index];
        index += 1;
      }
      runs.push({ x: start, y, width: end - start + 1, height: 1 });
    }
    const nextActive = new Map();
    for (const run of runs) {
      const key = `${run.x}:${run.width}`;
      const previous = active.get(key);
      if (previous && previous.y + previous.height === y) {
        previous.height += 1;
        nextActive.set(key, previous);
      } else {
        nextActive.set(key, run);
      }
    }
    for (const [key, rectangle] of active) {
      if (!nextActive.has(key)) rectangles.push(rectangle);
    }
    active.clear();
    for (const [key, rectangle] of nextActive) active.set(key, rectangle);
  }
  rectangles.push(...active.values());
  return Object.freeze(rectangles.map((rectangle) => Object.freeze({ ...rectangle })));
}

export function selectWorldViewRefresh({
  previous = null,
  compatibilityKey = "",
  contentKey = "",
  cells = [],
  totalCells = 0,
  forceFull = false,
  partialCoverage = DEFAULT_PARTIAL_COVERAGE,
  maxRectangles = DEFAULT_MAX_RECTANGLES,
} = {}) {
  const normalizedCells = new Map();
  for (const sourceCell of cells) {
    const cell = normalizeCell(sourceCell);
    if (cell) normalizedCells.set(cellKey(cell), cell);
  }
  const dirtyCells = [...normalizedCells.values()];
  const rectangles = coalesceDirtyCells(dirtyCells);
  const coverage = finiteInteger(totalCells) === 0 ? 0 : dirtyCells.length / finiteInteger(totalCells);
  const compatible = previous?.compatibilityKey === compatibilityKey;
  const unchanged = compatible && !forceFull && previous?.contentKey === contentKey && dirtyCells.length === 0;
  const partialAllowed = compatible && !forceFull && dirtyCells.length > 0
    && coverage <= Math.max(0, Math.min(1, partialCoverage))
    && rectangles.length <= finiteInteger(maxRectangles, DEFAULT_MAX_RECTANGLES);
  const mode = unchanged ? "reuse" : partialAllowed ? "partial" : "full";
  return Object.freeze({
    mode,
    compatibilityKey,
    contentKey,
    dirtyCells: Object.freeze(dirtyCells.map((cell) => Object.freeze({ ...cell }))),
    rectangles,
    coverage,
    compatible,
  });
}

export function createWorldViewCache({ maxResources = DEFAULT_MAX_RESOURCES } = {}) {
  const views = new Map();
  const resources = new Map();
  const limit = Math.max(1, finiteInteger(maxResources, DEFAULT_MAX_RESOURCES));

  function getView(view) {
    return views.get(view) ?? null;
  }

  function remember(view, decision) {
    views.set(view, Object.freeze({
      compatibilityKey: decision.compatibilityKey,
      contentKey: decision.contentKey,
    }));
    return decision;
  }

  function retainResource(view, key, resource, dispose = null) {
    const id = `${view}:${key}`;
    const previous = resources.get(id);
    if (previous && previous.resource !== resource) previous.dispose?.(previous.resource);
    resources.delete(id);
    resources.set(id, { view, resource, dispose });
    while (resources.size > limit) {
      const [oldestId, oldest] = resources.entries().next().value;
      resources.delete(oldestId);
      oldest.dispose?.(oldest.resource);
    }
    return resource;
  }

  function releaseView(view) {
    views.delete(view);
    for (const [id, entry] of resources) {
      if (entry.view !== view) continue;
      resources.delete(id);
      entry.dispose?.(entry.resource);
    }
  }

  return Object.freeze({
    evaluate(view, input = {}) {
      return selectWorldViewRefresh({ ...input, previous: getView(view) });
    },
    commit(view, decision) {
      if (!decision || typeof decision !== "object") throw new TypeError("A completed world-view cache decision is required.");
      return remember(view, decision);
    },
    decide(view, input = {}) {
      return remember(view, selectWorldViewRefresh({ ...input, previous: getView(view) }));
    },
    retainResource,
    getResource(view, key) {
      const id = `${view}:${key}`;
      const entry = resources.get(id);
      if (!entry) return null;
      resources.delete(id);
      resources.set(id, entry);
      return entry.resource;
    },
    releaseView,
    clear() {
      for (const view of [...views.keys()]) releaseView(view);
      for (const entry of resources.values()) entry.dispose?.(entry.resource);
      resources.clear();
    },
    snapshot() {
      return Object.freeze({ views: views.size, resources: resources.size });
    },
  });
}

export function rectanglesEqual(left = [], right = []) {
  return left.length === right.length && left.every((rectangle, index) => sameRectangle(rectangle, right[index]));
}
