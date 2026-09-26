# Spec Delta

## Purpose

Provides a reusable, realm-independent catalog and renderer for transparent animated particle effects anchored to world grid coordinates without replacing the world content beneath them.

## ADDED Requirements

### Requirement: Stable particle catalog
The system SHALL expose every bundled particle effect through a stable unique name, with the catalog ordered alphabetically for display and lookup.

#### Scenario: Catalog contains bundled effects
- **WHEN** the particle catalog is requested
- **THEN** it returns each copied RCArt effect exactly once with its stable name, frame count, scale metadata, and playback metadata

### Requirement: Grid-anchored overlay rendering
The system SHALL render a selected particle effect as a transparent overlay centered on a requested realm and world grid coordinate, above the existing tile, glyph, object, and lighting composition.

#### Scenario: Effect does not replace terrain
- **WHEN** an effect is spawned at an occupied world cell
- **THEN** the underlying world content remains rendered and the particle appears above it

#### Scenario: Effect works in any realm
- **WHEN** a caller supplies a valid coordinate in any generated realm/world
- **THEN** the effect is rendered at that coordinate without requiring a realm-specific asset registration

### Requirement: One-shot and loop metadata
Each catalog entry SHALL declare whether its authored sequence is one-shot or loop-capable, and a one-shot spawn SHALL advance through its frames once before removing itself.

#### Scenario: One-shot completes
- **WHEN** a one-shot effect reaches its final frame
- **THEN** it is removed from active particle overlays and does not restart

### Requirement: Visible-region eligibility
The particle overlay SHALL submit only effects whose projected bounds intersect the active view's visible world rectangle, while retaining offscreen active effects for later visibility.

#### Scenario: Offscreen effect is deferred
- **WHEN** an active effect is outside the current game-view rectangle
- **THEN** no sprite is submitted for it during that render pass, and it remains eligible to render after the camera returns
