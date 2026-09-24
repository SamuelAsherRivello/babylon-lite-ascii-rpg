# Design

## Context

See [proposal.md](proposal.md). Generation settings presently retain density only, while the feature registry already defines ordered passes and compound semantic cards. The settings-map preview and live session independently invoke terrain, object, civilization, and dynamic-spawner generation; both must honor one normalized enabled selection.

## Goals / Non-Goals

**Goals:**

- Represent each pass's enabled state in the canonical settings catalog without breaking existing saved settings.
- Make the Procedural window express individual and compound selection accessibly without adding visible checkbox text.
- Apply the same enabled selection to preview and live generation while retaining a renderable, movable player world.
- Keep optional passes independent: registry ordering remains ordering, not an enablement dependency graph.

**Non-Goals:**

- Making Ground, Walkability, or Player Position optional.
- Adding a no-player, no-terrain, or no-walkability fallback game mode.
- Changing density values, generation order, random-seed namespaces, storage key, bridge API, or quest-requested object behavior.
- Treating disabling Stairs as an error; it intentionally removes realm travel for that generated session.

## Decisions

### 1. Persist enabled beside density with a compatibility default

Each normalized pass selection carries `enabled: boolean`. Missing, malformed, and legacy saved enabled values resolve to `true`; density normalization remains unchanged. This preserves old local settings and allows an optional pass to recover its prior density after being re-enabled, rather than encoding disabled as a density value.

### 2. Keep a required baseline and independently gate optional passes

The registry marks Ground, Walkability, and Player Position as required. Their checkboxes remain checked and disabled because terrain cells, a connected walkable region, and a valid player location are core world contracts. Every other pass is evaluated independently against its own enabled flag. The registry's existing ordering metadata controls sequencing only; it does not propagate enablement between Doors and Enemy Spawners, for example.

### 3. Derive compound checkbox state from direct children

The existing semantic cards provide direct child IDs for Object Distribution, Civilization Placement, and Character Distribution. A parent checkbox derives checked, unchecked, or native indeterminate state from those children and changes only those children. This avoids a separate persisted group flag that could conflict with individual selections.

### 4. Use one resolved execution plan for preview and live generation

The registry resolves normalized settings into ordered feature records including enabled state. The settings-map preview and live game session use the same plan to omit optional terrain mutation, markers, object placement, civilization features, paired stairs, NPC spawning, and enemy spawning. Required passes still produce the baseline world before later enabled passes run.

## Risks / Trade-offs

- [A disabled terrain feature leaves a generation helper with an invalid parameter] -> Explicitly short-circuit its pass and test all-disabled optional settings rather than relying on an extreme density value.
- [Preview and live generation diverge] -> Share resolved-plan filtering and add focused tests for both paths.
- [A mixed compound checkbox is inaccessible or visually unclear] -> Use a native checkbox, synchronized `indeterminate` state, and explicit accessible enable/disable labels.
- [Legacy catalogs lose a density during migration] -> Normalize absent enabled values separately from existing density migration and test round trips.

## Migration Plan

1. Extend normalization with enabled defaults and preserve existing persisted density behavior.
2. Add registry metadata and resolve the required baseline plus enabled optional plan.
3. Gate preview and live generation from that plan, beginning with terrain and then static and dynamic features.
4. Add checkbox controls and compound selection behavior to the Procedural window.
5. Verify focused tests, full Node tests, production build, and automated all-optional-off plus representative mixed-selection coverage.

Rollback consists of ignoring the persisted enabled field; older code already treats its absence as all layers enabled.
