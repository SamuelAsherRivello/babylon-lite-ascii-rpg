export const DEFAULT_LIGHTING = Object.freeze({
  ambient: 0.5,
  radius: 6,
  maximum: 1,
  falloffExponent: 2,
});

export const AMBIENT_LIGHT_STEP = 0.05;
export const LIGHTING_SOURCE_STATES = Object.freeze(["Off", "Low", "Med", "High"]);

function assertLightingConfig(config) {
  if (!config || !Number.isFinite(config.ambient) || config.ambient < 0 || config.ambient > 1) {
    throw new RangeError("Lighting ambient must be finite and between 0 and 1.");
  }
  if (!Number.isFinite(config.radius) || config.radius <= 0) {
    throw new RangeError("Lighting radius must be a positive finite number.");
  }
  if (!Number.isFinite(config.maximum) || config.maximum < config.ambient || config.maximum > 1) {
    throw new RangeError("Lighting maximum must be finite, at least ambient, and at most 1.");
  }
  if (!Number.isFinite(config.falloffExponent) || config.falloffExponent <= 0) {
    throw new RangeError("Lighting falloffExponent must be a positive finite number.");
  }
}

export function createLightingConfig(overrides = {}) {
  const config = Object.freeze({ ...DEFAULT_LIGHTING, ...overrides });
  assertLightingConfig(config);
  return config;
}

export const LIGHTING_PROFILES = Object.freeze([
  Object.freeze({ label: "Off", config: Object.freeze({ radius: 1, maximum: 0, falloffExponent: 1 }) }),
  Object.freeze({ label: "Low", config: Object.freeze({ radius: 4, maximum: 0.65, falloffExponent: 2 }) }),
  Object.freeze({ label: "Med", config: Object.freeze({ radius: 6, maximum: 0.85, falloffExponent: 2 }) }),
  Object.freeze({ label: "High", config: Object.freeze({ radius: 9, maximum: 1, falloffExponent: 1.5 }) }),
]);

export const LIGHTING_PRESETS = LIGHTING_PROFILES;

export function getLightingProfile(label) {
  return LIGHTING_PROFILES.find((profile) => profile.label === label) ?? LIGHTING_PROFILES[2];
}

export function getLightingFactor(cell, torches, config = DEFAULT_LIGHTING) {
  assertLightingConfig(config);
  if (!cell || !Array.isArray(torches) || torches.length === 0) return config.ambient;
  let strongestContribution = 0;
  const radiusSquared = config.radius ** 2;
  for (const torch of torches) {
    if (!torch || !Number.isFinite(torch.x) || !Number.isFinite(torch.y)) continue;
    const deltaX = cell.x - torch.x;
    const deltaY = cell.y - torch.y;
    const distanceSquared = deltaX ** 2 + deltaY ** 2;
    if (distanceSquared >= radiusSquared) continue;
    const distanceRatio = Math.sqrt(distanceSquared) / config.radius;
    strongestContribution = Math.max(
      strongestContribution,
      (1 - distanceRatio) ** config.falloffExponent,
    );
  }
  return config.ambient + (config.maximum - config.ambient) * strongestContribution;
}

function getSourceContribution(cell, sources, config) {
  if (!cell || !Array.isArray(sources) || sources.length === 0 || config.maximum <= 0) return 0;
  let strongestContribution = 0;
  const radiusSquared = config.radius ** 2;
  for (const source of sources) {
    if (!source || !Number.isFinite(source.x) || !Number.isFinite(source.y)) continue;
    const deltaX = cell.x - source.x;
    const deltaY = cell.y - source.y;
    const distanceSquared = deltaX ** 2 + deltaY ** 2;
    if (distanceSquared >= radiusSquared) continue;
    const distanceRatio = Math.sqrt(distanceSquared) / config.radius;
    strongestContribution = Math.max(
      strongestContribution,
      config.maximum * ((1 - distanceRatio) ** config.falloffExponent),
    );
  }
  return strongestContribution;
}

export function getSceneLightingFactor(cell, torches, playerCell, settings = {}) {
  const ambient = Number.isFinite(settings.ambient)
    ? Math.min(1, Math.max(0, settings.ambient))
    : DEFAULT_LIGHTING.ambient;
  const torchProfile = settings.torchProfile ?? getLightingProfile("Med").config;
  const playerProfile = settings.playerProfile ?? getLightingProfile("Med").config;
  const torchContribution = getSourceContribution(cell, torches, torchProfile);
  const playerContribution = getSourceContribution(cell, playerCell ? [playerCell] : [], playerProfile);
  const sourceContribution = Math.min(1, Math.max(torchContribution, playerContribution));
  return ambient + (1 - ambient) * sourceContribution;
}

export function applyLightingToColor(baseColor, factor, config = DEFAULT_LIGHTING) {
  assertLightingConfig(config);
  if (!Array.isArray(baseColor) || baseColor.length < 3 || baseColor.some((channel) => !Number.isFinite(channel))) {
    throw new TypeError("A palette color must contain finite RGBA channels.");
  }
  if (!Number.isFinite(factor) || factor < 0 || factor > config.maximum) {
    throw new RangeError("Lighting factor must be finite and within the configured range.");
  }
  const boundedFactor = Math.min(config.maximum, Math.max(0, factor));
  return [
    Math.min(1, baseColor[0] * boundedFactor),
    Math.min(1, baseColor[1] * boundedFactor),
    Math.min(1, baseColor[2] * boundedFactor),
    boundedFactor,
  ];
}
