export const WALL_GLYPH = "W";
export const FLOOR_GLYPH = "•";
export const PLAYER_GLYPH = "P";
export const TORCH_GLYPH = "T";
export const STAIR_GLYPH = "S";
export const MOUNTAIN_GLYPH = "M";
export const SHALLOW_WATER_GLYPH = "~";
export const MEDIUM_WATER_GLYPH = "≈";
export const DEEP_WATER_GLYPH = MEDIUM_WATER_GLYPH;
export const DEFAULT_WALL_FILL_PERCENT = 40;
export const DEFAULT_SMOOTHING_ITERATIONS = 4;
export const DEFAULT_MIN_WALKABLE_PERCENT = 0.3;
// Normal worlds always include water; callers can still explicitly request a dry world.
export const DEFAULT_WATER_FILL_PERCENT = 100;
export const MIN_WATER_LAKE_SIZE = 50;
export const MAX_WATER_LAKE_SIZE = 240;
export const OCCASIONAL_LARGE_WATER_LAKE_SIZE = 480;
export const MAX_GENERATION_ATTEMPTS = 64;
export const OBJECT_DISTRIBUTION_RULES = Object.freeze({
  torch: Object.freeze({ minimumDistance: 25 }),
});
export const GENERATION_PASSES = Object.freeze([
  "ground",
  "cave/walls",
  "water",
  "walkability",
  "player-position",
]);
export const REALM_PROFILES = Object.freeze({
  Overground: Object.freeze({ wallFillPercent: 25, minWalkablePercent: 0.55, groundKind: "grass", blockedKind: "mountain", blockedGlyph: MOUNTAIN_GLYPH }),
  Underground: Object.freeze({ wallFillPercent: 50, minWalkablePercent: 0.3, groundKind: "dirt", blockedKind: "wall", blockedGlyph: WALL_GLYPH }),
});

const CARDINAL_DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const TERRAIN_COLORS = Object.freeze({
  wall: "#f5f5f5",
  ground: "#f5f5f5",
  shallowWater: "#62c7ff",
  mediumWater: "#247fc3",
  deepWater: "#0b3d91",
});

export function getRandomSeedFromSearch(search) {
  const parameters = new URLSearchParams(search);
  return parameters.has("randomSeed") ? parameters.get("randomSeed") : undefined;
}

function assertDimensions(rows, columns) {
  if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 3 || columns < 3) {
    throw new RangeError("A generated world needs integer rows and columns of at least 3.");
  }
}

export function createGeneratedSeed() {
  const randomPart = Math.floor(Math.random() * 0x100000000).toString(36);
  return `${Date.now().toString(36)}-${randomPart}`;
}

function createRandom(seed) {
  let state = 2166136261;
  for (const character of String(seed)) {
    state ^= character.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createGrid(rows, columns, valueFactory) {
  const grid = new Array(rows);
  for (let y = 0; y < rows; y += 1) {
    const row = new Array(columns);
    for (let x = 0; x < columns; x += 1) row[x] = valueFactory(x, y);
    grid[y] = row;
  }
  return grid;
}

function isBorderCell(x, y, rows, columns) {
  return x === 0 || y === 0 || x === columns - 1 || y === rows - 1;
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function cellIndex(cell, columns) {
  return cell.y * columns + cell.x;
}

function countWalls(grid, x, y) {
  let count = 0;
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (grid[y + offsetY]?.[x + offsetX]) count += 1;
    }
  }
  return count;
}

function smoothGrid(grid, rows, columns) {
  return createGrid(rows, columns, (x, y) => {
    if (isBorderCell(x, y, rows, columns)) return true;
    return countWalls(grid, x, y) >= 5;
  });
}

function getRegion(grid, start, rows, columns, isBlocked, visited) {
  const region = [];
  const pending = [start];
  visited[start.y * columns + start.x] = 1;
  let pendingIndex = 0;

  while (pendingIndex < pending.length) {
    const cell = pending[pendingIndex];
    pendingIndex += 1;
    region.push(cell);
    for (const direction of CARDINAL_DIRECTIONS) {
      const next = { x: cell.x + direction.x, y: cell.y + direction.y };
      const index = next.y * columns + next.x;
      if (
        next.x > 0 && next.x < columns - 1 &&
        next.y > 0 && next.y < rows - 1 &&
        !isBlocked(next) && !visited[index]
      ) {
        visited[index] = 1;
        pending.push(next);
      }
    }
  }
  return region;
}

function getLargestRegion(grid, rows, columns, isBlocked = (cell) => grid[cell.y][cell.x]) {
  const visited = new Uint8Array(rows * columns);
  let largestRegion = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      const cell = { x, y };
      if (isBlocked(cell) || visited[y * columns + x]) continue;
      const region = getRegion(grid, cell, rows, columns, isBlocked, visited);
      if (region.length > largestRegion.length) largestRegion = region;
    }
  }
  return largestRegion;
}

