# Tasks

## 1. Establish compatible enablement settings

- [x] 1.1 Extend the generation feature registry with required-layer and enabled-state metadata while preserving order, realm scope, density defaults, and seed namespaces; verify registry tests cover required and optional features.
- [x] 1.2 Normalize, persist, and reload per-pass `enabled` values with a default of `true` for legacy or malformed selections; verify focused generation-settings tests cover migration and density retention.
- [x] 1.3 Resolve one ordered generation plan with enabled state for preview and live callers; verify a disabled optional feature retains an independently selected optional feature.

## 2. Add Level Generation enablement controls

- [x] 2.1 Add a right-aligned label-free checkbox to every pass row with an accessible enable/disable label and tooltip; keep Ground, Walkability, and Player Position checked and disabled, and verify the Procedural-window contract tests.
- [x] 2.2 Add parent checkboxes for Object Distribution, Civilization Placement, and Character Distribution that set only direct children and expose checked, unchecked, or mixed state; verify focused UI tests for parent and individual toggles.
- [x] 2.3 Redraw the settings-map preview from the draft enabled plan and omit disabled-layer markers and effects without changing persisted settings until Confirm; verify preview behavior for a disabled terrain feature and a disabled grouped child.

## 3. Gate live generation safely

- [x] 3.1 Preserve the required Ground, Walkability, and Player Position baseline while omitting disabled walls, caves, or water passes; verify all-optional-off generation creates a connected walkable start and supports player movement.
- [x] 3.2 Omit disabled ambient objects, paired stairs, civilization features, and NPC/enemy spawners while retaining enabled optional passes independently and leaving quest-requested objects unaffected; verify focused world, object, civilization, NPC, and enemy-spawner tests.
- [x] 3.3 Route live session initialization, preview markers, lighting sources, static occupancy, and realm-travel handling through enabled results; verify disabling Stairs removes travel without startup failure and disabling Doors does not suppress enabled Enemy Spawners.

## 4. Validate the layer-toggle contract

- [x] 4.1 Add deterministic regression coverage for identical seed plus identical enabled/density catalog, legacy catalogs without enabled values, mixed compound selections, and all optional layers disabled; verify focused Node test modules pass.
- [x] 4.2 Run `npm.cmd test` and `npm.cmd run build`; verify the complete Node suite and production bundle pass without new dependencies.
- [x] 4.3 Verify the Procedural-window contracts, checkbox accessibility labels, preview parity, and all-optional-off generation through automated Node tests; verify the focused test modules pass.
