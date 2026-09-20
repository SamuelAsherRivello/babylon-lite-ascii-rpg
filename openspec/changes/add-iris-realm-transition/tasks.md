# Tasks

## 1. Transition primitive

- [x] 1.1 Add a Babylon Lite transition system module that models idle, closing, covered, and opening phases, accepts explicit durations and animation parameters, emits ordered start/covered/complete events, and verifies behavior with focused Node tests.
- [x] 1.2 Add the pointer-transparent game-layer mask surface and soft radial-gradient styling, including responsive resize handling and disposal, and verify it remains inside `#game_layer`.
- [x] 1.3 Add transition timing tests for 2-second close, full-coverage midpoint, 2-second open, elapsed-time clamping, and duplicate-request rejection.

## 2. Realm transfer integration

- [x] 2.1 Integrate the transition primitive into the Babylon game controller so stair-cell and Settings-triggered realm transfers clear movement state, lock all movement input, and do not start a second transfer while active; verify with focused controller/input tests or the closest existing runtime test seam.
- [x] 2.2 Move the existing realm swap and paired-stair arrival work to the covered/midpoint event, preserving fog discovery, lighting, camera resolution, realm listeners, and stored active-realm updates; verify the realm changes only while covered and arrives on the paired coordinate.
- [x] 2.3 Resume input only after the opening phase completes and verify keyboard, pointer, swipe, and held-repeat input can move the destination realm afterward.
- [x] 2.4 Preserve the narrow bridge and UI ownership boundary, adding or updating tests so realm status still reaches React while the HUD/settings UI remains visible above the game-layer mask.

## 3. Verification and delivery

- [x] 3.1 Run the repository Node test suite with `npm.cmd test` and resolve any focused transition, world-realm, bridge, or architecture regressions.
- [x] 3.2 Run `npm.cmd run build` and verify the production bundle includes the transition integration without a new runtime dependency.
- [ ] 3.3 Perform manual browser verification on the actual playable project-root URL: enter `S` in both realm directions, observe the feathered 2-second-in/2-second-out red iris, confirm the realm graphics swap at full red coverage, confirm UI remains visible, and confirm input is paused during the animation.