function getCenterMostCell(region, rows, columns) {
  const centerX = (columns - 1) / 2;
  const centerY = (rows - 1) / 2;
  return region.reduce((closest, cell) => {
    const distance = Math.abs(cell.x - centerX) + Math.abs(cell.y - centerY);
    const closestDistance = Math.abs(closest.x - centerX) + Math.abs(closest.y - centerY);
    return distance < closestDistance ? cell : closest;
  });
}

function createGroundPass(rows, columns) {
  return createGrid(rows, columns, (x, y) => (isBorderCell(x, y, rows, columns) ? "wall" : "ground"));
}

function createCavePass({ rows, columns, wallFillPercent, smoothingIterations, random, ground }) {
  let walls = createGrid(rows, columns, (x, y) => {
    return ground[y][x] === "wall" || random() * 100 < wallFillPercent;
  });
  for (let iteration = 0; iteration < smoothingIterations; iteration += 1) {
    walls = smoothGrid(walls, rows, columns);
  }
  return walls;
}

function getCellNeighbors(cell, rows, columns) {
  return CARDINAL_DIRECTIONS
    .map((direction) => ({ x: cell.x + direction.x, y: cell.y + direction.y }))
    .filter((neighbor) => (
      neighbor.x > 0 && neighbor.x < columns - 1 &&
      neighbor.y > 0 && neighbor.y < rows - 1
    ));
}

function countSelectedNeighbors(key, selectedStamp, stamp, rows, columns) {
  const x = key % columns;
  const y = Math.floor(key / columns);
  let count = 0;
  if (y > 1 && selectedStamp[key - columns] === stamp) count += 1;
  if (x < columns - 2 && selectedStamp[key + 1] === stamp) count += 1;
  if (y < rows - 2 && selectedStamp[key + columns] === stamp) count += 1;
  if (x > 1 && selectedStamp[key - 1] === stamp) count += 1;
  return count;
}

function createLakeScratch(rows, columns) {
  const count = rows * columns;
  return {
    reserved: new Uint8Array(count),
    regionKeys: new Uint8Array(count),
    selectedStamp: new Uint32Array(count),
    frontierStamp: new Uint32Array(count),
    stamp: 0,
  };
}

function selectLakeCells(region, rows, columns, random, targetSize, scratch, preferredStart = null) {
  const { reserved, regionKeys, selectedStamp, frontierStamp } = scratch;
  let start = null;
  if (preferredStart && regionKeys[cellIndex(preferredStart, columns)] && !reserved[cellIndex(preferredStart, columns)]) {
    start = preferredStart;
  } else {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const candidate = region[Math.floor(random() * region.length)];
      if (!reserved[cellIndex(candidate, columns)]) {
        start = candidate;
        break;
      }
    }
  }
  if (!start) return [];

  const stamp = ++scratch.stamp;
  const selected = [cellIndex(start, columns)];
  selectedStamp[selected[0]] = stamp;
  const frontier = [];
  const addFrontier = (key) => {
    const x = key % columns;
    const y = Math.floor(key / columns);
    const neighbors = [
      y > 1 ? key - columns : -1,
      x < columns - 2 ? key + 1 : -1,
      y < rows - 2 ? key + columns : -1,
      x > 1 ? key - 1 : -1,
    ];
    for (const neighbor of neighbors) {
      if (
        neighbor >= 0 && regionKeys[neighbor] &&
        selectedStamp[neighbor] !== stamp &&
        !reserved[neighbor] &&
        frontierStamp[neighbor] !== stamp
      ) {
        frontierStamp[neighbor] = stamp;
        frontier.push(neighbor);
      }
    }
  };
  addFrontier(selected[0]);

  while (selected.length < targetSize && frontier.length > 0) {
    const sampleCount = Math.min(8, frontier.length);
    let selectedIndex = Math.floor(random() * frontier.length);
    let selectedScore = -1;
    for (let sample = 0; sample < sampleCount; sample += 1) {
      const candidateIndex = Math.floor(random() * frontier.length);
      const candidate = frontier[candidateIndex];
      const score = countSelectedNeighbors(candidate, selectedStamp, stamp, rows, columns) * 3 + random();
      if (score > selectedScore) {
        selectedScore = score;
        selectedIndex = candidateIndex;
      }
    }

    const next = frontier[selectedIndex];
    const nextKey = next;
    const last = frontier.pop();
    frontierStamp[nextKey] = 0;
    if (selectedIndex < frontier.length) {
      frontier[selectedIndex] = last;
    }
    selectedStamp[nextKey] = stamp;
    selected.push(nextKey);
    addFrontier(nextKey);
  }

  return selected.map((key) => {
    return { x: key % columns, y: Math.floor(key / columns) };
  });
}

