# Design

## Context

See [proposal.md](proposal.md) for motivation. The current game layer divides generated terrain, static object placement, civilization placement, and dynamic spawner setup across world generation, startup orchestration, and feature-specific systems. The procedural settings JSON presents ordered cards, while object catalog entries and startup placement calls independently determine what actually appears. The active Fireplace and NPC changes demonstrate the need to make these sources agree without overwriting their in-progress work.

## Goals / Non-Goals

**Goals:**

- Establish one registry-derived generation plan shared by world setup, Object Distribution, dynamic-spawner setup, Procedural settings validation, and map preview.
- Preserve explicit terrain, static-object, civilization, and dynamic-occupancy ownership.
- Keep per-object density profiles and realm-specific feature behavior while presenting object-like features as rows of the Object Distribution card.
- Fail early with actionable diagnostics when a feature declaration cannot produce a complete deterministic plan.

**Non-Goals:**

- Do not add a new gameplay item, NPC behavior, rendering style, persistence model, or generation algorithm as part of this change.
- Do not infer gameplay semantics from a glyph or display name. New features require an explicit declaration.
- Do not alter the existing Ground, Cave / Walls, Water, Walkability, or Player Position algorithms except to consume their position in the registry-derived plan.

## Decisions

### Use a declarative registry as the generation source of truth

Create a data-driven feature registry for non-object generated features and extend object catalog records with the corresponding generation declaration. The resulting normalized entry identifies a stable feature id, display title, owner layer, realm scope, generated mode, configuration mode, placement prerequisites, and deterministic seed namespace. Object catalog entries with `IsLevelSpawned: true` are normalized into Object Distribution rather than hand-enumerated by object type.

The registry is preferred over relying solely on object catalog metadata because terrain passes and dynamic spawners are not objects, yet must meet the same ordering and settings rules. A registry that merely mirrors the current UI JSON is rejected because it would still leave runtime placement and preview behavior independently defined.

### Construct a validated ordered plan before placement

The planner combines the immutable base order with registered features, verifies owner layers and prerequisites, performs a deterministic dependency ordering, and publishes a plan used by both realms. Existing-layer features are grouped under their owner pass. A new owner layer must supply a unique pass id and declared predecessor constraints; its insertion must not change unrelated relative order. The planner rejects unknown references and cycles before world placement begins.

Object Distribution keeps deterministic catalog order for equal-priority objects. When an object requires a later static layer, the planner records that dependency as a deferred object-placement step associated with Object Distribution, instead of creating an ad hoc startup call. This preserves object ownership while giving the resolved execution plan an explicit, inspectable order.

Hard-coding a fixed list of all current features is rejected because it recreates the omission path this change removes. Allowing arbitrary feature code to select a phase at startup is rejected because neither settings nor preview can validate it.

### Derive settings and preview from the same normalized declarations

The settings store merges persisted values with the current registry. Configurable features receive their declared density row; fixed-baseline features appear as descriptive rows only. Missing newly registered values are backfilled to the declaration's default without discarding valid stored values for unrelated features. The preview executes the same resolved plan with preview-only markers, so a confirmed world and its draft preview use matching feature selection and seed namespaces.

Making the UI maintain a separate manually edited list is rejected because it is the present source of ordering drift. Replacing individual object profiles with one global object density is rejected because it removes Heart, Trap, Torch, and Fireplace tuning that the current settings model exposes.

### Keep all layer writes and occupancy decisions with their owner

The planner coordinates timing only. Terrain passes retain terrain writes; Object Distribution retains static object writes; Civilization retains civilization writes; NPC and enemy spawner systems retain dynamic occupancy claims. Every placement receives a reservation view of finalized earlier layers and returns only its owned result. Rendering continues to resolve visible precedence without modifying source layers.

Moving all placement into one generic feature engine is rejected because objects and dynamic entities have different lifetime, collision, and occupancy contracts.

## Risks / Trade-offs

- [Registry migration omits an existing generated feature] -> Add an inventory test that compares rendered/generated feature declarations, settings entries, preview markers, and resolved plan entries.
- [Deferred object prerequisites make ordering unclear] -> Expose the fully resolved numbered plan in generation results and focused tests, including the owning Object Distribution identity.
- [Persisted settings become stale after a registry update] -> Normalize additively using registered defaults and preserve valid unrelated selections.
- [In-progress NPC and Fireplace changes overlap this refactor] -> Treat their changed files as inputs; implement only scoped registry integration and avoid discarding or restaging unrelated work.
- [Preview and live generation diverge] -> Share the plan builder and deterministic seed namespaces, with focused parity coverage.

## Migration Plan

1. Inventory current generated terrain, object, civilization, NPC, and enemy-spawner features; define registry records and the normalized plan without changing gameplay behavior.
2. Route settings validation, UI cards, and preview markers through the plan, adding default backfill for registered settings.
3. Route static-object and dynamic-spawner setup through the plan while preserving each owner's placement and occupancy system.
4. Add focused plan, catalog/settings, preview-parity, and realm-placement tests; run the existing Node test suites and build check.
5. Roll back by restoring the previous orchestration paths in a subsequent change; no server or gameplay-state migration is required.
