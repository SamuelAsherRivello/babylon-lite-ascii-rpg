import test from "node:test";
import assert from "node:assert/strict";
import { COMPOUND_PARTICLE_EFFECTS, PARTICLE_EFFECTS, advanceCompoundParticleInstance, advanceParticleInstance, createCompoundParticleInstance, createParticleInstance } from "../../../src/client/game-layer-babylon-lite/particle-effects.js";

test("particle catalog is alphabetical and contains the copied one-shot sequences", () => {
  assert.deepEqual(PARTICLE_EFFECTS.map((effect) => effect.name), [...PARTICLE_EFFECTS].map((effect) => effect.name).sort());
  assert.equal(PARTICLE_EFFECTS.length, 11);
  assert.ok(PARTICLE_EFFECTS.every((effect) => effect.frameCount > 0 && effect.loop === false));
});

test("particle instances advance once and finish without looping", () => {
  const instance = createParticleInstance("FireBurst", "Underground", { x: 2, y: 3 }, 0);
  assert.equal(instance.frame, 0);
  const advanced = advanceParticleInstance(instance, 10_000);
  assert.equal(advanced.done, true);
});

test("invalid particle names and cells are rejected", () => {
  assert.equal(createParticleInstance("Missing", "Underground", { x: 1, y: 1 }), null);
  assert.equal(createParticleInstance("Smoke", "Underground", null), null);
});

test("BombExplosion crossfades SmokePoff above FirePlume for three fire frames", () => {
  assert.deepEqual(COMPOUND_PARTICLE_EFFECTS.map(({ name }) => name), ["BombExplosion"]);
  const instance = createCompoundParticleInstance("BombExplosion", "Underground", { x: 2, y: 3 }, 0);
  const duringCrossfade = advanceCompoundParticleInstance(instance, 14 * 90);
  assert.deepEqual(duringCrossfade.instances.map(({ name }) => name), ["FirePlume", "SmokePoff"]);
  assert.equal(duringCrossfade.instances[0].frame, 14);
  assert.equal(duringCrossfade.instances[1].frame, 0);
  assert.equal(advanceCompoundParticleInstance(instance, 3_000).done, true);
});
