# Spec Delta

## MODIFIED Requirements

### Requirement: Settings controls provide hover explanations

The UI SHALL show a brief explanation when the pointer hovers each interactive
control in the Settings section: Fullscreen, Aspect, Show UI, Minimap, Camera
mode, Realm, Zoom increase and decrease, Send Toast, and Reset Settings. It
SHALL also show an explanation for each
interactive Lighting window control: GPU Light Pass, Torch lighting, Player
lighting, Player GPU Shadow Bleed Range, Torch Shadow, Player Shadow, and
Ambient increase and decrease. The explanation SHALL describe the hovered
control's action, SHALL disappear when hover ends, and SHALL not cover the
control or prevent its action. This SHALL also apply to an Ambient or Zoom
button when it is disabled at a value limit.

#### Scenario: Hover a setting

- **WHEN** the pointer hovers a Settings or Lighting window control
- **THEN** the UI SHALL show that control's short action explanation without
  changing its visible label or current value

#### Scenario: Hover ends

- **WHEN** the pointer leaves a Settings or Lighting window control
- **THEN** its hover explanation SHALL no longer be shown

#### Scenario: Control is at its limit

- **WHEN** the pointer hovers a disabled Ambient or Zoom increase or decrease
  button
- **THEN** its action explanation SHALL still be available

#### Scenario: Narrow viewport

- **WHEN** a Settings or Lighting window control is hovered in a narrow
  browser viewport
- **THEN** its explanation SHALL remain readable within the visible viewport

#### Scenario: Hover Send Toast

- **WHEN** the pointer hovers or focuses Send Toast
- **THEN** the UI SHALL explain that the action sends a test toast without
  changing the visible button label
