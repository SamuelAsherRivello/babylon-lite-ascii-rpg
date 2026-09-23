# Proposal

## Why

Overground mountains currently stop movement without offering an interaction,
which can leave reachable parts of the map behind an impassable barrier. Letting
the player dig through interior mountains turns those collisions into a
predictable combat-like action while preserving the generated world boundary.

## What Changes

- Give each interior Overground mountain 100 health and let movement attempts
  into it deal the player's existing Offense-scaled attack damage.
- Resolve each dig as a full attack turn: spend stamina, advance world time by
  one tick, and award attack experience. The player stays in place for each hit.
- Show each hit in the log and as visible floating damage text and a temporary
  health bar. At zero health, replace the mountain with walkable Overground
  grass; the player may enter on a later movement attempt.
- Keep the outermost Overground mountain border indestructible and non-walkable,
  using the existing `▒` wall glyph to distinguish it from diggable `△`
  mountains.
- Leave Underground walls and other blocked terrain behavior unchanged.

## Capabilities

### New Capabilities

- `diggable-mountains`: Defines mountain durability, digging turns, destruction,
  boundary protection, and the player-visible feedback for digging.

### Modified Capabilities

- `combat-stats`: Apply existing Offense-scaled player damage to diggable
  mountains.
- `floating-text`: Include health deltas from visible diggable mountains.
- `in-world-health-bars`: Show transient health bars for damaged mountains.
- `player-grid-movement`: Resolve movement attempts into interior mountains as
  attacks and preserve the separate post-destruction movement attempt.
- `world-realms`: Distinguish the indestructible Overground border glyph from
  diggable interior mountains.

## Impact

- Affected gameplay: Babylon Lite movement/collision, terrain state and
  rendering, combat turn resolution, log, floating-text, and health-bar
  presentation. React and the bridge remain outside mutable world state.
- Affected checks: focused Node tests for combat, movement, terrain, floating
  text, and health bars; the repository's `npm test` and `npm run build` checks.
- No new runtime dependency or persistent save format is required. The OpenSpec
  CLI is installed as a project-local development dependency for this workflow.
