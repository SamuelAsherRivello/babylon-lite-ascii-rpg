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
  offense: Object.freeze({ startingValue: 25, currentValue: 25, maximum: 25, startingPercent: 25, currentPercent: 25, pendingPercent: 25, previousPercent: 25, revision: 0 }),
  defense: Object.freeze({ startingValue: 25, currentValue: 25, maximum: 25, startingPercent: 25, currentPercent: 25, pendingPercent: 25, previousPercent: 25, revision: 0 }),
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
