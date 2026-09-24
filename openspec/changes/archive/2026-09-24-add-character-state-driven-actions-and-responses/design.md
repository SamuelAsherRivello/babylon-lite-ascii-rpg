# Design

## Context

See [proposal.md](proposal.md). Babylon Lite currently resolves player movement
through separate dynamic-combat, mountain, and object-interaction branches.
Enemy attacks separately calculate player damage. React presents immutable game
snapshots and must not own gameplay decisions.

## Goals / Non-Goals

**Goals:**

- Centralize selection of state-driven contact actions without moving gameplay
  authority out of Babylon Lite.
- Make the supplied starting equipment visible and behaviorally meaningful.
- Preserve existing combat, object, time, stamina, experience, logging, and
  renderer ownership once an action has been selected.

**Non-Goals:**

- Equipment collection, equipping UI, persistence, ranged targeting, or new
  NPC gameplay effects.
- Changing default combat values, chest rewards, door key cost, or world
  generation.

## Decisions

### Normalize targets before selecting a capability

The movement and incoming-contact paths will first produce a small contact
context containing the initiator, direction, target cell, normalized target,
and contact kind. Target lookup remains owned by dynamic occupancy, object, and
terrain systems. This avoids treating terrain, objects, and characters as one
storage type while giving character state one consistent input.

Direct target-type branching in movement was rejected because it recreates the
same coupling this change removes. A general range system was rejected for now:
the context can represent it later, but target acquisition remains cardinal and
adjacent.

### Use an ordered capability chain

The game layer will provide a Character-State Contact Resolver. It asks Slot
01, Slot 02, Slot 03, Slot 04, applicable resources, then body to attempt the
contact. A provider returns either unhandled or one resolved outcome; the first
resolved outcome ends dispatch. Initial providers are Sword for enemy/spawner
attacks, Shield for incoming enemy damage, Pickaxe for mountains, Keys for
doors, and body for chests and unshielded incoming damage.

This is an ordered capability-chain form of Chain of Responsibility. A generic
target action registry was rejected because action availability belongs to
character state, not to the target or movement controller.

### Keep outcomes in existing authoritative systems

Providers select an action but delegate its effects to existing combat,
mountain, object, enemy, time, stamina, experience, health, logging, and
render scheduling paths. Thus Sword and Pickaxe retain existing combat-turn
effects, Shield delegates to current Defense calculation, and body fallback
uses the configured incoming damage without Defense mitigation.

Letting equipment mutate world terrain or health directly was rejected because
it would duplicate authoritative system behavior and bridge contracts.

### Treat unhandled contact as a normal stationary movement turn

When no provider handles a cardinal contact target, the player does not move
and the target does not change, but time advances through the normal movement
cause so capped stamina recovery occurs. Handled contacts use their own action
cause and never additionally enter the target cell. This preserves the user's
one-action-per-turn rule.

### Publish equipment state through the existing narrow bridge

The game layer owns the default slots and publishes an immutable inventory
snapshot. React renders the three supplied text glyphs in Slots 01–03 and the
empty Slot 04 while retaining Gold and Keys as resource cells. React does not
decide capability precedence or action outcomes.

## Risks / Trade-offs

- [Concurrent changes already alter movement and object code] → Rebase the
  implementation plan on the current checkout, preserve unrelated edits, and
  keep focused tests scoped to this change.
- [A provider could accidentally resolve more than one effect] → Use a single
  resolved/unhandled outcome and assert exactly one selected action per input.
- [Changing failed bumps to advance time changes enemy timing] → Cover
  unsupported enemy, mountain, and door contacts with time and stamina tests.
- [Unicode glyph support varies by font] → Reuse the project palette and
  glyph-validation path, with text-only HUD rendering.

## Migration Plan

1. Add the authoritative default equipment state and immutable bridge snapshot.
2. Introduce target normalization and the capability chain alongside focused
   system tests.
3. Move each existing interaction into its selected provider while retaining
   existing effect systems and update the Character panel.
4. Verify focused Node tests, repository tests, build, strict OpenSpec
   validation, and a manual seeded browser run.
5. Roll back by removing the resolver and inventory snapshot changes; no saved
   state migration is required because this change introduces no persistence.
