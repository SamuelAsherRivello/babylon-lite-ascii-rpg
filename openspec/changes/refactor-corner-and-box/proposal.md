# Proposal

## Why

The HUD already has `CornerLayout` and `BoxLayout`, but the Character, Map, and Log panels do not consistently share the same visual/component contract. The Map uses a transparent overlay around a separately positioned canvas, the Log duplicates panel framing and owns special collapse markup, and the shared styling is spread across generic and panel-specific selectors. This refactor will make the common panel structure explicit while preserving the current appearance, anchors, content, and interactions.

## What Changes

- Establish one reusable React panel/box component contract for the Character, Map, and Log surfaces.
- Keep corner anchoring in the parent `CornerLayout`, with explicit `top-left`, `top-right`, and `bottom-right` placement for the three panels.
- Make the action label location configurable so Character and Map can retain their current placement while Log keeps its top action placement.
- Make collapse/expand behavior configurable on the shared box and preserve the Log's current expanded and collapsed states, keyboard semantics, and click behavior.
- Consolidate shared box surface, border, typography, padding, and action-label styles while retaining panel-specific content styles.
- Preserve the minimap canvas's game-layer ownership and zoom interaction; only its UI framing/placement contract changes.
- Preserve the Character contents, Quest tracker placement, Map status text, Log entries, responsive geometry, and all existing user-visible copy.
- Update source-level UI tests and run the existing test/build checks for the refactor.

## Capabilities

### New Capabilities

None. This is an internal component and stylesheet refactor.

### Modified Capabilities

None. Existing HUD requirements remain unchanged; `skip_specs: true` declares that no spec-level behavior changes are intended.

## Impact

- Affects `ascii-rpg/src/client/ui-layer-react/HudLayouts.jsx`, `App.jsx`, and the HUD stylesheet files.
- May require focused updates to `ascii-rpg/test/main_tests.mjs` and related UI source-contract checks.
- Adds no dependencies and changes no bridge, game-layer, persistence, or public client APIs.
- The implementation must preserve the existing responsive HUD contract, including equal top-panel geometry, shared viewport insets, minimap behavior, and Log collapse behavior.
