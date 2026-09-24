import { createAStarPathfinder, createGridMap } from "@esengine/pathfinding";

export const CARDINAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }), Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }), Object.freeze({ x: -1, y: 0 }),
]);
export const NAVIGATION_SECTOR_SIZE = 16;

const sectorCaches = new WeakMap();
const cellKey = (cell) => `${cell.x},${cell.y}`;
const sectorKey = (cell) => `${Math.floor(cell.x / NAVIGATION_SECTOR_SIZE)},${Math.floor(cell.y / NAVIGATION_SECTOR_SIZE)}`;
const sameCell = (left, right) => left?.x === right?.x && left?.y === right?.y;
const freezeCell = (cell) => Object.freeze({ x: cell.x, y: cell.y });
const manhattan = (left, right) => Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
const octile = (left, right) => {
  const horizontal = Math.abs(left.x - right.x), vertical = Math.abs(left.y - right.y);
  return Math.max(horizontal, vertical) + (Math.SQRT2 - 1) * Math.min(horizontal, vertical);
};

function dimensions(world) {
  return { rows: world?.rows ?? world?.terrain?.length ?? 0, columns: world?.columns ?? world?.terrain?.[0]?.length ?? 0 };
}

function isWalkable(world, cell) {
  return Boolean(world?.terrain?.[cell.y]?.[cell.x]?.walkable);
}

function isCardinalPath(path) {
  return path.every((cell, index) => index === 0 || Math.abs(cell.x - path[index - 1].x) + Math.abs(cell.y - path[index - 1].y) === 1);
}

function sectorBounds(world, sector) {
  const [sectorX, sectorY] = sector.split(",").map(Number);
  const { rows, columns } = dimensions(world);
  return {
    minX: sectorX * NAVIGATION_SECTOR_SIZE,
    minY: sectorY * NAVIGATION_SECTOR_SIZE,
    maxX: Math.min(columns - 1, (sectorX + 1) * NAVIGATION_SECTOR_SIZE - 1),
    maxY: Math.min(rows - 1, (sectorY + 1) * NAVIGATION_SECTOR_SIZE - 1),
  };
}

function findPathInBounds(world, from, to, bounds, { isBlocked = () => false, isBlockedIndex = null } = {}) {
  if (!isWalkable(world, from) || !isWalkable(world, to)) return null;
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  const grid = createGridMap(width, height, { allowDiagonal: false });
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
    const cell = { x, y };
    const blocked = isBlockedIndex ? isBlockedIndex(x, y) : isBlocked(cell);
    grid.setWalkable(x - bounds.minX, y - bounds.minY, isWalkable(world, cell) && (!blocked || sameCell(cell, from) || sameCell(cell, to)));
  }
  const result = createAStarPathfinder(grid).findPath(from.x - bounds.minX, from.y - bounds.minY, to.x - bounds.minX, to.y - bounds.minY);
  const path = result?.path?.map((cell) => freezeCell({ x: cell.x + bounds.minX, y: cell.y + bounds.minY })) ?? [];
  return path.length && isCardinalPath(path) ? Object.freeze(path) : null;
}

function buildSectorGraph(world, revision = 0) {
  const cached = sectorCaches.get(world);
  if (cached?.revision === revision) return cached;
  const graph = new Map();
  const add = (from, to, exit) => {
    const edges = graph.get(from) ?? [];
    edges.push(Object.freeze({ to, exit: freezeCell(exit) }));
    graph.set(from, edges);
  };
  const { rows, columns } = dimensions(world);
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < columns; x += 1) {
    const cell = { x, y };
    if (!isWalkable(world, cell)) continue;
    for (const direction of CARDINAL_DIRECTIONS) {
      const next = { x: x + direction.x, y: y + direction.y };
      if (!isWalkable(world, next) || sectorKey(cell) === sectorKey(next)) continue;
      add(sectorKey(cell), sectorKey(next), cell);
    }
  }
  const value = Object.freeze({ revision, graph });
  sectorCaches.set(world, value);
  return value;
}

