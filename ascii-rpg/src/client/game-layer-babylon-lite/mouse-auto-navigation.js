import { CARDINAL_DIRECTIONS, AStarUtility } from "./utilities/a-star-utility.js";

export const MAX_MOUSE_AUTO_NAVIGATION_STEPS = 50;

const sameCell = (left, right) => left?.x === right?.x && left?.y === right?.y;
const freezeCell = (cell) => Object.freeze({ x: cell.x, y: cell.y });

function createRouteBlocker(playerCell, targetCell, isBlocked) {
  return (cell) => !sameCell(cell, playerCell) && !sameCell(cell, targetCell) && isBlocked(cell);
}

function getBoundedDistanceField(world, sourceCell, targetCell, isBlocked, maxSteps) {
  return AStarUtility.createDistanceField(world, sourceCell, {
    isBlocked: createRouteBlocker(sourceCell, targetCell, isBlocked),
    maxDistance: maxSteps,
  });
}

function getNextStepFromField(field, playerCell) {
  const distance = field.getDistance(playerCell);
  if (distance <= 0) return null;
  for (const direction of CARDINAL_DIRECTIONS) {
    const next = { x: playerCell.x + direction.x, y: playerCell.y + direction.y };
    if (field.getDistance(next) === distance - 1) return freezeCell(next);
  }
  return null;
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
  if (!world || !playerCell || !pointerCell || isBlocked(pointerCell)) return null;
  const boundedSteps = Math.max(0, Math.floor(maxSteps));
  const field = getBoundedDistanceField(world, playerCell, pointerCell, isBlocked, boundedSteps);
  const distance = field.getDistance(pointerCell);
  return distance >= 0 && distance <= boundedSteps ? freezeCell(pointerCell) : null;
}

/**
 * Resolves the exact pointer cell into a travel or action plan. Action plans
 * route to a reachable cardinal neighbor and reserve the final direction into
 * the exact target for the ordinary movement/contact resolver.
 */
export function resolveMouseAutoNavigationPlan({
  world,
  playerCell,
  pointerCell,
  isTravelCell = () => false,
  isActionableCell = () => false,
  isBlocked = () => false,
  maxSteps = MAX_MOUSE_AUTO_NAVIGATION_STEPS,
}) {
  if (!world || !playerCell || !pointerCell) return null;
  const boundedSteps = Math.max(0, Math.floor(maxSteps));
  if (isTravelCell(pointerCell)) {
    const field = getBoundedDistanceField(world, playerCell, pointerCell, isBlocked, boundedSteps);
    const distance = field.getDistance(pointerCell);
    if (distance >= 0 && distance <= boundedSteps) {
      return Object.freeze({
        kind: "travel",
        targetCell: freezeCell(pointerCell),
        approachCell: freezeCell(pointerCell),
        distance,
      });
    }
  }
  if (!isActionableCell(pointerCell)) return null;

  const candidates = [];
  for (const direction of CARDINAL_DIRECTIONS) {
    const approachCell = { x: pointerCell.x + direction.x, y: pointerCell.y + direction.y };
    if (!isTravelCell(approachCell) || isBlocked(approachCell)) continue;
    const field = getBoundedDistanceField(world, playerCell, approachCell, (cell) => (
      sameCell(cell, pointerCell) || isBlocked(cell)
    ), boundedSteps);
    const distance = field.getDistance(approachCell);
    if (distance < 0 || distance > boundedSteps) continue;
    candidates.push({
      kind: "action",
      targetCell: freezeCell(pointerCell),
      approachCell: freezeCell(approachCell),
      distance,
      finalDirection: freezeCell({ x: pointerCell.x - approachCell.x, y: pointerCell.y - approachCell.y }),
    });
  }
  candidates.sort((left, right) => left.distance - right.distance);
  return candidates[0] ? Object.freeze(candidates[0]) : null;
}

export function getMouseAutoNavigationNextCell({
  world,
  playerCell,
  targetCell,
  isBlocked = () => false,
  maxSteps = MAX_MOUSE_AUTO_NAVIGATION_STEPS,
}) {
  if (!world || !playerCell || !targetCell || sameCell(playerCell, targetCell) || isBlocked(targetCell)) return null;
  const boundedSteps = Math.max(0, Math.floor(maxSteps));
  const field = getBoundedDistanceField(world, targetCell, playerCell, isBlocked, boundedSteps);
  const distance = field.getDistance(playerCell);
  if (distance <= 0 || distance > boundedSteps) return null;
  return getNextStepFromField(field, playerCell);
}
