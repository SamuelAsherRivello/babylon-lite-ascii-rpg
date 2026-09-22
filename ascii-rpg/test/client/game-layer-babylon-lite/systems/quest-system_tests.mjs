import assert from "node:assert/strict";
import test from "node:test";
import questData from "../../../../src/client/game-layer-babylon-lite/data/quest_data.json" with { type: "json" };
import { createQuestManager, QUEST_STATES } from "../../../../src/client/game-layer-babylon-lite/systems/quest-system.js";
import { createGameplayEventSystem } from "../../../../src/client/game-layer-babylon-lite/systems/gameplay-event-system.js";
import { createRealmSystem } from "../../../../src/client/game-layer-babylon-lite/systems/realm-system.js";
import { createObjectSpawnerSystem, selectPickupCells } from "../../../../src/client/game-layer-babylon-lite/systems/object-spawner-system.js";

const collectGold = {
  id: "collect-gold", title: "Collect Gold", objective: "Collect Gold",
  steps: [
    { id: "enter-overground", label: "Enter Overground Realm", navigation: "nearest-stairs", criterion: { mode: "event", eventType: "realm-entered", realm: "Overground", target: 1 } },
    { id: "collect-gold", label: "Collect Gold", criterion: { mode: "relative", subject: "gold", eventType: "pickup-collected", pickupType: "gold", target: 3 }, pickup: { type: "gold", distances: [10, 30, 100] } },
  ],
};

const unlockADoor = {
  id: "unlock-a-door", title: "Unlock A Door", objective: "Unlock A Door",
  steps: [
    { id: "enter-underground", label: "Enter Underground Realm", criterion: { mode: "event", eventType: "realm-entered", realm: "Underground", target: 1 } },
    { id: "collect-key", label: "Collect a key", criterion: { mode: "event", eventType: "pickup-collected", pickupType: "key", target: 1 } },
    { id: "open-door", label: "Open a door", criterion: { mode: "event", eventType: "door-unlocked", target: 1 } },
  ],
};

const discoverTheWorld = {
  id: "discover-the-world", title: "Discover the World", objective: "Discover the World", completionOrder: "any",
  steps: [
    { id: "discover-overworld", label: "Discover 1% of Overworld", hideProgress: true, criterion: { mode: "absolute", subject: "realmDiscoveryPercent", eventType: "realm-discovery-changed", realm: "Overground", target: 1 } },
    { id: "discover-underworld", label: "Discover 1% of Underworld", hideProgress: true, criterion: { mode: "absolute", subject: "realmDiscoveryPercent", eventType: "realm-discovery-changed", realm: "Underground", target: 1 } },
  ],
};

test("quest data defines the Overground prerequisite and relative Collect Gold step", () => {
  const definition = questData.quests.find((quest) => quest.id === "collect-gold");
  assert.deepEqual(definition.steps.map(({ id, label }) => ({ id, label })), [
    { id: "enter-overground", label: "Enter Overground Realm" },
    { id: "collect-gold", label: "Collect Gold" },
  ]);
  assert.equal(definition.steps[0].navigation, "nearest-stairs");
  assert.deepEqual(definition.steps[1].criterion, collectGold.steps[1].criterion);
  assert.deepEqual(definition.steps[1].pickup.distances, [10, 30, 100]);
  assert.equal(questData.criterionExamples[0].criterion.mode, "absolute");
});

test("quest data defines Unlock A Door with the requested ordered steps", () => {
  const definition = questData.quests.find((quest) => quest.id === "unlock-a-door");
  assert.ok(definition);
  assert.deepEqual(definition.steps.map(({ id, label }) => ({ id, label })), [
    { id: "enter-underground", label: "Enter Underground Realm" },
    { id: "collect-key", label: "Collect a key" },
    { id: "open-door", label: "Open a door" },
  ]);
  assert.equal(definition.steps[0].navigation, "nearest-stairs");
  assert.deepEqual(definition.steps.map(({ criterion }) => criterion), unlockADoor.steps.map(({ criterion }) => criterion));
});

test("quest data defines Discover the World with per-realm discovery goals", () => {
  const definition = questData.quests.find((quest) => quest.id === "discover-the-world");
  assert.ok(definition);
  assert.equal(definition.title, "Discover the World");
  assert.deepEqual(definition.steps.map(({ id, label }) => ({ id, label })), [
    { id: "discover-overworld", label: "Discover 1% of Overworld" },
    { id: "discover-underworld", label: "Discover 1% of Underworld" },
  ]);
  assert.deepEqual(definition.steps.map(({ hideProgress }) => hideProgress), [true, true]);
  assert.equal(definition.completionOrder, "any");
  assert.deepEqual(definition.steps.map(({ criterion }) => criterion), discoverTheWorld.steps.map(({ criterion }) => criterion));
});

