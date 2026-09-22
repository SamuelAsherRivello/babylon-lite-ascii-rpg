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
- Define static quest metadata and criteria in `quest_data.json`, while keeping
  the active quest's mutable state in memory.
- Support relative criteria that capture a baseline when a quest starts and
  absolute criteria that evaluate the current character value directly.
- Start the initial `Collect Gold` quest automatically when a new game instance
  initializes.
- Add generic world pickups with an identity, position, collectible state, and
  gameplay effect; implement gold as the first pickup type.
- Spawn three gold pickups in the initial active realm at random valid positions
  targeted approximately 10, 30, and 100 grid cells from the player start,
  using the existing gold glyph (`◆`) for their in-world appearance.
- Remove each collected pickup permanently for the current game instance and
  credit the character with `+1` gold.
- Have pickups emit collection events that quest criteria can observe without
  coupling pickup effects directly to the quest manager.
- Publish a narrow immutable quest snapshot from Babylon Lite to React for HUD
  rendering; React must not inspect pickup coordinates or mutable world state.
- Render the quest tracker 25px below the character box with:
  `Question: Collect Gold` and an indented, smaller `Collect Gold 0 of 3`
  body line.
- Strike through the quest body at `3 of 3` while keeping the completed quest
  visible in the HUD.
- Show state-specific toasts: `Quest Started: Collect Gold.`,
  `Quest Progress: Collect Gold 1 of 3.`, and
  `Quest Completed: Collect Gold.`.
- Extend minimap markers to show all active gold pickups as yellow squares when
  inside the minimap viewport and yellow edge indicators when off-screen.
- Keep quest markers independent of fog discovery without revealing additional
  terrain.
- Reset the quest, pickups, and client gold state on browser refresh; future
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
  pickup and quest state, minimap rendering, and the client controller.
- Affected bridge APIs: one immutable quest snapshot and subscription path from
  the game layer to React.
- Affected React UI: the character-adjacent quest tracker and completion styling.
- Affected character data: client gold must update from collected pickups rather
  than remaining a UI-only initial value.
- Affected tests: quest state, pickup collection/effects, minimap marker
  projection/composition, bridge snapshots, and HUD rendering checks.
- No new dependencies, save-file format, persistent storage, or browser-refresh
  migration is required.
- Future quests may be realm-specific or span multiple realms, but this first
  quest is limited to the initial active realm and quests will not span separate
  worlds.
