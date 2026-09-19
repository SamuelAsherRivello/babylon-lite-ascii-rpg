# Design

## Context

See `proposal.md` for motivation. The current Babylon Lite world system builds
a boolean cave grid, converts it directly into terrain cells, chooses a center-
most walkable start, and keeps characters in a separate layer. Movement reads
terrain walkability, while rendering resolves one visible glyph through a fixed
glyph atlas and the active palette. The existing torch change also uses the
character layer, so water must remain terrain-owned.

## Goals / Non-Goals

**Goals:**

- Make generation passes explicit and independently parameterized.
- Preserve seeded reproducibility, bordered worlds, and the current terrain /
  character separation.
- Add deterministic independent organic lakes with nested depth bands.
- Derive final connectivity after all terrain-affecting passes and place the
  player only after that validation.
- Make future terrain passes able to claim new layers without rewriting cave,
  water, or player logic.

**Non-Goals:**

- No swimming, movement speed changes, animation, ripples, audio, or water
  interaction.
- No React controls for generation parameters in this change.
- No separate map file or persisted-world format.
- No changes to the torch placement contract beyond ensuring character
  precedence still works over water.

## Decisions

### Use a shared generation context and ordered pass results

Represent generation as a small pipeline in the game layer. The context holds
rows, columns, the resolved seed/random source, generation options, and the
current terrain masks. Each pass returns or mutates only its owned layer plus
the context needed by later passes.

The initial order is:

```text
ground -> cave/walls -> water -> walkability -> player position
```

The ground pass establishes interior candidates and border exclusions. The
cave pass applies the existing 4-5 cellular-automata rule and wall settings.
The water pass can only claim non-wall ground. The walkability pass derives
ordinary ground and shallow water as traversable, then selects and validates a
connected region. The player pass chooses the center-most valid cell from that
final region.

This keeps the user-requested layer ownership clear while respecting the
dependency that player placement cannot be final before water and walkability.
An earlier player preference would be provisional and would make the contract
harder to reason about, so it is not used.

### Keep cave generation as the first terrain-shaping pass

Retain the existing bordered cellular-automata rule and its wall-fill,
smoothing, and minimum-region options inside the cave pass. Do not let the
water pass alter walls or let the walkability pass reconstruct the cave. The
connected-region check moves conceptually to the walkability pass so it sees
the final effect of water.

### Generate independent small lakes, then assign depth by distance

The water pass uses the shared deterministic random source to choose eligible
interior ground seeds and grow several irregular connected masks. Each lake is
bounded to 5-20 cells at the default grid scale, and a small reserved buffer
keeps neighboring lakes visually distinct. The aggregate target is near 20%
of the post-cave eligible ground, while callers can still set the independent
coverage parameter for future world-generation variants.

After each lake is selected, compute each cell's inward graph distance from the
lake boundary. Assign the deepest band to the cells with the greatest inward
distance, the medium band to the next inward ring, and the shallow band to the
boundary. A center-most tie-breaker keeps thin lakes deterministic; the pass
may stop early when cave geometry cannot fit another complete small lake, then
the final walkability validation preserves the minimum playable area.

The default water coverage is 20% of interior non-wall ground cells, with the
implementation documenting a small integer-grid tolerance. Coverage is based
on the post-cave candidate set, not total viewport cells, so changing wall
fill does not silently change what “20% water” means.

### Use existing supported glyphs and palette ownership

Use `~`, `≈`, and `▓`, which are already representable by the existing palette
inventory. The renderer atlas gains the three terrain frames, and the palette
data receives default styles:

| Depth | Glyph | Default color | Walkable |
| --- | --- | --- | --- |
| Shallow | `~` | `#62c7ff` | Yes |
| Medium | `≈` | `#247fc3` | No |
| Deep | `▓` | `#0b3d91` | No |

Palette overrides continue to win over defaults. Terrain cells may retain color
and alpha metadata for future non-glyph renderers, but current visible style
resolution remains through the active palette as required by the existing
renderer boundary.

### Derive walkability after water and preserve character precedence

The walkability pass computes `walkable` from terrain kind/depth rather than
from the glyph alone. It then finds the largest connected region among
ordinary ground and shallow water and rejects/retries generation if the region
does not satisfy the configured minimum. Player placement uses that accepted
region. The character layer remains independent, so the player and torches can
hide water visually without removing water semantics from terrain.

### Keep resize redraws seed-stable

The resolved world seed remains the source of truth. Recreating a world for a
resize passes the same dimensions/options/seed through the same pipeline, so
water and all other generated layers remain reproducible for that world
identity.

## Risks / Trade-offs

- **[Risk]** Water can fragment the cave's walkable region. -> The final
  walkability pass validates connectivity after water, and unsuitable masks or
  cave attempts are retried within the existing bounded generation behavior.
- **[Risk]** Small maps cannot express three useful depth bands in every
  5-20-cell lake.
  -> Use integer-cell tolerance and reject only when the final minimum
  walkable-area contract cannot be met.
- **[Risk]** Existing active torch work may touch the same world and atlas
  files. -> Integrate against its current character-layer contract and keep
  water terrain-only; do not duplicate or replace torch placement.
- **[Trade-off]** A shared pass context adds structure to a currently small
  generator. -> The structure pays for itself by making later terrain passes
  parameterized and composable without another monolithic rewrite.
- **[Trade-off]** The depth glyphs are palette-editable, so a user can reduce
  the intended visual distinction. -> The shipped defaults establish the
  requested blue progression while preserving the existing palette editor's
  customization model.

## Migration Plan

1. Add the pass-oriented world-generation model while preserving the current
   `createWorld` input and returned world shape wherever possible.
2. Move cave generation into the cave pass, then add water and final
   walkability/player passes.
3. Add atlas/palette entries and focused deterministic tests.
4. Run the existing Node tests and production build, then manually verify a
   seeded browser level and a resize redraw.
5. Roll back by removing the water pass and its three atlas/style defaults;
   existing cave-only generation can remain as the fallback pipeline.
