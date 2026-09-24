# Tasks

## 1. Tick lifecycle and compatibility

- [ ] 1.1 Inventory every current time-system tickable and document its ordering, mutation dependencies, birth-time behavior, and presentation side effects; verify the inventory covers movement, combat, stamina, enemies, NPCs, spawners, quests, and both realms.
- [ ] 1.2 Add a logical tick record/coordinator that commits time and cause immediately, snapshots eligible registrations, tracks per-tick delivery exactly once, and preserves the existing synchronous-compatible public time-system contract; verify focused time-system tests pass.
- [ ] 1.3 Integrate the coordinator with the existing game-owned deferred scheduler using bounded resumable jobs; verify a controlled scheduler test resolves one logical tick across multiple frame callbacks without duplicate delivery.

## 2. Ordering, overlap, and lifecycle safety

- [ ] 2.1 Classify tick-driven work into ordered simulation dependencies and independently resumable work, then encode prerequisites so later logical ticks cannot overtake dependent earlier mutations; verify overlapping tick fixtures preserve logical event order.
- [ ] 2.2 Add session, realm/world, terrain, and entity revision guards to deferred tick results; verify restart, realm replacement, entity removal, and disposal cancel or ignore stale work without mutating the current session.
- [ ] 2.3 Define hidden-document suspension, resume, and failure settlement behavior for pending ticks; verify no tick is replayed, dropped, or left permanently pending across visibility and error fixtures.

## 3. Tick-driven system integration

- [ ] 3.1 Adapt stamina and combat/time subscribers to commit immediate logical results while scheduling any expensive dependent work; verify movement and combat advance time exactly once and preserve stamina, damage, and log outcomes.
- [ ] 3.2 Adapt enemy and enemy-spawner tick processing to the asynchronous coordinator while preserving active/inactive-realm simulation, action intervals, occupancy, pathfinding, death, and registration semantics; verify focused enemy and spawner suites pass.
- [ ] 3.3 Adapt NPC and NPC-spawner processing to the coordinator, including pending actions and deferred patrol preparation; verify equivalent routes/actions for fast and slow scheduler fixtures with no duplicate actors or subscriptions.
- [ ] 3.4 Audit quest, object, realm, floating-text, health-bar, fog, and visual-invalidation consumers for tick dependencies; keep simulation authoritative in Babylon Lite and verify React receives only existing immutable snapshots.

## 4. Rendering and responsiveness

- [ ] 4.1 Keep the render loop, animation, input, and visible game/minimap presentation eligible while tick jobs are pending; verify a browser or controlled frame fixture renders between tick slices and never treats a tick as a render frame.
- [ ] 4.2 Coalesce tick-driven presentation invalidations without suppressing required final state, visible health changes, floating text, health bars, fog, minimap markers, or active-player presentation; verify final output matches synchronous reference fixtures.
- [ ] 4.3 Add local diagnostics for tick queue depth, logical tick age, longest slice, completion latency, cancellation, and stale-result counts without exporting seeds, storage contents, or credentials; verify diagnostic output remains opt-in.

## 5. Verification and rollout

- [ ] 5.1 Run focused time, scheduler, movement, combat, enemy, NPC, spawner, bridge, and rendering tests and verify deterministic seeded outcomes match the synchronous reference.
- [ ] 5.2 Run `npm.cmd test`, `npm.cmd run build`, `git diff --check`, and strict OpenSpec validation; record actual results and distinguish unrelated existing failures.
- [ ] 5.3 Manually verify with explicit fixed random seeds that movement triggers a logical tick on one frame, the game continues rendering across later frames while that tick resolves, rapid input does not duplicate or reorder ticks, and restart/realm changes invalidate obsolete work.
