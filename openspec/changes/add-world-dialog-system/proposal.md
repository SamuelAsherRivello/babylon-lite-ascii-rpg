# Proposal

## Why

The game currently has world entities that can be entered or collided with, but it has no shared way to present readable environmental messages or player choices. A dialog capability will make signs and friendly NPCs understandable and interactive while preserving the existing separation between Babylon Lite gameplay state and React UI presentation.

## What Changes

- Add a shared dialog contract for world-triggered messages and choices.
- Add modal dialogs that block gameplay with a dark backdrop, use the existing window system, and have no close button.
- Add non-modal floating dialogs that remain over the action without blocking the player or nearest enemy.
- Support mouse/touch selection and keyboard navigation with Up/Down selection and Right acceptance.
- Add a stateless, rereadable Welcome Sign generation layer owned by civilization. It uses the palette-backed `⚑` glyph and places one sign within 50 grid units of every individual stair, including both stairs in each pair, with deterministic text such as `Welcome to town 352`.
- Add an NPC party-recruitment dialog with `Yes` and `No` choices.
- Store recruitment state on the NPC runtime entity; accepting marks the NPC recruited, makes it passable, and does not add party gameplay in this release.
- Keep declined or unresolved NPCs available for repeated conversations.
- Keep dialog state client-only for the initial release; browser refresh creates a fresh generated world state.
- Run sign generation after civilization stairs so every sign has a stair association and valid reserved placement.

## Capabilities

### New Capabilities

- `world-dialog-system`: Provides world-triggered modal and floating dialogs, input handling, sign messaging, and NPC recruitment state transitions.

### Modified Capabilities

None. The new dialog capability consumes existing object and NPC collision events without changing their existing requirement contracts.

## Impact

- Affected systems include the Babylon Lite NPC/object and movement layers, the narrow game/React bridge, React dialog/window presentation, palette-backed world glyph data, and focused unit/integration tests.
- No new runtime dependencies, renderer replacement, server state, or party-management system are required.
- The implementation must preserve player-driven ticks and existing occupancy authority; dialog presentation must not create a new game tick source or own mutable gameplay state.
