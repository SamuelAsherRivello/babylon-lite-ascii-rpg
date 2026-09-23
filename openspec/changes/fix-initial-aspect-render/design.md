# Design

## Context

See proposal.md for motivation and the responsive-ui-layout delta for the
behavior contract. The game canvas is owned by Babylon Lite while React owns the
persisted settings and communicates through the bridge. Reproduction shows the
first frame begins with the game-layer default zoom, then controller attachment
replays the saved camera/zoom settings after world rendering has begun. The
same-mode camera restore explicitly requests a rebuild, causing the visible jump.

## Goals / Non-Goals

**Goals:**

- Establish saved presentation, camera, and zoom state before canvas viewport
  measurement and the first visible world render.
- Preserve one authoritative startup snapshot across the bootstrap, bridge, and
  game layer.
- Rebuild and re-center only after a real user-driven settings change.

**Non-Goals:**

- Change camera-mode semantics, world generation, or browser resize behavior
  unrelated to restoring saved startup settings.
- Change the Aspect setting's storage key, labels, defaults, or desktop/mobile
  presentation contracts.
- Alter unrelated mapview and glyph-cache work already present in the checkout.

## Decisions

### Establish the presentation attribute before module startup

An inline bootstrap reads only the existing Aspect storage key, normalizes its
value to `portrait` or `landscape`, and sets the document presentation attribute
before the Vite module starts. The default remains landscape. This lets CSS
resolve the game-layer geometry before Babylon Lite creates and measures its
canvas.

Alternative considered: wait for additional animation frames before the first
world render. Rejected because it adds startup delay and still allows an
incorrect frame to be measured.

### Initialize the game with the saved camera and zoom

The bridge owns normalized startup snapshots for the existing persisted camera
and zoom settings. `main.jsx` supplies those values when it constructs Babylon
Lite, so its first viewport and first world render use the same zoom and camera
state the UI displays.

Alternative considered: let controller attachment repair a default viewport.
Rejected because the repair is visible and produces the recorded player jump.

### Make settings restoration idempotent at the game boundary

The bridge delivers explicit normalized settings to the controller. Babylon
Lite ignores a restored camera mode, zoom, or aspect that already matches its
initial state. A changed setting triggers the existing appropriate viewport
rebuild after the relevant UI frame has been committed.

Alternative considered: suppress every bridge restoration. Rejected because
controller replacement and real React aspect changes must still reach the game
layer.

### Commit React presentation state before painting

The React Aspect synchronization moves to a pre-paint layout synchronization so
the document attribute is current when a user toggles the setting. Persistence
and bridge delivery remain coupled to the normalized state, avoiding divergent
React and canvas frames.

Alternative considered: retain a passive effect plus two nested animation
frames. Rejected because its intentional delay is the visible startup defect.

## Risks / Trade-offs

- [Startup snapshots drift from UI normalization] -> Reuse the existing zoom
  migration/default contract and cover saved and absent values.
- [A dynamic CSS resize is not observable immediately] -> Coalesce a real
  aspect change to the first frame after the committed layout, never during
  initial no-op restoration.
- [Source-contract checks miss browser paint ordering] -> Add focused checks
  for the bootstrap and idempotent handoff, then manually refresh in both saved
  modes.

## Migration Plan

1. Add the synchronous presentation bootstrap and normalized startup camera and
   zoom handoff.
2. Make game-layer restoration idempotent and retain real-change rebuild paths.
3. Add focused tests and run the existing Node suite and production build.
4. Manually refresh with saved landscape and saved portrait settings.
5. Rollback consists of reverting only this change's bootstrap, bridge, React,
   game-layer, and test edits; no persisted-data migration is required.
