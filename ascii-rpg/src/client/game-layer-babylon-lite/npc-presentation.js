import { getFogVisibility } from "./systems/fog-of-war-system.js";
import { getVisibleSlot } from "./visible-region.js";

// Visibility is calculated separately from DOM reconciliation so the retained
// overlay can remove actors that left the realm, region, or discovered fog.
export function getVisibleNpcPresentationRecords({ npcs = [], realm, region, fog, world } = {}) {
  if (!region || !fog || !world) return Object.freeze([]);
  return Object.freeze(npcs.filter((npc) => npc?.type === "npc"
    && npc.realm === realm
    && getVisibleSlot(region, npc.cell) !== -1
    && getFogVisibility(fog, world, npc.cell) > 0));
}
