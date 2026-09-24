import test from "node:test";
import assert from "node:assert/strict";
import { BLAST_GLYPH, BOMB_GLYPH, createBombSystem, getBlastRingCells } from "../../../../src/client/game-layer-babylon-lite/systems/bomb-system.js";
import { createTimeSystem } from "../../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { createDynamicOccupancy } from "../../../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js";

const world = (realmName) => ({ realmName, rows: 20, columns: 20 });

test("expands through the newly reached Euclidean circle cells", () => {
  const origin = { x: 5, y: 5 };
  const first = getBlastRingCells(origin, 1, 0).map(({ x, y }) => `${x},${y}`).sort();
  const second = getBlastRingCells(origin, 2, 1).map(({ x, y }) => `${x},${y}`).sort();
  assert.deepEqual(first, ["4,5", "5,4", "5,5", "5,6", "6,5"]);
  assert.equal(second.length, 8);
  assert.ok(second.includes("4,4"));
  assert.ok(second.includes("3,5"));
});

test("bombs wait five later world ticks, then expose five rings in both realms", () => {
  const timeSystem = createTimeSystem();
  const hits = [];
  const bombs = createBombSystem({ timeSystem, worlds: { Overground: world("Overground"), Underground: world("Underground") }, damageAt: (realm, cell) => hits.push({ realm, cell, time: timeSystem.getTime() }) });
  timeSystem.advance(1, "placement");
  const planted = bombs.place("Overground", { x: 10, y: 10 });
  assert.equal(bombs.getGlyphAt("Overground", { x: 10, y: 10 }), BOMB_GLYPH);
  bombs.place("Underground", { x: 3, y: 3 });
  timeSystem.advance(4);
  assert.equal(hits.length, 0);
  const pausedAt = timeSystem.getTime();
  assert.equal(bombs.getBombs("Overground")[0].fuseAt, pausedAt + 1);
  timeSystem.advance();
  assert.equal(hits.filter(({ realm }) => realm === "Overground").length, 5);
  assert.equal(hits.filter(({ realm }) => realm === "Underground").length, 5);
  assert.equal(bombs.getBombs("Overground")[0].radius, 1);
  assert.equal(bombs.getGlyphAt("Overground", { x: 10, y: 10 }), BLAST_GLYPH);
  assert.equal(bombs.getGlyphAt("Overground", { x: 11, y: 11 }), null);
  timeSystem.advance();
  assert.equal(bombs.getGlyphAt("Overground", { x: 11, y: 11 }), BLAST_GLYPH);
  timeSystem.advance(3);
  assert.equal(bombs.getBombs().length, 0);
  assert.equal(hits.filter(({ realm }) => realm === "Overground").length, 177);
  assert.equal(planted.fuseAt, 7);
});

test("every active blast tick damages actors that enter an already-expanded circle", () => {
  const timeSystem = createTimeSystem();
  let playerCell = { x: 10, y: 10 };
  const playerHits = [];
  const bombs = createBombSystem({
    timeSystem,
    worlds: { Overground: world("Overground") },
    damageAt: (realm, cell, damage, context) => {
      if (realm === "Overground" && cell.x === playerCell.x && cell.y === playerCell.y) {
        playerHits.push({ damage, time: context.time });
      }
    },
  });
  bombs.place("Overground", { x: 10, y: 10 });
  timeSystem.advance(5); // Detonation, radius one.
  assert.equal(playerHits.length, 1);
  playerCell = { x: 15, y: 10 };
  timeSystem.advance(); // Radius two; player is outside.
  playerCell = { x: 12, y: 10 }; // This cell was already reached at radius two.
  timeSystem.advance(); // Radius three must still damage its current occupant.
  assert.equal(playerHits.length, 2);
  assert.equal(playerHits[1].time, timeSystem.getTime());
  playerCell = { x: 15, y: 10 };
  timeSystem.advance();
  playerCell = { x: 12, y: 10 };
  timeSystem.advance(); // Leave, then re-enter while the blast is active.
  assert.equal(playerHits.length, 3);
});

test("bomb registry can overlap actor occupancy and remains planted when the actor moves away", () => {
  const timeSystem = createTimeSystem();
  const occupancy = createDynamicOccupancy();
  const bombs = createBombSystem({ timeSystem, worlds: { Overground: world("Overground") } });
  occupancy.claim({ id: "player", type: "player", cell: { x: 10, y: 10 } });
  assert.ok(bombs.place("Overground", { x: 10, y: 10 }));
  assert.equal(occupancy.move("player", { x: 11, y: 10 }), true);
  assert.equal(bombs.getGlyphAt("Overground", { x: 10, y: 10 }), BOMB_GLYPH);
  assert.equal(bombs.place("Overground", { x: 10, y: 10 }), null);
});

test("rejects duplicate cell placement and detonates a contacted bomb one tick later", () => {
  const timeSystem = createTimeSystem();
  const hits = [];
  const bombs = createBombSystem({ timeSystem, worlds: { Overground: world("Overground") }, damageAt: (realm, cell, damage, context) => hits.push({ cell, damage, time: context.time }) });
  timeSystem.advance(1);
  const first = bombs.place("Overground", { x: 8, y: 8 });
  assert.equal(bombs.place("Overground", { x: 8, y: 8 }), null);
  timeSystem.advance(3);
  const chained = bombs.place("Overground", { x: 9, y: 8 });
  timeSystem.advance(2);
  assert.equal(bombs.getBombs().find(({ id }) => id === first.id).detonatedAt, timeSystem.getTime());
  assert.equal(bombs.getBombs().find(({ id }) => id === chained.id).chainAt, timeSystem.getTime() + 1);
  timeSystem.advance();
  assert.equal(bombs.getBombs().find(({ id }) => id === chained.id).detonatedAt, timeSystem.getTime());
  assert.equal(hits.some(({ cell, time }) => cell.x === 9 && cell.y === 8 && time === timeSystem.getTime()), true);
});

test("bomb phase resolves before regular actor tickables and can cancel them", () => {
  const timeSystem = createTimeSystem();
  const phases = [];
  const bombs = createBombSystem({ timeSystem, worlds: { Overground: world("Overground") }, damageAt: () => phases.push("blast") });
  bombs.place("Overground", { x: 5, y: 5 });
  timeSystem.registerTickable("actor", () => phases.push("actor"));
  timeSystem.advance(5);
  phases.length = 0;
  timeSystem.advance(1, "movement", { shouldContinue: () => false });
  assert.ok(phases.length > 0);
  assert.ok(phases.every((phase) => phase === "blast"));
});

test("runs the validated player action after blasts and before enemy or NPC tickables", () => {
  const timeSystem = createTimeSystem();
  const phases = [];
  const bombs = createBombSystem({ timeSystem, worlds: { Overground: world("Overground") }, damageAt: () => phases.push("blast") });
  bombs.place("Overground", { x: 5, y: 5 });
  timeSystem.registerTickable("actor", () => phases.push("actor"));
  timeSystem.advance(5);
  phases.length = 0;
  timeSystem.advance(1, "movement", { beforeTick: () => phases.push("player-action") });
  assert.ok(phases.indexOf("blast") < phases.indexOf("player-action"));
  assert.ok(phases.indexOf("player-action") < phases.indexOf("actor"));
  assert.equal(phases.at(-1), "actor");
});
