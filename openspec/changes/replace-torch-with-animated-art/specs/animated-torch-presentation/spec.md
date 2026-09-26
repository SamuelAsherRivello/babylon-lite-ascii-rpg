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

### Requirement: Eligible Torches always use authored animation

The game view SHALL suppress the static main-view Torch glyph for every
fog-eligible, active-realm Torch in the visible region and render the authored
three-frame `torch_strip.png` artwork instead. The visible-set animation clock
SHALL loop continuously while at least one eligible Torch is present; it SHALL
not expose a pause state or static-glyph fallback.

#### Scenario: Authored asset is requested

- **WHEN** an eligible Torch is rendered in the game view
- **THEN** its static main-view glyph remains suppressed and the authored strip
  is the only Torch presentation requested for that cell
