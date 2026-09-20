# Spec Delta

## MODIFIED Requirements

### Requirement: No legacy gameplay fallback
The application SHALL run its Babylon Lite game surface without retaining a legacy gameplay fallback. If required browser rendering support cannot initialize or is lost, the game SHALL report unavailable state without loading an alternate gameplay renderer.

#### Scenario: Babylon Lite startup succeeds
- **WHEN** Babylon Lite initializes successfully
- **THEN** the game world SHALL load in `game_layer` and remain responsive to React controls

#### Scenario: Babylon Lite startup fails
- **WHEN** required rendering support cannot initialize or is lost
- **THEN** the game world SHALL not load and no legacy gameplay path SHALL run
