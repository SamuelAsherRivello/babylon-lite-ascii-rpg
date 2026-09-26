import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { generationFixture } from '../../performance/generation-fixtures.js';

// Deterministic fixture references for the current generation contract. Keep
// these hashes together with the fixture seed so accidental world-generation
// changes fail loudly instead of silently changing performance baselines.
const references = {
  'optimization-open': ['f2691397601fd0a15f8d2346feffd63a86dc05773a94a7ed3eb8f04d8e151df6', '4fbe547ce23b141f58087746666eb0997110c4c88ad9b0e0f1ab5e0097715f1c'],
  'optimization-water': ['6de2a63f88df9c24646b9f2dae91301c9f9458ac9789f7885d439dd0b5546693', 'dbb669fb0a00f8322997e033c2c07dcb26725abe25f7c64b5d9025fb1b7a73fb'],
  'optimization-obstructed': ['3ff5086a86b7227b1f34ab60f45c64c6a356c2e7b954c724db846b9775f1218e', '905c5c1344e296f2a7fad4cc5e9beb448b2abd6a7a6ab1bb2c6382536755e40a'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
