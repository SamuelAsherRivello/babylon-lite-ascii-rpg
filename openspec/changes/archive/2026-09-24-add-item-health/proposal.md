# Proposal

## Why

The sword, pickaxe, and shield currently behave as effectively unlimited inventory capabilities. Players receive no feedback about equipment wear and cannot see why an attack, dig, or defensive benefit would stop working. Giving these items explicit durability makes repeated combat and mountain digging legible while creating a clear failure state for depleted equipment.

## What Changes

- Add `1,000 / 1,000` health to the inventory sword, pickaxe, and shield.
- Display each item's current and maximum health as a bar in its character-corner inventory slot.
- Reduce sword health by the actual damage dealt by a successful sword attack against an enemy or enemy spawner.
- Reduce pickaxe health by the actual damage dealt by a successful pickaxe hit against an interior Overground mountain.
- Reduce shield health by the final damage applied to the player by an incoming enemy attack, after the existing Defense calculation.
- Remove an item from the inventory when its health reaches zero.
- Prevent sword attacks after the sword is removed and prevent pickaxe digging after the pickaxe is removed.
- Stop applying shield-based Defense mitigation after the shield is removed; the existing body damage path remains available.
- Publish item-health changes through the existing Babylon Lite to React character-state bridge without adding dependencies or moving gameplay calculations into React.

## Capabilities

### New Capabilities

- `item-health`: Defines inventory-item durability, item-specific damage sources, depletion behavior, and character-corner health-bar presentation.

### Modified Capabilities

- `character-info`: Extends the character panel's inventory-slot contract so the sword, shield, and pickaxe show their item health and update from authoritative gameplay snapshots.
- `combat-stats`: Extends player attack and incoming-damage resolution so sword and shield durability use the actual applied damage values while preserving the existing Offense and Defense calculations.
- `diggable-mountains`: Extends successful mountain-dig resolution so pickaxe durability decreases by the actual mountain health removed and digging becomes unavailable after depletion.

## Impact

- Affected gameplay state: Babylon Lite character-state/contact handling, combat resolution, mountain digging, incoming enemy damage, and inventory slot removal.
- Affected UI state: React character data, bridge snapshots, inventory-slot markup, and character CSS for item-health bars.
- Affected tests: focused character-state, combat, mountain, bridge, and UI presentation tests, plus the repository's existing Node test and build checks.
- No new runtime dependencies, persistence format, renderer replacement, or public API is required.
- The proposal assumes shield durability is reduced by final post-Defense player damage, as discussed during exploration. If raw incoming damage is intended instead, that is an unresolved decision to revise before implementation.
