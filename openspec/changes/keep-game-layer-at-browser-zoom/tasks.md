# Tasks

## 1. Specify and isolate browser zoom state

- [x] 1.1 Add focused tests or pure helpers for identifying browser page-zoom changes separately from the ten-level in-game zoom.
- [x] 1.2 Define the bounded compensation contract for desktop landscape, desktop portrait, and coarse-pointer mobile presentation.

## 2. Implement game-layer compensation

- [x] 2.1 Update the game-layer resize/presentation path to preserve 100% apparent game scale when browser zoom changes.
- [x] 2.2 Keep React `ui_layer` responsive to browser zoom and preserve the existing z-index, aspect, fullscreen, transition, and HUD contracts.
- [x] 2.3 Update game-layer pointer and swipe coordinate conversion for the compensated presentation.
- [x] 2.4 Ensure compensation changes are idempotent and do not create recursive resize/render loops or stale canvas buffers.

## 3. Verify existing behavior remains independent

- [x] 3.1 Verify the in-game ten-level Zoom control and persisted value remain unchanged across browser zoom changes.
- [ ] 3.2 Run focused Node tests and the repository’s existing test/build checks from the repository root.
- [x] 3.3 Validate OpenSpec strictly and run `git diff --check`.

## 4. Manual browser verification

- [x] 4.1 In Chrome, verify 80%, 100%, and 125% browser zoom with an explicit `randomSeed` URL argument.
- [x] 4.2 Verify game apparent scale, HUD resizing, React control hit-testing, pointer/swipe movement, and no document horizontal overflow.
- [x] 4.3 Verify desktop landscape, desktop portrait, fullscreen, and mobile portrait behavior.
