import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { createEnemySpritePresentation, getSpiderFramePath } from "../../../src/client/game-layer-babylon-lite/enemy-sprite-presentation.js";

const world = { columns: 4, rows: 4 };
const fog = { visibility: new Uint8Array(16).fill(100) };
const region = { x: 0, y: 0, columns: 4, rows: 4 };
const enemy = { id: "enemy-1", type: "enemy", realm: "Underground", cell: { x: 1, y: 1 }, facing: "left" };

test("Spider frame paths cover every checked-in animation state", () => {
  const assetBase = "/assets/Spider/Frames";
  const projectAssetBase = resolve(process.cwd(), "ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Enemies/Spider/Frames");
  const paths = [
    ["idle", 4, "Idle/04.png"],
    ["move", 3, "Move/03.png"],
    ["attack", 2, "Attack/02.png"],
    ["death", 6, "Death/06.png"],
  ];
  for (const [state, frame, relativePath] of paths) {
    assert.equal(getSpiderFramePath(assetBase, state, frame), `${assetBase}/${relativePath}`);
    assert.equal(existsSync(resolve(projectAssetBase, relativePath)), true);
  }
});

test("living Spiders animate, then return to idle", () => {
  let time = 0;
  const frames = [];
  const presentation = createEnemySpritePresentation({ now: () => time, requestFrame: () => 1, render: (entries) => frames.push(entries) });
  presentation.reconcile({ enemies: [enemy], realm: "Underground", region, fog, world });
  presentation.present("move", { ...enemy, cell: { x: 2, y: 1 }, facing: "right" }, time);
  presentation.reconcile({ enemies: [{ ...enemy, cell: { x: 2, y: 1 }, facing: "right" }], realm: "Underground", region, fog, world }, time);
  assert.equal(frames.at(-1)[0].state, "move");
  time = 400;
  assert.equal(presentation.snapshot(time)[0].state, "idle");
});

test("Spider corpses survive offscreen within a realm and clear on realm exit", () => {
  let time = 0;
  const presentation = createEnemySpritePresentation({ now: () => time, requestFrame: () => 1, cancelFrame: () => {} });
  presentation.present("death", enemy, time);
  presentation.reconcile({ enemies: [], realm: "Underground", region: { x: 0, y: 0, columns: 1, rows: 1 }, fog, world }, time);
  assert.equal(presentation.corpseCount, 1);
  presentation.reconcile({ enemies: [], realm: "Underground", region, fog, world }, time + 2000);
  assert.equal(presentation.snapshot(time + 2000)[0].frame, 6);
  presentation.clearRealm("Underground");
  presentation.reconcile({ enemies: [], realm: "Underground", region, fog, world }, time + 2000);
  assert.equal(presentation.corpseCount, 0);
  assert.deepEqual(presentation.snapshot(time + 2000), []);
});
