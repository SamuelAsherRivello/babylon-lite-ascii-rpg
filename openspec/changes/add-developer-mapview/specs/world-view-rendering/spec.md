# Spec Delta

## ADDED Requirements

### Requirement: Mapview world-view mode

The world-view renderer SHALL support a mapview presentation mode that uses the same authoritative world-cell composition and glyph identity rules as the game view and minimap while accepting view-specific fog, lighting, source rectangle, destination rectangle, scale, and overlay parameters. Mapview fog bypass SHALL make all cells in its supplied source rectangle eligible for rendering without changing the active realm's stored fog state.

#### Scenario: Mapview shares world composition
- **WHEN** the mapview renders a source rectangle for the active realm
- **THEN** its terrain, objects, player, enemies, and spawners use the same authoritative glyph identity rules as other world-view instances

#### Scenario: Mapview bypasses fog without discovery changes
- **WHEN** the mapview renders cells that the game view and minimap would hide because of fog
- **THEN** those cells render in the mapview and the stored fog state remains unchanged

#### Scenario: Mapview parameters do not affect other views
- **WHEN** the mapview renders with full-realm source bounds, diagnostic lighting, and fog bypass
- **THEN** the game view and minimap retain their own source rectangles, fog behavior, lighting behavior, zoom, and marker behavior
