# Spec Delta

## Purpose

Provides pixel-art terrain presentation and rectilinear wall generation for the
procedural Underground realm while retaining logical terrain/gameplay semantics.

## ADDED Requirements

### Requirement: Phase-one Underground terrain skin
The client SHALL present each visible Underground logical `wall` terrain cell
with one approved blocked-wall tileset frame and each visible Underground
logical `dirt` terrain cell with one approved walkable-floor tileset frame.
This phase SHALL be named 1-tile replacement, meaning one fixed graphic per
terrain type without neighbor-based variation.
The selected frame SHALL replace only the terrain presentation; the cell's
terrain kind, walkability, fog eligibility, collision, pathfinding, generated
coordinates, and deterministic world result SHALL remain unchanged. Overground
terrain and Underground water, props, actors, pickups, stairs, and effects
SHALL retain their existing presentation in phase one.

#### Scenario: Generated Underground wall receives wall art
- **WHEN** a generated Underground cell has logical terrain kind `wall` and is eligible for world rendering
- **THEN** its terrain presentation uses the approved blocked-wall tileset frame
- **AND** the cell remains non-walkable with its existing world coordinates and gameplay behavior

#### Scenario: Generated Underground dirt receives floor art
- **WHEN** a generated Underground cell has logical terrain kind `dirt` and is eligible for world rendering
- **THEN** its terrain presentation uses the approved walkable-floor tileset frame
- **AND** the cell remains walkable with its existing world coordinates and gameplay behavior

#### Scenario: Phase one excludes unrelated terrain and overlays
- **WHEN** phase-one Underground terrain art is active
- **THEN** Overground terrain, Underground water, and every non-terrain world overlay retain their established presentation and behavior

### Requirement: Phase-one human acceptance checkpoint
The implementation SHALL stop after phase-one verification and obtain explicit human acceptance before beginning phase-two autotiling work. The phase-one review SHALL include a fixed-seed playable Underground session and confirm that wall and dirt art are visually legible while movement, fog, terrain blocking, and overlay visibility remain correct.

#### Scenario: Phase one awaits human acceptance
- **WHEN** the phase-one checks and fixed-seed browser review are complete
- **THEN** phase two is not started until a human explicitly accepts or revises the phase-one result

### Requirement: Phase-two deterministic wall autotiling
After phase-one human acceptance, phase two SHALL use eight-neighbor rules
derived from wall_combinations01.tmx and compose missing forms from the same
source family. Qualification SHALL document canonical frames, composed
quadrants, all 47 normalized patterns, ambiguities, and visual seam checks,
not rely on total sheet size. Original source
images and folders SHALL remain unchanged. Floor SHALL retain fixed tile 13.
Composition SHALL remain within each wall cell. Selection SHALL be
deterministic for identical terrain input and SHALL not alter the logical
terrain grid or gameplay semantics.

#### Scenario: Example lacks a ready-made form
- **WHEN** a normalized neighborhood has no canonical complete source frame
- **THEN** the renderer uses the documented directional quadrant composition without transforming the lighting direction or drawing outside the cell

#### Scenario: Neither tier qualifies
- **WHEN** the art audit cannot establish a complete compatible 16-tile or 47-tile family
- **THEN** missing forms are reported and phase two is not marked complete unless explicitly authorized composition supplies and verifies a complete family

#### Scenario: Example-derived corner family
- **WHEN** an Underground wall resolves any of the 47 gated-diagonal patterns
- **THEN** its visual uses the documented canonical frame or complete quadrant recipe
- **AND** identical normalized neighborhoods produce identical artwork regardless of fog, occupants, or viewport position
- **AND** changed terrain invalidates the affected cell and its eight neighbors before bounded visible rendering

#### Scenario: A wall edge differs from a wall center
- **WHEN** a visible Underground wall has a cardinal neighbor pattern that represents an exposed edge and another wall has four cardinal wall neighbors
- **THEN** the renderer selects the approved edge frame for the first wall and the approved center frame for the second wall

#### Scenario: A corner receives its approved corner frame
- **WHEN** the qualified tier is 47-tile and a visible Underground wall's cardinal and diagonal context represents an approved inside or outside corner
- **THEN** the renderer selects that corner's approved tileset frame without changing either cell's terrain kind or walkability

#### Scenario: Autotile selection is repeatable
- **WHEN** the same generated Underground terrain grid is rendered more than once with the same selected art mapping
- **THEN** each wall resolves to the same autotile frame on every render

### Requirement: Phase-two human acceptance checkpoint
The implementation SHALL stop after phase-two verification and obtain explicit human acceptance before the change is considered complete. The phase-two review SHALL include a fixed-seed playable Underground session that demonstrates contiguous walls, edges, corners, and isolated formations with correct gameplay behavior.

#### Scenario: Phase two awaits human acceptance
- **WHEN** phase-two checks and the fixed-seed browser review are complete
- **THEN** the change remains incomplete until a human explicitly accepts or revises the autotiled result

### Requirement: Rectilinear Underground wall generation
Newly generated Underground walls SHALL form axis-aligned blocks with longer
straight runs instead of frequent single-cell diagonal steps. The straightening
pass SHALL preserve blocked world borders and not close existing floor passages.
It SHALL run before connected-region selection and skip disabled cave generation.
Overground terrain generation SHALL remain unchanged. Same seeds and settings
SHALL reproduce the revised layouts, but earlier Underground layouts need not
be preserved. Existing walkability, valid-start and paired-stair checks SHALL apply.

#### Scenario: Underground formation is straightened
- **WHEN** Underground cave generation runs
- **THEN** the straightening pass resolves each interior 3x3 block uniformly, opening blocks containing floor and retaining completely blocked blocks
- **AND** synchronous and cooperative generation agree

#### Scenario: Other generation remains isolated
- **WHEN** Overground generation runs or Underground cave generation is disabled
- **THEN** the rectilinear operation does not modify that terrain pass

### Requirement: Phase-three art refactor planning
Phase three SHALL deliver a plan covering all world-art categories, glyph fallback,
asset ownership, composition caching and atlas scaling, migration order, and
verification. This change SHALL NOT implement that broader refactor without
separate user authorization.

#### Scenario: Phase-three plan is delivered
- **WHEN** the phase-two result is presented for human review
- **THEN** a linked art-refactor plan explains how composition scales beyond this wall experiment
- **AND** broader art migration remains unimplemented
