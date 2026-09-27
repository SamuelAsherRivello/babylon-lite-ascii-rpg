// Composition keeps the pack's lighting upright. Rectangles are
// [sourceX, sourceY, width, height, destinationX, destinationY].

export function getWallMask(world, { x, y }) {
  const rows = world.rows ?? world.terrain.length;
  const columns = world.columns ?? world.terrain[0]?.length ?? 0;
  const wall = (nx, ny) => nx < 0 || ny < 0 || nx >= columns || ny >= rows
    || world.terrain[ny]?.[nx]?.kind === "wall";
  return (wall(x, y - 1) ? 1 : 0) | (wall(x + 1, y) ? 2 : 0)
    | (wall(x, y + 1) ? 4 : 0) | (wall(x - 1, y) ? 8 : 0);
}

export function normalizeWallMask(mask) {
  if (!Number.isInteger(mask) || mask < 0 || mask > 255) throw new RangeError("Wall mask must be 0..255.");
  let result = mask & 15;
  for (const [bit, sides] of [[16, 3], [32, 6], [64, 12], [128, 9]]) {
    if ((mask & sides) === sides && (mask & bit)) result |= bit;
  }
  return result;
}

export function getWallBlobMask(world, cell) {
  let mask = getWallMask(world, cell);
  const rows = world.rows ?? world.terrain.length;
  const columns = world.columns ?? world.terrain[0]?.length ?? 0;
  for (const [dx, dy, bit] of [[1, -1, 16], [1, 1, 32], [-1, 1, 64], [-1, -1, 128]]) {
    const x = cell.x + dx, y = cell.y + dy;
    if (x < 0 || y < 0 || x >= columns || y >= rows || world.terrain[y]?.[x]?.kind === "wall") mask |= bit;
  }
  return normalizeWallMask(mask);
}

// Canonical zero-based frames observed in wall_combinations01.tmx. The example
// also uses alternative frames 33 and 5 for two of these neighborhoods; prefer
// the ordinary edge forms 30 and 18 consistently, rather than infer randomness.
export const EXAMPLE_WALL_FRAMES = Object.freeze({
  0: 31, 19: 30, 38: 6, 55: 18, 76: 8, 110: 7, 127: 53,
  137: 32, 155: 31, 175: 23, 191: 5, 205: 20, 239: 48, 255: 19,
});

export function getWallComposition(rawMask) {
  const mask = normalizeWallMask(rawMask);
  const frame = EXAMPLE_WALL_FRAMES[mask];
  if (frame !== undefined) return [[(frame % 12) * 32, Math.floor(frame / 12) * 32, 32, 32, 0, 0]];
  // Unshown forms use four untransformed quadrants from the same directional
  // family. [x,y,vertical,horizontal,diagonal,outer,vertical-edge,horizontal-edge,inner]
  return [
    [0, 0, 1, 8, 128, 6, 7, 18, 53],
    [16, 0, 1, 2, 16, 8, 7, 20, 48],
    [0, 16, 4, 8, 64, 30, 31, 18, 5],
    [16, 16, 4, 2, 32, 32, 31, 20, 23],
  ].map(([x, y, vertical, horizontal, diagonal, outer, verticalEdge, horizontalEdge, inner]) => {
    const v = Boolean(mask & vertical), h = Boolean(mask & horizontal);
    const id = !v && !h ? outer : !v ? verticalEdge : !h ? horizontalEdge : mask & diagonal ? 19 : inner;
    return [(id % 12) * 32 + x, Math.floor(id / 12) * 32 + y, 16, 16, x, y];
  });
}

export function expandTerrainDirtyCells(world, cells) {
  if ((world?.realm ?? world?.realmName) !== "Underground" || !cells.length) return cells;
  const rows = world.rows ?? world.terrain.length;
  const columns = world.columns ?? world.terrain[0]?.length ?? 0;
  const expanded = new Map();
  // Corner selection depends on diagonals, independently of fog or occupancy.
  for (const cell of cells) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const x = cell.x + dx, y = cell.y + dy;
        if (x >= 0 && y >= 0 && x < columns && y < rows) expanded.set(`${x},${y}`, { x, y });
      }
    }
  }
  return [...expanded.values()];
}
