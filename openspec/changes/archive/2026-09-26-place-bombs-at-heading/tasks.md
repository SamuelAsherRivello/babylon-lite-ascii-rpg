# Tasks

## 1. Heading and input targeting

- [x] 1.1 Add a reusable player-grid heading-location derivation for the current player cell and a cardinal heading direction, with focused Node assertions for all four directions and no-heading behavior.
- [x] 1.2 Retain and update the session's cardinal heading only after successful cardinal player movement, preserving it across diagonal, blocked, contact, and failed moves; verify focused movement/session tests cover the contract.
- [x] 1.3 Map SPACE to the semantic set-bomb action and resolve the existing bomb capability against the current heading location, rejecting no-heading and duplicate-target placement without consuming a bomb or advancing time; verify focused input and bomb-action tests.

## 2. Bomb presentation and lifecycle

- [x] 2.1 Change the planted bomb glyph to `💣` while retaining the existing `✶` glyph at detonation; verify focused bomb-system rendering assertions cover both states.
- [x] 2.2 Preserve existing fuse, blast, damage, chain-reaction, and non-blocking occupancy behavior for heading-targeted bombs; verify the focused bomb-system suite and relevant character-state coverage.

## 3. Integration verification

- [x] 3.1 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both complete successfully.
- [x] 3.2 Run `openspec validate place-bombs-at-heading --strict`; verify the proposal and both spec deltas validate.
- [x] 3.3 Manually verify a seeded local game session: move in each cardinal direction, press SPACE, confirm `💣` appears one cell ahead rather than under the player, and advance world ticks until the same cell visibly becomes `✶`; use an explicit `randomSeed` URL argument and do not create Playwright files.
