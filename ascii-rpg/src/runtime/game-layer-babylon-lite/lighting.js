export const DEFAULT_LIGHTING = Object.freeze({
  ambient: 0.5,
  radius: 6,
  maximum: 1,
  falloffExponent: 2,
});

export const AMBIENT_LIGHT_STEP = 0.05;
export const LIGHTING_SOURCE_STATES = Object.freeze(["Off", "Low", "Med", "High", "X High"]);
export const SHADOW_SOURCE_STATES = LIGHTING_SOURCE_STATES;
export const DEFAULT_SHADOW_SETTINGS = Object.freeze({ occlusion: 1, bleed: 0 });

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
  Object.freeze({ label: "Low", config: Object.freeze({ radius: 5, maximum: 0.7, falloffExponent: 1.75 }) }),
  Object.freeze({ label: "Med", config: Object.freeze({ radius: 8, maximum: 0.85, falloffExponent: 1.5 }) }),
  Object.freeze({ label: "High", config: Object.freeze({ radius: 12, maximum: 1, falloffExponent: 1.25 }) }),
  Object.freeze({ label: "X High", config: Object.freeze({ radius: 16, maximum: 1, falloffExponent: 1 }) }),
]);

export const SHADOW_PROFILES = Object.freeze([
  Object.freeze({ label: "Off", config: Object.freeze({ occlusion: 0, bleed: 1 }) }),
  Object.freeze({ label: "Low", config: Object.freeze({ occlusion: 0.25, bleed: 0.75 }) }),
  Object.freeze({ label: "Med", config: Object.freeze({ occlusion: 0.5, bleed: 0.5 }) }),
  Object.freeze({ label: "High", config: Object.freeze({ occlusion: 0.75, bleed: 0.25 }) }),
  Object.freeze({ label: "X High", config: DEFAULT_SHADOW_SETTINGS }),
]);

export const LIGHTING_PRESETS = LIGHTING_PROFILES;

export function getLightingProfile(label) {
  return LIGHTING_PROFILES.find((profile) => profile.label === label) ?? LIGHTING_PROFILES[2];
}

export function getShadowProfile(label) {
  return SHADOW_PROFILES.find((profile) => profile.label === label) ?? SHADOW_PROFILES[4];
}

function blocksLight(terrain, x, y) {
  return terrain[y]?.[x]?.walkable !== true;
}

function getLightPathBlockerCount(source, target, terrain) {
  if (!Array.isArray(terrain) || !source || !target ||
      !Number.isInteger(source.x) || !Number.isInteger(source.y) ||
      !Number.isInteger(target.x) || !Number.isInteger(target.y) ||
      !terrain[source.y]?.[source.x] || !terrain[target.y]?.[target.x]) return null;

  const stepX = Math.sign(target.x - source.x);
  const stepY = Math.sign(target.y - source.y);
  const countX = Math.abs(target.x - source.x);
  const countY = Math.abs(target.y - source.y);
  let x = source.x;
  let y = source.y;
  let crossedX = 0;
  let crossedY = 0;

  const isInterveningBlocker = (cellX, cellY) =>
    (cellX !== target.x || cellY !== target.y) && blocksLight(terrain, cellX, cellY);
  let blockers = 0;

  while (crossedX < countX || crossedY < countY) {
    const xBoundary = (1 + 2 * crossedX) * countY;
    const yBoundary = (1 + 2 * crossedY) * countX;
    if (xBoundary === yBoundary) {
      blockers += Number(isInterveningBlocker(x + stepX, y));
      blockers += Number(isInterveningBlocker(x, y + stepY));
      x += stepX;
      y += stepY;
      crossedX += 1;
      crossedY += 1;
    } else if (xBoundary < yBoundary) {
      x += stepX;
      crossedX += 1;
    } else {
      y += stepY;
      crossedY += 1;
    }
    blockers += Number(isInterveningBlocker(x, y));
  }
  return blockers;
}

export function hasClearLightPath(source, target, terrain) {
  return getLightPathBlockerCount(source, target, terrain) === 0;
}

