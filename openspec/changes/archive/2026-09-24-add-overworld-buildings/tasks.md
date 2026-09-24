# Tasks

## 1. Civilization catalog and placement contract

- [x] 1.1 Reconcile the active procedural-catalog implementation with this change and add the independent persisted `civilization-homes` entry at Civilization Layer 8, including Med default and missing-entry migration; verify focused generation-settings store tests cover Homes without changing Doors behavior.
- [x] 1.2 Resolve the Homes Low/Med/High profile to the same seeded quarter/current/double region-chance mapping as Doors; verify focused generation-profile tests cover independent Homes and Doors values.
- [x] 1.3 Create the reusable Overworld Building/Home placement module and its 20-by-10 Home definition; verify deterministic focused tests cover the column-10 Door, all-walkable footprint/approach validation, reservation rejection, and non-overlap.
- [x] 1.4 Add exterior cardinal-reachability selection for one Home Key 3-6 steps from the Door approach; verify focused tests reject blocked or unreachable candidates and reproduce the accepted Key cell from the same seed.

## 2. World and interaction integration

- [x] 2.1 Run Overworld Building placement after paired stairs and static-object reservations while preserving terrain identity and Underground civilization behavior; verify focused world-generation tests cover realm scope, pass order, deterministic output, and no partial Home placement.
- [x] 2.2 Materialize Home wall overlays plus existing Key and Door objects with shared Building identity; verify focused object/collision tests confirm walls block, the existing locked/open Door lifecycle remains unchanged, and each accepted Home has one Key.
- [x] 2.3 Compose roof `^` and interior `.` overlays from player Building membership without mutating natural terrain; verify focused render/movement tests cover exterior concealment, reveal after entering the opened Door, walkable interior cells, and restoration only after exiting the Door to the exterior.
- [x] 2.4 Reserve Building cells for dynamic entity placement; verify focused NPC/enemy-spawner tests show dynamic entities do not overlap Home walls, interiors, Doors, or Keys.

## 3. Procedural UI and preview

- [x] 3.1 Render the independent Homes Low/Med/High controls under Layer 8 Civilization and preserve draft/Confirm/Cancel persistence behavior; verify the existing UI generation-settings tests cover the two rows and stored-value migration.
- [x] 3.2 Add deterministic Overworld preview Home selection using the same candidate logic and show exactly one `^` marker per accepted Home without mutating preview terrain or active state; verify focused preview-marker tests.

## 4. Verification

- [x] 4.1 Run the relevant Node test files for generation settings, Building placement, world generation, object collisions, movement/render composition, preview markers, NPCs, and enemy spawners; verify all pass.
- [x] 4.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both succeed.
- [x] 4.3 Manually verify the Procedural Overworld preview and a generated Home in the browser: collect its exterior Key, unlock and enter its Door, walk on revealed dots, and exit to restore the roof; verify the Underground Doors flow remains unchanged.
