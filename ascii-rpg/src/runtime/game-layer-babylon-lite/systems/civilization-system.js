export const HORIZONTAL_FENCE_GLYPH = "─";
export const VERTICAL_FENCE_GLYPH = "│";
export const CLOSED_VERTICAL_DOOR_GLYPH = "█";
export const OPEN_VERTICAL_DOOR_GLYPH = "□";
export const CLOSED_HORIZONTAL_DOOR_GLYPH = "█";
export const OPEN_HORIZONTAL_DOOR_GLYPH = "□";
export const KEY_GLYPH = "⚿";
export const PLAYER_GLYPH = "🤺";
export const CIVILIZATION_SCREEN_COLUMNS = 64;
export const CIVILIZATION_SCREEN_ROWS = 36;
export const CIVILIZATION_SCREEN_CHANCE = 0.1;
export const CIVILIZATION_KEY_MIN_DISTANCE = 5;
export const CIVILIZATION_KEY_MAX_DISTANCE = 10;

const CARDINAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }),
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: -1, y: 0 }),
]);

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function sameCell(left, right) {
  return left?.x === right?.x && left?.y === right?.y;
}

function inWorld(world, cell) {
  return cell.x >= 1 && cell.y >= 1 && cell.x < world.columns - 1 && cell.y < world.rows - 1;
}

function isWalkable(world, cell) {
  return Boolean(world?.terrain?.[cell.y]?.[cell.x]?.walkable);
}

function isReserved(world, cell, reserved) {
    return reserved.has(cellKey(cell))
    || sameCell(world.playerStart, cell)
    || world.characters?.[cell.y]?.[cell.x] === PLAYER_GLYPH
    || world.objects?.some((object) => object.active !== false && sameCell(object.cell, cell));
}

function createScreenRegions(world, screenColumns, screenRows) {
  const regions = [];
  for (let y = 1; y < world.rows - 1; y += screenRows) {
    for (let x = 1; x < world.columns - 1; x += screenColumns) {
      regions.push({
        x,
        y,
        width: Math.min(screenColumns, world.columns - 1 - x),
        height: Math.min(screenRows, world.rows - 1 - y),
      });
    }
  }
  return regions;
}

function candidateIsInRegion(candidate, region) {
  return candidate.door.x >= region.x
    && candidate.door.x < region.x + region.width
    && candidate.door.y >= region.y
    && candidate.door.y < region.y + region.height;
}

function collectRuns(world, orientation, region) {
  const runs = [];
  if (orientation === "horizontal") {
    for (let y = 1; y < world.rows - 1; y += 1) {
      let x = 1;
      while (x < world.columns - 1) {
        if (!isWalkable(world, { x, y })) {
          x += 1;
          continue;
        }
        const start = x;
        while (x < world.columns - 1 && isWalkable(world, { x, y })) x += 1;
        const end = x - 1;
        const length = end - start + 1;
        if (length >= 3 && length <= 10
          && !isWalkable(world, { x: start - 1, y })
          && !isWalkable(world, { x: end + 1, y })) {
          const cells = Array.from({ length }, (_, index) => ({ x: start + index, y }));
          runs.push({ orientation, cells, door: cells[Math.floor(length / 2)] });
        }
      }
    }
  } else {
    for (let x = 1; x < world.columns - 1; x += 1) {
      let y = 1;
      while (y < world.rows - 1) {
        if (!isWalkable(world, { x, y })) {
          y += 1;
          continue;
        }
        const start = y;
        while (y < world.rows - 1 && isWalkable(world, { x, y })) y += 1;
        const end = y - 1;
        const length = end - start + 1;
        if (length >= 3 && length <= 10
          && !isWalkable(world, { x, y: start - 1 })
          && !isWalkable(world, { x, y: end + 1 })) {
          const cells = Array.from({ length }, (_, index) => ({ x, y: start + index }));
          runs.push({ orientation, cells, door: cells[Math.floor(length / 2)] });
        }
      }
    }
  }
  return runs.filter((candidate) => candidateIsInRegion(candidate, region));
}

function getSide(cell, orientation, door) {
  if (orientation === "horizontal") return cell.y < door.y ? "before" : cell.y > door.y ? "after" : null;
  return cell.x < door.x ? "before" : cell.x > door.x ? "after" : null;
}

