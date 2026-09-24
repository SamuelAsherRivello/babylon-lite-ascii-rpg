function addListener(target, type, handler) {
  target?.addEventListener?.(type, handler);
  return () => target?.removeEventListener?.(type, handler);
}

export function shouldPlaceBombForKeydown(event, { locked = false, held = false } = {}) {
  if (event?.code !== "Space" && event?.key !== " ") return false;
  return !locked && !held && !event.repeat;
}

export function createInputController({
  windowTarget,
  canvas,
  minimapCanvas,
  handlers,
}) {
  if (!handlers || typeof handlers !== "object") throw new TypeError("Input handlers are required.");
  const removers = [
    addListener(windowTarget, "keydown", handlers.keyDown),
    addListener(windowTarget, "keyup", handlers.keyUp),
    addListener(windowTarget, "resize", handlers.resize),
    addListener(windowTarget, "orientationchange", handlers.resize),
    addListener(canvas, "pointerdown", handlers.pointerDown),
    addListener(canvas, "pointermove", handlers.pointerMove),
    addListener(canvas, "pointerup", handlers.pointerStop),
    addListener(canvas, "pointercancel", handlers.pointerStop),
    addListener(canvas, "lostpointercapture", handlers.pointerStop),
    addListener(minimapCanvas, "click", handlers.minimapClick),
  ];
  let disposed = false;
  return Object.freeze({
    dispose() {
      if (disposed) return;
      disposed = true;
      removers.forEach((remove) => remove());
    },
  });
}
