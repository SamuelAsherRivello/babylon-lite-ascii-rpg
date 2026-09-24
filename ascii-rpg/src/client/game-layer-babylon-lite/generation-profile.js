export function resolveGenerationProfile(generationSettings = { passes: [] }) {
  const densityFor = (id) => generationSettings.passes?.find((pass) => pass.id === id)?.density ?? "Med";
  const densityMultiplier = (id, values) => values[densityFor(id)] ?? values.Med;
  return Object.freeze({
    caveWallFillPercents: Object.freeze({
      Overground: densityMultiplier("overground-walls", { Low: 30, Med: 35, High: 45 }),
      Underground: densityMultiplier("underground-caves", { Low: 30, Med: 40, High: 50 }),
    }),
    caveSmoothingIterationsByRealm: Object.freeze({
      Overground: densityMultiplier("overground-walls", { Low: 5, Med: 6, High: 7 }),
      Underground: densityMultiplier("underground-caves", { Low: 5, Med: 6, High: 7 }),
    }),
    walkabilityWallOffset: densityMultiplier("walkability", { Low: 0, Med: 0, High: -50 }),
    waterFillPercent: densityMultiplier("water", { Low: 5, Med: 60, High: 100 }),
    waterLakeCount: densityFor("water") === "High" ? 9 : undefined,
    minWalkableMultiplier: densityMultiplier("walkability", { Low: 0.7, Med: 1, High: 2 }),
    objectCountMultipliers: Object.freeze({
      heart: densityMultiplier("object-heart", { Low: 0.25, Med: 1, High: 3 }),
      trap: densityMultiplier("object-trap", { Low: 0.25, Med: 1, High: 3 }),
      fireplace: densityMultiplier("object-fireplace", { Low: 0.25, Med: 0.5, High: 1 }),
    }),
    chestCount: densityMultiplier("object-chest", { Low: 1, Med: 2, High: 3 }),
    torchCountMultiplier: densityMultiplier("object-torch", { Low: 0.25, Med: 1, High: 3 }),
    // These values intentionally start as a one-time copy of Heart's current
    // profile. Stairs use their own setting id and never read Heart settings.
    stairsCountMultiplier: densityMultiplier("civilization-stairs", { Low: 0.25, Med: 1, High: 3 }),
    fireplaceDensity: densityFor("object-fireplace"),
    civilizationChanceMultiplier: densityMultiplier("civilization-doors", { Low: 0.25, Med: 1, High: 2 }),
    homeChanceMultiplier: densityMultiplier("civilization-homes", { Low: 0.25, Med: 1, High: 2 }),
    maxEnemySpawners: densityMultiplier("enemy-spawner", { Low: 4, Med: 16, High: 32 }),
    npcSpawnerCount: densityMultiplier("npc-spawner", { Low: 4, Med: 8, High: 12 }),
    playerStartMode: "center",
  });
}
