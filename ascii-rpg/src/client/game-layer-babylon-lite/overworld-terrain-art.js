// Tiny-Swords uses a 64px Tiled grid. This interior cell excludes the atlas
// edge so adjacent grass cells do not inherit a hard frame.
export const OVERWORLD_GRASS_SHEET = Object.freeze({ width: 576, height: 384 });
export const OVERWORLD_GRASS_FRAME = Object.freeze({
  source: "overworldGrass", x: 64, y: 64, width: 64, height: 64,
});

export const OVERWORLD_MOUNTAIN_SHEET = Object.freeze({ width: 256, height: 512 });
const MOUNTAIN_MASK_FRAMES = Object.freeze({ 1: 23, 3: 12, 4: 19, 6: 16, 7: 12, 9: 14, 11: 13, 12: 18, 15: 5 });

export function getOverworldMountainMask(world, cell) {
  const rows = world.rows ?? world.terrain.length;
  const columns = world.columns ?? world.terrain[0]?.length ?? 0;
  const mountain = (x, y) => x < 0 || y < 0 || x >= columns || y >= rows
    || world.terrain?.[y]?.[x]?.kind === "mountain";
  return (mountain(cell.x, cell.y - 1) ? 1 : 0)
    | (mountain(cell.x + 1, cell.y) ? 2 : 0)
    | (mountain(cell.x, cell.y + 1) ? 4 : 0)
    | (mountain(cell.x - 1, cell.y) ? 8 : 0);
}

export function getOverworldMountainFrame(mask) {
  const localId = MOUNTAIN_MASK_FRAMES[mask] ?? MOUNTAIN_MASK_FRAMES[15];
  return Object.freeze({ source: "overworldMountain", x: (localId % 4) * 64, y: Math.floor(localId / 4) * 64, width: 64, height: 64 });
}

export function resolveOverworldMountainFrame(world, cell) {
  const terrain = world.terrain?.[cell.y]?.[cell.x];
  return (world.realm ?? world.realmName) === "Overground" && terrain?.kind === "mountain"
    ? getOverworldMountainFrame(getOverworldMountainMask(world, cell)) : null;
}

export function resolveOverworldTerrainFrame(world, cell) {
  const terrain = world.terrain?.[cell.y]?.[cell.x];
  return (world.realm ?? world.realmName) === "Overground"
    && terrain?.kind === "grass" && terrain.walkable === true
    ? OVERWORLD_GRASS_FRAME : null;
}
