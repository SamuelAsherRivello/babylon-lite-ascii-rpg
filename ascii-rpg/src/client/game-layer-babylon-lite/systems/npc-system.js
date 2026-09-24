import { AStarUtility } from "../utilities/a-star-utility.js";

export const NPC_GLYPH = "☺";
export const NPC_DEAD_GLYPH = "☹";
export const NPC_HEALTH = 100;
export const NPC_ACTION_INTERVAL = 20;
export const NPC_FOLLOW_DISTANCE = 3;
export const NPC_FOLLOW_MAX_DISTANCE = 5;
const MIN_PATROL_DISTANCE = 15;
const MAX_PATROL_DISTANCE = 20;
const MAX_PATROL_DESTINATION_ATTEMPTS = 32;
const PATROL_SEARCH_NODES_PER_SLICE = 64;

export function createNpcSystem({ timeSystem, occupancy, occupancyFor = () => occupancy, worldFor, isWalkable, isStaticOccupied = () => false, randomFor = () => Math.random, getPlayerState = null, resolvePlayerContact = null, onDamage = () => {}, onChange = () => {}, deferredScheduler = null, isActive = () => true, isRealmActive = () => true } = {}) {
  const getOccupancies = () => {
    const value = occupancyFor();
    return value && typeof value[Symbol.iterator] === "function" ? [...value] : [value];
  };
  const getFollowTarget = (npc, player, world) => {
    const behind = player.facing === "left" ? { x: 1, y: 0 } : { x: -1, y: 0 };
    const targets = [];
    for (let distance = NPC_FOLLOW_DISTANCE; distance <= NPC_FOLLOW_MAX_DISTANCE; distance += 1) {
      targets.push({ x: player.cell.x + behind.x * distance, y: player.cell.y });
      targets.push({ x: player.cell.x, y: player.cell.y - distance });
      targets.push({ x: player.cell.x, y: player.cell.y + distance });
    }
    return targets.find((target) => world?.terrain?.[target.y]?.[target.x]?.walkable
      && !isStaticOccupied(target, npc.realm)) ?? null;
  };
  const patrolDestinations = (npc, world) => {
    const destinations = [];
    const knownDestinations = new Set();
    for (let distance = MIN_PATROL_DISTANCE; distance <= MAX_PATROL_DISTANCE; distance += 1) for (let horizontalDistance = 0; horizontalDistance <= distance; horizontalDistance += 1) {
      const verticalDistance = distance - horizontalDistance;
      for (const [horizontalSign, verticalSign] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const destination = { x: npc.home.x + horizontalDistance * horizontalSign, y: npc.home.y + verticalDistance * verticalSign };
        const key = `${destination.x},${destination.y}`;
        if (knownDestinations.has(key) || !world.terrain?.[destination.y]?.[destination.x]?.walkable || isStaticOccupied(destination, npc.realm)) continue;
        knownDestinations.add(key);
        destinations.push(destination);
      }
    }
    return destinations;
  };
  // Keep the synchronous path for systems that do not opt into game-owned
  // deferred work (including deterministic fixture callers).
  const createPatrol = (npc, world, random) => {
    const destinations = patrolDestinations(npc, world);
    for (let attempt = 0; attempt < MAX_PATROL_DESTINATION_ATTEMPTS && destinations.length; attempt += 1) {
      const index = Math.min(destinations.length - 1, Math.floor(random() * destinations.length));
      const [destination] = destinations.splice(index, 1);
      const path = AStarUtility.findPath(world, npc.home, destination, { isBlocked: (cell) => isStaticOccupied(cell, npc.realm) });
      if (!path?.length) continue;
      const route = path.slice(1).map((cell) => Object.freeze({ ...cell }));
      if (route.length) return Object.freeze({ destination: Object.freeze({ ...destination }), route: Object.freeze(route) });
    }
    return null;
  };
  const createPatrolPreparation = (npc, world, random) => {
    const destinations = patrolDestinations(npc, world);
    let attempts = 0;
    let destination = null;
    let search = null;
    return Object.freeze({
      step() {
        if (!search) {
          if (attempts >= MAX_PATROL_DESTINATION_ATTEMPTS || !destinations.length) return Object.freeze({ done: true, patrol: null });
          const index = Math.min(destinations.length - 1, Math.floor(random() * destinations.length));
          [destination] = destinations.splice(index, 1);
          search = AStarUtility.createResumablePathSearch(world, npc.home, destination, { isBlocked: (cell) => isStaticOccupied(cell, npc.realm) });
        }
        const progress = search.step(PATROL_SEARCH_NODES_PER_SLICE);
        if (!progress.done) return Object.freeze({ done: false, patrol: null });
        const route = progress.path?.slice(1).map((cell) => Object.freeze({ ...cell })) ?? [];
        search = null;
        attempts += 1;
        if (!route.length) return Object.freeze({ done: false, patrol: null });
        return Object.freeze({ done: true, patrol: Object.freeze({ destination: Object.freeze({ ...destination }), route: Object.freeze(route) }) });
      },
    });
  };
  const deferredJobs = new Set();
  const followNpc = (id) => {
    const currentOccupancy = getOccupancies().find((candidate) => candidate?.get(id)) ?? occupancy;
    const npc = currentOccupancy.get(id);
    if (!npc || !npc.recruited || npc.dead) return false;
    const player = getPlayerState?.(npc.realm);
    if (!player?.alive) return false;
    const world = worldFor(npc.realm);
    const target = getFollowTarget(npc, player, world);
    const distance = Math.abs(npc.cell.x - player.cell.x) + Math.abs(npc.cell.y - player.cell.y);
    if (!target || distance <= NPC_FOLLOW_MAX_DISTANCE) return false;
    const path = AStarUtility.findPath(world, npc.cell, target, { isBlocked: (cell) => isStaticOccupied(cell, npc.realm) });
    const next = path?.[1];
    if (!next || !isWalkable(next, npc.realm) || !currentOccupancy.move(id, next)) return false;
    const current = currentOccupancy.get(id);
    if (current && next.x !== current.cell.x) currentOccupancy.update(id, { facing: next.x > current.cell.x ? "right" : "left" });
    onChange();
    return true;
  };
  const simulate = (id, event) => {
    const currentOccupancy = getOccupancies().find((candidate) => candidate?.get(id)) ?? occupancy;
    const npc = currentOccupancy.get(id);
    if (!npc) return;
    const age = event.time - npc.bornAtTime;
    if (age < NPC_ACTION_INTERVAL || age % NPC_ACTION_INTERVAL !== 0) return;
    if (npc.patrolState === "pending") {
      if (npc.pendingActionAt === null) currentOccupancy.update(id, { pendingActionAt: event.time });
      return;
    }
    const player = getPlayerState?.(npc.realm);
    if (npc.dead) return;
    if (npc.recruited && player?.alive) { followNpc(id); return; }
    if (player?.alive && Math.abs(npc.cell.x - player.cell.x) + Math.abs(npc.cell.y - player.cell.y) === 1) {
      const contact = resolvePlayerContact?.({ npc, player, event });
      if (contact?.handled) return;
    }
    if (!npc.route?.length) return;
    const target = npc.returning
      ? (npc.routeIndex < 0 ? npc.home : npc.route[npc.routeIndex])
      : npc.route[npc.routeIndex];
    if (!target || !isWalkable(target, npc.realm) || isStaticOccupied(target, npc.realm)) return;
    if (currentOccupancy.move(id, target)) {
      if (!npc.returning && npc.routeIndex === npc.route.length - 1) currentOccupancy.update(id, { returning: true, routeIndex: npc.route.length - 2 });
      else if (npc.returning && npc.routeIndex < 0) currentOccupancy.update(id, { returning: false, routeIndex: 0 });
      else currentOccupancy.update(id, { routeIndex: npc.returning ? npc.routeIndex - 1 : npc.routeIndex + 1 });
      onChange();
    }
  };
  const addNpc = ({ id, realm, cell, bornAtTime = timeSystem.getTime(), home = cell }) => {
    const world = worldFor(realm);
    const draft = { id, realm, home: Object.freeze({ ...home }) };
    const random = randomFor(draft, bornAtTime);
    const patrol = deferredScheduler || !world ? null : createPatrol(draft, world, random);
    const npc = occupancy.claim({ id, type: "npc", glyph: NPC_GLYPH, realm, cell, home: Object.freeze({ ...home }), bornAtTime, destination: patrol?.destination ?? null, route: patrol?.route ?? Object.freeze([]), routeIndex: 0, returning: false, recruited: false, dead: false, health: NPC_HEALTH, maxHealth: NPC_HEALTH, ...(deferredScheduler ? { patrolState: "pending", pendingActionAt: null } : {}) });
    if (!npc) return null;
    if (!timeSystem.registerTickable(`npc:${id}`, (time, deltaTimeInMilliseconds) => simulate(id, { time, deltaTimeInMilliseconds }))) { occupancy.remove(id); return null; }
    if (deferredScheduler && world) {
      const preparation = createPatrolPreparation(draft, world, random);
      const jobId = `npc-patrol:${id}`;
      const handle = deferredScheduler.enqueue({
        id: jobId,
        priority: 10,
        metadata: Object.freeze({ type: "npc-patrol", id, realm }),
        run: () => {
          const current = occupancy.get(id);
          if (!isActive() || !current || current.type !== "npc" || current.bornAtTime !== bornAtTime) return "cancelled";
          if (!isRealmActive(realm)) return "pending";
          let prepared;
          try { prepared = preparation.step(); }
          catch (error) {
            occupancy.update(id, { patrolState: "ready", destination: null, route: Object.freeze([]), pendingActionAt: null });
            deferredJobs.delete(jobId);
            throw error;
          }
          if (!prepared.done) return "pending";
          occupancy.update(id, { patrolState: "ready", destination: prepared.patrol?.destination ?? null, route: prepared.patrol?.route ?? Object.freeze([]) });
          const ready = occupancy.get(id);
          if (ready?.pendingActionAt !== null) {
            const actionAt = ready.pendingActionAt;
            occupancy.update(id, { pendingActionAt: null });
            simulate(id, { time: actionAt, cause: "deferred-patrol" });
          }
          onChange();
          deferredJobs.delete(jobId);
          return "done";
        },
      });
      if (!handle) occupancy.update(id, { patrolState: "ready" });
      else deferredJobs.add(handle.id);
    } else if (deferredScheduler) {
      occupancy.update(id, { patrolState: "ready" });
    }
    onChange();
    return npc;
  };
  const recruitNpc = (id) => {
    const currentOccupancy = getOccupancies().find((candidate) => candidate?.get(id)) ?? occupancy;
    const npc = currentOccupancy.get(id);
    if (!npc || npc.type !== "npc" || npc.dead) return false;
    currentOccupancy.update(id, { recruited: true, patrolState: "ready", route: Object.freeze([]), routeIndex: 0, returning: false });
    onChange();
    return true;
  };
  const damageNpc = (id, amount, { at = globalThis.performance?.now?.() ?? Date.now() } = {}) => {
    const currentOccupancy = getOccupancies().find((candidate) => candidate?.get(id)) ?? occupancy;
    const npc = currentOccupancy.get(id);
    if (!npc || npc.type !== "npc" || npc.dead || amount <= 0) return npc;
    const applied = Math.min(npc.health, amount);
    const health = npc.health - applied;
    onDamage({ ...npc, health, previousHealth: npc.health }, at);
    if (health <= 0) {
      timeSystem.unregisterTickable(`npc:${id}`);
      const dead = currentOccupancy.update(id, { health: 0, dead: true, glyph: NPC_DEAD_GLYPH });
      onChange();
      return dead;
    }
    const updated = currentOccupancy.update(id, { health });
    onChange();
    return updated;
  };
  const removeNpc = (id) => {
    const currentOccupancy = getOccupancies().find((candidate) => candidate?.get(id)) ?? occupancy;
    const removed = currentOccupancy.get(id);
    if (!removed || removed.type !== "npc") return false;
    deferredScheduler?.cancel(`npc-patrol:${id}`);
    deferredJobs.delete(`npc-patrol:${id}`);
    timeSystem.unregisterTickable(`npc:${id}`);
    return Boolean(currentOccupancy.remove(id));
  };
  const updateFollowers = () => {
    let moved = false;
    for (const realmOccupancy of getOccupancies()) for (const npc of realmOccupancy.getAll("npc")) moved = followNpc(npc.id) || moved;
    return moved;
  };
  const transferParty = (realm, playerCell) => {
    const destinationOccupancy = occupancyFor(realm);
    const candidates = [];
    for (let distance = NPC_FOLLOW_DISTANCE; distance <= NPC_FOLLOW_MAX_DISTANCE; distance += 1) {
      candidates.push({ x: playerCell.x - distance, y: playerCell.y });
      candidates.push({ x: playerCell.x + distance, y: playerCell.y });
      candidates.push({ x: playerCell.x, y: playerCell.y - distance });
      candidates.push({ x: playerCell.x, y: playerCell.y + distance });
    }
    let moved = false;
    for (const sourceOccupancy of getOccupancies()) {
      for (const npc of sourceOccupancy.getAll("npc")) {
        if (!npc.recruited || npc.dead || npc.realm === realm) continue;
        const available = candidates.filter((cell) => worldFor(realm)?.terrain?.[cell.y]?.[cell.x]?.walkable
          && !isStaticOccupied(cell, realm) && !destinationOccupancy.isOccupied(cell));
        if (!available.length) continue;
        const target = available
          .slice()
          .sort((left, right) => (Math.abs(left.x - playerCell.x) + Math.abs(left.y - playerCell.y))
            - (Math.abs(right.x - playerCell.x) + Math.abs(right.y - playerCell.y))
            || left.y - right.y
            || left.x - right.x)[0];
        sourceOccupancy.remove(npc.id);
        destinationOccupancy.claim({ ...npc, realm, cell: target });
        moved = true;
      }
    }
    if (moved) onChange();
    return moved;
  };
  const damage = (id, amount, { at = globalThis.performance?.now?.() ?? Date.now() } = {}) => {
    const npc = occupancy.get(id);
    if (!npc || npc.type !== "npc" || amount <= 0) return npc;
    const appliedDamage = Math.min(npc.health, Math.max(0, Number(amount) || 0));
    const health = npc.health - appliedDamage;
    onDamage({ ...npc, health, previousHealth: npc.health }, at);
    if (health === 0) { removeNpc(id); onChange(); return null; }
    const updated = occupancy.update(id, { health });
    onChange();
    return updated;
  };
  return Object.freeze({ addNpc, recruitNpc, transferParty, updateFollowers, damage, damageNpc, removeNpc, dispose() { for (const id of deferredJobs) deferredScheduler?.cancel(id); deferredJobs.clear(); } });
}
