export const WALL_GLYPH = "▒";
export const FLOOR_GLYPH = "•";
export const UNDERGROUND_FLOOR_GLYPH = "●";
export const PLAYER_GLYPH = "👤";
export const ENEMY_GLYPH = "🕷️";
export const ENEMY_SPAWNER_GLYPH = "S";
export const NPC_GLYPH = "☺";
export const NPC_SPAWNER_GLYPH = "N";
export const TORCH_GLYPH = "🕯️";
export const FIREPLACE_GLYPH = "🔥";
export const GOLD_GLYPH = "💰";
export const HEALTH_GLYPH = "♥";
export const TRAP_GLYPH = "☠";
export const CLOSED_CHEST_GLYPH = "📦";
export const OPEN_CHEST_GLYPH = "🗃️";
export const STAIR_GLYPH = "▤";
export const KEY_GLYPH = "⚿";
export const HORIZONTAL_FENCE_GLYPH = "─";
export const VERTICAL_FENCE_GLYPH = "│";
export const CLOSED_VERTICAL_DOOR_GLYPH = "█";
export const OPEN_VERTICAL_DOOR_GLYPH = "□";
export const CLOSED_HORIZONTAL_DOOR_GLYPH = "█";
export const OPEN_HORIZONTAL_DOOR_GLYPH = "□";
export const MOUNTAIN_GLYPH = "△";
export const SHALLOW_WATER_GLYPH = "~";
export const MEDIUM_WATER_GLYPH = "≈";
export const DEEP_WATER_GLYPH = "▓";
// The complete glyph inventory used by the generated overground and
// underground maps, including terrain and map characters placed at client.
export const PROJECT_MAP_GLYPHS = Object.freeze([
  WALL_GLYPH,
  MOUNTAIN_GLYPH,
  FLOOR_GLYPH,
  UNDERGROUND_FLOOR_GLYPH,
  PLAYER_GLYPH,
  ENEMY_GLYPH,
  ENEMY_SPAWNER_GLYPH,
  NPC_GLYPH,
  NPC_SPAWNER_GLYPH,
  TORCH_GLYPH,
  FIREPLACE_GLYPH,
  STAIR_GLYPH,
  GOLD_GLYPH,
  SHALLOW_WATER_GLYPH,
  MEDIUM_WATER_GLYPH,
  DEEP_WATER_GLYPH,
  HEALTH_GLYPH,
  TRAP_GLYPH,
  CLOSED_CHEST_GLYPH,
  OPEN_CHEST_GLYPH,
  KEY_GLYPH,
  HORIZONTAL_FENCE_GLYPH,
  VERTICAL_FENCE_GLYPH,
  CLOSED_VERTICAL_DOOR_GLYPH,
  OPEN_VERTICAL_DOOR_GLYPH,
  CLOSED_HORIZONTAL_DOOR_GLYPH,
  OPEN_HORIZONTAL_DOOR_GLYPH,
]);
export const DEFAULT_WALL_FILL_PERCENT = 40;
export const DEFAULT_SMOOTHING_ITERATIONS = 4;
export const DEFAULT_MIN_WALKABLE_PERCENT = 0.3;
// Normal worlds always include water; callers can still explicitly request a dry world.
export const DEFAULT_WATER_FILL_PERCENT = 30;
export const MIN_WATER_LAKE_SIZE = 50;
export const MAX_WATER_LAKE_SIZE = 240;
export const OCCASIONAL_LARGE_WATER_LAKE_SIZE = 480;
export const MAX_GENERATION_ATTEMPTS = 64;
export const OBJECT_DISTRIBUTION_RULES = Object.freeze({
  torch: Object.freeze({ minimumDistance: 25 }),
});
export const GENERATION_PASSES = Object.freeze(GENERATION_FEATURES.map((feature) => feature.id));
export const REALM_PROFILES = Object.freeze({
  Overground: Object.freeze({ wallFillPercent: 25, minWalkablePercent: 0.55, fogUnclearRadius: 11, startingFogClearCoverage: Object.freeze({ x: 0.95, y: 0.95 }), groundKind: "grass", groundGlyph: FLOOR_GLYPH, groundColor: "#55aa55", blockedKind: "mountain", blockedGlyph: MOUNTAIN_GLYPH }),
  Underground: Object.freeze({ wallFillPercent: 50, minWalkablePercent: 0.3, fogUnclearRadius: 6, startingFogClearCoverage: Object.freeze({ x: 0.6, y: 0.6 }), groundKind: "dirt", groundGlyph: UNDERGROUND_FLOOR_GLYPH, groundColor: "#8b5a2b", blockedKind: "wall", blockedGlyph: WALL_GLYPH }),
});

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

