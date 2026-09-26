# Design

## Context

The game already has bounded world-view composition, realm-aware world coordinates, developer Windows launchers, and a draggable Lighting window. The particle folder contains transparent numbered PNG sequences for fire and smoke effects; the runtime must copy those assets into the application rather than reference the Downloads path.

## Goals / Non-Goals

**Goals:**

- Make particle effects reusable from gameplay code later, independent of the debug UI.
- Keep effect identity, frame order, scale, and loop metadata in one catalog.
- Render particles as a late transparent overlay with visible-region culling.
- Provide a persistent-open, draggable PFX inspection window and repeated click placement.

**Non-Goals:**

- No gameplay-triggered particle events in this change.
- No auto-tiling or terrain replacement.
- No particle simulation, physics, lighting emission, or minimap placement UI in the demo.
- No new renderer or runtime dependency.

## Decisions

1. **Use copied frame sequences, not a single baked preview sheet.** Individual numbered PNGs preserve frame timing and permit future atlas packing without changing catalog names. The preview sheet remains reference material only.
2. **Use a catalog plus active-instance layer.** Catalog records are immutable production metadata; active instances carry world coordinate, start time/frame, and one-shot lifecycle. This keeps debug placement separate from future gameplay callers.
3. **Use the existing world-view coordinate and visible-rectangle contract.** Placement converts the pointer through the existing camera/grid mapping. Rendering culls by projected effect bounds, while active instances remain alive offscreen.
4. **Reuse Lighting-window interaction conventions.** The PFX surface is non-modal, title-bar draggable, voluntarily closable, and remains open after selection or placement. This avoids creating a second window system.
5. **Keep demo controls developer-only.** The catalog and renderer are production APIs, but the PFX launcher and click placement are gated behind the existing developer surface.
6. **Treat supplied authored sequences as one-shot by default.** Metadata can mark future loop-capable sequences, but the current RCArt sequences should play once and self-remove. Persistent effects can later use explicit loop metadata or a separate looping spawn API.

## Risks / Trade-offs

- [Effects visually spill beyond one grid cell] -> Preserve transparent bounds and center them on the anchor cell; expose per-effect scale metadata instead of cropping.
- [Bright warm effects clash with blue-purple dungeon art] -> Keep source pixels intact for the first demo; allow later per-instance tint through the production API.
- [Many debug clicks create many active sprites] -> Cull offscreen instances and remove completed one-shots; add a bounded diagnostic clear action only if profiling shows a need.
- [Pointer clicks could be intercepted by the PFX window] -> Window interactions stop propagation; world placement only handles clicks outside the window and on valid world coordinates.

## Migration Plan

Copy the asset sequences into the application's source asset tree, add the catalog and overlay path, add the developer launcher/window, then verify with focused tests, build, and manual browser inspection. Removing the debug UI later does not require changing the production catalog or renderer.
