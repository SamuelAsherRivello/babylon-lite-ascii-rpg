import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTile, createAnimatedTile, resolveAnimation, getAnimationSnapshot, getTileBackgroundStyle, resolveMotion } from "../../../src/client/game-layer-babylon-lite/tile-animation.js";
import { ANIMATION_PROFILES, HERO_PROFILES, MOTION_PROFILES } from "../../../src/client/game-layer-babylon-lite/animation-profiles.js";
import { createTimeSystem } from "../../../src/client/game-layer-babylon-lite/systems/time-system.js";
import { CHARACTER_BAR_DELTA_DURATION_MS } from "../../../src/client/ui-layer-react/character-bar-presentation.js";
import { TOAST_ENTER_DURATION_MS, TOAST_EXIT_DURATION_MS } from "../../../src/client/ui-layer-react/toast-state.js";

const tile = createTile({ source: "/test.png", sourceWidth: 64, sourceHeight: 32, width: 32, height: 32 });
const second = createTile({ ...tile, x: 32 });
const definition = { frames: [tile, second], durations: [100, 200], loop: true, timeDomain: "realTime" };

test("tile definitions reject missing/unqualified assets and invalid source rectangles", () => {
  for (const patch of [{ source: "test.png" }, { source: "/test.jpg" }, { source: "" }, { width: 0 }, { x: -1 }, { x: 33 }, { height: 33 }, { sourceWidth: NaN }, { y: 0.5 }]) {
    assert.throws(() => createTile({ ...tile, ...patch }));
  }
  assert.ok(Object.isFrozen(tile));
  assert.throws(() => { tile.x = 2; });
});

test("animations require explicit immutable frames, positive cadence, loop, and time domain", () => {
  for (const patch of [{ frames: [] }, { frames: Array(2) }, { durations: Array(2) }, { durations: [] }, { durations: [0, 1] }, { durations: [Infinity, 1] },
    { loop: undefined }, { timeDomain: undefined }, { timeDomain: "ticks" }, { frames: [tile, {}] },
    { timeDomain: "tickTime", durations: [0.5, 1] }]) assert.throws(() => createAnimatedTile({ ...definition, ...patch }));
  const input = structuredClone(definition);
  const animation = createAnimatedTile(input);
  input.durations[0] = 999;
  input.frames[0].x = 1;
  assert.equal(animation.durations[0], 100);
  assert.equal(animation.frames[0].x, 0);
  assert.ok(Object.isFrozen(animation.frames) && Object.isFrozen(animation.frames[0]) && Object.isFrozen(animation.durations));
});

test("shared snapshots resolve unequal looping durations and one-shot final-frame hold", () => {
  const loop = createAnimatedTile(definition);
  const once = createAnimatedTile({ ...definition, loop: false });
  for (const [time, frame] of [[-1, 0], [0, 0], [99, 0], [100, 1], [299, 1], [300, 0], [400, 1], [600, 0]]) {
    const snapshot = { realTimeMs: time, tickTime: 1 };
    assert.equal(resolveAnimation(loop, snapshot).frameIndex, frame);
    assert.deepEqual(resolveAnimation(loop, snapshot), resolveAnimation(loop, snapshot));
  }
  assert.equal(resolveAnimation(once, { realTimeMs: 299 }).complete, false);
  for (const time of [300, 10000]) {
    const resolved = resolveAnimation(once, { realTimeMs: time });
    assert.equal(resolved.frameIndex, 1);
    assert.equal(resolved.complete, true);
  }
});

test("tick-time reads authoritative time without advancing time or delivering ticks", () => {
  const clock = createTimeSystem(1, { now: () => 0 });
  let delivered = 0;
  clock.registerTickable("observer", () => delivered++);
  const animation = createAnimatedTile({ ...definition, durations: [1, 1], timeDomain: "tickTime" });
  for (const ms of [0, 100, 10000]) assert.equal(resolveAnimation(animation, getAnimationSnapshot(clock, ms), 1).frameIndex, 0);
  assert.equal(clock.getTime(), 1);
  assert.equal(delivered, 0);
  clock.advance();
  assert.equal(resolveAnimation(animation, getAnimationSnapshot(clock, 10000), 1).frameIndex, 1);
  assert.equal(clock.getTime(), 2);
  assert.equal(delivered, 1);
  assert.throws(() => resolveAnimation(animation, { tickTime: 1.5 }));
  clock.dispose();
});

