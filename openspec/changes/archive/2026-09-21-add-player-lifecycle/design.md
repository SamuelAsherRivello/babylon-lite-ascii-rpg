# Design

## Context

See proposal.md for motivation. Babylon Lite currently owns `characterHealth`, object collision effects, movement input, and world-time advancement in the game layer. React receives health, gold, quest, log, realm, and time snapshots through `game-bridge.js`; tutorial windows already establish the required modal frame and typography.

The existing repository has unrelated uncommitted work, so implementation must remain limited to the lifecycle change and its mirrored tests/specs.

## Goals / Non-Goals

**Goals:**

- Keep health mutation, death detection, movement gating, and object consequence gating authoritative in Babylon Lite.
- Add one narrow immutable death snapshot channel to the existing bridge.
- Reuse the tutorial window visual contract for the non-dismissible death prompt.
- Make restart a fresh browser game-session initialization with no new dependency.
- Preserve the current health, gold, quest, log, realm, and time snapshot boundaries.

**Non-Goals:**

- Adding an XP progression system or changing the existing character-info bars.
- Persisting death state, run summaries, or a checkpoint across reloads.
- Adding a separate game-over route, server endpoint, or new package.
- Changing realm generation, trap placement, or movement rules except for post-death gating.

## Decisions

### Keep lifecycle authority in Babylon Lite

The game layer will maintain a boolean dead state alongside `characterHealth`. Health consequences will clamp to zero and perform a one-time transition when the value first reaches zero. Movement entry points and collision consequences will check this state before doing work. This preserves the established architecture requirement that React does not own gameplay state.

An alternative would be to infer death in React from `health === 0`, but that would not reliably gate movement, object consequences, or time advancement and would duplicate gameplay rules across layers.

### Add a dedicated death snapshot to the existing bridge

The bridge will expose a boolean death snapshot with getter, subscriber, and sender functions matching the existing health/gold/time patterns. `main.jsx` will wire the game controller's death subscription into that channel. React will consume only the boolean and will not receive player cells or mutable world data.

An alternative would be to encode death as a special health value, but health is already clamped to the valid display range and cannot distinguish an alive zero-health intermediate from a terminal state.

### Reuse tutorial modal structure with a dedicated death component

The UI will add a dedicated death window adjacent to `TutorialWindow`, reusing its `WindowBackdrop`, lighting-window frame, title-bar, body, typography, and action classes. Unlike the tutorial, it will not close on backdrop clicks or gameplay input. The summary values are exact requested copy (`XP: 00`, `Gold: 00`, `Time: 00`) because there is no active XP lifecycle to summarize and the requested death surface defines the initial run-summary contract.

An alternative would be to generalize `TutorialWindow` into a configurable prompt immediately, but that would increase the change surface and risk altering the existing tutorial dismissal behavior.

### Reload for restart

The `Restart Game` action will call the browser page reload path. A reload already reconstructs the game layer and React state, which resets health, gold, time, quest, logs, realm initialization, and the death snapshot without adding a second reset protocol.

An in-memory reset controller was rejected because it would need to reconstruct generated realms, listeners, renderer state, fog, and tutorial state consistently.

### Keep Trap data and effect text aligned

The JSON catalog will define `amount: -25` and the exact `Player lost -25 Health from Trap` log. The runtime trap effect will use the same consequence and text, with focused tests checking both declarative data and live behavior until the catalog consequence is fully centralized.

## Risks / Trade-offs

- [Risk] A death transition during a movement step could otherwise advance time or dispatch movement events after the lethal collision. -> [Mitigation] Check the dead state immediately after object collision and return before time advancement, movement events, discovery, or scheduled rendering.
- [Risk] StrictMode or repeated bridge subscriptions could show stale death UI. -> [Mitigation] Use the existing `useSyncExternalStore` pattern and make the death transition idempotent.
- [Risk] Existing dirty work may overlap the same runtime files. -> [Mitigation] Inspect the current diff before each edit and stage only lifecycle-attributable files during implementation.

## Migration Plan

1. Update the trap catalog/runtime consequence and add the lifecycle bridge/controller subscription.
2. Add game-layer death gating and React death-window rendering with exact copy.
3. Run focused Node tests, the full repository test command, build, diff checks, and OpenSpec validation.
4. Verify the running browser session reaches the prompt, blocks gameplay, and reloads to a fresh run.

Rollback is a normal additive revert of the scoped lifecycle files and OpenSpec change; no persisted data migration or external service change is required.
