import { ENEMY_SPAWNER_GLYPH } from "./world-system.js";

export { ENEMY_SPAWNER_GLYPH };
export const ENEMY_SPAWNER_HEALTH = 100;
export const ENEMY_SPAWN_INTERVAL = 30;
export const MAX_NORMAL_ENEMY_SPAWNERS = 16;

const NEIGHBOR_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }),
  Object.freeze({ x: 1, y: -1 }),
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: 1, y: 1 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: -1, y: 1 }),
  Object.freeze({ x: -1, y: 0 }),
  Object.freeze({ x: -1, y: -1 }),
]);

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function sameCell(left, right) {
  return left?.x === right?.x && left?.y === right?.y;
}

function shuffle(values, random) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(index, Math.floor(random() * (index + 1)));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function collectStaticCellKeys(world) {
  const keys = new Set();
  if (world?.playerStart) keys.add(cellKey(world.playerStart));
  for (const object of world?.objects ?? []) {
    if (object.active !== false && object.cell) keys.add(cellKey(object.cell));
  }
  for (const group of world?.civilizationGroups ?? []) {
    for (const cell of [...(group.cells ?? []), ...(group.keys ?? [])]) keys.add(cellKey(cell));
    if (group.door) keys.add(cellKey(group.door));
  }
  for (let y = 0; y < (world?.characters?.length ?? 0); y += 1) {
    for (let x = 0; x < world.characters[y].length; x += 1) {
      if (world.characters[y][x] !== null) keys.add(cellKey({ x, y }));
    }
  }
  return keys;
}

function collectCandidates(world, blocked) {
  const candidates = [];
  for (let y = 1; y < world.rows - 1; y += 1) {
    for (let x = 1; x < world.columns - 1; x += 1) {
      const cell = { x, y };
      if (world.terrain?.[y]?.[x]?.walkable && !blocked.has(cellKey(cell))) candidates.push(cell);
    }
  }
  return candidates;
}

function coarseRegionIndex(world, cell) {
  const interiorColumns = Math.max(1, world.columns - 2);
  const interiorRows = Math.max(1, world.rows - 2);
  const column = Math.min(3, Math.floor(((cell.x - 1) * 4) / interiorColumns));
  const row = Math.min(3, Math.floor(((cell.y - 1) * 4) / interiorRows));
  return row * 4 + column;
}

export function selectEnemySpawnerCells(world, {
  realm,
  random = Math.random,
  maxSpawners = MAX_NORMAL_ENEMY_SPAWNERS,
  includeDevelopmentBonus = false,
} = {}) {
  if (realm !== "Underground" || !world?.terrain) {
    return Object.freeze({ normalCells: Object.freeze([]), bonusCell: null, cells: Object.freeze([]) });
  }

  const blocked = collectStaticCellKeys(world);
  const candidates = collectCandidates(world, blocked);
  const regionCandidates = Array.from({ length: 16 }, () => []);
  for (const cell of candidates) regionCandidates[coarseRegionIndex(world, cell)].push(cell);

  const normalCells = [];
  for (const region of regionCandidates) {
    if (normalCells.length >= maxSpawners || region.length === 0) continue;
    const index = Math.min(region.length - 1, Math.floor(random() * region.length));
    normalCells.push(Object.freeze({ ...region[index] }));
  }

  const selected = new Set(normalCells.map(cellKey));
  let bonusCell = null;
  if (includeDevelopmentBonus && world.playerStart) {
    const nearby = candidates.filter((cell) => !selected.has(cellKey(cell))
      && !sameCell(cell, world.playerStart)
      && Math.hypot(cell.x - world.playerStart.x, cell.y - world.playerStart.y) <= 5);
    if (nearby.length > 0) {
      const index = Math.min(nearby.length - 1, Math.floor(random() * nearby.length));
      bonusCell = Object.freeze({ ...nearby[index] });
    }
  }

  return Object.freeze({
    normalCells: Object.freeze(normalCells),
    bonusCell,
    cells: Object.freeze(bonusCell ? [...normalCells, bonusCell] : [...normalCells]),
  });
}

export function createEnemySpawnerSystem({
  timeSystem,
  occupancy,
  spawnEnemy,
  isWalkable,
  isStaticOccupied = () => false,
  randomFor = () => Math.random,
  log = () => {},
  onDamage = () => {},
  onChange = () => {},
} = {}) {
  let nextEnemySequence = 1;

  const attemptSpawn = (spawner, event) => {
    if (event.time < spawner.bornAtTime || (event.time - 1) % ENEMY_SPAWN_INTERVAL !== 0) return false;
    const candidates = NEIGHBOR_DIRECTIONS.map((direction) => ({
      x: spawner.cell.x + direction.x,
      y: spawner.cell.y + direction.y,
    })).filter((cell) => isWalkable(cell, spawner.realm)
      && !isStaticOccupied(cell, spawner.realm)
      && !occupancy.isOccupied(cell));
    if (candidates.length === 0) return false;

    const [cell] = shuffle(candidates, randomFor(spawner, event.time));
    const spawned = spawnEnemy({
      id: `enemy-${nextEnemySequence}`,
      spawnerId: spawner.id,
      realm: spawner.realm,
      cell,
      bornAtTime: event.time,
    });
    if (spawned) {
      nextEnemySequence += 1;
      onChange();
      return true;
    }
    return false;
  };

  const addSpawner = ({ id, realm, cell, bornAtTime = timeSystem.getTime() }) => {
    const spawner = occupancy.claim({
      id,
      type: "enemy-spawner",
      glyph: ENEMY_SPAWNER_GLYPH,
      realm,
      cell,
      health: ENEMY_SPAWNER_HEALTH,
      maxHealth: ENEMY_SPAWNER_HEALTH,
      bornAtTime,
    });
    if (!spawner) return null;

    const registered = timeSystem.registerTickable(`enemy-spawner:${id}`, (event) => {
      const current = occupancy.get(id);
      if (current) attemptSpawn(current, event);
    });
    if (!registered) {
      occupancy.remove(id);
      return null;
    }
    onChange();
    return spawner;
  };

  const damage = (id, amount, { attacker = null, at = globalThis.performance?.now?.() ?? Date.now() } = {}) => {
    const spawner = occupancy.get(id);
    if (!spawner || spawner.type !== "enemy-spawner" || amount <= 0) return spawner;
    const applied = Math.min(spawner.health, amount);
    const health = spawner.health - applied;
    if (attacker === "player") log(`Player hit Enemy Spawner for -${applied} Health`);
    onDamage({ ...spawner, health, previousHealth: spawner.health }, at);
    if (health === 0) {
      timeSystem.unregisterTickable(`enemy-spawner:${id}`);
      occupancy.remove(id);
      log("Enemy Spawner died");
      onChange();
      return null;
    }
    const updated = occupancy.update(id, { health });
    onChange();
    return updated;
  };

  return Object.freeze({ addSpawner, damage });
}
