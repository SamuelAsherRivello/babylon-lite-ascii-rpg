import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { generationFixture } from '../../performance/generation-fixtures.js';

// Captured after civilization signs were added; the second hash remains the patrol reference.
const references = {
  'optimization-open': ['3ff2a5a512089820ed2828d06d70b4297923777b3a26eb6d4e7c5303d576349b', '12d27c5eab6db0fa990a90b70b4e0b34e7151d65d6e4ef44c41023f7dfee64c7'],
  'optimization-water': ['a56aa04d0345c94ca2554f911b611e78bb5b5be7a850da5fead86815b1da8c7f', 'babfda31fe5aec74d40d5160dc374cef99c40f182a3841c33340f341b56e3a06'],
  'optimization-obstructed': ['7d717049c8272f0a83669519b4fe11f86afa06bc0cdc7789b94fedea7f4a4f7c', '26dd2d65c1f841ceb29f724a489b609c6702f6efd068477cb6b1220e4f482d83'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