function getKeyCandidates(world, candidate, reserved) {
  const candidates = { before: [], after: [] };
  for (let y = Math.max(1, candidate.door.y - CIVILIZATION_KEY_MAX_DISTANCE); y <= Math.min(world.rows - 2, candidate.door.y + CIVILIZATION_KEY_MAX_DISTANCE); y += 1) {
    for (let x = Math.max(1, candidate.door.x - CIVILIZATION_KEY_MAX_DISTANCE); x <= Math.min(world.columns - 2, candidate.door.x + CIVILIZATION_KEY_MAX_DISTANCE); x += 1) {
      const cell = { x, y };
      const distance = Math.abs(x - candidate.door.x) + Math.abs(y - candidate.door.y);
      const side = getSide(cell, candidate.orientation, candidate.door);
      if (!side || distance < CIVILIZATION_KEY_MIN_DISTANCE || distance > CIVILIZATION_KEY_MAX_DISTANCE || !isWalkable(world, cell)
        || candidate.cells.some((barrierCell) => sameCell(barrierCell, cell))
        || isReserved(world, cell, reserved)) continue;
      candidates[side].push({ ...cell, distance });
    }
  }
  return candidates;
}

function hasNoOverlap(candidate, reserved) {
  return candidate.cells.every((cell) => !reserved.has(cellKey(cell)));
}

export function findCivilizationCandidates(world, region, reserved = new Set()) {
  if (!world?.terrain || !region) return [];
  return [
    ...collectRuns(world, "horizontal", region),
    ...collectRuns(world, "vertical", region),
  ].filter((candidate) => hasNoOverlap(candidate, reserved));
}

export function createCivilizationGroups(world, {
  random = Math.random,
  chance = CIVILIZATION_SCREEN_CHANCE,
  screenColumns = CIVILIZATION_SCREEN_COLUMNS,
  screenRows = CIVILIZATION_SCREEN_ROWS,
  reserved = new Set(),
} = {}) {
  if (!world?.terrain) return [];
  const groups = [];
  const occupied = new Set(reserved);
  for (const region of createScreenRegions(world, screenColumns, screenRows)) {
    if (random() >= chance) continue;
    const candidates = findCivilizationCandidates(world, region, occupied);
    if (candidates.length === 0) continue;
    const candidate = candidates[Math.floor(random() * candidates.length)];
    if (!candidate) continue;
    const keyCandidates = getKeyCandidates(world, candidate, occupied);
    if (keyCandidates.before.length === 0 || keyCandidates.after.length === 0) continue;
    const keys = [keyCandidates.before, keyCandidates.after].map((sideCandidates) => {
      const index = Math.min(sideCandidates.length - 1, Math.floor(random() * sideCandidates.length));
      const { x, y } = sideCandidates[index];
      return { x, y };
    });
    const cells = candidate.cells.map((cell) => ({ ...cell }));
    const group = Object.freeze({
      orientation: candidate.orientation,
      cells: Object.freeze(cells),
      door: Object.freeze({ ...candidate.door }),
      keys: Object.freeze(keys.map((cell) => Object.freeze(cell))),
    });
    groups.push(group);
    for (const cell of [...cells, ...keys]) occupied.add(cellKey(cell));
  }
  return Object.freeze(groups);
}

export function isCardinalDirection(direction) {
  return Boolean(direction) && (direction.x === 0) !== (direction.y === 0);
}

export function getCivilizationGlyph(type, orientation, open = false) {
  if (type === "key") return KEY_GLYPH;
  if (type === "fence") return orientation === "horizontal" ? HORIZONTAL_FENCE_GLYPH : VERTICAL_FENCE_GLYPH;
  if (orientation === "horizontal") return open ? OPEN_HORIZONTAL_DOOR_GLYPH : CLOSED_HORIZONTAL_DOOR_GLYPH;
  return open ? OPEN_VERTICAL_DOOR_GLYPH : CLOSED_VERTICAL_DOOR_GLYPH;
}

export function getCivilizationDirections() {
  return CARDINAL_DIRECTIONS;
}
