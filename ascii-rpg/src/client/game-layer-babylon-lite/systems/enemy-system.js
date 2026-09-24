import { ENEMY_GLYPH } from "./world-system.js";
import { calculatePlayerDamageTaken } from "./combat-stats-system.js";
import { AStarUtility } from "../utilities/a-star-utility.js";

export { ENEMY_GLYPH };
export const ENEMY_HEALTH = 40;
export const ENEMY_ATTACK_DAMAGE = 5;
export const ENEMY_ACTION_INTERVAL = 2;
export const ENEMY_NAVIGATION_RADIUS = 64;
export const DEFAULT_ENEMY_FACING = "left";

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
  return AStarUtility.createDistanceField(world, target, { isBlocked, isBlockedIndex, maxDistance });
}

export function createEnemySystem({
  timeSystem,
  occupancy,
  getPlayerState,
  damagePlayer = () => {},
  combatStatsSystem,
  resolveIncomingContact = null,
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
      const defense = combatStatsSystem?.getDefenseSnapshot?.();
      const resolved = resolveIncomingContact?.({ enemy, event, maximumDamage: ENEMY_ATTACK_DAMAGE });
      const damage = resolved?.handled
        ? resolved.damage
        : defense ? calculatePlayerDamageTaken(ENEMY_ATTACK_DAMAGE, defense.current, defense.maximum) : ENEMY_ATTACK_DAMAGE;
      damagePlayer(damage, { enemy, event, maximumDamage: ENEMY_ATTACK_DAMAGE, defense });
      log(`Enemy hit Player for -${damage} Health`);
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
        if (occupancy.move(id, cell)) {
          if (direction.x !== 0) occupancy.update(id, { facing: direction.x > 0 ? "right" : "left" });
          onChange();
        }
        return;
      }
    };

    if (manhattanDistance(enemy.cell, player.cell) > navigationRadius) {
      const route = AStarUtility.findHierarchicalPath(player.world, enemy.cell, player.cell, {
        isBlocked: (cell) => isStaticOccupied(cell, enemy.realm),
        isBlockedIndex: isStaticOccupiedIndex,
      });
      const cell = route?.nextCell;
      if (cell && occupancy.move(id, cell)) {
        if (cell.x !== enemy.cell.x) occupancy.update(id, { facing: cell.x > enemy.cell.x ? "right" : "left" });
        onChange();
      }
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
      if (occupancy.move(id, cell)) {
        if (direction.x !== 0) occupancy.update(id, { facing: direction.x > 0 ? "right" : "left" });
        onChange();
      }
      return;
    }
  };

  const addEnemy = ({ id, realm, cell, bornAtTime = timeSystem.getTime() }) => {
    const enemy = occupancy.claim({
      id,
      type: "enemy",
      glyph: ENEMY_GLYPH,
      facing: DEFAULT_ENEMY_FACING,
      realm,
      cell,
      health: ENEMY_HEALTH,
      maxHealth: ENEMY_HEALTH,
      bornAtTime,
    });
    if (!enemy) return null;
    if (!timeSystem.registerTickable(`enemy:${id}`, (time, deltaTimeInMilliseconds) => simulate(id, { time, deltaTimeInMilliseconds }))) {
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
