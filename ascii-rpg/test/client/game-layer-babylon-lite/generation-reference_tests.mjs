import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { generationFixture } from '../../performance/generation-fixtures.js';

// Captured after civilization signs were added; the second hash remains the patrol reference.
const references = {
  'optimization-open': ['eb0de41a8a8c17cdf6708528a0a564351dffbd7439fdb456972673ada8c8a540', '12d27c5eab6db0fa990a90b70b4e0b34e7151d65d6e4ef44c41023f7dfee64c7'],
  'optimization-water': ['e48192e45b749d5e279caef2eb04fe8366ac5d256b25cf8ab5662c50d5bbe8b1', 'babfda31fe5aec74d40d5160dc374cef99c40f182a3841c33340f341b56e3a06'],
  'optimization-obstructed': ['c3829d2ca91548756ae8eb4f346d282a4c599eff044fd4e706c1257e0931758f', '26dd2d65c1f841ceb29f724a489b609c6702f6efd068477cb6b1220e4f482d83'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
