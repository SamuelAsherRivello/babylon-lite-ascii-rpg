# Tasks

## 1. Chest catalog and generation profile

- [x] 1.1 Add the Chest catalog definition, closed/open glyph inventory entries, and 100-percent Heart reward table; verify palette validation accepts every Chest glyph.
- [x] 1.2 Add the persisted Chest Low/Med/High profile mapping of 1/2/3 per realm; verify missing saved values resolve to Med without changing existing settings.
- [x] 1.3 Extend deterministic placement to select eligible Chest cells within 50 Euclidean grid cells of each realm's player start and reserve them against other initial objects; verify repeated seeded generation returns the same positions and count.

## 2. Chest interaction and reward creation

- [x] 2.1 Add cardinal Chest bump handling that blocks movement, changes a closed glyph to open, and retains its static block; verify the player remains adjacent on the opening move and later bump attempts remain blocked.
- [x] 2.2 Select and spawn the configured 100-percent Heart reward on one eligible empty walkable cell among the eight surrounding cells, excluding the player's cell; verify diagonal eligibility, rendered-cell availability, normal Heart collection, and a Chest cannot reward twice.
- [x] 2.3 Handle an opening with no eligible surrounding reward cell without throwing or retrying; verify the Chest remains visibly open and spent.

## 3. Procedural settings and preview

- [x] 3.1 Add the Chest row to Object & NPC Distribution with Low/Med/High labels, draft behavior, persistence, and reset coverage; verify the selected value is visible and survives the established settings flow.
- [x] 3.2 Render closed-Chest placements in the seeded procedural settings preview; verify each preview realm shows the selected 1/2/3 count within its start radius.

## 4. Verification

- [x] 4.1 Extend focused object-spawner, generation-settings, and main integration Node tests for deterministic placement, blocked opening, one Heart reward, spent behavior, and preview count; verify `npm.cmd test` passes.

## 5. Treasure quest

- [x] 5.1 Add the `All of the Treasure` quest with exactly one `Open treasure chest` task driven by the generic `chest-opened` event; verify it is present in the quest catalog and completes once when a chest opens.
