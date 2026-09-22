# Design

## Context

See proposal.md for motivation and the `responsive-ui-layout` delta for the
behavior contract. The document currently contains sibling `#game_layer` and
`#ui_layer` elements. Portrait CSS centers `#game_layer` in a 9:16 desktop test
frame, while the coarse-pointer rule deliberately restores both layers to the
full mobile viewport. `map.css` owns these presentation-frame rules.

## Goals / Non-Goals

**Goals:**

- Add an independent visual presentation around the existing desktop Portrait
  frame without changing frame dimensions, UI bounds, rendering, or input.
- Keep copied starter art owned and served by the RPG project.
- Preserve the coarse-pointer mobile override and all landscape behavior.

**Non-Goals:**

- Add a new player-facing setting or change the persisted aspect preference.
- Rework or redraw the copied art, adapt its palette, or create a mobile
  letterbox.
- Change Babylon Lite rendering, the React-to-game bridge, HUD composition, or
  fullscreen preference behavior.

## Decisions

### Use a sibling presentation element behind the game and UI layers

Add a dedicated, empty presentation element alongside `#game_layer` and
`#ui_layer`. Its CSS owns the backdrop and rails, has no pointer interaction,
and stays outside the game frame's stacking context. This keeps the feature
independent of the React HUD's hidden state and protects the game canvas and
all HUD controls from visual or hit-test overlap.

Alternative considered: render it inside the React HUD. Rejected because HUD
visibility would then suppress the presentation and its layout could interfere
with HUD controls.

### Reuse the established Portrait frame measurements

The presentation will derive rail positions from the existing centered 9:16
frame variables in `map.css`. Its backdrop covers the available page area; two
rail instances sit immediately outside the frame, with the left asset mirrored.
No minimum gutter width is imposed. Normal viewport clipping is intentional:
as available width contracts, outer artwork leaves the viewport rather than
causing overlap or changing game dimensions.

Alternative considered: shrink the game frame or add a breakpoint that hides
the presentation. Rejected because the fixed 9:16 frame and fluid outer crop
are explicit product decisions.

### Match Stealth & Steel's visual treatment with copied local assets

Copy the confirmed backdrop and rail PNGs into a new RPG source asset folder.
Use the same cover backdrop treatment, mirrored rail treatment, border,
inset-light/shadow finish, and outer drop shadows as the established game.
The Portrait selector exposes this only on non-mobile browser input; the
coarse-pointer mobile branch explicitly hides or omits it.

Alternative considered: reference the Stealth & Steel server's URLs at
runtime. Rejected because the RPG must own its initial assets and remain
self-contained.

### Preserve fullscreen and HUD-hidden presentation

The presentation element is governed only by portrait and non-mobile
eligibility, not the HUD visibility data attribute or fullscreen state. It
therefore occupies the outer space in fullscreen and remains visible when the
HUD is hidden.

## Risks / Trade-offs

- [The copied source art may be replaced later] -> Keep it isolated in a
  dedicated asset folder and use descriptive names so replacement is local.
- [The active responsive-layout change also edits `map.css`] -> Inspect its
  working diff at apply time and make a narrowly scoped, additive integration.
- [Narrow desktop windows leave no visible gutters] -> Treat outer clipping as
  intentional while retaining the untouched 9:16 game frame.
- [Layering could block input] -> Use a lower visual stack level and
  `pointer-events: none`; verify game and HUD controls remain operable.

## Migration Plan

1. Copy the two assets and add the independent presentation markup and CSS.
2. Add focused source coverage for eligibility, frame-relative placement, and
   non-interactive behavior.
3. Build and manually verify landscape, desktop Portrait, fullscreen, narrow
   desktop crop, HUD-hidden Portrait, and mobile Portrait behavior.
4. If a regression occurs, remove the independent presentation markup and
   rules; no setting, saved data, or game-state migration is required.
