# Proposal

## Why

Adding a rendered world feature currently requires coordinating several independent places: its catalog or system, placement logic, settings, preview markers, and startup setup. That allows a feature to be visible or configured without being part of the authoritative level-generation plan, and makes execution order drift between the menu and the generated world.

## What Changes

- Introduce an authoritative world-feature generation registry. Every world-visible feature declares its owner layer, realm scope, generated or on-demand status, placement prerequisites, deterministic distribution data, and generation-order participation.
- Make every level-generated object catalog entry automatically participate in the Object Distribution phase. Hearts, Traps, Torches, Fireplaces, Stairs, and future object-like props remain independently configurable, but execute through the one ordered object phase rather than requiring separately hard-coded generation paths.
- Make all generated world features appear in the persisted Procedural settings catalog and its preview. Features that extend an existing layer join that layer's pass; a feature that owns a new layer declares a new ordered pass without changing unrelated ordering.
- Define one dependency-ordered pipeline: Ground, Cave / Walls, Water, Walkability, Player Position, Object Distribution, NPC Spawner Distribution, Civilization Distribution, and Enemy Spawner Distribution. A feature with a later prerequisite, such as an object that must avoid civilization occupancy, is resolved deterministically within or after its declared prerequisite without overwriting another owner's layer.
- Preserve deterministic results and layer ownership: later features may inspect earlier output and reserve their own cells, but cannot rewrite terrain, walkability, static objects, civilization, or dynamic occupancy they do not own.

## Capabilities

### New Capabilities

- `world-feature-generation-registry`: Defines the authoritative feature declaration, automatic generated-feature registration, realm scope, dependency validation, and stable generation-plan construction.

### Modified Capabilities

- `world-generation-passes`: Replace divergent per-item pass ordering with the canonical dependency-ordered pipeline and insertion rules for existing versus new layers.
- `procedural-generation-settings`: Require every generated feature to be represented in the ordered persisted Procedural catalog and preview while retaining per-object density controls within Object Distribution.
- `object-spawner-system`: Make the catalog the source of level-spawned object participation and require every qualifying object to be distributed by the Object Distribution phase.
- `procedural-level-generation`: Extend layered and deterministic world requirements to the registry-owned feature plan and generated dynamic feature placement.

## Impact

- Affects generation settings JSON and store validation, object catalog validation and distribution, world-generation orchestration, preview marker derivation, NPC/enemy spawner setup, and their focused Node tests.
- No new runtime dependency, service, account, network API, or persisted gameplay state is introduced. Existing stored generation-setting values require additive migration or backfill when a new generated feature is registered.
