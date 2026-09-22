import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
  createToastState,
  TOAST_ENTER_DURATION_MS,
  TOAST_EXIT_DURATION_MS,
  toastReducer,
  TOAST_VISIBLE_DURATION_MS,
} from "./toast-state.js";

const ToastContext = createContext(null);

function ToastViewport({ toast }) {
  if (!toast.active) return null;

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={`toast toast_${toast.phase}`}
      role="status"
    >
      {toast.active.message}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toast, dispatch] = useReducer(toastReducer, undefined, createToastState);
  const enqueueToast = useCallback((message) => dispatch({ type: "enqueue", message }), []);

  useEffect(() => {
    const actionByPhase = {
      entering: { duration: TOAST_ENTER_DURATION_MS, type: "entered" },
      visible: { duration: TOAST_VISIBLE_DURATION_MS, type: "hold-complete" },
      exiting: { duration: TOAST_EXIT_DURATION_MS, type: "exited" },
    };
    const nextAction = actionByPhase[toast.phase];
    if (!nextAction || !toast.active) return undefined;

    const timer = window.setTimeout(() => dispatch({ type: nextAction.type }), nextAction.duration);
    return () => window.clearTimeout(timer);
  }, [toast.active?.id, toast.phase]);

  const value = useMemo(() => ({ enqueueToast }), [enqueueToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toast={toast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
