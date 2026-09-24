import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { generationFixture } from '../../performance/generation-fixtures.js';

// Captured after guaranteed house-owned chest placement was added; the second hash remains the patrol reference.
const references = {
  'optimization-open': ['196f3540c5197a630483c37df075b99a58bef491d334678a6c34d558bdb25b6e', '12d27c5eab6db0fa990a90b70b4e0b34e7151d65d6e4ef44c41023f7dfee64c7'],
  'optimization-water': ['cf218bce4f9498112840a28aa4bf504b1b87fb9adf5d26fbda45f2c8e5a169d2', 'babfda31fe5aec74d40d5160dc374cef99c40f182a3841c33340f341b56e3a06'],
  'optimization-obstructed': ['85b7f8606ee3ee2b1561fa911aa6267ce04e47ebedb132b2a40cc15ee3e67b37', '26dd2d65c1f841ceb29f724a489b609c6702f6efd068477cb6b1220e4f482d83'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
