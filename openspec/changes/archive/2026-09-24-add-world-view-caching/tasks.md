# Tasks

## 1. Shared invalidation and refresh selection

- [x] 1.1 Add a view-scoped semantic revision and dirty-region model covering source/crop, realm, geometry, device pixel ratio, font, offsets, palette, fog, lighting, actors, markers, GPU effects, and transient overlays; verify focused Node tests distinguish unchanged, partial, and incompatible states.
- [x] 1.2 Add bounded dirty-cell coalescing and refresh selection that considers coverage and rectangle fragmentation; verify focused tests select partial work for local contiguous changes and complete refresh for incompatible, broad, or fragmented changes.
- [x] 1.3 Define bounded retained-resource ownership and disposal hooks for each view; verify focused tests clear mapview and replaced-preview resources without disturbing active game or minimap resources.

## 2. Main game-world retained presentation

- [x] 2.1 Integrate semantic refresh reuse with the Babylon Lite game-world composition path while preserving its existing sprite atlas, per-sprite comparison, and engine-managed opaque draw replay; verify an unchanged scheduled refresh does not recreate the visible composition or submit a full region.
- [x] 2.2 Route compatible game-world dirty cells and local player-light influence through bounded updates, retaining complete-region refreshes for viewport remapping and incompatible visual state; verify focused renderer tests match complete-refresh fog, glyph, lighting, GPU-light, health-bar, and floating-text output.

## 3. Retained canvas views

- [x] 3.1 Add a minimap retained base-world and patchable dynamic-overlay path that preserves existing crop geometry, fog opacity, lighting, GPU light pass, and marker order; verify focused minimap tests cover unchanged reuse, local fog/light/marker updates, and full-refresh fallback.
- [x] 3.2 Add a fullscreen mapview retained path while open, preserving cooperative cold/full rebuilds, full-realm fog bypass, diagnostic lighting, and marker behavior; verify focused mapview tests cover partial actor/marker updates, realm toggle replacement, and release on close.
- [x] 3.3 Add revision-bound retained rendering for the generation-settings preview, preserving cancellation/replacement behavior; verify focused tests ensure an obsolete preview cannot publish or retain resources after replacement.

## 4. Measurement and calibration

- [x] 4.1 Extend the opt-in performance report with refresh mode, dirty coverage, rectangle count, and bounded resource context for world-derived views; verify monitor tests preserve privacy-safe reports and separate world/minimap phase attribution.
- [x] 4.2 Capture comparable idle, normal movement, sprint, mapview, and settings-preview baseline and post-change diagnostics, then set per-view partial/full boundaries from the measured results; verify the established sustained rapid-movement floor remains at least 45 FPS.

## 5. Integration verification

- [x] 5.1 Run focused Node tests for world-view composition, invalidation, game rendering, minimap, mapview, preview cancellation, and performance monitoring; verify all affected tests pass without adding or running Playwright tests.
- [x] 5.2 Run the repository full Node test command and `npm.cmd run build`; verify both succeed or document unrelated pre-existing failures without altering unrelated dirty work.
- [x] 5.3 Manually verify the running game in supported desktop and mobile presentation modes: stable idle reuse; normal and Shift movement; fog, lighting, palette/font, markers, and GPU effects; mapview open/toggle/close; and settings-preview replacement. Verify visual parity, no stale content, released mapview resources, and the exact working URL.
