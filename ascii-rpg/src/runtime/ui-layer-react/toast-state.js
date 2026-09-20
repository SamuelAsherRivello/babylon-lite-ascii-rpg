export const TOAST_ENTER_DURATION_MS = 250;
export const TOAST_VISIBLE_DURATION_MS = 3_000;
export const TOAST_EXIT_DURATION_MS = 250;

export function createToastState() {
  return { active: null, nextId: 1, phase: "idle", queue: [] };
}

export function toastReducer(state, action) {
  switch (action.type) {
    case "enqueue": {
      const message = String(action.message ?? "").trim();
      if (!message) return state;

      const toast = { id: state.nextId, message };
      const nextState = { ...state, nextId: state.nextId + 1 };
      if (state.phase === "idle") return { ...nextState, active: toast, phase: "entering" };
      if (state.phase === "exiting") return { ...nextState, active: toast, phase: "visible" };
      return { ...nextState, queue: [...state.queue, toast] };
    }

    case "entered":
      return state.phase === "entering" ? { ...state, phase: "visible" } : state;

    case "hold-complete":
      if (state.phase !== "visible") return state;
      if (state.queue.length === 0) return { ...state, phase: "exiting" };
      return { ...state, active: state.queue[0], queue: state.queue.slice(1) };

    case "exited":
      return state.phase === "exiting"
        ? { ...state, active: null, phase: "idle", queue: [] }
        : state;

    default:
      return state;
  }
}
