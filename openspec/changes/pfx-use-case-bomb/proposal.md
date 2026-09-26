# Proposal

## Why

Bombs already have timed, expanding gameplay damage, but their detonation is represented by a static `✶` glyph. The project now has reusable smoke and fire particle assets, so the bomb should communicate its armed area and explosion through a clear particle sequence while preserving the established combat timing.

## What Changes

- Preserve `💣` as the glyph for a planted bomb and remove the `✶` blast-glyph presentation.
- Show an unanimated `SmokePoff` frame over every in-bounds cell in the bomb's eventual radius-five blast area while the fuse is active.
- Add reusable compound PFX definitions that play two or more effects in series and may overlap adjacent effects with a configured crossfade frame count.
- At detonation, transition each blast cell from its static smoke preview to a `SmokePoff` → `FirePlume` compound PFX, using a three-frame crossfade that renders FirePlume above SmokePoff during the overlap.
- Keep a blast cell hazardous during both its animated smoke and fire-plume presentations, without changing the existing radius, damage amount, target handling, chain-reaction, or tick-order rules.

## Capabilities

### New Capabilities

- `compound-particle-effects`: Define reusable, ordered multi-effect PFX playback with optional frame-count crossfades and deterministic overlay ordering.

### Modified Capabilities

- `bombs`: Replace blast-glyph presentation with the pre-detonation smoke preview and post-detonation smoke-to-fire particle sequence while retaining the established bomb gameplay contract.

## Impact

- Affects `ascii-rpg/src/client/game-layer-babylon-lite/systems/bomb-system.js` and its focused tests.
- Connects bomb lifecycle events in the game layer to the existing particle catalog, compound-PFX runner, overlay renderer, and focused particle tests.
- No new package, renderer, public API, saved setting, or gameplay-stat dependency is planned.
