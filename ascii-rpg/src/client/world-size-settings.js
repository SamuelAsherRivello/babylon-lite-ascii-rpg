export const WORLD_SIZE_LEVELS = Object.freeze(["Low", "Med", "High"]);
export const DEFAULT_WORLD_SIZE = "Med";
export const WORLD_SIZE_DETAILS = Object.freeze({
  Low: "Low, 128 x 128",
  Med: "Med, 256 x 256",
  High: "High, 512 x 512",
});

const WORLD_SIZE_DIMENSIONS = Object.freeze({
  Low: Object.freeze({ rows: 128, columns: 128 }),
  Med: Object.freeze({ rows: 256, columns: 256 }),
  High: Object.freeze({ rows: 512, columns: 512 }),
});

export function normalizeWorldSize(value) {
  return WORLD_SIZE_LEVELS.includes(value) ? value : DEFAULT_WORLD_SIZE;
}

export function getWorldSizeDimensions(value) {
  return WORLD_SIZE_DIMENSIONS[normalizeWorldSize(value)];
}
