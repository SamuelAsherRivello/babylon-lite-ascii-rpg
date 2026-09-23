export const MAPVIEW_MARKER_DEPTHS = Object.freeze({
  start: 20,
  quest: 30,
  torch: 35,
  item: 36,
  enemySpawner: 38,
  enemy: 39,
  npc: 39,
  npcSpawner: 38,
  player: 40,
});

const MAPVIEW_MARKER_COLORS = Object.freeze({
  start: "#00ff00",
  quest: "#ffff00",
  torch: "#ffffff",
  item: "#00ffff",
  enemySpawner: "#ff00ff",
  enemy: "#ff3b30",
  npc: "#48c774",
  npcSpawner: "#48c774",
  player: "#ffff00",
});

function markerCell(cell) {
  return Object.freeze({ x: cell.x, y: cell.y });
}

function makeMarker(type, cell, extras = {}) {
  return Object.freeze({
    type,
    color: MAPVIEW_MARKER_COLORS[type] ?? MAPVIEW_MARKER_COLORS.item,
    depth: MAPVIEW_MARKER_DEPTHS[type] ?? MAPVIEW_MARKER_DEPTHS.item,
    cell: markerCell(cell),
    ...extras,
  });
}

export function getMapviewSource(world) {
  return Object.freeze({
    x: 0,
    y: 0,
    width: Math.max(0, world?.columns ?? 0),
    height: Math.max(0, world?.rows ?? 0),
  });
}

export function getMapviewLayout(canvasSize, world) {
  const source = getMapviewSource(world);
  const width = Math.max(1, Math.floor(canvasSize?.width ?? 1));
  const height = Math.max(1, Math.floor(canvasSize?.height ?? 1));
  const cellSize = Math.max(1, Math.min(width / Math.max(1, source.width), height / Math.max(1, source.height)));
  const destinationWidth = source.width * cellSize;
  const destinationHeight = source.height * cellSize;
  return Object.freeze({
    source,
    destination: Object.freeze({
      x: Math.floor((width - destinationWidth) / 2),
      y: Math.floor((height - destinationHeight) / 2),
      width: destinationWidth,
      height: destinationHeight,
      cellWidth: cellSize,
      cellHeight: cellSize,
    }),
  });
}

export function getMapviewVisibility() {
  return 100;
}

export function getMapviewLightingFactor() {
  return 1;
}

export function getMapviewMarkers({
  world,
  playerCell,
  objects = [],
  entities = [],
} = {}) {
  if (!world) return Object.freeze([]);
  const markers = [];
  if (world.playerStart) markers.push(makeMarker("start", world.playerStart));

  const questIds = world.questPickupIds;
  for (const object of objects) {
    if (!object?.active || !object.cell) continue;
    const isQuest = questIds instanceof Set
      ? questIds.has(object.id)
      : Array.isArray(questIds) && questIds.includes(object.id);
    const type = isQuest ? "quest" : object.type === "torch" ? "torch" : "item";
    markers.push(makeMarker(type, object.cell, { objectId: object.id, objectType: object.type }));
  }

  for (const torch of world.torches ?? []) {
    if (objects.some((object) => object.active && object.type === "torch" && object.cell?.x === torch.x && object.cell?.y === torch.y)) continue;
    markers.push(makeMarker("torch", torch, { objectType: "torch" }));
  }

  for (const entity of entities) {
    if (!entity?.cell || !["enemy", "enemy-spawner", "npc", "npc-spawner"].includes(entity.type)) continue;
    const type = entity.type === "enemy" ? "enemy" : entity.type === "enemy-spawner" ? "enemySpawner" : entity.type === "npc" ? "npc" : "npcSpawner";
    markers.push(makeMarker(type, entity.cell, { entityId: entity.id }));
  }

  if (playerCell) markers.push(makeMarker("player", playerCell, { shape: "ring" }));
  return Object.freeze(markers.sort((left, right) => left.depth - right.depth));
}
