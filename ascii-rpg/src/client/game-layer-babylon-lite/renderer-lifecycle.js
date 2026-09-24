export function createRendererLifecycle() {
  let token = 0;
  let disposing = false;

  return Object.freeze({
    begin() {
      token += 1;
      disposing = false;
      return token;
    },
    beginDisposal() {
      disposing = true;
      token += 1;
    },
    isActive(candidate) {
      return !disposing && candidate === token;
    },
  });
}
