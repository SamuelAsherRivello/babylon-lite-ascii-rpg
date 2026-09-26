# Spec Delta

## Purpose

Provides animated Spider art for each living enemy and a realm-scoped inert
death visual without changing the authoritative enemy gameplay model.

## ADDED Requirements

### Requirement: Living enemies use Spider animation states
The game SHALL render every living enemy using the supplied Spider frames instead of a visible enemy text glyph. A living spider SHALL use idle while it is stationary, move while it changes grid cells, and attack when it resolves an enemy attack. It SHALL return from a completed move or attack animation to idle when still alive, and its horizontal presentation SHALL use the enemy's existing facing state.

#### Scenario: Stationary spider idles
- **WHEN** a living enemy is visible and has not started a move or attack animation
- **THEN** the game displays the looping Spider idle animation at that enemy's occupied cell

#### Scenario: Spider movement animates
- **WHEN** a living enemy successfully changes to a new grid cell
- **THEN** the game displays the Spider move animation before returning that living enemy to idle

#### Scenario: Spider attack animates
- **WHEN** an eligible living enemy attacks the player
- **THEN** the game displays the Spider attack animation before returning that living enemy to idle

### Requirement: Spider art preserves the enemy's one-cell gameplay footprint
Spider art SHALL be a visual presentation only. Every living enemy SHALL retain its existing one-cell occupancy, collision, navigation, combat reach, and damage behavior regardless of its displayed animation frame.

#### Scenario: Sprite does not alter combat occupancy
- **WHEN** a spider animation extends beyond its occupied grid cell visually
- **THEN** the enemy's movement, collision, targeting, and attack behavior continue to use only its existing one-cell logical position

### Requirement: Enemy death frame persists within the active realm session
When an enemy reaches zero health, the game SHALL play its Spider death animation and retain its final death frame as a non-interactive visual record while the player remains in that realm. The record SHALL not be removed merely because it is outside the viewport, fogged, or not currently rendered. The game SHALL discard the record when the player leaves that realm, and a browser refresh SHALL not restore it.

#### Scenario: Final death frame is inert
- **WHEN** a spider completes its death animation while the player remains in the same realm
- **THEN** its final death frame remains visible whenever its cell is viewable and cannot move, attack, block, be targeted, receive damage, or otherwise participate in gameplay

#### Scenario: Offscreen death frame is retained
- **WHEN** a dead spider's cell leaves the viewport while the player remains in the same realm
- **THEN** the game retains its final death-frame record and shows it again if that cell later becomes viewable

#### Scenario: Realm exit clears death frames
- **WHEN** the player leaves a realm containing retained spider death frames and later returns to it
- **THEN** those prior death-frame records are absent
