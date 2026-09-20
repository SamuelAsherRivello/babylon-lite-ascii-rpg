# Design

## Context

The React UI layer owns the corner HUD, while the Babylon game layer owns the
game canvas. The existing top boxes share a responsive CSS variable for the
minimap square size; the character panel must use that same variable rather
than introducing a second layout geometry. See `proposal.md` and the
`character-info` spec for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Keep the character panel within the existing minimap-sized square.
- Keep the character state as a UI-local immutable initial model until gameplay
  systems need to publish updates.
- Make the UI bar a reusable render path for all four stats.
- Keep icons as Unicode/text glyphs with no asset dependency.
- Keep the four stat rows compact by omitting redundant text labels; accessible
  names remain on the progress bars.

**Non-Goals:**

- No health depletion, death handling, combat calculations, leveling, pickups,
  inventory management, or carrying updates.
- No new package, persistence key, bridge event, or Babylon-layer API.

## Decisions

- Use a dedicated character data module with explicit starting and current
  fields. This keeps future update logic separate from the visual component;
  embedding literals directly in JSX was rejected because it would make later
  gameplay integration harder to audit.
- Render all four bars through one row component driven by metadata. Separate
  bespoke markup per stat was rejected because it would permit visual drift
  between health, offense, defense, and experience.
- Pass each row's base hex color into a pure color-derivation helper. Mixing
  toward white for the delta and toward black with a bounded factor for the
  unfilled section keeps the palette tied to the base color instead of
  duplicating hand-tuned CSS colors.
- Represent current, pending, and unfilled portions as layered DOM elements
  with CSS widths. Canvas or image-based bars were rejected because the
  requested UI needs text, accessible progress semantics, and later value
  updates without redrawing art.
- Reuse the minimap's `--top-panel-size` for both width and height. A wider
  details panel was rejected because the character box must remain the same
  size as the minimap.

## Risks / Trade-offs

- [Risk] Four bars plus two resource values may be dense inside the square box
  on a short viewport. → Mitigation: use compact responsive typography and
  spacing, and allow only the panel's contents to remain contained within the
  fixed box.
- [Risk] Unicode glyph appearance varies by browser font. → Mitigation: use
  plain text glyphs with accessible labels and no reliance on glyph artwork
  details for meaning.

## Migration Plan

Add the model, reusable UI row, and scoped CSS; run the focused static checks,
the existing Node test suite, and the production build. Rollback is limited to
reverting these scoped UI and OpenSpec files; no persisted data migration is
needed.
