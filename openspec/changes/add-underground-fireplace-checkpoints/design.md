# Design

## Context

See [proposal.md](proposal.md) for motivation. The Babylon Lite game layer owns generated worlds, player position, health, and object effects; `main.jsx` forwards immutable controller snapshots through the bridge to React. The current player lifecycle becomes terminal at zero health, and the death modal reloads the browser. The existing object catalog and active palette validate every rendered glyph.

## Goals / Non-Goals

**Goals:**

- Keep checkpoint authority and all mutable run state in the game layer.
- Provide a deterministic Underground Fireplace placement pass with a palette-visible `🔥` glyph.
- Support both same-run checkpoint revival and an original-seed fresh run without browser-persistent checkpoints.

**Non-Goals:**

- Persist checkpoints, world mutations, or player state through a refresh, tab close, or new browser session.
- Change Overground object generation, introduce a checkpoint settings control, or alter existing toast timing and layout.
- Add backend saves, accounts, telemetry, or dependencies.

## Decisions

### Distribute fireplaces as a configurable Underground object pass

The game layer will select Fireplace cells after Underground civilization generation from the same 10–14 seeded baseline used by traps. The procedural menu will apply the standard object multipliers: Low is one quarter, Med is the baseline, and High is triple. A density-qualified placement seed makes each selected level visibly distinct while remaining repeatable for the same seed and settings.

Attaching a Fireplace to each door cell was rejected because doors are blocking interaction points. Tying the count only to generated doors was rejected because sparse civilization output can make Low, Med, and High visually indistinguishable.

### Model a checkpoint as in-memory realm and cell state

The game layer will hold either no checkpoint or an immutable `{ realm, cell }` snapshot. Entering a persistent Fireplace replaces this snapshot and publishes a narrow checkpoint event for the React toast provider. No bridge store will write it to `localStorage`, and a newly initialized game layer starts with no checkpoint.

Using existing log entries alone was considered, but a dedicated checkpoint event avoids coupling UI feedback to log rendering and preserves the toast's exact message contract.

### Revive through the authoritative lifecycle and occupancy systems

The player lifecycle will gain an explicit revive transition that sets health to 100 and publishes the non-dead state. The game layer will move the player through realm transition, dynamic occupancy, fog, camera, minimap, and render paths before re-enabling input. It will not recreate the world or reset any non-health state for checkpoint recovery.

Reloading the page for checkpoint recovery was rejected because it loses the active world and cannot retain a session-only checkpoint. Directly changing React state was rejected because React is not authoritative for player position or health.

### Rebuild a same-seed run through a session coordinator

The browser entry point will retain the initial random seed for the active run and coordinate disposal of the current game-layer instance with creation and bridge binding of a fresh instance using that seed. `Restart game` will request this coordinator path, resulting in a new initial run without an active checkpoint while preserving unrelated user preference storage.

Putting the seed into browser-persistent checkpoint storage or relying on a normal page reload was rejected because it cannot reliably recreate a generated random run without broadening refresh persistence.

## Risks / Trade-offs

- [Lifecycle resurrection can leave stale input or render state] -> Clear held movement before revive and route relocation through existing realm, occupancy, fog, and render synchronization paths.
- [Fireplace placement can conflict with objects created earlier] -> Build a reservation set from all finalized realm objects and test no overlapping placements.
- [Rebinding a replacement game layer can duplicate bridge subscriptions] -> Centralize controller binding and dispose old subscriptions and game resources before starting the replacement run.
- [A seed recreation changes map identity only if generation inputs differ] -> Reuse the original seed and the active generation settings snapshot for Restart game.

## Migration Plan

1. Add the Fireplace catalog and palette identity, then implement deterministic placement and session checkpoint capture.
2. Add lifecycle revive and game-layer/controller recovery commands, followed by the two-action death modal and session coordinator.
3. Run focused Node tests and the project test/build commands; verify checkpoint recovery and same-seed reset manually in the browser.
4. Rollback is removal of the new Fireplace/checkpoint paths; no persisted checkpoint data or migration cleanup is required.
