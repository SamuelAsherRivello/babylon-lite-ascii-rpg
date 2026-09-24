const DEFAULT_SLICE_MS = 4;
const MAX_PRIORITY_AGE = 10;

function defaultScheduleFrame(callback) {
  return typeof window !== "undefined" && typeof window.requestAnimationFrame === "function"
    ? window.requestAnimationFrame(callback)
    : setTimeout(callback, 0);
}

function defaultCancelFrame(handle) {
  if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(handle);
  else clearTimeout(handle);
}

/**
 * A small game-owned queue for work which must begin after a submitted frame.
 * A job owns its own resumability: `run` returns `pending` until it is settled.
 */
export function createDeferredWorkScheduler({
  scheduleFrame = defaultScheduleFrame,
  cancelFrame = defaultCancelFrame,
  now = () => performance.now(),
  isVisible = () => typeof document === "undefined" || document.visibilityState !== "hidden",
  sliceMs = DEFAULT_SLICE_MS,
  presentationFrames = 2,
} = {}) {
  if (typeof scheduleFrame !== "function" || typeof cancelFrame !== "function" || typeof now !== "function" || typeof isVisible !== "function") {
    throw new TypeError("Deferred work scheduler needs frame, clock, and visibility functions.");
  }
  const jobs = new Map();
  const listeners = new Set();
  let nextId = 0;
  let frame = null;
  let generation = 0;
  let presentationRemaining = 0;
  let longestSliceMs = 0;

  const notify = (event) => { for (const listener of listeners) listener(Object.freeze({ ...event })); };
  const schedule = () => {
    if (frame !== null || jobs.size === 0 || !isVisible()) return;
    const token = generation;
    frame = scheduleFrame(() => {
      frame = null;
      if (token !== generation || jobs.size === 0 || !isVisible()) return;
      if (presentationRemaining > 0) { presentationRemaining -= 1; schedule(); return; }
      runSlice();
    });
  };
  const settle = (job, state, error = null) => {
    jobs.delete(job.id);
    job.state = state;
    job.endedAt = now();
    notify({ type: "settled", id: job.id, state, metadata: job.metadata, waitMs: (job.startedAt ?? job.endedAt) - job.enqueuedAt, durationMs: job.startedAt === null ? 0 : job.endedAt - job.startedAt, error: error ? String(error.message ?? error) : null });
  };
  const runSlice = () => {
    const startedAt = now();
    const budgetMs = Math.max(0, Number(sliceMs) || 0);
    const candidates = [...jobs.values()].filter(job => job.state === "pending").sort((a, b) => (
      (b.priority + Math.min(MAX_PRIORITY_AGE, b.waitSlices)) - (a.priority + Math.min(MAX_PRIORITY_AGE, a.waitSlices))
      || a.sequence - b.sequence
    ));
    for (let index = 0; index < candidates.length; index += 1) {
      const job = candidates[index];
      if (!jobs.has(job.id) || job.cancelled) { settle(job, "cancelled"); continue; }
      job.waitSlices = 0;
      job.state = "running";
      if (job.startedAt === null) { job.startedAt = now(); notify({ type: "started", id: job.id, waitMs: job.startedAt - job.enqueuedAt }); }
      let result;
      try { result = job.run(Object.freeze({ deadline: startedAt + budgetMs, now, remainingMs: () => Math.max(0, startedAt + budgetMs - now()) })); }
      catch (error) { settle(job, "failed", error); continue; }
      if (result === "done") settle(job, "completed");
      else if (result === "cancelled") settle(job, "cancelled");
      else job.state = "pending";
      if (now() >= startedAt + budgetMs) {
        for (let waiting = index + 1; waiting < candidates.length; waiting += 1) if (jobs.has(candidates[waiting].id)) candidates[waiting].waitSlices += 1;
        break;
      }
    }
    longestSliceMs = Math.max(longestSliceMs, now() - startedAt);
    schedule();
  };

  return Object.freeze({
    enqueue({ id = `deferred-${++nextId}`, priority = 0, run, metadata = null } = {}) {
      if (typeof id !== "string" || !id || typeof run !== "function" || jobs.has(id)) return null;
      const job = { id, priority: Number(priority) || 0, run, metadata, sequence: nextId, enqueuedAt: now(), startedAt: null, endedAt: null, state: "pending", cancelled: false, waitSlices: 0 };
      jobs.set(id, job);
      presentationRemaining = Math.max(presentationRemaining, Math.max(0, Math.floor(presentationFrames)));
      notify({ type: "enqueued", id, metadata });
      schedule();
      return Object.freeze({ id, cancel: () => this.cancel(id) });
    },
    cancel(id) {
      const job = jobs.get(id);
      if (!job) return false;
      job.cancelled = true;
      if (job.state === "pending") settle(job, "cancelled");
      return true;
    },
    cancelWhere(predicate) {
      let count = 0;
      for (const job of [...jobs.values()]) if (predicate(job.metadata, job.id)) { this.cancel(job.id); count += 1; }
      return count;
    },
    resume() { schedule(); },
    dispose() {
      generation += 1;
      if (frame !== null) cancelFrame(frame);
      frame = null;
      for (const job of [...jobs.values()]) settle(job, "cancelled");
      listeners.clear();
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    snapshot() { return Object.freeze({ pending: jobs.size, longestSliceMs, presentationPending: presentationRemaining }); },
  });
}
