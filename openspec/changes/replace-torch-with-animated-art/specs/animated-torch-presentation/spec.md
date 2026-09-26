# Spec Delta

## Purpose

Defines the animated Torch presentation used by the game view while keeping
Torch world state deterministic, interactive behavior unchanged, and
presentation work bounded to the currently visible game region.

## ADDED Requirements

### Requirement: Visible game-view Torches use authored looping artwork

The game view SHALL render each fog-eligible, active-realm Torch in its current
visible region using the project-local authored three-frame `torch_strip.png`
artwork, looped at a stable rate and anchored to the Torch's logical grid cell.
The animated artwork SHALL replace the static Torch glyph only in the main game
view; it SHALL NOT alter the Torch's authoritative catalog glyph, coordinate,
lighting source, collision, walkability, interaction, fog state, minimap
marker, or mapview marker.

#### Scenario: Visible Torch animates in the game view

- **WHEN** an active-realm Torch becomes visible and fog-eligible in the game view
- **THEN** its grid cell displays the looping authored Torch artwork while its
  underlying game state remains unchanged

#### Scenario: Entering a Torch cell remains unchanged

- **WHEN** the player moves onto a walkable Torch cell rendered with animated artwork
- **THEN** movement succeeds and the Torch remains present and non-interactable

### Requirement: Animated Torch work is visible-region bounded

The game layer SHALL create, retain, or advance animated Torch presentation only
for fog-eligible Torches in the active game-view visible region. A Torch outside
that region, in another realm, or hidden by fog SHALL have no active animated
renderer resource or per-frame animation update. Returning to eligibility SHALL
restore its presentation without changing authoritative Torch state.

#### Scenario: Camera culls a Torch animation

- **WHEN** a previously visible Torch leaves the active game-view visible region
- **THEN** the game layer stops its animation updates and removes it from the
  active Torch presentation set

#### Scenario: Fog hides a Torch animation

- **WHEN** a Torch's cell becomes fog-ineligible in the active game view
- **THEN** the animated Torch artwork is not rendered or advanced until the cell
  becomes fog-eligible again

### Requirement: Torch animation can be paused by the game layer

The game layer SHALL provide a game-layer-owned capability to pause and resume
the current visible Torch animation set without changing Torch world state or
requiring a React control, persisted user setting, or bridge snapshot. A paused
Torch presentation SHALL retain its currently displayed frame until resumed.

#### Scenario: Paused visible Torches hold their frame

- **WHEN** the game layer pauses the visible Torch animator
- **THEN** each currently rendered Torch retains its current frame and no visible
  Torch frame advances until the animator resumes

### Requirement: Torch artwork failure preserves a static presentation

The game view SHALL retain a static Torch glyph fallback if the authored raster
asset cannot be loaded, so a generated, fog-eligible Torch remains identifiable
without changing its world state or lighting behavior.

#### Scenario: Raster artwork is unavailable

- **WHEN** the authored Torch artwork cannot be loaded
- **THEN** the game view renders the existing static Torch glyph for each eligible Torch

