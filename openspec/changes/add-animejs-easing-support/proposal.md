# Proposal

## Why

Babylon Lite provides animation scheduling and interpolation, but it does not
provide the reusable `AnimationHelper` abstraction or the broad easing catalog
needed by the game. Adding Anime.js easing support behind a project-owned
helper gives current and future animations one consistent API, while allowing
the existing realm iris transition to use the requested Bezier Out and Bezier
In curves.

## What Changes

- Add Anime.js as the supported easing dependency, importing its easing
  utilities without making Anime.js the owner of Babylon Lite rendering or
  lifecycle state.
- Add a reusable game-layer `AnimationHelper` API for timed, cancellable
  animations with progress callbacks and selectable easing functions.
- Make the existing realm iris transition the first consumer and primary
  acceptance target for the helper and easing registry.
- Expose Anime.js easing families available from the easing editor, including
  cubic bezier, power, sine, exponential, circular, back, elastic, bounce,
  irregular, steps, linear, and spring easings where the runtime API supports
  them.
- Apply the Anime.js Bezier Out preset to the closing phase of the realm iris
  transition and the Bezier In preset to its opening phase.
- Keep Babylon Lite sprite, property, and render scheduling under the game
  layer; Anime.js supplies easing values rather than replacing the renderer.
- Add focused unit coverage for easing selection, progress normalization,
  cancellation, and the realm-transition phase easings before migrating other
  runtime animations.

## Capabilities

### New Capabilities

- `animation-easing`: Provides the project-wide AnimationHelper contract and
  Anime.js-backed easing selection for current and future game animations.

### Modified Capabilities

- None. The realm transition behavior is specified as part of the new
  animation-easing capability; no existing main spec currently owns its
  easing requirements.

## Impact

- Dependency: root `package.json` and `package-lock.json` gain Anime.js.
- Runtime: new helper/easing module under
  `ascii-rpg/src/runtime/game-layer-babylon-lite/`, plus realm transition
  integration in the Babylon Lite game layer.
- Tests: focused Node tests and existing transition tests are extended; the
  existing browser/build checks remain applicable.
- Compatibility: no persisted-data format or React UI contract changes.
- Decision to confirm during implementation: whether the helper exposes the
  full Anime.js easing function type directly or uses a stable project-owned
  registry that can be expanded without changing callers. This proposal
  recommends the registry for long-term API stability.
