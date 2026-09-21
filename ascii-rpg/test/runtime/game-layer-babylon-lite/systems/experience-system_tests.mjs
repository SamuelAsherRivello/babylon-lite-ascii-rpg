import assert from "node:assert/strict";
import test from "node:test";
import {
  createExperienceSystem,
  EXPERIENCE_POINTS_PER_ATTACK,
  EXPERIENCE_POINTS_PER_ENEMY_KILL,
  EXPERIENCE_POINTS_PER_SPAWNER_KILL,
} from "../../../../src/runtime/game-layer-babylon-lite/systems/experience-system.js";

test("awards five percent experience per attack", () => {
  const experience = createExperienceSystem();

  const snapshot = experience.awardAttack();

  assert.equal(snapshot.currentPoints, EXPERIENCE_POINTS_PER_ATTACK);
  assert.equal(snapshot.currentPercent, 5);
  assert.equal(snapshot.level, 1);
});

test("awards enemy and spawner kill experience", () => {
  const experience = createExperienceSystem();

  experience.awardEnemyKill();
  const snapshot = experience.awardSpawnerKill();

  assert.equal(snapshot.currentPoints, EXPERIENCE_POINTS_PER_ENEMY_KILL + EXPERIENCE_POINTS_PER_SPAWNER_KILL);
  assert.equal(snapshot.currentPercent, 75);
});

test("fills roll the meter over and increase the level", () => {
  const experience = createExperienceSystem();
  const received = [];
  experience.subscribe((snapshot) => received.push(snapshot));

  experience.awardSpawnerKill();
  experience.awardSpawnerKill();

  const snapshot = experience.getSnapshot();
  assert.equal(snapshot.currentPoints, 0);
  assert.equal(snapshot.currentPercent, 0);
  assert.equal(snapshot.level, 2);
  assert.equal(snapshot.previousPercent, 50);
  assert.equal(received.length, 3);
  assert.ok(Object.isFrozen(snapshot));
});
