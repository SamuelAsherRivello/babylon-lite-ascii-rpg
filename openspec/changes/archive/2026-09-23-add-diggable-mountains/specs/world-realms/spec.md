# Spec Delta

## ADDED Requirements

### Requirement: Overground border mountains are indestructible and visually distinct

The outermost row and column of the Overground realm SHALL remain non-walkable
and SHALL not be valid digging targets. Border mountain cells SHALL use the
existing `▒` wall glyph; diggable interior Overground mountains SHALL retain the
`△` mountain glyph until destroyed. Underground terrain SHALL not be changed by
this distinction.

#### Scenario: Generated border uses the indestructible glyph
- **WHEN** an Overground realm is generated
- **THEN** every cell in its outermost row and column SHALL remain non-walkable
  and render using `▒`

#### Scenario: Interior mountain remains distinguishable
- **WHEN** an Overground realm is generated
- **THEN** each interior mountain eligible for digging SHALL render using `△`

#### Scenario: Dig attempt cannot damage the border
- **WHEN** the player attempts movement into an Overground border cell
- **THEN** the cell SHALL remain `▒` and non-walkable, with no mountain damage
  applied
