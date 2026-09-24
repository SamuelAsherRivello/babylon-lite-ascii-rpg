# Design

## Context

The game layer owns world cells, occupancy, collision, NPC runtime state, and player-driven time. The React UI layer owns windows and HTML interaction state, while the bridge is the existing boundary between them. Existing world collisions already distinguish handled interactions from movement, and existing floating world text establishes a presentation-only overlay pattern.

## Goals / Non-Goals

**Goals:**

- Add one event-driven dialog contract usable by both signs and NPCs.
- Keep gameplay state authoritative in the Babylon Lite layer.
- Reuse the existing React window system for modal dialogs.
- Provide a world overlay path for non-modal messages.
- Preserve cardinal collision semantics and player-driven ticks.

**Non-Goals:**

- No general conversation tree editor or branching script language.
- No party movement, party roster UI, combat companion behavior, or persistence across refresh.
- No new renderer or runtime dependency.
- No Playwright test files by default.

## Decisions

### One narrow dialog bridge

The game layer will emit immutable dialog snapshots or requests containing the dialog identity, presentation mode, speaker/text, choices, and world anchor. React will render the snapshot and emit a selected choice through the existing bridge. React will not inspect NPC objects, occupancy, world cells, or recruitment state.

### Modal and floating are presentation modes

`isModal=true` selects the existing window system, backdrop, input lock, and no-close-button behavior. `isModal=false` selects a game-view overlay anchored to the triggering world cell, with placement scoring that avoids the player and nearest enemy where possible. The two modes share the same choice and result contract.

### Recruitment is an NPC state transition

The NPC runtime entity will carry its recruitment state. The Yes result updates the entity and occupancy behavior in the game layer; the No result leaves it unchanged. This avoids a second registry and prevents React from becoming the authority for world progression.

### Deterministic sign text

The Welcome Sign's town number will be derived once from the world seed and stable sign identity, then stored with the generated sign instance. The initial implementation may use a fixed bounded numeric range; the exact range is an implementation detail unless later exposed as a gameplay requirement.

### Civilization sign generation order

Civilization generation will register a `civilization-signs` layer after `civilization-stairs`. It will iterate every individual stair in each realm, reserve existing object and terrain cells, and choose a valid walkable sign cell within 50 grid units using a stair- and realm-derived seed namespace. The sign uses `⚑`, is associated with its stair identity, and is added to the normal object authority.

### Directional choice navigation

The dialog controller will maintain the highlighted choice index. Up and Down change that index, Right accepts it, and pointer/touch activation accepts the clicked choice. A one-choice message automatically highlights its only action. Enter and Escape are intentionally not required for v1 because the requested primary controls are pointer, Up/Down, and Right.

## Risks / Trade-offs

- [Risk] A floating overlay can overlap important world content in a crowded scene → score candidate placements around the anchor and prefer positions that avoid the player and nearest enemy; retain a readable fallback when no candidate is clear.
- [Risk] Input can be consumed by both the game controller and dialog UI → give active modal dialogs first refusal of keyboard input and return handled status through the bridge.
- [Risk] NPC patrol movement can conflict with interaction state → keep recruitment changes in occupancy/gameplay state and preserve the existing player-driven tick model; do not add a dialog timer or autonomous dialog tick.
- [Risk] Existing unrelated worktree changes may overlap integration files → inspect and preserve those changes, stage only dialog-related files during implementation.
