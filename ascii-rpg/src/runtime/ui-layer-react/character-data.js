export const INITIAL_CHARACTER = Object.freeze({
  health: Object.freeze({ startingPercent: 100, currentPercent: 100, pendingPercent: 100 }),
  stamina: Object.freeze({
    startingValue: 50,
    currentValue: 50,
    maximum: 50,
    previousPercent: 50,
    revision: 0,
    currentPercent: 50,
    pendingPercent: 50,
  }),
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
  keys: Object.freeze({ startingAmount: 0, currentAmount: 0 }),
});
