# Spec Delta

## MODIFIED Requirements

### Requirement: Stable world render pass order

The renderer SHALL render an enabled approved terrain-art visual as opaque
world content for an eligible logical terrain cell before lighting and overlays,
instead of that cell's glyph-background and glyph composition. For cells that
do not resolve terrain art, the renderer SHALL perform any enabled opaque
glyph-background composition before glyph composition. It SHALL apply the
cell's configured lighting to the resulting world content and SHALL perform
any enabled overlay after world content. The game view, mini-map, and mapview
SHALL use the same enabled terrain-art or glyph/background visual source,
adapted only to their destination scale. When the GPU light pass is enabled,
the mini-map SHALL apply the same discovered-cell light samples and additive
light color before its marker overlay.

#### Scenario: Combined game and mini-map presentation

- **WHEN** a discovered cell is rendered with Glyph Background enabled and does not resolve terrain art
- **THEN** both views use the same opaque background-and-glyph composite, reduced or submitted according to the destination view's scale, before any view-specific overlay

#### Scenario: Terrain-art presentation is shared across views

- **WHEN** a discovered eligible logical terrain cell resolves an approved terrain-art visual
- **THEN** the game view, mini-map, and mapview use that same terrain-art visual adapted to their respective destination scales before any view-specific overlay

#### Scenario: Mini-map GPU light pass

- **WHEN** the GPU light pass is enabled and a discovered mini-map cell has a cached torch or player light contribution
- **THEN** the mini-map SHALL apply the corresponding additive GPU light-pass sample before drawing markers

#### Scenario: Overlay remains above world content

- **WHEN** an enabled marker or presentation overlay occupies a rendered cell
- **THEN** the completed terrain-art or glyph/background world result SHALL render before the overlay
