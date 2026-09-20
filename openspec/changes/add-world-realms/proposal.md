# Proposal

## Why

The game currently generates one undifferentiated cave world, which leaves no
room for distinct surface and subterranean exploration. A world with paired
Overground and Underground realms makes terrain, fog, lighting, and travel
choices legible while preserving deterministic procedural generation.

## What Changes

- Introduce a world containing exactly two generated realms by default:
  Overground and Underground. The player has one active world and one active
  realm at a time.
- Define hard-coded realm generation profiles whose per-feature occurrence
  probabilities and parameters may differ. Overground defaults to walkable
  grass and non-walkable `M` mountains; Underground defaults to walkable dirt
  and non-walkable `W` walls.
- Generate synchronized, walkable paired `S` stairs in both realms at the
  same grid coordinates, with the same requested count as torches. Entering
  stairs transfers the player to the paired realm coordinate without an
  immediate return transfer.
- Keep fog of war separate for every world and realm; restarting one realm
  clears and regenerates only that realm and its fog.
- Add `Restart Overground` and `Restart Underground` beneath the existing
  upper-left title and time display.
- Replace the single ambient setting with persisted, independently adjustable
  `Ambient Overground` and `Ambient Underground` values. Their defaults are
  `0.9` and `0.1`, respectively; the active realm selects the applied value.
- Exclude day/night behavior from this change.

## Capabilities

### New Capabilities

- `world-realms`: Generated two-realm worlds, active-realm ownership,
  synchronized stairs, realm-scoped fog, and realm restart behavior.

### Modified Capabilities

- `procedural-level-generation`: Generate terrain from explicit realm
  profiles and retain deterministic, paired realm identity.
- `world-generation-passes`: Extend the pass model for realm-specific terrain
  and paired-stair placement.
- `random-torch-placement`: Preserve torch distribution while using its
  requested count as the paired-stair distribution target.
- `palette-grid-lighting`: Replace one level ambient preference with separate
  persisted Overground and Underground ambient preferences.
- `game-layer-architecture`: Make the game layer own active world/realm
  lifecycle and transfer state while the UI uses the existing narrow bridge.

## Impact

- Affects world generation, terrain glyphs, object distribution, player
  transfer, fog/minimap lifecycle, rendering glyph caches, and lighting
  selection in the Babylon Lite game layer.
- Affects the React upper-left HUD, the Lighting window, local-storage keys,
  bridge snapshots, and their focused Node tests.
- Adds no dependencies and makes no day/night, network, or persistence beyond
  existing browser settings changes.
