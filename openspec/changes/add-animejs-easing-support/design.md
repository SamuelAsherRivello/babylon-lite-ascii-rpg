# Design

## Context

See `proposal.md` and `specs/animation-easing/spec.md`. The repository uses
`@babylonjs/lite` 1.30.0 and currently implements the realm iris transition in
`systems/transition-system.js` with elapsed-time `requestAnimationFrame`
updates. Babylon Lite exposes animation managers, property animation groups,
and sprite-frame animation, but it does not export an `AnimationHelper` or a
general easing callback for property animation tracks.

## Goals / Non-Goals

**Goals:**

- Add Anime.js as a runtime dependency for easing utilities.
- Keep a project-owned helper as the stable API used by runtime animations.
- Make all easing choices available through a small registry and custom
  function escape hatch.
- Deliver the realm iris transition as phase one, proving the helper and
  registry before future animations adopt them.
- Preserve the current transition lifecycle, covered midpoint, and layer
  boundaries while changing only phase timing.

**Non-Goals:**

- Do not replace Babylon Lite rendering or animation-manager infrastructure.
- Do not introduce Anime.js timelines as a second owner of game state.
- Do not move the React HUD or CSS-only UI animation ownership into the game
  layer.
- Do not add persisted easing settings in this change.

## Decisions

### Use Anime.js easing utilities, not Anime.js animation ownership

Add the `animejs` package and import only its easing APIs. This provides access
to the editor's named easing families, `cubicBezier`, and `spring` while the
existing game-layer scheduler continues to own cancellation, frame timing,
Babylon Lite updates, and transition lifecycle events. Using Anime.js's full
animation runner was considered, but it would create a second scheduler and
make Babylon Lite target ownership ambiguous.

### Use a project-owned easing registry

Expose stable names such as `bezierOut` and `bezierIn` from a local module,
backed by Anime.js functions. The registry can map future editor presets
without requiring every caller to know Anime.js import paths or naming details.
Callers may also provide a custom `(progress) => progress` function for curves
not yet registered.

### Adapt the existing transition primitive

The realm iris transition is the first migration and acceptance target for the
new helper.

Extend the transition system with separate closing and opening easing
functions. Each phase computes elapsed normalized progress, evaluates its own
curve, and then performs the existing interpolation. The covered phase keeps a
constant fully-covered value. This preserves event ordering and makes the
transition system independently testable with injected frame schedulers.

### Preserve the current layer boundary

The helper and easing registry live in the Babylon Lite game-layer runtime.
The helper emits values; existing `updateSprite2DIndex`, mask, and render paths
apply them. React remains responsible for the UI layer and is not a target of
the game animation helper.

## Risks / Trade-offs

- [Risk] Anime.js package updates could rename or remove a catalog entry → pin
  the installed major version through the lockfile and have the registry fail
  clearly for unavailable names.
- [Risk] Cubic-bezier control-point semantics can differ from a simple cubic
  polynomial evaluated directly at time → use Anime.js's exported easing
  function for preset parity and test representative progress values.
- [Risk] A second scheduler could cause duplicate updates → keep the helper
  on the existing request-frame/animation-manager boundary and do not invoke
  Anime.js's `animate()` runner.
- [Risk] Overshooting easings could produce invalid mask radii → clamp only
  presentation values that require physical bounds while preserving raw eased
  progress for general-purpose callers.

## Migration Plan

1. Add and lock Anime.js, then add the easing registry and helper tests.
2. Route the realm transition's closing/opening progress through the helper
   and verify Bezier Out/In phase behavior as the first consumer.
3. Migrate additional JavaScript-owned runtime animations to the helper only
   after the realm transition integration is verified; preserve CSS-only UI
   animations outside its scope.
4. Run the existing Node suite, build, and manual browser transition check.

## Open Questions

- None that change the specified behavior. The exact Anime.js package version
  and import subpath can be selected during implementation after checking the
  current package metadata and lockfile resolution.
