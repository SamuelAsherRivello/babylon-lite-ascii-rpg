# Design

## Context

The game layer in `ascii-rpg/src/game-layer.js` owns the authoritative player
cell and all keyboard movement, including held-key repetition. React renders
the corner UI in `ascii-rpg/src/App.jsx`, while `game-bridge.js` currently
provides a deliberately narrow game-to-UI bridge for palette updates. See
`proposal.md` and the delta specs for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Keep world time authoritative in the game client and reset it with a new
  game instance.
- Advance time at the same successful-movement boundary that changes the
  player cell.
- Deliver time updates to React without moving gameplay state into the UI.
- Preserve the existing corner layout and make the counter accessible to
  future gameplay consumers.

**Non-Goals:**

- No persistence, pause system, real-time clock, enemy turns, scheduling, or
  additional time-consuming actions.
- No new dependency or replacement of the existing React/game-layer boundary.

## Decisions

- **Game-layer authority:** Store the numeric counter beside the authoritative
  player state in `startGameLayer`; this prevents UI rendering or blocked input
  from advancing time.
- **Successful-step hook:** Increment only after `moveWorldCell` returns a
  different valid cell and the world character is updated. This naturally
  covers cardinal, diagonal, and held-repeat movement with one rule.
- **Bridge subscription:** Extend the existing game bridge with a time snapshot
  and subscription path. React can consume that path with its existing
  `useSyncExternalStore` pattern, while future systems can subscribe without
  depending on React.
- **Formatting at the display boundary:** Keep time numeric internally and
  format it as a minimum width of five digits for the `Time:` label. Values
  above `99999` remain fully visible rather than wrapping or truncating.

Alternatives considered: deriving time from player coordinates would fail when
the player reverses direction; counting keyboard events would count blocked
attempts; placing the counter only in React would make future non-UI systems
depend on presentation state.

## Risks / Trade-offs

- **[Risk]** A game-layer restart resets time while React retains an old
  snapshot. -> Initialize and publish the new-game value before or as the game
  controller is registered, and clear the snapshot during disposal.
- **[Risk]** The bridge can outlive a disposed game controller. -> Make update
  and subscription cleanup explicit and keep disposal idempotent like the
  existing controller contract.
- **[Trade-off]** A small bridge API extension couples future consumers to the
  snapshot shape. -> Expose a minimal numeric time value and avoid UI-specific
  formatting in the bridge.

## Migration Plan

No persisted data or external API is being migrated. Add the time state and
bridge contract, update the corner UI, then verify focused movement/time tests,
the existing test suite, the production build, and manual browser behavior.