function reserveLakeCells(lake, reserved, columns) {
  // Keep lakes independent in the data layer while allowing the aggregate
  // target to fill the available cave instead of consuming a second cell
  // for every water cell as a visual moat.
  for (const cell of lake) reserved[cellIndex(cell, columns)] = 1;
}

function getInteriorNeighborIndexes(key, rows, columns) {
  const x = key % columns;
  const y = Math.floor(key / columns);
  const neighbors = [];
  if (y > 1) neighbors.push(key - columns);
  if (x < columns - 2) neighbors.push(key + 1);
  if (y < rows - 2) neighbors.push(key + columns);
  if (x > 1) neighbors.push(key - 1);
  return neighbors;
}

function assignWaterDepths(waterCells, rows, columns) {
  if (waterCells.length === 0) return new Map();
  const waterKeys = new Set(waterCells.map((cell) => cellIndex(cell, columns)));
  const boundary = waterCells.map((cell) => cellIndex(cell, columns))
    .filter((key) => getInteriorNeighborIndexes(key, rows, columns)
      .some((neighbor) => !waterKeys.has(neighbor)));
  const distances = new Map(boundary.map((key) => [key, 0]));
  const pending = [...boundary];
  let pendingIndex = 0;
  while (pendingIndex < pending.length) {
    const cellKeyIndex = pending[pendingIndex];
    pendingIndex += 1;
    const distance = distances.get(cellKeyIndex);
    for (const key of getInteriorNeighborIndexes(cellKeyIndex, rows, columns)) {
      if (waterKeys.has(key) && !distances.has(key)) {
        distances.set(key, distance + 1);
        pending.push(key);
      }
    }
  }

  const center = getCenterMostCell(waterCells, rows, columns);
  const deepestDistance = Math.max(...distances.values());
  const ordered = [...waterCells].sort((left, right) => {
    const leftDepth = distances.get(cellIndex(left, columns)) ?? 0;
    const rightDepth = distances.get(cellIndex(right, columns)) ?? 0;
    const leftCenterDistance = Math.abs(left.x - center.x) + Math.abs(left.y - center.y);
    const rightCenterDistance = Math.abs(right.x - center.x) + Math.abs(right.y - center.y);
    return rightDepth - leftDepth
      || leftCenterDistance - rightCenterDistance
      || cellKey(left).localeCompare(cellKey(right));
  });
  const depths = new Map();
  if (deepestDistance >= 2) {
    ordered.forEach((cell) => {
      const distance = distances.get(cellIndex(cell, columns)) ?? 0;
      const depth = distance === deepestDistance
        ? "deep"
        : distance === deepestDistance - 1 ? "medium" : "shallow";
      depths.set(cellKey(cell), depth);
    });
  } else {
    // Very thin 5-20-cell lakes cannot express three literal graph-distance
    // rings. Keep their center deepest, make its immediate lake neighbors
    // middle depth, and leave any remaining boundary cells shallow.
    const deepKeys = new Set([cellIndex(ordered[0], columns)]);
    const mediumKeys = new Set(getInteriorNeighborIndexes(cellIndex(ordered[0], columns), rows, columns)
      .filter((key) => waterKeys.has(key)));
    ordered.forEach((cell) => {
      const key = cellIndex(cell, columns);
      const depth = deepKeys.has(key) ? "deep" : mediumKeys.has(key) ? "medium" : "shallow";
      depths.set(cellKey(cell), depth);
    });
  }
  return depths;
}

function getWaterLakeTargetSize(random, regionLength) {
  const upperBound = random() < 0.12 ? OCCASIONAL_LARGE_WATER_LAKE_SIZE : MAX_WATER_LAKE_SIZE;
  return Math.min(
    regionLength,
    MIN_WATER_LAKE_SIZE + Math.floor(random() * (upperBound - MIN_WATER_LAKE_SIZE + 1)),
  );
}

function getCenterPreferredStart(region, rows, columns) {
  if (region.length === 0) return null;
  return getCenterMostCell(region, rows, columns);
}

