/**
 * Replaces a renderer layer without exposing a detach interval.
 * The replacement is attached before the previous layer is removed so a
 * presentation surface remains registered while the caller repopulates it.
 */
export function attachReplacementRendererLayer({
  renderer,
  currentLayer = null,
  nextAtlas,
  capacity,
  createLayer,
  addLayer,
  removeLayer,
}) {
  // A stale scheduled render can run while its session is being disposed.
  // Babylon Lite rejects layer mutation on a disposed renderer (#527); leave
  // its already-detached presentation untouched in that case.
  if (!renderer || renderer._disposed) return currentLayer;
  const nextLayer = createLayer(nextAtlas, { capacity });
  addLayer(renderer, nextLayer);
  if (currentLayer) removeLayer(renderer, currentLayer);
  return nextLayer;
}
