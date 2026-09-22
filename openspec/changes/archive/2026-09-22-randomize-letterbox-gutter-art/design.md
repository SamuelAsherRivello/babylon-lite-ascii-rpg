# Design

## Context

See proposal.md for motivation. The existing independent letterbox presentation already owns the desktop Portrait composition in `map.css`, while application bootstrap runs once per page load. The two supplied images are complete replacement layouts, not new UI elements.

## Goals / Non-Goals

**Goals:**

- Make one random selection between the two owned layout assets per page load.
- Feed that selection into the existing presentation styling without changing its composition or eligibility.

**Non-Goals:**

- Add a player-facing selector, persist an artwork preference, rotate artwork while a page is open, alter gameplay rendering, or change mobile presentation.

## Decisions

### Store both supplied layouts as local assets

The Mossy and Chained images will live beside the current letterbox artwork so Vite bundles them with the RPG and no external URL is needed.

### Choose once during bootstrap

Bootstrap will choose one asset from the two-item set once and expose it as the background consumed by the existing CSS. Aspect, fullscreen, HUD, and resize state do not cause another choice.

Alternative considered: CSS-driven or timer-driven selection. Rejected because neither gives one stable random selection for the full page lifetime.

### Preserve the existing visual contract

Only the backdrop asset reference changes. Existing rail markup, frame geometry, filters, depth treatment, pointer transparency, and media-query eligibility stay intact.

## Risks / Trade-offs

- [A random refresh can repeat the same layout] -> Repetition is accepted because random choice, rather than strict alternation, is the requested behavior.
- [Artwork crop differs across viewports] -> Reuse the existing cover treatment and manually verify Portrait at wide and narrow desktop sizes.

## Migration Plan

1. Copy the two supplied assets into the existing letterbox asset folder.
2. Add load-only selection and connect it to the established backdrop rule.
3. Update focused source checks and run the existing test and build commands.
4. Verify desktop and mobile presentation behavior; reverting only restores the fixed asset reference.