function createWaterPass({ region, rows, columns, random, waterFillPercent }) {
  if (region.length === 0 || random() * 100 >= waterFillPercent) return { depths: new Map(), lakes: [] };

  const lakes = [];
  const scratch = createLakeScratch(rows, columns);
  for (const cell of region) scratch.regionKeys[cellIndex(cell, columns)] = 1;
  let selectedCount = 0;
  let failedLakeAttempts = 0;
  const lakeCount = random() < 0.35 ? 2 : 1;
  let preferredStart = getCenterPreferredStart(region, rows, columns);

  while (lakes.length < lakeCount && failedLakeAttempts < 5000) {
    const targetSize = getWaterLakeTargetSize(random, region.length - selectedCount);
    if (targetSize < MIN_WATER_LAKE_SIZE) break;
    const lake = selectLakeCells(region, rows, columns, random, targetSize, scratch, preferredStart);
    if (lake.length < MIN_WATER_LAKE_SIZE) {
      failedLakeAttempts += 1;
      continue;
    }
    lakes.push(lake);
    selectedCount += lake.length;
    reserveLakeCells(lake, scratch.reserved, columns);
    preferredStart = null;
  }

  const depths = new Map();
  for (const lake of lakes) {
    for (const [key, depth] of assignWaterDepths(lake, rows, columns)) depths.set(key, depth);
  }
  return { depths, lakes };
}

function createWalkabilityPass(terrainKinds, rows, columns) {
  return createGrid(rows, columns, (x, y) => {
    if (isBorderCell(x, y, rows, columns)) return false;
    return terrainKinds[y][x] === "ground" || terrainKinds[y][x] === "shallowWater";
  });
}

function createTerrainCells(terrainKinds, walkability) {
  return terrainKinds.map((row, y) => row.map((kind, x) => {
    const glyph = {
      wall: WALL_GLYPH,
      ground: FLOOR_GLYPH,
      shallowWater: SHALLOW_WATER_GLYPH,
      mediumWater: MEDIUM_WATER_GLYPH,
      deepWater: DEEP_WATER_GLYPH,
    }[kind];
    return {
      kind,
      depth: kind.endsWith("Water") ? kind.replace("Water", "").toLowerCase() : null,
      glyph,
      walkable: walkability[y][x],
      color: TERRAIN_COLORS[kind],
      alpha: 1,
    };
  }));
}

function createCharacters(rows, columns, start, torchCells) {
  const characters = createGrid(rows, columns, () => null);
  for (const torch of torchCells) characters[torch.y][torch.x] = TORCH_GLYPH;
  characters[start.y][start.x] = PLAYER_GLYPH;
  return characters;
}

function isTorchCandidate(terrain, x, y, rows, columns, start) {
  if (!terrain[y][x].walkable || (x === start.x && y === start.y)) return false;
  return CARDINAL_DIRECTIONS.some(({ x: offsetX, y: offsetY }) => {
    const neighborX = x + offsetX;
    const neighborY = y + offsetY;
    return (
      neighborX >= 0 && neighborX < columns &&
      neighborY >= 0 && neighborY < rows &&
      !terrain[neighborY][neighborX].walkable
    );
  });
}

function getObjectDistributionRule(objectType) {
  const rule = OBJECT_DISTRIBUTION_RULES[objectType];
  if (!rule) throw new RangeError(`Cannot distribute an unknown object type: ${objectType}.`);
  return rule;
}

function collectObjectCandidates(objectType, terrain, start, rows, columns) {
  if (objectType !== "torch") throw new RangeError(`Cannot collect candidates for object type: ${objectType}.`);
  const candidates = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      if (isTorchCandidate(terrain, x, y, rows, columns, start)) candidates.push({ x, y });
    }
  }
  return candidates;
}

function isFarEnoughFromDistributedObjects(candidate, objects, minimumDistance) {
  const minimumDistanceSquared = minimumDistance ** 2;
  return objects.every((object) => {
    const distanceX = candidate.x - object.x;
    const distanceY = candidate.y - object.y;
    return distanceX ** 2 + distanceY ** 2 >= minimumDistanceSquared;
  });
}

function distributeObjectOfType(objectType, candidates, random, requestedCount) {
  const { minimumDistance } = getObjectDistributionRule(objectType);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  const distributedObjects = [];
  for (const candidate of candidates) {
    if (!isFarEnoughFromDistributedObjects(candidate, distributedObjects, minimumDistance)) continue;
    distributedObjects.push(candidate);
    if (distributedObjects.length === requestedCount) break;
  }
  return distributedObjects;
}

async function collectObjectCandidatesCooperative(objectType, terrain, start, rows, columns, checkpoint) {
  if (objectType !== "torch") throw new RangeError(`Cannot collect candidates for object type: ${objectType}.`);
  const candidates = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      if (isTorchCandidate(terrain, x, y, rows, columns, start)) candidates.push({ x, y });
    }
    const pause = checkpoint();
    if (pause) await pause;
  }
  return candidates;
}

