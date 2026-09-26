# Phase 1 verification — 2026-09-26

Phase 1 is implemented. Human gate 3.1 remains open. Phase 2 has not started.

## Human-requested PNG seam revision

Disabled per-cell RGB/alpha lighting modulation on PNG composites only and
replaced their overlapping pixel-snapped bounds with shared rounded edges.
Glyph-only rendering and optional additive GPU lighting remain unchanged;
discovery/fog opacity remains enabled. Verified the rebuilt browser result:
the explored floor is visually continuous instead of showing lighting bands
and overlapping cell edges. Repeated paving motifs and the fog boundary remain.
The 20 focused rendering tests and production build passed after this revision.

## Initial phase-one verification

- Asset source: copied `Tiled_files/walls_floor.png`, SHA256
  `F274FD4BAD802F07991510E2E98B417942E3459E13C0CDCAA5B4BA6A4C7F25C6`.
  User confirmed full rights in this conversation.
- Focused Node checks cover renderer, world-view composition/cache, and minimap.
  New checks cover logical selection, exclusions, immutability, overlay identity,
  hidden-cell culling, reusable cache entries, opaque composition, and light/fog
  pixel modulation.
- Production build passed and includes the project-local tilesheet.
- Manual browser URL:
  `http://127.0.0.1:5176/babylon-lite-ascii-rpg/?randomSeed=underground-phase1&skipTutorial=true&generationOverrides=disable:2,4,10,11,15,16`
- The existing read-only tester URL overrides disable Overground walls, water,
  torches, NPC spawners, homes, and signs solely to simplify travel to stairs.
  Underground caves, stairs, other objects, and enemy generation remain enabled.
  No generation settings were saved to disk.
- Starting in Overground, walked 12 cells left and 9 down to the paired stairs;
  confirmed the transition to Realm -1 in the HUD and log. Walked 3 cells left
  in Underground, then attempted 2 further left moves into the wall: position
  and time stayed unchanged at time 25. Two down moves advanced time to 27.
- Visually checked fixed paving and stone blocks, player and stair glyphs above
  terrain, darkness/fog at undiscovered boundaries, mini-map at two scales,
  developer mapview, zooms 5 and 7, and the in-game Portrait/Landscape modes.
- Kept the playable browser tab in Underground for human review. No phase-two
  frame audit, neighbor resolver, or auto-tiling implementation was performed.
