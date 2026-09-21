# Proposal

## Why

The Underground currently contains natural cave and terrain features but no
man-made layer that changes exploration. This change introduces the first
civilization pass: seeded fences, locked doors, and collectible keys that make
an Underground route temporarily gated while preserving the game's grid-based
movement and game-layer ownership boundaries.

## What Changes

- Add an Underground-only civilization generation pass after natural terrain,
  water, walkability, and player placement are available.
- Find eligible horizontal or vertical spans of 3–10 contiguous walkable cells
  between cave walls, with approximately a 10% chance per eligible zoom-5
  screen region and at most one barrier per selected region.
- Render fences with `─` and `│`, closed doors with `█`, open doors with `□`,
  and keys with `⚿`.
- Place one key randomly between five and ten grid steps on each side of every
  generated door, never adjacent to the door;
  skip candidates that cannot support valid key placement.
- Make fences and closed doors non-walkable, allow closed-door interaction from
  any cardinally adjacent cell, consume a key on unlock, and leave the player
  in place until a later movement attempt enters the open door.
- Keep unlocked doors open for the current level session.
- Log `The door is locked.`, `A key was spent.`, `The door unlocked.`, and
  `The key was collected.` using the existing past-tense log flow.
- Replace the character HUD's carrying resource with a `⚿` key count starting
  at `0`, and remove carrying state and presentation.
- Add palette identities and editable styling for all new civilization glyphs.
- Preserve deterministic seeded generation and Babylon Lite ownership of
  generation, collision, object state, rendering, and bridge snapshots.

## Capabilities

### New Capabilities

- `underground-civilization`: Underground fences, doors, keys, barrier
  generation, unlock behavior, and key inventory behavior.

### Modified Capabilities

- `world-generation-passes`: Add the civilization pass after the natural
  generation prerequisites and preserve deterministic pass ownership.
- `procedural-level-generation`: Add a non-terrain civilization layer whose
  barriers change effective movement availability without rewriting natural
  terrain.
- `object-spawner-system`: Extend the authoritative object model to support
  key pickups and persistent fence/door objects with stateful collision.
- `player-grid-movement`: Define locked-door interaction, key-gated opening,
  and the separate movement attempt required after a door opens.
- `character-info`: Replace carrying with the live key count in the HUD and
  character resource model.

## Impact

- Affects Babylon Lite world generation, object spawning, effective
  walkability, collision, rendering, minimap content, and game logs.
- Affects the React character HUD and the narrow bridge snapshot used to expose
  the key count; React will not own key or door state.
- Affects object and palette JSON data plus mirrored Node test coverage; the
  existing generic log and palette contracts remain the delivery mechanisms.
- No new dependency is expected.
- The key inventory uses one shared count; uniquely paired keys are deferred to
  a future puzzle-specific feature.
- Overground, future door-closing gameplay, and other civilization objects are
  outside this change.
