# Tasks

## 1. Catalog and palette foundations

- [x] 1.1 Add the civilization glyph identities `─`, `│`, `█`, `□`, and `⚿` to the active palette/catalog contract and verify catalog validation accepts every state glyph with an editable palette entry.
- [x] 1.2 Add key, fence, and door definitions without regressing Gold, Heart, Torch, Trap, or Stairs behavior, and verify focused object-catalog tests preserve the existing entries and exact civilization log strings.

## 2. Civilization generation

- [x] 2.1 Add the Underground-only civilization generation pass after player placement and existing object distribution, preserving natural terrain and deterministic shared seed behavior; verify repeated generation with identical inputs produces identical barrier, door, and key positions.
- [x] 2.2 Implement zoom-5 screen-region eligibility, approximately 10% seeded selection, one barrier maximum per selected region, 3–10 cell wall-bounded spans, and deterministic center-door placement; verify focused generation tests cover horizontal, vertical, boundary, and no-candidate cases.
- [x] 2.3 Implement two-sided key placement randomly between five and ten grid steps, excluding adjacent cells, and skip candidates that cannot place both keys or would strand the player; verify focused tests reject unsolvable candidates and accept valid ones.

## 3. Runtime object and collision state

- [x] 3.1 Extend the game-layer object state to render keys, fences, and closed/open doors above natural terrain while preserving underlying terrain data; verify world-view and minimap-focused tests cover glyph precedence and both door states.
- [x] 3.2 Add authoritative key pickup state, shared key count, one-time collection, and session-scoped opened-door state; verify focused collision tests cover collection idempotence, key spending, permanent session opening, and both approach directions.
- [x] 3.3 Update movement destination handling so fences and closed doors block movement, locked-door attempts log without advancing time, keyed unlock attempts spend one key and open the door without moving, and the next attempt enters the open door; verify keyboard and swipe movement tests cover all outcomes.

## 4. Bridge and character HUD

- [x] 4.1 Publish the authoritative key count through the existing immutable game-to-React snapshot path without exposing object positions or door state; verify bridge tests cover initial zero, collection increment, and unlock decrement.
- [x] 4.2 Remove carrying from character data and rendering, replace its resource cell with `⚿` and the live key count, and preserve the six-cell HUD geometry; verify focused source/UI tests confirm no carrying presentation remains and key updates render.
- [x] 4.3 Route the locked-door, key-spent, door-unlocked, and key-collected events through the existing Log System using the exact past-tense messages; verify ordered log tests cover the event sequence and existing log behavior.

## 5. Verification and browser behavior

- [x] 5.1 Run the focused civilization, object-spawner, world-generation, movement, character-info, bridge, and log tests and resolve any regressions.
- [x] 5.2 Run the repository's full Node test suite and production build from the repository root, recording any environment-related validation limitation.
- [ ] 5.3 Manually verify the Underground in the running browser: a generated barrier appears only in Underground, keys collect, the HUD count updates, a locked door logs the locked message, a keyed attempt logs both past-tense unlock messages without moving, and the next movement enters the open door.
