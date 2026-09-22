# Spec Delta

## ADDED Requirements

### Requirement: Map rendering is cooperative and cancellable

The map window SHALL render its fullscreen diagnostic map through the
cooperative world-view rendering mode. Opening, toggling, resizing, or closing
the map window SHALL keep browser input and UI presentation responsive while
the full selected realm is being drawn. Closing the map window, changing the
diagnostic realm, resizing the map surface, or disposing the game layer SHALL
cancel any stale map-window render job before it can draw more content.

#### Scenario: Opening map remains responsive during render
- **WHEN** the developer opens the map window for a generated realm large
  enough to require multiple render batches
- **THEN** the map window appears without blocking browser input until the full
  realm render completes
- **AND** the map content progressively fills in bounded batches

#### Scenario: Realm toggle cancels stale render
- **WHEN** a map-window render is still in progress and the developer activates
  `Toggle Realm`
- **THEN** the previous realm render is cancelled
- **AND** subsequent map content and diagnostic markers correspond only to the
  newly selected realm

#### Scenario: Close releases active map render resources
- **WHEN** the map window is closed while a cooperative render is still pending
- **THEN** the pending render is cancelled
- **AND** map-window-only canvas backing memory and cached render resources are
  released according to the existing cleanup contract

#### Scenario: Markers remain above completed world content
- **WHEN** the map window completes its cooperative render
- **THEN** diagnostic markers render above the completed world content
- **AND** stale markers from an interrupted render are not shown over a newer
  realm or resized surface

