const EFFECTS = [
  ["FireBlast", "FireBlast_18x1", "Fire_Blast", 18, 72],
  ["FireBurst", "FireBurst_11x1", "Fire_Burst", 11, 72],
  ["FirePlume", "FirePlume_17x1", "Fire_Plume", 17, 90],
  ["OilyFireball", "OilyFireball_15x1", "Oily_Fireball", 15, 72],
  ["Smoke", "Smoke_9x1", "Smoke", 9, 90],
  ["SmokeGas", "SmokeGas_13x1", "Smoke_Gas", 13, 90],
  ["SmokeLarge", "SmokeLarge 13x1", "Smoke_Large", 13, 100],
  ["SmokePoff", "SmokePoff_9x1", "Smoke_Poff", 9, 80],
  ["SmokeSmall", "SmokeSmall_8x1", "Smoke_Small", 8, 80],
  ["SmokeThick", "SmokeThick 13x1", "Smoke_Thick", 13, 90],
  ["SmokeThickPuff", "SmokeThickPuff 9x1", "Smoke_ThickPuff", 9, 80],
].map(([name, folder, prefix, frameCount, frameDurationMs]) => Object.freeze({
  name,
  folder,
  prefix,
  frameCount,
  frameDurationMs,
  loop: false,
  scale: 1,
  frameUrl(frame) {
    const baseUrl = import.meta.env?.BASE_URL ?? "/";
    return `${baseUrl}assets/pfx/${encodeURIComponent(folder)}/${prefix}_${frame + 1}.png`;
  },
}));

export const PARTICLE_EFFECTS = Object.freeze(EFFECTS);
export const PARTICLE_EFFECT_BY_NAME = Object.freeze(Object.fromEntries(EFFECTS.map((effect) => [effect.name, effect])));

export function getParticleEffect(name) {
  return PARTICLE_EFFECT_BY_NAME[name] ?? null;
}

export function createParticleInstance(name, realm, cell, at = performance.now()) {
  const effect = getParticleEffect(name);
  if (!effect || !cell || !Number.isFinite(cell.x) || !Number.isFinite(cell.y)) return null;
  return {
    id: `${name}-${Math.random().toString(36).slice(2)}`,
    name,
    realm,
    cell: { x: Math.floor(cell.x), y: Math.floor(cell.y) },
    frame: 0,
    startedAt: at,
    lastFrameAt: at,
  };
}

export function advanceParticleInstance(instance, now) {
  const effect = getParticleEffect(instance?.name);
  if (!effect) return { done: true, instance };
  let frame = instance.frame;
  while (now - instance.lastFrameAt >= effect.frameDurationMs) {
    frame += 1;
    instance.lastFrameAt += effect.frameDurationMs;
  }
  if (frame >= effect.frameCount) return { done: true, instance: { ...instance, frame: effect.frameCount - 1 } };
  return { done: false, instance: { ...instance, frame } };
}
