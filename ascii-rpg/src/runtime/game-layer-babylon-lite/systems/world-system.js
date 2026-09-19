export const WALL_GLYPH = "W";
export const FLOOR_GLYPH = "•";
export const PLAYER_GLYPH = "P";
export const TORCH_GLYPH = "T";
export const SHALLOW_WATER_GLYPH = "~";
export const MEDIUM_WATER_GLYPH = "≈";
export const DEEP_WATER_GLYPH = "▓";
export const DEFAULT_WALL_FILL_PERCENT = 40;
export const DEFAULT_SMOOTHING_ITERATIONS = 4;
export const DEFAULT_MIN_WALKABLE_PERCENT = 0.3;
export const DEFAULT_WATER_FILL_PERCENT = 20;
export const MIN_WATER_LAKE_SIZE = 5;
export const MAX_WATER_LAKE_SIZE = 20;
export const MAX_GENERATION_ATTEMPTS = 64;
export const GENERATION_PASSES = Object.freeze([
  "ground",
  "cave/walls",
  "water",
  "walkability",
  "player-position",
]);

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

function createGeneratedSeed() {
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
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: columns }, (_, x) => valueFactory(x, y)),
  );
}

function isBorderCell(x, y, rows, columns) {
  return x === 0 || y === 0 || x === columns - 1 || y === rows - 1;
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
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

function getRegion(grid, start, rows, columns, isBlocked = (cell) => cell) {
  const region = [];
  const pending = [start];
  const visited = new Set([cellKey(start)]);
  let pendingIndex = 0;

  while (pendingIndex < pending.length) {
    const cell = pending[pendingIndex];
    pendingIndex += 1;
    region.push(cell);
    for (const direction of CARDINAL_DIRECTIONS) {
      const next = { x: cell.x + direction.x, y: cell.y + direction.y };
      const key = cellKey(next);
      if (
        next.x > 0 && next.x < columns - 1 &&
        next.y > 0 && next.y < rows - 1 &&
        !isBlocked(next) && !visited.has(key)
      ) {
        visited.add(key);
        pending.push(next);
      }
    }
  }
  return region;
}

function getLargestRegion(grid, rows, columns, isBlocked = (cell) => grid[cell.y][cell.x]) {
  const visited = new Set();
  let largestRegion = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      const cell = { x, y };
      const key = cellKey(cell);
      if (isBlocked(cell) || visited.has(key)) continue;
      const region = getRegion(grid, cell, rows, columns, isBlocked);
      for (const member of region) visited.add(cellKey(member));
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

function countSelectedNeighbors(cell, selected, rows, columns) {
  return getCellNeighbors(cell, rows, columns)
    .filter((neighbor) => selected.has(cellKey(neighbor))).length;
}

function selectLakeCells(region, regionKeys, rows, columns, random, targetSize, reserved) {
  let start = null;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = region[Math.floor(random() * region.length)];
    if (!reserved.has(cellKey(candidate))) {
      start = candidate;
      break;
    }
  }
  if (!start) return [];

  const selected = new Set([cellKey(start)]);
  const frontier = [];
  const frontierIndexes = new Map();
  const addFrontier = (cell) => {
    for (const neighbor of getCellNeighbors(cell, rows, columns)) {
      const key = cellKey(neighbor);
      if (
        regionKeys.has(key) &&
        !selected.has(key) &&
        !reserved.has(key) &&
        !frontierIndexes.has(key)
      ) {
        frontierIndexes.set(key, frontier.length);
        frontier.push(neighbor);
      }
    }
  };
  addFrontier(start);

  while (selected.size < targetSize && frontier.length > 0) {
    const sampleCount = Math.min(8, frontier.length);
    let selectedIndex = Math.floor(random() * frontier.length);
    let selectedScore = -1;
    for (let sample = 0; sample < sampleCount; sample += 1) {
      const candidateIndex = Math.floor(random() * frontier.length);
      const candidate = frontier[candidateIndex];
      const score = countSelectedNeighbors(candidate, selected, rows, columns) * 3 + random();
      if (score > selectedScore) {
        selectedScore = score;
        selectedIndex = candidateIndex;
      }
    }

    const next = frontier[selectedIndex];
    const nextKey = cellKey(next);
    const last = frontier.pop();
    frontierIndexes.delete(nextKey);
    if (selectedIndex < frontier.length) {
      frontier[selectedIndex] = last;
      frontierIndexes.set(cellKey(last), selectedIndex);
    }
    selected.add(nextKey);
    addFrontier(next);
  }

  return [...selected].map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  });
}

function reserveLakeCells(lake, reserved) {
  // Keep lakes independent in the data layer while allowing the aggregate
  // target to fill the available cave instead of consuming a second cell
  // for every water cell as a visual moat.
  for (const cell of lake) reserved.add(cellKey(cell));
}

