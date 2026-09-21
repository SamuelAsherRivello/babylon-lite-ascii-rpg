# Design

## Context

See proposal.md - Why. The game layer currently creates one persistent fog
record per realm and calls the existing player discovery path for movement.
Viewport sizing is already represented as logical grid columns and rows and is
derived from the canvas dimensions and displayed zoom. World generation stores
the canonical `Overground` and `Underground` realm profiles and player-start
cells.

## Goals / Non-Goals

**Goals:**

- Add a one-time, player-centered starting reveal for each realm.
- Resolve the reveal from the same zoom-5 logical viewport geometry used by the
  renderer, with separate horizontal and vertical extents.
- Reuse authoritative fog mutation and visibility semantics so the game view
  and minimap remain consistent.
- Keep initialization isolated to the active realm's fog record.

**Non-Goals:**

- Changing the normal movement fog radius or its stepped visibility falloff.
- Changing camera mode, displayed zoom, minimap zoom, world generation, or
  fog persistence behavior.
- Adding a UI setting, local-storage value, or bridge message.

## Decisions

### Use the logical zoom-5 viewport as the sizing source

The starting footprint will derive its column and row bounds from the existing
viewport/grid calculations at displayed zoom `5`, rather than from browser
pixels or the user's current zoom. This makes the rule deterministic across
device pixel ratios and ensures “based on zoom 5” has one runtime definition.

The requested percentages describe the clear footprint's total width and
height. For each axis, calculate a centered inclusive range around the player
start, round to a usable grid extent, and clamp the range to the world. This
interprets the user's separate X/height request as a rectangular footprint;
cells at its corners still pass through the existing straight-path check.

### Add a distinct initialization discovery operation

The fog module will expose or receive a starting-reveal operation separate
from the existing movement operation. It will iterate only the bounded
player-centered X/Y range, calculate the same distance-based visibility used by
the fog system for eligible cells, and update visibility through the existing
maximum-value bookkeeping. Keeping the operation distinct prevents the
large starting footprint from changing subsequent movement behavior.

An alternative was to temporarily replace `fogUnclearRadius` and call the
movement function. That would produce a circular distance boundary, cannot
represent different X/Y extents faithfully, and risks changing the semantics
of later movement discovery, so it is rejected.

### Initialize only the active realm at startup

The game-layer startup sequence will invoke the starting operation after the
active realm and player position are known. Each realm's fog record remains
independent; the existing realm-transfer path continues to restore the
destination realm's own discovery without automatically revealing inactive
realm terrain.

### Keep fog authority in the game layer

React and the bridge will not receive new state. Rendering will continue to
consume the fog records through the existing world-view composition, so no
view can reveal cells as a side effect of drawing.

## Risks / Trade-offs

- [Risk] A rectangular starting footprint may reveal less at its corners than
  a visual “full screen” intuition suggests because line of sight still
  applies. → Mitigation: specify and test the independent X/Y bounds and
  preserve the existing clear-path contract.
- [Risk] Different viewport sizes produce different initial cell counts. →
  Mitigation: derive both axes from the deterministic zoom-5 logical viewport
  and cover rounding/clamping with focused tests.
- [Risk] Initialization could accidentally reveal the inactive realm. →
  Mitigation: call the operation only with the active realm's fog and player
  start, and add an isolation regression test.

## Migration Plan

No data migration is required. Existing sessions have no persisted fog state;
newly generated realm fog records will receive the starting reveal during
initialization. Rollback consists of removing the initialization operation and
its focused tests; existing movement discovery remains valid.

