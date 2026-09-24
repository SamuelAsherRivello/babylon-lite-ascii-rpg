export function createRenderSchedulingController({ cancelAll }) {
  if (typeof cancelAll !== "function") throw new TypeError("A render cancellation implementation is required.");
  const cancel = () => cancelAll();
  return Object.freeze({ cancel });
}
