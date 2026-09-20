# Design

## Context

See `proposal.md` and the questing-system and minimap-markers spec deltas for
the user-visible contract. The current runtime keeps Babylon Lite authoritative
for generated worlds, player movement, collision, rendering, and minimap
painting. React owns the HTML HUD and communicates through the existing narrow
bridge. The character panel currently renders initial gold from a UI-local
model, while the game layer owns the actual player cell and world characters.

## Goals / Non-Goals

**Goals:**

- Introduce a reusable quest state model without creating a multi-quest UI.
- Represent pickups as world-owned collectible entities with one-shot effects.
- Keep quest progress and character gold authoritative in the game layer.
- Extend the existing bridge with immutable quest and character-gold snapshots.
- Reuse the current minimap marker composition and fog rules while adding quest
  markers and off-screen projection.
- Preserve runtime-only state so browser refresh naturally restarts the example.

**Non-Goals:**

- Quest logs, NPC quest givers, dialogue integration, quest acceptance UI, or
  future activation triggers.
- Save files, localStorage persistence, or restoration of collected pickups.
- Inventory capacity, item stacks, trading, or a general reward system beyond
  the first gold effect.
- Multiple simultaneously tracked quests or multiple visible quest objectives.
- New external packages or a replacement for the current React/game bridge.

## Decisions

### Game layer owns quest and pickup state

Add quest state beside the existing world and player state in the Babylon Lite
runtime. The quest manager owns the one-entry active-quest list, lifecycle
transition, current/target progress, and completion. The active world owns
pickup instances and resolves player-cell collection during the existing
movement flow. React receives snapshots only; it does not calculate progress or
inspect world cells.

Keeping this state in the game layer follows the existing architecture. A
React-owned quest model was rejected because it would duplicate the authoritative
player/world state and make collision-driven updates race the game loop.

### JSON definitions with in-memory state

Store static quest identity, display text, criterion mode, target value, and
matching event type in `quest_data.json`. At runtime, construct an in-memory
active quest from that definition and add mutable state such as lifecycle,
baseline value, current progress, and completion. The first condition is
“collect pickups of type gold.”

Relative criteria capture the relevant character value when the quest becomes
pending and compare against baseline plus target. Absolute criteria compare the
current value directly and can complete immediately when started. The manager
should expose a small update path future definitions can reuse, but it should
not add multi-objective sequencing, failure, or forfeiting behavior in this
change.

### Generic pickup records and one-shot effects

Represent each pickup with a stable runtime ID, pickup type, world cell,
active/collected state, and an effect handler or effect descriptor. Collection
is resolved after a successful player movement onto the pickup cell. The effect
credits gold, marks the pickup inactive, updates quest progress, and schedules
world/minimap/game-HUD rendering updates as one logical transaction.

The pickup is deliberately separate from the quest: a future pickup can exist
without being quest-related, and a future quest can observe another pickup
type. An inventory-first design was rejected because the current requirement is
an immediate character-gold effect, not item storage.

### Generate gold from valid world candidates

After the initial world is available, select three distinct walkable cells in
the initial active realm using the existing seeded random source and candidate
selection conventions. Target approximately 10, 30, and 100 grid cells from
the player start, using a bounded distance tolerance and valid-cell fallback so
obstacles do not prevent generation. The candidates are filtered to avoid the
player start, blocked cells, and other reserved world objects.

Gold uses the existing character HUD glyph `◆` and a gold/yellow palette style
for in-world rendering. Pickup characters must coexist with existing torch,
stair, and player-character restoration behavior when the player moves away.

### Bridge immutable quest snapshots to React

Extend the existing bridge with a quest snapshot value and subscription path.
The snapshot should contain only display/state data such as quest ID, title,
objective, lifecycle state, criterion mode, baseline when relevant, current
progress, target, and completion. The game layer publishes it on initialization,
pickup collection, and completion. The character gold snapshot should likewise
be published when gold changes so the existing character panel no longer
displays a permanently UI-local value.

React renders the quest tracker from the latest snapshot and retains the
completed entry. A dedicated snapshot is preferred over exposing a mutable
quest object or pickup list.

### Add quest markers as a minimap projection layer

Extend the existing minimap marker function with active quest pickup markers.
Quest markers are fog-independent like the existing origin/player markers but
must not contribute terrain or discovery. Inside the minimap viewport they are
painted as solid yellow cells at a quest marker depth below the player. For
targets outside the viewport, calculate the direction from the player to the
pickup in minimap coordinates, intersect that ray with the inset minimap
boundary, and paint a compact yellow directional chevron. If several targets
map to the same boundary region, apply a deterministic small offset while
keeping all three indicators visible.

The minimap renderer remains the only owner of canvas projection and marker
painting. A DOM overlay was rejected because it would introduce a second
coordinate system and complicate the existing minimap zoom and resize behavior.

### Place the quest tracker beside the existing top HUD geometry

Render a React-owned quest tracker beneath the character box using the same
left-side relationship already used by the right-side minimap status. Use a
25px vertical gap, a bold/title-sized `Question: Collect Gold` line, and a
smaller body line indented 5px. Completion applies strike-through to the body
only. The tracker remains visible while the quest is complete.

### Use the existing toast system for quest transitions

On quest start, progress, and completion, publish a toast through the existing
toast state/provider rather than creating a new notification path. Use the
state-specific messages defined in the quest specification. This keeps quest
feedback consistent with other HUD notifications.

## Risks / Trade-offs

- [Risk] The current character model is UI-local while gameplay gold becomes
  game-owned. -> Mitigation: add a narrow gold snapshot and keep the character
  panel’s visual contract unchanged.
- [Risk] Off-screen markers can overlap at a minimap edge. -> Mitigation: use
  deterministic boundary offsets and test three simultaneous targets.
- [Risk] Fog-independent markers could accidentally reveal terrain. -> Mitigation:
  keep quest markers in the marker pass and never alter fog discovery or world
  graphics.
- [Risk] Pickup glyph restoration can conflict with torches or stairs. ->
  Mitigation: centralize character-cell restoration precedence and add movement
  tests for pickup-adjacent cells.
- [Risk] A target distance may have no valid walkable cell because of terrain.
  -> Mitigation: use bounded tolerance and deterministic nearest-valid fallback,
  and test the generated target-distance range.

## Migration Plan

No persistent migration is required. Implement the game-layer state, bridge
snapshots, minimap projection, and React tracker together; start each browser
session with a fresh quest and generated pickups. Rollback is limited to the
scoped quest/pickup, bridge, minimap, character-gold, HUD, and test changes.

## Open Questions

- Future quest activation triggers and whether a quest is realm-specific or
  spans multiple realms remain deferred. This first quest is initial-realm-only;
  quests will not span separate worlds.
