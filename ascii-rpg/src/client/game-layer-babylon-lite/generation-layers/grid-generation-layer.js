export const CARDINAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }),
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: -1, y: 0 }),
]);

export function createGrid(rows, columns, valueFactory) {
  const grid = new Array(rows);
  for (let y = 0; y < rows; y += 1) {
    const row = new Array(columns);
    for (let x = 0; x < columns; x += 1) row[x] = valueFactory(x, y);
    grid[y] = row;
  }
  return grid;
}

export function isBorderCell(x, y, rows, columns) {
  return x === 0 || y === 0 || x === columns - 1 || y === rows - 1;
}

export function countWalls(grid, x, y) {
  const above = grid[y - 1], row = grid[y], below = grid[y + 1];
  return Number(above[x - 1]) + Number(above[x]) + Number(above[x + 1])
    + Number(row[x - 1]) + Number(row[x]) + Number(row[x + 1])
    + Number(below[x - 1]) + Number(below[x]) + Number(below[x + 1]);
}

export function smoothGrid(grid, rows, columns) {
  return createGrid(rows, columns, (x, y) => {
    if (isBorderCell(x, y, rows, columns)) return true;
    return countWalls(grid, x, y) >= 5;
  });
}

export function createGroundPass(rows, columns) {
  return createGrid(rows, columns, (x, y) => (isBorderCell(x, y, rows, columns) ? "wall" : "ground"));
}

// Snap the smoothed occupancy to 3x3 architectural blocks before connectivity
// selection. No extra random draws: Overground's existing sequence is untouched.
export function* rectilinearWallRows(walls, rows, columns) {
  for (let by = 1; by < rows - 1; by += 3) {
    for (let bx = 1; bx < columns - 1; bx += 3) {
      const bottom = Math.min(by + 3, rows - 1), right = Math.min(bx + 3, columns - 1);
      let count = 0;
      for (let y = by; y < bottom; y++) for (let x = bx; x < right; x++) count += Number(walls[y][x]);
      // Never seal an existing passage: a block containing any floor opens as
      // a whole. This removes small rocky protrusions instead of trapping rooms.
      const filled = count === (bottom - by) * (right - bx);
      for (let y = by; y < bottom; y++) for (let x = bx; x < right; x++) walls[y][x] = filled;
    }
    yield by;
  }
}

export function createCavePass({ rows, columns, wallFillPercent, smoothingIterations, random, ground, caveEnabled = true, rectilinear = false }) {
  if (!caveEnabled) return createGrid(rows, columns, (x, y) => ground[y][x] === "wall");
  let walls = createGrid(rows, columns, (x, y) => ground[y][x] === "wall" || random() * 100 < wallFillPercent);
  for (let iteration = 0; iteration < smoothingIterations; iteration += 1) {
    walls = smoothGrid(walls, rows, columns);
  }
  if (rectilinear) for (const _ of rectilinearWallRows(walls, rows, columns)) { /* bounded block rows */ }
  return walls;
}
