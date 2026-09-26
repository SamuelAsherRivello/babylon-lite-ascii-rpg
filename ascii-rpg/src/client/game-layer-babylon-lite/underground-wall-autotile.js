// Composition uses unrotated source strips so the pack's lighting stays upright.
// Rectangles are [sourceX, sourceY, width, height, destinationX, destinationY].
export const WALL_COMPOSITION = Object.freeze({
  size: 32,
  base: Object.freeze([224, 64, 32, 32, 0, 0]),
  north: Object.freeze([224, 0, 32, 8, 0, 0]),
  east: Object.freeze([280, 32, 8, 32, 24, 0]),
  south: Object.freeze([32, 132, 32, 8, 0, 24]),
  west: Object.freeze([192, 32, 8, 32, 0, 0]),
});

export function getWallMask(world, { x, y }) {
  const rows = world.rows ?? world.terrain.length;
  const columns = world.columns ?? world.terrain[0]?.length ?? 0;
  const wall = (nx, ny) => nx < 0 || ny < 0 || nx >= columns || ny >= rows
    || world.terrain[ny]?.[nx]?.kind === "wall";
  return (wall(x, y - 1) ? 1 : 0) | (wall(x + 1, y) ? 2 : 0)
    | (wall(x, y + 1) ? 4 : 0) | (wall(x - 1, y) ? 8 : 0);
}

export function getWallComposition(mask) {
  if (!Number.isInteger(mask) || mask < 0 || mask > 15) throw new RangeError("Wall mask must be 0..15.");
  const pieces = [WALL_COMPOSITION.base];
  // Side strips first; horizontal caps cover their intersections. No transforms,
  // stretching, floor overlap, or missing-pattern fallbacks are needed.
  if (!(mask & 8)) pieces.push(WALL_COMPOSITION.west);
  if (!(mask & 2)) pieces.push(WALL_COMPOSITION.east);
  if (!(mask & 1)) pieces.push(WALL_COMPOSITION.north);
  if (!(mask & 4)) pieces.push(WALL_COMPOSITION.south);
  return pieces;
}

export function expandTerrainDirtyCells(world, cells) {
  if ((world?.realm ?? world?.realmName) !== "Underground" || !cells.length) return cells;
  const rows = world.rows ?? world.terrain.length;
  const columns = world.columns ?? world.terrain[0]?.length ?? 0;
  const expanded = new Map();
  // Includes diagonals deliberately, keeping the invalidation contract ready
  // for a future corner-aware family without inspecting fog or occupancy.
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
