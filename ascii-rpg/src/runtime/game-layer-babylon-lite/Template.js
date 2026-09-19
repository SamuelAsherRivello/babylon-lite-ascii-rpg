/**
 * Representative Babylon Lite runtime pattern.
 * Keep simulation and rendering ownership in the game layer; do not import
 * this template into production code.
 */
export function createTemplateSystem({ onUpdate = () => {} } = {}) {
  let active = true;

  return Object.freeze({
    update(deltaTime) {
      if (active) onUpdate(deltaTime);
    },
    dispose() {
      active = false;
    },
  });
}
