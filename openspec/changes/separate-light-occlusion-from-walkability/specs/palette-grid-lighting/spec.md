# Spec Delta

## MODIFIED Requirements

### Requirement: Torch grid lighting

The game layer SHALL derive a bounded lighting factor for each rendered world
cell from the grid distance to every active torch and player source. A source
SHALL contribute inside its configured radius using the existing monotonic
falloff and selected source-shadow profile. An intervening terrain cell that
blocks light SHALL apply that profile's occlusion and bleed values without
altering terrain walkability. The `X High` shadow profile SHALL contribute zero
beyond an intervening light blocker. Cells outside all source radii, or hidden
from every source by an `X High` shadow profile, SHALL retain the level ambient
factor. A terrain cell without an explicit light-blocking value SHALL retain
the legacy behavior of blocking light when it is unwalkable.

#### Scenario: Cell inside an active source radius

- **WHEN** a visible cell is within the configured grid radius of an active
  torch or player source and no light-blocking cell blocks the straight path
- **THEN** its lighting factor SHALL be greater than the ambient factor and no
  greater than the maximum lit factor

#### Scenario: Cell outside active source radii

- **WHEN** a visible cell is outside every active source radius
- **THEN** its lighting factor SHALL equal the level ambient factor

#### Scenario: Cell inside a source radius but behind blocked terrain

- **WHEN** a wall, mountain, closed opaque object, or other light-blocking
  terrain cell lies between an active source and an in-range target cell whose
  source uses the `X High` shadow profile
- **THEN** that source SHALL add no light to the target cell, including when a
  walkable path could reach the target around the blocker

#### Scenario: Non-walkable water does not block direct light

- **WHEN** a non-walkable canonical water cell that does not block light lies
  between an active source and an in-range target cell
- **THEN** the source SHALL contribute to the target as though the water cell
  were not on the straight path
- **AND** the water cell SHALL remain non-walkable

#### Scenario: Overlapping torch fields

- **WHEN** a visible cell is within more than one active source radius
- **THEN** only sources with an unobstructed straight path SHALL contribute,
  and the combined factor SHALL remain bounded by the configured maximum and
  SHALL not become darker because another source is added

### Requirement: Terrain shadows without Babylon light objects

The lighting client SHALL form straight grid shadows from explicit terrain
light occlusion and SHALL keep using palette modulation rather than Babylon
light objects or shadow generators. A non-walkable cell that does not block
light SHALL receive and transmit source light normally. A light-blocking target
cell SHALL receive light from a source that can reach it directly, but SHALL
apply the selected source-shadow profile to that source's light beyond it.
Light SHALL not travel around corners. Level ambient SHALL continue to
illuminate shadowed cells according to the ambient setting. Changes to a
dynamic opaque object's blocking state SHALL update the resulting shadows.

#### Scenario: Source-facing blocker is lit

- **WHEN** an active source reaches a light-blocking cell within its radius
  with no earlier blocker on the straight path
- **THEN** that light-blocking cell SHALL receive the source contribution

#### Scenario: Straight shadow behind blocker

- **WHEN** a cell lies behind a light-blocking terrain cell on its straight
  path from an active source using the `X High` shadow profile
- **THEN** that source SHALL contribute no light to the cell even if the cell
  is within the source radius

#### Scenario: Lower shadow profile bleeds source light

- **WHEN** a cell lies behind a light-blocking terrain cell on its straight
  path from an active source using `Low`, `Med`, or `High` shadow settings
- **THEN** that source SHALL retain the profile's configured bleed fraction,
  with subsequent blockers applying the configured occlusion again

#### Scenario: Closed diagonal corner

- **WHEN** a straight path to a target touches a light-blocking cell at a grid
  corner before reaching the target
- **THEN** that source SHALL contribute no light through that corner

#### Scenario: Transparent impassable terrain at a diagonal corner

- **WHEN** a straight path to a target touches only non-walkable terrain cells
  that do not block light at a grid corner
- **THEN** that source SHALL contribute light through the corner

#### Scenario: Dynamic opaque object opens

- **WHEN** an opaque blocking object changes to an open state
- **THEN** its cell SHALL cease blocking direct light while retaining its
  separately defined movement behavior

#### Scenario: Another source reaches the shadow

- **WHEN** a cell is blocked from one source but has an unobstructed straight
  path to another active source
- **THEN** the unblocked source SHALL brighten the cell according to its
  existing profile and falloff

#### Scenario: Ambient endpoint in a shadow

- **WHEN** ambient is set to `0` or `1` and a cell is blocked from every
  active source
- **THEN** the cell SHALL use factor `0` or `1`, respectively
