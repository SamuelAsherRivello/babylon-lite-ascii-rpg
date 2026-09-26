# Tasks

## 1. Torch presentation contract

- [x] 1.1 Add focused game-layer tests for three-frame Torch strip selection, cell anchoring, continuous loop progression, and no static-glyph fallback; verify the new tests pass without Playwright.
- [x] 1.2 Add focused reconciliation tests proving that only active-realm, fog-eligible Torches inside the visible region have active presentation records, and that camera/fog/realm changes remove stale records; verify all focused tests pass.

## 2. Game-view implementation

- [x] 2.1 Register the existing project-local `torch_strip.png` asset and implement the game-layer-owned, cell-anchored three-frame Torch overlay; verify every visible eligible Torch uses the strip and the static glyph is suppressed without a fallback.
- [x] 2.2 Implement the single visible-set animation clock; verify it loops continuously while the active set is nonempty and schedules no work when that set is empty.
- [x] 2.3 Reconcile Torch overlays after game-view render, camera movement, zoom, resize, fog changes, realm transitions, and disposal; verify offscreen, fog-hidden, inactive-realm, and disposed Torches have no active overlay or per-frame animation work.
- [x] 2.4 Preserve the catalog glyph, Torch coordinate, lighting-source behavior, walkability, collision, non-interactive behavior, minimap marker, and mapview marker paths; verify focused object, lighting, and map/minimap tests still pass.

## 3. Verification

- [ ] 3.1 Run the affected focused Node test files, then `npm.cmd test`, `npm.cmd run build`, and `openspec validate replace-torch-with-animated-art --strict` from the repository root; verify each succeeds without creating or running Playwright files.
- [ ] 3.2 Manually verify a fixed-seed browser session at displayed zooms 1, 5, and 10: a visible Torch loops continuously, leaving the visible region stops its active presentation, re-entry has no stale position or forced synchronized restart, and movement through the Torch cell remains unchanged; record the local URL and observations.
