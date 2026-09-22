export const EXPERIENCE_POINTS_PER_ATTACK = 5;
export const EXPERIENCE_POINTS_PER_ENEMY_KILL = 25;
export const EXPERIENCE_POINTS_PER_SPAWNER_KILL = 50;
export const EXPERIENCE_POINTS_TO_NEXT_LEVEL = 100;
export const INITIAL_EXPERIENCE_POINTS = 0;
export const INITIAL_EXPERIENCE_LEVEL = 1;

function clampPoints(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function createSnapshot(points, level, previousPercent = null, revision = 0) {
  const currentPercent = (points * 100) / EXPERIENCE_POINTS_TO_NEXT_LEVEL;
  return Object.freeze({
    currentPoints: points,
    pointsNeededForNextLevel: EXPERIENCE_POINTS_TO_NEXT_LEVEL,
    currentPercent,
    previousPercent: previousPercent ?? currentPercent,
    level,
    revision,
  });
}

export function createExperienceSystem({
  initialPoints = INITIAL_EXPERIENCE_POINTS,
  initialLevel = INITIAL_EXPERIENCE_LEVEL,
} = {}) {
  let points = clampPoints(initialPoints);
  let level = Math.max(1, Math.floor(Number(initialLevel) || INITIAL_EXPERIENCE_LEVEL));
  while (points >= EXPERIENCE_POINTS_TO_NEXT_LEVEL) {
    points -= EXPERIENCE_POINTS_TO_NEXT_LEVEL;
    level += 1;
  }
  let snapshot = createSnapshot(points, level);
  const listeners = new Set();

  const getSnapshot = () => snapshot;
  const award = (amount) => {
    const previousPercent = snapshot.currentPercent;
    points += clampPoints(amount);
    while (points >= EXPERIENCE_POINTS_TO_NEXT_LEVEL) {
      points -= EXPERIENCE_POINTS_TO_NEXT_LEVEL;
      level += 1;
    }
    snapshot = createSnapshot(points, level, previousPercent, snapshot.revision + 1);
    for (const listener of listeners) listener(snapshot);
    return snapshot;
  };

  return Object.freeze({
    getSnapshot,
    award,
    awardAttack() { return award(EXPERIENCE_POINTS_PER_ATTACK); },
    awardEnemyKill() { return award(EXPERIENCE_POINTS_PER_ENEMY_KILL); },
    awardSpawnerKill() { return award(EXPERIENCE_POINTS_PER_SPAWNER_KILL); },
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },
    dispose() { listeners.clear(); },
  });
}
