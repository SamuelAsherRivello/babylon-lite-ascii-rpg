# Design

## Context

The current application has a viewport-derived grid and a canvas renderer that
draws only `P`. See `proposal.md` for motivation. The existing player-grid
behavior must remain compatible with the current React/Vite browser client,
while movement gains access to explicit world terrain.

## Goals / Non-Goals

**Goals:**

- Introduce a pure world-generation/model boundary that can be unit tested
  without a browser.
- Keep terrain and character state separate so future actors and obstacles can
  occupy additional layers.
- Keep rendering precedence explicit: character, then terrain.
- Produce a connected, bordered cave-like map suitable for immediate play.

**Non-Goals:**

- Defining the general-purpose ASCII palette; that belongs to the separate
  `add-ascii-palette` proposal.
- Adding monsters, objects, combat, camera scrolling, or map persistence.
- Adding a third-party generation dependency.

## Decisions

- **Explicit world dimensions:** The world owns `rows` and `columns`, rather
  than deriving them from the viewport. This preserves stable generation and
  allows a later camera or larger map without changing the map data contract.
- **Light cellular automata:** Start with random interior cells, apply the
  fixed 4–5 neighborhood rule for the configured number of smoothing passes,
  and keep the outer border as walls. Full threshold/radius tuning is deferred.
- **Seeded randomness:** Resolve a seed for every generation. A caller-provided
  seed is used unchanged; otherwise the generator creates a fresh seed from
  client randomness and stores it in the returned world. This gives normal
  gameplay a new level while allowing tests, bug reports, and future replay to
  reproduce a layout from the retained seed.
- **Connected-region acceptance:** Flood-fill walkable terrain, retain the
  largest eligible connected region or regenerate until the minimum area rule
  is satisfied, then choose the player start from that region. This prevents
  the known isolated-cave failure mode of raw cellular automata.
- **Layer ownership:** Terrain stores glyph and walkability for the current
  temporary `W`/`•` definitions; the character layer stores optional `P`.
  Rendering resolves one visible glyph per cell without mutating terrain when
  the player moves.
- **Movement integration:** The existing keyboard and repeat scheduler remain
  behaviorally intact, while the move predicate adds world bounds and terrain
  walkability checks.

## Risks / Trade-offs

- [Small maps may not produce enough open cells] -> Validate dimensions and
  regenerate with a bounded attempt count, then report a clear generation
  failure rather than returning an unplayable map.
- [Connected-region filtering can discard interesting side chambers] -> Preserve
  only the selected playable region for this first proposal; future level types
  can choose corridor carving or multi-region rules.
- [Viewport and world coordinate systems may diverge] -> Keep world cells in a
  stable row/column coordinate space and make the renderer's visible-cell
  mapping explicit.
- [The temporary palette contract may be duplicated] -> Keep `W` and `•`
  definitions local to this proposal and migrate them when the separate palette
  proposal is intentionally started.

## Migration Plan

Implement the world model behind the current canvas, preserve the existing
player-grid public helpers where possible, and add focused tests before browser
verification. The change is local and has no data migration or rollback
procedure beyond reverting the scoped application files.

## Open Questions

The exact minimum connected walkable-area percentage can be chosen during
implementation from the accepted generator constraints without changing the
public world or layer contract.
