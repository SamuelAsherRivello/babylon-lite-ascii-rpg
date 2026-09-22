export function createRealmSystem({ eventSystem } = {}) {
  if (!eventSystem?.publish) throw new TypeError("Realm System needs a gameplay event system.");

  return Object.freeze({
    enter(realm) {
      if (realm !== "Overground" && realm !== "Underground") throw new RangeError(`Unknown realm: ${realm}.`);
      return eventSystem.publish({ type: "realm-entered", realm });
    },
  });
}