test("Discover the World tracks both realm discovery percentages in any order before completing", () => {
  const manager = createQuestManager([discoverTheWorld]);
  const events = [];
  manager.subscribe((event) => events.push(event.type));
  manager.startQuest("discover-the-world", {
    realmDiscoveryPercent: { Overground: 0, Underground: 0 },
  });

  manager.observe({ type: "realm-discovery-changed", realm: "Underground" }, {
    realmDiscoveryPercent: { Overground: 0, Underground: 1 },
  });
  assert.equal(manager.getSnapshot().activeStepId, "discover-overworld");
  assert.equal(manager.getSnapshot().complete, false);
  assert.deepEqual(manager.getSnapshot().steps.map(({ id, complete }) => ({ id, complete })), [
    { id: "discover-overworld", complete: false },
    { id: "discover-underworld", complete: true },
  ]);

  manager.observe({ type: "realm-discovery-changed", realm: "Overground" }, {
    realmDiscoveryPercent: { Overground: 1, Underground: 1 },
  });

  assert.equal(manager.getSnapshot().activeStepId, "discover-underworld");
  assert.equal(manager.getSnapshot().complete, true);
  assert.deepEqual(manager.getSnapshot().steps.map(({ id, current, target, complete, hideProgress }) => ({ id, current, target, complete, hideProgress })), [
    { id: "discover-overworld", current: 1, target: 1, complete: true, hideProgress: true },
    { id: "discover-underworld", current: 1, target: 1, complete: true, hideProgress: true },
  ]);
  assert.deepEqual(events, ["started", "step-completed", "step-completed", "completed"]);
});

test("Unlock A Door starts from Underground, counts one key, and completes on door unlock", () => {
  const manager = createQuestManager([unlockADoor]);
  const events = [];
  manager.subscribe((event) => events.push(event.type));
  manager.startQuest("unlock-a-door");
  manager.observe({ type: "realm-entered", realm: "Overground" });
  assert.equal(manager.getSnapshot().activeStepId, "enter-underground");
  manager.observe({ type: "realm-entered", realm: "Underground" });
  assert.equal(manager.getSnapshot().activeStepId, "collect-key");
  manager.observe({ type: "door-unlocked" });
  assert.equal(manager.getSnapshot().activeStepId, "collect-key");
  manager.observe({ type: "pickup-collected", pickupType: "key" });
  assert.equal(manager.getSnapshot().activeStepId, "open-door");
  manager.observe({ type: "door-unlocked" });
  assert.equal(manager.getSnapshot().complete, true);
  assert.deepEqual(events, ["started", "step-completed", "step-started", "step-completed", "step-started", "step-completed", "completed"]);
});

test("Collect Gold advances to Unlock A Door in catalog order", () => {
  const manager = createQuestManager([collectGold, unlockADoor]);
  manager.startQuest("collect-gold", { gold: 0 });
  manager.observe({ type: "realm-entered", realm: "Overground" }, { gold: 0 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 1 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 2 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 3 });
  assert.equal(manager.startNextQuest().id, "unlock-a-door");
});

test("all quest definitions are available to the quest selector catalog", () => {
  assert.ok(questData.quests.some((quest) => quest.id === "collect-gold"));
  assert.ok(questData.quests.some((quest) => quest.id === "unlock-a-door"));
  assert.ok(questData.quests.some((quest) => quest.id === "discover-the-world"));
  assert.equal(new Set(questData.quests.map((quest) => quest.id)).size, questData.quests.length);
});

test("the Collect Gold quest waits for Overground before requesting gold", () => {
  const requests = [];
  const events = [];
  const manager = createQuestManager([collectGold], {}, { requestPickup: (request) => requests.push(request) });
  manager.subscribe((event) => events.push(event.type));
  manager.startQuest("collect-gold", { gold: 7 });
  assert.deepEqual(requests, []);
  assert.equal(manager.getSnapshot().activeStepId, "enter-overground");

  manager.observe({ type: "realm-entered", realm: "Underground" }, { gold: 7 });
  assert.equal(manager.getSnapshot().activeStepId, "enter-overground");
  manager.observe({ type: "realm-entered", realm: "Overground" }, { gold: 7 });
  assert.deepEqual(requests, [{ type: "gold", distances: [10, 30, 100], questId: "collect-gold", stepId: "collect-gold" }]);
  assert.equal(manager.getSnapshot().activeStepId, "collect-gold");
  assert.equal(manager.getSnapshot().current, 0);
  assert.deepEqual(events, ["started", "step-completed", "step-started"]);
});

