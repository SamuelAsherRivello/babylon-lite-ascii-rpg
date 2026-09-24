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

function sanitizeContext(context) {
  const source = context && typeof context === "object" ? context : {};
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    if (/seed|storage|token|secret|password/i.test(key)) continue;
    if (typeof value === "string" || typeof value === "boolean" || Number.isFinite(value) || value === null) result[key] = value;
  }
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
  const completedMeasurement = completion === "completed" && session.playableAt !== null;
  return Object.freeze({
    version: 1,
    scenario: session.scenario,
    direction: session.direction,
    sprint: session.sprint,
    completion,
    playableAt: session.playableAt,
    firstViewAt: session.firstViewAt,
    measurementAvailable: completedMeasurement,
    startedAt: session.startedAt,
    endedAt,
    durationMs: elapsedMs,
    frameCount: frameTimes.length,
    averageFps: completedMeasurement && elapsedMs > 0 ? frameTimes.length * 1000 / elapsedMs : null,
    averageFrameTimeMs: frameTimes.length > 0 ? totalFrameTimeMs / frameTimes.length : null,
    p95FrameTimeMs: percentile(frameTimes, 0.95),
    worstFrameTimeMs: frameTimes.length > 0 ? Math.max(...frameTimes) : null,
    phaseTimings: Object.freeze(Object.fromEntries(
      [...session.phases.entries()].map(([name, samples]) => [name, summarizePhase(samples)]),
    )),
    milestones: Object.freeze(Object.fromEntries(session.milestones)),
    attempts: Object.freeze(Object.fromEntries(session.attempts)),
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
    awaitPlayable = false,
  } = {}) => {
    if (activeSession) stop("interrupted");
    const startedAt = now();
    activeSession = {
      scenario: normalizeScenario(scenario),
      direction: direction == null ? null : String(direction),
      sprint: sprint === true,
      startedAt,
      deadline: startedAt + Math.max(0, finiteNumber(durationMs, defaultDurationMs)),
      durationMs: Math.max(0, finiteNumber(durationMs, defaultDurationMs)),
      playableAt: awaitPlayable ? null : startedAt,
      environment: sanitizeEnvironment(environment),
      frameTimes: [],
      phases: new Map(),
      lastFrameAt: null,
      firstViewAt: null,
      openPhases: new Map(),
      nextPhaseId: 0,
      milestones: new Map(),
      attempts: new Map(),
    };
    return Object.freeze({
      scenario: activeSession.scenario,
      startedAt,
      deadline: activeSession.deadline,
    });
  };

  const recordFrame = (timestamp = now()) => {
    if (!activeSession) return false;
    if (activeSession.playableAt === null) return false;
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
    if (!activeSession || typeof name !== "string") return false;
    const samples = activeSession.phases.get(name) ?? [];
    if (samples.length >= maxSamples) return false;
    samples.push({ durationMs: Math.max(0, finiteNumber(durationMs)), context: sanitizeContext(context) });
    activeSession.phases.set(name, samples);
    return true;
  };

  const mark = (name, timestamp = now()) => {
    if (!activeSession || typeof name !== "string") return false;
    const durationMs = timestamp - activeSession.startedAt;
    activeSession.milestones.set(name, Math.max(0, durationMs));
    return recordPhase(`mark:${name}`, durationMs);
  };

  return Object.freeze({
    start,
    stop,
    reset() { activeSession = null; lastReport = null; },
    recordFrame,
    recordPhase,
    recordAttempt({ realm = "unknown", feature = "generation", attempt = 1 } = {}) {
      if (!activeSession || !Number.isInteger(attempt) || attempt < 1) return false;
      const key = `${String(realm)}:${String(feature)}`;
      activeSession.attempts.set(key, Math.max(activeSession.attempts.get(key) ?? 0, attempt));
      return true;
    },
    recordYieldWait(durationMs, context = {}) { return recordPhase("yield-wait", durationMs, context); },
    beginPhase(name, context = {}, timestamp = now()) {
      if (!activeSession || typeof name !== "string") return null;
      const id = `phase-${++activeSession.nextPhaseId}`;
      activeSession.openPhases.set(id, { name, context: sanitizeContext(context), startedAt: timestamp, childMs: 0, parent: [...activeSession.openPhases.keys()].at(-1) ?? null });
      return id;
    },
    endPhase(id, timestamp = now()) {
      if (!activeSession || typeof id !== "string") return false;
      const phase = activeSession.openPhases.get(id);
      if (!phase) return false;
      activeSession.openPhases.delete(id);
      const elapsed = Math.max(0, timestamp - phase.startedAt);
      if (phase.parent) {
        const parent = activeSession.openPhases.get(phase.parent);
        if (parent) parent.childMs += elapsed;
      }
      return recordPhase(phase.name, Math.max(0, elapsed - phase.childMs), phase.context);
    },
    markPlayable(timestamp = now()) {
      if (!activeSession || activeSession.playableAt !== null) return false;
      if (activeSession.scenario !== PERFORMANCE_SCENARIOS.STARTUP) {
        activeSession.startedAt = timestamp;
        activeSession.deadline = timestamp + activeSession.durationMs;
      }
      activeSession.playableAt = timestamp;
      activeSession.firstViewAt ??= timestamp;
      activeSession.lastFrameAt = null;
      return true;
    },
    failStartup(reason, completion = "unavailable", endedAt = now()) {
      if (!activeSession || activeSession.playableAt !== null) return null;
      activeSession.environment = { ...activeSession.environment, startupFailure: String(reason ?? "startup failed") };
      return stop(completion === "interrupted" ? "interrupted" : "unavailable", endedAt);
    },
    mark,
    markMilestone(name, timestamp = now()) {
      if (!activeSession || activeSession.milestones.has(name)) return false;
      return mark(name, timestamp);
    },
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
