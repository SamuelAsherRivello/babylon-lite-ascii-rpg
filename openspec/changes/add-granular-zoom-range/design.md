# Design

## Context

The current React settings layer stores an integer zoom from 1–10, while the Babylon Lite viewport derives cell size from that value and the current default zoom. The minimap has a separate persisted scale and interaction path. See `proposal.md` and the three spec deltas for the intended observable behavior.

## Goals / Non-Goals

**Goals:**

- Keep the visible control at exactly ten values while making the lowest value much farther out.
- Use one deterministic logarithmic conversion so adjacent displayed values feel evenly spaced.
- Preserve the initial game and minimap experience for device defaults and saved state.
- Keep world generation, camera modes, movement, glyph caching, and culling bounded and independently testable.

**Non-Goals:**

- Do not expand the generated 512×512 world automatically.
- Do not couple minimap clicks to game zoom or change the minimap canvas dimensions.
- Do not add a new dependency or replace the current React/Babylon Lite layer boundary.

## Decisions

1. **Use logarithmic ten-level spacing.** Define the effective scale for displayed value `n` as `0.1 × 100^((n - 1) / 9)` relative to the current zoom-1 scale. This makes displayed 1 equal 0.1× current zoom 1 and displayed 10 equal current zoom 10, with a constant adjacent ratio of `100^(1/9)` between them. Linear spacing was rejected because it would concentrate useful changes at one end of the range.

2. **Keep displayed values separate from effective scale.** Local storage, Settings labels, plus/minus bounds, bridge snapshots, and diagnostics continue to use displayed integers. Viewport dimensions, glyph raster sizing, cache keys, and visible-region calculations use the converted effective scale. This avoids exposing fractional values in the UI while allowing fractional rendering sizes internally.

3. **Migrate by visual equivalence.** Existing game defaults and saved values are converted to the nearest displayed value whose effective scale is closest to the old scale. The minimap uses an explicit adapter based on its current content coverage semantics, because its scale value is independent from game zoom and may be an inverse viewport divisor rather than a cell-size multiplier.

4. **Retain world bounds.** The existing 512×512 world remains the source of truth. At displayed zoom 1, the camera clamps to valid rows and columns and the renderer culls outside cells. World-size expansion is only justified by visual evidence of insufficient content or boundary artifacts, not by the zoom remap itself.

5. **Validate performance at the new far view.** The farthest view can expose roughly 100 times the visible area of current zoom 1. Focused tests and runtime diagnostics must measure visible-cell count, glyph-cache growth, lighting work, and cached zoom rerender time before any implementation is considered complete.

## Risks / Trade-offs

- [Risk] The farthest view can submit many more visible glyphs and lighting cells. → Mitigate with visible-region culling, bounded caches, and measured performance checks.
- [Risk] Existing saved integer values no longer identify the same visual scale. → Migrate by effective-scale equivalence before clamping or defaulting.
- [Risk] A minimap scale may not have the same mathematical meaning as game zoom. → Use a dedicated semantic adapter and verify canvas size, coverage, and persistence independently.
- [Risk] Fractional effective cell sizes can expose rasterization or rounding artifacts. → Test all ten displayed values and retain the current zoom-10 endpoint path as the closest-scale reference.
- [Risk] A 512×512 world may feel sparse or show its border at far zoom. → Inspect browser output and boundary cases first; treat world expansion as a separate approved scope decision.