async function distributeObjectOfTypeCooperative(objectType, candidates, random, requestedCount, checkpoint) {
  const { minimumDistance } = getObjectDistributionRule(objectType);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
    if ((index & 1023) === 0) {
      const pause = checkpoint();
      if (pause) await pause;
    }
  }
  const distributedObjects = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (isFarEnoughFromDistributedObjects(candidate, distributedObjects, minimumDistance)) {
      distributedObjects.push(candidate);
      if (distributedObjects.length === requestedCount) break;
    }
    if ((index & 1023) === 0) {
      const pause = checkpoint();
      if (pause) await pause;
    }
  }
  return distributedObjects;
}

function isSameCell(first, second) {
  return first.x === second.x && first.y === second.y;
}

export function createWorld({
  rows,
  columns,
  wallFillPercent = DEFAULT_WALL_FILL_PERCENT,
  smoothingIterations = DEFAULT_SMOOTHING_ITERATIONS,
  minWalkablePercent = DEFAULT_MIN_WALKABLE_PERCENT,
  waterFillPercent = DEFAULT_WATER_FILL_PERCENT,
  torchCount = 3,
  seed,
} = {}) {
  assertDimensions(rows, columns);
  if (wallFillPercent < 0 || wallFillPercent > 100) throw new RangeError("wallFillPercent must be between 0 and 100.");
  if (!Number.isInteger(smoothingIterations) || smoothingIterations < 0) throw new RangeError("smoothingIterations must be a non-negative integer.");
  if (minWalkablePercent <= 0 || minWalkablePercent > 1) throw new RangeError("minWalkablePercent must be greater than 0 and at most 1.");
  if (waterFillPercent < 0 || waterFillPercent > 100) throw new RangeError("waterFillPercent must be between 0 and 100.");
  if (!Number.isInteger(torchCount) || torchCount < 0) throw new RangeError("torchCount must be a non-negative integer.");

  const resolvedSeed = seed === undefined ? createGeneratedSeed() : seed;
  const random = createRandom(resolvedSeed);
  const interiorArea = (rows - 2) * (columns - 2);
  const minimumWalkableCells = Math.ceil(interiorArea * minWalkablePercent);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const ground = createGroundPass(rows, columns);
    const walls = createCavePass({ rows, columns, wallFillPercent, smoothingIterations, random, ground });
    const caveRegion = getLargestRegion(walls, rows, columns);
    if (caveRegion.length < minimumWalkableCells) continue;

    const caveRegionKeys = new Uint8Array(rows * columns);
    for (const cell of caveRegion) caveRegionKeys[cellIndex(cell, columns)] = 1;
    const terrainKinds = ground.map((row, y) => row.map((kind, x) => (
      walls[y][x] || !caveRegionKeys[y * columns + x] ? "wall" : kind
    )));
    const region = caveRegion.filter((cell) => terrainKinds[cell.y][cell.x] !== "wall");
    const waterPass = createWaterPass({ region, rows, columns, random, waterFillPercent });
    for (const [key, depth] of waterPass.depths) {
      const [x, y] = key.split(",").map(Number);
      terrainKinds[y][x] = `${depth}Water`;
    }

    const walkability = createWalkabilityPass(terrainKinds, rows, columns);
    const walkableRegion = getLargestRegion(walkability, rows, columns, (cell) => !walkability[cell.y][cell.x]);
    if (walkableRegion.length < minimumWalkableCells) continue;
    const walkableRegionKeys = new Uint8Array(rows * columns);
    for (const cell of walkableRegion) walkableRegionKeys[cellIndex(cell, columns)] = 1;
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < columns - 1; x += 1) {
        if (walkability[y][x] && !walkableRegionKeys[y * columns + x]) {
          terrainKinds[y][x] = "wall";
          walkability[y][x] = false;
        }
      }
    }

    const terrain = createTerrainCells(terrainKinds, walkability);
    const start = getCenterMostCell(walkableRegion, rows, columns);
    const torchCandidates = collectObjectCandidates("torch", terrain, start, rows, columns);
    const torchCells = distributeObjectOfType("torch", torchCandidates, random, torchCount);

    return {
      rows,
      columns,
      terrain,
      characters: createCharacters(rows, columns, start, torchCells),
      torches: torchCells,
      playerStart: start,
      generationPasses: [...GENERATION_PASSES],
      waterCells: [...waterPass.depths.keys()].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y, depth: terrain[y][x].depth };
      }),
      waterLakes: waterPass.lakes.map((lake) => lake.map((cell) => ({ ...cell }))),
      options: {
        wallFillPercent,
        smoothingIterations,
        minWalkablePercent,
        waterFillPercent,
        torchCount,
        seed: resolvedSeed,
      },
    };
  }

  throw new Error("Unable to generate a connected walkable world with the requested settings.");
}

function generationAbortError() {
  const error = new Error("World generation was cancelled.");
  error.name = "AbortError";
  return error;
}

