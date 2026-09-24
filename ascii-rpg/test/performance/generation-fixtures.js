import { createWorldRealms, createRandom } from '../../src/client/game-layer-babylon-lite/systems/world-system.js';
import { selectObjectCells } from '../../src/client/game-layer-babylon-lite/systems/object-spawner-system.js';
import { createOverworldBuildings } from '../../src/client/game-layer-babylon-lite/systems/building-system.js';
import { createCivilizationGroups } from '../../src/client/game-layer-babylon-lite/systems/civilization-system.js';
import { selectEnemySpawnerCells } from '../../src/client/game-layer-babylon-lite/systems/enemy-spawner-system.js';
import { selectNpcSpawnerCells } from '../../src/client/game-layer-babylon-lite/systems/npc-spawner-system.js';
import { createNpcSystem } from '../../src/client/game-layer-babylon-lite/systems/npc-system.js';
import { createDynamicOccupancy } from '../../src/client/game-layer-babylon-lite/systems/dynamic-occupancy.js';
import { createTimeSystem } from '../../src/client/game-layer-babylon-lite/systems/time-system.js';

export async function generationFixture(seed, size = 64) {
  const timings = {};
  const measure = (name, work) => { const start = performance.now(); const result = work(); timings[name] = performance.now() - start; return result; };
  const start = performance.now();
  const realms = await createWorldRealms({ rows: size, columns: size, seed, torchCount: 8, stairCount: 4,
    wallFillPercents: { Overground: 35, Underground: 40 }, smoothingIterationsByRealm: { Overground: 6, Underground: 6 }, waterFillPercent: 60 });
  timings.terrain = performance.now() - start;
  const output = {};
  for (const [name, world] of Object.entries(realms.realms)) {
    const reserved = new Set();
    const objects = {};
    for (const type of ['heart', 'chest', 'trap', 'fireplace']) {
      if (type === 'fireplace' && name !== 'Underground') continue;
      objects[type] = measure(`${name}:${type}`, () => selectObjectCells(world, world.playerStart, type === 'chest' ? 2 : 8,
        createRandom(`${seed}:${name}:${type}`), { reserved, maximumDistance: type === 'chest' ? 50 : Infinity }));
    }
    world.objects = Object.entries(objects).flatMap(([type, cells]) => cells.map(cell => ({ type, cell, active: true })));
    const buildings = name === 'Overground' ? measure('homes', () => createOverworldBuildings(world, { random: createRandom(`${seed}:homes`), chance: 0.5 })) : [];
    const civilization = name === 'Underground' ? measure('doors', () => createCivilizationGroups(world, { random: createRandom(`${seed}:doors`), chance: 0.5 })) : [];
    world.buildings = buildings; world.civilizationGroups = civilization;
    const spawners = measure(`${name}:spawners`, () => name === 'Overground'
      ? selectNpcSpawnerCells(world, { realm: name, random: createRandom(`${seed}:npc`), count: 8 }).cells
      : selectEnemySpawnerCells(world, { realm: name, random: createRandom(`${seed}:enemy`), maxSpawners: 16 }).cells);
    const occupancy = createDynamicOccupancy(); const timeSystem = createTimeSystem();
    const system = createNpcSystem({ timeSystem, occupancy, worldFor: () => world,
      isWalkable: cell => Boolean(world.terrain[cell.y]?.[cell.x]?.walkable), randomFor: () => createRandom(`${seed}:patrol`) });
    if (name === 'Overground') measure('patrol', () => system.addNpc({ id: 'fixture-npc', realm: name, cell: world.playerStart }));
    output[name] = { terrain: world.terrain, start: world.playerStart, torches: world.torches, stairs: world.stairs, objects, buildings, civilization, spawners, npc: occupancy.get('fixture-npc') };
  }
  return { output, timings };
}
