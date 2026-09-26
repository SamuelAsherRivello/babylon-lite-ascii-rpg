# Design

## Context

The existing bomb system is the authoritative owner of fuse, expanding circular blast, chain reaction, and damage dispatch. It currently exposes `💣` for planted bombs and `✶` for active cells. The game layer already has a reusable grid-anchored particle catalog and an overlay renderer, but it presently advances only standalone one-shot instances and has no gameplay lifecycle handoff. See [proposal.md](proposal.md) and the `bombs` delta for the requested behavior.

## Goals / Non-Goals

**Goals:**

- Add reusable compound PFX that sequence two or more effects with optional frame-count crossfades.
- Give each planted bomb a deterministic visual lifecycle: still `SmokePoff` preview, then a three-frame-crossfaded `SmokePoff` → `FirePlume` compound PFX.
- Keep gameplay authority in the bomb system: radius growth, damage amount, target resolution, chain reactions, and pre-action tick order remain unchanged.
- Keep a blast cell registered as hazardous until its assigned smoke-and-fire presentation has completed, including when its realm is not currently visible.
- Preserve the existing particle overlay's position, culling, and non-mutating compositing behavior.

**Non-Goals:**

- Adding PFX settings, a new developer window, additional particle assets, audio, screen shake, or a renderer dependency.
- Changing fuse length, blast-radius geometry, bomb inventory, combat formulas, or which targets bombs affect.
- Adding Playwright coverage.

## Decisions

### Add compound PFX as a first-class presentation type

The particle layer will define a compound PFX as an ordered list of existing particle effects plus transition metadata. Its generic runner will create and advance member instances at one realm/cell, start each member exactly once, and report compound completion only after the final member finishes. An omitted or zero crossfade waits for the preceding member to finish; a positive `n` starts the next member at the preceding member's final `n` frames.

During a crossfade the runner submits both member instances. Submission order is declaration order, making the newer member draw above the prior member by default. The bomb will use a named `SmokePoff` → `FirePlume` compound PFX with `3` crossfade frames, rather than hard-coding a bomb-specific completion callback. The alternative—encoding smoke/fire pairing in the bomb system—would duplicate a generally useful PFX composition feature and make future sequences require gameplay-specific logic.

### Represent bomb presentation as explicit lifecycle records

The bomb system will retain presentation records keyed by bomb and cell, rather than deriving the blast glyph from the current radius. On placement, it will expose an in-bounds radius-five footprint in the `armed-preview` state. As the deterministic expanding blast first reaches a cell, that record becomes `compound-active`; compound completion retires the record and its hazard.

This makes the requested static preview and per-cell sequential effects explicit, retains overlapping/chain-reacting bombs as independent records, and makes the no-`✶` rule structural. The alternative—calculating an effect name from `radius` during rendering—cannot preserve a still preview, asynchronous sequence completion, or a cell-specific hazard lifetime.

### Keep simulation and presentation clocks separate through narrow callbacks

World-time ticks will continue to activate blast cells and call normal damage handling. The game-layer PFX runner will report compound completion through a narrow bomb-presentation callback; the bomb system will then retire the completed compound cell. Its damage query will include `compound-active` cells, so a subsequent world-time tick can damage those cells for the complete visual sequence.

This lets the existing millisecond frame metadata control visual playback while retaining deterministic gameplay initiation. The PFX runner must advance lifecycle state for effects in all realms even when it only submits visible overlays for the active realm; otherwise an inactive-realm blast could retain hazards indefinitely. The alternative—making particle frames advance on world ticks—would distort the existing reusable catalog's timing and developer previews.

### Render a frozen first smoke frame via the particle overlay

The overlay will support a non-advancing particle presentation with a fixed frame index for an armed preview. Detonation replaces that preview instance with the configured bomb compound PFX. The compound runner starts FirePlume while the final three SmokePoff frames are still submitted, avoiding a blank or glyph fallback between phases.

All instances remain overlays above the world view. No world cell glyph, terrain, collision, occupancy, or fog state is replaced. The alternative of mutating each cell to a smoke or fire glyph would conflict with the particle system's transparent art and the existing renderer's authoritative composition boundaries.

### Bound and clean up lifecycle ownership

Bomb disposal, session disposal, and particle completion will remove their matching presentation records and overlay elements. Chain reactions obtain their own records and do not overwrite a different bomb's same-cell sequence; the overlay supports multiple transparent instances where the existing blast geometry overlaps. Test hooks will inject timestamps or completion advancement so lifecycle transitions do not depend on real browser timers.

## Risks / Trade-offs

- [Visual playback continues while game time is paused] → The presentation clock remains intentionally real-time; damage is still dispatched only when an existing world-time tick occurs.
- [Fast input advances several blast radii before a browser frame] → The event queue records each newly activated cell before rendering, so no particle phase is skipped.
- [Inactive-realm particle instances are not drawn] → Advance their lifecycle offscreen and resume overlay submission only when their realm becomes active.
- [Concurrent blast footprints make layered art busy] → Preserve independent effects and existing transparent overlay ordering; do not collapse or mutate authoritative world content.

## Migration Plan

1. Add focused lifecycle and rendering tests before replacing the glyph path.
2. Implement the bomb presentation records and bridge them to the particle overlay.
3. Remove the active `✶` glyph branch only after smoke/fire overlay presentation covers active cells.
4. Verify focused Node tests, the repository test suite, build, strict OpenSpec validation, and manual seeded browser play.
5. Roll back by restoring the previous bomb glyph presentation and removing the bomb-to-PFX adapter; no persistent data or migration is involved.
