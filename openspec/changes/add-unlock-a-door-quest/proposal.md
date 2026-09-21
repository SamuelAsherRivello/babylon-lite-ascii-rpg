# Proposal

## Why

The game now has Underground exploration, collectible keys, and locked-door
interaction, but the quest catalog does not guide the player through that
vertical slice. Adding an ordered quest makes the existing Underground
mechanics discoverable and gives the player a clear completion goal.

## What Changes

- Add an `Unlock A Door` quest definition after the existing quest definitions.
- Give the quest these ordered steps: `Enter Underground Realm`, `Collect Key
  1 of 1`, and `Open a door`.
- Complete the realm step from the generic Underground realm-entry event,
  including when the quest starts while Underground.
- Count one existing key pickup for the key step without creating a second,
  quest-specific key when Underground already provides the key.
- Complete the final step from the generic door-unlocked gameplay event.
- Ensure the Gameplay Settings `Quests` tab renders every quest definition in
  `quest_data.json`, including both the existing and new quests, as selectable
  cards.
- Preserve the existing quest selector, Default Quest persistence, ordered
  quest advancement, immutable bridge snapshot, HUD presentation, lifecycle
  toasts, and runtime-only progress behavior.
- Add focused contract coverage for the definition, event ordering, initial
  Underground state, completion, and regression of the existing Collect Gold
  quest.

## Capabilities

### New Capabilities

None. The quest uses the existing questing capability and existing generic
realm, pickup, and door event boundaries.

### Modified Capabilities

- `questing-system`: Add the `Unlock A Door` definition and its ordered
  Underground, key-collection, and door-unlock progression behavior.

## Impact

- Affects `ascii-rpg/src/runtime/game-layer-babylon-lite/data/quest_data.json`
  and the quest manager's event-facing contract.
- Affects quest-focused Node tests, the Gameplay Settings quest catalog, and
  the existing quest HUD/toast contract through the already-supported snapshot
  and lifecycle paths.
- Requires the Underground realm, key pickup, and door interaction systems to
  continue publishing generic events with stable event types; it does not
  change their ownership or visual behavior.
- No new dependency, persistence model, or public API is expected. Quest
  progress remains runtime-only, while the existing Default Quest selection
  remains persisted.
