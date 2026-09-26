# Spec Delta

## MODIFIED Requirements

### Requirement: Sustained rapid movement remains responsive

During a sustained movement stress run in the supported desktop browser at the
normal game viewport, all-enabled Med-density worlds SHALL maintain a sampled
frame rate of at least `60` FPS while the alive player is moving with the Shift
modifier at the fastest movement cadence. Idle presentation SHALL remain at or
near the browser's available `60` FPS baseline.

#### Scenario: Shift movement meets the minimum frame rate

- **WHEN** the player completes a thirty-second Shift-modified movement stress
  run in both Overground and Underground for each of two fixed seeds
- **THEN** every complete one-second FPS sample SHALL be `60` or higher, actual
  movement SHALL continue for every sample interval, and deferred work SHALL
  not accumulate unbounded lag

#### Scenario: Idle presentation remains stable after stress

- **WHEN** the player releases movement after the stress run and the scene
  settles
- **THEN** the displayed FPS SHALL recover to the normal approximately `60`
  FPS baseline without a render queue or stale movement work continuing to
  consume frames
