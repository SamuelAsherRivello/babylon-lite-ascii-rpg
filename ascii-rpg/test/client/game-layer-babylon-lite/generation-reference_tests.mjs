import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { generationFixture } from '../../performance/generation-fixtures.js';

// Deterministic fixture references for the current generation contract. Keep
// these hashes together with the fixture seed so accidental world-generation
// changes fail loudly instead of silently changing performance baselines.
const references = {
  'optimization-open': ['d0a328b57f09d36d98c3c1a19d63a1e125bf396af0518d8f0bfd6641080785ea', '8b2e8c6af10bd873418b139cfe3575fb7dc219e89ae629a83b8caff39e33d284'],
  'optimization-water': ['7ef798455a08f7c8adf8fbfdf7c9695dcd0d3a9bff8184d08526e8ac27f90d99', 'a69b4f147717c0cec4d8575f6c58ffc6537cbdb925fbe40a6b4ba066a4f590cf'],
  'optimization-obstructed': ['c93a950315926a32905c6052f6b5034a53c02d5e895b419f068c135e2e6ed458', '716a8a87a8cef472693842f17cc72bdf3cc637185540f3242de0ebe74b434977'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
