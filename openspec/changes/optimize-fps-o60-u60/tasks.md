# Tasks

## 1. Measure and isolate remaining sprint cost

- [ ] 1.1 Capture all-enabled Med-density, fixed-seed sprint diagnostics for both realms and verify the evidence records per-second FPS, frame pacing, main-world/minimap phases, and deferred-work state.
- [ ] 1.2 Attribute the failing 60-FPS samples to measured movement-presentation, minimap, or deferred-work costs and verify the comparison preserves all enabled layers and density.

## 2. Optimize and preserve behavior

- [ ] 2.1 Implement only measured movement-presentation or deferred-work optimizations and verify focused Node regression tests preserve current visual, movement, lighting, fog, and minimap behavior.
- [ ] 2.2 Make the opt-in keyboard-path sprint diagnostic robust against legal-route obstruction and verify its Node tests still reject dead, interrupted, and stalled runs.

## 3. Verify the 60-FPS contract

- [ ] 3.1 Run the full Node suite, production build, and strict OpenSpec validation, verifying all succeed without new dependencies or Playwright test files.
- [ ] 3.2 Record two fixed-seed, thirty-second all-enabled Med-density desktop sprint runs in both realms and verify every complete one-second sample is at least 60 FPS with uninterrupted movement and no unbounded deferred lag.
- [ ] 3.3 Update the performance evidence report with environment, phase timings, frame percentiles, movement validity, deferred-work measurements, and the reproducible local play URL.
