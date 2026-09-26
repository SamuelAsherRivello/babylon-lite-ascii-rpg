# Design

## Context

See `proposal.md` for motivation. The failed `optimize-fps-o48-u20` benchmark
recorded an all-enabled Med world below the display baseline while sprinting:
Overground reached 48.38 FPS in its lowest complete sample and Underground
reached 20.66 FPS before the diagnostic became obstructed. The current
diagnostic separately records main-world rendering, minimap rendering, frame
pacing, and deferred-work state, so the next pass can attribute changes to
measured costs.

## Goals / Non-Goals

**Goals:**

- Establish reproducible 60-FPS sprint acceptance evidence in both realms.
- Remove only measured avoidable work from the movement presentation and
  deferred-work paths.
- Preserve the current visual and gameplay contracts while making the sprint
  diagnostic reliably reject invalid runs.

**Non-Goals:**

- Reducing procedural density, disabling features, adding autonomous logical
  ticks, changing the renderer, adding dependencies, or publishing a release.

## Decisions

### Profile before selecting each optimization

Use the existing opt-in, keyboard-path diagnostic at the documented natural
desktop viewport and fixed seeds. Attribute main-world, minimap, long-frame,
and pending-work costs before changing a subsystem. This avoids treating an
average FPS or an invalid run as compliance. An unmeasured rewrite is rejected
because it could hide the actual source of a frame drop.

### Retain visual and gameplay equivalence as a hard boundary

Optimize work that is provably superseded, unchanged, or deferred without
affecting the current frame. Preserve terrain, lighting, fog, minimap markers,
enemy behavior, density, and player-driven tick semantics. Lowering density or
throttling movement is rejected because it would evade rather than meet the
contract.

### Treat diagnostic validity independently from performance

The diagnostic must release input and report an invalid run when ordinary
movement cannot continue; its route selection may be made more robust only
through the same legal player-input path. Teleporting, ignoring occupancy, or
synthetic logical ticks are rejected because they would not represent gameplay.

## Risks / Trade-offs

- Host/browser load can perturb the 60-FPS floor -> use two fixed seeds,
  natural viewport/device scale, and per-second samples rather than averages.
- Cache/coalescing changes can leave stale visual state -> add focused
  equivalence tests and verify the latest player, lighting, fog, and minimap
  state after rapid movement.
- Diagnostic route selection can stall in legal play -> report that run as
  invalid and improve only legal path selection before using it as evidence.
- Deferred work can move jank rather than remove it -> track queue age,
  pending counts, and long scheduler slices across the full run.

## Migration Plan

No data migration or rollout is required. Keep diagnostics opt-in and update
the performance evidence report only after recording the final validation.
