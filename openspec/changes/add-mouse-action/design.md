# Design

## Context

The Babylon Lite layer currently receives keyboard, swipe, and mouse input in one controller, but the mouse route path explicitly excludes occupied and actionable cells before the shared movement implementation reaches the existing contact handlers. See proposal.md for motivation and the accompanying deltas for behavior.

## Goals / Non-Goals

**Goals:**

- Make one input-neutral direction resolver authoritative for travel, contact, denial, and their existing side effects.
- Let mouse targeting plan toward a legal cardinal action position without duplicating combat, digging, or object-interaction logic.
- Keep bounded 50-step cardinal routing and exact-cell reticle placement.

**Non-Goals:**

- Changing the effects, costs, targets, or availability rules of combat, digging, doors, chests, NPCs, or bombs.
- Adding a new input setting, React world-data access, a dependency, or automatic diagonal mouse navigation.
- Making Underground walls, water, or other presently non-actionable blockers destroyable.

## Decisions

### One intent pipeline owns movement and contact

Normalize every movement source to a directional player intent. A single planning-safe classifier will inspect the exact attempted cell and report `move`, `act`, or `deny`, including the eligible existing contact capability. The effectful direction resolver consumes that classification and remains the only place that commits movement, invokes the existing action responders, and applies their side effects.

Mouse planning will not call combat, mountain, or object handlers. It will ask the classifier whether the pointer cell is a travel or action destination, then emit the same cardinal directions as a manual input. Keeping separate mouse combat/dig handlers was rejected because it would duplicate target rules and could diverge in stamina, time, durability, or rendering behavior.

### Action targets end routes beside the target

For a green action target, build bounded cardinal distance fields from each cardinally adjacent legal travel cell, select the deterministic shortest route within 50 movement steps, and retain its final direction into the exact target. At that position, pass the final direction into the central resolver rather than treating the target as a traversable route cell.

This preserves exclusive occupancy and the rule that an action does not move the player into its target. Treating the target itself as walkable was rejected because it would permit entering enemies and blocked terrain.

### Reticle state derives from current classification

Reticle state is a view of the exact pointer cell: white for a bounded travel route, green for a bounded available action route, and red otherwise. Before each held attempt, recompute the classification and bounded route so changing terrain, occupancy, realm, or equipment never executes a stale plan. Existing HUD exclusion, pointer capture, release, lock, and context-menu behavior stay at the input boundary.

### Bomb remains a centralized non-directional action

Keep Space separate from directional navigation because it targets the current cardinal heading rather than a supplied destination. Route it through the same central action boundary so inventory availability and effects remain governed by one player-action ownership point. Converting Space to mouse targeting was rejected because it changes its established heading-based behavior.

## Risks / Trade-offs

- [Classifier drifts from effectful contact handling] -> Extract shared target discovery and capability predicates, then cover equivalent-input outcomes in focused tests.
- [Several action-adjacent route fields increase work] -> Bound every field to 50 steps and only calculate them while the pointer is on the playable canvas.
- [A target changes between automatic repeats] -> Reclassify immediately before each direction and stop when no bounded route remains.
- [Repeated holds unintentionally move on a lethal action] -> Preserve the ordinary rule that the action attempt leaves the player in place; only the next resolver invocation can move into a newly walkable cell.

## Migration Plan

The change is additive and needs no persisted-data migration. On release, existing manual inputs keep their controls while gaining the shared resolver; releasing a mouse button, losing capture, or entering an input lock clears the mouse plan. Reverting the change restores the previous red-only rejection of non-travel mouse targets without altering world data.
