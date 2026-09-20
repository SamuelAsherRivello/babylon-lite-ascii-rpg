# Spec Delta

## Purpose

Helps players understand Settings actions and displayed lighting values through concise explanations that appear when the controls are hovered.

## ADDED Requirements

### Requirement: Settings controls provide hover explanations

The UI SHALL show a brief explanation when the pointer hovers each interactive control in the Settings section: Fullscreen, Camera mode, Torch lighting, Player lighting, Torch Shadow, Player Shadow, Ambient increase and decrease, Zoom increase and decrease, and Reset Settings. The explanation SHALL describe the hovered control's action, SHALL disappear when hover ends, and SHALL not cover the control or prevent its action. This SHALL also apply to an Ambient or Zoom button when it is disabled at a value limit.

#### Scenario: Hover a setting

- **WHEN** the pointer hovers a Settings control
- **THEN** the UI SHALL show that control's short action explanation without changing its visible label or current value

#### Scenario: Hover ends

- **WHEN** the pointer leaves a Settings control
- **THEN** its hover explanation SHALL no longer be shown

#### Scenario: Control is at its limit

- **WHEN** the pointer hovers a disabled Ambient or Zoom increase or decrease button
- **THEN** its action explanation SHALL still be available

#### Scenario: Narrow viewport

- **WHEN** a Settings control is hovered in a narrow browser viewport
- **THEN** its explanation SHALL remain readable within the visible viewport

### Requirement: Lighting explanations define displayed values

The Torch and Player lighting explanations SHALL identify which light source is changed and SHALL define their displayed abbreviations with exactly one word each: `R` Radius, `M` Maximum, and `F` Falloff. The Torch and Player Shadow explanations SHALL identify which source's shadow profile is changed and SHALL define their displayed abbreviations with exactly one word each: `O` Occlusion and `B` Bleed. Each key SHALL remain correct as its selected profile changes. The Ambient explanations SHALL identify the level-wide light scale and define `0` as dark and `1` as bright.

#### Scenario: Torch or Player lighting is hovered

- **WHEN** the pointer hovers either lighting profile control
- **THEN** its explanation SHALL identify the affected source and include the complete `R/M/F` key

#### Scenario: Torch or Player Shadow is hovered

- **WHEN** the pointer hovers either shadow profile control
- **THEN** its explanation SHALL identify the affected source and include the complete `O/B` key

#### Scenario: Ambient action is hovered

- **WHEN** the pointer hovers either Ambient button
- **THEN** its explanation SHALL identify the increase or decrease action and the `0` dark to `1` bright scale

### Requirement: Existing setting behavior is preserved

Hover explanations SHALL be supplementary; the Settings labels, displayed values, activation behavior, and persistence SHALL remain as they were before the explanations were added.

#### Scenario: Activate a setting after reading its explanation

- **WHEN** a player hovers a control and then activates it
- **THEN** that control SHALL perform its existing action and the displayed setting SHALL update as before
