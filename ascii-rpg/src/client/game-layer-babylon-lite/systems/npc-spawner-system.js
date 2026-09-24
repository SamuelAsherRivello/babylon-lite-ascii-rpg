import { NPC_GLYPH } from "./npc-system.js";
import { AStarUtility } from "../utilities/a-star-utility.js";

export const NPC_SPAWNER_GLYPH = "N";
export const NPC_SPAWNER_COUNTS = Object.freeze({ Low: 4, Med: 8, High: 12 });
export const NPC_SPAWNER_COUNT = NPC_SPAWNER_COUNTS.Med;
const DIRECTIONS = Object.freeze([{ x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }]);
const key = (cell) => `${cell.x},${cell.y}`;

function candidates(world) {
  const blocked = new Set([key(world.playerStart)]);
  for (const object of world.objects ?? []) if (object.active !== false && object.cell) blocked.add(key(object.cell));
  for (const group of world.civilizationGroups ?? []) for (const cell of [...(group.cells ?? []), ...(group.keys ?? []), group.door].filter(Boolean)) blocked.add(key(cell));
  for (const building of world.buildings ?? []) for (const cell of [...(building.cells ?? []), building.key].filter(Boolean)) blocked.add(key(cell));
  for (let y = 0; y < (world.characters?.length ?? 0); y += 1) for (let x = 0; x < world.characters[y].length; x += 1) if (world.characters[y][x] !== null) blocked.add(`${x},${y}`);
  const result = [];
  for (let y = 1; y < world.rows - 1; y += 1) for (let x = 1; x < world.columns - 1; x += 1) {
    if (world.terrain[y][x].walkable && !blocked.has(`${x},${y}`)) result.push({ x, y });
  }
  return result;
}

export function selectNpcSpawnerCells(world, { realm, count = NPC_SPAWNER_COUNT, random = Math.random } = {}) {
  if (realm !== "Overground" || !world?.terrain || count <= 0) return Object.freeze({ cells: Object.freeze([]) });
  const validCells = candidates(world);
  const distanceField = AStarUtility.createDistanceField(world, world.playerStart, { maxDistance: 50 });
  const nearbyCells = validCells.filter((cell) => distanceField.getDistance(cell) > 0 && distanceField.getDistance(cell) <= 50);
  if (nearbyCells.length === 0) return Object.freeze({ cells: Object.freeze([]) });
  const first = nearbyCells[Math.min(nearbyCells.length - 1, Math.floor(random() * nearbyCells.length))];
  const regions = Array.from({ length: 16 }, () => []);
  for (const cell of validCells.filter((cell) => key(cell) !== key(first))) {
    const column = Math.min(3, Math.floor(((cell.x - 1) * 4) / Math.max(1, world.columns - 2)));
    const row = Math.min(3, Math.floor(((cell.y - 1) * 4) / Math.max(1, world.rows - 2)));
    regions[row * 4 + column].push(cell);
  }
  const cells = [Object.freeze({ ...first })];
  for (const region of regions.filter((region) => region.length)) {
    if (cells.length === count) break;
    cells.push(Object.freeze({ ...region[Math.min(region.length - 1, Math.floor(random() * region.length))] }));
  }
  return Object.freeze({ cells: Object.freeze(cells.slice(0, count)) });
}

export function createNpcSpawnerSystem({ timeSystem, occupancy, spawnNpc, worldFor = () => null, isWalkable, isStaticOccupied = () => false, randomFor = () => Math.random, onChange = () => {} } = {}) {
  let sequence = 1;
  const hasPatrolRoute = (cell, realm) => {
    const world = worldFor(realm);
    if (!world) return true;
    const field = AStarUtility.createDistanceField(world, cell, { isBlocked: (candidate) => isStaticOccupied(candidate, realm), maxDistance: 20 });
    for (let y = Math.max(0, cell.y - 20); y <= Math.min(world.rows - 1, cell.y + 20); y += 1) for (let x = Math.max(0, cell.x - 20); x <= Math.min(world.columns - 1, cell.x + 20); x += 1) {
      if ([15, 20].includes(field.getDistance({ x, y }))) return true;
    }
    return false;
  };
  const attempt = (spawner, time) => {
    const cells = DIRECTIONS.map((d) => ({ x: spawner.cell.x + d.x, y: spawner.cell.y + d.y })).filter((cell) => isWalkable(cell, spawner.realm) && !isStaticOccupied(cell, spawner.realm) && !occupancy.isOccupied(cell) && hasPatrolRoute(cell, spawner.realm));
    const cell = cells.length ? cells[Math.min(cells.length - 1, Math.floor(randomFor(spawner, time)() * cells.length))] : null;
    if (!cell) return false;
    const npc = spawnNpc({ id: `npc-${sequence}`, spawnerId: spawner.id, realm: spawner.realm, cell, bornAtTime: time });
    if (npc) { sequence += 1; onChange(); return true; }
    return false;
  };
  const addSpawner = ({ id, realm, cell, bornAtTime = timeSystem.getTime() }) => {
    const spawner = occupancy.claim({ id, type: "npc-spawner", glyph: NPC_SPAWNER_GLYPH, realm, cell, bornAtTime });
    if (!spawner) return null;
    attempt(spawner, bornAtTime);
    onChange(); return spawner;
  };
  return Object.freeze({ addSpawner, NPC_GLYPH });
}
