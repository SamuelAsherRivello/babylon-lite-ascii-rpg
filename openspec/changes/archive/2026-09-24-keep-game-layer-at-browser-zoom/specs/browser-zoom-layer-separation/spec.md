# Spec Delta

## Purpose

Separates browser readability zoom for the React HUD from the apparent scale of the Babylon Lite game presentation while preserving input, aspect, and gameplay behavior.

## ADDED Requirements

### Requirement: Browser zoom separates UI and game presentation

The application SHALL allow browser page zoom changes to resize and reflow the React-owned `ui_layer` while keeping the Babylon Lite game presentation at its 100% apparent browser scale within the selected presentation frame.

#### Scenario: Browser zoom increases

- **WHEN** a desktop user changes Chrome page zoom from 100% to 125% using Ctrl+mouse-wheel
- **THEN** React-owned HUD and windows SHALL respond to the zoomed CSS viewport while the game world SHALL not become proportionally larger or smaller as a result of browser zoom alone

#### Scenario: Browser zoom decreases

- **WHEN** a desktop user changes Chrome page zoom from 100% to 80% using Ctrl+mouse-wheel
- **THEN** React-owned HUD and windows SHALL respond to the zoomed CSS viewport while the game world SHALL retain its 100% apparent scale

### Requirement: Browser zoom does not change in-game zoom

Browser page zoom SHALL remain independent from the persisted ten-level in-game zoom setting. A browser zoom change SHALL NOT alter the displayed in-game zoom value, its stored value, or its Babylon Lite glyph-scale selection.

#### Scenario: Browser zoom preserves game zoom

- **WHEN** the user changes browser page zoom while the in-game Zoom control is set to any supported level
- **THEN** the in-game Zoom control and game rendering SHALL retain that selected level

### Requirement: Compensated game presentation preserves input

The game SHALL translate pointer and swipe coordinates through any browser-zoom compensation so that canvas movement, mapview interaction, and other game-layer pointer behavior target the same logical location as at 100% browser zoom.

#### Scenario: Pointer movement after browser zoom

- **WHEN** the user changes browser page zoom and performs a pointer or swipe gesture on the game presentation
- **THEN** the game SHALL interpret the gesture using the correct compensated game-frame coordinates

### Requirement: Browser zoom preserves presentation modes

Browser zoom compensation SHALL preserve the selected landscape or portrait aspect mode, desktop portrait 9:16 frame, mobile viewport behavior, fullscreen behavior, HUD layering, and game-owned transition surfaces.

#### Scenario: Browser zoom in desktop portrait

- **WHEN** a desktop user changes browser page zoom while the persisted Aspect setting is Portrait
- **THEN** the centered 9:16 game frame and its surrounding presentation SHALL retain their selected mode while React UI remains responsive to browser zoom

#### Scenario: Browser zoom on mobile portrait

- **WHEN** a mobile user changes the browser viewport or browser zoom behavior while Aspect is Portrait
- **THEN** the game SHALL continue to fill the mobile viewport without applying the desktop-only 9:16 compensation behavior

### Requirement: Browser zoom changes are bounded and stable

The game SHALL handle browser zoom changes without recursive resize loops, stale canvas dimensions, visible blank game frames, document-level horizontal overflow caused by compensation, or loss of React control hit-testing.

#### Scenario: Repeated browser zoom changes

- **WHEN** the user cycles browser zoom through 80%, 100%, and 125% while the game is running
- **THEN** the game and HUD SHALL remain rendered and usable at each level without accumulating layout or renderer state
