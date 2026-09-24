# Design

## Context

See `proposal.md` for motivation. The game already owns time in a shared Time System and maintains per-realm, single-cell dynamic occupancy. Enemy spawning and movement are registered tickables in Underground; palette entries and procedural pass settings are client-owned persisted data.

## Goals / Non-Goals

**Goals:**

- Add deterministic Overground NPC-spawner placements with a persistent, clearly labeled NPC Low/Med/High Procedural-menu control: 4/8/12 placements respectively, including one within 50 cardinal cells of the player start at every setting.
- Keep NPC authority in the Babylon Lite game layer while the React layer continues to render bridge state only.
- Reuse the existing world-time broadcasts and occupancy boundary for predictable, testable NPC motion.

**Non-Goals:**

- No NPC combat, health, targeting, dialogue, inventory, quests, sound, or player interaction.
- No independent timer, new time producer, or change to existing tick semantics.
- No Underground NPCs, NPC avoidance behavior, or new external dependency.

## Decisions

### Separate friendly systems, shared occupancy

Create NPC and NPC-spawner systems rather than extending enemy systems with mode flags. They will use each realm's existing dynamic occupancy and static walkability predicates, which preserves the one-occupant invariant while preventing friendly behavior from inheriting enemy damage or targeting.

Alternative considered: reuse enemy types with a friendly flag. Rejected because combat dispatch, health, logging, and target navigation are enemy-specific and would introduce conditional behavior across the existing combat path.

### Seeded placement and time-local randomness

Use the resolved Overground seed plus stable spawner/NPC identities for placement, nearby spawn-cell selection, and a single birth-time 15-or-20 destination selection. Select one qualifying placement within 50 cardinal cells of the player start, then choose the remaining seven from the wider valid Overground candidates. Each birth-time search records the full cardinal route; dynamic occupancy blocks only the current move, so a temporarily blocked NPC waits without recomputing a route.

Alternative considered: Euclidean destination radii and unconstrained steps. Rejected because terrain and water can make those targets unreachable.

### Immediate one-time spawn

World setup creates one NPC near each accepted NPC spawner. The spawner does not register a time tickable and never attempts another spawn. A failed initial placement leaves that spawner empty, preserving the density-selected population ceiling without a backlog.

### Patrol state preserves a return leg

Each NPC record retains immutable home data, one birth-time destination, the outbound route, and a route index. Each received tick attempts exactly the next stored cardinal step. On arrival it consumes the same route in reverse. It performs no path search or random draw after birth.

### Per-surface fog and region culling

Every graphic is eligible only when its cell is inside the rendering surface's source region and has positive fog visibility in that surface's realm. The game view uses its camera region, the minimap uses its crop, and the developer map view uses its full-map source only while open. This rule is applied before glyph-cache collection, sprite submission, canvas drawing, GPU-light samples, health bars, floating text, and markers.

### Palette catalog extends existing inventory

Register `☺` through the supported text-symbol list and palette data so the Ascii Settings color editor owns its styling. The Procedural Level Generation menu exposes the `NPC` pass alongside existing object passes with clear Low, Med, and High choices. It persists through the existing generation-settings store, defaults to Med, and displays the selected density clearly.

The Procedural map preview derives the same deterministic NPC-spawner cells from the draft density profile and overlays its existing large outlined marker treatment in green. This makes the NPC pass as visually discoverable as hearts, traps, and torches without mutating the preview world.

## Risks / Trade-offs

- [High density can congest routes] → The one-NPC-per-spawner ceiling prevents unbounded growth; focused tests will cover every selected cap and blocked initial placement.
- [A 20-cell route may not exist near a spawner] → Destination selection considers only reachable cells at allowed cardinal distances and leaves the NPC at home when no candidate exists.
- [Palette migration can omit the NPC glyph] → The palette loader will backfill `☺` with the standard white editable entry.
- [Tickable registration order affects visible movement] → Reuse the existing deterministic registration order and test observations against it rather than adding a separate scheduler.

## Migration Plan

1. Extend default generation and palette catalogs; existing browser settings load through their established validation/backfill paths.
2. Release as an additive client-side feature; newly generated worlds receive 4, 8, or 12 NPC spawners and at most the matching number of initial NPCs according to their persisted NPC setting.
3. Roll back by removing the NPC generation pass and systems in a subsequent change; no server data migration is required.
