function isSameCell(left, right) {
  return left?.x === right?.x && left?.y === right?.y;
}

export function createPickupSystem() {
  const pickups = new Map();
  const listeners = new Set();

  const emit = (event) => {
    for (const listener of listeners) listener(Object.freeze({ ...event }));
  };

  return Object.freeze({
    addPickup({ id, type, cell, effect, glyph = null }) {
      if (!id || !type || !cell || typeof effect !== "function") throw new TypeError("A pickup needs an id, type, cell, and effect.");
      const pickup = { id, type, cell: { x: cell.x, y: cell.y }, glyph, effect, active: true };
      pickups.set(id, pickup);
      return pickup;
    },
    collectAtCell(cell, context = {}) {
      const pickup = [...pickups.values()].find((candidate) => candidate.active && isSameCell(candidate.cell, cell));
      if (!pickup) return null;
      pickup.active = false;
      pickup.effect(context);
      const event = { type: "pickup-collected", pickupId: pickup.id, pickupType: pickup.type, cell: { ...pickup.cell } };
      emit(event);
      return event;
    },
    getPickups() {
      return Object.freeze([...pickups.values()].map(({ effect, ...pickup }) => Object.freeze({ ...pickup })));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export function selectPickupCells(world, start, distances, random = Math.random, tolerance = 8) {
  const cells = [];
  const reserved = new Set([`${start.x},${start.y}`]);
  const candidates = [];
  for (let y = 1; y < world.rows - 1; y += 1) for (let x = 1; x < world.columns - 1; x += 1) {
    if (!world.terrain[y][x]?.walkable) continue;
    if (world.characters?.[y]?.[x] !== null && world.characters?.[y]?.[x] !== undefined) continue;
    const distance = Math.hypot(x - start.x, y - start.y);
    candidates.push({ x, y, distance });
  }
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  for (const target of distances) {
    const matching = candidates
      .filter((candidate) => !reserved.has(`${candidate.x},${candidate.y}`)
        && Math.abs(candidate.distance - target) <= tolerance
        && cells.every((cell) => Math.hypot(candidate.x - cell.x, candidate.y - cell.y) >= 3))
      .sort((left, right) => Math.abs(left.distance - target) - Math.abs(right.distance - target));
    const selected = matching[0] ?? candidates
      .filter((candidate) => !reserved.has(`${candidate.x},${candidate.y}`))
      .sort((left, right) => Math.abs(left.distance - target) - Math.abs(right.distance - target))[0];
    if (!selected) continue;
    const cell = { x: selected.x, y: selected.y };
    cells.push(cell);
    reserved.add(`${cell.x},${cell.y}`);
  }
  return cells;
}
