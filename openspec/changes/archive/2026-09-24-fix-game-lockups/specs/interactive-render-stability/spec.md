# Spec Delta

## Purpose

Ensures the active Babylon Lite game remains responsive to UI input while all rendering and gameplay systems remain enabled.

## ADDED Requirements

### Requirement: Responsive interactive rendering
The game SHALL coalesce rendering work so UI actions remain dispatchable while all gameplay, lighting, fog, minimap, palette, font, zoom, camera, and realm systems operate.

#### Scenario: Menu interaction during gameplay
- **WHEN** a player opens or uses any left-side menu control while a world is rendered
- **THEN** the action completes without freezing or crashing the browser
