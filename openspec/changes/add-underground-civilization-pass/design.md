# Design

## Context

The existing Babylon Lite runtime owns procedural generation, movement,
collision, object state, rendering, realm state, and minimap state. The current
generation pipeline produces natural terrain and then distributes catalogued
objects, while React receives narrow snapshots for HUD values and logs. See
`proposal.md` and the delta specs for the intended behavior.

## Goals / Non-Goals

**Goals:**

- Add a deterministic Underground-only civilization layer without rewriting
  natural terrain or moving gameplay authority into React.
- Reuse the existing object catalog, object-layer rendering, collision path,
  log event path, palette resolution, and bridge snapshot patterns.
- Represent a closed door as a stateful blocker that can be unlocked without
  implicitly moving the player.
- Keep the key count authoritative in Babylon Lite and render only its
  immutable snapshot in the character HUD.
- Make generated barriers solvable and avoid placing a civilization group
  where either side cannot receive its required key.

**Non-Goals:**

- No Overground fences, doors, or keys.
- No door-closing, relocking, key dropping, or uniquely keyed door behavior.
- No new external dependency or persistence of opened doors across level
  regeneration.
- No React ownership of world cells, door state, key positions, or collision.

## Decisions

### Keep civilization as a later layered pass

The existing pass order remains the source of natural terrain and walkability.
Civilization runs after player placement and existing object distribution, then
claims a separate layer. This allows the pass to inspect cave walls and the
zoom-5 visible-region geometry while keeping the terrain layer intact.

An alternative was to mutate terrain cells into a new terrain kind. That would
couple man-made barriers to cave/water generation and make opening a door
difficult without rewriting terrain, so it is rejected.

### Use a deterministic screen-region candidate filter

The pass derives the current zoom-5 screen footprints from the existing world
dimensions and visible-region rules. Each eligible region is considered once
with a civilization-specific seeded random stream. A selected region receives
one barrier at most. The barrier candidate is a straight run of 3–10
walkable cells with cave-wall boundaries at both ends; the door occupies the
deterministic center cell of the run.

An alternative was to give every candidate a 10% chance. That would make dense
cave geometry produce more barriers than the player-facing “one per screen”
rule implies, so screen-region selection is preferred.

### Treat fences and doors as effective collision state

The underlying terrain remains available for lighting, fog, and minimap
composition. The civilization layer contributes effective movement blocking:
fences and closed doors reject movement, while open doors allow it. The object
or world-view composition resolves the visible civilization glyph above the
terrain before rendering.

The door interaction is handled at the shared movement destination check. A
closed-door attempt first evaluates the key count; without a key it emits the
locked message, and with a key it decrements the count, changes the door state,
emits the two unlock messages, and returns without moving or advancing time.
The next movement attempt enters the now-open cell.

### Use a shared key count with non-paired pickups

Every valid barrier receives one key candidate on each side randomly between
five and ten grid steps from the door, never adjacent. Keys are ordinary
one-time pickups that increment one shared count, and
any held key can unlock any closed door. This matches the HUD's scalar key
count and avoids adding door identity to the bridge contract.

Unique key-door pairing was considered, but it would add identity and failure
states that are not needed for the first civilization slice. It remains a
future extension if puzzle-specific keys are introduced.

### Preserve narrow UI communication

Babylon Lite publishes the key count through the existing immutable snapshot
pattern alongside the existing character values. React replaces the carrying
resource presentation with `⚿` and the count, but never receives key positions
or mutable door state. The Log System continues to receive game-layer events
and the existing bridge delivers ordered log lines.

### Add glyph identities through the existing palette/catalog contract

The catalog and active palette are extended for `─`, `│`, `█`, `□`, and `⚿`.
Doors use the same glyphs in both wall orientations; no runtime glyph rotation
is introduced.

## Risks / Trade-offs

- [Risk] A generated barrier can divide the connected natural region into two
  temporarily separated areas. -> Require a reachable key candidate on each
  side and skip candidates that fail the key-placement or start-reachability
  checks.
- [Risk] Screen-region dimensions vary with viewport and zoom settings. -> Use
  the canonical zoom-5 visible-region calculation and world coordinates, not
  the current browser viewport at generation time.
- [Risk] Closed doors may be treated as ordinary blocked cells by existing
  movement code. -> Put door interaction before the generic blocked-cell
  return, while preserving no-time-advance behavior for unlock attempts.
- [Risk] New glyphs may be missing from a customized palette. -> Validate all
  catalog state glyphs against the active palette before allowing the world to
  render them.
- [Risk] HUD state can lag after a pickup or unlock. -> Publish the key count
  immediately after each authoritative mutation and verify both collection and
  spending paths through the bridge snapshot.

## Migration Plan

1. Add the civilization catalog and palette entries while preserving existing
   object definitions and stored palette customizations.
2. Add the civilization generation and runtime state behind the Underground
   realm path.
3. Replace carrying with the key resource and add the key-count snapshot.
4. Run focused Node tests, the full existing test suite, and the production
   build; then manually verify Underground rendering, pickup, locked-door,
   unlock, and second-step traversal behavior.

Opened doors are session state only. Regenerating or restarting a realm starts
with its deterministic closed-door and key placement again.

## Open Questions

- Whether future civilization objects should use the same shared object catalog
  entries or a separate catalog namespace can be decided when the next object
  type is introduced.
