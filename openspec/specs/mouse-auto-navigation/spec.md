# mouse-auto-navigation Specification

## Purpose

Provides bounded mouse-driven destination selection and automatic cardinal
navigation while preserving the game's existing manual movement controls.

## Requirements

### Requirement: Canvas pointer shows a resolved navigation reticle

When a mouse pointer is over an unobstructed playable canvas location, the
game SHALL render one reticle inside that exact visible grid cell without
exposing world data to React. The reticle SHALL use four corner marks at 50
percent opacity and no fill or extra coloration: white when the exact cell is
available and reachable within 50 cardinal steps, red otherwise. Pointer
activity handled by HUD or UI controls SHALL not create or update a navigation
target.

#### Scenario: Pointer selects a walkable canvas cell
- **WHEN** the mouse moves over an available visible canvas cell that is
  reachable in 50 or fewer cardinal steps
- **THEN** the four-corner reticle renders inside that cell at 50 percent
  white opacity

#### Scenario: Pointer falls on an unavailable cell
- **WHEN** the mouse points at terrain, an occupied cell, or a static cell
  that is unavailable for automatic navigation
- **THEN** the reticle renders red on that exact pointer cell and creates no
  navigation target

#### Scenario: Pointer has no bounded route
- **WHEN** the exact available pointer cell cannot be reached from the player
  in 50 or fewer cardinal steps
- **THEN** the reticle renders red on that exact pointer cell and mouse
  navigation remains idle

#### Scenario: HUD control receives the pointer
- **WHEN** the player moves or presses the mouse on a HUD or UI control
- **THEN** that control keeps its normal behavior and no mouse navigation
  target is created or changed

### Requirement: Held mouse buttons perform bounded automatic navigation

While a valid white destination exists, holding the primary mouse button SHALL
automatically walk toward it and holding the secondary mouse button SHALL
automatically sprint toward it. Automatic navigation SHALL use only cardinal
steps, accept a route only when it contains at most 50 movement steps, and
execute each accepted step through the ordinary successful player-movement
path. The primary button SHALL use the existing walking cadence and the
secondary button SHALL use the existing Shift sprint cadence. Releasing the
active button, losing its pointer capture, opening a gameplay input lock, or
losing the resolved target SHALL stop automatic navigation. A secondary-button
press on the playable canvas SHALL not open the browser context menu.

#### Scenario: Primary hold walks along a short route
- **WHEN** the player holds the primary mouse button with a resolved target
  whose route requires 50 or fewer cardinal steps
- **THEN** the player takes ordinary walking steps along that route until the
  target is reached or the hold ends

#### Scenario: Secondary hold sprints along the same route
- **WHEN** the player holds the secondary mouse button with the same resolved
  target
- **THEN** the player takes the same ordinary cardinal steps using the existing
  sprint repeat cadence

#### Scenario: Mouse navigation does not replace manual input
- **WHEN** a player uses keyboard, WASD, or canvas-swipe movement
- **THEN** those inputs retain their existing manual direction, collision,
  contact, time, and stamina behavior

#### Scenario: Invalid reticle rejects either mouse button
- **WHEN** the reticle is red
- **THEN** holding either the primary or secondary mouse button performs no
  movement or automatic route resolution

### Requirement: Automatic routes avoid unavailable cells and reroute

Automatic navigation SHALL treat non-walkable terrain, active static objects,
buildings, closed doors, chests, and all dynamic occupants other than the
player as unavailable route cells. It SHALL not initiate combat, door, chest,
or NPC contact. When the held route becomes unavailable because its target,
occupancy, terrain, or static navigation state changes, the game SHALL resolve
a new bounded route to the current resolved target and continue only if that
route remains valid and no longer than 50 steps.

#### Scenario: Automatic route detours around a wall
- **WHEN** a reachable target lies beyond non-walkable terrain but has an
  available cardinal route of 50 or fewer steps
- **THEN** automatic navigation follows the detour without attempting to enter
  the non-walkable terrain

#### Scenario: Dynamic actor blocks the next route cell
- **WHEN** an enemy or NPC occupies a pending automatic route cell
- **THEN** automatic navigation does not attack or contact that actor and
  instead continues only after finding a different valid bounded route

#### Scenario: Changed route exceeds the cap
- **WHEN** rerouting would require more than 50 movement steps or finds no
  available route
- **THEN** automatic navigation stops without moving into an unavailable cell