export function createFrameCheckpoint({
  signal,
  sliceMs = 12,
  yieldToFrame = () => globalThis.scheduler?.yield?.() ?? new Promise((resolve) => setTimeout(resolve, 0)),
  onYield,
} = {}) {
  let sliceStart = performance.now();
  return () => {
    if (signal?.aborted) throw generationAbortError();
    if (performance.now() - sliceStart < sliceMs) return null;
    const waitingSince = performance.now();
    return Promise.resolve(yieldToFrame()).then(() => {
      if (signal?.aborted) throw generationAbortError();
      sliceStart = performance.now();
      onYield?.(sliceStart - waitingSince);
    });
  };
}

async function createGridCooperative(rows, columns, valueFactory, checkpoint) {
  const grid = new Array(rows);
  for (let y = 0; y < rows; y += 1) {
    const row = new Array(columns);
    for (let x = 0; x < columns; x += 1) row[x] = valueFactory(x, y);
    grid[y] = row;
    const pause = checkpoint();
    if (pause) await pause;
  }
  return grid;
}

async function getRegionCooperative(grid, start, rows, columns, isBlocked, visited, checkpoint) {
  const region = [];
  const pending = [start];
  visited[start.y * columns + start.x] = 1;
  let pendingIndex = 0;
  while (pendingIndex < pending.length) {
    const cell = pending[pendingIndex];
    pendingIndex += 1;
    region.push(cell);
    for (const direction of CARDINAL_DIRECTIONS) {
      const next = { x: cell.x + direction.x, y: cell.y + direction.y };
      const index = next.y * columns + next.x;
      if (
        next.x > 0 && next.x < columns - 1 &&
        next.y > 0 && next.y < rows - 1 &&
        !isBlocked(next) && !visited[index]
      ) {
        visited[index] = 1;
        pending.push(next);
      }
    }
    if ((pendingIndex & 1023) === 0) {
      const pause = checkpoint();
      if (pause) await pause;
    }
  }
  return region;
}

async function getLargestRegionCooperative(grid, rows, columns, isBlocked, checkpoint) {
  const visited = new Uint8Array(rows * columns);
  let largestRegion = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      const cell = { x, y };
      if (isBlocked(cell) || visited[y * columns + x]) continue;
      const region = await getRegionCooperative(grid, cell, rows, columns, isBlocked, visited, checkpoint);
      if (region.length > largestRegion.length) largestRegion = region;
    }
    const pause = checkpoint();
    if (pause) await pause;
  }
  return largestRegion;
}

async function createWaterPassCooperative({ region, rows, columns, random, waterFillPercent, checkpoint, markPhase }) {
  if (region.length === 0 || random() * 100 >= waterFillPercent) {
    markPhase("water-lakes");
    return { depths: new Map(), lakes: [] };
  }

  const lakes = [];
  const scratch = createLakeScratch(rows, columns);
  for (const cell of region) scratch.regionKeys[cellIndex(cell, columns)] = 1;
  let selectedCount = 0;
  let failedLakeAttempts = 0;
  const lakeCount = random() < 0.35 ? 2 : 1;
  let preferredStart = getCenterPreferredStart(region, rows, columns);
  while (lakes.length < lakeCount && failedLakeAttempts < 5000) {
    const targetSize = getWaterLakeTargetSize(random, region.length - selectedCount);
    if (targetSize < MIN_WATER_LAKE_SIZE) break;
    const lake = selectLakeCells(region, rows, columns, random, targetSize, scratch, preferredStart);
    if (lake.length < MIN_WATER_LAKE_SIZE) failedLakeAttempts += 1;
    else {
      lakes.push(lake);
      selectedCount += lake.length;
      reserveLakeCells(lake, scratch.reserved, columns);
      preferredStart = null;
    }
    const pause = checkpoint();
    if (pause) await pause;
  }
  markPhase("water-lakes");
  const depths = new Map();
  for (const lake of lakes) {
    for (const [key, depth] of assignWaterDepths(lake, rows, columns)) depths.set(key, depth);
    const pause = checkpoint();
    if (pause) await pause;
  }
  return { depths, lakes };
}

/** Complete-world runtime generator. Its checkpoints yield between bounded pieces
 * while the synchronous createWorld API remains available for deterministic callers. */
