import assert from "node:assert/strict";
import test from "node:test";
import questData from "../../../../src/runtime/game-layer-babylon-lite/data/quest_data.json" with { type: "json" };
import { createQuestManager, QUEST_STATES } from "../../../../src/runtime/game-layer-babylon-lite/systems/quest-system.js";
import { createObjectSpawnerSystem, selectPickupCells } from "../../../../src/runtime/game-layer-babylon-lite/systems/object-spawner-system.js";

const collectGold = {
  id: "collect-gold", title: "Collect Gold", objective: "Collect Gold",
  criterion: { mode: "relative", subject: "gold", eventType: "pickup-collected", pickupType: "gold", target: 3 },
};

test("quest data defines the static relative Collect Gold contract", () => {
  const definition = questData.quests.find((quest) => quest.id === "collect-gold");
  assert.deepEqual(definition.criterion, collectGold.criterion);
  assert.deepEqual(definition.pickup.distances, [10, 30, 100]);
  assert.equal(questData.criterionExamples[0].criterion.mode, "absolute");
});

test("relative quests capture a baseline and complete from pickup events", () => {
  const manager = createQuestManager([collectGold]);
  const events = [];
  manager.subscribe((event) => events.push(event.type));
  manager.startQuest("collect-gold", { gold: 7 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 8 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 9 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 10 });
  assert.deepEqual(events, ["started", "progress", "progress", "completed"]);
  assert.deepEqual(manager.getSnapshot(), {
    id: "collect-gold", title: "Collect Gold", objective: "Collect Gold", criterionMode: "relative",
    baseline: 7, state: QUEST_STATES.complete, current: 3, target: 3, complete: true,
  });
});

test("absolute quests can complete immediately from current values", () => {
  const definition = { id: "own-gold", title: "Own Gold", objective: "Own 100+ Gold", criterion: { mode: "absolute", subject: "gold", target: 100, eventType: "gold-changed" } };
  const manager = createQuestManager([definition]);
  manager.startQuest("own-gold", { gold: 100 });
  assert.equal(manager.getSnapshot().state, QUEST_STATES.complete);
  assert.equal(manager.getSnapshot().current, 100);
});

test("starting a pickup quest requests its configured Gold placements", () => {
  const requests = [];
  const manager = createQuestManager([{
    ...collectGold,
    pickup: { type: "gold", distances: [10, 30, 100] },
  }], {}, { requestPickup: (request) => requests.push(request) });
  manager.startQuest("collect-gold");
  assert.deepEqual(requests, [{ type: "gold", distances: [10, 30, 100], questId: "collect-gold" }]);
});

test("pickup collection applies its effect once and emits a collection event", () => {
  const system = createObjectSpawnerSystem({ catalog: [{
    type: "gold", name: "Gold", glyph: "💰", IsPickup: true, IsLevelSpawned: false,
  }] });
  let gold = 0;
  const events = [];
  system.subscribe((event) => events.push(event));
  system.addObject({ id: "gold-1", type: "gold", cell: { x: 2, y: 3 }, effect: () => { gold += 1; } });
  assert.ok(system.collideAtCell({ x: 2, y: 3 }));
  assert.equal(gold, 1);
  assert.equal(system.collideAtCell({ x: 2, y: 3 }), null);
  assert.equal(gold, 1);
  assert.equal(events[0].pickupType, "gold");
});

test("pickup target selection is seeded and targets requested distances", () => {
  const world = { rows: 220, columns: 220, terrain: Array.from({ length: 220 }, () => Array.from({ length: 220 }, () => ({ walkable: true }))) };
  const first = selectPickupCells(world, { x: 110, y: 110 }, [10, 30, 100], () => 0.25);
  const second = selectPickupCells(world, { x: 110, y: 110 }, [10, 30, 100], () => 0.25);
  assert.deepEqual(first, second);
  assert.equal(first.length, 3);
  assert.ok(Math.abs(Math.hypot(first[0].x - 110, first[0].y - 110) - 10) <= 8);
  assert.ok(Math.abs(Math.hypot(first[1].x - 110, first[1].y - 110) - 30) <= 8);
  assert.ok(Math.abs(Math.hypot(first[2].x - 110, first[2].y - 110) - 100) <= 8);
});
