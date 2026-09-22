# Design

## Context

See proposal.md. The existing optional GPU pass consumes the visible torch and
player contribution arrays as one combined set of large additive radial
sprites. Although those arrays already exclude player light behind an `X High`
blocker, a lit neighboring sprite can overlap the hard-shadow cells.

The client already has separate player and torch contribution fields, a
straight grid-path blocker traversal, React local-storage settings, and a
narrow cached bridge. Babylon Lite already supplies the sprite layer, client
atlas, and additive blend path used by the optional pass.

## Goals / Non-Goals

**Goals:**

- Preserve direct player light in clear line-of-sight cells.
- Replace accidental player glow leakage with a small, user-selected,
  directional simulated penumbra behind the first blocker.
- Make the player hard-shadow core receive no player GPU contribution at every
  ambient level; at ambient above `0`, only existing ambient or another source
  may make that core visible.
- Keep source-field calculation, world data, and gameplay authoritative and
  unchanged.
- Treat full ambient as the visual endpoint through the same continuous
  source-composition calculation used at every other ambient level.

**Non-Goals:**

- No physically accurate area lights, raymarching, bounce light, or temporal
  illumination.
- No change to the existing Torch Lighting, Player Lighting, or Player Shadow
  profile meanings; only the no-storage and reset defaults change to Player
  Lighting `X High` and Player Shadow `High`.
- No new rendering dependency or React access to visible-cell data.

## Decisions

### Split the GPU presentation by source role

The GPU pass will retain separate torch and player presentation inputs instead
of taking their maximum before rendering. The player direct layer will render
only cells with an unobstructed player contribution. A separate player
penumbra layer will render only cells selected by the bounded shadow-fringe
calculation. Torch presentation remains independent, so a torch can illuminate
a player-shadowed cell normally.

Alternative: alter the authoritative combined field after rendering. Rejected
because that would make it impossible to distinguish valid torch light from
player-only visual spill.

### Compute a finite directional shadow fringe on the grid

The lighting module will expose a read-only helper that follows the existing
straight grid path from player to visible target, identifies its first
unwalkable blocker, and returns the number of grid steps beyond that blocker.
For a range `R`, only targets with a positive shadow distance at most `R` are
penumbra candidates. Their simulated value uses the selected player radius,
maximum, and falloff as a base, multiplied by a fixed restrained penumbra
strength and a fast quadratic fade by shadow distance. This rule applies at
every ambient level; ambient continues to light the hard-shadow core through
the existing base scene, not through player GPU spill.

This directly maps to the mockup: clear cells are region `1`, the selected
finite candidate cells are region `2`, and all later blocked cells are region
`3`.

Alternative: measure a radial distance from any lit cell. Rejected because it
would spread around blocker edges and recreate the unwanted unrestricted glow.

### Bound player sprites to their eligible grid cells

Direct-player and penumbra sprites will use the existing pre-blurred radial
atlas but be sized to their own grid-cell bounds. This preserves a soft tint
inside each eligible cell without allowing the sprite footprint itself to
cross into a hard-shadow cell. The penumbra layer uses a lower alpha than the
direct-player layer.

Alternative: blur a full player emission texture and clip it afterward.
Rejected for this scope because the current sprite renderer already supports
the needed bounded, stylized simulation without adding a post-processing
resource lifecycle.

### Scale GPU composition by available ambient headroom

The optional GPU layer will scale source samples by `1 - ambient`. This keeps
its additive presentation aligned with the base glyph calculation: at full
ambient the complete scene is already bright, so changing any lighting,
shadow, or bleed setting produces no visible result without an ambient-value
branch or a forced layer shutdown.

Alternative: leave the overlay unscaled and only hide player shadows. Rejected
because torch falloff and source glow would still contradict full ambience.

### Persist one range through the existing bridge

`App.jsx` will initialize and store a finite range with local storage, display
the exact `Player GPU Shadow Bleed Range` setting and its active grid-cell
value, and rely on Reset Settings to clear it. The bridge caches only that
numeric setting and applies it whenever a game controller registers. Babylon
Lite owns range validation, derived penumbra data, layers, and disposal.
The UI, bridge, and game-layer initial settings will use Player Lighting
`X High` and Player Shadow `High` only when the corresponding stored preference
is absent; GPU Light Pass likewise resolves to enabled when its preference is
absent. Existing stored choices remain authoritative.

Alternative: expose sliders or field data to React. Rejected because the
project uses fixed click-through settings and keeps renderer data in Babylon
Lite.

## Risks / Trade-offs

- [Cell-bounded softness is less continuous than a large blur] -> use the
  existing radial atlas and falloff values to keep the intentional fringe soft.
- [Large selected ranges can be visually busy] -> cap values at six cells and
  make the penumbra dim with a rapid quadratic fade.
- [A later change could accidentally merge player and torch inputs again] ->
  add focused tests for a torch-lit player-shadow cell and a player-only hard
  shadow core.
- [Prior GPU light-pass artifacts have not yet been synced] -> keep this
  change additive and sync/archive the prerequisite GPU-light-pass change
  before merging its delta specs into the main specifications.

## Migration Plan

1. No stored value resolves to range `2`.
2. Existing stored light and shadow profile settings remain unchanged.
3. Reset Settings clears the new key with the existing settings keys and then
   restores Player Lighting `X High`, Player Shadow `High`, and GPU Light Pass
   enabled.
4. Roll back by setting the range to `0`; no world or palette migration is
   necessary.
