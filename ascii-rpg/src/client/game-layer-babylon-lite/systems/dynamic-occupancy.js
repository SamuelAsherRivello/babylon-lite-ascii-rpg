function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function freezeCell(cell) {
  return Object.freeze({ x: cell.x, y: cell.y });
}

function freezeRecord(entity, cell = entity.cell) {
  return Object.freeze({ ...entity, cell: freezeCell(cell) });
}

export function getDynamicVisibleGlyph(occupancy, world, cell, getStaticGlyph) {
  return occupancy?.getAt(cell)?.glyph ?? getStaticGlyph(world, cell);
}

export function createDynamicOccupancy() {
  const records = new Map();
  const cellClaims = new Map();

  return Object.freeze({
    claim(entity) {
      if (!entity?.id || !entity?.cell || records.has(entity.id) || cellClaims.has(cellKey(entity.cell))) {
        return null;
      }

      const record = freezeRecord(entity);
      records.set(record.id, record);
      cellClaims.set(cellKey(record.cell), record.id);
      return record;
    },
    get(id) {
      return records.get(id) ?? null;
    },
    getAt(cell) {
      const id = cellClaims.get(cellKey(cell));
      return id ? records.get(id) ?? null : null;
    },
    getAll(type) {
      const values = [...records.values()];
      return type ? values.filter((record) => record.type === type) : values;
    },
    isOccupied(cell) {
      return cellClaims.has(cellKey(cell));
    },
    move(id, cell) {
      const record = records.get(id);
      if (!record) return false;

      const nextKey = cellKey(cell);
      const occupantId = cellClaims.get(nextKey);
      if (occupantId && occupantId !== id) return false;

      cellClaims.delete(cellKey(record.cell));
      const moved = freezeRecord(record, cell);
      records.set(id, moved);
      cellClaims.set(nextKey, id);
      return true;
    },
    update(id, changes) {
      const record = records.get(id);
      if (!record) return null;
      const { id: ignoredId, cell: ignoredCell, ...safeChanges } = changes ?? {};
      const updated = freezeRecord({ ...record, ...safeChanges }, record.cell);
      records.set(id, updated);
      return updated;
    },
    remove(id) {
      const record = records.get(id);
      if (!record) return null;
      records.delete(id);
      cellClaims.delete(cellKey(record.cell));
      return record;
    },
    clear() {
      records.clear();
      cellClaims.clear();
    },
  });
}
