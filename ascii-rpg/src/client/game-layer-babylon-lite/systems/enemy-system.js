import { ENEMY_GLYPH } from "./world-system.js";
import { calculatePlayerDamageTaken } from "./combat-stats-system.js";
import { AStarUtility, NAVIGATION_SECTOR_SIZE } from "../utilities/a-star-utility.js";

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
  getNpcTargets = () => [],
  getNpcTarget = () => null,
  damageNpc = () => {},
  damagePlayer = () => {},
  combatStatsSystem,
  resolveIncomingContact = null,
  isWalkable = (cell, realm, world) => defaultWalkable(world, cell),
  isStaticOccupied = () => false,
  isStaticOccupiedIndex = null,
  log = () => {},
  onDamage = () => {},
  onPresentation = () => {},
  onChange = () => {},
  onDistanceFieldBuilt = () => {},
  navigationRadius = ENEMY_NAVIGATION_RADIUS,
  getNavigationRevision = null,
} = {}) {
  const fieldCache = new Map();
  const routeCache = new Map();
  let fieldCacheTime = null;
  let fieldCacheWorld = null;

  const getAge = (id, time = timeSystem.getTime()) => {
    const enemy = occupancy.get(id);
    return enemy?.type === "enemy" ? Math.max(0, time - enemy.bornAtTime) : null;
  };

  const getLivingNpcTargets = (realm) => {
    const targets = getNpcTargets(realm) ?? [];
    const legacyTarget = getNpcTarget(realm);
    const candidates = Array.isArray(targets) ? targets : [targets];
    if (legacyTarget) candidates.push(legacyTarget);
    return candidates
      .filter((target) => target?.id && target?.cell && target.type === "npc" && !target.dead && target.health > 0)
      .sort((left, right) => String(left.id).localeCompare(String(right.id)));
  };

  const findNearestTargetRoute = (enemy, player, npcTargets) => {
    const candidates = [{ id: "player", type: "player", cell: player.cell, priority: 0 }, ...npcTargets.map((target) => ({ ...target, priority: 1 }))];
    const reachable = candidates.map((target) => ({
      target,
      path: AStarUtility.findPath(player.world, enemy.cell, target.cell, {
        isBlocked: (cell) => isStaticOccupied(cell, enemy.realm),
        isBlockedIndex: isStaticOccupiedIndex
          ? (x, y) => isStaticOccupiedIndex(x, y, enemy.realm)
          : null,
      }),
    })).filter(({ path }) => path?.length);
    reachable.sort((left, right) => left.path.length - right.path.length
      || left.target.priority - right.target.priority
      || String(left.target.id).localeCompare(String(right.target.id)));
    return reachable[0] ?? null;
  };

  const getDistanceField = (enemy, event, player) => {
    // Distances depend on the target and static navigation state, not time.
    // Deferred ticks can share that state even when their logical times differ.
    const fieldVersion = getNavigationRevision ? getNavigationRevision(enemy.realm) : event.time;
    const cacheKey = `${enemy.realm}:${fieldVersion}:${player.cell.x},${player.cell.y}`;
    if (fieldCacheTime !== cacheKey || fieldCacheWorld !== player.world) {
      fieldCache.clear();
      fieldCacheTime = cacheKey;
      fieldCacheWorld = player.world;
    }
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

  const turnTowardPlayerBeforeVerticalMove = (id, enemy, next, player, event) => {
    if (next.x !== enemy.cell.x || next.y === enemy.cell.y || player.cell.x === enemy.cell.x) return false;
    const facing = player.cell.x > enemy.cell.x ? "right" : "left";
    if (enemy.facing === facing) return false;
    occupancy.update(id, { facing });
    onPresentation("turn", occupancy.get(id) ?? enemy, event);
    onChange();
    return true;
  };

  const simulate = (id, event) => {
    const enemy = occupancy.get(id);
    if (!enemy) return;
    const age = event.time - enemy.bornAtTime;
    if (age < ENEMY_ACTION_INTERVAL || age % ENEMY_ACTION_INTERVAL !== 0) return;

    const player = getPlayerState(enemy.realm);
    if (!player?.alive || player.realm !== enemy.realm) return;
    const npcTargets = getLivingNpcTargets(enemy.realm);
    if (npcTargets.length) {
      const selected = findNearestTargetRoute(enemy, player, npcTargets);
      if (!selected) return;
      const target = selected.target;
      if (selected.path.length === 2) {
        if (target.type === "npc") {
          damageNpc(target.id, ENEMY_ATTACK_DAMAGE, { enemy, event });
          log(`Enemy hit NPC for -${ENEMY_ATTACK_DAMAGE} Health`);
        } else {
          const defense = combatStatsSystem?.getDefenseSnapshot?.();
          const resolved = resolveIncomingContact?.({ enemy, event, maximumDamage: ENEMY_ATTACK_DAMAGE });
          const damage = resolved?.handled
            ? resolved.damage
            : defense ? calculatePlayerDamageTaken(ENEMY_ATTACK_DAMAGE, defense.current, defense.maximum) : ENEMY_ATTACK_DAMAGE;
          damagePlayer(damage, { enemy, event, maximumDamage: ENEMY_ATTACK_DAMAGE, defense });
          log(`Enemy hit Player for -${damage} Health`);
        }
        onPresentation("attack", occupancy.get(id) ?? enemy, event);
        onChange();
        return;
      }
      const next = selected.path[1];
      if (target.type === "player" && next && turnTowardPlayerBeforeVerticalMove(id, enemy, next, player, event)) return;
      if (next && occupancy.move(id, next)) {
        if (next.x !== enemy.cell.x) occupancy.update(id, { facing: next.x > enemy.cell.x ? "right" : "left" });
        onPresentation("move", occupancy.get(id) ?? enemy, event);
        onChange();
      }
      return;
    }
    if (manhattanDistance(enemy.cell, player.cell) === 1) {
      const defense = combatStatsSystem?.getDefenseSnapshot?.();
      const resolved = resolveIncomingContact?.({ enemy, event, maximumDamage: ENEMY_ATTACK_DAMAGE });
      const damage = resolved?.handled
        ? resolved.damage
        : defense ? calculatePlayerDamageTaken(ENEMY_ATTACK_DAMAGE, defense.current, defense.maximum) : ENEMY_ATTACK_DAMAGE;
      damagePlayer(damage, { enemy, event, maximumDamage: ENEMY_ATTACK_DAMAGE, defense });
      log(`Enemy hit Player for -${damage} Health`);
      onPresentation("attack", occupancy.get(id) ?? enemy, event);
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
        if (turnTowardPlayerBeforeVerticalMove(id, enemy, cell, player, event)) return;
        if (occupancy.move(id, cell)) {
          if (direction.x !== 0) occupancy.update(id, { facing: direction.x > 0 ? "right" : "left" });
          onPresentation("move", occupancy.get(id) ?? enemy, event);
          onChange();
        }
        return;
      }
    };

    if (manhattanDistance(enemy.cell, player.cell) > navigationRadius) {
      const revision = getNavigationRevision?.(enemy.realm);
      const targetSector = `${Math.floor(player.cell.x / NAVIGATION_SECTOR_SIZE)},${Math.floor(player.cell.y / NAVIGATION_SECTOR_SIZE)}`;
      let cached = routeCache.get(id);
      if (!getNavigationRevision || !cached || cached.world !== player.world || cached.revision !== revision
        || cached.targetSector !== targetSector || cached.x !== enemy.cell.x || cached.y !== enemy.cell.y
        // A one-cell result has no step for this unchanged navigation state.
        // Keep that negative result until the target, terrain or origin changes.
        || (cached.path.length > 1 && cached.cursor >= cached.path.length)) {
        const route = AStarUtility.findHierarchicalPath(player.world, enemy.cell, player.cell, {
          terrainRevision: revision ?? 0,
          isBlocked: (cell) => isStaticOccupied(cell, enemy.realm),
          isBlockedIndex: isStaticOccupiedIndex ? (x, y) => isStaticOccupiedIndex(x, y, enemy.realm) : null,
        });
        cached = { world: player.world, revision, targetSector, x: enemy.cell.x, y: enemy.cell.y, path: route?.path ?? [], cursor: 1 };
        if (getNavigationRevision) routeCache.set(id, cached);
      }
      const cell = cached.path[cached.cursor];
      if (cell && (!isWalkable(cell, enemy.realm, player.world) || isStaticOccupied(cell, enemy.realm))) {
        routeCache.delete(id);
        return;
      }
      if (cell && turnTowardPlayerBeforeVerticalMove(id, enemy, cell, player, event)) return;
      if (cell && occupancy.move(id, cell)) {
        cached.x = cell.x; cached.y = cell.y; cached.cursor += 1;
        if (cell.x !== enemy.cell.x) occupancy.update(id, { facing: cell.x > enemy.cell.x ? "right" : "left" });
        onPresentation("move", occupancy.get(id) ?? enemy, event);
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
      if (turnTowardPlayerBeforeVerticalMove(id, enemy, cell, player, event)) return;
      if (occupancy.move(id, cell)) {
        if (direction.x !== 0) occupancy.update(id, { facing: direction.x > 0 ? "right" : "left" });
        onPresentation("move", occupancy.get(id) ?? enemy, event);
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
      routeCache.delete(id);
      timeSystem.unregisterTickable(`enemy:${id}`);
      onPresentation("death", enemy, { at });
      occupancy.remove(id);
      log("Enemy died");
      onChange();
      return null;
    }
    const updated = occupancy.update(id, { health });
    onChange();
    return updated;
  };

  return Object.freeze({ addEnemy, damage, getAge, get(id) { return occupancy.get(id); } });
}
