// The bedroom door's swing, and how it limits the new cupboard along the
// kitchen-side wall (flat_model.js's cupboardLimits()), and its swing
// marked on the carpet (floor.js's drawBedroomDoorSwing()). The door is
// kit/door_kit.js's, in the room's u and v (floor.js's OTHER_ROOM); a
// cupboard's leg along the kitchen-side wall is measured from that wall
// (x, its depth) and from the hallway wall (v, to its end).
//
// The door is in the hallway wall, its opening from 60 to 820 off the
// kitchen-side wall (floor.js's OTHER_ROOM.door), and opens into the room.
// Which way it swings is as you go in from the hallway (the kitchen-side
// wall on your left): to the right, hinged at the opening's window end, as
// it is now (seen in photos); or to the left, hinged at its kitchen end, so
// opened it lies along the kitchen-side wall, where the cupboard's leg runs
// (asked for, 22 Oct 2026).
import { OTHER_ROOM } from './floor.js';
import { planDoor } from './kit/door_kit.js';

const { fromKitchenWall, width } = OTHER_ROOM.door;
const DEGREE = Math.PI / 180;

// Each way it can swing, as a door in the room's plan (u, v: kit/door_kit.js):
// hinged at the opening's window end (doorFrom) running +u shut, or at its
// kitchen end (doorTo) running -u, and opening into the room (+v). Swinging
// right, it opens right back against the hallway wall. Swinging left, its
// free edge meets the kitchen-side wall a little past 90°, where it has
// come back the 60 from its hinge to the wall
export const DOOR_SWINGS = {
  right: planDoor({ hinge: [OTHER_ROOM.doorFrom, 0], width, shut: [1, 0], turn: 1, stopsAt: 180 }),
  left: planDoor({ hinge: [OTHER_ROOM.doorTo, 0], width, shut: [-1, 0], turn: -1,
    stopsAt: Math.floor(90 + Math.asin(fromKitchenWall / width) / DEGREE) }),   // 94
};
export const SWING_WAYS = Object.keys(DOOR_SWINGS);

// How far into the room the door sweeps (v), opened from shut to `degrees`,
// over the floor up to `upToX` from the kitchen-side wall (u from
// length - upToX on): 0 if none of its sweep is there
const INTO_ROOM = [0, 1];
export function sweepInto(swings, degrees, upToX) {
  return DOOR_SWINGS[swings].reach(degrees, INTO_ROOM, [-1, 0], upToX - OTHER_ROOM.length) ?? 0;
}

// How far the door can open, in whole degrees, before it meets a cupboard
// leg `deep` from the kitchen-side wall whose end is `endV` from the
// hallway wall (or before it meets a wall)
export function opensTo(swings, deep, endV) {
  return DOOR_SWINGS[swings].opensTo(deg => sweepInto(swings, deg, deep) > endV);
}
