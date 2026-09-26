# Proposal

## Why

Keyboard and swipe movement require players to steer every grid step, even
when the intended nearby destination is clear but a local obstacle requires a
detour. Mouse input should provide a clearly bounded auto-navigation option
without replacing the game's manual movement controls or allowing arbitrary
long-distance travel.

## What Changes

- Add a canvas-hover destination reticle made of four semi-transparent corners:
  white on a directly valid cell and red on the exact unavailable pointer cell.
- Add left-button held auto-walk and right-button held auto-sprint from the
  current player cell toward the reticle destination.
- Resolve pointer targets through cardinal route reachability, reject routes
  longer than 50 movement steps, and reject both mouse buttons when the exact
  pointed cell is unavailable.
- Treat terrain, active static objects, buildings, and dynamic occupants as
  auto-navigation blockers; reroute while the pointer is held when a valid
  bounded route changes.
- Preserve keyboard, WASD, and swipe movement as manual navigation and retain
  their existing collision/contact behavior.

## Capabilities

### New Capabilities

- `mouse-auto-navigation`: bounded mouse-target reticle, automatic walking,
  automatic sprinting, invalid-target rejection, and rerouting behavior.

### Modified Capabilities

<!-- None. The existing manual-input and route-query contracts remain intact. -->

## Impact

The Babylon Lite game layer's pointer input, held-movement state, route query
use, occupancy-aware destination selection, sprite overlay rendering, and
focused Node tests change. No dependency, React world-data access, movement
rule replacement, release, or deployment change is required.
