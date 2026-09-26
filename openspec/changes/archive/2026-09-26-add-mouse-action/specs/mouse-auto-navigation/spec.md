# Spec Delta

## MODIFIED Requirements

### Requirement: Canvas pointer shows a resolved navigation reticle

When a mouse pointer is over an unobstructed playable canvas location, the game SHALL render one reticle inside that exact visible grid cell without exposing world data to React. The reticle SHALL use four corner marks at 50 percent opacity and no fill or extra coloration: white when the exact cell is available for travel and reachable within 50 cardinal movement steps, green when the exact non-travel cell has an action currently available to the player and has a reachable cardinal-adjacent action position within 50 movement steps, and red otherwise. The action classification SHALL use the same current capabilities and target rules as a direct player movement attempt. Pointer activity handled by HUD or UI controls SHALL not create or update a navigation target.

#### Scenario: Pointer selects a walkable canvas cell
- **WHEN** the mouse moves over an available visible travel cell that is reachable in 50 or fewer cardinal movement steps
- **THEN** the four-corner reticle renders inside that cell at 50 percent white opacity

#### Scenario: Pointer selects an actionable enemy
- **WHEN** the mouse points at a living enemy that the player's current capabilities can attack and a cardinal-adjacent action position is reachable in 50 or fewer movement steps
- **THEN** the reticle renders green on the enemy's exact cell

#### Scenario: Pointer selects a diggable Overground mountain
- **WHEN** the mouse points at an interior Overground mountain and the player has a Pickaxe with a reachable cardinal-adjacent action position
- **THEN** the reticle renders green on the mountain's exact cell

#### Scenario: Pointer falls on an unavailable cell
- **WHEN** the mouse points at terrain, an occupied cell, or a static cell that is unavailable for both travel and action
- **THEN** the reticle renders red on that exact pointer cell and creates no navigation target

#### Scenario: Pointer falls on a denied cell
- **WHEN** the mouse points at a cell that is neither available for travel nor currently actionable, including an Underground wall
- **THEN** the reticle renders red on that exact pointer cell and creates no navigation target

#### Scenario: Pointer has no bounded route
- **WHEN** the exact travel cell or a cardinal-adjacent action position cannot be reached from the player in 50 or fewer cardinal movement steps
- **THEN** the reticle renders red on that exact pointer cell and mouse navigation remains idle

#### Scenario: HUD control receives the pointer
- **WHEN** the player moves or presses the mouse on a HUD or UI control
- **THEN** that control keeps its normal behavior and no mouse navigation target is created or changed

### Requirement: Held mouse buttons perform bounded automatic navigation

While a valid white travel target or green action target exists, holding the primary mouse button SHALL automatically walk toward it and holding the secondary mouse button SHALL automatically sprint toward it. Automatic navigation SHALL use only cardinal steps, accept a travel route or a route to a cardinal-adjacent action position only when it contains at most 50 movement steps, and execute every direction through the same player movement-and-contact resolution as keyboard, WASD, and canvas-swipe input. At an action position, the next automatic direction SHALL target the green cell and use the ordinary contact outcome; a held button SHALL repeat later action attempts under the ordinary input cadence while that target remains actionable. The primary button SHALL use the existing walking cadence and the secondary button SHALL use the existing Shift sprint cadence. Releasing the active button, losing its pointer capture, opening a gameplay input lock, or losing the resolved target SHALL stop automatic navigation. A secondary-button press on the playable canvas SHALL not open the browser context menu.

#### Scenario: Primary hold walks along a short route
- **WHEN** the player holds the primary mouse button with a resolved white target whose route requires 50 or fewer cardinal movement steps
- **THEN** the player takes ordinary walking steps along that route until the target is reached or the hold ends

#### Scenario: Secondary hold sprints along the same route
- **WHEN** the player holds the secondary mouse button with the same resolved white target
- **THEN** the player takes the same ordinary cardinal steps using the existing sprint repeat cadence

#### Scenario: Held mouse reaches and attacks an enemy
- **WHEN** the player holds either mouse button on a resolved green enemy target
- **THEN** the player routes to a cardinal-adjacent cell and each subsequent cardinal attempt into that enemy uses the ordinary player attack behavior

#### Scenario: Held mouse digs a mountain
- **WHEN** the player holds either mouse button on a resolved green interior Overground mountain target while a Pickaxe remains available
- **THEN** the player routes to a cardinal-adjacent cell and each subsequent cardinal attempt uses the ordinary mountain-dig behavior

#### Scenario: Mouse navigation does not replace manual input
- **WHEN** a player uses keyboard, WASD, or canvas-swipe movement
- **THEN** those inputs retain their existing manual direction, collision, contact, time, stamina, and diagonal behavior

#### Scenario: Invalid reticle rejects either mouse button
- **WHEN** the reticle is red
- **THEN** holding either the primary or secondary mouse button performs no movement, contact action, or automatic route resolution

### Requirement: Automatic routes avoid unavailable cells and reroute

Automatic navigation SHALL treat every cell that is neither an available travel cell nor the exact resolved action target as unavailable for its route. It SHALL reclassify the exact pointer cell before each automatic attempt using current terrain, static occupancy, dynamic occupancy, object state, realm, and player capabilities. When a white target becomes unavailable, or when a green target loses its available action or reachable cardinal-adjacent action position, the game SHALL resolve a replacement bounded route only from the current classification and continue only if it remains valid and no longer than 50 movement steps.

#### Scenario: Automatic route detours around a wall
- **WHEN** a reachable white target lies beyond non-walkable terrain but has an available cardinal route of 50 or fewer movement steps
- **THEN** automatic navigation follows the detour without attempting to enter the non-walkable terrain

#### Scenario: Dynamic actor blocks the next route cell
- **WHEN** an enemy or NPC occupies a pending automatic route cell that is not the exact green action target
- **THEN** automatic navigation reroutes or stops without contacting that actor

#### Scenario: Target changes after an action
- **WHEN** a held green-target action destroys an enemy or mountain and the exact pointer cell becomes a reachable travel cell
- **THEN** the next automatic attempt reclassifies that cell as white and uses the ordinary movement behavior

#### Scenario: Changed route exceeds the cap
- **WHEN** reclassification would require more than 50 movement steps or finds no valid travel or action route
- **THEN** automatic navigation stops without moving into or acting upon a denied cell
