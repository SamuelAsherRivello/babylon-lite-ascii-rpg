export const ITEM_HEALTH_MAXIMUM = 1000;

const DEFAULT_SLOTS = [
  Object.freeze({ slot: "Slot 01", id: "sword", glyph: "🗡", name: "Sword", health: ITEM_HEALTH_MAXIMUM, maxHealth: ITEM_HEALTH_MAXIMUM }),
  Object.freeze({ slot: "Slot 02", id: "shield", glyph: "🛡", name: "Shield", health: ITEM_HEALTH_MAXIMUM, maxHealth: ITEM_HEALTH_MAXIMUM }),
  Object.freeze({ slot: "Slot 03", id: "pickaxe", glyph: "⛏", name: "Pickaxe", health: ITEM_HEALTH_MAXIMUM, maxHealth: ITEM_HEALTH_MAXIMUM }),
  Object.freeze({ slot: "Slot 04", id: "bomb", glyph: "●", name: "Bomb", count: 50 }),
];

export function createCharacterState({ slots = DEFAULT_SLOTS, gold = 0, keys = 0 } = {}) {
  const normalizedSlots = Object.freeze(Array.from({ length: 4 }, (_, index) => {
    const item = slots[index];
    if (!item) return null;
    const maxHealth = item.id === "sword" || item.id === "shield" || item.id === "pickaxe"
      ? Math.max(1, Number(item.maxHealth) || ITEM_HEALTH_MAXIMUM)
      : item.maxHealth;
    const health = maxHealth ? Math.min(maxHealth, Math.max(0, Number.isFinite(Number(item.health)) ? Number(item.health) : maxHealth)) : item.health;
    return Object.freeze({ ...item, slot: `Slot 0${index + 1}`, ...(maxHealth ? { health, maxHealth } : {}) });
  }));
  return Object.freeze({
    slots: normalizedSlots,
    gold: Math.max(0, Number(gold) || 0),
    keys: Math.max(0, Number(keys) || 0),
  });
}

export const DEFAULT_CHARACTER_STATE = createCharacterState();

export function damageCharacterItem(state, itemId, amount) {
  const character = state ?? DEFAULT_CHARACTER_STATE;
  const slots = character.slots.map((item) => {
    if (!item || item.id !== itemId) return item;
    const health = Math.max(0, item.health - Math.max(0, Number(amount) || 0));
    return health === 0 ? null : { ...item, health };
  });
  return createCharacterState({ ...character, slots });
}

export function changeCharacterItemCount(state, itemId, delta) {
  const character = state ?? DEFAULT_CHARACTER_STATE;
  const slots = character.slots.map((item) => item?.id === itemId
    ? { ...item, count: Math.max(0, Math.floor((Number(item.count) || 0) + Number(delta || 0))) }
    : item);
  return createCharacterState({ ...character, slots });
}

export function createContactTarget({ kind, cell, ...target }) {
  return Object.freeze({ kind, cell: Object.freeze({ x: cell.x, y: cell.y }), ...target });
}

export function normalizeContactTarget({ cell, direction, occupant = null, object = null, mountain = null, npc = null } = {}) {
  if (!cell || !direction || Math.abs(direction.x) + Math.abs(direction.y) !== 1) return null;
  const candidate = occupant ?? object ?? mountain ?? npc;
  if (!candidate) return null;
  return createContactTarget({
    kind: candidate.type ?? (mountain ? "mountain" : object ? "object" : npc ? "npc" : "occupant"),
    cell,
    occupant,
    object,
    mountain,
    npc,
  });
}

export function resolveCharacterContact(state, target, responders = {}) {
  const character = state ?? DEFAULT_CHARACTER_STATE;
  const candidates = [
    ...character.slots.map((item) => item?.id).filter(Boolean),
    "keys",
    "body",
  ];
  for (const capability of candidates) {
    const responder = responders[capability];
    if (!responder?.canHandle?.(target, character)) continue;
    return Object.freeze({ handled: true, capability, outcome: responder.handle(target, character) });
  }
  return Object.freeze({ handled: false, capability: null, outcome: null });
}

export function resolveCharacterAction(state, capability, target, responders = {}) {
  const character = state ?? DEFAULT_CHARACTER_STATE;
  if (!character.slots.some((item) => item?.id === capability && (item.id !== "bomb" || item.count > 0))) {
    return Object.freeze({ handled: false, capability: null, outcome: null });
  }
  const responder = responders[capability];
  if (!responder?.canHandle?.(target, character)) return Object.freeze({ handled: false, capability: null, outcome: null });
  return Object.freeze({ handled: true, capability, outcome: responder.handle(target, character) });
}
