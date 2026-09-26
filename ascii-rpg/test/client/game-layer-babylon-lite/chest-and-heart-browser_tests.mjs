import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { chromium } from "playwright";

const port = 4179;
const baseUrl = `http://127.0.0.1:${port}`;

function route(snapshot, target) {
  const start = snapshot.playerCell;
  const blocked = new Set(snapshot.objects.filter((object) => object.type !== "heart")
    .map((object) => `${object.cell.x},${object.cell.y}`));
  const queue = [start];
  const previous = new Map([[`${start.x},${start.y}`, null]]);
  while (queue.length) {
    const cell = queue.shift();
    if (cell.x === target.x && cell.y === target.y) break;
    for (const [key, dx, dy] of [["ArrowUp", 0, -1], ["ArrowRight", 1, 0], ["ArrowDown", 0, 1], ["ArrowLeft", -1, 0]]) {
      const next = { x: cell.x + dx, y: cell.y + dy };
      const id = `${next.x},${next.y}`;
      if (previous.has(id) || !snapshot.terrain[next.y]?.[next.x] || blocked.has(id)) continue;
      previous.set(id, { cell, key });
      queue.push(next);
    }
  }
  const steps = [];
  for (let id = `${target.x},${target.y}`; previous.get(id); id = `${previous.get(id).cell.x},${previous.get(id).cell.y}`) steps.unshift(previous.get(id).key);
  return steps;
}

async function walk(page, steps) {
  for (const key of steps) {
    await page.keyboard.press(key);
    await page.waitForTimeout(20);
  }
}

test("a seeded built game opens a chest and collects its Heart through keyboard input", { timeout: 120000 }, async (t) => {
  const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });
  t.after(() => server.kill());
  const browser = await chromium.launch({ headless: true, args: ["--enable-unsafe-webgpu", "--use-angle=swiftshader"] });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${baseUrl}/?skipTutorial=true&randomSeed=chest-heart-acceptance&testHarness=chest-and-heart`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.asciiRpgTest?.snapshot?.().objects?.some((object) => object.type === "chest"));
  const logButton = page.getByRole("button", { name: "Log" });
  if (await logButton.getAttribute("aria-expanded") === "false") await logButton.click();

  let snapshot = await page.evaluate(() => window.asciiRpgTest.snapshot());
  const chest = snapshot.objects.find((object) => object.type === "chest" && !object.open);
  assert.ok(chest, "the seeded game has an unopened chest");
  const adjacent = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([x, y]) => ({ x: chest.cell.x + x, y: chest.cell.y + y }))
    .find((cell) => snapshot.terrain[cell.y]?.[cell.x] && !snapshot.objects.some((object) => object.cell.x === cell.x && object.cell.y === cell.y));
  assert.ok(adjacent, "the chest has a walkable cardinal approach");
  await walk(page, route(snapshot, adjacent));
  await page.keyboard.press(chest.cell.x > adjacent.x ? "ArrowRight" : chest.cell.x < adjacent.x ? "ArrowLeft" : chest.cell.y > adjacent.y ? "ArrowDown" : "ArrowUp");
  await page.waitForFunction(() => window.asciiRpgTest.snapshot().objects.some((object) => object.type === "chest" && object.open));
  snapshot = await page.evaluate(() => window.asciiRpgTest.snapshot());
  assert.ok(snapshot.log.includes("Chest was opened"));
  assert.ok(await page.getByLabel("Log entries").getByText("Chest was opened").isVisible());
  const heart = snapshot.objects.find((object) => object.type === "heart");
  assert.ok(heart, "opening the chest creates a Heart");
  await walk(page, route(snapshot, heart.cell));
  await page.waitForFunction(() => window.asciiRpgTest.snapshot().log.includes("Collected +2 Health from Heart"));
  assert.ok(await page.getByLabel("Log entries").getByText("Collected +2 Health from Heart").isVisible());
});
