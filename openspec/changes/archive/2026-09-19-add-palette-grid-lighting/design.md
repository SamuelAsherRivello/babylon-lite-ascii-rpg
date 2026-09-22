# Design

## Current seams

- `world-system.js` already returns `world.torches` as stable `{x, y}` cells
  and `getVisibleGlyph` keeps terrain and character layers separate.
- `visible-region.js` bounds rendering to the current world-space region and
  already tracks per-slot render state.
- `palette-color-cache.js` converts palette colors to the linear RGBA values
  expected by the sprite renderer.
- `index.js` submits one sprite per visible cell and updates only dirty slots.

## Lighting model

Add a pure module near the Babylon Lite renderer that validates lighting
configuration and calculates a factor from a cell, the level ambient value,
and the active source profiles. The initial recommended defaults are:

- level ambient: `0.6`
- ambient range: `0..1`
- ambient adjustment step: `0.05`
- source profile states: `Off`, `Low`, `Med`, `High`; cleared-storage defaults
  are Torch `Low` and Player `High`
- radius: `6` grid cells
- maximum factor: `1`
- falloff exponent: `2`

The level ambient value is UI-controlled and applies to the entire level. For
each active source, calculate Euclidean grid distance. A cell at distance zero
receives the source profile's maximum contribution. A cell at or beyond the
radius receives no source contribution. Inside the radius, use:

`contribution = (1 - distance / radius) ^ falloffExponent`

Combine torch and player source contributions with `max`, then blend the
normalized source result with level ambient:

`finalFactor = ambient + (1 - ambient) * sourceContribution`

At ambient `0`, only active source profiles contribute. At ambient `1`, the
final factor is `1` everywhere and all source profiles are visually inert.
`max` keeps the result bounded, cheap, and predictable for overlapping sources.

Torch and player sources are independently controlled. `Off` contributes no
light; `Low`, `Med`, and `High` select progressively stronger radius/falloff
profiles. The UI labels SHALL use exactly `Lighting Torch` and
`Lighting Player`, followed by the selected state.

## Palette modulation

Keep the glyph atlas tint-independent. For each visible glyph, take its active
base palette color and apply an ambient-to-lit RGB interpolation while deriving
opacity from the same factor. The saved palette remains untouched. Palette
entries retain editable color but no editable alpha; any legacy alpha value is
ignored or normalized by the client. Torch glyphs use the same lighting rule
as other glyphs so the source remains visually integrated with the scene.

## Renderer integration

`renderCell` will resolve the world-space cell's factor and include it in the
sprite state key. `renderWorld` and `renderChangedWorldCells` will use the same
helper, so resize and zoom cannot diverge. A palette update will invalidate
colors while preserving the lighting factor. Because the player is itself a
moving light source, every player move SHALL use a full visible render so the
previous position cannot leave a stale light trail.

No `Light`, `ShadowGenerator`, ray cast, terrain blocking, or new client
dependency is part of this proposal. That is intentionally distinct from the
future shadow-casting character-lighting proposal.

## Controls and bridge

The React settings surface SHALL place an ambient row immediately above Zoom.
It SHALL display the current value in the compact form `Light Ambient + 0.5 -`
with increment and decrement actions, clamped to `0..1` in `0.05` steps. The
two source controls SHALL be separate rows or buttons and cycle independently
through `Off`, `Low`, `Med`, and `High`. React owns only control state and sends
commands through the narrow bridge; Babylon Lite owns the authoritative
lighting state and rerender.

The Settings surface SHALL place a `Reset Settings` button after Zoom. It SHALL
call `localStorage.clear()` and reload the page so the cleared-storage defaults
are applied.

## Verification

- Unit-test distance, radius boundary, falloff, overlap, ambient endpoints,
  source profile states, configuration validation, and wall/floor equivalence.
- Unit-test that ambient `1` suppresses both source types and ambient `0`
  leaves only active sources.
- Unit-test palette modulation without mutating palette entries.
- Extend rendering tests to confirm lighting participates in dirty-sprite
  comparisons and visible-cell bounds.
- Run the existing Node test suite and production build.
- Manually inspect the browser at zoom 5 with the generated torches visible;
  confirm the ambient row, both source controls, circular bright areas, no wall
  shadows, endpoint behavior, and stable torch positions after resize/zoom.
