# Design

## Context

See proposal.md for motivation. The React HUD already uses `CornerLayout` for
corner anchors, `BoxLayout` for framed panels and action labels, and a
controlled open/closed implementation for Log. The lower-left tools are
currently loose `HudBlockLayout` sections, with their size inherited from the
corner and their text promoted to the 10pt action treatment.

## Goals / Non-Goals

**Goals:**

- Reuse the Log panel's controlled, persisted collapse pattern for Dev.
- Keep all existing lower-left actions stable while replacing only the
  Developer visibility control.
- Scope the new 8pt typography to Dev and keep it independent from Log.

**Non-Goals:**

- Do not alter Log entries, Log scrolling, or the game-to-React bridge.
- Do not move the developer tools out of the React UI layer.
- Do not change unrelated settings, panels, or game-layer behavior.

## Decisions

1. **Anchor Dev with `CornerLayout` and frame it with `BoxLayout`.** The
   lower-left anchor remains the corner owner's responsibility, while the
   existing box/action mechanism supplies the same visible geometry as Log.
   A parallel panel component would duplicate the established pattern.

2. **Use an independent Dev open-state storage key.** A boolean value defaults
   to closed and is written whenever the panel changes state. This preserves
   Log's state and avoids reviving the retired Show UI preference.

3. **Place the existing lower-left content in a non-scrolling Dev body.** The
   body keeps GitHub, Windows, Info, and Settings markup intact, removes the
   Developer checkbox, and uses compact 8pt scoped title/body classes. This
   meets the requested no-scroll treatment without changing tool handlers.

4. **Remove HUD-hidden initialization rather than leave an unreachable
   preference.** The retired Show UI value is ignored, preventing a migrated
   session from hiding the only Dev launcher.

## Risks / Trade-offs

- **[A fixed Log-sized Dev panel can become dense at short heights]** → Use
  compact body padding and 8pt scoped text, then verify supported landscape
  and portrait presentations without scrollbars or clipping.
- **[Legacy Show UI storage can hide the new launcher]** → Remove reads and
  CSS rules for the old preference rather than migrating its value.
- **[Tool markup can drift during wrapping]** → Preserve stable IDs, handlers,
  accessibility descriptions, and lower-left content order in focused tests.

## Migration Plan

1. Add the Dev state and wrap the existing lower-left React content in the
   shared panel layout.
2. Add Dev-specific CSS and remove the retired Show UI state, initialization,
   and hidden-HUD selectors.
3. Update focused source-contract tests, then run the existing Node suite,
   production build, and manual landscape/portrait checks.

Rollback is a source-only revert of the scoped React, CSS, platform-setting,
and test changes; the obsolete local-storage key can safely remain ignored.
