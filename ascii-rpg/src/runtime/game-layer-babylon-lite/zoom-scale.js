export const MIN_ZOOM = 1;
export const MAX_ZOOM = 10;
export const DEFAULT_ZOOM = 9;
export const LEGACY_DEFAULT_ZOOM = 5;
export const LEGACY_MIN_ZOOM = 1;
export const LEGACY_MAX_ZOOM = 10;
export const ZOOM_SCALE_STORAGE_VERSION = "2";

const MIN_EFFECTIVE_ZOOM = 0.1;
const MAX_EFFECTIVE_ZOOM = 10;
const EFFECTIVE_ZOOM_STEP = (MAX_EFFECTIVE_ZOOM - MIN_EFFECTIVE_ZOOM) / (MAX_ZOOM - MIN_ZOOM);

export function normalizeZoom(zoom, fallback = DEFAULT_ZOOM) {
  const value = Number(zoom);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
}

export function getEffectiveZoom(zoom) {
  const selected = normalizeZoom(zoom);
  return MIN_EFFECTIVE_ZOOM + (selected - MIN_ZOOM) * EFFECTIVE_ZOOM_STEP;
}

export function getZoomScale(zoom) {
  return getEffectiveZoom(zoom) / LEGACY_DEFAULT_ZOOM;
}

export function getNearestDisplayedZoom(effectiveZoom) {
  const value = Number(effectiveZoom);
  if (!Number.isFinite(value) || value <= MIN_EFFECTIVE_ZOOM) return MIN_ZOOM;
  if (value >= MAX_EFFECTIVE_ZOOM) return MAX_ZOOM;

  let nearest = MIN_ZOOM;
  let nearestDistance = Infinity;
  for (let displayed = MIN_ZOOM; displayed <= MAX_ZOOM; displayed += 1) {
    const distance = Math.abs(value - getEffectiveZoom(displayed));
    if (distance <= nearestDistance) {
      nearest = displayed;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function migrateLegacyZoom(zoom) {
  const legacy = Number(zoom);
  if (!Number.isFinite(legacy)) return DEFAULT_ZOOM;
  return getNearestDisplayedZoom(Math.min(LEGACY_MAX_ZOOM, Math.max(LEGACY_MIN_ZOOM, legacy)));
}
