# Design

## Context

The current object catalog separates object definitions from their per-realm
placement and behavior wiring. It already supports doors that block a movement
attempt and expose closed/open glyph states, plus Hearts that apply their
existing pickup effect after collision. See proposal.md for motivation and the
delta specs for required behavior.

## Goals / Non-Goals

**Goals:**

- Keep chest selection deterministic for a seed, realm, and generation profile.
- Reuse normal object construction and Heart collection rather than making a
  chest-only pickup path.
- Make the closed/open transition visible in the game, minimap, and procedural
  settings preview.
- Reuse the generic chest-opened event to complete a one-step treasure quest.

**Non-Goals:**

- Adding a new input action, chest inventory, key requirement, animation, or
  save-game migration.
- Exposing reward-table editing in the developer settings UI.
- Adding non-Heart rewards in this change.
- Adding quest-specific chest interaction or a separate quest event channel.

## Decisions

### Extend the object catalog with one chest definition

The catalog will add a `chest` entry with a `◆` closed glyph and a `◇` open
glyph. These existing palette glyphs are visually distinct and avoid a new
font or dependency; both will join the shared map glyph inventory. The reward
table will be catalog data, initially `{ heart: 100 }`, so future weighting can
change without introducing another special-case interaction system.

Using the door's glyphs was rejected because they already communicate an
unlockable passage. Reusing the stairs glyph was rejected because it would
make realm transitions ambiguous.

### Keep closed chests as static blockers

Movement resolution will recognize a closed chest before attempting player
movement, analogous to closed-door handling. The player remains in the origin
cell, the chest changes to open, and its static occupancy remains in place so
the player cannot later enter the spent chest cell. Later cardinal bump
attempts remain blocked without producing another reward. This exactly
implements cardinal bump interaction and keeps the player out of the reward
candidate set at open time.

Making the chest walkable was rejected because it would not match the requested
enemy/wall-like contact behavior.

### Use a radius-limited seeded placement helper

The object placement helper will accept a maximum Euclidean distance from the
realm's player-start cell. Chest placement will reserve cells alongside other
initial objects, use an independent seeded random stream, and retain the
current valid/walkable/unoccupied candidate checks. Each realm evaluates its
own start and own selected Low/Med/High count.

### Create the reward through the normal object path

Opening a chest will choose a weighted catalog reward, find its eight
surrounding cells (including diagonals), filter to empty walkable cells other
than the player's cell, and add the result as a normal object in the same
realm. The initial Heart instance will reuse the existing Heart effect callback.
If there is no eligible surrounding cell, the chest stays open and spent
without a reward rather than retrying or moving the player.

### Define the treasure quest as an event-driven catalog entry

`All of the Treasure` will be a normal static quest definition with exactly
one `Open treasure chest` event criterion. The Object Spawner System already
publishes a generic `chest-opened` fact, so the Quest System can complete this
quest through its existing event observation bridge without learning about
object positions, rewards, or collision behavior.

## Risks / Trade-offs

- [A nearby chest can have no reward cell] -> Open it once without a reward;
  generation tests cover this edge case.
- [New object glyphs can fail palette validation] -> Add both states to the
  shared inventory and validate the catalog against the palette.
- [Preview and runtime placement can drift] -> Share count, radius, reservation,
  and seed inputs for both paths.
- [Future non-Heart rewards may need object-specific effects] -> Keep the
  weighted table data-driven but limit this implementation and its tests to
  the Heart entry.

## Migration Plan

1. A missing persisted Chest setting resolves to `Med`, consistent with the
   existing generation-setting default policy.
2. Regenerate a realm after confirming a Chest setting to apply its count.
3. Roll back by removing the catalog entry and its setting; no server data or
   saved-game migration is required.
