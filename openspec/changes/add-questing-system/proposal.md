# Proposal

## Why

The game currently has no objective system that tells the player what to do,
tracks progress, or connects collectible world objects to character rewards.
Adding a small but extensible quest and pickup foundation now establishes the
gameplay contract for future objectives while giving the current exploration
loop a clear goal.

## What Changes

- Add a generic quest manager whose active-quest list contains only the current
  quest for now.
- Add quest lifecycle states for `unstarted`, `pending`, and `complete`, with
  progress updates that can drive HUD and minimap presentation.
- Start the initial `Collect Gold` quest automatically when a new game instance
  initializes.
- Add generic world pickups with an identity, position, collectible state, and
  gameplay effect; implement gold as the first pickup type.
- Spawn three gold pickups near the agreed long-distance placement target from
  the player start, using the existing gold glyph (`◆`) for their in-world
  appearance.
- Remove each collected pickup permanently for the current game instance and
  credit the character with `+1` gold.
- Publish a narrow immutable quest snapshot from Babylon Lite to React for HUD
  rendering; React must not inspect pickup coordinates or mutable world state.
- Render the quest tracker 25px below the character box with:
  `Question: Collect Gold` and an indented, smaller `Collect Gold 0 of 3`
  body line.
- Strike through the quest body at `3 of 3` while keeping the completed quest
  visible in the HUD.
- Extend minimap markers to show all active gold pickups as yellow squares when
  inside the minimap viewport and yellow edge indicators when off-screen.
- Keep quest markers independent of fog discovery without revealing additional
  terrain.
- Reset the quest, pickups, and runtime gold state on browser refresh; future
  quest activation triggers remain out of scope.

## Capabilities

### New Capabilities

- `questing-system`: Defines quest lifecycle, active-quest tracking, generic
  collectible pickups, the initial Collect Gold quest, quest progress snapshots,
  and the quest HUD contract.

### Modified Capabilities

- `minimap-markers`: Extends marker composition with quest pickup markers and
  off-screen edge indicators while preserving fog behavior and player-marker
  precedence.

## Impact

- Affected Babylon Lite systems: world generation, player movement/collision,
  pickup and quest state, minimap rendering, and the runtime controller.
- Affected bridge APIs: one immutable quest snapshot and subscription path from
  the game layer to React.
- Affected React UI: the character-adjacent quest tracker and completion styling.
- Affected character data: runtime gold must update from collected pickups rather
  than remaining a UI-only initial value.
- Affected tests: quest state, pickup collection/effects, minimap marker
  projection/composition, bridge snapshots, and HUD rendering checks.
- No new dependencies, save-file format, persistent storage, or browser-refresh
  migration is required.
- Unresolved detail: the exact meaning of “100 units” for generated gold
  placement (grid-cell distance versus another world-space unit) must be fixed
  in design/tasks before implementation.
