export const BOMB_GLYPH = "💣";
export const BLAST_GLYPH = "✶";
export const BOMB_COUNT = 50;
export const BOMB_FUSE_TICKS = 5;
export const BOMB_BLAST_TICKS = 5;
export const BOMB_BLAST_DAMAGE = 100;
const cellKey = (cell) => `${cell.x},${cell.y}`;

export function getBlastRingCells(origin, radius, previousRadius = radius - 1, bounds = null) {
  const cells = [];
  for (let y = origin.y - radius; y <= origin.y + radius; y += 1) {
    for (let x = origin.x - radius; x <= origin.x + radius; x += 1) {
      if (bounds && (x < 0 || y < 0 || x >= bounds.columns || y >= bounds.rows)) continue;
      const distanceSquared = (x - origin.x) ** 2 + (y - origin.y) ** 2;
      if (distanceSquared <= radius * radius && (previousRadius === 0 || distanceSquared > previousRadius * previousRadius)) cells.push(Object.freeze({ x, y }));
    }
  }
  return cells;
}

export function createBombSystem({ timeSystem, worlds, damageAt = () => {}, onChange = () => {} } = {}) {
  const bombs = new Map();
  const blasts = new Map();
  let sequence = 0;
  const keyFor = (realm, cell) => `${realm}:${cellKey(cell)}`;
  const markChanged = () => onChange();

  const removeBomb = (bomb) => {
    bombs.delete(keyFor(bomb.realm, bomb.cell));
    markChanged();
  };

  const applyRing = (bomb, radius, previousRadius, time) => {
    const world = worlds[bomb.realm];
    const blastKey = `blast:${bomb.id}`;
    const existing = blasts.get(blastKey);
    const blast = existing ?? { id: blastKey, realm: bomb.realm, cell: bomb.cell, radius: 0, expiresAt: time + BOMB_BLAST_TICKS - 1 };
    blast.bomb = bomb;
    blast.radius = radius;
    bomb.radius = radius;
    blasts.set(blastKey, blast);
    for (const other of bombs.values()) {
      if (other === bomb || other.realm !== bomb.realm || other.chainAt !== null) continue;
      const distanceSquared = (other.cell.x - bomb.cell.x) ** 2 + (other.cell.y - bomb.cell.y) ** 2;
      if (distanceSquared <= radius * radius && distanceSquared > previousRadius * previousRadius) {
        other.chainAt = time + 1;
      }
    }
  };

  const tick = ({ time }) => {
    let changed = false;
    for (const [key, blast] of blasts) {
      if (time > blast.expiresAt) { blasts.delete(key); changed = true; }
    }
    for (const bomb of [...bombs.values()]) {
      if (bomb.detonatedAt === null && time >= (bomb.chainAt ?? bomb.fuseAt)) {
        bomb.detonatedAt = time;
        bomb.radius = 0;
        applyRing(bomb, 1, 0, time);
        changed = true;
      } else if (bomb.detonatedAt !== null) {
        const radius = time - bomb.detonatedAt + 1;
        if (radius <= BOMB_BLAST_TICKS) {
          applyRing(bomb, radius, radius - 1, time);
          changed = true;
        }
        if (radius >= BOMB_BLAST_TICKS) removeBomb(bomb);
      }
    }
    // The visible blast remains hazardous throughout its lifetime. Reapply damage
    // to every currently covered cell so actors that enter an existing ring are hit.
    for (const blast of blasts.values()) {
      const world = worlds[blast.realm];
      for (const cell of getBlastRingCells(blast.cell, blast.radius, 0, world)) {
        damageAt(blast.realm, cell, BOMB_BLAST_DAMAGE, { bomb: blast.bomb, blast, time });
      }
    }
    if (changed) markChanged();
  };

  const registered = timeSystem?.registerPreTickable?.("bomb-system", tick) ?? false;
  return Object.freeze({
    place(realm, cell) {
      if (!worlds?.[realm] || !cell || this.hasBombAt(realm, cell)) return null;
      const bomb = { id: `bomb-${++sequence}`, realm, cell: Object.freeze({ x: cell.x, y: cell.y }), fuseAt: timeSystem.getTime() + BOMB_FUSE_TICKS, chainAt: null, detonatedAt: null, radius: 0 };
      bombs.set(keyFor(realm, cell), bomb);
      markChanged();
      return Object.freeze({ ...bomb });
    },
    hasBombAt(realm, cell) { return bombs.has(keyFor(realm, cell)); },
    getBombAt(realm, cell) { return bombs.get(keyFor(realm, cell)) ?? null; },
    getGlyphAt(realm, cell) {
      if ([...blasts.values()].some((blast) => blast.realm === realm && (cell.x - blast.cell.x) ** 2 + (cell.y - blast.cell.y) ** 2 <= blast.radius * blast.radius)) return BLAST_GLYPH;
      return this.hasBombAt(realm, cell) ? BOMB_GLYPH : null;
    },
    getBombs(realm = null) { return [...bombs.values()].filter((bomb) => !realm || bomb.realm === realm).map((bomb) => Object.freeze({ ...bomb })); },
    tick,
    dispose() { if (registered) timeSystem.unregisterPreTickable("bomb-system"); bombs.clear(); blasts.clear(); },
  });
}
