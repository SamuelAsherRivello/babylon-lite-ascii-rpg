# Design

The existing movement loop retains combat resolution first. If combat returns `handled: false`, the cardinal interaction path must continue to the object spawner rather than treating the occupied chest destination as a completed movement attempt. Chest interaction remains responsible for opening the chest and preventing movement into its non-walkable cell.

The object spawner will derive reward candidates from the chest's eight neighbors, then reject non-walkable cells, the current player cell, rendered occupants, and active objects in the same world. Existing seeded randomness remains the tie-breaker. No renderer, dependency, or React bridge changes are needed.
