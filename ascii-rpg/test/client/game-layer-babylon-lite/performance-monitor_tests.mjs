import test from "node:test";
import "./sprint-diagnostic_tests.mjs";
import assert from "node:assert/strict";
import { createPerformanceMonitor, PERFORMANCE_SCENARIOS } from "../../../src/client/game-layer-babylon-lite/performance-monitor.js";

function createClock() {
  let current = 0;
  return {
    now: () => current,
    advance(ms) { current += ms; },
  };
}

test("performance monitor is empty and inactive by default", () => {
  const monitor = createPerformanceMonitor();
  assert.equal(monitor.isActive(), false);
  assert.equal(monitor.getReport(), null);
  assert.equal(monitor.recordFrame(), false);
});

test("performance monitor aggregates bounded frame and phase samples", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now, maxSamples: 4 });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.MOVEMENT, direction: "right", durationMs: 1000, environment: { userAgent: "test", seed: "secret" } });
  monitor.recordFrame();
  clock.advance(16);
  monitor.recordFrame();
  clock.advance(20);
  monitor.recordFrame();
  monitor.recordPhase("main-world", 2.5, { visibleCells: 100 });
  const report = monitor.stop();

  assert.equal(report.scenario, "movement");
  assert.equal(report.direction, "right");
  assert.equal(report.frameCount, 2);
  assert.equal(report.averageFrameTimeMs, 18);
  assert.equal(report.worstFrameTimeMs, 20);
  assert.equal(report.phaseTimings["main-world"].count, 1);
  assert.equal(report.environment.seed, undefined);
});

test("performance monitor retains bounded refresh-decision context in a phase report", () => {
  let now = 0;
  const monitor = createPerformanceMonitor({ now: () => now, defaultDurationMs: 100 });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.IDLE });
  monitor.recordPhase("minimap", 3, {
    refresh: "partial", dirtyCoverage: 0.1, dirtyRectangles: 2, retainedResources: 1,
  });
  now = 10;
  const report = monitor.stop("completed");
  assert.deepEqual(report.phaseTimings.minimap.contexts, [{
    refresh: "partial", dirtyCoverage: 0.1, dirtyRectangles: 2, retainedResources: 1,
  }]);
});

test("starting a new scenario interrupts the previous scenario", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.IDLE });
  clock.advance(10);
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.SPRINT, direction: "up", sprint: true });
  assert.equal(monitor.getReport().completion, "interrupted");
  assert.equal(monitor.getReport().scenario, "idle");
  assert.equal(monitor.isActive(), true);
});

test("finite session completes at its deadline", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.IDLE, durationMs: 50 });
  monitor.recordFrame();
  clock.advance(50);
  assert.equal(monitor.recordFrame(), false);
  assert.equal(monitor.getReport().completion, "completed");
  assert.equal(monitor.isActive(), false);
});

test("playable-gated sessions do not publish an FPS result when startup fails", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.MOVEMENT, awaitPlayable: true });
  assert.equal(monitor.recordFrame(), false);
  const report = monitor.failStartup("world validation failed");
  assert.equal(report.completion, "unavailable");
  assert.equal(report.measurementAvailable, false);
  assert.equal(report.averageFps, null);
  assert.equal(report.environment.startupFailure, "world validation failed");
});

test("playable-gated sessions measure only after the world unlocks input", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.SPRINT, awaitPlayable: true, durationMs: 50 });
  clock.advance(25);
  assert.equal(monitor.markPlayable(), true);
  monitor.recordFrame();
  clock.advance(50);
  monitor.recordFrame();
  assert.equal(monitor.getReport().completion, "completed");
  assert.equal(monitor.getReport().measurementAvailable, true);
});

test("startup phases retain pre-presentation timing, exclude nested work, and omit private context", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now });
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.STARTUP, awaitPlayable: true });
  const generation = monitor.beginPhase("generation", { realm: "Overground", seed: "not-exported" });
  clock.advance(10);
  const terrain = monitor.beginPhase("terrain", { feature: "ground" });
  clock.advance(5);
  assert.equal(monitor.endPhase(terrain), true);
  clock.advance(5);
  assert.equal(monitor.endPhase(generation), true);
  clock.advance(10);
  assert.equal(monitor.markPlayable(), true);
  const report = monitor.stop("completed");
  assert.equal(report.firstViewAt, 30);
  assert.equal(report.phaseTimings.generation.averageMs, 15);
  assert.equal(report.phaseTimings.terrain.averageMs, 5);
  assert.deepEqual(report.phaseTimings.generation.contexts, [{ realm: "Overground" }]);
});

test("monitor records attempts, yield waits, and one-time readiness milestones without an active session leak", () => {
  const clock = createClock();
  const monitor = createPerformanceMonitor({ now: clock.now });
  assert.equal(monitor.recordAttempt({ realm: "Overground", attempt: 1 }), false);
  monitor.start({ scenario: PERFORMANCE_SCENARIOS.STARTUP, awaitPlayable: true });
  assert.equal(monitor.recordAttempt({ realm: "Overground", feature: "world-generation", attempt: 1 }), true);
  assert.equal(monitor.recordAttempt({ realm: "Overground", feature: "world-generation", attempt: 3 }), true);
  clock.advance(4);
  monitor.recordYieldWait(4, { realm: "Overground", seed: "not-exported" });
  clock.advance(6);
  assert.equal(monitor.markMilestone("complete-visible-placement"), true);
  assert.equal(monitor.markMilestone("complete-visible-placement"), false);
  clock.advance(10);
  monitor.markPlayable();
  clock.advance(5);
  monitor.markMilestone("deferred-complete");
  const report = monitor.stop("completed");
  assert.deepEqual(report.attempts, { "Overground:world-generation": 3 });
  assert.equal(report.phaseTimings["yield-wait"].averageMs, 4);
  assert.deepEqual(report.phaseTimings["yield-wait"].contexts, [{ realm: "Overground" }]);
  assert.equal(report.milestones["complete-visible-placement"], 10);
  assert.equal(report.milestones["deferred-complete"], 25);
  assert.equal(monitor.isActive(), false);
});
