import { createAnimatedTile, createTile } from "./tile-animation.js";

const base = import.meta.env?.BASE_URL ?? "/";
const art = `${base}assets/images/Dungeons-and-Pixels-v1.4`;
const profiles = {};
function register(id, frames, duration, loop, adapter) {
  const animation = createAnimatedTile({ frames, durations: frames.map(() => duration), loop, timeDomain: "realTime" });
  const profile = Object.freeze({ id, adapter, ...animation });
  if (profiles[id]) throw new Error(`Duplicate animation profile: ${id}`);
  profiles[id] = profile;
  return profile;
}
function strip(id, source, count, duration, adapter, { sourceWidth = count * 32, sourceHeight = 32, x = 0, y = 0 } = {}) {
  return register(id, Array.from({ length: count }, (_, index) => createTile({ source, sourceWidth, sourceHeight,
    x: x + index * 32, y, width: 32, height: 32 })), duration, true, adapter);
}
export const WATER_PROFILE = strip("water", `${art}/Tilesets/Tileset_Dungeon.png`, 4, 400, "terrain", { sourceWidth: 384, sourceHeight: 288, x: 224, y: 192 });
export const GOLD_COIN_PROFILE = strip("goldCoin", `${art}/Items/Animated/gold_coin.png`, 4, 160, "terrain");
export const TORCH_PROFILE = strip("torch", `${art}/Props/Animated/torch_strip.png`, 3, 160, "strip");
export const TRAP_PROFILE = strip("trap", `${art}/Props/Animated/trap1_strip.png`, 7, 120, "strip");

function sequence(id, sourceForFrame, count, duration, loop, width, height, adapter = "character") {
  return register(id, Array.from({ length: count }, (_, index) => createTile({ source: sourceForFrame(index),
    sourceWidth: width, sourceHeight: height, width, height })), duration, loop, adapter);
}
export const HERO_PROFILES = Object.freeze(Object.fromEntries([
  ["idle", 4, 180, true], ["run", 6, 100, true], ["attack", 4, 120, false], ["death", 6, 150, false],
].map(([state, count, duration, loop]) => [state, sequence(`hero.${state}`, (index) =>
  `${art}/Characters/Hero_Warrior/Frames/${state[0].toUpperCase() + state.slice(1)}/${state === "death" ? "" : "Side/"}${String(index).padStart(2, "0")}.png`,
count, duration, loop, state === "death" ? 48 : 32, 48)])));
export const SPIDER_PROFILES = Object.freeze(Object.fromEntries([
  ["idle", 5, 180, true], ["move", 4, 100, false], ["attack", 3, 120, false], ["death", 7, 150, false],
].map(([state, count, duration, loop]) => [state, sequence(`spider.${state}`, (index) =>
  `${art}/Enemies/Spider/Frames/${state[0].toUpperCase() + state.slice(1)}/${String(index).padStart(2, "0")}.png`,
count, duration, loop, 32, 32)])));

export const PARTICLE_PROFILES = Object.freeze([
  ["FireBlast", "FireBlast_18x1", "Fire_Blast", 18, 72, 22],
  ["FireBurst", "FireBurst_11x1", "Fire_Burst", 11, 72, 19],
  ["FirePlume", "FirePlume_17x1", "Fire_Plume", 17, 90, 20],
  ["OilyFireball", "OilyFireball_15x1", "Oily_Fireball", 15, 72, 16],
  ["Smoke", "Smoke_9x1", "Smoke", 9, 90, 20],
  ["SmokeGas", "SmokeGas_13x1", "Smoke_Gas", 13, 90, 22],
  ["SmokeLarge", "SmokeLarge 13x1", "Smoke_Large", 13, 100, 44],
  ["SmokePoff", "SmokePoff_9x1", "Smoke_Poff", 9, 80, 20],
  ["SmokeSmall", "SmokeSmall_8x1", "Smoke_Small", 8, 80, 12],
  ["SmokeThick", "SmokeThick 13x1", "Smoke_Thick", 13, 90, 22],
  ["SmokeThickPuff", "SmokeThickPuff 9x1", "Smoke_ThickPuff", 9, 80, 8],
].map(([name, folder, prefix, count, duration, size]) => Object.freeze({ name, folder, prefix,
  animation: sequence(`particle.${name}`, (index) => `${base}assets/pfx/${encodeURIComponent(folder)}/${prefix}_${index + 1}.png`, count, duration, false, size, size, "particle") })));

// The three-frame overlap preserves the existing FirePlume/SmokePoff composition.
const fire = profiles["particle.FirePlume"];
const smoke = profiles["particle.SmokePoff"];
const smokeStart = fire.durations.slice(0, -3).reduce((sum, duration) => sum + duration, 0);
export const BOMB_EXPLOSION_PROFILE = Object.freeze({
  id: "particle.BombExplosion", name: "BombExplosion", adapter: "particle-compound", loop: false, timeDomain: "realTime",
  effects: Object.freeze(["FirePlume", "SmokePoff"]), crossfadeFrames: Object.freeze([3]),
  startOffsets: Object.freeze([0, smokeStart]), duration: smokeStart + smoke.totalDuration,
});
profiles[BOMB_EXPLOSION_PROFILE.id] = BOMB_EXPLOSION_PROFILE;

function motion(id, duration, adapter) {
  const profile = Object.freeze({ id, duration, loop: false, timeDomain: "realTime", adapter });
  profiles[id] = profile;
  return profile;
}
export const MOTION_PROFILES = Object.freeze({
  healthFade: motion("health.fade", 100, "health-bar"),
  healthDelta: motion("health.delta", 300, "health-bar"),
  floatingText: motion("floatingText", 700, "floating-text"),
  realmMask: motion("realmMask", 2000, "realm-mask"),
  // UI-local adapters: CSS owns transforms/reduced motion; React owns retirement.
  toastEnter: motion("toast.enter", 250, "ui-css"),
  toastExit: motion("toast.exit", 250, "ui-css"),
  characterDelta: motion("characterInfo.delta", 300, "ui-react"),
});
export const ANIMATION_PROFILES = Object.freeze(profiles);