test("relative gold progress completes the second step from pickup events", () => {
  const manager = createQuestManager([collectGold]);
  const events = [];
  manager.subscribe((event) => events.push(event.type));
  manager.startQuest("collect-gold", { gold: 7 });
  manager.observe({ type: "realm-entered", realm: "Overground" }, { gold: 7 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 8 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 9 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 10 });
  assert.deepEqual(events, ["started", "step-completed", "step-started", "progress", "progress", "step-completed", "completed"]);
  assert.deepEqual(manager.getSnapshot(), {
    id: "collect-gold", title: "Collect Gold", objective: "Collect Gold", criterionMode: "relative",
    baseline: 7, state: QUEST_STATES.complete, current: 3, target: 3, activeStepId: "collect-gold", complete: true,
    steps: [
      { id: "enter-overground", label: "Enter Overground Realm", navigation: "nearest-stairs", state: "complete", active: false, current: 1, target: 1, complete: true },
      { id: "collect-gold", label: "Collect Gold", navigation: null, state: "complete", active: true, current: 3, target: 3, complete: true },
    ],
  });
});

test("completed quests advance to the next available definition and otherwise remain complete", () => {
  const nextQuest = {
    id: "next-quest", title: "Next Quest", objective: "Next Quest",
    criterion: { mode: "event", eventType: "next-event", target: 1 },
  };
  const manager = createQuestManager([collectGold, nextQuest]);
  manager.startQuest("collect-gold", { gold: 0 });
  manager.observe({ type: "realm-entered", realm: "Overground" }, { gold: 0 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 1 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 2 });
  manager.observe({ type: "pickup-collected", pickupType: "gold" }, { gold: 3 });
  assert.equal(manager.getSnapshot().id, "collect-gold");
  assert.equal(manager.getSnapshot().complete, true);
  assert.equal(manager.startNextQuest().id, "next-quest");
  manager.observe({ type: "next-event" });
  assert.equal(manager.getSnapshot().complete, true);
  assert.equal(manager.startNextQuest().id, "next-quest");
});

test("completed quest definitions are skipped during later session advancement", () => {
  const firstQuest = {
    id: "first-quest", title: "First Quest", objective: "First Quest",
    criterion: { mode: "event", eventType: "first-event", target: 1 },
  };
  const alreadyCompletedQuest = {
    id: "already-completed", title: "Already Completed", objective: "Already Completed",
    criterion: { mode: "event", eventType: "skipped-event", target: 1 },
  };
  const finalQuest = {
    id: "final-quest", title: "Final Quest", objective: "Final Quest",
    criterion: { mode: "event", eventType: "final-event", target: 1 },
  };
  const manager = createQuestManager([firstQuest, alreadyCompletedQuest, finalQuest]);

  manager.startQuest("already-completed");
  manager.observe({ type: "skipped-event" });
  manager.startQuest("first-quest");
  manager.observe({ type: "first-event" });

  assert.equal(manager.startNextQuest().id, "final-quest");
  manager.observe({ type: "final-event" });
  assert.equal(manager.startNextQuest().id, "final-quest");
  assert.equal(manager.getSnapshot().complete, true);
});

test("absolute legacy definitions can complete immediately", () => {
  const definition = { id: "own-gold", title: "Own Gold", objective: "Own 100+ Gold", criterion: { mode: "absolute", subject: "gold", target: 100, eventType: "gold-changed" } };
  const manager = createQuestManager([definition]);
  manager.startQuest("own-gold", { gold: 100 });
  assert.equal(manager.getSnapshot().state, QUEST_STATES.complete);
  assert.equal(manager.getSnapshot().current, 100);
});

test("generic gameplay events are immutable and reach every subscriber", () => {
  const eventSystem = createGameplayEventSystem();
  const received = [];
  eventSystem.subscribe((event) => received.push(event));
  const event = eventSystem.publish({ type: "realm-entered", realm: "Overground", cell: { x: 1, y: 2 } });
  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.cell), true);
  assert.deepEqual(received, [event]);
});

test("Realm System publishes only generic realm-entry facts", () => {
  const eventSystem = createGameplayEventSystem();
  const realmSystem = createRealmSystem({ eventSystem });
  const events = [];
  eventSystem.subscribe((event) => events.push(event));
  realmSystem.enter("Overground");
  realmSystem.enter("Underground");
  assert.deepEqual(events, [
    { type: "realm-entered", realm: "Overground", cell: undefined },
    { type: "realm-entered", realm: "Underground", cell: undefined },
  ]);
  assert.throws(() => realmSystem.enter("Moon"), /Unknown realm/);
});

test("pickup collection applies its effect once and emits a collection event", () => {
  const system = createObjectSpawnerSystem({ catalog: [
    { type: "gold", name: "Gold", glyph: "💰", IsPickup: true, IsLevelSpawned: false },
  ] });
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
