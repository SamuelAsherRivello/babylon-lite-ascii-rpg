# Proposal

## Why

The exploration minimap currently conveys fog-of-war and renders the player as ordinary world content with no marker contract. Players need stable, meaningful landmarks that distinguish their origin, current position, and torches they have actually discovered without revealing fogged terrain.

## What Changes

- Replace the existing player-colored minimap appearance with a minimap-marker layer rendered above the fog-masked world-content pixels.
- Add fog-independent markers: a green dot at the generated world's immutable player-start cell and a yellow dot at the player's current cell.
- Add fog-dependent torch markers: render each generated torch as a white dot only when its exact world cell is discovered.
- Draw the fixed minimap stack at depths 0 through 40: black base (0), fog-masked world content (10), green start (20), discovered white torches (30), then yellow player (40), so the player remains visible over every marker.
- Preserve the existing fog-of-war lifecycle, downsampled map content, minimap visibility preference, and non-interactive responsive canvas.

## Capabilities

### New Capabilities

- `minimap-markers`: Defines colored minimap landmark markers and their fog visibility rules.

### Modified Capabilities

- None.

## Impact

- Affects the Babylon Lite minimap renderer and game-layer draw order, using existing `world.playerStart`, `world.torches`, `playerCell`, and fog discovery state.
- Adds focused Node coverage for marker coordinate mapping, colors, and per-marker fog eligibility, plus a game-layer contract check for the replacement overlay.
- Adds no dependencies, persisted settings, world-generation changes, or React/bridge API changes.
