# Design

## Context

The React UI layer currently renders reusable corner regions and the game layer owns minimap rendering, realm state, and world time. The existing responsive HUD contract and lower-corner controls must remain intact while the two top regions become a paired layout.

## Goals / Non-Goals

**Goals:**

- Establish one shared top-box geometry for Character and Minimap regions.
- Keep layout responsive across landscape and portrait viewports.
- Format realm, floor, and time status from existing UI subscriptions/state.
- Preserve the existing minimap canvas and game-layer ownership of minimap rendering.

**Non-Goals:**

- Defining character statistics, portrait, equipment, health, or other Character box contents.
- Changing realm generation, stairs, movement, fog, or minimap rendering behavior.
- Adding a new dependency or a new persistence model.

## Decisions

- Use a shared top-box class layered on the existing corner positioning model. This keeps the four-corner HUD architecture and lets both boxes inherit identical dimensions, border, padding, and responsive rules.
- Keep the actual minimap canvas in the Minimap box and place the compact status labels around it using UI-layer markup. The alternative of moving realm/time state into the Babylon game layer would cross the established layer boundary without changing gameplay behavior.
- Derive floor from the existing active realm value: Overground maps to `1`, Underground maps to `-1`. This avoids duplicating realm state or introducing a stored floor setting.
- Use a dedicated four-digit formatter for the new visual contract while retaining the underlying numeric world-time snapshot. Values above four digits remain untruncated as required.
- Leave Character box inner content intentionally empty or reserved. This avoids inventing requirements before the user supplies them.

## Risks / Trade-offs

- [Risk] Existing tests may assert the old upper-left location and five-digit time format → update only the affected UI assertions and add checks for equal top-box geometry and the new labels.
- [Risk] A fixed equal size may become cramped on narrow portrait viewports → use the existing responsive sizing strategy and verify both boxes within the shared inset at mobile dimensions.
- [Risk] Minimap canvas and status text may compete for the same box space → preserve the canvas bounds and use the box layout to allocate status text without changing minimap scale behavior.

## Migration Plan

Update the React markup and shared CSS, then adjust focused UI tests and run the repository's documented Node checks and build. Rollback consists of reverting the scoped layout and formatting changes; no persisted data migration is needed.
