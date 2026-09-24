// Explicitly opt-in, local diagnostics. Drive the same held-key repeat loop as
// Shift+movement; never advance logical time or alter terrain/entities here.
export function startSprintDiagnostic({ monitor, read, canEnter, keyDown, keyUp, changeRealm, durationMs = 8000 }) {
  const directions = [
    { key: "ArrowRight", x: 1, y: 0 }, { key: "ArrowDown", x: 0, y: 1 },
    { key: "ArrowLeft", x: -1, y: 0 }, { key: "ArrowUp", x: 0, y: -1 },
  ];
  const event = (key) => ({ key, code: key === "Shift" ? "ShiftLeft" : key, shiftKey: true, preventDefault() {} });
  let frame = null;
  let stopped = false;
  let held = null;
  let realmIndex = 0;
  let readyAt = null;
  let startedAt = null;
  let previous = null;
  let moves = 0;
  let exhaustedFrames = 0;
  let frames = 0;
  const visits = new Map();
  const realms = ["Overground", "Underground"];
  const release = () => {
    if (held) keyUp(event(held.key));
    keyUp(event("Shift"));
    held = null;
  };
  const step = (now) => {
    if (stopped) return;
    const state = read();
    if (state.disposed || document.visibilityState !== "visible") { release(); stopped = true; return; }
    const realm = realms[realmIndex];
    if (state.realm !== realm) {
      release();
      if (!state.locked) changeRealm(realm);
      readyAt = null;
    } else if (!state.locked) {
      readyAt ??= now;
      if (now - readyAt >= 1500) {
        if (startedAt === null) {
          startedAt = now;
          monitor.start({ scenario: "sprint", sprint: true, durationMs });
          console.info("ASCII RPG sprint diagnostic started", realm);
        }
        frames += 1;
        exhaustedFrames += Number(state.exhausted);
        const position = `${state.cell.x},${state.cell.y}`;
        if (previous !== position) {
          if (previous !== null) moves += 1;
          visits.set(position, (visits.get(position) ?? 0) + 1);
          previous = position;
        }
        if (now - startedAt >= durationMs || state.dead) {
          release();
          const report = monitor.stop(state.dead ? "unavailable" : "completed");
          console.info("ASCII RPG sprint diagnostic", JSON.stringify({
            realm, rows: state.rows, columns: state.columns, moves, uniqueCells: visits.size,
            exhaustedFrames, frames, averageFps: report.averageFps, p95FrameTimeMs: report.p95FrameTimeMs,
            worstFrameTimeMs: report.worstFrameTimeMs, environment: report.environment,
            phases: Object.fromEntries(Object.entries(report.phaseTimings).map(([name, value]) =>
              [name, { count: value.count, averageMs: value.averageMs, p95Ms: value.p95Ms, maxMs: value.maxMs }])),
            ticks: state.ticks,
          }));
          realmIndex += 1;
          if (realmIndex === realms.length || state.dead) { stopped = true; return; }
          readyAt = null; startedAt = null; previous = null; moves = 0; frames = 0; exhaustedFrames = 0; visits.clear();
        } else {
          const available = directions.filter((direction) => canEnter({ x: state.cell.x + direction.x, y: state.cell.y + direction.y }));
          available.sort((a, b) => (visits.get(`${state.cell.x + a.x},${state.cell.y + a.y}`) ?? 0)
            - (visits.get(`${state.cell.x + b.x},${state.cell.y + b.y}`) ?? 0)
            || Number(b === held) - Number(a === held));
          const next = available[0];
          if (next !== held) {
            release();
            if (next) { held = next; keyDown(event("Shift")); keyDown(event(next.key)); }
          }
        }
      }
    }
    frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => { stopped = true; cancelAnimationFrame(frame); release(); };
}
