function requireRenderFunction(name, render) {
  if (typeof render !== "function") throw new TypeError(`${name} renderer is required.`);
  return render;
}

export function createRenderController(name, render) {
  const renderFunction = requireRenderFunction(name, render);
  let disposed = false;
  let activeJob = null;
  return Object.freeze({
    render(...args) {
      if (disposed) return Promise.resolve();
      activeJob = renderFunction(...args);
      return activeJob;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      activeJob?.cancel?.();
      activeJob = null;
    },
  });
}

export function createRenderControllers({ minimap, mapview, preview, world }) {
  return Object.freeze({
    minimap: createRenderController("minimap", minimap),
    mapview: createRenderController("mapview", mapview),
    preview: createRenderController("preview", preview),
    world: createRenderController("world", world),
  });
}
