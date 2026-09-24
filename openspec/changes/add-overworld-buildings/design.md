# Design

## Context

See [proposal.md](proposal.md). The current world holds terrain separately from
characters and static objects, and the existing Underground civilization code
already creates locked Doors and collectible Keys. Its 64-by-36 screen-region
selection uses a seeded base 10% chance, multiplied to quarter/current/double
by the Doors setting. Buildings require an Overworld equivalent without
turning a Home's fixed visual layout into the only possible future structure.

## Goals / Non-Goals

**Goals:**

- Model an enterable Building independently from a Home definition.
- Reuse established Key and Door interactions while making roof/interior
  visibility driven by the player's Building membership.
- Preserve deterministic placement, terrain identity, and object/dynamic
  occupancy exclusions.

**Non-Goals:**

- Do not change Underground fence-and-door civilization, existing Door logs,
  key inventory, or the underlying terrain generator.
- Do not add interiors as separate realms, loot, NPCs, quest behavior, building
  rotation, or a player-facing construction system.
- Do not prescribe future Building shapes, glyphs, or content beyond the
  generic Building contract and first Home type.

## Decisions

### Represent Buildings as static state with type-defined tiles

Each generated Building records its type, perimeter/wall cells, interior cells,
Door cell, exterior Door approach, Key cell, and exterior/interior glyph sets.
Home supplies the first fixed 20-by-10 tile definition: perimeter wall cells,
interior `^` roof cells, interior `.` revealed cells, and bottom-edge column-10
Door. This separates shared movement/visibility rules from per-type geometry;
future buildings add definitions rather than conditional Home branches.

### Derive visibility without replacing terrain

Terrain glyphs and natural walkability remain intact. Rendering composition
selects the active Building overlay: exterior while the player is outside, and
interior when their cell is the Building Door or one of its interior cells.
Perimeter walls are static blockers; the Door delegates its closed/open state to
the existing object system; interior cells retain effective walkability. This
avoids destructive terrain mutation and makes restoration on exit a derived
state rather than a fragile tile rewrite.

### Use a validated connected-space candidate and cardinal key route

The Home placer samples only fully walkable 20-by-10 Overworld rectangles,
reserves the bottom Door approach, then searches exterior connected walkable
cells for a 3-6-step cardinal path from that approach. It rejects candidates
that conflict with player start, paired stairs, objects, accepted Buildings, or
dynamic reservations. This is stricter than geometric distance: the generated
Key is actually reachable without entering the Home.

### Mirror Doors frequency but keep Homes independently configured

Homes use the same region size, seeded namespace pattern, and Low/Med/High
chance multipliers as Doors: quarter, current, and double the base group
chance. The `civilization-homes` catalog entry and profile value remain
independent of `civilization-doors`; migration supplies `Med` when Homes is
absent from an older saved settings catalog.

### Preview only the building identity

The procedural settings preview executes the same deterministic candidate
selection with preview-local state but draws exactly one `^` marker per
accepted Home. It does not add all footprint tiles, objects, or visibility
state to the preview world. `^` is already palette-supported and also matches
the approved roof representation.

### Keep ownership explicit across existing systems

The Building system owns candidate selection, static Building data, effective
blockers, and overlay choice. The Object Spawner System continues to own generic
Key collection and Door unlock/open behavior. The game layer observes a
successful player movement to determine Building membership and requests the
appropriate composed glyphs; it does not make the object system responsible for
roofs. This preserves the existing terrain/static/dynamic ownership boundary.

The concurrent procedural-catalog change (`add-rules-for-rendered-items-must-be-in-procedural-settings`) also changes Layer 8 catalog orchestration. Before applying either change, reconcile the Homes entry with that change's authoritative registry rather than keeping a second catalog path.

## Risks / Trade-offs

- [Large 20-by-10 Homes are rare in fragmented terrain] -> Reject partial
  footprints deterministically and make density a chance to consider eligible
  regions, not a promise of a Home in every region.
- [A key could be geometrically nearby but blocked] -> Use a cardinal
  reachability search from the Door approach.
- [Roof reveal leaks across structures] -> Associate the reveal decision with
  one Building identity and only the player’s current Building membership.
- [Static overlays interfere with stairs or spawned entities] -> Reserve known
  static cells before placement and provide Building cells to dynamic occupancy
  selection.
- [The active catalog planning change and this change touch the same settings]
  -> Reconcile their deltas before implementation and validate one resulting
  ordered catalog.

## Migration Plan

1. Add the Homes entry with a Med default during settings normalization while
   retaining all recognized existing selections.
2. Introduce Building selection, static overlays, and Home definition after
   existing static placement prerequisites are known.
3. Route preview marker selection through the same seeded Home candidate logic.
4. Add focused deterministic placement, reachability, visibility, collision,
   settings, and preview checks; run the repository's Node test suite and build.
5. Roll back by removing Building generation while retaining the added stored
   Homes selection as an ignored, forward-compatible value; no world-save or
   external-data migration is required.
