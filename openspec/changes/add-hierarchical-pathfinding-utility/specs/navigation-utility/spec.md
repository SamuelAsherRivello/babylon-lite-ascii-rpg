# Spec Delta

## Purpose

Provides one game-layer routing contract for deterministic cardinal navigation across walkable generated realms without granting routing code authority over movement or world state.

## ADDED Requirements

### Requirement: Deterministic cardinal route results

The game layer SHALL provide route and reachability results for two grid cells using only cardinal walkable cells and caller-supplied static blockers. A route result SHALL either identify an unreachable target or return a deterministic sequence of free cardinal cells from the source toward the target. Route queries SHALL not move entities, transfer realms, change discovery, mutate world data, or expose mutable world data to React.

#### Scenario: Same-realm walkable route
- **WHEN** a game-layer consumer requests a route between two connected walkable cells in one realm
- **THEN** the result SHALL contain deterministic cardinal cells beginning at the source and ending at the requested target

#### Scenario: Blocked target is unreachable
- **WHEN** every cardinal connection between the source and target is blocked by terrain or supplied static blockers
- **THEN** the result SHALL identify the target as unreachable and SHALL not mutate any game state

### Requirement: Hierarchical distant routing

For a distant same-realm route, the game layer SHALL first determine a deterministic cardinal-only coarse route through fixed walkable navigation sectors and SHALL direct the caller toward a reachable cardinal exit into the next sector. It SHALL refine the route to exact cardinal grid cells when the target is in the local refinement area. A coarse result SHALL not claim that it is an exact shortest cell-by-cell route before refinement.

#### Scenario: Distant route crosses a wall barrier
- **WHEN** the source and target are in different navigation sectors and a wall blocks their direct Manhattan direction
- **THEN** the result SHALL select a reachable next-sector exit rather than direct the caller into the wall

#### Scenario: Local route is refined
- **WHEN** the source reaches the target's local refinement area
- **THEN** the result SHALL provide a deterministic exact cardinal route to the target using the supplied walkability and blockers

### Requirement: Opt-in stair-mediated cross-realm routing

The route contract SHALL keep realms separate unless a caller explicitly enables cross-realm routing. When enabled, it SHALL connect realms only through valid paired walkable stairs and return ordered realm-local route segments with the intervening stair transition. The contract SHALL not itself move an entity onto stairs or transfer an entity between realms.

#### Scenario: Cross-realm mode finds a paired-stair route
- **WHEN** a caller explicitly enables cross-realm routing between connected realms that have a reachable paired stair connection
- **THEN** the result SHALL contain a source-realm segment to the stair, a stair transition, and a destination-realm segment to the target

#### Scenario: Default route remains realm-local
- **WHEN** a caller requests a route without enabling cross-realm routing and the target is in a different realm
- **THEN** the result SHALL identify the target as unreachable
