export const INITIAL_CHARACTER = Object.freeze({
  health: Object.freeze({ startingPercent: 100, currentPercent: 100, pendingPercent: 100 }),
  stamina: Object.freeze({
    startingValue: 25,
    currentValue: 25,
    maximum: 50,
    previousPercent: 25,
    revision: 0,
    currentPercent: 25,
    pendingPercent: 25,
  }),
  offense: Object.freeze({ startingValue: 2.5, currentValue: 2.5, maximum: 25, startingPercent: 10, currentPercent: 10, pendingPercent: 10, previousPercent: 10, revision: 0 }),
  defense: Object.freeze({ startingValue: 2.5, currentValue: 2.5, maximum: 25, startingPercent: 10, currentPercent: 10, pendingPercent: 10, previousPercent: 10, revision: 0 }),
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
