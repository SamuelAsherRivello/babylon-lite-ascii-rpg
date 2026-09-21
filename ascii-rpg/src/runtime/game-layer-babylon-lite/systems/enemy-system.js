import { ENEMY_GLYPH } from "./world-system.js";

export { ENEMY_GLYPH };
export const ENEMY_HEALTH = 100;
export const ENEMY_ATTACK_DAMAGE = 5;
export const ENEMY_ACTION_INTERVAL = 2;
export const ENEMY_NAVIGATION_RADIUS = 64;

const CARDINAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }),
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: -1, y: 0 }),
]);

function manhattanDistance(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function defaultWalkable(world, cell) {
  return Boolean(world?.terrain?.[cell.y]?.[cell.x]?.walkable);
}

export function createCardinalDistanceField(world, target, {
  isBlocked = () => false,
  isBlockedIndex = null,
  maxDistance = Number.POSITIVE_INFINITY,
} = {}) {
  const rows = world?.rows ?? world?.terrain?.length ?? 0;
  const columns = world?.columns ?? world?.terrain?.[0]?.length ?? 0;
  const finiteRadius = Number.isFinite(maxDistance) ? Math.max(0, Math.floor(maxDistance)) : null;
  const minimumX = finiteRadius === null ? 0 : Math.max(0, target.x - finiteRadius);
  const maximumX = finiteRadius === null ? columns - 1 : Math.min(columns - 1, target.x + finiteRadius);
  const minimumY = finiteRadius === null ? 0 : Math.max(0, target.y - finiteRadius);
  const maximumY = finiteRadius === null ? rows - 1 : Math.min(rows - 1, target.y + finiteRadius);
  const fieldColumns = Math.max(0, maximumX - minimumX + 1);
  const fieldRows = Math.max(0, maximumY - minimumY + 1);
  const fieldSize = fieldRows * fieldColumns;
  const distances = new Int32Array(fieldSize);
  distances.fill(-1);

  const inBounds = (x, y) => x >= minimumX && y >= minimumY && x <= maximumX && y <= maximumY;
  const getIndex = (x, y) => (y - minimumY) * fieldColumns + x - minimumX;
  const blockedAt = isBlockedIndex ?? ((x, y) => isBlocked({ x, y }));
  if (inBounds(target.x, target.y) && world.terrain?.[target.y]?.[target.x]?.walkable) {
    const queueX = new Int32Array(fieldSize);
    const queueY = new Int32Array(fieldSize);
    let head = 0;
    let tail = 1;
    queueX[0] = target.x;
    queueY[0] = target.y;
    distances[getIndex(target.x, target.y)] = 0;

    const visit = (x, y, distance) => {
      if (!inBounds(x, y)) return;
      const index = getIndex(x, y);
      if (distances[index] !== -1 || !world.terrain[y][x].walkable
        || (blockedAt(x, y) && (x !== target.x || y !== target.y))) return;
      distances[index] = distance;
      queueX[tail] = x;
      queueY[tail] = y;
      tail += 1;
    };

    while (head < tail) {
      const x = queueX[head];
      const y = queueY[head];
      head += 1;
      const distance = distances[getIndex(x, y)] + 1;
      if (distance > maxDistance) continue;
      visit(x, y - 1, distance);
      visit(x + 1, y, distance);
      visit(x, y + 1, distance);
      visit(x - 1, y, distance);
    }
  }

  return Object.freeze({
    getDistance(cell) {
      return inBounds(cell.x, cell.y) ? distances[getIndex(cell.x, cell.y)] : -1;
    },
  });
}

export function createEnemySystem({
  timeSystem,
  occupancy,
  getPlayerState,
  damagePlayer = () => {},
  isWalkable = (cell, realm, world) => defaultWalkable(world, cell),
  isStaticOccupied = () => false,
  isStaticOccupiedIndex = null,
  log = () => {},
  onDamage = () => {},
  onChange = () => {},
  onDistanceFieldBuilt = () => {},
  navigationRadius = ENEMY_NAVIGATION_RADIUS,
} = {}) {
  const fieldCache = new Map();
  let fieldCacheTime = null;

  const getAge = (id, time = timeSystem.getTime()) => {
    const enemy = occupancy.get(id);
    return enemy?.type === "enemy" ? Math.max(0, time - enemy.bornAtTime) : null;
  };

  const getDistanceField = (enemy, event, player) => {
    if (fieldCacheTime !== event.time) {
      fieldCache.clear();
      fieldCacheTime = event.time;
    }
    const cacheKey = `${enemy.realm}:${event.time}:${player.cell.x},${player.cell.y}`;
    if (!fieldCache.has(cacheKey)) {
      fieldCache.set(cacheKey, createCardinalDistanceField(player.world, player.cell, {
        isBlocked: (cell) => isStaticOccupied(cell, enemy.realm),
        isBlockedIndex: isStaticOccupiedIndex
          ? (x, y) => isStaticOccupiedIndex(x, y, enemy.realm)
          : null,
        maxDistance: navigationRadius,
      }));
      onDistanceFieldBuilt(enemy.realm, event.time);
    }
    return fieldCache.get(cacheKey);
  };

  const simulate = (id, event) => {
    const enemy = occupancy.get(id);
    if (!enemy) return;
    const age = event.time - enemy.bornAtTime;
    if (age < ENEMY_ACTION_INTERVAL || age % ENEMY_ACTION_INTERVAL !== 0) return;

    const player = getPlayerState(enemy.realm);
    if (!player?.alive || player.realm !== enemy.realm) return;
    if (manhattanDistance(enemy.cell, player.cell) === 1) {
      damagePlayer(ENEMY_ATTACK_DAMAGE, { enemy, event });
      log(`Enemy hit Player for -${ENEMY_ATTACK_DAMAGE} Health`);
      onChange();
      return;
    }

    const takeGreedyStep = () => {
      const currentManhattanDistance = manhattanDistance(enemy.cell, player.cell);
      for (const direction of CARDINAL_DIRECTIONS) {
        const cell = { x: enemy.cell.x + direction.x, y: enemy.cell.y + direction.y };
        if (manhattanDistance(cell, player.cell) >= currentManhattanDistance
          || !isWalkable(cell, enemy.realm, player.world)
          || isStaticOccupied(cell, enemy.realm)) continue;
        if (occupancy.move(id, cell)) onChange();
        return;
      }
    };

    if (manhattanDistance(enemy.cell, player.cell) > navigationRadius) {
      takeGreedyStep();
      return;
    }

    const field = getDistanceField(enemy, event, player);
    const currentDistance = field.getDistance(enemy.cell);
    if (currentDistance < 0) {
      takeGreedyStep();
      return;
    }
    if (currentDistance < 1) return;
    for (const direction of CARDINAL_DIRECTIONS) {
      const cell = { x: enemy.cell.x + direction.x, y: enemy.cell.y + direction.y };
      if (!isWalkable(cell, enemy.realm, player.world) || isStaticOccupied(cell, enemy.realm)
        || field.getDistance(cell) !== currentDistance - 1) continue;
      if (occupancy.move(id, cell)) onChange();
      return;
    }
  };

  const addEnemy = ({ id, realm, cell, bornAtTime = timeSystem.getTime() }) => {
    const enemy = occupancy.claim({
      id,
      type: "enemy",
      glyph: ENEMY_GLYPH,
      realm,
      cell,
      health: ENEMY_HEALTH,
      maxHealth: ENEMY_HEALTH,
      bornAtTime,
    });
    if (!enemy) return null;
    if (!timeSystem.registerTickable(`enemy:${id}`, (event) => simulate(id, event))) {
      occupancy.remove(id);
      return null;
    }
    onChange();
    return enemy;
  };

  const damage = (id, amount, { attacker = null, at = globalThis.performance?.now?.() ?? Date.now() } = {}) => {
    const enemy = occupancy.get(id);
    if (!enemy || enemy.type !== "enemy" || amount <= 0) return enemy;
    const applied = Math.min(enemy.health, amount);
    const health = enemy.health - applied;
    if (attacker === "player") log(`Player hit Enemy for -${applied} Health`);
    onDamage({ ...enemy, health, previousHealth: enemy.health }, at);
    if (health === 0) {
      timeSystem.unregisterTickable(`enemy:${id}`);
      occupancy.remove(id);
      log("Enemy died");
      onChange();
      return null;
    }
    const updated = occupancy.update(id, { health });
    onChange();
    return updated;
  };

  return Object.freeze({ addEnemy, damage, getAge });
}
