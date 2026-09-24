import test from "node:test";
import assert from "node:assert/strict";
import {
  createCharacterState,
  createContactTarget,
  damageCharacterItem,
  DEFAULT_CHARACTER_STATE,
  normalizeContactTarget,
  resolveCharacterContact,
} from "../../../../src/client/game-layer-babylon-lite/systems/character-state-contact-system.js";

test("creates the default immutable ordered loadout", () => {
  assert.deepEqual(DEFAULT_CHARACTER_STATE.slots.map((item) => item?.id ?? null), ["sword", "shield", "pickaxe", null]);
  assert.deepEqual(DEFAULT_CHARACTER_STATE.slots.slice(0, 3).map((item) => [item.health, item.maxHealth]), [[1000, 1000], [1000, 1000], [1000, 1000]]);
  assert.equal(Object.isFrozen(DEFAULT_CHARACTER_STATE), true);
  assert.equal(Object.isFrozen(DEFAULT_CHARACTER_STATE.slots), true);
});

test("wears durable items and removes them at zero health", () => {
  const worn = damageCharacterItem(DEFAULT_CHARACTER_STATE, "sword", 125);
  assert.equal(worn.slots[0].health, 875);
  const broken = damageCharacterItem(worn, "sword", 875);
  assert.equal(broken.slots[0], null);
  assert.equal(broken.slots[1].health, 1000);
});

test("resolves the first capable slot and exactly one outcome", () => {
  const target = createContactTarget({ kind: "mountain", cell: { x: 2, y: 3 } });
  const calls = [];
  const result = resolveCharacterContact(DEFAULT_CHARACTER_STATE, target, {
    sword: { canHandle: () => false, handle: () => calls.push("sword") },
    shield: { canHandle: () => false, handle: () => calls.push("shield") },
    pickaxe: { canHandle: () => true, handle: () => { calls.push("pickaxe"); return "dug"; } },
    body: { canHandle: () => true, handle: () => calls.push("body") },
  });
  assert.equal(result.capability, "pickaxe");
  assert.equal(result.outcome, "dug");
  assert.deepEqual(calls, ["pickaxe"]);
});

test("checks resources before the body and leaves unsupported contacts unhandled", () => {
  const state = createCharacterState({ keys: 1 });
  const door = createContactTarget({ kind: "door", cell: { x: 1, y: 1 } });
  const result = resolveCharacterContact(state, door, {
    keys: { canHandle: (target, character) => target.kind === "door" && character.keys > 0, handle: () => "unlock" },
    body: { canHandle: () => true, handle: () => "body" },
  });
  assert.equal(result.capability, "keys");
  assert.equal(result.outcome, "unlock");
  assert.equal(resolveCharacterContact(DEFAULT_CHARACTER_STATE, door, {}).handled, false);
});

test("normalizes cardinal dynamic, object, terrain, and NPC contacts only", () => {
  const cell = { x: 4, y: 5 };
  assert.equal(normalizeContactTarget({ cell, direction: { x: 1, y: 0 }, occupant: { type: "enemy", id: "e1" } }).kind, "enemy");
  assert.equal(normalizeContactTarget({ cell, direction: { x: 0, y: 1 }, object: { type: "door", id: "d1" } }).kind, "door");
  assert.equal(normalizeContactTarget({ cell, direction: { x: -1, y: 0 }, mountain: { type: "mountain", id: "m1" } }).kind, "mountain");
  assert.equal(normalizeContactTarget({ cell, direction: { x: 1, y: 1 }, npc: { type: "npc", id: "n1" } }), null);
});