export class AStarUtility {
  // Matches the package's cardinal A* neighbor order and f-score heap behavior,
  // but creates records only for searched cells and can be stepped over frames.
  static createResumablePathSearch(world, from, to, { isBlocked = () => false } = {}) {
    const { rows, columns } = dimensions(world);
    const same = cell => sameCell(cell, from) || sameCell(cell, to);
    const walkable = cell => cell.x >= 0 && cell.x < columns && cell.y >= 0 && cell.y < rows
      && isWalkable(world, cell) && (!isBlocked(cell) || same(cell));
    const records = new Map();
    const heap = [];
    const get = (x, y) => {
      const id = y * columns + x;
      let record = records.get(id);
      if (!record) { record = { id, x, y, g: Infinity, h: 0, f: Infinity, parent: null, opened: false, closed: false, heapIndex: -1 }; records.set(id, record); }
      return record;
    };
    const bubbleUp = (index) => {
      const item = heap[index];
      while (index > 0) {
        const parentIndex = (index - 1) >> 1; const parent = heap[parentIndex];
        if (item.f >= parent.f) break;
        parent.heapIndex = index; heap[index] = parent; index = parentIndex;
      }
      item.heapIndex = index; heap[index] = item;
    };
    const sinkDown = (index) => {
      const length = heap.length; const item = heap[index]; const halfLength = length >> 1;
      while (index < halfLength) {
        const leftIndex = (index << 1) + 1, rightIndex = leftIndex + 1;
        let smallest = index, smallestItem = item;
        const left = heap[leftIndex];
        if (left.f < smallestItem.f) { smallest = leftIndex; smallestItem = left; }
        if (rightIndex < length) {
          const right = heap[rightIndex];
          if (right.f < smallestItem.f) { smallest = rightIndex; smallestItem = right; }
        }
        if (smallest === index) break;
        smallestItem.heapIndex = index; heap[index] = smallestItem; index = smallest;
      }
      item.heapIndex = index; heap[index] = item;
    };
    const push = record => { record.heapIndex = heap.length; heap.push(record); bubbleUp(heap.length - 1); };
    const pop = () => {
      const result = heap[0]; result.heapIndex = -1; const last = heap.pop();
      if (heap.length) { heap[0] = last; last.heapIndex = 0; sinkDown(0); }
      return result;
    };
    const update = record => { if (record.heapIndex >= 0 && heap[record.heapIndex] === record) { bubbleUp(record.heapIndex); sinkDown(record.heapIndex); } };
    let done = false, result = null, searched = 0;
    if (!walkable(from) || !walkable(to)) done = true;
    else {
      const start = get(from.x, from.y); start.g = 0; start.h = octile(from, to); start.f = start.h; start.opened = true; push(start);
    }
    const finish = end => {
      if (!end) { done = true; result = null; return; }
      const path = [];
      for (let current = end; current; current = current.parent) path.push(freezeCell(current));
      path.reverse(); done = true; result = Object.freeze(path);
    };
    return Object.freeze({
      step(maxNodes = 64) {
        if (done) return Object.freeze({ done: true, path: result, searched });
        let iterations = 0;
        while (heap.length && iterations < Math.max(1, Math.floor(maxNodes))) {
          const current = pop(); current.closed = true; searched += 1; iterations += 1;
          if (current.x === to.x && current.y === to.y) { finish(current); break; }
          for (const direction of CARDINAL_DIRECTIONS) {
            const x = current.x + direction.x, y = current.y + direction.y;
            const cell = { x, y };
            if (!walkable(cell)) continue;
            const neighbor = get(x, y);
            if (neighbor.closed) continue;
            const tentative = current.g + 1;
            if (!neighbor.opened) {
              neighbor.g = tentative; neighbor.h = octile(cell, to); neighbor.f = neighbor.g + neighbor.h;
              neighbor.parent = current; neighbor.opened = true; push(neighbor);
            } else if (tentative < neighbor.g) {
              neighbor.g = tentative; neighbor.f = neighbor.g + neighbor.h; neighbor.parent = current; update(neighbor);
            }
          }
        }
        if (!done && !heap.length) finish(null);
        return Object.freeze({ done, path: result, searched });
      },
      get done() { return done; },
      get searched() { return searched; },
    });
  }
  static createDistanceField(world, target, { isBlocked = () => false, isBlockedIndex = null, maxDistance = Number.POSITIVE_INFINITY } = {}) {
    const { rows, columns } = dimensions(world);
    // A bounded cardinal search cannot leave this square. Keep scratch storage
    // proportional to its reach, not to the containing realm.
    const radius = Number.isFinite(maxDistance) ? Math.max(0, Math.floor(maxDistance)) : Math.max(rows, columns);
    const minX = Math.max(0, target.x - radius), minY = Math.max(0, target.y - radius);
    const maxX = Math.min(columns - 1, target.x + radius), maxY = Math.min(rows - 1, target.y + radius);
    const width = Math.max(0, maxX - minX + 1), height = Math.max(0, maxY - minY + 1);
    const distances = new Int32Array(width * height);
    distances.fill(-1);
    const index = (cell) => (cell.y - minY) * width + cell.x - minX;
    const inBounds = cell => cell.x >= minX && cell.x <= maxX && cell.y >= minY && cell.y <= maxY;
    const blockers = isBlockedIndex ? new Int8Array(width * height).fill(-1) : null;
    const blockedAt = (cell) => {
      if (!isBlockedIndex) return isBlocked(cell);
      const cellIndex = index(cell);
      if (blockers[cellIndex] === -1) blockers[cellIndex] = isBlockedIndex(cell.x, cell.y) ? 1 : 0;
      return blockers[cellIndex] === 1;
    };
    if (!isWalkable(world, target)) return Object.freeze({ getDistance: () => -1 });
    const queue = [freezeCell(target)];
    distances[index(target)] = 0;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const cell = queue[cursor]; const distance = distances[index(cell)] + 1;
      if (distance > maxDistance) continue;
      for (const direction of CARDINAL_DIRECTIONS) {
        const next = { x: cell.x + direction.x, y: cell.y + direction.y };
        if (!inBounds(next)) continue;
        const blocked = blockedAt(next);
        if (!isWalkable(world, next) || distances[index(next)] !== -1 || (blocked && !sameCell(next, target))) continue;
        distances[index(next)] = distance; queue.push(freezeCell(next));
      }
    }
    return Object.freeze({ getDistance(cell) { return inBounds(cell) && isWalkable(world, cell) ? distances[index(cell)] : -1; } });
  }

  static findPath(world, from, to, { isBlocked = () => false, isBlockedIndex = null } = {}) {
    const { rows, columns } = dimensions(world);
    return findPathInBounds(world, from, to, { minX: 0, minY: 0, maxX: columns - 1, maxY: rows - 1 }, { isBlocked, isBlockedIndex });
  }

  static findNearest(world, from, candidates, options = {}) {
    const field = this.createDistanceField(world, from, options);
    const ranked = candidates
      .map((cell) => ({ cell, distance: field.getDistance(cell) }))
      .filter(({ distance }) => distance >= 0)
      .sort((left, right) => left.distance - right.distance || left.cell.y - right.cell.y || left.cell.x - right.cell.x);
    const candidate = ranked[0];
    if (!candidate) return null;
    const path = this.findPath(world, from, candidate.cell, options);
    return path ? Object.freeze({ cell: freezeCell(candidate.cell), path }) : null;
  }

  static findHierarchicalPath(world, from, to, { terrainRevision = 0, ...options } = {}) {
    const { graph } = buildSectorGraph(world, terrainRevision);
    const originSector = sectorKey(from);
    const targetSector = sectorKey(to);
    if (originSector === targetSector) {
      const path = this.findPath(world, from, to, options);
      return path ? Object.freeze({ path, nextCell: path[1] ?? null, sectorExit: freezeCell(path.at(-1)), coarse: false }) : null;
    }
    const reverse = new Map();
    for (const [sector, edges] of graph) for (const edge of edges) {
      const previous = reverse.get(edge.to) ?? [];
      previous.push(sector);
      reverse.set(edge.to, previous);
    }
    const reachableSectors = new Set([targetSector]);
    const queue = [targetSector];
    for (let cursor = 0; cursor < queue.length; cursor += 1) for (const sector of reverse.get(queue[cursor]) ?? []) {
      if (!reachableSectors.has(sector)) { reachableSectors.add(sector); queue.push(sector); }
    }
    const candidates = (graph.get(originSector) ?? [])
      .filter((edge) => reachableSectors.has(edge.to))
      .map((edge) => ({ edge, path: findPathInBounds(world, from, edge.exit, sectorBounds(world, originSector), options) }))
      .filter(({ path }) => path)
      .sort((left, right) => left.path.length - right.path.length || left.edge.exit.y - right.edge.exit.y || left.edge.exit.x - right.edge.exit.x);
    const candidate = candidates[0];
    if (!candidate) return null;
    return Object.freeze({
      path: candidate.path,
      nextCell: candidate.path[1] ?? null,
      sectorExit: freezeCell(candidate.edge.exit),
      coarse: true,
    });
  }

  static findRealmRoute({ from, to, worldFor, allowCrossRealm = false, pairedStairs = [], ...options }) {
    if (from.realm === to.realm) {
      const path = this.findPath(worldFor(from.realm), from.cell, to.cell, options);
      return path ? Object.freeze({ segments: Object.freeze([{ realm: from.realm, cells: path }]) }) : null;
    }
    if (!allowCrossRealm) return null;
    const stair = pairedStairs
      .map((cell) => ({ cell, path: this.findPath(worldFor(from.realm), from.cell, cell, options) }))
      .filter(({ path }) => path)
      .sort((left, right) => left.path.length - right.path.length)[0];
    if (!stair) return null;
    const destination = this.findPath(worldFor(to.realm), stair.cell, to.cell, options);
    if (!destination) return null;
    return Object.freeze({ segments: Object.freeze([
      Object.freeze({ realm: from.realm, cells: stair.path }),
      Object.freeze({ transition: "stairs", cell: freezeCell(stair.cell), fromRealm: from.realm, toRealm: to.realm }),
      Object.freeze({ realm: to.realm, cells: destination }),
    ]) });
  }
}
