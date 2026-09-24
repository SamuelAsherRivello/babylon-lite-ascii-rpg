# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered pass density catalog
The Level Generation tab SHALL display the current fifteen raw catalog entries in execution order: Ground (1), Overground Walls (2), Underground Caves (3), Water (4), Walkability (5), Player Position (6), Heart (7), Chest (8), Trap (9), Torch (10), NPC (11), Fireplace (12), Civilization Stairs (13), Civilization Doors (14), and Enemy Spawner Distribution (15). It SHALL present those entries as nine semantic cards: the first six entries retain individual cards; `7. Object Distribution` contains Heart, Chest, Trap, Torch, and Fireplace; `8. Civilization Placement` contains Stairs and Doors; and `9. Character Distribution` contains Enemy then NPC. Civilization Placement SHALL not display a card-level realm label. Object Distribution SHALL retain separate Heart, Chest, Trap, Torch, and Fireplace Low, Med, and High rows and SHALL describe itself as controlling objects. Character Distribution SHALL visibly identify Enemy as `Realm: Underworld` and NPC as `Realm: Overworld`. Civilization Placement SHALL present paired `Stairs` before `Doors`, with each using Low, Med, and High controls, and the Doors row SHALL visibly identify `Realm: Underground`. Stairs SHALL have its own Low, Med, and High controls initialized once with the current Heart count values; changing either row SHALL NOT change the other. Fixed Ground and Player Position entries SHALL display their baseline without density controls. Each configurable row SHALL visibly identify its selected value.

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all nine semantic cards are visible or reachable by scrolling, their underlying entries remain in the fifteen-entry execution order, Object Distribution contains only object rows and says it controls objects, Civilization Placement shows paired Stairs before Doors with no card-level realm, Character Distribution lists Enemy before NPC with their Underworld and Overworld realms, every configurable row has its own control, and Ground and Player Position have no density control

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization's Doors row in the Underworld preview
- **THEN** that selection becomes the unpersisted `civilization-doors` draft value for door-group distribution and the selected value is visibly identified

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization` density selection but no `civilization-doors` selection
- **THEN** the catalog restores that density as the Doors selection and retains the complete current fourteen-entry catalog

#### Scenario: Stairs density is independent from Hearts
- **WHEN** a developer changes either the Heart or Stairs density selection
- **THEN** only that row's selected value and distribution count change; the other row retains its own value

#### Scenario: New generated object appears in Object Distribution
- **WHEN** a configurable object is registered as level-generated
- **THEN** the Object Distribution card SHALL show its labeled density row without requiring a separate top-level pass card
