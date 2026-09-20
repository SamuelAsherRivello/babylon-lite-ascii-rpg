# Proposal

## Why

The React HUD currently mixes layout responsibilities with the content of each panel. The same positioning, black-surface, border, typography, spacing, and alignment rules are repeated across character, map, quest, status, and lower-corner sections, making small visual changes risky and making the intended design system difficult to see in the code.

The refactor should establish three shared primitives that match the visual structure shown in the reference image: a corner layout for viewport anchoring, a box layout for the common black bordered panel with an action label at the bottom, and a HUD block layout for repeated title/body sections. The content inside those primitives remains specific to the feature that owns it.

## What Changes

- Extract a reusable `CornerLayout` React component for the four viewport-anchored regions and their position variants.
- Extract a reusable `BoxLayout` React component that owns only the shared black background, white border, box sizing/inset behavior, and bottom action-word treatment; callers provide the box content and action label.
- Extract a reusable `HudBlockLayout` React component for shared HUD block typography, justification, spacing, and title/body structure.
- Define explicit title-font and body-font roles within the HUD block styling/API so feature content can select the shared role without duplicating font rules.
- Migrate the character, minimap/status, quest, Windows, Stats, Settings, version, and related HUD markup to the shared primitives while preserving their feature-specific children, ids, labels, event handlers, accessibility attributes, and existing responsive behavior.
- Consolidate the corresponding CSS custom properties and selectors so shared geometry and typography live with the primitives, while feature-specific rules remain limited to feature content.
- Preserve the existing visual output and interaction contract, including the `Character`, `Map 🔍`, `Question: ...`, `World 1 Floor ...`, `Time: ...`, Windows, Stats, Settings, and version presentations.
- Update focused structural checks to verify component reuse and the shared title/body font contract without adding a new dependency or changing application-layer ownership.

## Capabilities

### New Capabilities

None. This change introduces reusable implementation primitives but no new user-facing capability.

### Modified Capabilities

None. Existing HUD behavior and the `responsive-ui-layout` requirements remain unchanged.

## Impact

- React UI markup in `ascii-rpg/src/runtime/ui-layer-react/App.jsx`, with shared components likely colocated in the same UI-layer module area.
- HUD styles in `ascii-rpg/src/runtime/ui-layer-react/style.css`.
- Focused structural tests in `ascii-rpg/test/main_tests.mjs` and any UI-layer tests that assert class names or markup contracts.
- No runtime/game-layer changes, persistence changes, dependency changes, or public API changes.

Acceptance criteria: all existing HUD regions render with the same layout and interactions as before; the three shared primitives are used by their corresponding regions; title and body typography are defined once and reused; feature-specific content remains outside the primitive contracts; and the existing Node checks and production build continue to pass.