function getShadowTransmission(blockerCount, shadow = DEFAULT_SHADOW_SETTINGS) {
  if (blockerCount === 0) return 1;
  const occlusion = Number.isFinite(shadow?.occlusion) ? Math.min(1, Math.max(0, shadow.occlusion)) : 1;
  const bleed = Number.isFinite(shadow?.bleed) ? Math.min(1, Math.max(0, shadow.bleed)) : 0;
  return bleed * ((1 - occlusion) ** (blockerCount - 1));
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

function getSourceContribution(cell, sources, config, terrain, shadow) {
  if (!cell || !Array.isArray(sources) || sources.length === 0 || config.maximum <= 0) return 0;
  let strongestContribution = 0;
  const radiusSquared = config.radius ** 2;
  for (const source of sources) {
    if (!source || !Number.isFinite(source.x) || !Number.isFinite(source.y)) continue;
    const deltaX = cell.x - source.x;
    const deltaY = cell.y - source.y;
    const distanceSquared = deltaX ** 2 + deltaY ** 2;
    if (distanceSquared >= radiusSquared) continue;
    const blockerCount = getLightPathBlockerCount(source, cell, terrain);
    if (blockerCount === null) continue;
    const distanceRatio = Math.sqrt(distanceSquared) / config.radius;
    strongestContribution = Math.max(
      strongestContribution,
      config.maximum * ((1 - distanceRatio) ** config.falloffExponent) * getShadowTransmission(blockerCount, shadow),
    );
  }
  return strongestContribution;
}

export function getSceneLightingFactor(cell, torches, playerCell, settings = {}, terrain) {
  if (!Array.isArray(terrain)) throw new TypeError("Scene lighting requires terrain walkability.");
  const ambient = Number.isFinite(settings.ambient)
    ? Math.min(1, Math.max(0, settings.ambient))
    : DEFAULT_LIGHTING.ambient;
  const torchProfile = settings.torchProfile ?? getLightingProfile("Med").config;
  const playerProfile = settings.playerProfile ?? getLightingProfile("Med").config;
  const torchShadow = settings.torchShadow ?? getShadowProfile("X High").config;
  const playerShadow = settings.playerShadow ?? getShadowProfile("X High").config;
  const torchContribution = getSourceContribution(cell, torches, torchProfile, terrain, torchShadow);
  const playerContribution = getSourceContribution(cell, playerCell ? [playerCell] : [], playerProfile, terrain, playerShadow);
  const sourceContribution = Math.min(1, Math.max(torchContribution, playerContribution));
  return ambient + (1 - ambient) * sourceContribution;
}

function sameRegion(left, right) {
  return left.x === right.x && left.y === right.y &&
    left.columns === right.columns && left.rows === right.rows;
}

function buildVisibleSourceField(terrain, region, sources, profile, shadow) {
  const values = new Float64Array(region.columns * region.rows);
  if (!Array.isArray(terrain) || !Array.isArray(sources) || profile.maximum <= 0) return values;
  const radiusSquared = profile.radius ** 2;
  const regionRight = region.x + region.columns - 1;
  const regionBottom = region.y + region.rows - 1;

  for (const source of sources) {
    if (!source || !Number.isInteger(source.x) || !Number.isInteger(source.y)) continue;
    const left = Math.max(region.x, Math.floor(source.x - profile.radius));
    const right = Math.min(regionRight, Math.ceil(source.x + profile.radius));
    const top = Math.max(region.y, Math.floor(source.y - profile.radius));
    const bottom = Math.min(regionBottom, Math.ceil(source.y + profile.radius));
    if (left > right || top > bottom) continue;

    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const distanceSquared = (x - source.x) ** 2 + (y - source.y) ** 2;
        if (distanceSquared >= radiusSquared) continue;
        const blockerCount = getLightPathBlockerCount(source, { x, y }, terrain);
        if (blockerCount === null) continue;
        const distanceRatio = Math.sqrt(distanceSquared) / profile.radius;
        const contribution = profile.maximum * ((1 - distanceRatio) ** profile.falloffExponent) *
          getShadowTransmission(blockerCount, shadow);
        const slot = (y - region.y) * region.columns + x - region.x;
        values[slot] = Math.max(values[slot], contribution);
      }
    }
  }
  return values;
}

export function createSceneLightingFieldCache() {
  let torchEntry = null;
  let playerEntry = null;

  return {
    get(world, region, torches, playerCell, settings = {}) {
      const ambient = Number.isFinite(settings.ambient)
        ? Math.min(1, Math.max(0, settings.ambient))
        : DEFAULT_LIGHTING.ambient;
      const torchProfile = settings.torchProfile ?? getLightingProfile("Med").config;
      const playerProfile = settings.playerProfile ?? getLightingProfile("Med").config;
      const torchShadow = settings.torchShadow ?? getShadowProfile("X High").config;
      const playerShadow = settings.playerShadow ?? getShadowProfile("X High").config;
      const terrain = world?.terrain;
      if (!Array.isArray(terrain)) throw new TypeError("Scene lighting requires terrain walkability.");

      if (!torchEntry || torchEntry.world !== world || torchEntry.sources !== torches ||
          torchEntry.profile !== torchProfile || torchEntry.shadow !== torchShadow || !sameRegion(torchEntry.region, region)) {
        torchEntry = {
          world, sources: torches, profile: torchProfile, shadow: torchShadow, region: { ...region },
          values: buildVisibleSourceField(terrain, region, torches, torchProfile, torchShadow),
        };
      }
      if (!playerEntry || playerEntry.world !== world || playerEntry.profile !== playerProfile || playerEntry.shadow !== playerShadow ||
          playerEntry.x !== playerCell?.x || playerEntry.y !== playerCell?.y ||
          !sameRegion(playerEntry.region, region)) {
        playerEntry = {
          world, profile: playerProfile, shadow: playerShadow, region: { ...region },
          x: playerCell?.x, y: playerCell?.y,
          values: buildVisibleSourceField(terrain, region, playerCell ? [playerCell] : [], playerProfile, playerShadow),
        };
      }

      const torchContributions = torchEntry.values;
      const playerContributions = playerEntry.values;
      return {
        torchContributions,
        playerContributions,
        getFactor(cell) {
          const localX = cell.x - region.x;
          const localY = cell.y - region.y;
          if (localX < 0 || localY < 0 || localX >= region.columns || localY >= region.rows) return ambient;
          const slot = localY * region.columns + localX;
          const source = Math.min(1, Math.max(torchContributions[slot], playerContributions[slot]));
          return ambient + (1 - ambient) * source;
        },
      };
    },
  };
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
