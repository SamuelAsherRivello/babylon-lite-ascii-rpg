export function getBrowserZoomRatio(currentDevicePixelRatio, baselineDevicePixelRatio) {
  const current = Number(currentDevicePixelRatio);
  const baseline = Number(baselineDevicePixelRatio);
  if (!Number.isFinite(current) || current <= 0 || !Number.isFinite(baseline) || baseline <= 0) return 1;
  return current / baseline;
}

export function getBrowserZoomCompensation({ currentDevicePixelRatio, baselineDevicePixelRatio, isCoarsePointer }) {
  if (isCoarsePointer) return { ratio: 1, inverse: 1, enabled: false };
  const ratio = getBrowserZoomRatio(currentDevicePixelRatio, baselineDevicePixelRatio);
  return { ratio, inverse: 1 / ratio, enabled: ratio !== 1 };
}
