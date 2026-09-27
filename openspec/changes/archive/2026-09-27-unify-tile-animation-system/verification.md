# Verification

Verified on 2026-09-27 from the repository root.

- OpenSpec CLI 1.13.1; `openspec doctor --json` reports a healthy repository.
- Focused tile contract, checked-in PNG geometry, terrain/raster, Torch/Trap, Spider, particle/BombExplosion, health, floating-text, transition, and UI timing checks passed.
- Final `npm.cmd test`: 517 passed, 0 failed.
- `npm.cmd run build`: passed; Vite retains its large-chunk advisory.
- `openspec validate unify-tile-animation-system --type change --strict`: passed.
- `git diff --check`: passed.
- Source search found no remaining bespoke elapsed-time frame selection or numbered PNG assembly in the migrated presentation owners. Profiles own source sequences and cadence; the strip adapter derives CSS cropping from Tile geometry.

The initial full test run had an unrelated missing `HEALTH_GLYPH` export in the world-system suite. A separate workspace edit restored that compatibility export; the final full run above includes the fix. That edit is not part of the animation migration.

## Manual browser checks

Use `npm.cmd run dev` and open:

`/babylon-lite-ascii-rpg/test/manual/tile-animation.html?randomSeed=codex-tile-animation&skipTutorial=true`

The fixture runs the actual game and reads its published Time System value through the existing bridge. Its tick-time water tile uses one tick per frame. A separate Torch fixture exercises the actual visible-set animator and CSS Tile adapter even when the generated visible region contains no torch. Neither fixture produces gameplay ticks.

- Overground water, coins, Trap, and hero animation were observed while idle at unchanged world time.
- A FirePlume placed using the PFX window rendered and retired while world tick remained 2; its placement did not advance the tick-time fixture.
- One successful move advanced world tick 1/frame 0 to tick 2/frame 1. Thirteen more successful moves advanced to tick 15/frame 2. Failed movement into blocked terrain did not advance the tick.
- In the Underground scene, the tick fixture remained at tick 1/frame 0 from real time 6s through 27s. The Torch fixture changed from frame 2 to frame 0, and the Spider idle image changed from frame 02 to 03. A subsequent successful move advanced to tick 2/frame 1.
- Stairs allowed realm travel, and the world, character, fog, and HUD layers remained visible in their established order.

Temporary generation overrides were used only in the verification tab to inspect props. The final scene was returned to the ordinary fixed-seed URL. No Playwright test files were created or executed.

## UI-local adapters

Toast entry/exit durations come from the catalog and reach CSS through custom properties. CSS retains transforms and the reduced-motion override; the existing React timer owns phase retirement. Character-info health delta retains its React hold/retirement behavior with its duration read from the catalog. Neither UI path owns game time.
