# floating-text Specification

## Purpose

Provides transient game-view text feedback for visible health changes so damage and healing can be understood at the affected world entity without turning React into a gameplay-state owner.

## Requirements

### Requirement: Visible health changes create signed floating text

When an entity with health receives an applied health delta while it is currently rendered in the game world view, the game SHALL create a new floating text instance attached to the top edge of that entity's grid cell. Negative health deltas SHALL render as red signed values such as `-2`, `-3`, or `-25`. Positive health deltas SHALL render as green signed values such as `+2` or `+10`. The displayed value SHALL reflect the actual applied delta after health clamping.

#### Scenario: Player takes visible damage
- **WHEN** the visible player takes an applied `-3` health delta from an enemy or other damage source
- **THEN** the game view renders a red `-3` floating text instance attached to the top edge of the player's grid cell

#### Scenario: Player receives clamped healing
- **WHEN** the visible player is missing `2` health and picks up an object that attempts to heal `+10`
- **THEN** the game view renders a green `+2` floating text instance attached to the top edge of the player's grid cell

#### Scenario: Future health entity receives a visible delta
- **WHEN** any current or future rendered entity with health receives an applied health delta
- **THEN** the game view renders a signed floating text instance using the actual applied delta and the damage or healing color

### Requirement: Floating text instances are independent and transient

Each floating text event SHALL create a separate floating text instance rather than updating an existing instance. Every instance SHALL fade in over `0.1` seconds, remain fully visible for `0.5` seconds, fade out over `0.1` seconds, and move upward by approximately `10%` of one grid-cell width during its lifetime.

#### Scenario: Rapid repeated damage creates separate text
- **WHEN** a visible entity takes three damage events rapidly
- **THEN** the game view creates three separate floating text instances at the same top-edge anchor and each instance animates independently

#### Scenario: Floating text completes its lifetime
- **WHEN** a floating text instance is created and no special interruption occurs
- **THEN** it fades in for 0.1 seconds, holds for 0.5 seconds, fades out for 0.1 seconds, moves upward by approximately 10% of one grid-cell width, and is then removed from presentation

### Requirement: Floating text is a presentation-only overlay

Floating text SHALL NOT occupy a world cell or change movement, collision, terrain, fog, health, combat, object pickup, entity simulation, minimap, mapview, or React-owned HUD state. Floating text SHALL render only in the game world view and SHALL NOT render in the minimap, map window, Character HUD, log, or other React UI surfaces.

#### Scenario: Floating text does not affect gameplay
- **WHEN** a floating text instance is active above an entity
- **THEN** movement, collision, combat, fog, object pickup, health state, and world-time simulation behave as if the floating text did not exist

#### Scenario: Floating text stays out of other views
- **WHEN** a visible health delta creates floating text in the game view
- **THEN** the minimap, map window, Character HUD, and log do not render that floating text instance

### Requirement: Non-rendered health changes do not create floating text records

When an entity receives a health delta while it is offscreen, hidden by fog, outside the active realm, or otherwise not currently rendered in the game world view, the game SHALL NOT create a floating text record for that event. Later visibility SHALL NOT replay or reveal floating text for health changes that occurred while the entity was not rendered.

#### Scenario: Offscreen enemy damage creates no text
- **WHEN** an enemy receives a health delta during world-time simulation while it is outside the current visible game view
- **THEN** no floating text record is created for that health delta

#### Scenario: Inactive-realm simulation creates no text
- **WHEN** an entity receives a health delta in a realm that is not the active rendered realm
- **THEN** no floating text record is created and no later realm switch replays that text

### Requirement: Floating text has dedicated style ownership

Floating text presentation SHALL have dedicated style ownership through a `floating-text.css` stylesheet and a `.floating_text...` class namespace for any DOM-backed presentation wrapper, fallback, or related UI/debug affordance. Floating text styling SHALL NOT be folded into unrelated HUD, character, window, map, or toast styles.

#### Scenario: Style ownership is separate
- **WHEN** implementation adds DOM-facing styles for floating text presentation or related debug/fallback UI
- **THEN** those styles live in `floating-text.css` using a `.floating_text...` class namespace
