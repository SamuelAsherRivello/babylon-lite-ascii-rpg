# Tasks

## 1. Zoom scale and state migration

- [x] 1.1 Add the shared ten-level linear nominal conversion with exact endpoint anchors and verify unit coverage for displayed values 1–10, monotonicity, and constant adjacent difference.
- [x] 1.2 Update React zoom bounds, plus/minus behavior, validation, and local-storage migration; verify saved values and invalid values resolve to the nearest valid displayed value.
- [x] 1.3 Map PC and mobile defaults through effective-scale equivalence and verify first render preserves each device's current visual zoom when no saved value exists.
- [x] 1.4 Add the minimap scale adapter without coupling minimap input to game zoom; verify canvas dimensions, content coverage, persistence, and initial appearance remain equivalent.

## 2. Viewport and rendering integration

- [x] 2.1 Apply effective zoom to viewport cell dimensions, camera-origin calculations, movement bounds, and resize handling; verify world and player state remain unchanged across all ten displayed values.
- [x] 2.2 Update glyph raster sizing, cache keys, visible-region culling, and redraw paths for fractional effective scales; verify terrain and character layering at displayed zooms 1, 5, and 10.
- [x] 2.3 Verify the existing 512×512 world clamps correctly at displayed zoom 1 without rendering beyond its border or requiring automatic world expansion.

## 3. Validation and delivery checks

- [x] 3.1 Update focused Node tests for zoom conversion, defaults, saved-state migration, minimap mapping, camera behavior, and glyph rendering; verify the relevant test files pass.
- [x] 3.2 Measure far-zoom visible-cell count, cache growth, lighting/render work, cold warmup, and cached rerender timing; verify bounded behavior against the rendering requirements.
- [x] 3.3 Run the repository's documented test and build commands and manually inspect the browser at displayed zooms 1, 5, and 10 on desktop and mobile-sized presentations; verify no regression in initial device experience or minimap behavior.
