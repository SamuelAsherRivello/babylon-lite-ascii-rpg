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

function dimensions(world) {
  return { rows: world?.rows ?? world?.terrain?.length ?? 0, columns: world?.columns ?? world?.terrain?.[0]?.length ?? 0 };
}

function isWalkable(world, cell) {
  return Boolean(world?.terrain?.[cell.y]?.[cell.x]?.walkable);
}

function isCardinalPath(path) {
  return path.every((cell, index) => index === 0 || Math.abs(cell.x - path[index - 1].x) + Math.abs(cell.y - path[index - 1].y) === 1);
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
  static createDistanceField(world, target, { isBlocked = () => false, isBlockedIndex = null, maxDistance = Number.POSITIVE_INFINITY } = {}) {
    const { rows, columns } = dimensions(world);
    const distances = new Int32Array(Math.max(0, rows * columns));
    distances.fill(-1);
    const index = (cell) => cell.y * columns + cell.x;
    if (!isWalkable(world, target)) return Object.freeze({ getDistance: () => -1 });
    const queue = [freezeCell(target)];
    distances[index(target)] = 0;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const cell = queue[cursor]; const distance = distances[index(cell)] + 1;
      if (distance > maxDistance) continue;
      for (const direction of CARDINAL_DIRECTIONS) {
        const next = { x: cell.x + direction.x, y: cell.y + direction.y };
        const blocked = isBlockedIndex ? isBlockedIndex(next.x, next.y) : isBlocked(next);
        if (!isWalkable(world, next) || distances[index(next)] !== -1 || (blocked && !sameCell(next, target))) continue;
        distances[index(next)] = distance; queue.push(freezeCell(next));
      }
    }
    return Object.freeze({ getDistance(cell) { return isWalkable(world, cell) ? distances[index(cell)] : -1; } });
  }

  static findPath(world, from, to, { isBlocked = () => false } = {}) {
    if (!isWalkable(world, from) || !isWalkable(world, to)) return null;
    const { rows, columns } = dimensions(world);
    const grid = createGridMap(columns, rows, { allowDiagonal: false });
    for (let y = 0; y < rows; y += 1) for (let x = 0; x < columns; x += 1) {
      const cell = { x, y };
      grid.setWalkable(x, y, isWalkable(world, cell) && (!isBlocked(cell) || sameCell(cell, from) || sameCell(cell, to)));
    }
    const result = createAStarPathfinder(grid).findPath(from.x, from.y, to.x, to.y);
    const path = result?.path?.map(freezeCell) ?? [];
    return path.length && isCardinalPath(path) ? Object.freeze(path) : null;
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
    buildSectorGraph(world, terrainRevision);
    const path = this.findPath(world, from, to, options);
    if (!path) return null;
    const originSector = sectorKey(from);
    const sectorExit = path.find((cell) => sectorKey(cell) !== originSector) ?? path.at(-1);
    return Object.freeze({ path, nextCell: path[1] ?? null, sectorExit: freezeCell(sectorExit), coarse: sectorKey(from) !== sectorKey(to) });
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
