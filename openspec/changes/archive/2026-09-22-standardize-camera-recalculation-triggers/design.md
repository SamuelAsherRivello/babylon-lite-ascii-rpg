# Design

## Context

See `proposal.md` for motivation. The current implementation already has
camera-origin helpers in the game layer and player-grid module:

- `getInitialViewOriginForCamera`, `getViewOriginForCamera`, and
  `getViewOriginForResize` calculate origins for startup, ongoing movement,
  and resize-sensitive behavior.
- `rebuildViewport` recreates the viewport from the canvas and zoom, then
  optionally resolves camera placement before rendering.
- React owns persisted Settings state for aspect, zoom, and camera mode, while
  `game-bridge.js` forwards snapshots into the game-layer controller.
- Realm activation, movement, zoom changes, resize/orientation/canvas observer
  callbacks, and game-owned relocation helpers currently touch camera state
  from separate paths.

The browser targets include desktop and mobile browsers, portrait support, and
viewport resize correctness. No new dependency is needed.

## Goals / Non-Goals

**Goals:**

- Make the game layer the single owner of camera-origin recalculation.
- Route every view-affecting event through a small set of camera-resolution
  intents: initial placement, mode/player/world placement, resize-preserving
  placement, and transition-preserving placement.
- Add an explicit bridge path for aspect presentation changes so camera
  recalculation does not depend on whether CSS layout also produces a resize
  event.
- Keep all rendering paths responsible for reconciling stale cells after an
  origin, viewport, zoom, realm, or movement change.

**Non-Goals:**

- No changes to available camera modes, labels, persistence keys, or cycling
  order.
- No changes to the ten displayed zoom values or effective zoom mapping.
- No world expansion, regeneration, or minimap zoom behavior changes.
- No changes to the visual style of aspect controls, HUD, or transition mask.

## Decisions

### Centralize camera resolution in the game layer

Use a game-layer helper that accepts a reason or intent and updates
`viewOrigin` only when `world` and `playerCell` are available. The helper
should delegate to the existing player-grid camera functions rather than
duplicating mode math.

Rationale: the game layer owns `world`, `playerCell`, `viewport`, `zoom`, and
`viewOrigin`, so it can apply one guard for missing playable state and one
render path after the origin changes.

Alternatives considered:

- Put camera recalculation in React effects. Rejected because React does not
  own authoritative world or player state.
- Let each event path call low-level camera helpers directly. Rejected because
  it keeps the trigger list scattered and makes future relocations easy to
  miss.

### Model trigger differences as intents, not separate camera modes

Keep the current camera mode values. The resolver should distinguish:

- Initial placement: use initial camera placement before the first playable
  render.
- Mode/player/world placement: resolve from the active mode for movement, zoom,
  camera-mode change, realm destination, and relocation.
- Resize placement: use resize-aware behavior, preserving lock-mode screen
  placement when valid.
- Realm transition placement: preserve source screen placement where required
  by the transition presentation, but still run through a named camera intent
  and clamp to destination bounds.

Rationale: the spec changes when the active camera is considered, not what
camera modes mean.

Alternatives considered:

- Always recenter after every trigger. Rejected because it would break Lock and
  Deadzone semantics.
- Always preserve screen position after every trigger. Rejected because Center
  and Deadzone need mode-specific recalculation.

### Add explicit aspect-change notification through the bridge

When the persisted aspect setting changes, React should notify the bridge with
the selected aspect. The game controller should respond by scheduling or
performing a viewport rebuild and camera recalculation after the layout has
had a chance to apply the new data attribute. The existing resize observer can
still catch actual canvas-size changes, but aspect must not rely on it as the
only trigger.

Rationale: aspect changes are user-facing camera-affecting events even when a
browser batches layout in a way that does not immediately emit a distinct
resize event.

Alternatives considered:

- Depend only on `ResizeObserver`. Rejected because the acceptance criteria
  require aspect to be considered explicitly.

### Keep stale-cell reconciliation tied to render rebuilds

Any trigger that changes the viewport dimensions, origin, world, or visible
world cells should render through the existing full visible-region path or
clear/rebuild affected sprite state before presentation.

Rationale: Camera Lock and realm transitions already have stale-cell risks, and
the requirement covers undiscovered cells as well as visible glyphs.

Alternatives considered:

- Only repaint changed player cells for movement and relocation. Rejected
  because origin shifts and undiscovered cells require whole-visible-region
  reconciliation.

## Risks / Trade-offs

- Duplicate aspect and resize notifications could cause redundant renders →
  keep recalculation idempotent and compare canvas dimensions where possible.
- Realm transfer presentation has special source-to-destination screen
  placement behavior → keep it as an explicit resolver intent with comments and
  tests instead of replacing it with generic recentering.
- Existing dirty changes touch mapview and camera-related files → implementation
  should inspect the working tree before editing and avoid reverting unrelated
  work.
- Programmatic relocation paths may grow over time → expose a named relocation
  helper so future features do not bypass camera recalculation.

## Migration Plan

1. Add the bridge/controller notification needed for aspect changes.
2. Refactor game-layer camera-origin updates behind the centralized resolver.
3. Update startup, camera-mode, realm, zoom, aspect, resize, movement, and
   relocation call sites to use the resolver intent that matches the event.
4. Add focused tests around trigger coverage and stale-cell reconciliation.
5. Run focused Node tests for camera/player-grid/game-bridge behavior, then the
   repository test/build commands if the implementation scope warrants it.

Rollback is a normal code revert of this scoped change; no stored data
migration or dependency rollback is required.
