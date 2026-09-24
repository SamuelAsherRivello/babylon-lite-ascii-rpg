function sameCell(first, second) { return first.x === second.x && first.y === second.y; }

export function addPairedStairs(realms, stairCount, seed, createRandom, distributeObjects, rules, stairGlyph) {
  const [overground, underground] = [realms.Overground, realms.Underground];
  if (stairCount === 0) { for (const realm of Object.values(realms)) realm.stairs = []; return []; }
  const candidates = [];
  const torchKeys = new Set([...overground.torches, ...underground.torches].map((cell) => cell.y * overground.columns + cell.x));
  for (let y = 1; y < overground.rows - 1; y += 1) for (let x = 1; x < overground.columns - 1; x += 1) {
    const cell = { x, y };
    if (!overground.terrain[y][x].walkable || !underground.terrain[y][x].walkable || sameCell(cell, overground.playerStart) || sameCell(cell, underground.playerStart)) continue;
    if (torchKeys.has(y * overground.columns + x)) continue;
    candidates.push(cell);
  }
  const stairs = distributeObjects("torch", candidates, createRandom(`${seed}:stairs`), stairCount, rules);
  for (const realm of Object.values(realms)) {
    realm.stairs = stairs.map((cell) => ({ ...cell }));
    for (const stair of realm.stairs) realm.characters[stair.y][stair.x] = stairGlyph;
  }
  return stairs;
}
