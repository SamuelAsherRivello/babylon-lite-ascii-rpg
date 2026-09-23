# Tasks

## 1. Civilization Doors profile and migration

- [x] 1.1 Add the canonical `civilization-doors` / `Doors` generation catalog entry and legacy `civilization` fallback normalization; verify fresh, legacy, and canonical catalogs each resolve a complete valid settings catalog.
- [x] 1.2 Route the Doors Low/Med/High selection through the generation profile and both live Underground placement and the deterministic preview; verify all three selections produce the expected profile multiplier without enabling Civilization in Overground.

## 2. Grouped Civilization controls and preview markers

- [x] 2.1 Render Civilization as Layer 8 using the same grouped-row control behavior as Layer 7, with the initial Doors row and its selected Low/Med/High state; verify the Underworld preview enables it and the Overworld preview marks it unavailable.
- [x] 2.2 Render every previewed Civilization group with a closed-door primary marker plus its two key markers; verify the preview generation data remains unmodified and each group has exactly one door and two keys.

## 3. Verification

- [x] 3.1 Extend the focused settings and Civilization system Node tests for catalog migration, grouped control labels, realm availability, door-led preview marker identity, and two-key preservation; verify with `node --test --test-isolation=none ascii-rpg/test/client/ui-layer-react/generation-settings-store_tests.mjs ascii-rpg/test/client/game-layer-babylon-lite/systems/civilization-system_tests.mjs`.
- [x] 3.2 Run the full repository regression suite and production build; verify with `npm.cmd test` and `npm.cmd run build`.
- [x] 3.3 Manually open Procedural, switch to Underworld, and visually verify Layer 8 contains only the Doors Low/Med/High row and a door-led preview group with two keys; verify Confirm persists a chosen Doors density and reopening restores it.
