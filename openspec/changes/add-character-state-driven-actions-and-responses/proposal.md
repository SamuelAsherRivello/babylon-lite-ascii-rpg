# Proposal

## Why

Movement currently decides combat, digging, door unlocking, and chest opening
through separate target-specific branches. Character equipment and resources
are not yet the source of those actions, so changing player state cannot
change what the player can do.

## What Changes

- Add an ordered capability chain, named the Character-State Contact Resolver,
  that sends normalized contact contexts through equipment slots, resources,
  and intrinsic body responses until one handles the event.
- Add initial equipment to the existing six-cell Character panel: Slot 01
  `🗡` Sword, Slot 02 `🛡` Shield, and Slot 03 `⛏` Pickaxe; retain Gold and
  Keys as resources and Slot 04 as empty.
- Make all player-initiated contact actions cardinal-only. **BREAKING:**
  diagonal movement no longer attacks enemies or spawners and no longer digs
  mountains.
- Route Sword attacks, Pickaxe digging, Keys-resource door unlocking, and
  intrinsic chest opening through the resolver while preserving their current
  respective combat, reward, and world-state outcomes.
- Treat a contact with no capable response as a blocked movement turn: it
  advances one normal movement tick and recovers the normal capped stamina
  amount, but changes neither target nor resources.
- Route incoming enemy attacks through the same responder order: Shield uses
  current Defense mitigation and the body fallback receives full configured
  damage. NPC contact uses the resolver as a non-damaging, currently
  unhandled contact for future extension.
- Preserve one action per input: any handled contact or unsupported blocked
  contact leaves the player in the origin cell; a later input is required to
  enter a newly available destination.

## Capabilities

### New Capabilities
- `character-state-contact-actions`: Defines ordered character-state action
  providers, their normalized contact contexts, initial loadout, and outcomes.

### Modified Capabilities
- `player-grid-movement`: Replace target-specific bump behavior with
  cardinal-only state-driven contact resolution and failed-contact turn rules.
- `character-info`: Render the initial equipment glyphs in Slots 01–03 while
  retaining Gold and Keys resource cells.
- `combat-stats`: Apply Offense only through the Sword and Defense only through
  the Shield response, with the body fallback receiving unmitigated damage.
- `object-spawner-system`: Route closed-door and closed-chest contact behavior
  through character-state providers without changing their states or rewards.
- `enemy-system`: Route player attacks and incoming adjacent enemy attacks
  through the contact resolver while preserving one-action and death behavior.

## Impact

- Affects Babylon Lite movement, collision, combat, mountain, object, enemy,
  NPC-contact integration, character state, the narrow game-to-React bridge,
  Character HUD, and focused Node tests.
- Adds no dependencies, persistence migration, renderer change, or Playwright
  tests.
