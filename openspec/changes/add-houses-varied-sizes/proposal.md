# Proposal

## Why

Every generated Overworld Home currently has the same large 20-by-10 footprint, making settlements visually repetitive and making smaller terrain spaces ineligible for houses. Adding three equally likely footprints preserves the current large house while making the world feel more varied and allowing compact placements.

## What Changes

- Add `SMALL`, `MED`, and `HIGH` Home sizes selected with equal probability for each accepted house.
- Define `SMALL` as 7 cells wide by 5 cells high, `MED` as 10 cells wide by 5 cells high, and `HIGH` as the current 20 cells wide by 10 cells high.
- Derive each size's walls, interior, door, approach, footprint validation, key reachability, collision reservations, and player reveal behavior from the selected dimensions.
- Keep the existing Home visuals, locked Door/Key lifecycle, terrain preservation, and Overworld-only generation behavior.
- Ensure the procedural preview uses the same seeded size selection and marker behavior as runtime generation.

## Capabilities

### New Capabilities

- `variable-overworld-houses`: Defines the observable size catalog, equal-probability selection, and size-aware Home placement and rendering behavior.

### Modified Capabilities

- None. The existing `add-overworld-buildings` change is still in progress; this proposal is a follow-on delta that can be reconciled with its `overworld-buildings`, `world-generation-passes`, and `procedural-level-generation` artifacts during implementation.

## Impact

- Affects `ascii-rpg/src/client/game-layer-babylon-lite/systems/building-system.js`, world-generation integration, procedural preview selection, and focused building/world/render tests.
- No new dependencies, settings rows, services, save migrations, or external APIs are required.
- Existing generated worlds remain compatible at runtime; newly generated worlds can contain all three sizes.
