# Tasks

## 1. Current catalog registry

- [ ] 1.1 Define and validate registry declarations for all thirteen current entries, their nine semantic cards, realm scopes, fixed/configurable behavior, prerequisites, and stable seed namespaces; verify focused registry tests reject unknown entries and dependency cycles.
- [ ] 1.2 Build the resolved live/preview generation plan from the current catalog without changing Overground Walls, Underground Caves, Water, Walkability, Fireplace, or Doors density behavior; verify the expected raw and semantic orders in focused tests.
- [ ] 1.3 Route runtime startup through the resolved plan while preserving terrain, static-object, civilization, and dynamic-occupancy owners; verify NPC setup precedes enemy-spawner setup according to the plan without changing tick ownership.

## 2. Generated object declarations

- [ ] 2.1 Add generation declarations for Heart, Trap, Torch, Stairs, and Fireplace, including realm scope, prerequisite, settings identity, and distribution rules; verify invalid generated objects report their type and missing declaration.
- [ ] 2.2 Make Object Distribution enumerate valid `IsLevelSpawned` catalog objects in deterministic order instead of manually enumerating feature-specific placement paths; verify a catalog fixture object is placed without a startup call.
- [ ] 2.3 Preserve paired Stairs, per-object counts, static reservations, and Fireplace-after-Civilization behavior; verify both realms are repeatable and have no overlapping static placements.

## 3. Settings and preview parity

- [ ] 3.1 Derive settings normalization from registered entries, preserving fixed Ground, split terrain controls, grouped Object/Civilization rows, and legacy cave/civilization migration; verify store tests retain valid selections and backfill missing defaults.
- [ ] 3.2 Make the Procedural UI use registry semantic cards while retaining its current labels, order, realm availability, and per-row density controls; verify existing Node UI/source checks cover all nine cards.
- [ ] 3.3 Route live and preview marker selection through the same plan and seed namespaces; verify fixed seed parity for allowed features and realm exclusions.

## 4. Verification

- [ ] 4.1 Add an inventory regression test proving every generated rendered feature has a raw catalog entry, semantic-card representation, preview marker representation, and resolved-plan entry; verify missing registrations fail.
- [ ] 4.2 Run focused registry/object/settings/spawner tests, `npm.cmd run test:responsive`, and `npm.cmd run build`; manually verify the current nine-card Procedural window and both realm previews without changing unrelated dirty work.
