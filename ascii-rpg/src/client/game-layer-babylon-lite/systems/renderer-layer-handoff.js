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
  const nextLayer = createLayer(nextAtlas, { capacity });
  if (renderer) addLayer(renderer, nextLayer);
  if (renderer && currentLayer) removeLayer(renderer, currentLayer);
  return nextLayer;
}
