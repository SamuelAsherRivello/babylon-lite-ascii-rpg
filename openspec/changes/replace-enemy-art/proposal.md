# Proposal

## Why

Enemies are already mechanically represented as spiders, but the game renders them as a text glyph while the player uses animated character art. Replacing that glyph with the supplied spider frames makes the first enemy type visibly readable while preserving its deliberately weak combat behavior.

## What Changes

- Render every living spawned enemy as the supplied Spider art, with idle, move, attack, and death animation states.
- Drive those visual states from existing enemy actions without changing enemy AI, health, damage, tick cadence, targeting, spawning, or collision rules.
- On enemy death, immediately remove the enemy from gameplay occupancy and ticking, then retain a non-interactive final death-frame visual in the realm until the player leaves that realm or reloads the browser.
- Keep the Underground `S` enemy spawner unchanged and exclude NPC presentation and behavior from this change.

## Capabilities

### New Capabilities

- `enemy-sprite-presentation`: Animated Spider presentation for living enemies and their realm-scoped inert death visuals.

### Modified Capabilities

- `enemy-system`: Preserve immediate gameplay removal at zero health while replacing the required immediate visual disappearance with the inert death presentation lifecycle.

## Impact

- Affected code: the Babylon Lite game-layer presentation in `ascii-rpg/src/client/game-layer-babylon-lite/index.js`, enemy-system presentation events, and focused enemy/rendering tests.
- Existing Spider frame assets are reused from `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Enemies/Spider/Frames`.
- No dependency, API, enemy-spawner, NPC, or gameplay-balance change is planned.
