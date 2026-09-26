# Tasks

## 1. Asset and catalog foundation

- [x] 1.1 Copy the RCArt particle frame folders into the application's local asset tree and verify no runtime import references the Downloads path
- [x] 1.2 Define the stable alphabetical effect catalog with frame paths, frame counts, authored scale, frame timing, and one-shot/loop metadata; verify every copied sequence resolves
- [x] 1.3 Add focused catalog tests covering names, ordering, frame counts, missing-frame failures, and one-shot metadata

## 2. Production particle runtime

- [x] 2.1 Implement active particle-instance state keyed by realm/world coordinate and verify one-shot instances advance and self-remove after their final frame
- [x] 2.2 Add grid-anchored transparent sprite presentation above existing world content and verify terrain, glyphs, objects, collision, and fog state are unchanged
- [x] 2.3 Integrate visible-region culling and camera/grid coordinate conversion, verifying offscreen active effects are not submitted and render after the camera returns
- [x] 2.4 Expose a realm/world-independent spawn API for future gameplay callers and verify effects can be created in each supported realm

## 3. Developer PFX window

- [x] 3.1 Add the `PFX` launcher to Windows developer tools and verify existing Dev and Lighting controls remain available
- [x] 3.2 Implement the draggable, non-modal PFX window with alphabetical text selection and voluntary close, verifying it follows Lighting window interaction conventions
- [x] 3.3 Add click-to-place demo behavior that ignores clicks consumed by the PFX window, spawns one selected one-shot effect at the clicked world cell, and keeps the window open for repeated placement
- [x] 3.4 Gate the launcher and placement workflow behind the developer surface and verify placement does not mutate gameplay or world state

## 4. Verification and handoff

- [x] 4.1 Run focused Node tests for catalog, lifecycle, coordinate mapping, and placement behavior and verify they pass
- [x] 4.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify both complete successfully
- [ ] 4.3 Perform manual browser verification with an explicit `randomSeed`: open Dev > Windows > PFX, drag the window, select every listed effect, place repeated previews in the game world, and verify layering, one-shot completion, and window persistence
- [x] 4.4 Run strict OpenSpec validation for `add-pfx-debug-particle-system` and verify the change is ready for human review
