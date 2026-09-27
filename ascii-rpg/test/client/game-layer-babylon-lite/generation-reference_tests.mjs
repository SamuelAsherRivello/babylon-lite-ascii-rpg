import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { generationFixture } from '../../performance/generation-fixtures.js';

// Deterministic fixture references for the current generation contract. Keep
// these hashes together with the fixture seed so accidental world-generation
// changes fail loudly instead of silently changing performance baselines.
const references = {
  // Rectilinear Underground changes its terrain and shared stair candidates.
  // Overground terrain generation itself is separately checked as unchanged.
  'optimization-open': ['28be6ca1694557ba6e2729fc4ca1edf6dea15127621e59adaf53b4e86d8596d4', '650bd837f49aa8004a8262a46a02540fa3212c8f3573333493234a16ab3c3a1e'],
  'optimization-water': ['05ed632db27998de631bcc4fefbd25e8acbfe32209bccda6496860079da11b4b', 'ef857c802b6016fbadb18ce1586103083d45438aa4c19ed633fde0de9983b09b'],
  'optimization-obstructed': ['1053c86cab2318810fca5046eea02a04c7ca081a757273cedcdafe33d2336775', '6836610c9a399201a02f3d016a4de07e7d194cd98a306c452497ea9e3d6d99ab'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
