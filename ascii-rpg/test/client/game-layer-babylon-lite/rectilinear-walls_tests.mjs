import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getWallBlobMask, getWallComposition, normalizeWallMask, EXAMPLE_WALL_FRAMES } from "../../../src/client/game-layer-babylon-lite/underground-wall-autotile.js";
import { createCavePass, createGroundPass } from "../../../src/client/game-layer-babylon-lite/generation-layers/grid-generation-layer.js";
import { createRandom, createWorld, createWorldCooperative, createWorldRealms } from "../../../src/client/game-layer-babylon-lite/systems/world-system.js";

test("all 256 neighborhoods normalize to 47 complete bounded wall recipes", () => {
  const masks = new Set();
  for (let raw = 0; raw < 256; raw++) {
    const mask = normalizeWallMask(raw);
    masks.add(mask);
    assert.equal(normalizeWallMask(mask), mask);
    const covered = new Uint8Array(32 * 32);
    for (const [x, y, w, h, dx, dy] of getWallComposition(raw)) {
      assert.ok(x >= 0 && y >= 0 && x + w <= 384 && y + h <= 288);
      assert.ok(dx >= 0 && dy >= 0 && dx + w <= 32 && dy + h <= 32);
      for (let py = dy; py < dy + h; py++) for (let px = dx; px < dx + w; px++) covered[py * 32 + px]++;
    }
    assert.ok(covered.every(value => value === 1));
  }
  assert.equal(masks.size, 47);
});

test("example-derived frame choices occur in the matching authored neighborhood", () => {
  const xml = readFileSync(new URL("../../../public/assets/images/Dungeons-and-Pixels-v1.4/Tiled_Examples/wall_combinations01.tmx", import.meta.url), "utf8");
  const values = xml.match(/name="Walls"[\s\S]*?<data encoding="csv">([\s\S]*?)<\/data>/)[1].trim().split(/\s*,\s*/).map(Number);
  const world = { rows: 15, columns: 15, terrain: Array.from({ length: 15 }, (_, y) => Array.from({ length: 15 }, (_, x) => ({ kind: values[y * 15 + x] ? "wall" : "dirt" }))) };
  const found = new Map();
  for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) {
    if (!values[y * 15 + x]) continue;
    // The reference is a palette, not a bounded game world: its exterior is empty.
    const padded = { rows: 17, columns: 17, terrain: Array.from({ length: 17 }, (_, py) => Array.from({ length: 17 }, (_, px) => world.terrain[py - 1]?.[px - 1] ?? { kind: "dirt" })) };
    const mask = getWallBlobMask(padded, { x: x + 1, y: y + 1 });
    if (!found.has(mask)) found.set(mask, new Set());
    found.get(mask).add(values[y * 15 + x] - 1);
  }
  for (const [mask, frame] of Object.entries(EXAMPLE_WALL_FRAMES)) assert.ok(found.get(Number(mask))?.has(frame), `${mask} -> ${frame}`);
});

test("diagonals affect connected corners only; world borders connect outward", () => {
  const world = { rows: 3, columns: 3, terrain: Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ({ kind: "wall" }))) };
  assert.equal(getWallBlobMask(world, { x: 0, y: 0 }), 255);
  assert.equal(getWallBlobMask(world, { x: 1, y: 1 }), 255);
  world.terrain[0][0].kind = "dirt";
  assert.equal(getWallBlobMask(world, { x: 1, y: 1 }), 127);
  world.terrain[0][1].kind = "dirt";
  const mask = getWallBlobMask(world, { x: 1, y: 1 });
  world.terrain[0][0].kind = "wall";
  assert.equal(getWallBlobMask(world, { x: 1, y: 1 }), mask);
});

test("rectilinear pass makes uniform 3x3 blocks without changing disabled caves", () => {
  const options = { rows: 32, columns: 35, wallFillPercent: 50, smoothingIterations: 4, ground: createGroundPass(32, 35) };
  const generate = (extra = {}) => createCavePass({ ...options, random: createRandom("rectilinear"), ...extra });
  const walls = generate({ rectilinear: true });
  const organic = generate();
  assert.deepEqual(walls, generate({ rectilinear: true }));
  assert.notDeepEqual(walls, generate());
  for (let y = 1; y < 31; y++) for (let x = 1; x < 34; x++) {
    if (!organic[y][x]) assert.equal(walls[y][x], false, "existing floor remains open");
  }
  for (let y = 1; y < 31; y++) for (let x = 1; x < 34; x++) assert.equal(walls[y][x], walls[1 + Math.floor((y - 1) / 3) * 3][1 + Math.floor((x - 1) / 3) * 3]);
  assert.deepEqual(generate({ caveEnabled: false, rectilinear: true }), generate({ caveEnabled: false }));
});

test("rectilinear sync/cooperative terrain agrees and Overground keeps organic generation", async () => {
  const options = { rows: 48, columns: 48, seed: "architectural", torchCount: 0, waterEnabled: false, wallFillPercent: 40, rectilinear: true };
  const sync = createWorld(options);
  const cooperative = await createWorldCooperative(options);
  assert.deepEqual(cooperative.terrain, sync.terrain);
  const result = await createWorldRealms({ rows: 48, columns: 48, seed: "architectural", torchCount: 0, stairCount: 0, waterEnabled: false });
  const organic = createWorld({ rows: 48, columns: 48, seed: "architectural:Overground", torchCount: 0, waterEnabled: false, wallFillPercent: 25, minWalkablePercent: 0.55 });
  assert.deepEqual(result.realms.Overground.terrain.map(row => row.map(cell => cell.walkable)), organic.terrain.map(row => row.map(cell => cell.walkable)));
});
