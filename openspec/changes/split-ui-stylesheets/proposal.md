# Proposal

## Why

The UI stylesheet has grown into a single mixed file containing map rendering, character information, HUD layout, modal windows, toast notifications, and shared variables. Splitting these concerns into named files will make future visual changes easier to locate while preserving the current browser behavior and keeping one stable stylesheet entry point.

## What Changes

- Organize the UI styles into six files under `ascii-rpg/src/runtime/ui-layer-react/`:
  - `character.css` for character bars, resources, and character detail layout.
  - `map.css` for the game canvas, transition mask, minimap, map framing, and map presentation rules.
  - `hud.css` for corners, HUD blocks, quest tracker, links, settings, zoom controls, and shared HUD interaction styling.
  - `windows.css` for lighting, tutorial, prompt, palette, and font editor windows.
  - `toasts.css` for toast layout, animation, motion preferences, and portrait behavior.
  - `styles.css` for CSS variables, document defaults, and remaining shared or catch-all rules.
- Keep `styles.css` as the stylesheet imported by the application and use ordered imports for the feature files.
- Preserve selectors, cascade behavior, responsive rules, colors, dimensions, animations, and user-visible layout.
- Update stylesheet-oriented tests to inspect the complete imported stylesheet set.
- No public API, dependency, runtime behavior, or visual design change is intended.

## Capabilities

### New Capabilities

None. This is an internal stylesheet organization refactor.

### Modified Capabilities

None. Existing UI requirements remain unchanged.

## Impact

- Affects the CSS files and stylesheet import in `ascii-rpg/src/runtime/ui-layer-react/`.
- Affects source-level stylesheet checks in `ascii-rpg/test/main_tests.mjs`.
- Adds no dependencies and changes no React, Babylon, or bridge-layer APIs.
- Validation remains the existing repository test suite and Vite production build.
