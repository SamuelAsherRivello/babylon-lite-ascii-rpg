# Tasks

## 1. Toast lifecycle

- [x] 1.1 Create the UI-layer toast provider, enqueue hook, lifecycle helper, and single-toast viewport; verify the helper represents idle, entering, visible, and exiting states with FIFO pending messages.
- [x] 1.2 Add focused Node tests for first-message entry, FIFO in-place promotion after each 3-second hold, final 250 ms exit, and exit cancellation by a newly enqueued message; verify the focused test file passes.

## 2. User interface integration

- [x] 2.1 Reserve matching responsive upper-left HUD and minimap footprints, then add non-interactive toast styling in their centered gap at the shared inset with 250 ms enter and exit motion, dark-theme treatment, polite status semantics, reduced-motion compatibility, a three-times-taller portrait minimum height, and a compact 920 px maximum desktop lane; verify no page overflow at narrow and wide viewport sizes.
- [x] 2.2 Wrap the React app in the toast provider and add the `Send Toast` Settings action using the existing settings control and tooltip conventions; verify it enqueues the literal `Test toast` message and its hover/focus help is shown.

## 3. Validation

- [x] 3.1 Run the repository Node test suite with `npm.cmd test` and verify all tests pass.
- [x] 3.2 Run `npm.cmd run build` and verify the production Vite build succeeds.
- [x] 3.3 Manually verify the served application: one toast enters, holds, and exits at the viewport top; repeated clicks display FIFO content swaps without intermediate motion; a click during final exit cancels the exit; and the layout remains usable in a narrow viewport.