test("every current animation has exactly one explicit profile and valid checked-in PNG geometry", () => {
  const expected = ["water", "goldCoin", "torch", "trap", ...["idle", "run", "attack", "death"].map((state) => `hero.${state}`),
    ...["idle", "move", "attack", "death"].map((state) => `spider.${state}`),
    ...["FireBlast", "FireBurst", "FirePlume", "OilyFireball", "Smoke", "SmokeGas", "SmokeLarge", "SmokePoff", "SmokeSmall", "SmokeThick", "SmokeThickPuff"].map((name) => `particle.${name}`),
    "particle.BombExplosion", "health.fade", "health.delta", "floatingText", "realmMask", "toast.enter", "toast.exit", "characterInfo.delta"];
  assert.deepEqual(Object.keys(ANIMATION_PROFILES).sort(), expected.sort());
  const looping = new Set(["water", "goldCoin", "torch", "trap", "hero.idle", "hero.run", "spider.idle"]);
  for (const [id, profile] of Object.entries(ANIMATION_PROFILES)) {
    assert.equal(profile.id, id);
    assert.equal(profile.timeDomain, "realTime");
    assert.equal(profile.loop, looping.has(id));
    assert.ok(profile.adapter && Object.isFrozen(profile));
    for (const frame of profile.frames ?? []) {
      const png = readFileSync(new URL(`../../../public${decodeURIComponent(frame.source)}`, import.meta.url));
      assert.equal(png.readUInt32BE(16), frame.sourceWidth, frame.source);
      assert.equal(png.readUInt32BE(20), frame.sourceHeight, frame.source);
    }
  }
});

test("hero attack completes once and death holds its final full-size image", () => {
  assert.equal(resolveAnimation(HERO_PROFILES.attack, { realTimeMs: 479 }).complete, false);
  assert.equal(resolveAnimation(HERO_PROFILES.attack, { realTimeMs: 480 }).complete, true);
  const death = resolveAnimation(HERO_PROFILES.death, { realTimeMs: 5000 });
  assert.equal(death.frameIndex, 5);
  assert.equal(death.tile.width, 48);
  assert.match(death.tile.source, /Death\/05.png$/);
});

test("motion and UI-local adapters preserve completion and reduced-motion ownership", () => {
  assert.deepEqual(resolveMotion(MOTION_PROFILES.realmMask, 600, 100, 1000), { elapsed: 500, progress: 0.5, complete: false });
  assert.equal(resolveMotion(MOTION_PROFILES.healthFade, 100, 100, 0).progress, 1);
  assert.equal(CHARACTER_BAR_DELTA_DURATION_MS, 300);
  assert.equal(TOAST_ENTER_DURATION_MS, 250);
  assert.equal(TOAST_EXIT_DURATION_MS, 250);
  const css = readFileSync(new URL("../../../src/client/ui-layer-react/toasts.css", import.meta.url), "utf8");
  assert.match(css, /toast_descend var\(--toast-enter-duration, 250ms\)/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*animation-duration: 1ms/);
});

test("CSS adapters crop strips and static images from declared source geometry", () => {
  assert.deepEqual(getTileBackgroundStyle(second), { backgroundImage: 'url("/test.png")', backgroundSize: "200% 100%", backgroundPosition: "100% 0%" });
  assert.equal(getTileBackgroundStyle(HERO_PROFILES.death.frames[0]).backgroundSize, "100% 100%");
  assert.equal(getTileBackgroundStyle(HERO_PROFILES.death.frames[0]).backgroundPosition, "0% 0%");
});
