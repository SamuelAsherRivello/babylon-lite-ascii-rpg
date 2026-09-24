# Spec Delta

## ADDED Requirements

### Requirement: Layer costs and deferred readiness are separately observable
Opt-in generation diagnostics SHALL identify world dimensions, realm, feature, effective density/enablement, phase durations, generation attempts, yield wait, and deferred-work duration. They SHALL distinguish terrain-ready, complete visible placement, first complete view submission, presentation opportunity, input-ready, and deferred completion. An early terrain-only frame SHALL NOT be reported as complete layered readiness. Per-layer durations SHALL exclude unrelated phases and scheduling wait or identify those components separately. Existing privacy restrictions SHALL apply.

#### Scenario: Deferred NPC routes outlive first presentation
- **WHEN** a world presents all initial content before route preparation completes
- **THEN** diagnostics report separate complete-view and deferred-completion times, with queue wait and longest work slice visible

#### Scenario: Both realms share phase names
- **WHEN** the same generation phase runs for Overground and Underground
- **THEN** each realm retains its own duration and attempt count without overwriting the other realm's measurements

### Requirement: Comparable cold and cached performance evidence
Performance comparisons SHALL distinguish cold generation-to-complete-view, unchanged cached reuse, local dirty refresh, and incompatible full refresh for game view, minimap, mapview, and generation preview. The primary configuration SHALL use Med world size, all applicable features enabled, and Med densities. Low and High comparisons SHALL retain Med density unless explicitly identified as a separate density stress case. Reports SHALL include sample count and latency distribution, environment/build context, work scope/cache mode, and actual outcomes against soft targets: approximately 100 ms Low, 500 ms Med, and 1000 ms High for generation-to-complete-view, with Med game-view refresh targeting 100-500 ms or faster. Targets SHALL NOT throttle normal frame cadence, replace existing movement responsiveness requirements, justify omitted layers, or allow concealed deferred stalls. Missed targets SHALL be reported without claiming compliance.

#### Scenario: High world diagnostic isolation
- **WHEN** a developer compares the required-only High baseline, individual optional layers, and cumulative enabled layers
- **THEN** evidence identifies each configuration and retains a separate all-enabled production comparison

#### Scenario: Warm cache beats cold generation
- **WHEN** a cached refresh completes faster than a new world generation
- **THEN** the two are reported as different scenarios and the cached result is not substituted for generation readiness

#### Scenario: Soft target is missed
- **WHEN** a measured configuration exceeds its target
- **THEN** the report states the measured latency, remaining bottlenecks, and any deferred work impact without hiding content or reducing enabled density
