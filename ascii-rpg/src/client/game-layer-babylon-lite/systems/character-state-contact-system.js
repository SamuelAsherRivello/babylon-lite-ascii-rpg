const DEFAULT_SLOTS = [
  Object.freeze({ slot: "Slot 01", id: "sword", glyph: "🗡", name: "Sword" }),
  Object.freeze({ slot: "Slot 02", id: "shield", glyph: "🛡", name: "Shield" }),
  Object.freeze({ slot: "Slot 03", id: "pickaxe", glyph: "⛏", name: "Pickaxe" }),
  null,
];

export function createCharacterState({ slots = DEFAULT_SLOTS, gold = 0, keys = 0 } = {}) {
  const normalizedSlots = Object.freeze(Array.from({ length: 4 }, (_, index) => {
    const item = slots[index];
    return item ? Object.freeze({ ...item, slot: `Slot 0${index + 1}` }) : null;
  }));
  return Object.freeze({
    slots: normalizedSlots,
    gold: Math.max(0, Number(gold) || 0),
    keys: Math.max(0, Number(keys) || 0),
  });
}

export const DEFAULT_CHARACTER_STATE = createCharacterState();

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
