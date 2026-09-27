import { PARTICLE_PROFILES, BOMB_EXPLOSION_PROFILE } from "./animation-profiles.js";
import { resolveAnimation, resolveMotion } from "./tile-animation.js";

const EFFECTS = PARTICLE_PROFILES.map(({ name, folder, prefix, animation }) => Object.freeze({
  name, folder, prefix, animation, frameCount: animation.frames.length, frameDurationMs: animation.durations[0],
  loop: animation.loop, scale: 1, frameUrl(frame) { return animation.frames[frame]?.source; },
}));

export const PARTICLE_EFFECTS = Object.freeze(EFFECTS);
export const PARTICLE_EFFECT_BY_NAME = Object.freeze(Object.fromEntries(EFFECTS.map((effect) => [effect.name, effect])));

export const COMPOUND_PARTICLE_EFFECTS = Object.freeze([BOMB_EXPLOSION_PROFILE]);
export const COMPOUND_PARTICLE_EFFECT_BY_NAME = Object.freeze(Object.fromEntries(COMPOUND_PARTICLE_EFFECTS.map((effect) => [effect.name, effect])));

export function getParticleEffect(name) {
  return PARTICLE_EFFECT_BY_NAME[name] ?? null;
}

export function getCompoundParticleEffect(name) {
  return COMPOUND_PARTICLE_EFFECT_BY_NAME[name] ?? null;
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
  };
}

export function advanceParticleInstance(instance, now) {
  const effect = getParticleEffect(instance?.name);
  if (!effect) return { done: true, instance };
  const resolved = resolveAnimation(effect.animation, { realTimeMs: now }, instance.startedAt);
  return { done: resolved.complete, instance: { ...instance, frame: resolved.frameIndex } };
}

export function createCompoundParticleInstance(name, realm, cell, at = performance.now()) {
  const effect = getCompoundParticleEffect(name);
  if (!effect || effect.effects.length < 2 || !cell || !Number.isFinite(cell.x) || !Number.isFinite(cell.y)) return null;
  return { id: `${name}-${Math.random().toString(36).slice(2)}`, name, realm, cell: { x: Math.floor(cell.x), y: Math.floor(cell.y) }, startedAt: at };
}

export function advanceCompoundParticleInstance(instance, now) {
  const compound = getCompoundParticleEffect(instance?.name);
  if (!compound) return { done: true, instances: [] };
  const instances = [];
  for (let index = 0; index < compound.effects.length; index += 1) {
    const effect = getParticleEffect(compound.effects[index]);
    if (!effect) return { done: true, instances: [] };
    const startAt = instance.startedAt + compound.startOffsets[index];
    if (now < startAt) break;
    const advanced = advanceParticleInstance({ id: `${instance.id}:${index}`, name: effect.name, realm: instance.realm, cell: instance.cell, frame: 0, startedAt: startAt }, now);
    if (!advanced.done) instances.push(advanced.instance);
  }
  return { done: resolveMotion(compound, now, instance.startedAt).complete, instances };
}