export async function createWorldCooperative({
  rows,
  columns,
  wallFillPercent = DEFAULT_WALL_FILL_PERCENT,
  smoothingIterations = DEFAULT_SMOOTHING_ITERATIONS,
  minWalkablePercent = DEFAULT_MIN_WALKABLE_PERCENT,
  waterFillPercent = DEFAULT_WATER_FILL_PERCENT,
  torchCount = 3,
  seed,
} = {}, scheduling = {}) {
  assertDimensions(rows, columns);
  if (wallFillPercent < 0 || wallFillPercent > 100) throw new RangeError("wallFillPercent must be between 0 and 100.");
  if (!Number.isInteger(smoothingIterations) || smoothingIterations < 0) throw new RangeError("smoothingIterations must be a non-negative integer.");
  if (minWalkablePercent <= 0 || minWalkablePercent > 1) throw new RangeError("minWalkablePercent must be greater than 0 and at most 1.");
  if (waterFillPercent < 0 || waterFillPercent > 100) throw new RangeError("waterFillPercent must be between 0 and 100.");
  if (!Number.isInteger(torchCount) || torchCount < 0) throw new RangeError("torchCount must be a non-negative integer.");

  const checkpoint = createFrameCheckpoint(scheduling);
  const markPhase = scheduling.onPhase ?? (() => {});
  const resolvedSeed = seed === undefined ? createGeneratedSeed() : seed;
  const random = createRandom(resolvedSeed);
  const minimumWalkableCells = Math.ceil((rows - 2) * (columns - 2) * minWalkablePercent);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const ground = await createGridCooperative(rows, columns, (x, y) => (
      isBorderCell(x, y, rows, columns) ? "wall" : "ground"
    ), checkpoint);
    let walls = await createGridCooperative(rows, columns, (x, y) => (
      ground[y][x] === "wall" || random() * 100 < wallFillPercent
    ), checkpoint);
    for (let iteration = 0; iteration < smoothingIterations; iteration += 1) {
      const previous = walls;
      walls = await createGridCooperative(rows, columns, (x, y) => (
        isBorderCell(x, y, rows, columns) ? true : countWalls(previous, x, y) >= 5
      ), checkpoint);
    }
    markPhase("cave");
    const caveRegion = await getLargestRegionCooperative(walls, rows, columns, (cell) => walls[cell.y][cell.x], checkpoint);
    if (caveRegion.length < minimumWalkableCells) continue;

    const caveRegionKeys = new Uint8Array(rows * columns);
    for (let index = 0; index < caveRegion.length; index += 1) {
      caveRegionKeys[cellIndex(caveRegion[index], columns)] = 1;
      if ((index & 1023) === 0) {
        const pause = checkpoint();
        if (pause) await pause;
      }
    }
    const terrainKinds = await createGridCooperative(rows, columns, (x, y) => (
      walls[y][x] || !caveRegionKeys[y * columns + x] ? "wall" : ground[y][x]
    ), checkpoint);
    markPhase("cave-region");
    const region = caveRegion.filter((cell) => terrainKinds[cell.y][cell.x] !== "wall");
    const waterPass = await createWaterPassCooperative({ region, rows, columns, random, waterFillPercent, checkpoint, markPhase });
    markPhase("water");
    let depthIndex = 0;
    for (const [key, depth] of waterPass.depths) {
      const [x, y] = key.split(",").map(Number);
      terrainKinds[y][x] = `${depth}Water`;
      depthIndex += 1;
      if ((depthIndex & 1023) === 0) {
        const pause = checkpoint();
        if (pause) await pause;
      }
    }
    let pause = checkpoint();
    if (pause) await pause;

    const walkability = await createGridCooperative(rows, columns, (x, y) => (
      !isBorderCell(x, y, rows, columns) &&
      (terrainKinds[y][x] === "ground" || terrainKinds[y][x] === "shallowWater")
    ), checkpoint);
    const walkableRegion = await getLargestRegionCooperative(
      walkability, rows, columns, (cell) => !walkability[cell.y][cell.x], checkpoint,
    );
    markPhase("walkability-region");
    if (walkableRegion.length < minimumWalkableCells) continue;
    const walkableRegionKeys = new Uint8Array(rows * columns);
    for (let index = 0; index < walkableRegion.length; index += 1) {
      walkableRegionKeys[cellIndex(walkableRegion[index], columns)] = 1;
      if ((index & 1023) === 0) {
        const pause = checkpoint();
        if (pause) await pause;
      }
    }
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < columns - 1; x += 1) {
        if (walkability[y][x] && !walkableRegionKeys[y * columns + x]) {
          terrainKinds[y][x] = "wall";
          walkability[y][x] = false;
        }
      }
      pause = checkpoint();
      if (pause) await pause;
    }

    const terrain = await createGridCooperative(rows, columns, (x, y) => {
      const kind = terrainKinds[y][x];
      return {
        kind,
        depth: kind.endsWith("Water") ? kind.replace("Water", "").toLowerCase() : null,
        glyph: {
          wall: WALL_GLYPH, ground: FLOOR_GLYPH, shallowWater: SHALLOW_WATER_GLYPH,
          mediumWater: MEDIUM_WATER_GLYPH, deepWater: DEEP_WATER_GLYPH,
        }[kind],
        walkable: walkability[y][x], color: TERRAIN_COLORS[kind], alpha: 1,
      };
    }, checkpoint);
    markPhase("terrain");
    const start = getCenterMostCell(walkableRegion, rows, columns);
    const torchCandidates = await collectObjectCandidatesCooperative("torch", terrain, start, rows, columns, checkpoint);
    const torchCells = await distributeObjectOfTypeCooperative("torch", torchCandidates, random, torchCount, checkpoint);
    const characters = await createGridCooperative(rows, columns, () => null, checkpoint);
    for (const torch of torchCells) characters[torch.y][torch.x] = TORCH_GLYPH;
    characters[start.y][start.x] = PLAYER_GLYPH;
    const waterCells = [];
    for (const [key] of waterPass.depths) {
      const [x, y] = key.split(",").map(Number);
      waterCells.push({ x, y, depth: terrain[y][x].depth });
      if ((waterCells.length & 1023) === 0) {
        pause = checkpoint();
        if (pause) await pause;
      }
    }
    markPhase("complete");
    if (scheduling.signal?.aborted) throw generationAbortError();
    return {
      rows, columns, terrain, characters, torches: torchCells, playerStart: start,
      generationPasses: [...GENERATION_PASSES], waterCells,
      waterLakes: waterPass.lakes.map((lake) => lake.map((cell) => ({ ...cell }))),
      options: { wallFillPercent, smoothingIterations, minWalkablePercent, waterFillPercent, torchCount, seed: resolvedSeed },
    };
  }
  throw new Error("Unable to generate a connected walkable world with the requested settings.");
}

