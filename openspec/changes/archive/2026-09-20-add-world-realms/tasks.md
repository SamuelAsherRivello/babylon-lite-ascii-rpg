# Tasks

## 1. Realm generation model

- [ ] 1.1 Define fixed Overground and Underground generation profiles, realm-derived seeds, and a two-realm world coordinator; verify focused world-generation tests reproduce both realm results from one seed.
- [ ] 1.2 Extend terrain/glyph contracts for walkable grass and dirt plus non-walkable `M` mountains and `W` walls; verify generated terrain identity, walkability, borders, and player starts in focused Node tests.
- [ ] 1.3 Generalize static feature occupancy so torches and `S` stairs restore correctly under the player; verify top-most glyph rendering and movement through both feature types.
- [ ] 1.4 Select deterministic paired stair coordinates from the two-realm reachable-cell intersection using the torch-count target; verify synchronous/cooperative generation parity, coordinate synchronization, walkability, and valid-subset behavior.

## 2. Active realm gameplay

- [ ] 2.1 Add game-layer active world/realm ownership, a narrow active-realm status snapshot, persisted realm preference startup, and guarded stair-entry transfer; verify refresh defaults to Overground, restores Underground after transfer, and avoids immediate bounce-back.
- [ ] 2.2 Scope fog-of-war and minimap state to realm instances; verify discovery is retained on return, never crosses realm boundaries, and a realm replacement receives fresh fog.
- [ ] 2.3 Add shortest-path selection of active-realm stairs, discover every route cell in source-realm fog, and transfer through the selected paired stairs; verify blocked straight-line routes are not selected.
- [ ] 2.4 Include `M` and `S` in glyph cache, palette, visible-region, and minimap rendering paths; verify the focused rendering and fog/minimap tests cover active-realm output.

## 3. Realm controls and ambient preferences

- [ ] 3.1 Replace the legacy single ambient preference with persisted Overground (`0.9`) and Underground (`0.1`) preferences, including first-render defaults and Reset Settings behavior; verify bridge and UI-focused Node tests.
- [ ] 3.2 Update the Lighting window with exact `Ambient Overground` and `Ambient Underground` controls that adjust independently by `0.05`; verify only the active realm ambient changes current game lighting.
- [ ] 3.3 Add exact `World 1` and `Realm: <name>` upper-left status plus a Settings `Realm (<name>)` control; verify UI structure, stored realm choice, and narrow-command behavior in focused tests.

## 4. Integration verification

- [ ] 4.1 Run `npm.cmd test` and verify all Node tests pass, including focused world, fog, lighting, bridge, UI, and rendering coverage.
- [ ] 4.2 Run `npm.cmd run build` and verify the production Vite build succeeds.
- [ ] 4.3 Manually verify a local game session: inspect both ambient controls, use Realm Settings and enter paired stairs in both directions, and confirm each realm's minimap fog remains independent without using Playwright.
