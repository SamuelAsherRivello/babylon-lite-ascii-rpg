# Proposal

## Why

The current Procedural UI already groups the live generation catalog into nine readable stages, but its underlying entries, object catalog, preview markers, and runtime startup sequence are maintained separately. A rendered feature can therefore be configured or displayed without becoming an automatically generated feature, and runtime order can diverge from the displayed order.

## What Changes

- Make the fifteen-entry procedural catalog authoritative: Ground; Overground Walls; Underground Caves; Water; Walkability; Player Position; Heart, Chest, Trap, Torch, NPC, and Fireplace distribution; Civilization Stairs; Civilization Doors; and Enemy Spawner Distribution.
- Preserve the nine semantic Procedural cards: the five terrain entries and Player Position, followed by Object Distribution, Civilization Placement, and Character Distribution. Object Distribution retains separate Heart, Chest, Trap, Torch, and Fireplace controls; Civilization Placement gains a paired `Stairs` sublayer before its `Doors` sublayer, which visibly identifies `Realm: Underground`; Character Distribution lists Underground Enemy before Overworld NPC.
- Add generation declarations to level-generated object records so a valid object carries its realm scope, prerequisite, settings identity, and distribution data. Fireplace remains a declared Underground generated object after civilization placement; Stairs are reclassified as paired Civilization Placement objects, generated before Doors with an independent Low, Med, and High distribution initialized once from the current Heart values.
- Resolve a single execution plan from that catalog for live generation and preview markers. The plan must retain current terrain density semantics, place Fireplace after civilization, and reconcile the current runtime enemy-before-NPC startup order with the displayed feature order.
- Reject incomplete, unknown, or cyclic feature declarations before the realm is published, while preserving terrain, static-object, civilization, and dynamic-occupancy ownership.

## Capabilities

### New Capabilities

- `world-feature-generation-registry`: Defines validated feature declarations and the resolved execution plan shared by the existing generation catalog, runtime setup, and preview.

### Modified Capabilities

- `world-generation-passes`: Defines the fifteen-entry execution order and its nine semantic Procedural cards.
- `procedural-generation-settings`: Makes the current ordered catalog, grouped cards, fixed Ground setting, and current per-row density behavior authoritative and persistent.
- `object-spawner-system`: Makes valid level-spawned catalog objects—including Fireplace—automatic Object Distribution participants.
- `procedural-level-generation`: Requires generated NPC/enemy placement to follow the resolved plan without violating dynamic occupancy or static-layer prerequisites.

## Impact

- Affects the generation settings catalog/store, generation profile, object catalog validation and placement, startup spawner order, preview marker derivation, and focused Node tests.
- No dependency, service, account, or browser-persisted gameplay state is added. Existing stored generation settings are migrated additively, including the legacy `civilization` selection now represented by `civilization-doors`.
