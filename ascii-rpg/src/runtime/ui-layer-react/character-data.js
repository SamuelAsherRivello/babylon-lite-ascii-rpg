export const INITIAL_CHARACTER = Object.freeze({
  health: Object.freeze({ startingPercent: 80, currentPercent: 80, pendingPercent: 80 }),
  offense: Object.freeze({ startingPercent: 10, currentPercent: 10, pendingPercent: 10 }),
  defense: Object.freeze({ startingPercent: 10, currentPercent: 10, pendingPercent: 10 }),
  experience: Object.freeze({
    startingPercent: 0,
    currentPercent: 0,
    pendingPercent: 0,
    level: 1,
    points: 0,
    pointsNeededForNextLevel: 100,
  }),
  gold: Object.freeze({ startingAmount: 0, currentAmount: 0 }),
  carrying: Object.freeze({ currentWeight: 0, capacity: 0 }),
});
