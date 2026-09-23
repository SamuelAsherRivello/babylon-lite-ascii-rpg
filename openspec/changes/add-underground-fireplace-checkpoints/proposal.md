# Proposal

## Why

Underground exploration currently has no recovery point: a lethal mistake ends the browser session and loses the run. Fireplaces give players a discoverable, temporary checkpoint without turning a browser refresh into a persistent save system.

## What Changes

- Add persistent, non-pickup `🔥` Fireplace objects to Underground realms, with a seeded Low/Med/High distribution comparable to the existing trap distribution and a palette-defined visual identity.
- Save the latest reached Fireplace as an in-memory checkpoint and enqueue the exact toast `You saved a checkpoint.` each time the player enters one.
- Expand the death modal with `Restart from checkpoint` and `Restart game` actions.
- Make checkpoint restart available only after a Fireplace is reached, then revive the player at full health in the latest checkpoint cell while retaining current world state, inventory, quest state, and time.
- Make Restart game rebuild the original seeded run at its initial state and clear the in-memory checkpoint rather than reloading the browser page.
- Keep checkpoint data out of `localStorage` and all other browser persistence, so a page refresh begins without a checkpoint.

## Capabilities

### New Capabilities
- `fireplace-checkpoints`: Defines Underground fireplace placement, session-only checkpoint capture, player feedback, and checkpoint recovery.

### Modified Capabilities
- `object-spawner-system`: Add Fireplace catalog, palette, deterministic placement, and persistent collision behavior.
- `player-lifecycle`: Replace the single reload-only recovery action with explicit checkpoint and same-seed fresh-run recovery actions.

## Impact

- Affects the object catalog and palette data, seeded Underground object placement, game-layer session state, player lifecycle, controller/bridge events, React death modal, and focused Node tests.
- No new dependency, server API, account, telemetry, or browser-persistent game-state storage is introduced.
