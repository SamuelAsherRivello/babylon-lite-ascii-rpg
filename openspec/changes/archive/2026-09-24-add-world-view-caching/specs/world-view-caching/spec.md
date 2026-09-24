# Spec Delta

## Purpose

Keeps every world-derived view visually current while avoiding redraw work for unchanged presentation and bounding the work required for local world changes.

## ADDED Requirements

### Requirement: Semantic view reuse

Each game world view, exploration minimap, fullscreen developer mapview, and generation-settings preview SHALL retain its most recently completed presentation for its current compatible world state. When a refresh request cannot change a view's visible world content, fog, lighting, viewport geometry, markers, or enabled overlays, that view SHALL present its retained result without recreating its world-cell composition or repainting its world content.

#### Scenario: Stable visible game state

- **WHEN** a scheduled refresh has the same compatible visual state as the last completed game world view
- **THEN** the game world view remains visible with the established result
- **AND** no new world-cell composition or full visible-region refresh is performed for that request

#### Scenario: Stable minimap state

- **WHEN** a minimap refresh request has no changed visible world content, fog, lighting, crop, scale, marker, or canvas geometry input
- **THEN** the minimap retains its established canvas presentation without a new complete world-content paint

### Requirement: Bounded partial view refresh

When a compatible view changes only a bounded set of visible world cells or dynamic overlays, the view SHALL update the affected cells or regions while preserving unchanged retained content. Fog visibility, glyph identity, palette style, actor presentation, lighting, GPU light presentation, markers, health bars, and floating text SHALL remain visually equivalent to a complete redraw for the same world state.

#### Scenario: Local world change

- **WHEN** a visible terrain, object, actor, fog, or marker change affects a bounded region of a compatible view
- **THEN** the view updates that region and its affected overlays
- **AND** unchanged visible regions retain their established presentation

#### Scenario: Player movement with local lighting change

- **WHEN** a player move changes the player position and its lighting influence without changing the viewport geometry or incompatible view settings
- **THEN** the affected world cells and overlays present the newest position and lighting result
- **AND** unrelated visible world content remains equivalent to the complete redraw result

### Requirement: Safe full-refresh fallback

Each view SHALL select a complete redraw when its retained content is incompatible with the requested state or when the changed region is sufficiently broad or fragmented that partial work is not the selected refresh strategy. The selection SHALL be derived from measured refresh behavior and SHALL preserve the same visible result as a complete redraw.

#### Scenario: Incompatible view state

- **WHEN** a viewport, canvas backing size, renderer lifecycle, realm, font, zoom, glyph offset, palette configuration, or other presentation input makes retained content incompatible
- **THEN** the affected view performs a complete refresh before presenting the new state
- **AND** it does not display stale content from the incompatible state

#### Scenario: Broad or fragmented change

- **WHEN** changed cells or overlay regions exceed the view's measured partial refresh boundary
- **THEN** the view performs its complete refresh path
- **AND** the result matches the established composition, fog, lighting, and overlay ordering for the current state

### Requirement: Bounded retained resources and observable refresh decisions

Retained presentation resources SHALL be bounded, invalidated when their source state is replaced, and released when a view's existing lifecycle requires release. Opt-in performance diagnostics SHALL distinguish retained reuse, partial refresh, and complete refresh with enough scope information to compare their frame-time costs without recording world content, seeds, or user data.

#### Scenario: Mapview closes

- **WHEN** the developer closes the fullscreen mapview
- **THEN** its mapview-only retained presentation resources are released as required by the mapview lifecycle
- **AND** the normal game and minimap presentation remain unaffected

#### Scenario: Cache measurement is requested

- **WHEN** an opt-in performance measurement includes a cached view refresh
- **THEN** the report identifies whether the view reused retained content, partially refreshed, or fully refreshed and includes the relevant bounded refresh scope
- **AND** the report omits seeds, world contents, and other user data
