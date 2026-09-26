# Tasks

## 1. Canonical blocked-water generation

- [x] 1.1 Replace the three-depth water assignment with one canonical water value while preserving seeded lake selection, counts, and keys; add focused generation tests that prove every selected water cell has that value and identical inputs reproduce it.
- [x] 1.2 Derive one glyph/color and `walkable: false` terrain result for canonical water; remove obsolete shallow/medium/deep palette and terrain assumptions, and verify focused world-system and palette tests cover the single-water contract.
- [x] 1.3 Update post-water connectivity and player-start checks so every water cell is blocked and starts are ground-only; verify water-bearing fixed seeds retain a connected playable region and no player can start on water.
- [x] 1.4 Update water-specific lighting, minimap/mapview, rendering, generation-reference, and dependent test fixtures to the canonical non-walkable-water contract; run their focused Node tests.

## 2. Blue animated water art

- [x] 2.1 Audit the checked-in Tiled asset set and record the approved blue animation's source path, frame coordinates, dimensions, order, cadence, and license/attribution evidence; verify it is a compatible blue animation and excludes red/green variants.
- [x] 2.2 Integrate the approved asset through the existing atlas and terrain-art pathway without a Tiled map loader or new dependency; verify a visible canonical water cell resolves to the blue terrain-art key and no red/green key can be selected.
- [x] 2.3 Add one shared renderer-time animation frame for all visible water cells and cache/invalidate only the affected terrain presentation; verify focused rendering tests observe synchronized frame selection without per-cell animation state or stale water sprites.
- [x] 2.4 Preserve fog opacity and established terrain/overlay ordering for animated water; verify focused tests cover fogged, partially visible, actor/object-overlay, and particle-overlay water cases.

## 3. Integration verification

- [x] 3.1 Run the relevant focused Node suites, then `npm.cmd test` and `npm.cmd run build` from the repository root; record any unrelated pre-existing failures separately.
- [x] 3.2 Run `openspec validate unify-water-depth-blue-animated-tile --type change --strict` and resolve every validation failure.
- [x] 3.3 Manually inspect a fixed-seed water-bearing world using an explicit `randomSeed` URL parameter; verify blue animation, all-water blocking, ground-only player start, fog behavior, and overlay precedence in the playable game.
