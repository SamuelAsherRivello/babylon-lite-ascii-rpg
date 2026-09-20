# Spec Delta

## ADDED Requirements

### Requirement: Lighting window remains responsive

The Lighting launcher SHALL open the existing non-modal Lighting window without freezing the browser. Its controls, title-bar drag, close action, and reopen behavior SHALL remain usable and SHALL not reset or corrupt lighting values.

#### Scenario: Open, use, close, and reopen Lighting
- **WHEN** a player activates Lighting, changes a lighting control, closes the window, and activates Lighting again
- **THEN** the window SHALL complete each action, close only when requested, and reopen with the current saved values

#### Scenario: Keep the game usable with Lighting open
- **WHEN** the Lighting window is open
- **THEN** game input, HUD controls, and every Lighting control SHALL remain responsive
