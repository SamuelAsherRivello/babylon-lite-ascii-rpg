export function getVisibleRegion(viewport, world, origin) {
  if (!world) return { x: 0, y: 0, columns: 0, rows: 0, count: 0 };
  const columns = Math.min(viewport.columns, world.columns);
  const rows = Math.min(viewport.rows, world.rows);
  const x = Math.max(0, Math.min(origin.x, world.columns - columns));
  const y = Math.max(0, Math.min(origin.y, world.rows - rows));
  return { x, y, columns, rows, count: columns * rows };
}

export function getVisibleSlot(region, cell) {
  const x = cell.x - region.x;
  const y = cell.y - region.y;
  if (x < 0 || y < 0 || x >= region.columns || y >= region.rows) return -1;
  return y * region.columns + x;
}

export function shouldUpdateVisibleSprite(previous, glyph, frame, baseColor, lightingFactor, fogVisibility = 100) {
  return !previous?.visible
    || previous.glyph !== glyph
    || previous.frame !== frame
    || (previous.baseColor ?? previous.color) !== baseColor
    || previous.lightingFactor !== lightingFactor
    || (previous.fogVisibility !== undefined && previous.fogVisibility !== fogVisibility);
}

export function collectVisibleGlyphs(world, region, getGlyph) {
  const glyphs = new Set();
  for (let y = region.y; y < region.y + region.rows; y += 1) {
    for (let x = region.x; x < region.x + region.columns; x += 1) {
      glyphs.add(getGlyph(world, { x, y }));
    }
  }
  return glyphs;
}
