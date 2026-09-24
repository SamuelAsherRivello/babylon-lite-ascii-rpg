# Spec Delta

## ADDED Requirements

### Requirement: Selected world-size generation input
Before Ground generation begins, the game layer SHALL resolve the confirmed World Size selection to identical positive `rows` and `columns` for each generated realm: Low to `128 x 128`, Med to `256 x 256`, and High to `512 x 512`. The selected dimensions SHALL remain independent of browser viewport dimensions and SHALL be included with the generation inputs used for reproducibility.

#### Scenario: Generate the selected per-realm size
- **WHEN** the confirmed World Size is High
- **THEN** the generated Overground and Underground realms each contain exactly 512 rows and 512 columns before later terrain and placement passes run

#### Scenario: Preserve the Medium baseline
- **WHEN** no valid World Size selection is available
- **THEN** the generated Overground and Underground realms each contain exactly 256 rows and 256 columns

