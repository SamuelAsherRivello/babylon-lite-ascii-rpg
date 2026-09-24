export function isTorchCandidate(terrain, x, y, rows, columns, start, cardinalDirections) {
  if (!terrain[y][x].walkable || (x === start.x && y === start.y)) return false;
  return cardinalDirections.some(({ x: offsetX, y: offsetY }) => {
    const neighborX = x + offsetX, neighborY = y + offsetY;
    return neighborX >= 0 && neighborX < columns && neighborY >= 0 && neighborY < rows && !terrain[neighborY][neighborX].walkable;
  });
}

export function collectObjectCandidates(objectType, terrain, start, rows, columns, cardinalDirections) {
  if (objectType !== "torch") throw new RangeError(`Cannot collect candidates for object type: ${objectType}.`);
  const candidates = [];
  for (let y = 1; y < rows - 1; y += 1) for (let x = 1; x < columns - 1; x += 1) {
    if (isTorchCandidate(terrain, x, y, rows, columns, start, cardinalDirections)) candidates.push({ x, y });
  }
  return candidates;
}

export function distributeObjectOfType(objectType, candidates, random, requestedCount, rules) {
  if (requestedCount <= 0) return [];
  const rule = rules[objectType];
  if (!rule) throw new RangeError(`Cannot distribute an unknown object type: ${objectType}.`);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  const distributed = [];
  const minimumDistanceSquared = rule.minimumDistance ** 2;
  for (const candidate of candidates) {
    if (distributed.every((object) => (candidate.x - object.x) ** 2 + (candidate.y - object.y) ** 2 >= minimumDistanceSquared)) distributed.push(candidate);
    if (distributed.length === requestedCount) break;
  }
  return distributed;
}
