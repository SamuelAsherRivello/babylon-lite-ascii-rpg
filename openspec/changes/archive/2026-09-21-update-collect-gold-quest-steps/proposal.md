# Proposal

## Why

The Collect Gold quest currently becomes active as a single gold-counting objective and spawns its gold immediately, even when the player starts in the Underground Realm. This makes the quest ignore the intended Overground prerequisite and couples quest correctness to the initial realm instead of to observable gameplay events.

## What Changes

- Convert Collect Gold into two ordered steps: `Enter Overground Realm`, followed by `Collect Gold 0 of 3`.
- Complete the realm step immediately when the quest starts in Overground; otherwise keep it pending until a generic realm-entry event reports Overground.
- Start or request the three quest gold pickups only after the Overground step is complete.
- Dispatch a generic realm-entry event from the realm transition boundary, including the entered realm name.
- Keep gold pickup events owned by the Object Spawner System and make the Quest System observe them without adding quest logic to object spawning or realm management.
- Publish the ordered quest-step state through the existing narrow bridge and render both steps in the quest HUD.
- Preserve runtime-only quest state and existing one-gold-per-pickup behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `questing-system`: Collect Gold gains an Overground prerequisite, ordered step state, event-driven activation, and a two-step HUD snapshot.
- `world-realms`: Realm entry becomes an observable generic event emitted whenever the active realm changes, including the initial active realm needed by event-driven consumers.

## Impact

- Affected runtime areas include `quest-system.js`, `quest_data.json`, the Babylon Lite realm-transition boundary, the Object Spawner System integration, the bridge snapshot shape, and the React quest tracker.
- Focused quest, realm-event, object-spawner, bridge, and HUD tests will require updates or additions.
- No new dependencies, persistence, public network behavior, or changes to the generic pickup effect contract are required.
