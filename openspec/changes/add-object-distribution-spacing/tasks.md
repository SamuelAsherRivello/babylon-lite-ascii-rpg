# Tasks

## 1. Typed object-distribution foundation

- [x] 1.1 Replace the torch-specific selection entry points in `world-system.js` with a reusable operation explicitly described as distributing an object of type `torch`, while keeping torch candidate eligibility and character-layer output intact; verify the focused world-system tests retain wall-adjacent, walkable, non-blocking torch behavior.
- [x] 1.2 Add the `torch` distribution rule with a 25-cell Euclidean minimum-distance constraint and deterministic seeded candidate ordering; verify focused tests assert every selected pair meets the threshold and repeated seeded worlds are equal.

## 2. Generation-mode parity

- [x] 2.1 Apply the typed torch distribution rule to synchronous and cooperative world generation without changing their completed world shape or options contract; verify the existing cooperative-equality test and new spacing coverage produce identical worlds for the same seed.
- [x] 2.2 Return a deterministic valid subset when a world cannot satisfy its requested count at 25-grid spacing; verify an undersized seeded world preserves spacing and a representative production-sized seeded world returns its requested count.

## 3. Validation

- [x] 3.1 Run `node --test --test-isolation=none ascii-rpg/test/runtime/game-layer-babylon-lite/systems/world-system_tests.mjs` and verify all generator tests pass.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify the complete Node suite and production build pass.
