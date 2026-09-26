const MIN_WATER_LAKE_SIZE = 50;
const MAX_WATER_LAKE_SIZE = 240;
const OCCASIONAL_LARGE_WATER_LAKE_SIZE = 480;
export const CANONICAL_WATER_DEPTH = "water";

function cellIndex(cell, columns) { return cell.y * columns + cell.x; }
function cellKey(cell) { return `${cell.x},${cell.y}`; }

function centerMostCell(region, rows, columns) {
  const centerX = (columns - 1) / 2;
  const centerY = (rows - 1) / 2;
  return region.reduce((closest, cell) => {
    const distance = Math.abs(cell.x - centerX) + Math.abs(cell.y - centerY);
    const closestDistance = Math.abs(closest.x - centerX) + Math.abs(closest.y - centerY);
    return distance < closestDistance ? cell : closest;
  });
}

function neighborIndexes(key, rows, columns) {
  const x = key % columns;
  const y = Math.floor(key / columns);
  const neighbors = [];
  if (y > 1) neighbors.push(key - columns);
  if (x < columns - 2) neighbors.push(key + 1);
  if (y < rows - 2) neighbors.push(key + columns);
  if (x > 1) neighbors.push(key - 1);
  return neighbors;
}

function createScratch(rows, columns) {
  const count = rows * columns;
  return { reserved: new Uint8Array(count), regionKeys: new Uint8Array(count), selectedStamp: new Uint32Array(count), frontierStamp: new Uint32Array(count), stamp: 0 };
}

function selectedNeighbors(key, selectedStamp, stamp, rows, columns) {
  return neighborIndexes(key, rows, columns).reduce((count, neighbor) => count + Number(selectedStamp[neighbor] === stamp), 0);
}

function selectLakeCells(region, rows, columns, random, targetSize, scratch, preferredStart = null) {
  const { reserved, regionKeys, selectedStamp, frontierStamp } = scratch;
  let start = preferredStart && regionKeys[cellIndex(preferredStart, columns)] && !reserved[cellIndex(preferredStart, columns)] ? preferredStart : null;
  if (!start) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const candidate = region[Math.floor(random() * region.length)];
      if (!reserved[cellIndex(candidate, columns)]) { start = candidate; break; }
    }
  }
  if (!start) return [];
  const stamp = ++scratch.stamp;
  const selected = [cellIndex(start, columns)];
  selectedStamp[selected[0]] = stamp;
  const frontier = [];
  const addFrontier = (key) => {
    for (const neighbor of neighborIndexes(key, rows, columns)) {
      if (regionKeys[neighbor] && selectedStamp[neighbor] !== stamp && !reserved[neighbor] && frontierStamp[neighbor] !== stamp) {
        frontierStamp[neighbor] = stamp;
        frontier.push(neighbor);
      }
    }
  };
  addFrontier(selected[0]);
  while (selected.length < targetSize && frontier.length > 0) {
    const sampleCount = Math.min(8, frontier.length);
    let selectedIndex = Math.floor(random() * frontier.length);
    let selectedScore = -1;
    for (let sample = 0; sample < sampleCount; sample += 1) {
      const candidateIndex = Math.floor(random() * frontier.length);
      const candidate = frontier[candidateIndex];
      const score = selectedNeighbors(candidate, selectedStamp, stamp, rows, columns) * 3 + random();
      if (score > selectedScore) { selectedScore = score; selectedIndex = candidateIndex; }
    }
    const next = frontier[selectedIndex];
    const last = frontier.pop();
    frontierStamp[next] = 0;
    if (selectedIndex < frontier.length) frontier[selectedIndex] = last;
    selectedStamp[next] = stamp;
    selected.push(next);
    addFrontier(next);
  }
  return selected.map((key) => ({ x: key % columns, y: Math.floor(key / columns) }));
}

function assignWaterDepths(waterCells, rows, columns) {
  return new Map(waterCells.map((cell) => [cellKey(cell), CANONICAL_WATER_DEPTH]));
}

export function createWaterPass({ region, rows, columns, random, waterFillPercent, waterLakeCount }) {
  if (region.length === 0 || random() * 100 >= waterFillPercent) return { depths: new Map(), lakes: [] };
  const scratch = createScratch(rows, columns);
  for (const cell of region) scratch.regionKeys[cellIndex(cell, columns)] = 1;
  const lakes = [];
  let selectedCount = 0;
  let failedLakeAttempts = 0;
  const lakeCount = waterLakeCount ?? (waterFillPercent >= 75 ? 3 : random() < 0.35 ? 2 : 1);
  let preferredStart = centerMostCell(region, rows, columns);
  while (lakes.length < lakeCount && failedLakeAttempts < 5000) {
    const upperBound = random() < 0.12 ? OCCASIONAL_LARGE_WATER_LAKE_SIZE : MAX_WATER_LAKE_SIZE;
    const targetSize = Math.min(region.length - selectedCount, MIN_WATER_LAKE_SIZE + Math.floor(random() * (upperBound - MIN_WATER_LAKE_SIZE + 1)));
    if (targetSize < MIN_WATER_LAKE_SIZE) break;
    const lake = selectLakeCells(region, rows, columns, random, targetSize, scratch, preferredStart);
    if (lake.length < MIN_WATER_LAKE_SIZE) { failedLakeAttempts += 1; continue; }
    lakes.push(lake); selectedCount += lake.length; for (const cell of lake) scratch.reserved[cellIndex(cell, columns)] = 1; preferredStart = null;
  }
  const depths = new Map();
  for (const lake of lakes) for (const [key, depth] of assignWaterDepths(lake, rows, columns)) depths.set(key, depth);
  return { depths, lakes };
}

export { assignWaterDepths };
