# Design

## Context

World generation currently writes the player glyph into each realm's
`characters` grid at that realm's `playerStart`. Realm activation then places
the authoritative `playerCell` at the arrival cell, but it only clears the
source realm's previous player cell. The destination start-cell overlay can
therefore survive and render beside the arriving player.

## Goals / Non-Goals

**Goals:**

- Make realm activation establish one authoritative player overlay in the
  destination realm.
- Restore every cleared cell to its underlying stair, torch, object, pickup,
  or terrain representation.
- Cover startup, Underground-to-Overground, Overground-to-Underground, and
  repeated transfer behavior with focused tests.

**Non-Goals:**

- Do not change realm generation coordinates, paired-stair selection, camera
  positioning, transition animation, fog state, or player movement rules.
- Do not add a bridge command, React state, persistence field, or dependency.

## Decisions

1. **Normalize the destination realm before placing the player.** Add or reuse
   a game-layer/world helper that removes every stale `PLAYER_GLYPH` overlay
   from the destination realm and restores the cell's underlying display
   glyph, then set the authoritative arrival cell. This handles both the
   generated `playerStart` marker and any stale marker left by an earlier
   activation.

   The alternative of only clearing `world.playerStart` is smaller but leaves
   the system vulnerable to any future stale marker or a repeated activation
   path. Clearing only the source cell is insufficient because the duplicate
   is in the destination realm.

2. **Keep the player marker as a presentation overlay.** The fix will not
   change terrain, stairs, objects, or player coordinates. Restoring the
   underlying glyph through the existing world-layer rules preserves the
   current rendering and collision contracts while making the active player
   marker unique.

3. **Test the invariant at the world-layer boundary and realm lifecycle
   boundary.** Unit coverage will assert marker normalization against a
   generated realm and the lifecycle coverage will assert one marker at the
   arrival cell after transfers in both directions. This avoids coupling the
   behavior to Babylon renderer internals.

## Risks / Trade-offs

- [Risk] A character or object legitimately using the literal `P` glyph could
  be mistaken for a player marker. → Mitigation: limit normalization to the
  player overlay layer and restore cells through the existing object/stair/
  torch precedence; verify the project catalog does not use `P` for another
  entity in focused tests.
- [Risk] Clearing every stale marker could alter a malformed externally-created
  world. → Mitigation: the game layer owns generated realm data and the helper
  is used only during authoritative player activation, where exactly one
  player marker is the required invariant.
