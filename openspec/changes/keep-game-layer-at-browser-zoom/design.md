# Design

## Context

See proposal.md for motivation. The document has sibling fixed `game_layer` and `ui_layer` surfaces. Babylon Lite currently observes canvas size and device-pixel-ratio changes, while CSS presentation rules independently define landscape, desktop portrait, and mobile portrait geometry. The existing ten-level game zoom is a gameplay/rendering setting and must remain separate.

## Goals / Non-Goals

**Goals:**

- Identify browser page-zoom changes using the existing resize/DPR observation path.
- Keep the game presentation at a stable 100% apparent scale while allowing React CSS layout to follow browser zoom.
- Keep Babylon Lite authoritative for canvas sizing, game rendering, and input; expose no world or renderer internals to React.
- Preserve aspect modes, fullscreen, transitions, mapview, minimap, and existing in-game zoom semantics.
- Verify the result at Chrome 80%, 100%, and 125% with pointer interaction.

**Non-Goals:**

- Changing the ten displayed in-game zoom levels or their persistence.
- Changing world dimensions, camera modes, glyph rasterization, or minimap zoom.
- Supporting selective browser zoom behavior for arbitrary third-party browser chrome.
- Adding a new dependency or creating Playwright test files.

## Decisions

1. **Use the existing browser-zoom signal.** Keep the current `devicePixelRatio`/resolution media-query observation as the source of browser zoom changes, with normal resize and orientation events retained for real viewport changes. This avoids treating the user’s in-game Zoom control as browser zoom.

2. **Compensate the game presentation boundary, not React.** Apply the separation at the `game_layer` presentation/frame boundary and keep `ui_layer` in normal fixed CSS layout. This preserves the React HUD’s responsive behavior and the established layer ownership contract. A CSS-only global scale would incorrectly scale the HUD; moving the game canvas into React would violate ownership.

3. **Keep logical game coordinates authoritative.** The compensation must be reflected in the game canvas’ client-to-logical coordinate conversion. Renderer resize and camera calculations may use the compensated frame, but React must not receive mutable world, fog, entity, or renderer data.

4. **Treat mobile separately.** Desktop page-zoom compensation must not force the desktop portrait 9:16 frame onto coarse-pointer mobile presentation. Mobile continues to fill its browser viewport according to the existing responsive contract.

5. **Validate with source and runtime checks.** Add focused Node/source-contract coverage for compensation math, resize stability, and input mapping. Use manual Chrome checks for visible scale, HUD reflow, aspect modes, pointer movement, and absence of overflow; do not claim browser proof from unit tests alone.

## Risks / Trade-offs

- **[Inverse compensation can make the game frame exceed or underfill the viewport]** -> Clamp compensation to the selected presentation frame and verify landscape, desktop portrait, and mobile separately.
- **[Pointer coordinates can drift after zoom]** -> Centralize the inverse mapping from client coordinates through the compensated game frame and cover pointer/swipe cases.
- **[DPR changes can be mistaken for ordinary resize]** -> Preserve the existing effective-size guards and ensure compensation updates are idempotent.
- **[React controls can be covered or lose hit-testing]** -> Keep `ui_layer` z-index/pointer-event behavior unchanged and verify controls at all three browser zoom levels.
- **[Existing responsive work has unfinished manual zoom validation]** -> Record the browser-zoom checks for this change separately and distinguish source/build results from live Chrome evidence.
