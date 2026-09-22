# Design

## Context

The existing Babylon Lite controller creates `game_canvas` and
`minimap_canvas` inside `#game_layer`, owns keyboard/pointer movement, and
swaps realms in `activateRealm`. React is mounted independently in
`#ui_layer` above the game layer. See `proposal.md` for the motivation and the
delta specs for the observable contract.

## Goals / Non-Goals

**Goals:**

- Add a reusable game-layer transition primitive with explicit duration,
  animation progress, target layer ownership, and lifecycle events.
- Implement the first animation as a soft-edged black iris centered on the
  player's rendered screen-space cell center, with 500ms closing and opening
  phases plus a 100ms fully covered hold for realm replacement.
- Keep all movement/input authority and realm state in Babylon Lite.
- Preserve the existing React HUD, settings, bridge snapshots, paired-stair
  coordinates, fog state, and realm persistence behavior.

**Non-Goals:**

- No React transition component or UI-layer masking.
- No change to realm generation, stair placement, terrain profiles, or fog
  storage.
- No new rendering dependency and no image asset dependency for the iris edge.
- No general-purpose crossfade, camera transition, or settings redesign in
  this change.

## Decisions

### Use a game-layer DOM mask with CSS radial-gradient

Create a pointer-transparent mask element inside `#game_layer`, after the game
canvases, and drive its player-relative screen-space center, radius, and
feather values from the Babylon controller. A radial gradient gives the requested soft edge, follows the
existing DOM stacking model, and does not require a second Babylon sprite layer
or a new dependency. A separate canvas mask was considered, but it would add
another pixel surface and resize lifecycle for a presentation-only effect.

The game-layer stacking context remains below `#ui_layer`, so the mask can
cover the game canvas and minimap while the React UI remains visible.

### Represent the transition as two timed phases

The transition controller will use an explicit phase state (`closing`,
`covered`, `opening`, `idle`) and `requestAnimationFrame` timestamps. The
closing and opening durations are independently represented as 500ms, with a
100ms covered hold, making the 1100ms realm transition deterministic and leaving
room for future transition types.
The iris center is recomputed from the player's rendered cell and current
view origin, so it remains attached to the player in center, deadzone, and
free camera modes. The iris radius starts at a viewport-covering value,
reaches a radius derived from the visible player-cell footprint, and then grows
back to the covering value. The feather width is derived from the radius with
a minimum pixel floor, so the edge remains visible at both desktop and mobile
scales and all zoom levels.

### Put the realm swap behind the covered event

The existing realm activation path will be split so transfer preparation and
destination activation can be called at the transition midpoint. The stair
trigger and Settings travel path will request the same transition operation;
the operation clears movement input before starting, performs the existing
arrival and rendering work while covered, preserves the player's current
screen-cell offset when deriving the destination view origin, then resumes
input only after the opening phase completes. If destination bounds prevent an
exact offset, normal view-origin clamping applies.

After the covered callback swaps and renders the destination realm, the
transition holds full coverage for 100 milliseconds before starting the
opening phase. This gives the new realm one short, fully hidden settling
interval before it is revealed.

### Keep lifecycle events internal to the game controller

The reusable transition system will expose lifecycle callbacks/subscriptions to
the game-layer caller rather than extending the React bridge for animation
progress. Realm status will continue to cross the existing narrow bridge at the
realm activation point. This avoids making UI responsible for transition timing
or mutable presentation state while still allowing future game-layer effects to
react to start, cover, and completion events.

## Risks / Trade-offs

- [Risk] A long frame or tab throttling can delay an animation frame → use
  elapsed timestamps rather than frame counts and clamp progress to each phase's
  final value before firing the next lifecycle event.
- [Risk] A mask mounted at the wrong stacking level could cover React UI or
  receive input → mount it inside `#game_layer`, keep `pointer-events: none`,
  and verify the existing `#game_layer`/`#ui_layer` stacking order in browser
  validation.
- [Risk] Held keys or touch state could resume movement unexpectedly after the
  transition → clear held keyboard, touch, repeat, and pointer-capture state
  when the transition starts and require new input after completion.
- [Risk] Realm swap work could visibly render before the mask reaches full
  coverage → emit the covered event only after the close phase has rendered its
  final frame, then perform the swap before scheduling the opening phase.

## Migration Plan

1. Add the transition system and mirrored unit tests.
2. Mount the mask and integrate stair/settings realm transfer with the iris.
3. Add focused integration assertions and run the repository's existing Node
   test suite plus the production build.
4. If the transition is unsuitable, remove the integration call sites and mask
   while leaving the existing immediate realm activation behavior available;
   no persisted data migration is required.
