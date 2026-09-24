# Tasks

## 1. Character-state contact foundation

- [x] 1.1 Add an authoritative game-layer inventory state with the default Sword, Shield, Pickaxe, and empty fourth slot; verify focused inventory-state tests assert order and immutable snapshots.
- [x] 1.2 Add normalized contact contexts and the ordered Character-State Contact Resolver; verify focused tests cover slot order, resource order, body fallback, and exactly one resolved outcome.
- [x] 1.3 Add contact-target adapters for dynamic occupancy, persistent objects, eligible mountains, and incoming NPC contact; verify focused tests cover normalized target identity and cardinal-only acquisition.

## 2. Route gameplay outcomes through capabilities

- [x] 2.1 Route Sword enemy and spawner contact through existing combat, experience, stamina, time, health-bar, floating-text, and logging paths; verify focused combat and enemy tests cover default damage, no-Sword no-damage movement ticks, and no diagonal attack.
- [x] 2.2 Route Pickaxe mountain contact through the existing digging path; verify focused mountain and movement tests cover cardinal dig, no-Pickaxe movement ticks, lethal-hit non-movement, and no diagonal dig.
- [x] 2.3 Route Keys door unlocking and body chest opening through the resolver; verify focused object tests cover key spending, unsupported locked-door movement ticks, chest reward/spent state, and later-input entry.
- [x] 2.4 Route incoming enemy attacks through Shield and body fallback while retaining existing player lifecycle and log behavior; verify focused enemy, combat-stats, and health tests cover mitigated Shield damage and unshielded full damage.
- [x] 2.5 Route non-damaging NPC/player contact through the resolver without changing patrol movement or causing damage; verify focused NPC collision tests cover the default unhandled outcome.

## 3. Character presentation

- [x] 3.1 Publish immutable inventory snapshots through the existing game-to-React bridge; verify bridge tests preserve game-layer authority and immutability.
- [x] 3.2 Render `🗡`, `🛡`, and `⛏` in Slots 01–03 and retain Gold, Keys, and empty Slot 04 as text-glyph cells; verify Character UI tests and source-contract checks cover labels, glyphs, and six-cell geometry.

## 4. Integration verification

- [x] 4.1 Run focused Node tests for contact resolution, movement, combat, mountains, objects, enemies, NPCs, bridge, and Character UI; verify all pass.
- [x] 4.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both pass.
- [x] 4.3 Run `openspec validate add-character-state-driven-actions-and-responses --strict`; verify the proposal, design, specs, and tasks validate.
- [x] 4.4 Manually verify the seeded browser game using an explicit `randomSeed`: default equipment renders, cardinal Sword/Pickaxe/Keys/body actions resolve once, diagonal contact does not act, unsupported contact advances time and recovers stamina, and incoming enemy damage uses Shield mitigation.
