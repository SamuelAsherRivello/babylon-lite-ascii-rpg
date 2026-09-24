/**
 * Stable lifecycle boundary for the game layer. The implementation remains
 * injected so the public facade can preserve its existing construction API.
 */
export async function createGameSession(createImplementation, ...args) {
  if (typeof createImplementation !== "function") throw new TypeError("A game-session implementation is required.");
  const session = await createImplementation(...args);
  if (!session || typeof session.dispose !== "function") throw new TypeError("A game session must expose dispose().");
  return session;
}
