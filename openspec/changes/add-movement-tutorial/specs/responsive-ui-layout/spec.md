# Spec Delta

## ADDED Requirements

### Requirement: Responsive tutorial window geometry

The Tutorial and Tutorial Complete windows SHALL remain fully visible and
operable within the browser viewport on desktop and mobile-sized landscape and
portrait presentations. Their title, instruction or completion content, and
action controls SHALL remain reachable without page or horizontal overflow,
and the game canvas SHALL remain usable behind the non-modal window.

#### Scenario: Tutorial opens in portrait

- **WHEN** a new session starts in a portrait viewport
- **THEN** the Tutorial title, instruction, `Next`, and `Skip Tutorial` actions
  are visible within the viewport and the window does not create horizontal
  overflow

#### Scenario: Tutorial opens in constrained landscape

- **WHEN** a new session starts in a short landscape viewport
- **THEN** the Tutorial title, instruction, `Next`, and `Skip Tutorial` actions
  remain visible inside the shared UI margins

#### Scenario: Completion window remains operable

- **WHEN** the Tutorial Complete window appears in any supported presentation
- **THEN** its title, matching body layout, and `Ok` action remain visible and
  operable without clipping or scrolling the page
