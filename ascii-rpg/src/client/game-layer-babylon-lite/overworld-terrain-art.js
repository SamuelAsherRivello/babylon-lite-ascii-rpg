// Interior of the first grass swatch; excludes the sheet title and beveled edge.
// Shared with the authoring region documented in Nature-and-Outdoor/README.md.
export const OVERWORLD_GRASS_SHEET = Object.freeze({ width: 1672, height: 941 });
export const OVERWORLD_GRASS_FRAME = Object.freeze({
  source: "overworldGrass", x: 80, y: 116, width: 192, height: 192,
});

export function resolveOverworldTerrainFrame(world, cell) {
  const terrain = world.terrain?.[cell.y]?.[cell.x];
  return (world.realm ?? world.realmName) === "Overground"
    && terrain?.kind === "grass" && terrain.walkable === true
    ? OVERWORLD_GRASS_FRAME : null;
}
