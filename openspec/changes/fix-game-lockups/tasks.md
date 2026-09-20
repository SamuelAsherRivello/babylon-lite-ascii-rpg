# Tasks

## 1. Renderer lifecycle

- [ ] 1.1 Implement one coalesced Babylon Lite presentation scheduler and verify unchanged worlds do not submit continuous frames.
- [ ] 1.2 Integrate resize, visibility, device-loss, startup, and disposal cancellation paths and verify stale work cannot render after teardown.
- [ ] 1.3 Route every visual state mutation through the scheduler and verify palette, font, zoom, camera, realm, fog, minimap, lighting, and GPU-light updates remain visible.

## 2. UI input safety

- [ ] 2.1 Remove implicit first-click fullscreen and verify only the explicit Fullscreen control requests it.
- [ ] 2.2 Verify React menu actions remain narrow bridge commands and do not recreate game state or renderer resources.

## 3. Validation

- [ ] 3.1 Add focused runtime tests for scheduler coalescing and lifecycle cancellation, then run npm.cmd test.
- [ ] 3.2 Manually click every left-side menu control in a production build and verify no browser crash, freeze, or lost system behavior.
- [ ] 3.3 Run npm.cmd run build and OpenSpec validation for this change.
