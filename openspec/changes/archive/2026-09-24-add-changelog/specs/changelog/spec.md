# Spec Delta

## Purpose

Provides a developer-visible, versioned release history that connects each
released feature summary to the synced specification that defines it.

## ADDED Requirements

### Requirement: Versioned Changelog history
The game SHALL provide a developer-accessible `Changelog` window that presents
released versions in descending version order. Each version SHALL contain one to
five concise, human-readable feature summaries, including seeded historical
releases already represented by repository tags.

#### Scenario: Developer views history
- **WHEN** a developer opens `Changelog` from the Dev panel
- **THEN** released versions appear newest first with their summary bullets

### Requirement: Linked release feature contracts
Each Changelog summary SHALL link to its related synced OpenSpec feature file at
the corresponding version tag and SHALL open the linked file in a new browser
tab.

#### Scenario: Developer opens a feature contract
- **WHEN** a developer activates a Changelog summary
- **THEN** the related version-pinned feature file opens in a new tab

### Requirement: Incremental release records
The checked-in release workflow SHALL append the next version's Changelog entry
from completed archived OpenSpec feature artifacts since the prior release. It
SHALL retain existing historical entries without recalculating them.

#### Scenario: Next release preserves history
- **WHEN** the version release workflow creates a new patch release
- **THEN** it commits the new Changelog entry alongside the bumped version while preserving prior entries
