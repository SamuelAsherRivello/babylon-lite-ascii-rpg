# Proposal

## Why

The current Procedural UI already groups the live generation catalog into nine readable stages, but its thirteen underlying entries, object catalog, preview markers, and runtime startup sequence are maintained separately. A rendered feature can therefore be configured or displayed without becoming an automatically generated feature, and runtime order can diverge from the displayed order.

## What Changes

- Make the current thirteen-entry procedural catalog authoritative: Ground; Overground Walls; Underground Caves; Water; Walkability; Player Position; Heart, Trap, Torch, NPC, and Fireplace distribution; Civilization Doors; and Enemy Spawner Distribution.
- Preserve the existing nine semantic Procedural cards: the five terrain entries and Player Position, followed by Object Distribution, Civilization, and Enemy Spawner Distribution. Object Distribution retains its current separate Heart, Trap, Torch, NPC, and Fireplace controls; Civilization retains its Doors control.
- Add generation declarations to level-generated object records so a valid object carries its realm scope, prerequisite, settings identity, and distribution data. Make Fireplace a declared Underground generated object rather than a manual post-civilization exception.
- Resolve a single execution plan from that catalog for live generation and preview markers. The plan must retain current terrain density semantics, place Fireplace after civilization, and reconcile the current runtime enemy-before-NPC startup order with the displayed feature order.
- Reject incomplete, unknown, or cyclic feature declarations before the realm is published, while preserving terrain, static-object, civilization, and dynamic-occupancy ownership.

## Capabilities

### New Capabilities

- `world-feature-generation-registry`: Defines validated feature declarations and the resolved execution plan shared by the existing generation catalog, runtime setup, and preview.

### Modified Capabilities

- `world-generation-passes`: Defines the current thirteen-entry execution order and its nine semantic Procedural cards.
- `procedural-generation-settings`: Makes the current ordered catalog, grouped cards, fixed Ground setting, and current per-row density behavior authoritative and persistent.
- `object-spawner-system`: Makes valid level-spawned catalog objects—including Fireplace—automatic Object Distribution participants.
- `procedural-level-generation`: Requires generated NPC/enemy placement to follow the resolved plan without violating dynamic occupancy or static-layer prerequisites.

## Impact

- Affects the generation settings catalog/store, generation profile, object catalog validation and placement, startup spawner order, preview marker derivation, and focused Node tests.
- No dependency, service, account, or browser-persisted gameplay state is added. Existing stored generation settings are migrated additively, including the legacy `civilization` selection now represented by `civilization-doors`.
