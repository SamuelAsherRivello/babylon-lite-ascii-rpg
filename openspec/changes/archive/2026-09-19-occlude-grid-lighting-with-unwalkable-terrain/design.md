# Design

## Context

See `proposal.md` for the motivation and the `palette-grid-lighting` delta for
the behavior contract. This is a browser RPG targeting modern desktop and
mobile browsers. React owns settings, the bridge passes lighting commands, and
the Babylon Lite game layer owns the 512-by-512 generated world and visible
ASCII rendering. `world.terrain[y][x].walkable` already distinguishes walls,
ground, and water depths; player and torch sources occupy walkable cells.

`lighting.js` currently computes Euclidean falloff without terrain, and
`index.js` calls it while rendering each visible cell. The renderer reuses
unchanged sprite state, while player movement already requests a complete
visible-region refresh. The current checkout also contains a pre-existing
uncommitted edit that forces lighting refresh on movement; implementation
must preserve it. The repository uses the existing Node test suite and
`npm.cmd run build` for validation. No external service, credential, data
migration, or new package is needed.

## Goals / Non-Goals

**Goals:**

- Resolve each source's visibility from the terrain layer, independent of the
  glyph displayed on top of it.
- Keep source visibility separate from the existing distance and ambient
  formulas so the current lighting controls retain their meaning.
- Bound work by the source radii and visible region, including after movement,
  zoom, camera changes, and world regeneration.

**Non-Goals:**

- Light bleed, bounced light, or illumination that follows walkable paths
  around a corner.
- Babylon scene lights, three-dimensional shadows, or changing terrain
  walkability to improve the appearance of shadows.

## Decisions

### Use a straight grid visibility test

For each candidate source and target cell, trace the segment between their
grid-cell centers with a deterministic supercover traversal. Every terrain
cell touched before the target is an intervening cell; if any has
`walkable: false`, that source contributes zero. A blocked target itself is
allowed to receive light when no earlier cell blocks the segment. Treat a
blocked cell touched at an exact diagonal corner as intervening, avoiding a
bright leak through a closed corner. Out-of-bounds cells are opaque.

This makes the chosen straight-shadow rule explicit for walls and blocked
water. A flood fill would allow light to turn around a corner; a Babylon ray
or shadow object would add scene machinery to palette lighting without using
the terrain's existing grid semantics.

### Build a visible source field before submitting sprites

`index.js` will pass the current terrain, visible region, torch cells, player
cell, and selected profiles to a game-layer lighting helper. It will first
select sources whose bounded radius intersects the visible region. For each
source, it will evaluate only visible target cells inside that radius, apply
the visibility test, and retain the strongest contribution for each target.
The existing Euclidean radius, falloff, profile maximum, and final
`ambient + (1 - ambient) * contribution` blend remain intact. `Off` sources
do no visibility work. `renderWorld` and `renderChangedWorldCells` consume the
same field so partial redraws and full redraws agree.

Cache the torch field by world identity, visible-region coordinates, and torch
profile; torches and terrain do not move within a generated world. Cache the
player field by those inputs plus player position and player profile. Ambient
changes need only reblend those fields. Invalidate on world replacement,
region change, profile change, and player movement as appropriate. Existing
per-slot sprite comparisons still avoid submitting unchanged glyphs. The
cache stores visible cells only, and each visibility trace is limited by the
source radius.

An alternative is to scan every torch and trace a path for every cell in
`renderCell`. That repeats the same source and path work during full renders
and would scale poorly with the current 512-by-512 world and screen-relative
torch density.

### Keep layer boundaries unchanged

The terrain layer supplies opacity through `walkable`; the character layer
continues to choose the displayed player or torch glyph. `lighting.js` and
the game layer derive a numeric factor; palette color and opacity application
remains in the renderer. React settings and the bridge retain their existing
light commands and stored indexes, and add separate Torch Shadow and Player
Shadow commands and stored indexes. Each source setting cycles `Off`, `Low`,
`Med`, `High`, and `X High` independently.

Light profiles carry fixed `R`, `M`, and `F` values. Separate shadow profiles
carry fixed `O` and `B` values: `Off` uses `O0 B1`, `Low` uses `O0.25 B0.75`,
`Med` uses `O0.5 B0.5`, `High` uses `O0.75 B0.25`, and `X High` uses `O1 B0`.
`O` is terrain occlusion and `B` is the source-light fraction retained after
the first intervening blocker. Additional blockers apply the profile
occlusion again, so `X High` retains the hard-shadow behavior while lower
presets bleed progressively more source light. Light labels present `R`, `M`,
and `F`; Shadow labels present `O` and `B`.

## Risks / Trade-offs

- **More work during player movement** -> Limit source candidates and target
  cells by radius, reuse static torch fields, and measure the existing zoom
  rerender and first-visible-render timings during manual verification.
- **Hard stair-step edges at grid corners** -> Use the same deterministic
  supercover rule in tests and rendering. This matches the selected hard
  shadows; soften them only in a later change if desired.
- **Blocked water creates shadows** -> Use the terrain's existing walkability
  consistently and include medium and deep water in focused fixtures and
  browser checks.
- **Stale cached light after state changes** -> Cover player moves, source
  profile changes, ambient changes, viewport shifts, zoom, and new worlds in
  focused tests. Preserve the current local movement-refresh edit in
  `index.js` when integrating.

## Migration Plan

No saved settings or world format changes. Implement the visibility field and
renderer integration together, then verify the Node suite, build, and browser
behavior before release. If the new visibility behavior needs revision after
shipping, make a follow-up change to the field calculation while keeping the
existing settings and palette path.
