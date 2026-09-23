# Tasks

## 1. Registry and plan foundation

- [ ] 1.1 Inventory every current generated terrain, static object, civilization feature, NPC spawner, and enemy spawner; define validated registry declarations for owner layer, realm scope, generated mode, configuration mode, prerequisites, and deterministic seed namespace; verify focused registry tests reject missing declarations, unknown references, and cycles.
- [ ] 1.2 Implement a deterministic generation-plan builder with the canonical base order and stable insertion for a newly declared layer; verify the resolved numbered plan preserves unrelated order and records deferred object placements with their Object Distribution ownership.
- [ ] 1.3 Route realm generation and startup orchestration through the resolved plan while preserving each pass owner's layer writes and occupancy rules; verify identical seed, catalog, and settings produce matching plan entries and placements.

## 2. Automatic object distribution

- [ ] 2.1 Extend valid object catalog records with realm scope, prerequisite, and Procedural-setting declarations; migrate Hearts, Traps, Torches, Fireplaces, Stairs, and future-compatible defaults; verify catalog validation reports the object identity for an incomplete level-generated declaration.
- [ ] 2.2 Refactor Object Distribution to enumerate every valid `IsLevelSpawned: true` object from the normalized catalog instead of hard-coded type-specific startup paths; verify a test fixture object is placed deterministically without adding a placement call.
- [ ] 2.3 Preserve per-object Low/Med/High profiles, paired-realm Stairs, static-cell reservations, and later declared prerequisites; verify focused object/world tests cover no layer overwrites, no placement conflicts, and repeatable results in both realms.

## 3. Procedural settings and preview parity

- [ ] 3.1 Generate the persisted ordered settings catalog from registry declarations, with Object Distribution rows for configurable objects and fixed-baseline rows without a density selector; verify settings-store tests backfill a newly registered default without removing valid unrelated saved values.
- [ ] 3.2 Update the Procedural modal to present the canonical nine-card order and individual object-density rows under Object Distribution; verify the existing Node UI/source checks assert the labels, ordering, and control availability.
- [ ] 3.3 Build preview markers from the same resolved plan and seed namespaces as live generation; verify focused preview tests show each qualifying feature in its allowed realm and match live selected cells for a fixed draft and seed.

## 4. Dynamic generation integration and verification

- [ ] 4.1 Register NPC and enemy spawner generation with their declared realm scope and prerequisites while keeping dynamic occupancy authority in their existing systems; verify focused spawner tests reject static/dynamic collisions and preserve Overground/Underground restrictions.
- [ ] 4.2 Add a generation inventory regression test proving every generated rendered feature has a registry declaration, settings representation, preview representation, and resolved-plan entry; verify it fails for each independently removed registration.
- [ ] 4.3 Run the affected Node tests, `npm.cmd run test:responsive`, and `npm.cmd run build`; manually verify the Procedural modal and both realm previews show the ordered generated-feature catalog without changing unrelated dirty work.
