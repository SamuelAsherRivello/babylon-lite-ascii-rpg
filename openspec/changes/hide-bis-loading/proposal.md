# Proposal

## Why

The game currently starts the BIS trophy-ownership check only after a level completes, placing external-service latency on the completion path the player is waiting to see. Starting the same check when a game session starts lets the completion experience use an already-resolved result whenever the service responds in time.

## What Changes

- Add a game-session trophy eligibility preload that begins asynchronously during startup and does not delay startup, rendering, input, or world generation.
- Retain the resolved ownership result for the active session and use it when level completion evaluates trophy eligibility.
- Preserve correct completion behavior when the preload is pending or cannot complete: completion may await or retry the required ownership result rather than treating an unknown result as ownership.
- Scope preload state and requests to the active game session so stale responses cannot affect a restarted or replaced session.

## Capabilities

### New Capabilities

- `bis-trophy-eligibility`: Background loading and session-scoped use of BIS trophy ownership eligibility for level completion.

### Modified Capabilities

- None.

## Impact

- Affected game startup and level-completion orchestration, plus the BIS trophy-ownership service boundary and its focused tests.
- No new user-facing setting, dependency, or persistent gameplay state is proposed.
