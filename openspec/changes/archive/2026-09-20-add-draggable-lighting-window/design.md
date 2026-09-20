# Design

## Context

See `proposal.md` for motivation. The React UI layer currently owns the
lower-left Settings markup, all lighting preference state, local-storage
persistence, setting tooltips, and bridge notifications. The game layer only
receives lighting snapshots. Existing editor windows are modal; the requested
Lighting surface must instead stay available beside gameplay.

## Goals / Non-Goals

**Goals:**

- Keep lighting state and game-layer snapshots in the existing React owner.
- Introduce a compact, non-modal window with pointer-safe title-bar dragging.
- Preserve the shared lower-left corner typography and all lighting behavior.
- Keep the window within reach after viewport changes and narrow-screen drags.

**Non-Goals:**

- Change lighting presets, values, persistence keys, rendering, or bridge APIs.
- Persist window visibility or position across a page reload.
- Turn the existing Ascii Palette or Arguments windows into draggable windows.

## Decisions

### Extract the existing lighting controls as one React control group

The existing GPU, source, shadow, and ambient controls will be moved unchanged
from Settings into a Lighting window component. The existing `Windows` section
will become `Windows - 1`; a `Windows - 2` section immediately beneath it will
contain the single `Lighting` launcher. The window will shorten only redundant
visible prefixes and arrange its controls alphabetically, while preserving the
state, accessibility meaning, and bridge paths. Duplicating controls would
make their state and accessibility behavior diverge.

### Use pointer events on a dedicated title-bar drag handle

The title bar will be the only drag handle and will track pointer movement in
React state while the pointer is captured. Button clicks inside the body will
not initiate a drag. Pointer events provide a common desktop and touch path;
HTML drag-and-drop was rejected because it is not appropriate for a compact
application window and has inconsistent touch behavior.

### Clamp window placement to its reachable viewport bounds

Initial placement will be a deliberate compact offset from the viewport edge.
Drag coordinates will be clamped after layout measurement and recomputed on
viewport resize so the header and close action stay accessible. This satisfies
mobile reachability without making the page scroll. Allowing unconstrained
dragging was rejected because it could strand the close action offscreen.

### Reuse corner typography rather than modal window styling

The Lighting title and controls will use the existing `corner_title` and
`corner_body` text classes, with a small window frame and title-bar-specific
layout styles. This keeps the requested visual language while avoiding the
large dark backdrop and modal behavior of the Ascii Palette window.

## Risks / Trade-offs

- [Pointer drag competes with control interaction] → limit dragging to the
title bar, capture only from that handle, and leave body buttons untouched.
- [Resize can leave a previously valid position offscreen] → clamp placement
on resize using current window dimensions.
- [Existing structural assertions encode lighting controls in Settings] →
update focused assertions to test the launcher and the Lighting window instead.

## Migration Plan

No data migration is required: storage keys and values remain unchanged. The
change is client-side only; reverting restores the prior Settings layout while
leaving saved lighting values compatible.
