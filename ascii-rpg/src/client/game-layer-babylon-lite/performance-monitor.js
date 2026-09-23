export const PERFORMANCE_SCENARIOS = Object.freeze({
  STARTUP: "startup",
  IDLE: "idle",
  MOVEMENT: "movement",
  SPRINT: "sprint",
});

const DEFAULT_MAX_SAMPLES = 12000;
const DEFAULT_DURATION_MS = 10000;

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function percentile(values, ratio) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function getDefaultEnvironment() {
  if (typeof window === "undefined") return {};
  return {
    userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    devicePixelRatio: window.devicePixelRatio || 1,
    visibility: document.visibilityState,
    focused: document.hasFocus?.() ?? true,
  };
}

function sanitizeEnvironment(environment) {
  const source = environment && typeof environment === "object" ? environment : {};
  const result = {};
  if (typeof source.userAgent === "string") result.userAgent = source.userAgent;
  if (source.viewport && Number.isFinite(source.viewport.width) && Number.isFinite(source.viewport.height)) {
    result.viewport = {
      width: source.viewport.width,
      height: source.viewport.height,
    };
  }
  if (Number.isFinite(source.devicePixelRatio)) result.devicePixelRatio = source.devicePixelRatio;
  if (Number.isFinite(source.zoom)) result.zoom = source.zoom;
  if (source.visibility === "visible" || source.visibility === "hidden") result.visibility = source.visibility;
  if (typeof source.focused === "boolean") result.focused = source.focused;
  return result;
}

function normalizeScenario(scenario) {
  return Object.values(PERFORMANCE_SCENARIOS).includes(scenario)
    ? scenario
    : String(scenario || "custom");
}

function summarizePhase(samples) {
  if (samples.length === 0) return { count: 0, averageMs: null, p95Ms: null, maxMs: null };
  const durations = samples.map((sample) => sample.durationMs);
  return {
    count: durations.length,
    averageMs: durations.reduce((total, value) => total + value, 0) / durations.length,
    p95Ms: percentile(durations, 0.95),
    maxMs: Math.max(...durations),
    contexts: samples.map((sample) => sample.context),
  };
}

function createReport(session, endedAt, completion) {
  const elapsedMs = Math.max(0, endedAt - session.startedAt);
  const frameTimes = session.frameTimes;
  const totalFrameTimeMs = frameTimes.reduce((total, value) => total + value, 0);
  return Object.freeze({
    version: 1,
    scenario: session.scenario,
    direction: session.direction,
    sprint: session.sprint,
    completion,
    startedAt: session.startedAt,
    endedAt,
    durationMs: elapsedMs,
    frameCount: frameTimes.length,
    averageFps: elapsedMs > 0 ? frameTimes.length * 1000 / elapsedMs : 0,
    averageFrameTimeMs: frameTimes.length > 0 ? totalFrameTimeMs / frameTimes.length : null,
    p95FrameTimeMs: percentile(frameTimes, 0.95),
    worstFrameTimeMs: frameTimes.length > 0 ? Math.max(...frameTimes) : null,
    phaseTimings: Object.freeze(Object.fromEntries(
      [...session.phases.entries()].map(([name, samples]) => [name, summarizePhase(samples)]),
    )),
    environment: Object.freeze({ ...session.environment }),
  });
}

export function createPerformanceMonitor({
  now = () => performance.now(),
  getEnvironment = getDefaultEnvironment,
  maxSamples = DEFAULT_MAX_SAMPLES,
  defaultDurationMs = DEFAULT_DURATION_MS,
  onReport = null,
} = {}) {
  let activeSession = null;
  let lastReport = null;

  const stop = (completion = "stopped", endedAt = now()) => {
    if (!activeSession) return lastReport;
    lastReport = createReport(activeSession, endedAt, completion);
    activeSession = null;
    onReport?.(lastReport);
    return lastReport;
  };

  const start = ({
    scenario,
    direction = null,
    sprint = false,
    durationMs = defaultDurationMs,
    environment = getEnvironment(),
  } = {}) => {
    if (activeSession) stop("interrupted");
    const startedAt = now();
    activeSession = {
      scenario: normalizeScenario(scenario),
      direction: direction == null ? null : String(direction),
      sprint: sprint === true,
      startedAt,
      deadline: startedAt + Math.max(0, finiteNumber(durationMs, defaultDurationMs)),
      environment: sanitizeEnvironment(environment),
      frameTimes: [],
      phases: new Map(),
      lastFrameAt: null,
    };
    return Object.freeze({
      scenario: activeSession.scenario,
      startedAt,
      deadline: activeSession.deadline,
    });
  };

  const recordFrame = (timestamp = now()) => {
    if (!activeSession) return false;
    if (timestamp >= activeSession.deadline) {
      stop("completed", activeSession.deadline);
      return false;
    }
    if (activeSession.lastFrameAt !== null && activeSession.frameTimes.length < maxSamples) {
      activeSession.frameTimes.push(Math.max(0, timestamp - activeSession.lastFrameAt));
    }
    activeSession.lastFrameAt = timestamp;
    return true;
  };

  const recordPhase = (name, durationMs, context = {}) => {
    if (!activeSession || typeof name !== "string" || activeSession.frameTimes.length >= maxSamples) return false;
    const samples = activeSession.phases.get(name) ?? [];
    samples.push({ durationMs: Math.max(0, finiteNumber(durationMs)), context: { ...context } });
    activeSession.phases.set(name, samples);
    return true;
  };

  const mark = (name, timestamp = now()) => {
    if (!activeSession || typeof name !== "string") return false;
    const durationMs = timestamp - activeSession.startedAt;
    return recordPhase(`mark:${name}`, durationMs);
  };

  return Object.freeze({
    start,
    stop,
    reset() { activeSession = null; lastReport = null; },
    recordFrame,
    recordPhase,
    mark,
    isActive() { return activeSession !== null; },
    getActiveScenario() { return activeSession?.scenario ?? null; },
    updateEnvironment(environment = {}) {
      if (!activeSession) return false;
      activeSession.environment = {
        ...activeSession.environment,
        ...sanitizeEnvironment(environment),
      };
      return true;
    },
    getReport() { return lastReport; },
  });
}

export const performanceMonitor = createPerformanceMonitor({
  onReport: (report) => console.info("ASCII RPG performance report", JSON.stringify(report)),
});
