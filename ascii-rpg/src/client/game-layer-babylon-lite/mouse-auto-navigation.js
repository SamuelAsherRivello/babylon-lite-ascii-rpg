import { CARDINAL_DIRECTIONS, AStarUtility } from "./utilities/a-star-utility.js";

export const MAX_MOUSE_AUTO_NAVIGATION_STEPS = 50;

const sameCell = (left, right) => left?.x === right?.x && left?.y === right?.y;
const freezeCell = (cell) => Object.freeze({ x: cell.x, y: cell.y });
const manhattanDistance = (left, right) => Math.abs(left.x - right.x) + Math.abs(left.y - right.y);

function createRouteBlocker(playerCell, targetCell, isBlocked) {
  return (cell) => !sameCell(cell, playerCell) && !sameCell(cell, targetCell) && isBlocked(cell);
}

export function isMouseAutoNavigationCellAvailable({
  world,
  cell,
  playerCell,
  isStaticOccupied = () => false,
  isDynamicallyOccupied = () => false,
}) {
  if (!world?.terrain?.[cell?.y]?.[cell?.x]?.walkable) return false;
  if (sameCell(cell, playerCell)) return true;
  return !isStaticOccupied(cell) && !isDynamicallyOccupied(cell);
}

export function resolveMouseAutoNavigationTarget({
  world,
  playerCell,
  pointerCell,
  isBlocked = () => false,
  maxSteps = MAX_MOUSE_AUTO_NAVIGATION_STEPS,
}) {
  if (!world || !playerCell || !pointerCell) return null;
  const boundedSteps = Math.max(0, Math.floor(maxSteps));
  const directField = AStarUtility.createDistanceField(world, playerCell, {
    isBlocked: createRouteBlocker(playerCell, pointerCell, isBlocked),
    maxDistance: boundedSteps,
  });
  const directDistance = directField.getDistance(pointerCell);
  if (!isBlocked(pointerCell)) return directDistance >= 0 && directDistance <= boundedSteps ? freezeCell(pointerCell) : null;

  const candidates = [];
  const minX = Math.max(0, playerCell.x - boundedSteps);
  const maxX = Math.min(world.columns - 1, playerCell.x + boundedSteps);
  const minY = Math.max(0, playerCell.y - boundedSteps);
  const maxY = Math.min(world.rows - 1, playerCell.y + boundedSteps);
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    const cell = { x, y };
    if (isBlocked(cell) || directField.getDistance(cell) < 0) continue;
    candidates.push(cell);
  }
  candidates.sort((left, right) => manhattanDistance(left, pointerCell) - manhattanDistance(right, pointerCell)
    || left.y - right.y || left.x - right.x);
  return candidates.length ? freezeCell(candidates[0]) : null;
}

export function getMouseAutoNavigationNextCell({
  world,
  playerCell,
  targetCell,
  isBlocked = () => false,
  maxSteps = MAX_MOUSE_AUTO_NAVIGATION_STEPS,
}) {
  if (!world || !playerCell || !targetCell || sameCell(playerCell, targetCell)) return null;
  if (isBlocked(targetCell)) return null;
  const boundedSteps = Math.max(0, Math.floor(maxSteps));
  const field = AStarUtility.createDistanceField(world, targetCell, {
    isBlocked: createRouteBlocker(playerCell, targetCell, isBlocked),
    maxDistance: boundedSteps,
  });
  const distance = field.getDistance(playerCell);
  if (distance <= 0 || distance > boundedSteps) return null;
  for (const direction of CARDINAL_DIRECTIONS) {
    const next = { x: playerCell.x + direction.x, y: playerCell.y + direction.y };
    if (field.getDistance(next) === distance - 1) return freezeCell(next);
  }
  return null;
}
