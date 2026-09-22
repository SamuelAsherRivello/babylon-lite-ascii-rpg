# Tasks

## 1. Persisted Layout preference and bridge state

- [x] 1.1 Add validated local-storage helpers for Glyph Background and Background Darkness, initialize missing values to `On` and `50`, and verify invalid values fall back and are repaired.
- [x] 1.2 Extend the UI/game bridge and game controller preference path with validated background-enabled and darkness snapshots, and verify updates reach the running game without React accessing per-cell state.
- [x] 1.3 Verify Reset Settings clears both layout keys and reloads with Glyph Background `On` and Background Darkness `50`.

## 2. Ascii Settings Layout tab

- [x] 2.1 Add the top-level `Layout` tab to Ascii Settings while preserving the existing Glyphs and Fonts tabs, and verify the exact labels and selected-tab behavior.
- [x] 2.2 Add the `Glyph Background` On/Off control and integer `Background Darkness` range slider from `0` to `100`, and verify changes update the persisted values and visible game presentation immediately.
- [x] 2.3 Add responsive styling and accessible labels/value presentation for the Layout controls, and verify the window remains usable in landscape and portrait viewports.

## 3. Composite glyph/background rendering

- [x] 3.1 Add the client composite visual path that derives an opaque grid-sized background from the glyph palette color, applies the `0..100` darkness mapping, and composites it with the glyph before cell lighting; verify darkness `0`, `50`, and `100` outputs.
- [x] 3.2 Integrate composite visuals with the existing font/zoom glyph cache boundary without unbounded per-color growth, and verify palette, font, zoom, resize, and layout changes invalidate or reuse only the required visible presentation data.
- [x] 3.3 Apply the composite to every discovered rendered game-view cell, including spaces, while preserving glyph-only rendering when disabled; verify the background and glyph receive the same lighting result.
- [x] 3.4 Preserve shared fog eligibility and slot reconciliation so fogged cells submit neither element and stale combined presentations are hidden after viewport shifts; verify with focused world-view tests.
- [x] 3.5 Reuse the composite raster path in the mini-map and apply the shared GPU light-pass samples and additive color there when enabled; verify game-view and mini-map presentation stay aligned.

## 4. Verification and documentation

- [x] 4.1 Add focused Node/source contract tests for Layout controls, persistence/defaults/reset, darkness mapping, composite ordering, space cells, toggle invalidation, and fog exclusion; verify the focused test command passes.
- [x] 4.2 Run the repository's complete Node test suite and production build from the repository root, and verify no unrelated dirty files are modified.
- [x] 4.3 Manually inspect the live Vite app in landscape and portrait, verify Layout controls, reload persistence, reset behavior, lighting response, zoom response, space-cell backgrounds, and fog-hidden cells.
- [x] 4.4 Run `openspec validate --change "add-glyph-background-layout" --strict` and verify all proposal, spec, design, and task artifacts are valid.
- [x] 4.5 Verify the new mini-map composite and GPU light-pass behavior in the live app, including toggle-on/off invalidation and lighting updates.
