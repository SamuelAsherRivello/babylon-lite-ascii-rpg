# Tasks

## 1. Compound PFX runtime

- [ ] 1.1 Define named compound PFX metadata that accepts two or more existing one-shot effects and optional per-transition crossfade frame counts; add focused catalog tests for validation and ordered lookup.
- [ ] 1.2 Implement compound-instance lifecycle advancement so every member plays once, the next member starts at the configured predecessor frame, and completion occurs only after the final member; verify sequential and zero-crossfade lifecycle tests.
- [ ] 1.3 Submit every currently active member overlay in declaration order so later crossfade members render above earlier ones; verify a three-frame overlap test renders SmokePoff and FirePlume together with FirePlume on top.
- [ ] 1.4 Advance compound instances in inactive realms without submitting offscreen elements, and clean up their instances/elements on completion or session disposal; verify focused lifecycle and realm-visibility tests.

## 2. Bomb PFX lifecycle

- [ ] 2.1 Replace active-blast glyph presentation with per-bomb, per-cell presentation records and retain `💣` as the planted-bomb glyph; verify focused bomb-system tests contain no active `✶` output.
- [ ] 2.2 On placement, create bounded radius-five `SmokePoff` first-frame previews for the full eventual footprint without affecting damage, occupancy, collision, terrain, or the bomb glyph; verify focused preview-footprint and no-damage tests.
- [ ] 2.3 When each expanding blast cell first becomes active, replace its preview with the named SmokePoff-to-FirePlume compound PFX configured for a three-frame crossfade; verify each radius activation queues the compound exactly once, including chain reactions.
- [ ] 2.4 Keep each compound-active blast cell eligible for existing 100-damage world-time resolution until its FirePlume member completes, then remove its hazard and presentation record; verify damage is dispatched during smoke, crossfade, and remaining fire frames.

## 3. Integration and verification

- [ ] 3.1 Add focused Node coverage for compound PFX metadata, sequential/crossfade frame timing, overlay ordering, bomb previews, detonation replacement, hazard lifetime, and cleanup.
- [ ] 3.2 Run the relevant focused Node tests, then `npm.cmd test` and `npm.cmd run build` from the repository root; verify all commands pass.
- [ ] 3.3 Run `openspec validate pfx-use-case-bomb --type change --strict` and verify the proposal remains strict-valid.
- [ ] 3.4 Manually verify the game with an explicit `randomSeed`: plant a bomb, observe still smoke over the bounded future footprint, observe animated smoke and the three-frame FirePlume-over-smoke crossfade as blast cells activate, and confirm damage occurs throughout the compound PFX without `✶` rendering.
