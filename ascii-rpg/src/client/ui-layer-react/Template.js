/**
 * Representative UI-layer module pattern.
 * Keep browser state and UI-facing adapters here; use bridge-layer modules
 * for communication with the game client.
 */
export function createTemplateViewModel(value = "") {
  return Object.freeze({ value: String(value), isEmpty: value.length === 0 });
}
