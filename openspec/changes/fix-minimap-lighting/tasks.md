# Tasks

## 1. Minimap lighting implementation

- [x] 1.1 Apply the minimap region's authoritative per-cell lighting factor to each discovered glyph's base palette color before creating or retrieving its colorized glyph canvas; verify the minimap no longer uses full-bright base colors.
- [x] 1.2 Include the lighting result in minimap colorized-canvas cache identity and clear affected cached canvases when lighting or palette inputs change; verify stale bright glyph canvases are not reused after movement or settings changes.
- [x] 1.3 Preserve the separate minimap canvas/cache and keep the GPU light pass as an additive overlay only; verify the game canvas is never used as a minimap pixel source.

## 2. Verification

- [x] 2.1 Add or update focused Node coverage for ambient-only, source-lit, and GPU-overlay minimap color behavior; verify the relevant test command passes.
- [x] 2.2 Run the repository's existing test suite and production build; verify both complete successfully.
- [x] 2.3 Manually inspect the running game with the GPU light pass enabled and disabled; verify game view and minimap have matching base darkness while the minimap remains independently rendered.
