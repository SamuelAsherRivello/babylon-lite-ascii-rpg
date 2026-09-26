# Design

## Context

The Babylon Lite game layer owns canvas input, player movement, route queries,
occupancy, and sprite rendering. Existing keyboard and swipe input share a
held-input repeat loop, and `AStarUtility` already supplies cardinal
walkability and bounded distance-field queries. See proposal.md for the
feature motivation.

## Goals / Non-Goals

**Goals:**

- Add a bounded, route-aware mouse navigation source that reuses ordinary
  one-cell player movement.
- Keep the target marker and all mutable world/navigation state inside the
  Babylon Lite layer.
- Prevent route planning from accepting or searching an arbitrary long player
  journey.

**Non-Goals:**

- Changing keyboard, WASD, or swipe navigation behavior.
- Auto-contacting enemies, NPCs, chests, doors, or mountains.
- Cross-realm navigation, a persisted mouse-navigation setting, a React world
  data bridge, or a new dependency.

## Decisions

### One bounded route authority

Add game-layer-owned mouse target and held-button state alongside the existing
keyboard and touch input state. A shared movement-source resolver will choose
manual keyboard/swipe direction or the next auto-route direction, while the
existing movement commit path remains the only code that changes player state,
time, stamina recovery, camera, rendering, and movement events.

This avoids a separate mouse movement implementation. Directly relocating the
player or replaying synthetic keyboard events was rejected because either
would bypass or obscure the authoritative movement path.

### Bounded distance fields rather than full-route rejection

Use an occupancy-aware cardinal distance field with a maximum distance of 50
to establish whether an available target is reachable. Choose the resolved
fallback by scanning reachable candidates and ranking them by cardinal distance
from the pointer cell, then deterministic row and column ties. Build a bounded
field from the resolved target to select the next lower-distance cardinal
neighbor for each automatic movement attempt.

This provides a shortest bounded route without first constructing an
unrestricted world-scale route and rejecting it afterward. The existing full
route API is intentionally retained for its other callers.

### Explicit auto-navigation availability predicate

The auto-navigation predicate combines terrain walkability, the active realm's
static-occupancy index, and dynamic occupancy while exempting only the player
source cell. It excludes contact targets instead of reusing ordinary player
contact dispatch. This preserves manual attack/interact behavior while making
mouse movement safely movement-only.

### Presentation-only marker layer

Render the four-corner white reticle in a small dedicated game-layer sprite or
overlay resource aligned to the resolved visible cell. Its state changes only
when pointer resolution changes; it has no occupancy, collision, minimap, or
React representation. The resource follows the existing renderer lifecycle
and is disposed with the game session.

### Invalidation and rerouting

Invalidate the cached bounded field when the target, player cell, active
realm, or navigation/occupancy state makes its next step unavailable. Before
each auto step, validate that next cell against current availability; on a
failure, resolve a replacement bounded route. Do not wait for an old route to
clear or contact the blocker.

## Risks / Trade-offs

- Dynamic actors can change cells between repeat callbacks -> validate the
  next step and recompute only when it is no longer available.
- A dense local obstacle field can make bounded selection work expensive ->
  cap all fields at 50 steps and avoid work when no mouse target is held.
- Camera, resize, or realm change can invalidate screen-to-world mapping ->
  recalculate or clear the target using the current viewport and active realm.
- Existing pointer bindings currently have duplicated registration paths ->
  consolidate them while adding mouse-button handling so one browser event
  causes one input action.

## Migration Plan

No data migration is required. Releasing the feature is additive; releasing a
mouse button, hiding an invalid target, or disabling the game layer restores
the existing manual-input behavior.
