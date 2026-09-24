export function createCoalescedFrameScheduler({ scheduleFrame, cancelFrame, render, merge = (_previous, next) => next }) {
  if (typeof scheduleFrame !== "function" || typeof cancelFrame !== "function" || typeof render !== "function") {
    throw new TypeError("A coalesced frame scheduler requires frame, cancel, and render functions.");
  }

  let frameHandle = null;
  let pendingState = null;
  let generation = 0;
  let lastRenderedState = null;

  return {
    schedule(state) {
      pendingState = pendingState === null ? state : merge(pendingState, state);
      if (frameHandle !== null) return;
      const scheduledGeneration = generation;
      frameHandle = scheduleFrame(() => {
        if (scheduledGeneration !== generation) return;
        frameHandle = null;
        const nextState = pendingState;
        pendingState = null;
        render(nextState, lastRenderedState);
        lastRenderedState = nextState;
      });
    },
    cancel() {
      if (frameHandle !== null) cancelFrame(frameHandle);
      frameHandle = null;
      pendingState = null;
      lastRenderedState = null;
      generation += 1;
    },
    get pending() {
      return frameHandle !== null;
    },
  };
}
