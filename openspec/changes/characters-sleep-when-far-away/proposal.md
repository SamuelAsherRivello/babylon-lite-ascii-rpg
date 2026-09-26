# Proposal

## Why

Every player-driven world-time advance currently schedules and delivers a tick
to every NPC and enemy, including characters in the other realm or far beyond
any interaction range. With medium-density worlds, that creates avoidable
queueing and navigation work during movement even though those characters
cannot affect the player.

## What Changes

- Introduce character activity eligibility for living NPCs and enemies: a
  character sleeps while it is in a different realm from the living player or
  farther than 50 grid cells by a cheap cardinal-distance calculation.
- Exclude sleeping characters from logical-tick scheduling and simulation;
  preserve their registered state so that they wake immediately when they
  become eligible, without catch-up ticks.
- Keep recruited party NPCs responsive to their existing frame-based follow
  behavior, and keep active, nearby combat and patrol behavior unchanged.
- Add focused diagnostics and regression coverage that distinguish eligible
  deliveries from skipped character work and verify that rendering remains
  limited to the active visible region.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `time-system`: allow world-time delivery to omit registered character work
  that is currently ineligible for simulation.
- `asynchronous-logical-ticks`: define eligibility filtering before deferred
  logical-tick work is scheduled.
- `enemy-system`: replace always-tick, cross-realm aging with sleep and
  wake-up behavior outside the active radius.
- `npc-spawner-system`: allow ambient NPC patrol simulation to sleep outside
  the active radius while preserving party following and occupancy behavior.

## Impact

Affected systems include the Babylon Lite time coordinator and deferred-work
scheduler, enemy and NPC systems, realm/player-state wiring, focused Node
tests, and opt-in performance diagnostics. The change adds no dependencies,
new timer, background tick source, persistence setting, renderer replacement,
or release work.
