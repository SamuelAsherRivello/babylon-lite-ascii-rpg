# Design

## Context

See proposal.md. The Babylon Lite layer already owns world generation, player
movement, the authoritative `terrain[y][x].walkable` data, and the player
lighting profile. Its lighting module already provides a straight-path blocker
test. React settings persist Boolean values and use the narrow game bridge;
the current game layer owns the full-screen canvas.

## Goals / Non-Goals

**Goals:**

- Maintain an inexpensive, deterministic exploration record for one generated
  world.
- Derive discovery from the player-light profile without reading GPU pixels or
  changing the existing lighting result.
- Render an unlit, fog-masked world-content minimap within the game layer and
  keep React's minimap command Boolean-only.

**Non-Goals:**

- No save-game storage, cross-reload fog persistence, world-seed identity, or
  migration of old browser data.
- No camera framing, minimap interaction, minimap zoom control,
  user-configurable scale, or lighting-dependent minimap presentation.
- No change to world generation, collision, player movement, ambient light,
  torch lighting, or player-shadow presentation.

## Decisions

### Store discovery in a world-sized byte field

A fresh world receives a `Uint8Array` indexed by `y * columns + x`; `0` means
fogged and `1` means discovered. The field is created alongside the world and
is discarded with it. Discovery is monotonic, so only newly marked positions
need minimap coverage updates.

Alternative: add a `discovered` property to each terrain cell. Rejected
because exploration is ephemeral player state, while terrain is authoritative
generation data and used by collision and lighting.

### Evaluate player discovery with an explicit falloff cutoff

On initial placement, successful player movement, and a player-light-profile
change, scan the bounded square around the player. A walkable candidate is
eligible when its pure player-light contribution is at least a hard-coded
`0.1` discovery cutoff and its path is clear according to the existing
straight-grid blocker rule. The current player cell is marked regardless of
the profile so the game always records the player's occupied walkable tile.
The player shadow profile, torches, ambient factor, GPU light pass, and
minimap visibility are not discovery inputs.

With the current default High player profile, the cutoff produces roughly the
requested ten-cell exploration distance while brighter or dimmer profiles
remain meaningfully different. The cutoff is a named implementation constant
for later tuning.

Alternative: copy the final scene-light field or GPU output. Rejected because
torch and ambient contributions would incorrectly reveal terrain, and rendering
state is not the authority requested for fog.

### Aggregate each 10 by 10 area into a fog opacity multiplier

The minimap derives a fixed coarse grid using `Math.ceil(columns / 10)` by
`Math.ceil(rows / 10)`. Each cell tracks its static walkable total and its
dynamic discovered-walkable count. Their ratio is an opacity multiplier for
the downsampled world-content pixel: `0` is fully fogged and `1` is fully
visited. An area with no walkable cells stays fully fogged. Updating a
discovered world cell increments only its containing coarse cell, avoiding a
full-world rescan on every movement.

Alternative: render only neutral grayscale coverage. Rejected because it
loses the useful terrain and world-context information that the minimap is
intended to convey.

### Render unlit world content into a dedicated game-layer minimap canvas

The Babylon Lite game layer creates and disposes a non-interactive minimap
canvas alongside the existing game canvas. It draws the same terrain and
actor composition available to the main world, downsampled to the coarse-grid
resolution, without applying ambient, torch, player, GPU, or shadow lighting.
Each coarse world-content pixel receives the corresponding fog opacity
multiplier before it is composited over black. CSS gives the surface a
hard-coded responsive `clamp()` size based on a minimum and viewport-relative
percentage. The canvas sits in the upper-right game area below the React HUD
layer, which is free after moving the GitHub link to the lower-left Windows
region.

Alternative: use the final lit game canvas as the source. Rejected because
the minimap must ignore lighting for now and should remain deterministic from
world and discovery state.

### Persist only visibility through the existing bridge

`App.jsx` follows the existing Boolean-settings pattern for a default-enabled
`Minimap` value and sends the Boolean through a cached bridge command. On
controller registration, the bridge applies that cached value. Babylon Lite
only hides or shows the dedicated minimap canvas; discovery continues and the
coarse coverage remains current. Reset Settings already clears local storage
and reloads, restoring the default-enabled state.

## Risks / Trade-offs

- [A discovery cutoff may need playtesting adjustment] -> isolate the initial
  `0.1` threshold as a named constant and cover it with focused unit tests.
- [A 10 by 10 cell can hide sparse exploration] -> use its continuous
  discovery ratio as opacity rather than an all-or-nothing reveal.
- [A second canvas may drift on resize] -> use the same viewport lifecycle and
  CSS shared inset constraints as the game/HUD, with responsive checks in both
  orientations.
- [Parallel lighting and HUD work is currently in progress] -> keep this
  change additive, consume only the established player-light profile and
  bridge patterns, and rebase its implementation plan on the current main
  checkout when applying.

## Migration Plan

1. Missing `Minimap` storage resolves to enabled and writes its default on
   the first React render.
2. Each generated world initializes a new empty discovery field and coarse
   coverage table.
3. Reset Settings clears only persisted preferences; reload naturally starts a
   fresh world and therefore fresh fog.
4. Rollback removes the minimap surface and its visibility preference; no
   saved world data requires migration.
