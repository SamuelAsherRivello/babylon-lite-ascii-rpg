/**
 * Representative bridge-layer pattern.
 * Translate deliberate UI commands into game calls and expose confirmed
 * snapshots without leaking game internals to React.
 */
export function createTemplateBridge({ send, read }) {
  return Object.freeze({
    sendTemplateCommand(payload) {
      send({ type: "template-command", payload: { ...payload } });
    },
    getTemplateSnapshot() {
      return read();
    },
  });
}