export function getWorldGenerationLayersEnabledFromSearch(search) {
  const value = new URLSearchParams(search).get("worldGenerationLayersEnabled");
  if (value === null) return undefined;
  const layers = [...new Set(value.split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((layer) => Number.isInteger(layer) && layer > 0))];
  return layers.length ? Object.freeze(layers) : undefined;
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

export function createRandom(seed) {
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

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function cellIndex(cell, columns) {
  return cell.y * columns + cell.x;
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
  const waterKeys = new Uint8Array(rows * columns);
  const distances = new Int32Array(rows * columns);
  distances.fill(-1);
  const pending = new Uint32Array(waterCells.length);
  let pendingLength = 0;
  for (const cell of waterCells) waterKeys[cellIndex(cell, columns)] = 1;
  for (const cell of waterCells) {
    const key = cellIndex(cell, columns);
    if (getInteriorNeighborIndexes(key, rows, columns).some((neighbor) => !waterKeys[neighbor])) {
      distances[key] = 0;
      pending[pendingLength] = key;
      pendingLength += 1;
    }
  }
  let pendingIndex = 0;
  while (pendingIndex < pendingLength) {
    const cellKeyIndex = pending[pendingIndex];
    pendingIndex += 1;
    const distance = distances[cellKeyIndex];
    for (const key of getInteriorNeighborIndexes(cellKeyIndex, rows, columns)) {
      if (waterKeys[key] && distances[key] < 0) {
        distances[key] = distance + 1;
        pending[pendingLength] = key;
        pendingLength += 1;
      }
    }
  }

  const center = getCenterMostCell(waterCells, rows, columns);
  let deepestDistance = 0;
  for (const cell of waterCells) deepestDistance = Math.max(deepestDistance, distances[cellIndex(cell, columns)]);
  const ordered = [...waterCells].sort((left, right) => {
    const leftDepth = distances[cellIndex(left, columns)];
    const rightDepth = distances[cellIndex(right, columns)];
    const leftCenterDistance = Math.abs(left.x - center.x) + Math.abs(left.y - center.y);
    const rightCenterDistance = Math.abs(right.x - center.x) + Math.abs(right.y - center.y);
    return rightDepth - leftDepth
      || leftCenterDistance - rightCenterDistance
      || cellKey(left).localeCompare(cellKey(right));
  });
  const depths = new Map();
  if (deepestDistance >= 2) {
    ordered.forEach((cell) => {
      const distance = distances[cellIndex(cell, columns)];
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
      .filter((key) => waterKeys[key]));
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
  waterLakeCount,
  torchCount = 3,
  seed,
  playerStartMode = "center",
  caveEnabled = true,
  waterEnabled = true,
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
    const walls = createCavePass({ rows, columns, wallFillPercent, smoothingIterations, random, ground, caveEnabled });
    const caveRegion = getLargestRegion(walls, rows, columns);
    if (caveRegion.length < minimumWalkableCells) continue;

    const caveRegionKeys = new Uint8Array(rows * columns);
    for (const cell of caveRegion) caveRegionKeys[cellIndex(cell, columns)] = 1;
    const terrainKinds = ground.map((row, y) => row.map((kind, x) => (
      walls[y][x] || !caveRegionKeys[y * columns + x] ? "wall" : kind
    )));
    const region = caveRegion.filter((cell) => terrainKinds[cell.y][cell.x] !== "wall");
    const waterPass = waterEnabled
      ? createWaterPassLayer({ region, rows, columns, random, waterFillPercent, waterLakeCount })
      : { depths: new Map(), lakes: [] };
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
    const start = playerStartMode === "broad"
      ? walkableRegion[Math.floor(random() * walkableRegion.length)]
      : getCenterMostCell(walkableRegion, rows, columns);
    const torchCandidates = torchCount > 0 ? collectObjectCandidatesLayer("torch", terrain, start, rows, columns, CARDINAL_DIRECTIONS) : [];
    const torchCells = distributeObjectOfTypeLayer("torch", torchCandidates, random, torchCount, OBJECT_DISTRIBUTION_RULES);

    return {
      rows,
      columns,
      terrain,
      characters: createCharactersLayer(rows, columns, start, torchCells, PLAYER_GLYPH, TORCH_GLYPH),
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
        caveEnabled,
        waterEnabled,
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

async function getRegionCooperative(grid, start, rows, columns, isBlocked, visited, checkpoint, pending) {
  const region = [];
  pending[0] = start.y * columns + start.x;
  let pendingLength = 1;
  const next = { x: 0, y: 0 };
  visited[start.y * columns + start.x] = 1;
  let pendingIndex = 0;
  while (pendingIndex < pendingLength) {
    const key = pending[pendingIndex];
    const cell = { x: key % columns, y: Math.floor(key / columns) };
    pendingIndex += 1;
    region.push(cell);
    for (const direction of CARDINAL_DIRECTIONS) {
      next.x = cell.x + direction.x;
      next.y = cell.y + direction.y;
      const index = next.y * columns + next.x;
      if (
        next.x > 0 && next.x < columns - 1 &&
        next.y > 0 && next.y < rows - 1 &&
        !visited[index] && !isBlocked(next)
      ) {
        visited[index] = 1;
        pending[pendingLength++] = index;
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
  const pending = new Uint32Array(rows * columns);
  let largestRegion = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      const cell = { x, y };
      if (isBlocked(cell) || visited[y * columns + x]) continue;
      const region = await getRegionCooperative(grid, cell, rows, columns, isBlocked, visited, checkpoint, pending);
      if (region.length > largestRegion.length) largestRegion = region;
    }
    const pause = checkpoint();
    if (pause) await pause;
  }
  return largestRegion;
}

async function createWaterPassCooperative({ region, rows, columns, random, waterFillPercent, waterLakeCount, checkpoint, markPhase }) {
  const waterPass = createWaterPassLayer({ region, rows, columns, random, waterFillPercent, waterLakeCount });
  markPhase("water-lakes");
  const pause = checkpoint();
  if (pause) await pause;
  return waterPass;
}

/** Complete-world client generator. Its checkpoints yield between bounded pieces
 * while the synchronous createWorld API remains available for deterministic callers. */
export async function createWorldCooperative({
  rows,
  columns,
  wallFillPercent = DEFAULT_WALL_FILL_PERCENT,
  smoothingIterations = DEFAULT_SMOOTHING_ITERATIONS,
  minWalkablePercent = DEFAULT_MIN_WALKABLE_PERCENT,
  waterFillPercent = DEFAULT_WATER_FILL_PERCENT,
  waterLakeCount,
  torchCount = 3,
  seed,
  caveEnabled = true,
  waterEnabled = true,
} = {}, scheduling = {}) {
  assertDimensions(rows, columns);
  if (wallFillPercent < 0 || wallFillPercent > 100) throw new RangeError("wallFillPercent must be between 0 and 100.");
  if (!Number.isInteger(smoothingIterations) || smoothingIterations < 0) throw new RangeError("smoothingIterations must be a non-negative integer.");
  if (minWalkablePercent <= 0 || minWalkablePercent > 1) throw new RangeError("minWalkablePercent must be greater than 0 and at most 1.");
  if (waterFillPercent < 0 || waterFillPercent > 100) throw new RangeError("waterFillPercent must be between 0 and 100.");
  if (!Number.isInteger(torchCount) || torchCount < 0) throw new RangeError("torchCount must be a non-negative integer.");

  const checkpoint = createFrameCheckpoint(scheduling);
  const markPhase = scheduling.onPhase ?? (() => {});
  const markAttempt = scheduling.onAttempt ?? (() => {});
  const resolvedSeed = seed === undefined ? createGeneratedSeed() : seed;
  const random = createRandom(resolvedSeed);
  const minimumWalkableCells = Math.ceil((rows - 2) * (columns - 2) * minWalkablePercent);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    markAttempt(attempt + 1);
    const ground = await createGridCooperative(rows, columns, (x, y) => (
      isBorderCell(x, y, rows, columns) ? "wall" : "ground"
    ), checkpoint);
    let walls = await createGridCooperative(rows, columns, (x, y) => (
      ground[y][x] === "wall" || (caveEnabled && random() * 100 < wallFillPercent)
    ), checkpoint);
    let nextWalls = Array.from({ length: rows }, () => new Uint8Array(columns));
    for (let iteration = 0; caveEnabled && iteration < smoothingIterations; iteration += 1) {
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) nextWalls[y][x] = isBorderCell(x, y, rows, columns) || countWalls(walls, x, y) >= 5;
        const pause = checkpoint();
        if (pause) await pause;
      }
      [walls, nextWalls] = [nextWalls, walls];
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
    const waterPass = waterEnabled
      ? await createWaterPassCooperative({ region, rows, columns, random, waterFillPercent, waterLakeCount, checkpoint, markPhase })
      : { depths: new Map(), lakes: [] };
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
    const torchCandidates = torchCount > 0 ? collectObjectCandidatesLayer("torch", terrain, start, rows, columns, CARDINAL_DIRECTIONS) : [];
    pause = checkpoint();
    if (pause) await pause;
    const torchCells = distributeObjectOfTypeLayer("torch", torchCandidates, random, torchCount, OBJECT_DISTRIBUTION_RULES);
    const characters = createCharactersLayer(rows, columns, start, torchCells, PLAYER_GLYPH, TORCH_GLYPH);
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
      options: { wallFillPercent, smoothingIterations, minWalkablePercent, waterFillPercent, torchCount, seed: resolvedSeed, caveEnabled, waterEnabled },
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
  const object = world.objects?.find((candidate) => candidate.active && isSameCell(candidate.cell, cell));
  const pickup = world.pickups?.find((candidate) => candidate.active && isSameCell(candidate.cell, cell));
  world.characters[cell.y][cell.x] = stair ? STAIR_GLYPH : torch ? TORCH_GLYPH : object?.glyph ?? pickup?.glyph ?? null;
  return true;
}

export function normalizePlayerMarkers(world) {
  if (!world?.characters) return 0;
  let cleared = 0;
  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.columns; x += 1) {
      if (world.characters[y][x] !== PLAYER_GLYPH) continue;
      clearCharacter(world, { x, y });
      cleared += 1;
    }
  }
  return cleared;
}

function applyRealmProfile(realm, name) {
  const profile = REALM_PROFILES[name];
  for (let y = 0; y < realm.terrain.length; y += 1) for (let x = 0; x < realm.terrain[y].length; x += 1) {
    const cell = realm.terrain[y][x];
    if (cell.kind === "ground") {
      cell.kind = profile.groundKind;
      cell.glyph = profile.groundGlyph;
      cell.color = profile.groundColor;
    }
    if (cell.kind === "wall") {
      cell.kind = profile.blockedKind;
      cell.glyph = name === "Overground" && (x === 0 || y === 0 || x === realm.columns - 1 || y === realm.rows - 1)
        ? WALL_GLYPH
        : profile.blockedGlyph;
      if (name === "Overground" && cell.glyph !== WALL_GLYPH) {
        cell.health = 100;
        cell.maxHealth = 100;
      }
    }
  }
  realm.realm = name;
  realm.fogUnclearRadius = profile.fogUnclearRadius;
  realm.startingFogClearCoverage = profile.startingFogClearCoverage;
  realm.stairs = [];
  return realm;
}

export async function createWorldRealms({ rows, columns, torchCount = 3, stairCount = torchCount, seed = createGeneratedSeed(), initialRealm = "Overground", wallFillPercents, wallFillOffset = 0, smoothingIterationsByRealm, waterFillPercent = DEFAULT_WATER_FILL_PERCENT, waterLakeCount, minWalkableMultiplier = 1, playerStartMode = "center", caveEnabledByRealm, waterEnabled = true } = {}, scheduling = {}) {
  if (!Number.isInteger(stairCount) || stairCount < 0) throw new RangeError("stairCount must be a non-negative integer.");
  const realms = {};
  const realmOrder = initialRealm === "Underground" ? ["Underground", "Overground"] : ["Overground", "Underground"];
  for (const name of realmOrder) {
    const profile = REALM_PROFILES[name];
    const realmScheduling = {
      ...scheduling,
      onPhase: (phase) => scheduling.onPhase?.(Object.freeze({ realm: name, phase })),
      onAttempt: (attempt) => scheduling.onAttempt?.(Object.freeze({ realm: name, attempt })),
      onYield: (waitMs) => scheduling.onYield?.(Object.freeze({ realm: name, waitMs })),
    };
    const realm = await createWorldCooperative({
      rows, columns, torchCount, seed: `${seed}:${name}`,
      wallFillPercent: Math.min(100, Math.max(0, (wallFillPercents?.[name] ?? profile.wallFillPercent) + wallFillOffset)),
      smoothingIterations: smoothingIterationsByRealm?.[name] ?? DEFAULT_SMOOTHING_ITERATIONS,
      minWalkablePercent: Math.min(0.95, Math.max(0.05, profile.minWalkablePercent * minWalkableMultiplier)),
      waterFillPercent,
      waterLakeCount,
      playerStartMode,
      caveEnabled: caveEnabledByRealm?.[name] !== false,
      waterEnabled,
    }, realmScheduling);
    realms[name] = applyRealmProfile(realm, name);
  }
  const stairs = addPairedStairsLayer(realms, stairCount, seed, createRandom, distributeObjectOfTypeLayer, OBJECT_DISTRIBUTION_RULES, STAIR_GLYPH);
  return { seed, realms, stairs };
}

export function getVisibleGlyph(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return null;
  return world.characters[cell.y][cell.x] ?? world.terrain[cell.y][cell.x].glyph;
}
import { GENERATION_FEATURES } from "../generation-layers/generation-layer-registry.js";
import {
  CARDINAL_DIRECTIONS,
  countWalls,
  createCavePass,
  createGrid,
  createGroundPass,
  isBorderCell,
  smoothGrid,
} from "../generation-layers/grid-generation-layer.js";
import { createWalkabilityPass } from "../generation-layers/walkability-generation-layer.js";
import { createWaterPass as createWaterPassLayer } from "../generation-layers/water-generation-layer.js";
import { createCharacters as createCharactersLayer } from "../generation-layers/player-start-generation-layer.js";
import { collectObjectCandidates as collectObjectCandidatesLayer, distributeObjectOfType as distributeObjectOfTypeLayer } from "../generation-layers/object-generation-layer.js";
import { addPairedStairs as addPairedStairsLayer } from "../generation-layers/civilization-generation-layer.js";
