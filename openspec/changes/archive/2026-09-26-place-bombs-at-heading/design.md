# Design

## Context

See [proposal.md](proposal.md). The Babylon Lite game session currently owns player position and horizontal render-facing state, while the player-grid module owns movement-direction helpers. SPACE already routes to the bomb inventory capability, and the bomb system already supplies a glyph with higher render priority than characters before supplying its existing blast glyph.

## Goals / Non-Goals

**Goals:**

- Make a cardinal heading location reusable without coupling future systems to the bomb system.
- Route SPACE through an explicit set-bomb input action while retaining the existing inventory capability resolution and one-shot guard.
- Change only planted-bomb rendering from `●` to `💣` and retain the existing `✶` blast rendering.

**Non-Goals:**

- Changing bomb inventory count, fuse duration, blast radius, damage, chain reactions, or movement/occupancy semantics.
- Adding aiming controls, persistent facing, a new UI control, or a new rendering dependency.
- Making diagonal movement define a diagonal bomb target.

## Decisions

### Represent heading as a cardinal direction and derive its location from the current player cell

The game session will retain the most recent successful cardinal direction, with no initial direction. A player-grid helper will derive a target cell from that direction and the current player cell whenever a caller asks for the heading location.

This keeps the location in front of the current player after later diagonal movement and makes the calculation reusable by future systems. Storing an absolute target cell was rejected because a later move would leave that cell behind the player.

### Update heading only when movement commits

The successful movement commit paths, including automatic cardinal travel that uses the same player movement state, will update heading after occupancy accepts the new cell. Failed movement, combat/contact interactions, and diagonal movement leave the last cardinal direction intact.

This prevents a blocked input or a diagonal vector from producing an invalid target and aligns the target with authoritative player state. Inferring heading from held keys was rejected because key state may be stale, repeated, or diagonal when SPACE is pressed.

### Keep set-bomb input separate from the bomb inventory capability

The input map will identify Space as the semantic set-bomb action; the game session will resolve that action by requesting the existing `bomb` inventory capability with the derived heading location. The existing lock, repeat, world-time, and inventory-count guards remain on this route.

This preserves the established action-resolution boundary while making the user input intent explicit. Calling the bomb system directly from keyboard handling was rejected because it would bypass inventory behavior.

### Reuse the dynamic glyph overlay order

The bomb system's planted glyph constant will become `💣`. Its existing blast lookup remains first, so an active explosion naturally replaces the planted bomb with `✶` without a second rendering path.

This keeps glyph priority and explosion timing unchanged. A separate transient visual entity was rejected because the bomb system already represents both states.

## Risks / Trade-offs

- Emoji glyph metrics vary by selected font → reuse the existing glyph rasterization/cache path and verify a live seeded browser session.
- A heading target can contain an actor or blocked terrain → preserve the bomb system's existing non-exclusive occupancy rule; only duplicate bombs prevent planting.
- A session without cardinal movement has no heading → reject placement without consuming inventory or advancing time, rather than inventing a default direction.

## Migration Plan

1. Add the pure heading derivation and session state updates.
2. Route the set-bomb action to the derived location and update the planted glyph.
3. Add focused Node coverage, run the repository test and build checks, validate the OpenSpec change, and manually verify the seeded in-game placement-to-explosion path.

No data migration or rollback procedure is required; the change is client-only and has no persisted heading state.
