# Proposal

## Why

Players need a small, visible exploration reward that introduces a persistent
world interaction while reusing the game's existing pickup behavior. Treasure
chests provide that reward and make the procedural-object density controls
meaningful for a new object type.

## What Changes

- Add level-spawned treasure chests with distinct closed and open glyph states.
- Place Low, Med, and High chest counts of one, two, and three respectively in
  each realm, on valid walkable cells no farther than 50 grid cells from that
  realm's player start.
- Add a Chest density row to Object & NPC Distribution and include chests in its
  preview.
- Open a chest immediately when the player attempts a cardinal move into its
  closed cell; it blocks that move, becomes visibly spent, remains permanently
  blocking, and cannot be opened again.
- Select rewards through a weighted subset of catalog object types. The initial
  table contains Heart at 100 percent.
- Spawn the Heart on an empty walkable cell among the chest's eight surrounding
  cells, excluding the player cell, using normal Heart pickup behavior.
- Add an `All of the Treasure` quest with one `Open treasure chest` task that
  completes when the existing generic chest-opened gameplay event is observed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `object-spawner-system`: Define chest catalog, placement, blocking
  interaction, spent state, and weighted Heart reward spawning.
- `procedural-generation-settings`: Add the Chest Low/Med/High control and
  preview markers to Object & NPC Distribution.
- `questing-system`: Add the single-task All of the Treasure quest to the
  existing quest catalog and progression flow.

## Impact

- Affects the object catalog, palette/glyph inventory, seeded object placement,
  collision handling, generation profile, procedural-settings UI and preview,
  quest catalog, and focused Node tests.
- Does not add dependencies, APIs, persistence migrations, or changes to normal
  Heart collection behavior.
