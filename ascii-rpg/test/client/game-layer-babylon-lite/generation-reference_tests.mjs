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
  'optimization-open': ['9702c65875404b371ba9822282d951bfe93e631db0d5ac85c5e723810213acf6', '3538a2f94567b562ba3c89f60708fa1934a9be9ddfd3578e75688f9610cd1133'],
  'optimization-water': ['e1a881d08618cc1d33f4d0da6dc5d0bc61f01bc947940cfc3181dfb16249004e', '9aec885ba0bf11f300626ec4b31dded691d45e35cceac66f32de898c918bc0ff'],
  'optimization-obstructed': ['efe9d799fac8e8e6a793c6aebec0795a5e8a72a75a55a60b5d6a5ea456379c87', '12a53a9f43b8047939363b8b35b00e7fb5733f1b5567a3fbcf4be997db506354'],
};
for (const [seed, expected] of Object.entries(references)) test(`positive-count layers and patrol retain reference output: ${seed}`, async () => {
  const { output } = await generationFixture(seed, 128);
  const hashes = Object.values(output).map(value => createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  assert.deepEqual(hashes, expected);
});
