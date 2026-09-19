export const WALL_GLYPH = "W";
export const FLOOR_GLYPH = "•";
export const PLAYER_GLYPH = "P";
export const DEFAULT_WALL_FILL_PERCENT = 40;
export const DEFAULT_SMOOTHING_ITERATIONS = 4;
export const DEFAULT_MIN_WALKABLE_PERCENT = 0.3;
export const MAX_GENERATION_ATTEMPTS = 64;

const CARDINAL_DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

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

function countWalls(grid, x, y) {
  let count = 0;

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (grid[y + offsetY]?.[x + offsetX]) {
        count += 1;
      }
    }
  }

  return count;
}

function smoothGrid(grid, rows, columns) {
  return createGrid(rows, columns, (x, y) => {
    if (isBorderCell(x, y, rows, columns)) {
      return true;
    }

    return countWalls(grid, x, y) >= 5;
  });
}

function getWalkableRegion(grid, start, rows, columns) {
  const region = [];
  const pending = [start];
  const visited = new Set([`${start.x},${start.y}`]);

  while (pending.length > 0) {
    const cell = pending.shift();
    region.push(cell);

    for (const direction of CARDINAL_DIRECTIONS) {
      const next = { x: cell.x + direction.x, y: cell.y + direction.y };
      const key = `${next.x},${next.y}`;
      if (
        next.x > 0 &&
        next.x < columns - 1 &&
        next.y > 0 &&
        next.y < rows - 1 &&
        !grid[next.y][next.x] &&
        !visited.has(key)
      ) {
        visited.add(key);
        pending.push(next);
      }
    }
  }

  return region;
}

function getLargestWalkableRegion(grid, rows, columns) {
  const visited = new Set();
  let largestRegion = [];

  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      const key = `${x},${y}`;
      if (grid[y][x] || visited.has(key)) {
        continue;
      }

      const region = getWalkableRegion(grid, { x, y }, rows, columns);
      for (const cell of region) {
        visited.add(`${cell.x},${cell.y}`);
      }
      if (region.length > largestRegion.length) {
        largestRegion = region;
      }
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

function createTerrain(grid) {
  return grid.map((row) =>
    row.map((isWall) => ({
      glyph: isWall ? WALL_GLYPH : FLOOR_GLYPH,
      walkable: !isWall,
      color: "#f5f5f5",
      alpha: 1,
    })),
  );
}

function createCharacters(rows, columns, start) {
  const characters = createGrid(rows, columns, () => null);
  characters[start.y][start.x] = PLAYER_GLYPH;
  return characters;
}

export function createWorld({
  rows,
  columns,
  wallFillPercent = DEFAULT_WALL_FILL_PERCENT,
  smoothingIterations = DEFAULT_SMOOTHING_ITERATIONS,
  minWalkablePercent = DEFAULT_MIN_WALKABLE_PERCENT,
  seed,
} = {}) {
  assertDimensions(rows, columns);
  if (wallFillPercent < 0 || wallFillPercent > 100) {
    throw new RangeError("wallFillPercent must be between 0 and 100.");
  }
  if (!Number.isInteger(smoothingIterations) || smoothingIterations < 0) {
    throw new RangeError("smoothingIterations must be a non-negative integer.");
  }
  if (minWalkablePercent <= 0 || minWalkablePercent > 1) {
    throw new RangeError("minWalkablePercent must be greater than 0 and at most 1.");
  }

  const resolvedSeed = seed === undefined ? createGeneratedSeed() : seed;
  const random = createRandom(resolvedSeed);
  const interiorArea = (rows - 2) * (columns - 2);
  const minimumWalkableCells = Math.ceil(interiorArea * minWalkablePercent);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    let grid = createGrid(rows, columns, (x, y) => {
      return isBorderCell(x, y, rows, columns) || random() * 100 < wallFillPercent;
    });

    for (let iteration = 0; iteration < smoothingIterations; iteration += 1) {
      grid = smoothGrid(grid, rows, columns);
    }

    const region = getLargestWalkableRegion(grid, rows, columns);
    if (region.length < minimumWalkableCells) {
      continue;
    }

    const regionKeys = new Set(region.map((cell) => `${cell.x},${cell.y}`));
    grid = grid.map((row, y) =>
      row.map((isWall, x) => isWall || !regionKeys.has(`${x},${y}`)),
    );
    const start = getCenterMostCell(region, rows, columns);

    return {
      rows,
      columns,
      terrain: createTerrain(grid),
      characters: createCharacters(rows, columns, start),
      playerStart: start,
      options: {
        wallFillPercent,
        smoothingIterations,
        minWalkablePercent,
        seed: resolvedSeed,
      },
    };
  }

  throw new Error("Unable to generate a connected walkable world with the requested settings.");
}

export function getWorldCell(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) {
    return null;
  }

  return world.terrain[cell.y][cell.x];
}

export function isWalkableCell(world, cell) {
  return Boolean(getWorldCell(world, cell)?.walkable);
}

export function setCharacter(world, cell, glyph = PLAYER_GLYPH) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) {
    return false;
  }

  world.characters[cell.y][cell.x] = glyph;
  return true;
}

export function clearCharacter(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) {
    return false;
  }

  world.characters[cell.y][cell.x] = null;
  return true;
}

export function getVisibleGlyph(world, cell) {
  if (!world || cell.x < 0 || cell.y < 0 || cell.x >= world.columns || cell.y >= world.rows) {
    return null;
  }

  return world.characters[cell.y][cell.x] ?? world.terrain[cell.y][cell.x].glyph;
}
