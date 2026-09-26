# Spec Delta

## ADDED Requirements

### Requirement: Animated in-world Trap artwork
The Babylon Lite game view SHALL present every active Trap in its visible, positively fog-visible source region with the project-local `trap1_strip.png` artwork instead of the static Trap glyph. The artwork SHALL display the strip's seven 32×32 frames in order, loop continuously for as long as the Trap is rendered, and remain anchored to the Trap's single logical grid cell without changing the object's placement, walkability, occupancy, collision, health consequence, log behavior, minimap marker, or generation-preview marker. If the artwork cannot load, the game view SHALL retain the existing Trap glyph presentation.

#### Scenario: Visible active Trap loops indefinitely
- **WHEN** an active Trap is inside the game view source region and has positive fog visibility
- **THEN** its in-world artwork displays frames 0 through 6 in order and repeats from frame 0 for as long as the Trap remains eligible to render

#### Scenario: Trap leaves the renderable game-view region
- **WHEN** an active Trap is outside the game view source region or has no positive fog visibility
- **THEN** the game view does not render or animate its Trap artwork

#### Scenario: Trap artwork is unavailable
- **WHEN** the Trap artwork fails to load
- **THEN** the game view renders the existing Trap glyph and retains normal Trap gameplay behavior

#### Scenario: Animated artwork preserves Trap gameplay
- **WHEN** a player enters a Trap cell while its artwork is animated
- **THEN** the Trap remains walkable and persistent and applies its existing configured consequence exactly as before
