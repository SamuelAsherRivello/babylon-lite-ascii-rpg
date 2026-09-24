# Spec Delta

## ADDED Requirements

### Requirement: Generation preview reuse follows semantic inputs
A generation preview SHALL reuse compatible completed generation and presentation results for identical effective generation and visual inputs. Request identity alone SHALL NOT invalidate unchanged content. Changes SHALL invalidate all affected dependent stages while retaining compatible unaffected data. Cancelled requests SHALL never commit stale results. Cached generation SHALL remain isolated from mutable live gameplay state and retained resources SHALL be bounded and released with their owning lifecycle.

#### Scenario: Unchanged preview request
- **WHEN** a preview requests the same effective world size, seed identity, realm dependencies, densities, enablement, and visual settings as its retained completed result
- **THEN** it reuses that result without regenerating realms, reconstructing composition, or clearing and repainting an unchanged canvas

#### Scenario: Object density changes
- **WHEN** a preview changes an object density without changing terrain inputs
- **THEN** it reuses compatible terrain and recomputes the affected placement and downstream presentation using current dependencies

#### Scenario: Rapidly superseded preview
- **WHEN** a newer draft replaces a pending preview
- **THEN** the older job cannot commit generation data or presentation as the current result

### Requirement: Partial preparation is bounded by visual influence
For a compatible partial refresh, views SHALL prepare changed world cells and their affected fog, lighting, building, and overlay regions without reconstructing an unrelated complete source composition. Reuse decisions SHALL occur before expensive composition and raster preparation. A full refresh SHALL remain available for incompatible, broad, or fragmented changes with equivalent visible output.

#### Scenario: Retained minimap refresh
- **WHEN** no minimap visual input changes
- **THEN** the minimap performs no new full-source composition or glyph preparation

#### Scenario: Local object changes in a large map
- **WHEN** a single object changes with bounded visual influence and compatible view geometry
- **THEN** partial refresh preparation is restricted to its affected region and produces the same final view as a full redraw

#### Scenario: Player enters a home or moves a light
- **WHEN** a player update changes roof/interior presentation or a light's influence beyond the actor cell
- **THEN** the entire affected footprint or lighting region updates, including minimap and open mapview where applicable, without stale cells
