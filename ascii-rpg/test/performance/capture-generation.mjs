import { createHash } from 'node:crypto';
import { generationFixture } from './generation-fixtures.js';
for (const seed of ['optimization-open', 'optimization-water', 'optimization-obstructed']) {
  const size = Number(process.argv[2] ?? 64);
  const result = await generationFixture(seed, size);
  console.log(JSON.stringify({ fixture: seed, size, hashes: Object.fromEntries(Object.entries(result.output).map(([realm, value]) => [realm, createHash('sha256').update(JSON.stringify(value)).digest('hex')])), timings: result.timings }));
}
