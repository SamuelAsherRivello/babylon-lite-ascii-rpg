import test from "node:test";
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