function assignWaterDepths(waterCells, rows, columns) {
  if (waterCells.length === 0) return new Map();
  const waterKeys = new Set(waterCells.map(cellKey));
  const boundary = waterCells.filter((cell) => getCellNeighbors(cell, rows, columns)
    .some((neighbor) => !waterKeys.has(cellKey(neighbor))));
  const distances = new Map(boundary.map((cell) => [cellKey(cell), 0]));
  const pending = [...boundary];
  let pendingIndex = 0;
  while (pendingIndex < pending.length) {
    const cell = pending[pendingIndex];
    pendingIndex += 1;
    const distance = distances.get(cellKey(cell));
    for (const neighbor of getCellNeighbors(cell, rows, columns)) {
      const key = cellKey(neighbor);
      if (waterKeys.has(key) && !distances.has(key)) {
        distances.set(key, distance + 1);
        pending.push(neighbor);
      }
    }
  }

  const center = getCenterMostCell(waterCells, rows, columns);
  const deepestDistance = Math.max(...distances.values());
  const ordered = [...waterCells].sort((left, right) => {
    const leftDepth = distances.get(cellKey(left)) ?? 0;
    const rightDepth = distances.get(cellKey(right)) ?? 0;
    const leftCenterDistance = Math.abs(left.x - center.x) + Math.abs(left.y - center.y);
    const rightCenterDistance = Math.abs(right.x - center.x) + Math.abs(right.y - center.y);
    return rightDepth - leftDepth
      || leftCenterDistance - rightCenterDistance
      || cellKey(left).localeCompare(cellKey(right));
  });
  const depths = new Map();
  if (deepestDistance >= 2) {
    ordered.forEach((cell) => {
      const distance = distances.get(cellKey(cell)) ?? 0;
      const depth = distance === deepestDistance
        ? "deep"
        : distance === deepestDistance - 1 ? "medium" : "shallow";
      depths.set(cellKey(cell), depth);
    });
  } else {
    // Very thin 5-20-cell lakes cannot express three literal graph-distance
    // rings. Keep their center deepest, make its immediate lake neighbors
    // middle depth, and leave any remaining boundary cells shallow.
    const deepKeys = new Set([cellKey(ordered[0])]);
    const mediumKeys = new Set(getCellNeighbors(ordered[0], rows, columns)
      .map(cellKey)
      .filter((key) => waterKeys.has(key)));
    ordered.forEach((cell) => {
      const key = cellKey(cell);
      const depth = deepKeys.has(key) ? "deep" : mediumKeys.has(key) ? "medium" : "shallow";
      depths.set(cellKey(cell), depth);
    });
  }
  return depths;
}

function createWaterPass({ region, rows, columns, random, waterFillPercent }) {
  const targetCount = Math.min(region.length, Math.round(region.length * waterFillPercent / 100));
  const lakes = [];
  const reserved = new Set();
  const regionKeys = new Set(region.map(cellKey));
  let selectedCount = 0;
  let failedLakeAttempts = 0;

  while (selectedCount < targetCount && failedLakeAttempts < 5000) {
    const remaining = targetCount - selectedCount;
    const targetSize = Math.min(
      remaining,
      MIN_WATER_LAKE_SIZE + Math.floor(random() * (MAX_WATER_LAKE_SIZE - MIN_WATER_LAKE_SIZE + 1)),
    );
    if (targetSize < MIN_WATER_LAKE_SIZE) break;
    const lake = selectLakeCells(region, regionKeys, rows, columns, random, targetSize, reserved);
    if (lake.length < MIN_WATER_LAKE_SIZE) {
      failedLakeAttempts += 1;
      continue;
    }
    lakes.push(lake);
    selectedCount += lake.length;
    reserveLakeCells(lake, reserved);
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

function selectTorchCells(terrain, start, rows, columns, random, torchCount) {
  const candidates = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      if (isTorchCandidate(terrain, x, y, rows, columns, start)) candidates.push({ x, y });
    }
  }
  if (candidates.length < torchCount) return null;
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  return candidates.slice(0, torchCount);
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

    const caveRegionKeys = new Set(caveRegion.map(cellKey));
    const terrainKinds = ground.map((row, y) => row.map((kind, x) => (
      walls[y][x] || !caveRegionKeys.has(`${x},${y}`) ? "wall" : kind
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
    const walkableRegionKeys = new Set(walkableRegion.map(cellKey));
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < columns - 1; x += 1) {
        if (walkability[y][x] && !walkableRegionKeys.has(`${x},${y}`)) {
          terrainKinds[y][x] = "wall";
          walkability[y][x] = false;
        }
      }
    }

    const terrain = createTerrainCells(terrainKinds, walkability);
    const start = getCenterMostCell(walkableRegion, rows, columns);
    const torchCells = selectTorchCells(terrain, start, rows, columns, random, torchCount);
    if (!torchCells) continue;

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
  const torch = world.torches?.find((candidate) => isSameCell(candidate, cell));
  world.characters[cell.y][cell.x] = torch ? TORCH_GLYPH : null;
  return true;
}

export function getVisibleGlyph(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) return null;
  return world.characters[cell.y][cell.x] ?? world.terrain[cell.y][cell.x].glyph;
}
