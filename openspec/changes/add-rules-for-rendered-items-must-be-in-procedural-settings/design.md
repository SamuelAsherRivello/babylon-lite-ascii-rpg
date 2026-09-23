# Design

## Context

See [proposal.md](proposal.md). The live catalog currently has thirteen entries but the Procedural window renders nine semantic cards: entries 7-11 are Object Distribution rows and entry 12 is a Civilization/Doors row. Ground is fixed; Overground Walls and Underground Caves retain independent realm-specific density settings. Object and civilization placement currently occurs in startup code, Fireplace is placed manually after civilization, and enemy spawners initialize before NPC spawners.

## Goals / Non-Goals

**Goals:**

- Make the existing thirteen entries and nine-card presentation one validated source for settings, preview, and runtime generation.
- Preserve the current density mappings, realm scopes, static-object ownership, civilization ownership, and dynamic occupancy boundaries.
- Turn valid generated catalog objects into automatic placement inputs, including Fireplace after its civilization prerequisite.

**Non-Goals:**

- Do not merge the independent Overground Walls and Underground Caves controls or alter their current density meanings.
- Do not add new gameplay objects, change NPC behavior, or redesign the Procedural window.
- Do not make quest-requested Gold ambiently generated.

## Decisions

### Normalize the existing catalog instead of replacing it

The registry consumes the existing thirteen catalog entries, their order, realm scope, configurable/fixed status, and settings identities. It exposes the current nine semantic cards as a presentation grouping: raw entries 7-11 belong to Object Distribution and raw entry 12 belongs to Civilization. This is preferred to a replacement nine-entry data file because it preserves the active split terrain controls and current density semantics.

### Extend object declarations and retain owner-specific placement

Level-spawned objects declare realm scope, an owning Object Distribution entry, a settings id when configurable, and prerequisite entries. The Object Spawner System enumerates those declarations in deterministic catalog order. Stairs retain paired-realm placement; Fireplace declares the Underground civilization prerequisite. Object effects remain in the game layer, while the registry coordinates timing and reservations only.

### Share plan resolution between preview and live startup

The plan builder validates declared dependencies and returns the same ordered features and seed namespaces to preview marker selection and live setup. Terrain remains produced by the world system; objects remain static-object writes; civilization owns door/key barriers; NPC and enemy systems own dynamic occupancy. Runtime initialization follows the plan, correcting enemy-before-NPC startup ordering without moving ownership into a generic feature engine.

### Migrate settings additively

Settings normalization derives required entries from the registry, keeps valid stored choices for known entries, restores each missing entry's current default, and maps legacy `cave-walls` and `civilization` choices to the active split/Doors entries. Ground remains fixed and has no selectable density.

## Risks / Trade-offs

- [The active catalog and registry drift] -> Compare every raw entry, semantic card, preview marker, and resolved plan in focused tests.
- [Fireplace placement changes checkpoint availability] -> Preserve its existing count calculation, Underground-only scope, and post-civilization reservation rules in deterministic tests.
- [Spawner ordering changes first-tick behavior] -> Keep current time-system ownership and add a setup-order test before dispatching the initial tick.
- [Stored settings are incomplete] -> Backfill only registered defaults and preserve unrelated valid selections.

## Migration Plan

1. Define and test the registry against the current thirteen entries and nine semantic cards.
2. Add object generation declarations and route Object Distribution, including Fireplace, through the registry.
3. Route preview and dynamic spawner setup through the same resolved plan.
4. Run focused Node tests, responsive tests, build, and manual Procedural preview checks.
5. Roll back with a follow-up change that restores the previous orchestration; no server or save-data cleanup is required.
