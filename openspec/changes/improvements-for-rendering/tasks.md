# Tasks

## 1. Establish reliable profile lifecycle evidence

- [ ] 1.1 Trace the fixed-environment generated-world profile startup and repair the narrow validation or retry path needed to reach playable input; verify with a focused Node check and a manual browser startup that the profile reaches the playable state.
- [ ] 1.2 Gate idle, directional-movement, and sprint sampling on the explicit playable-state signal and return an unavailable/interrupted terminal result for pre-input startup failure; verify focused monitor tests contain no completed FPS result for that failure.
- [ ] 1.3 Add renderer lifecycle token/state handling that ignores intentional-disposal loss callbacks but retains active unexpected device-loss reporting; verify focused lifecycle tests cover both outcomes.

## 2. Measure and optimize movement presentation

- [ ] 2.1 Capture a fixed-environment baseline for approximately ten seconds each of idle, held directional movement, and sprint, including frame pacing plus separate main-world/minimap timings; verify the opt-in report identifies all three scenarios.
- [ ] 2.2 Add semantic invalidation revisions to the coalesced movement scheduler so superseded updates do not redraw unchanged world or minimap surfaces; verify focused scheduler tests retain only the newest queued state and skip redundant work.
- [ ] 2.3 Invalidate the affected surface for player position, viewport, fog, lighting, palette, markers, and GPU-effect changes; verify focused visual-state tests cover every input and preserve the established render result.
- [ ] 2.4 Retain only optimizations supported by the post-change profile comparison; verify the same browser matrix meets the existing 55 FPS movement floor and does not add visible movement, fog, lighting, or minimap staleness.

## 3. Integrate and verify the renderer change

- [ ] 3.1 Run the affected Node test groups for monitoring, lifecycle, scheduling, and world/minimap rendering; verify all added and related checks pass.
- [ ] 3.2 Run the repository's full Node test command and production build; verify both complete successfully or document any unrelated pre-existing failure.
- [ ] 3.3 Manually validate the production fixed-environment profile with real held movement and sprint; verify no intentional cleanup is reported as device loss and the report records valid scenario durations, frame pacing, and phase timings.
