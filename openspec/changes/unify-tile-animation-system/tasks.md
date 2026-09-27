# Tasks

## 1. Shared tile animation contract

- [ ] 1.1 Add immutable Tile and AnimatedTile definition/validation modules, including qualified PNG source rectangles, non-empty frame sequences, positive durations, explicit loop mode, and `realTime`/`tickTime` domains; verify focused Node tests reject invalid definitions.
- [ ] 1.2 Add a pure frame resolver accepting one real-time and one world-tick snapshot; verify focused Node tests cover shared looping frames, non-looping final-frame hold, unequal durations, and unchanged tick-time frames between ticks.
- [ ] 1.3 Add the central current-animation profile catalog with source geometry, cadence, loop, timing, and adapter family; verify focused tests assert every listed current animation has exactly one explicit profile.
- [ ] 1.4 Connect tick-time resolution only to the existing published Time System value without creating timers or ticks; verify focused tests prove frame updates do not change world time or tick delivery.

## 2. Migrate game-view PNG presentation

- [ ] 2.1 Migrate water and gold-coin terrain-art frame selection to the shared definitions/resolver while retaining atlas cache identity, source dimensions, terrain layering, and shared invalidation; verify focused terrain/rendering tests cover synchronized real-time frames and static-tile fallback.
- [ ] 2.2 Migrate Torch and Trap strip overlays to their shared looping real-time profiles while retaining visibility/fog culling, grid anchoring, glyph suppression, one visible-set scheduler, and disposal; verify their focused presentation tests.
- [ ] 2.3 Migrate hero and Spider state sequences to shared profiles while retaining state transitions, facing, final death-frame behavior, character depth ordering, and authoritative simulation ownership; verify focused hero/enemy presentation tests.
- [ ] 2.4 Migrate standalone and compound particle effects to shared non-looping real-time profiles while retaining frame order, crossfade behavior, culling, and retirement; verify focused particle tests including BombExplosion composition.

## 3. Migrate non-tile presentation and remove duplicate frame math

- [ ] 3.1 Route health-bar fade/delta, floating combat text, and realm-mask progress through explicit non-looping real-time profiles or shared resolver adapters without moving their existing render ownership; verify their focused system/renderer tests.
- [ ] 3.2 Route toast and character-info health-delta motion through explicit non-looping real-time profiles or documented UI-local adapters while preserving reduced-motion behavior and UI timing; verify focused UI tests or deterministic component checks.
- [ ] 3.3 Remove superseded bespoke frame-count, elapsed-time, and PNG-path calculation code only after each migrated family is covered; verify a repository search finds no duplicate active frame-selection path for a migrated profile.

## 4. Integration verification

- [ ] 4.1 Run the affected focused Node suites, then `npm.cmd test` and `npm.cmd run build` from the repository root; record unrelated existing failures separately.
- [ ] 4.2 Run `openspec validate unify-tile-animation-system --type change --strict` and `git diff --check`; resolve every change-scoped failure.
- [ ] 4.3 Manually inspect a fixed-seed game URL with an explicit `randomSeed` and verify real-time water, coin, torch, trap, character, and particle motion while idle; verify a tick-time fixture stays static between successful actions and advances exactly with world time, without changing gameplay results.
