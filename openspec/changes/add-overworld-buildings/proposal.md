# Proposal

## Why

The Overworld has no multi-cell, enterable civilization structures: its existing
civilization behavior is limited to Underground barrier groups. A reusable
Building model is needed so the game can introduce a first Home building now
without hard-coding future structure types to Home's shape or visuals.

## What Changes

- Introduce an Overworld Building capability for seeded multi-cell structures
  with an exterior, concealed walkable interior, one controlled Door entrance,
  and an exterior reachable Key.
- Add Home as the first Building type: a fixed 20-by-10 footprint with blocked
  exterior walls, roof-filled interior, a bottom-edge Door at column 10, and a
  dot-filled interior while entered.
- Add an independent `Homes` Low/Med/High row to Layer 8 Civilization. It uses
  the same quarter/current/double group-chance semantics as Doors, while
  remaining separately persisted and Overworld-only.
- Make the Overworld procedural preview represent each Home with one Home
  marker. This proposal assumes `^`, the approved roof glyph, until a later
  palette-design decision changes it.
- Reuse the existing Key and Door lifecycle: each Home begins locked, receives
  one Key 3-6 reachable exterior grid steps from its Door, unlocks through the
  established interaction, and reveals its interior only when the player enters
  the doorway or interior.
- Preserve natural terrain identity beneath Building overlays and prohibit
  placement that overlaps the player start, stairs, existing objects, another
  Building, or a non-walkable/unreachable required cell.

## Capabilities

### New Capabilities

- `overworld-buildings`: Defines reusable Overworld Building placement,
  exterior/interior visibility, entry, and Home-specific behavior.

### Modified Capabilities

- `procedural-generation-settings`: Adds the independent Homes density row and
  its Overworld preview marker to Civilization Layer 8.
- `world-generation-passes`: Adds a deterministic Overworld Building pass
  after terrain, walkability, player placement, and prerequisite static
  occupancy are available.
- `procedural-level-generation`: Extends layered static rendering and effective
  walkability to Building walls, roofs, and revealed interiors.
- `object-spawner-system`: Allows the existing Key and Door objects to be
  associated with solvable Overworld Buildings without changing their generic
  collection or unlock semantics.

## Impact

- Affects the generation settings catalog/profile and procedural settings-map
  preview, world setup ordering, Building placement/state, static-object
  reservations, collision/render composition, palette-backed glyph use, and
  focused Node tests.
- No service, account, network API, or external dependency is added. Existing
  Doors settings and Underground door groups retain their current behavior.
