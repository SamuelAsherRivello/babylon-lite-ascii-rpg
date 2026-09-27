// Presentation data only: clocks and resource lifetimes belong to callers.
export function createTile({ source, sourceWidth, sourceHeight, x = 0, y = 0, width, height }) {
  if (typeof source !== "string" || !/^(?:\/|https?:\/\/|\.\.?\/).*\.png(?:[?#].*)?$/i.test(source)) {
    throw new TypeError("Tile source must be a qualified PNG URL.");
  }
  if (![sourceWidth, sourceHeight, width, height].every((value) => Number.isInteger(value) && value > 0)
    || ![x, y].every((value) => Number.isInteger(value) && value >= 0)
    || x + width > sourceWidth || y + height > sourceHeight) {
    throw new RangeError("Tile rectangle must fit its positive integer source dimensions.");
  }
  return Object.freeze({ source, sourceWidth, sourceHeight, x, y, width, height });
}

export function createAnimatedTile({ frames, durations, loop, timeDomain }) {
  if (!Array.isArray(frames) || frames.length === 0 || !Array.isArray(durations) || durations.length !== frames.length) {
    throw new TypeError("Animation requires non-empty frames and one duration per frame.");
  }
  if (typeof loop !== "boolean" || !["realTime", "tickTime"].includes(timeDomain)) {
    throw new TypeError("Animation requires explicit loop and timeDomain values.");
  }
  if (![...durations].every((duration) => Number.isFinite(duration) && duration > 0
    && (timeDomain !== "tickTime" || Number.isInteger(duration)))) {
    throw new RangeError("Frame durations must be positive (integer ticks for tickTime).");
  }
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  if (!Number.isFinite(totalDuration)) throw new RangeError("Animation duration must be finite.");
  return Object.freeze({ frames: Object.freeze(Array.from(frames, createTile)), durations: Object.freeze([...durations]), loop, timeDomain, totalDuration });
}

export function resolveAnimation(animation, { realTimeMs, tickTime }, startedAt = 0) {
  const time = animation.timeDomain === "tickTime" ? tickTime : realTimeMs;
  if (!Number.isFinite(time) || !Number.isFinite(startedAt)
    || (animation.timeDomain === "tickTime" && (!Number.isInteger(time) || !Number.isInteger(startedAt)))) {
    throw new TypeError("Animation requires a finite clock snapshot in its declared domain.");
  }
  const elapsed = Math.max(0, time - startedAt);
  const complete = !animation.loop && elapsed >= animation.totalDuration;
  let remaining = animation.loop ? elapsed % animation.totalDuration : Math.min(elapsed, animation.totalDuration);
  let frameIndex = 0;
  while (frameIndex < animation.frames.length - 1 && remaining >= animation.durations[frameIndex]) {
    remaining -= animation.durations[frameIndex++];
  }
  return Object.freeze({ frameIndex, tile: animation.frames[frameIndex], complete,
    progress: Math.min(1, elapsed / animation.totalDuration) });
}

// Reads the existing authoritative value; never subscribes, schedules, or advances time.
export function getAnimationSnapshot(timeSystem, realTimeMs) {
  return Object.freeze({ realTimeMs, tickTime: timeSystem.getTime() });
}

// CSS source-rectangle adapter; placement and destination size stay with the owner.
export function getTileBackgroundStyle(tile) {
  const position = (offset, sourceSize, size) => sourceSize === size ? 0 : 100 * offset / (sourceSize - size);
  return {
    backgroundImage: `url("${tile.source}")`,
    backgroundSize: `${100 * tile.sourceWidth / tile.width}% ${100 * tile.sourceHeight / tile.height}%`,
    backgroundPosition: `${position(tile.x, tile.sourceWidth, tile.width)}% ${position(tile.y, tile.sourceHeight, tile.height)}%`,
  };
}

// Continuous-value adapter for fades/masks. Zero-duration UI phases finish immediately.
export function resolveMotion(profile, realTimeMs, startedAt, duration = profile.duration) {
  if (profile.timeDomain !== "realTime" || profile.loop !== false || !Number.isFinite(duration) || duration < 0) {
    throw new TypeError("Motion requires a non-looping realTime profile and nonnegative duration.");
  }
  const elapsed = Math.max(0, realTimeMs - startedAt);
  return Object.freeze({ elapsed, progress: duration === 0 ? 1 : Math.min(1, elapsed / duration), complete: elapsed >= duration });
}
