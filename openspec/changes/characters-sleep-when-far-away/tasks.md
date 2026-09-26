# Tasks

## 1. Eligibility-aware logical tick delivery

- [ ] 1.1 Add a constant-time character eligibility predicate to the Time System's tick-registration/delivery path, retaining deterministic order for eligible entities and verify focused Time System tests cover active, sleeping, removed, and newly registered tickables.
- [ ] 1.2 Filter ineligible character delivery before cooperative scheduler enqueue and verify focused asynchronous-tick tests assert that a sleeping character creates no deferred job while an eligible character receives exactly one ordered delivery.
- [ ] 1.3 Expose bounded local diagnostics for eligible, skipped, and queued character tick work and verify a focused test can distinguish a skipped sleeping actor from a cancelled or stale job without exporting runtime data.

## 2. Character-system integration

- [ ] 2.1 Integrate the same-realm, inclusive 50-cardinal-cell eligibility rule into enemy registration and verify focused enemy tests cover other-realm sleep, 51-cell sleep, 50-cell activity, wake-up without catch-up, occupancy, and age cadence.
- [ ] 2.2 Integrate ambient NPC patrol eligibility while preserving stored routes and verify focused NPC tests cover other-realm and 51-cell sleep, 50-cell patrol resumption, blocked steps, and no new pathfinding or randomization.
- [ ] 2.3 Preserve recruited NPC frame-based following independently of ambient sleep and verify focused follow and realm-transition tests still cover 3-5-gridspot behavior, door traversal, and party transfer.

## 3. Integration verification

- [ ] 3.1 Run the affected focused Node test files and verify time delivery, deferred-job counts, enemy/NPC sleep boundaries, combat, occupancy, and party following pass without adding Playwright files.
- [ ] 3.2 Run `npm.cmd test`, `npm.cmd run build`, and `openspec validate characters-sleep-when-far-away --strict`; verify each succeeds from the repository root.
- [ ] 3.3 Manually verify a fixed-seed browser session in both realms crosses the 50/51-cell boundary, freezes and wakes ambient characters without stale visible output, preserves nearby combat/follow behavior, and records the local URL and observations.
