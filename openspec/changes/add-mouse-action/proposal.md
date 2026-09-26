# Proposal

## Why

Mouse auto-navigation currently rejects every non-walkable or occupied cell,
even when the player could use an existing action against it. Its input path
also bypasses the ordinary contact resolver, risking different outcomes for
the same player intent from WASD, arrow keys, swipes, and mouse holds.

## What Changes

- Classify each exact mouse target as walkable travel, actionable contact, or
  denied: white reticle for travel, green for an available action, and red only
  when neither is possible.
- Allow held primary-button walking and secondary-button sprinting to route to
  a cardinally adjacent cell for an actionable target, then repeat ordinary
  cardinal action attempts while held.
- Treat an action as available only when the existing contact system can handle
  the exact target using the player's current capabilities and state; interior
  Overground mountains require a Pickaxe, while Underground walls remain
  denied.
- Consolidate keyboard, WASD, swipe, and mouse-generated cardinal directions
  through one movement-and-contact resolver. Mouse input selects and plans a
  target; it does not implement its own attack, dig, or object interaction.
- Keep Space as the distinct bomb action input, routed through the same central
  player-action boundary using the current cardinal heading.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `mouse-auto-navigation`: Expand bounded exact-cell mouse navigation to
  classify and reach existing actionable targets, with green action reticles.
- `player-grid-movement`: Require all movement inputs to resolve movement and
  contact through one shared player-action path.

## Impact

The Babylon Lite game layer's input intent resolution, mouse route helper,
contact-target classification, reticle styling, and focused Node tests change.
The existing character contact, combat, mountain, object, and bomb systems are
reused; no React world-data bridge, dependency, renderer replacement, release,
or deployment change is required.
