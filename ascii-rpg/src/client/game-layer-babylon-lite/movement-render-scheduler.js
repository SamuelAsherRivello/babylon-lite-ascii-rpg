export function createCoalescedFrameScheduler({ scheduleFrame, cancelFrame, render }) {
  if (typeof scheduleFrame !== "function" || typeof cancelFrame !== "function" || typeof render !== "function") {
    throw new TypeError("A coalesced frame scheduler requires frame, cancel, and render functions.");
  }

  let frameHandle = null;
  let pendingState = null;

  return {
    schedule(state) {
      pendingState = state;
      if (frameHandle !== null) return;
      frameHandle = scheduleFrame(() => {
        frameHandle = null;
        const nextState = pendingState;
        pendingState = null;
        render(nextState);
      });
    },
    cancel() {
      if (frameHandle !== null) cancelFrame(frameHandle);
      frameHandle = null;
      pendingState = null;
    },
    get pending() {
      return frameHandle !== null;
    },
  };
}
