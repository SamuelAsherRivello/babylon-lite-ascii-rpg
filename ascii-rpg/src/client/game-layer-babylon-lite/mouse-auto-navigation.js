import { CARDINAL_DIRECTIONS, AStarUtility } from "./utilities/a-star-utility.js";

export const MAX_MOUSE_AUTO_NAVIGATION_STEPS = 50;

const sameCell = (left, right) => left?.x === right?.x && left?.y === right?.y;
const freezeCell = (cell) => Object.freeze({ x: cell.x, y: cell.y });

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
  if (isBlocked(pointerCell)) return null;
  const boundedSteps = Math.max(0, Math.floor(maxSteps));
  const directField = AStarUtility.createDistanceField(world, playerCell, {
    isBlocked: createRouteBlocker(playerCell, pointerCell, isBlocked),
    maxDistance: boundedSteps,
  });
  const directDistance = directField.getDistance(pointerCell);
  return directDistance >= 0 && directDistance <= boundedSteps ? freezeCell(pointerCell) : null;
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
