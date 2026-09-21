export const LOG_SCROLL_BOTTOM_TOLERANCE_PX = 1;

export function isLogScrollAtBottom({ scrollHeight, scrollTop, clientHeight }, tolerance = LOG_SCROLL_BOTTOM_TOLERANCE_PX) {
  return scrollHeight - scrollTop - clientHeight <= tolerance;
}
