# Design

## Context

See [proposal.md](proposal.md). The game currently has a common terrain-art key/raster path for water and coins, but Torch, Trap, hero, Spider, particle, health, floating-text, transition, and UI animations independently select frames and schedule work. `timeSystem` publishes discrete integer ticks only after time-consuming gameplay actions; it is not a wall-clock simulation loop.

## Goals / Non-Goals

**Goals:**

- Define one immutable asset vocabulary for PNG source rectangles and ordered frame sequences.
- Resolve a frame from one supplied timing snapshot, not from per-instance timers.
- Migrate existing animation owners incrementally without crossing gameplay, React, or renderer boundaries.
- Make timing and looping reviewable as data rather than implicit in rendering code.

**Non-Goals:**

- Making all presentation use one physical renderer or moving DOM/UI animation into Babylon Lite.
- Altering world-tick production, action cadence, combat timing, collision, persistence, or fog rules.
- Adding a user setting, a Tiled-map loader, new assets, a rendering dependency, or automatic discovery of every PNG on disk.

## Decisions

### Use small immutable definitions, not a universal rendering class

Introduce presentation definitions conceptually equivalent to `Tile` and `AnimatedTile`. A Tile identifies one image source and source rectangle. An AnimatedTile identifies ordered Tile frames, duration metadata, `loop`, and `timeDomain`. Shared pure resolution accepts `{ realTimeMs, tickTime }` and returns a frame index plus completion state.

This is deliberately a data model plus resolver, rather than an inheritance-heavy renderer class. Terrain needs raster/atlas output, strips need CSS background offsets, characters need image sources, and particles need image overlays. They share frame semantics, not DOM or GPU resource ownership. A single renderer abstraction was rejected because it would flatten these established layering and lifetime boundaries.

### Keep clocks owned by the game layer and world-time system

The game layer supplies monotonic `performance.now()` to `realTime` presentation reconciliation. The existing time system supplies its published integer value to `tickTime` resolution. No Tile, AnimatedTile, adapter, or individual record owns a timer or causes a tick.

This makes water/character motion smooth while preserving deterministic tick-step behavior for future turn-synchronized hazards or indicators. Converting current continuous visuals to tick time was rejected: player-driven time can remain unchanged while the player observes the scene, which would freeze water, fire-like props, and character presentation unexpectedly.

### Profile every current animation explicitly before migration

Create a central profile catalog that maps each existing animation source/state to frame geometry, loop mode, time domain, cadence, and adapter family. Preserve current real-time behavior: looping water, coin, torch, trap, hero idle/run, and Spider idle; one-shot hero attack/death, Spider move/attack/death, particles, health/floating feedback, realm mask, toast, and character-info delta. The non-looping hero death profile still holds its final frame until its existing lifecycle removes or replaces it.

Trap animation remains `realTime` for this migration because it is currently presentation-only and its collision consequence is persistent rather than phase-dependent. A future hazard whose active/inactive phase changes gameplay must use tick time for the simulation-authoritative phase; its visual may interpolate in real time only if that interpolation cannot change its state or consequence.

### Adapters consume resolved frames and keep their present owners

Terrain rasterization receives its resolved tile source to build the atlas cache key. DOM strip adapters use the shared resolved index to select background position; image-sequence adapters receive the resolved PNG URL; particle adapters receive an image frame. Each adapter retains its current visibility/fog reconciliation and disposal ownership. UI-only motion may use the same profiles/resolver where practical but remains inside React/CSS rather than being moved into the game layer.

The alternative—forcing source art into one spritesheet format—was rejected because the checked-in assets include Tiled-sheet rectangles, horizontal strips, and separate PNG files, and unnecessary conversion would duplicate assets and make source changes harder to audit.

## Risks / Trade-offs

- [A broad migration can change a single animation's cadence or final-frame behavior] -> Lock each profile in focused resolver and adapter tests before deleting its old path.
- [Real-time presentation can schedule work while no gameplay action occurs] -> Continue visible-region/fog culling and use a shared schedule per active adapter family, not per instance.
- [Tick-time confusion can create duplicate or non-deterministic ticks] -> Pass the existing published time into a pure resolver; prohibit timer creation and simulation mutation in all presentation definitions/adapters.
- [A common API could erase renderer-specific anchor/layer behavior] -> Keep adapter-local placement, cache, and layer contracts and share only asset/frame semantics.
- [Incomplete asset data causes missing artwork] -> Validate source dimensions, frame order, positive durations, and non-empty sequences at registration; preserve gameplay if an adapter cannot present an invalid asset.

## Migration Plan

1. Add pure Tile/AnimatedTile definitions, profile validation, and real-time/tick-time frame resolution with Node tests.
2. Move water and gold-coin terrain art first, preserving cache identity and the existing shared invalidation cadence.
3. Migrate Torch/Trap strips, then hero/Spider image sequences, then particles; retain each adapter's visibility and lifecycle behavior.
4. Route health bars, floating text, realm transition, toast, and character-info delta through explicit profiles or document their UI-local adapter usage while retaining their existing timing.
5. Remove duplicated frame math only after the relevant focused tests, full test suite, build, strict OpenSpec validation, and fixed-seed manual game review pass.

Rollback is an ordinary code revert of this isolated presentation layer; it does not require data migration because Tile/AnimatedTile definitions do not persist gameplay state.
