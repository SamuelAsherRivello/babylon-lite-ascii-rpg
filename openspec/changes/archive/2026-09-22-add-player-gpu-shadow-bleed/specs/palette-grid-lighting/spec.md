# Spec Delta

## ADDED Requirements

### Requirement: Bounded player GPU shadow bleed

When `Lighting GPU Light Pass` is enabled, the game SHALL provide a persisted
`Player GPU Shadow Bleed Range` setting with the click-through values `0`,
`1`, `2`, `3`, `4`, and `6` grid cells. The setting SHALL default to `2` when
no stored value exists and SHALL be cleared by Reset Settings. It SHALL affect
only the GPU presentation of player light, not authoritative grid lighting,
world data, palette data, collision, or player movement.

#### Scenario: Default player penumbra range

- **WHEN** no stored player GPU shadow-bleed preference exists
- **THEN** `Player GPU Shadow Bleed Range` SHALL display `2` and the GPU pass
  SHALL use a two-cell maximum simulated player penumbra

#### Scenario: Click through the supported ranges

- **WHEN** a player activates `Player GPU Shadow Bleed Range`
- **THEN** it SHALL advance through `0`, `1`, `2`, `3`, `4`, and `6` before
  returning to `0`, without changing any other lighting setting

### Requirement: Player shadow core preserves only ambient light

At every ambient level, a player-light target with an intervening unwalkable
blocker SHALL receive no direct player GPU composite. The GPU pass SHALL render
a dim, rapidly fading, simulated player penumbra only within the selected
number of grid cells immediately behind the first blocker on that player's
straight grid-light path. Cells beyond the selected range SHALL receive zero
player GPU composite; the player GPU composite SHALL not leak across the
shadow boundary through unrestricted soft blur. Existing ambient illumination
SHALL remain able to make the hard-shadow core visible when ambient is above
`0`.

#### Scenario: Unobstructed player light remains direct

- **WHEN** a visible cell has an unobstructed path to the player within the
  selected player-light radius
- **THEN** it SHALL receive the normal player GPU light presentation according
  to the selected player brightness and falloff

#### Scenario: Player shadow fringe is bounded

- **WHEN** a visible cell is behind the first unwalkable blocker from the
  player and its shadow distance is within the selected `Player GPU Shadow
  Bleed Range`
- **THEN** it SHALL receive only the simulated dim player penumbra, with less
  presentation brightness farther behind the blocker

#### Scenario: Ambient alone can illuminate the player shadow core

- **WHEN** a visible cell lies beyond the selected player GPU shadow-bleed
  range behind an unwalkable blocker and ambient is above `0`
- **THEN** it SHALL receive zero player GPU composite contribution and only
  the existing ambient presentation from this player-light path

#### Scenario: Player shadow core stays dark at zero ambient

- **WHEN** a visible cell lies beyond the selected player GPU shadow-bleed
  range behind an unwalkable blocker and ambient is `0`
- **THEN** it SHALL receive zero player GPU composite contribution and no
  ambient illumination

#### Scenario: Another source can still illuminate the player shadow

- **WHEN** a visible cell is in the player's hard-shadow core but has an
  unobstructed contribution from a torch or another applicable source
- **THEN** that other source SHALL remain able to illuminate the cell according
  to its own existing settings

## MODIFIED Requirements

### Requirement: Level ambient and source profiles

The game SHALL maintain one level-wide ambient value in the inclusive range
`0..1`, defaulting to `0.6` when local storage is empty. Ambient `0` SHALL provide no global illumination;
ambient `1` SHALL fully light every visible cell and SHALL make torch and player
source changes produce no visual difference. Torch Lighting, Player Lighting,
Torch Shadow, and Player Shadow profiles SHALL be independently selectable
from exactly `Off`, `Low`, `Med`, `High`, and `X High`. When their stored
preferences are absent, Player Lighting SHALL default to `X High` and Player
Shadow SHALL default to `High`; existing stored profile choices SHALL be
preserved.

#### Scenario: Ambient endpoint behavior

- **WHEN** the level ambient value is `0` or `1`
- **THEN** `0` SHALL leave only active source contribution and `1` SHALL
  produce a fully lit scene regardless of source state; GPU source-composite
  intensity SHALL continuously scale by `1 - ambient`, so at `1` source,
  shadow, falloff, and bleed controls have no visible result

#### Scenario: Full ambient hides the GPU source composite

- **WHEN** Light Ambient is `1` and `Lighting GPU Light Pass` is enabled
- **THEN** the GPU source-composite contribution SHALL naturally evaluate to
  zero through ambient-headroom scaling

#### Scenario: Independent source profiles

- **WHEN** any torch or player lighting or shadow profile control is changed
- **THEN** that source setting SHALL use its own selected state without
  changing the other source settings

#### Scenario: Missing player preferences use the selected defaults

- **WHEN** Player Lighting and Player Shadow have no stored preferences
- **THEN** the game SHALL display and apply Player Lighting `X High` and
  Player Shadow `High`

### Requirement: Settings reset

The UI SHALL provide a `Reset Settings` button at the bottom of the Settings
section. Activating it SHALL clear local storage and reload the page so the
cleared-storage defaults are restored.

#### Scenario: Reset settings restores defaults

- **WHEN** the user activates `Reset Settings`
- **THEN** local storage SHALL be empty and the page SHALL reload with Torch
  Lighting `Low`, Player Lighting `X High`, Torch Shadow `X High`, Player
  Shadow `High`, GPU Light Pass enabled, and ambient `0.6`
