# Proposal

## Why

Treasure chest behavior is not reliable in the actual game: opening a chest has not been observably producing the required opening log or nearby Heart, and collecting that Heart has not been proven to produce its collection log. Existing unit tests exercise the object system in isolation, so an end-to-end game interaction contract and verification path are needed.

## What Changes

- Make one cardinal player movement into any unopened Treasure Chest complete the chest-opening lifecycle on that same input.
- Guarantee a visible chest-opening log entry through the existing Log System.
- Guarantee the 100%-probability Heart reward is registered in the active realm, rendered near the opened chest when a valid neighboring cell exists, and remains collectible through the normal pickup path.
- Guarantee collecting the spawned Heart applies the health effect and produces the existing Heart collection log.
- Add deterministic actual-game verification that walks the player into a chest, observes the opening result, observes the opening log and Heart, then collects the Heart and observes the collection log.
- Preserve existing house-owned chest behavior, standalone chest density, seeded placement, and the rule that a spent chest cannot create a second reward.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `object-spawner-system`: define the complete observable chest-open, Heart-spawn, Heart-collection, and logging lifecycle.
- `player-grid-movement`: require the actual player-input path to resolve a cardinal chest contact on the first input and expose the resulting world mutations to rendering and pickup collision.
- `log-system`: require chest opening and Heart collection messages to reach the visible Log UI through the existing bridge.

## Impact

Affected gameplay movement integration, object spawning/collision, world rendering invalidation, Log System bridge/UI integration, and focused/end-to-end tests under `ascii-rpg/src/` and `ascii-rpg/test/`. No new runtime dependencies are planned. Validation will use focused Node tests, `npm.cmd test`, `npm.cmd run build`, and an explicit seeded actual-game browser verification; Playwright test-file work is included only for this explicitly requested end-to-end check.
