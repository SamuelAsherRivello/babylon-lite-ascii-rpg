# Tasks

## 1. Animated Trap overlay presentation

- [x] 1.1 Register the existing `trap1_strip.png` asset and implement pooled, pixelated in-world Trap overlay elements keyed to eligible active Trap cells; verify the artwork loads and is bottom-centered on each Trap's one-cell rendered geometry.
- [x] 1.2 Add one lifecycle-managed animation schedule that advances the seven 32×32 strip frames in order at the chosen fixed cadence and repeats forever while eligible Trap overlays exist; verify it stops when the pool is empty and is cancelled during game disposal.
- [x] 1.3 Reconcile the Trap overlay pool against the active game-view source region and positive fog visibility, suppress the legacy Trap glyph for every eligible active Trap cell, and render no glyph fallback when the strip is unavailable; verify off-region and fogged traps have neither an overlay nor animation work.

## 2. Preserve gameplay and rendering contracts

- [x] 2.1 Preserve the existing Trap object identity, generation, walkability, persistence, collision consequence, log behavior, minimap marker, and preview marker while adding the overlay; verify focused object-spawner and rendering assertions cover the unchanged semantics and animated-art eligibility.
- [x] 2.2 Add focused Node coverage for seven-frame wraparound, continuous-loop scheduling, pooled cleanup/disposal, no-glyph-fallback presentation, and rendered-cell anchoring without creating Playwright tests; verify those focused tests pass.

## 3. Integration verification

- [ ] 3.1 Run `npm.cmd test`, `npm.cmd run build`, and `openspec validate animated-trap-art --type change --strict` from the repository root; verify all commands pass.
- [ ] 3.2 Manually verify the playable game with an explicit `randomSeed` in both realms: active visible traps animate indefinitely, fogged/offscreen traps do not display overlays, and entering a visible Trap retains the current damage and persistence behavior.
