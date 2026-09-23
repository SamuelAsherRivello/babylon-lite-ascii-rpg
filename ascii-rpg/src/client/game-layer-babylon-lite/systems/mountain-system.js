import { FLOOR_GLYPH, REALM_PROFILES } from "./world-system.js";

export function getDiggableMountainTarget(world, realm, cell) {
  if (realm !== "Overground" || !world || !cell) return null;
  if (cell.x <= 0 || cell.y <= 0 || cell.x >= world.columns - 1 || cell.y >= world.rows - 1) return null;
  const terrain = world.terrain?.[cell.y]?.[cell.x];
  if (terrain?.kind !== "mountain" || !Number.isFinite(terrain.health) || terrain.health <= 0) return null;
  return {
    id: `mountain:${realm}:${cell.x}:${cell.y}`,
    type: "mountain",
    health: terrain.health,
    maxHealth: terrain.maxHealth,
    realm,
    cell: { x: cell.x, y: cell.y },
    terrain,
  };
}

export function damageMountainTarget(target, amount) {
  const terrain = target?.terrain;
  if (target?.type !== "mountain" || !Number.isFinite(terrain?.health) || terrain.health <= 0) {
    return Object.freeze({ handled: false, killed: false });
  }
  const previousHealth = terrain.health;
  const appliedDamage = Math.min(previousHealth, Math.max(0, Number(amount) || 0));
  if (appliedDamage <= 0) return Object.freeze({ handled: false, killed: false });
  terrain.health = Math.max(0, previousHealth - appliedDamage);
  const killed = terrain.health === 0;
  if (killed) {
    terrain.kind = REALM_PROFILES.Overground.groundKind;
    terrain.glyph = FLOOR_GLYPH;
    terrain.color = REALM_PROFILES.Overground.groundColor;
    terrain.walkable = true;
    delete terrain.health;
    delete terrain.maxHealth;
  }
  return Object.freeze({
    handled: true,
    killed,
    appliedDamage,
    target: Object.freeze({
      ...target,
      health: killed ? 0 : terrain.health,
      previousHealth,
      terrain: undefined,
    }),
  });
}
