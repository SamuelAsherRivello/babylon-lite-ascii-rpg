import { AStarUtility } from "../utilities/a-star-utility.js";

export const NPC_GLYPH = "☺";
export const NPC_ACTION_INTERVAL = 20;

const CARDINAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }), Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }), Object.freeze({ x: -1, y: 0 }),
]);

function pick(values, random) {
  return values.length ? values[Math.min(values.length - 1, Math.floor(random() * values.length))] : null;
}

export function createNpcSystem({ timeSystem, occupancy, worldFor, isWalkable, isStaticOccupied = () => false, randomFor = () => Math.random, onChange = () => {} } = {}) {
  const createPatrol = (npc, world, random) => {
    const field = AStarUtility.createDistanceField(world, npc.home, { isBlocked: (cell) => isStaticOccupied(cell, npc.realm) });
    const preferredDistance = random() < 0.5 ? 15 : 20;
    const candidates = [];
    for (let y = 0; y < world.rows; y += 1) for (let x = 0; x < world.columns; x += 1) {
      const cell = { x, y };
      if (field.getDistance(cell) === preferredDistance) candidates.push(cell);
    }
    let destination = candidates.length ? pick(candidates, random) : null;
    const fallbackDistance = preferredDistance === 15 ? 20 : 15;
    if (!destination) {
      for (let y = 0; y < world.rows; y += 1) for (let x = 0; x < world.columns; x += 1) {
        const cell = { x, y };
        if (field.getDistance(cell) === fallbackDistance) candidates.push(cell);
      }
      destination = pick(candidates, random);
    }
    if (!destination) return null;
    const reverseRoute = [{ ...destination }];
    let current = destination;
    while (field.getDistance(current) > 0) {
      const distance = field.getDistance(current);
      const previous = CARDINAL_DIRECTIONS.map((direction) => ({ x: current.x + direction.x, y: current.y + direction.y }))
        .find((cell) => field.getDistance(cell) === distance - 1);
      if (!previous) return null;
      reverseRoute.push(previous);
      current = previous;
    }
    const route = reverseRoute.reverse().slice(1).map((cell) => Object.freeze({ ...cell }));
    return Object.freeze({ destination: Object.freeze({ ...destination }), route: Object.freeze(route) });
  };
  const simulate = (id, event) => {
    const npc = occupancy.get(id);
    if (!npc) return;
    const age = event.time - npc.bornAtTime;
    if (age < NPC_ACTION_INTERVAL || age % NPC_ACTION_INTERVAL !== 0) return;
    if (!npc.route?.length) return;
    const target = npc.returning
      ? (npc.routeIndex < 0 ? npc.home : npc.route[npc.routeIndex])
      : npc.route[npc.routeIndex];
    if (!target || !isWalkable(target, npc.realm) || isStaticOccupied(target, npc.realm)) return;
    if (occupancy.move(id, target)) {
      if (!npc.returning && npc.routeIndex === npc.route.length - 1) occupancy.update(id, { returning: true, routeIndex: npc.route.length - 2 });
      else if (npc.returning && npc.routeIndex < 0) occupancy.update(id, { returning: false, routeIndex: 0 });
      else occupancy.update(id, { routeIndex: npc.returning ? npc.routeIndex - 1 : npc.routeIndex + 1 });
      onChange();
    }
  };
  const addNpc = ({ id, realm, cell, bornAtTime = timeSystem.getTime(), home = cell }) => {
    const world = worldFor(realm);
    const draft = { id, realm, home: Object.freeze({ ...home }) };
    const patrol = world ? createPatrol(draft, world, randomFor(draft, bornAtTime)) : null;
    const npc = occupancy.claim({ id, type: "npc", glyph: NPC_GLYPH, realm, cell, home: Object.freeze({ ...home }), bornAtTime, destination: patrol?.destination ?? null, route: patrol?.route ?? Object.freeze([]), routeIndex: 0, returning: false });
    if (!npc) return null;
    if (!timeSystem.registerTickable(`npc:${id}`, (event) => simulate(id, event))) { occupancy.remove(id); return null; }
    onChange();
    return npc;
  };
  return Object.freeze({ addNpc });
}
