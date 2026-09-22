# Tasks

## 1. Fog Discovery Metric

- [x] 1.1 Extend the fog-of-war record with active-realm walkable tile totals and discovered walkable tile counts, and verify focused fog-system tests cover `0%`, partial, unwalkable-excluded, and `100%` discovery cases.
- [x] 1.2 Add a public fog helper for realm discovery percentage and verify it returns a clamped whole percentage from only walkable tiles with positive visibility.
- [x] 1.3 Update discovery mutation paths so discovered walkable counts increment only on `0` to positive visibility transitions, and verify existing fog visibility retention tests still pass.

## 2. Game Layer and Bridge

- [x] 2.1 Add a realm discovery snapshot API to `game-bridge.js` using the existing get/subscribe/send pattern, and verify bridge-layer tests cover subscription and immutable numeric snapshot behavior.
- [x] 2.2 Add controller-level discovery subscription and current-snapshot methods in the Babylon game layer, and verify `main.jsx` forwards the initial and subsequent discovery snapshots through the bridge.
- [x] 2.3 Notify discovery listeners after starting reveal, normal discovery, route discovery before stair transfer, and realm activation, and verify focused tests cover same-realm movement updates plus realm-transfer percentage swapping.

## 3. HUD Presentation

- [x] 3.1 Update React HUD state to subscribe to the discovery snapshot and verify the upper-right status renders `World: 1 Realm: 1 (N%)` or `World: 1 Realm: -1 (N%)` from active realm state with a hover title explaining `Player discovered N% of Realm X of World 1`.
- [ ] 3.2 Replace old `World/Floor` source assertions with the new `World/Realm/Discovered` contract and verify `npm.cmd test` passes from the repository root.
- [x] 3.3 Build the application with `npm.cmd run build` from the repository root and verify the production build succeeds.

## 4. Manual Verification

- [x] 4.1 Run the Vite app through the repository's established localhost route and verify the visible HUD includes `World: 1 Realm: -1 (0%)` when the active realm has no unfogged walkable tiles in a controlled/manual scenario.
- [ ] 4.2 Verify in the running browser that exploration increases the active realm's discovered percentage and that changing realms displays the destination realm's independent percentage without breaking minimap fog rendering.
- [x] 4.3 Run `openspec validate realm-discovery-feature --strict` and verify the change artifacts pass strict validation.
