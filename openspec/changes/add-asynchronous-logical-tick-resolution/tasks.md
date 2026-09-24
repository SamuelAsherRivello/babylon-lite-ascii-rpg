# Tasks

## 1. Tick lifecycle and compatibility

- [x] 1.1 Inventory every current time-system tickable and document its ordering, mutation dependencies, birth-time behavior, and presentation side effects; verify the inventory covers movement, combat, stamina, enemies, NPCs, spawners, quests, and both realms.
- [x] 1.2 Add a logical tick record/coordinator that commits time and cause immediately, captures trigger-time wall-clock delta, snapshots eligible registrations, announces multi-unit ticks in order, calls `tick(currentTimeInTUnits, deltaTimeInMilliseconds)`, and tracks per-tick delivery exactly once; verify focused time-system tests pass.
- [x] 1.3 Integrate the coordinator with the existing game-owned deferred scheduler using bounded resumable jobs; verify a controlled scheduler test resolves one logical tick across multiple frame callbacks without duplicate delivery.

## 2. Ordering, overlap, and lifecycle safety

- [x] 2.1 Keep logical tick ordering in the coordinator and ensure systems remain dumb tick consumers with no out-of-order detection or repair logic; verify multi-unit and overlapping-tick fixtures preserve ordered callback delivery.
- [x] 2.2 Add session, realm/world, terrain, and entity revision guards to deferred tick results; verify restart, realm replacement, terrain/entity removal, and disposal cancel or ignore stale work without mutating the current session.
- [x] 2.3 Define hidden-document suspension, resume, and failure settlement behavior for pending ticks; verify no tick is replayed, dropped, or left permanently pending across visibility and error fixtures.

## 3. Tick-driven system integration

- [x] 3.1 Adapt stamina and combat/time subscribers to preserve the two-argument tick contract at the tickable boundary while retaining cause-filtered movement recovery and scheduling expensive dependent work; verify movement and combat advance time exactly once and preserve stamina, damage, delta, and log outcomes.
- [x] 3.2 Adapt enemy and enemy-spawner tick processing to the asynchronous coordinator while preserving active/inactive-realm simulation, action intervals, occupancy, pathfinding, death, and registration semantics; verify focused enemy and spawner suites pass.
- [x] 3.3 Adapt NPC and NPC-spawner processing to the coordinator, including pending actions and deferred patrol preparation; verify equivalent routes/actions for fast and slow scheduler fixtures with no duplicate actors or subscriptions.
- [x] 3.4 Audit quest, object, realm, floating-text, health-bar, fog, and visual-invalidation consumers for tick dependencies; keep simulation authoritative in Babylon Lite and verify React receives only existing immutable snapshots.

## 4. Rendering and responsiveness

- [x] 4.1 Keep the render loop, animation, input, and visible game/minimap presentation eligible while tick jobs are pending; verify a browser or controlled frame fixture renders between tick slices and never treats a tick as a render frame.
- [x] 4.2 Coalesce tick-driven presentation invalidations without suppressing required final state, visible health changes, floating text, health bars, fog, minimap markers, or active-player presentation; verify final output matches synchronous reference fixtures.
- [x] 4.3 Add local diagnostics for tick queue depth, logical tick age, completion latency, cancellation, and stale-result counts without exporting seeds, storage contents, or credentials; verify diagnostic output remains opt-in.

## 5. Verification and rollout

- [x] 5.1 Run focused time, scheduler, movement, combat, enemy, NPC, spawner, bridge, and rendering tests and verify deterministic seeded outcomes match the synchronous reference.
- [x] 5.2 Run `npm.cmd test`, `npm.cmd run build`, `git diff --check`, and strict OpenSpec validation; record actual results and distinguish unrelated existing failures.
- [ ] 5.3 Manually verify with explicit fixed random seeds that movement triggers an ordered logical tick callback on one frame, the game continues rendering across later frames while that tick resolves, real elapsed deltas are captured at trigger time, rapid input does not duplicate or reorder ticks, and restart/realm changes invalidate obsolete work.
