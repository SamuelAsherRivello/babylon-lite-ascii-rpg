# Spec Delta

## ADDED Requirements

### Requirement: Floating text remains game-layer owned and render-gated

Babylon Lite SHALL own floating-text health-change event capture, lifetime timing, positioning, rendering, resources, and disposal. React SHALL NOT receive floating-text records, entity health deltas for presentation, mutable entity positions, or renderer resources. The game layer SHALL create floating text only for health changes affecting entities that are currently rendered in the active game world view, so offscreen tick simulation does not allocate presentation records.

#### Scenario: React does not own floating text
- **WHEN** a visible health delta creates floating text
- **THEN** Babylon Lite owns the floating text record and React receives no floating-text-specific snapshot or renderer resource

#### Scenario: Offscreen simulation avoids presentation work
- **WHEN** an offscreen or inactive-realm entity receives a health delta during a world-time tick
- **THEN** the game layer updates simulation state without allocating a floating-text presentation record
