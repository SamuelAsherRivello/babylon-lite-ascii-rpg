# Design

## Context

See proposal.md - Why. The current NPC system owns NPC registration and recruitment, while pathfinding, dynamic occupancy, building geometry, and the player-driven update loop are separate concerns. Existing unrecruited NPCs use stored patrol routes and must retain that behavior.

## Goals / Non-Goals

**Goals:**

- Extract following into a portable behavior that can follow any target through supplied navigation adapters.
- Make recruited NPC state authoritative by configuring that behavior for NPCs.
- Keep the companion visibly behind the player within the specified 3–5-cell range.
- Carry recruited NPC identity and state across stair-triggered realm replacement, then seed each companion into the new realm near the player.
- Evaluate recruited-companion movement from the frame/update path so a distant companion can advance every frame, while leaving ambient NPC patrols on the existing player-driven tick system.
- Preserve safe behavior when the preferred trailing location is blocked.
- Allow the behavior to use a building door as an intermediate target when follower and target are on opposite sides of a building boundary.
- Treat spacing between followers as a best-effort positioning preference, after walkability, occupancy, transition legality, and target-distance constraints.

**Non-Goals:**

- No new party UI, party persistence, combat abilities, formation system, or independent timer.
- No changes to ambient NPC spawning, patrol destination selection, realm generation, or player movement rules beyond the transition handoff needed to restore existing party members.

## Decisions

- Implement a generic follow behavior with injected target, walkability, occupancy, pathfinding, movement, and navigation-transition adapters. It remains independent of NPC type and player identity.
- Use a bounded trailing-target selector evaluated from the frame/update path. This keeps following synchronized with the authoritative target and allows rapid catch-up without changing ambient NPC cadence.
- When evaluated with peer followers, rank legal candidate cells by separation from those peers, preferring at least one empty cell between followers. If no separated candidate is legal, retain the best legal non-overlapping candidate.
- Prefer a target opposite the player's facing, then fall back to nearby cardinal/offset candidates within 3–5 cells. This handles turns, walls, and occupancy without teleporting or overlapping actors.
- Continue to move at most one legal path step per frame through dynamic occupancy when the companion is beyond the 5-gridspot maximum. This preserves collision guarantees while avoiding teleportation or a special-case catch-up speed.
- Replace patrol execution immediately after recruitment by checking the recruited state before patrol logic. Alternatives such as leaving the patrol route active would cause the party member to diverge from the player.
- Treat doors and stairs as navigation transitions supplied by the world/navigation adapter. The behavior first reaches the transition waypoint, crosses only when permitted, then replans against the target's new region.
- Treat the stair transition as a party handoff: retain living recruited NPC records before the old realm is discarded, register those same records with the new realm's occupancy, and place them before the next follow update. Recreating them as fresh ambient NPCs would lose identity and recruited state.
- Build the placement pool from walkable cells near the arrival stairs, rank candidates by cardinal distance to those stairs, prefer candidates at cardinal distances 3–5 from the player, and reserve each cell immediately. This makes the party appear to enter together while preventing collisions.
- Perform transition placement before ordinary companion movement. The normal follow selector then owns subsequent movement without a separate timer or tick producer.

## Risks / Trade-offs

- [Risk] Narrow corridors may prevent an exact 3–5-cell target from being reached. → Mitigate by retaining the NPC's current cell and retrying on later player-driven ticks rather than entering blocked terrain or overlapping the player.
- [Risk] A frame-driven companion update could overtake or overlap the player. → Mitigate by gating movement at the 5-gridspot maximum and routing every step through walkability and dynamic occupancy checks.
- [Risk] Realm replacement may invalidate old cell references or occupancy handles. → Mitigate by preserving party identity/recruited records, rebuilding their registration against the new realm, and validating occupancy before follow updates.
- [Risk] Random nearby cells may be exhausted in a narrow or crowded stair arrival area. → Mitigate by reserving candidates incrementally, using a safe deferred-placement fallback, and never forcing an overlap.
- [Risk] Existing dirty work may overlap the NPC system and tests. → Preserve unrelated edits and stage only files attributable to this change during implementation.