export function getWorldCell(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return null;
  return world.terrain[cell.y][cell.x];
}

export function isWalkableCell(world, cell) {
  return Boolean(getWorldCell(world, cell)?.walkable);
}

export function setCharacter(world, cell, glyph = PLAYER_GLYPH) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return false;
  world.characters[cell.y][cell.x] = glyph;
  return true;
}

export function clearCharacter(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return false;
  const stair = world.stairs?.find((candidate) => isSameCell(candidate, cell));
  const torch = world.torches?.find((candidate) => isSameCell(candidate, cell));
  world.characters[cell.y][cell.x] = stair ? STAIR_GLYPH : torch ? TORCH_GLYPH : null;
  return true;
}

function applyRealmProfile(realm, name) {
  const profile = REALM_PROFILES[name];
  for (const row of realm.terrain) for (const cell of row) {
    if (cell.kind === "ground") { cell.kind = profile.groundKind; }
    if (cell.kind === "wall") { cell.kind = profile.blockedKind; cell.glyph = profile.blockedGlyph; }
  }
  realm.realm = name;
  realm.stairs = [];
  return realm;
}

function addPairedStairs(realms, stairCount, seed) {
  const [overground, underground] = [realms.Overground, realms.Underground];
  const candidates = [];
  for (let y = 1; y < overground.rows - 1; y += 1) for (let x = 1; x < overground.columns - 1; x += 1) {
    const cell = { x, y };
    if (!overground.terrain[y][x].walkable || !underground.terrain[y][x].walkable ||
      isSameCell(cell, overground.playerStart) || isSameCell(cell, underground.playerStart)) continue;
    if (overground.torches.some((torch) => isSameCell(torch, cell)) || underground.torches.some((torch) => isSameCell(torch, cell))) continue;
    candidates.push(cell);
  }
  const random = createRandom(`${seed}:stairs`);
  const stairs = distributeObjectOfType("torch", candidates, random, stairCount);
  for (const realm of Object.values(realms)) {
    realm.stairs = stairs.map((cell) => ({ ...cell }));
    for (const stair of realm.stairs) realm.characters[stair.y][stair.x] = STAIR_GLYPH;
  }
  return stairs;
}

export async function createWorldRealms({ rows, columns, torchCount = 3, seed = createGeneratedSeed(), initialRealm = "Overground" } = {}, scheduling = {}) {
  const realms = {};
  const realmOrder = initialRealm === "Underground" ? ["Underground", "Overground"] : ["Overground", "Underground"];
  for (const name of realmOrder) {
    const profile = REALM_PROFILES[name];
    const realm = await createWorldCooperative({ rows, columns, torchCount, seed: `${seed}:${name}`, wallFillPercent: profile.wallFillPercent, minWalkablePercent: profile.minWalkablePercent }, scheduling);
    realms[name] = applyRealmProfile(realm, name);
  }
  const stairs = addPairedStairs(realms, torchCount, seed);
  return { seed, realms, stairs };
}

export function getVisibleGlyph(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return null;
  return world.characters[cell.y][cell.x] ?? world.terrain[cell.y][cell.x].glyph;
}
