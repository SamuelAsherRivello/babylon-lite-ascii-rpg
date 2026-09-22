# Tasks

## 1. Shared world-view composition

- [x] 1.1 Add the reusable world-view request and composition path for explicit
  source and destination rectangles, bounded cell iteration, shared visible
  glyph resolution, and background-before-glyph ordering; verify focused unit
  tests cover crop clamping and exclusion of cells outside the source bounds.
- [x] 1.2 Add target submission parameters and adapters so the same composition
  path can submit to the Babylon sprite layer or mini-map canvas while
  preserving scale and crisp cached glyph visuals; verify focused tests cover
  both target contracts without duplicating eligibility logic.
- [x] 1.3 Add optional capability parameters for lighting and overlays, keeping
  marker submission after world content; verify tests prove disabled lighting
  and game-view marker omission do not change shared glyph identity.

## 2. Unified fog behavior

- [x] 2.1 Route game-view world-cell rendering through the authoritative active
  realm fog predicate while preserving the existing discovery-on-gameplay
  path; verify initially undiscovered cells produce no game-view world draw.
- [x] 2.2 Route mini-map world-cell rendering through the same shared fog
  predicate and preserve its independent crop, scale, and marker overlay;
  verify matching discovered/undiscovered cells produce matching visibility in
  both views.
- [x] 2.3 Verify rendering either view never mutates discovery and that
  discovered cells remain visible after movement away and across redraws;
  extend fog and renderer tests for persistent active-realm discovery.

## 3. Integration and cleanup

- [x] 3.1 Replace duplicated game/minimap world-composition branches with the
  shared renderer while preserving camera, zoom, lighting, canvas bounds, and
  minimap marker behavior; verify focused game-layer and minimap tests pass.
- [x] 3.2 Update structural/client tests for the shared world-view boundary,
  explicit independent source rectangles, common fog behavior, pass ordering,
  and target-specific capabilities; verify the mirrored test layout remains
  intact.
- [x] 3.3 Run the full Node test suite, production build, and strict OpenSpec
  validation; manually inspect landscape and portrait views with discovered
  and undiscovered regions and confirm both views respect fog.
