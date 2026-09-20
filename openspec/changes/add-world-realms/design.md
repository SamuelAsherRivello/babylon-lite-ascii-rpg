# Design

## Context

See `proposal.md` for motivation. The Babylon Lite layer currently owns one
generated world, player position, time, fog, minimap, and palette-grid
lighting. `world-system.js` already has deterministic synchronous and
cooperative generation paths, while React owns persisted lighting preferences
and communicates through cached bridge snapshots.

## Goals / Non-Goals

**Goals:**

- Make a world the owner of two independently generated realm instances while
  retaining a single active realm for simulation and rendering.
- Express realm differences through data-driven, hard-coded generation
  profiles rather than scattered realm checks.
- Keep realm fog and lighting preferences isolated, with only narrow UI
  commands crossing into the game layer.
- Preserve seeded repeatability for world and realm generation.

**Non-Goals:**

- Day/night cycles, elapsed-time lighting, save-game persistence, multiple
  simultaneous worlds, or a realm-selection menu.
- Changing lighting source/shadow profiles, minimap controls, or adding
  dependencies.
- Making terrain, object probabilities, or profile parameters user-editable.

## Decisions

### Represent a world as two realm instances with profile-derived seeds

The game layer will create a world record containing a resolved world seed,
one Overground realm, one Underground realm, their independent fog records,
and the active realm identifier. Each realm owns its generated terrain,
characters, torches, player position, and fog. Realm seeds are derived from
the world identity plus the realm name, so a profile can use a distinct random
sequence without losing deterministic replay.

`Overground` and `Underground` profiles will hold fixed terrain identities,
walkability targets, and feature rule bundles. A feature rule carries both an
occurrence probability and its parameters. This allows water and later
features to vary by realm without embedding profile conditionals in individual
generation passes.

Alternative: retain a single world and swap only glyph styles. Rejected because
walkability, fog, stairs, lighting selection, and generation probabilities
must be independently authoritative for each realm.

### Select stairs from the intersection of both realms' valid cells

After generating both realms, the world-generation coordinator will derive
the candidate intersection of cells that are walkable, reachable, and not a
start position in either realm. It uses the shared world seed to choose a
deterministic, valid subset targeted at the already calculated torch count.
The chosen coordinates are projected as static `S` stairs into both realm
character presentations while preserving their underlying terrain.

On a single-realm restart, the other realm's terrain and fog are retained. The
replacement realm is generated with a fresh realm seed, then the shared stair
set is recomputed from the two current realms; the retained realm's stair
markers update to that new paired set, but its terrain and fog do not. A
shortage yields a valid deterministic subset rather than invalid terrain or
unbounded regeneration.

Alternative: force every old stair coordinate to be walkable in the new realm.
Rejected because it makes stairs rewrite a realm's terrain-generation result.
Alternative: restart both realms together. Rejected because the named restart
controls imply that the non-selected realm remains explorable.

### Treat stairs as static feature occupancy and guard arrival transfers

Static feature placement will generalize the current torch restoration logic
so a player can cover `S` with `P` and reveal it when leaving. Movement checks
will examine the destination's static feature before committing the active
realm transfer. The paired arrival is marked as an arrival, not another entry,
preventing immediate bounce-back; a later successful departure and re-entry
can transfer normally.

Alternative: encode stairs in terrain. Rejected because stairs must be
non-blocking, visually overlay the base terrain, and share the existing
top-most glyph rule with torches and the player.

### Keep fog with its realm and replace it only with that realm

The existing fog field/minimap aggregate model will remain a realm-local
object. Active movement and lighting-profile refresh update only active-realm
fog. Transferring restores the destination fog and rerenders its minimap;
restarting a realm allocates a new empty fog object only for that realm.

Alternative: one world-sized shared fog field. Rejected because equal grid
coordinates in different realms represent different places and must not reveal
one another.

### Split ambient preferences at the React-to-bridge boundary

React will replace the legacy single ambient storage key/control with
Overground and Underground storage keys, defaulting and writing `0.9` and
`0.1` on first render. The Lighting window will expose the two exact labels.
The bridge caches both values before controller registration; Babylon Lite
chooses the value matching its active realm and rerenders on a preference or
realm change. Reset Settings clears both keys through the existing reset path.

Alternative: store ambient on generated realm data. Rejected because these are
user-facing persistent lighting preferences, not generated-world state.

### Keep restart controls in the upper-left React HUD

The React upper-left corner retains the required title and time roles and adds
the two named restart buttons beneath them. Buttons issue only a realm name to
the bridge. The game layer remains responsible for generation cancellation,
replacement, active-player setup, and rendering readiness.

Alternative: expose realm objects to React for direct replacement. Rejected
because it violates the established authoritative game-layer boundary.

## Risks / Trade-offs

- [The valid-cell intersection can be sparse] -> Return a deterministic
  subset rather than making maps invalid; cover small and production-sized
  worlds in synchronous/cooperative tests.
- [A realm restart can race an in-flight generation] -> Reuse the existing
  abort-controller generation lifecycle and accept only the latest requested
  realm result.
- [New glyphs can be absent from caches or palette data] -> Add `M` and `S`
  through the existing glyph, palette, and visible-rendering contracts with
  focused coverage.
- [Recent fog and lighting changes share files] -> Rebase implementation on
  current `main` behavior and retain existing fog/minimap and Lighting-window
  contracts unless their deltas explicitly change them.

## Migration Plan

1. On first React render, initialize the two realm ambient keys from their
   defaults; do not reuse the legacy single ambient value.
2. Generate a two-realm world for a new session; each realm starts with its
   own empty fog state.
3. Restart controls replace their named realm and fog only; the other realm
   remains in memory.
4. Rollback removes the realm coordinator and restores one-world rendering;
   realm ambient keys can remain harmless unused browser preferences.
