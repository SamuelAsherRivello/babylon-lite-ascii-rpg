# Tasks

## 1. Size model and placement

- [x] 1.1 Add immutable `SMALL` (7x5), `MED` (10x5), and `HIGH` (20x10) Home definitions, record the selected size on each Home, and verify focused geometry tests cover dimensions, walls, interiors, and bottom-edge Doors.
- [x] 1.2 Refactor candidate footprint, approach, Door-column, and exterior-Key reachability checks to consume the selected definition and verify blocked, reserved, narrow, and partial-footprint candidates are rejected.
- [x] 1.3 Add seeded equal-probability size selection without changing the existing region/chance semantics and verify repeatable output plus coverage of all three size choices.

## 2. Runtime and preview integration

- [x] 2.1 Preserve size-aware wall/interior overlays, Door/Key ownership, effective walkability, and dynamic-entity reservations and verify focused interaction and collision tests for all sizes.
- [x] 2.2 Route procedural Overworld preview generation through the same size-aware seeded selection and verify one marker per accepted Home with matching origins and sizes.

## 3. Verification

- [x] 3.1 Run the focused building, world-generation, object-collision, movement/render, spawner, and preview tests and verify all pass.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify both succeed.
- [x] 3.3 Treat automated deterministic generation, geometry, overlay, collision, and build checks as the acceptance gate; no human browser verification is required for this change.
