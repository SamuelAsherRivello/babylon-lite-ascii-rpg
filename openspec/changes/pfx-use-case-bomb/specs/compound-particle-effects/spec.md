# Spec Delta

## Purpose

Provides reusable grid-anchored particle sequences that combine multiple existing effects into one ordered presentation without changing the world content beneath them.

## ADDED Requirements

### Requirement: Compound PFX plays ordered one-shot effects

The particle system SHALL support a named compound PFX containing two or more existing one-shot particle effects at one realm and grid cell. It SHALL play each member exactly once in declaration order, immediately starting the next member after the preceding member completes when no crossfade is configured. A compound PFX SHALL complete only after its final member completes.

#### Scenario: Sequential two-effect compound PFX

- **WHEN** a caller starts a compound PFX with effect A followed by effect B and no crossfade
- **THEN** effect A SHALL play once before effect B starts once at the same realm and grid cell
- **AND** the compound PFX SHALL complete after effect B completes

#### Scenario: Compound PFX preserves the underlying world

- **WHEN** a compound PFX plays on an occupied world cell
- **THEN** every member effect SHALL render as an overlay without changing terrain, glyph identity, collision, occupancy, fog, or object state

### Requirement: Compound PFX supports frame-count crossfades

Each transition in a compound PFX SHALL optionally specify a non-negative crossfade frame count. For a positive count, the next effect SHALL begin that many frames before the preceding effect finishes. During the overlap, both effects SHALL render at the same grid cell, with the later effect layered above the earlier effect. A zero or omitted count SHALL produce sequential playback without overlapping frames.

#### Scenario: Three-frame crossfade

- **WHEN** a two-effect compound PFX configures a three-frame crossfade from effect A to effect B
- **THEN** effect B SHALL start while the final three frames of effect A are still rendered
- **AND** those three frames SHALL render both effects with B above A

#### Scenario: Crossfade completion

- **WHEN** the preceding effect finishes during a configured crossfade
- **THEN** the next effect SHALL continue its remaining frames without restarting

#### Scenario: Zero-frame crossfade

- **WHEN** a two-effect compound PFX configures a zero-frame crossfade
- **THEN** the second effect SHALL start only after the first effect finishes
