// The bedroom door's swing, and how it limits the new cupboard along the
// kitchen-side wall (flat_model.js's cupboardLimits()). Worked in the floor
// by the door: x along the hallway wall from the kitchen-side wall, v out
// into the room from the hallway wall (a cupboard's leg along the
// kitchen-side wall is x 0 to its depth, and from its end at some v to the
// chimney breast).
//
// The door is in the hallway wall, its opening from 60 to 820 off the
// kitchen-side wall (floor.js's OTHER_ROOM.door), and opens into the room.
// Which way it swings is as you go in from the hallway (the kitchen-side
// wall on your left): to the right, hinged at the opening's window end, as
// it is now (seen in photos); or to the left, hinged at its kitchen end, so
// opened it lies along the kitchen-side wall, where the cupboard's leg runs
// (asked for, 22 Oct 2026).
import { OTHER_ROOM } from './floor.js';

const { fromKitchenWall, width } = OTHER_ROOM.door;
const DEGREE = Math.PI / 180;

// Each way it can swing: where its hinge is (x), which way along x the door
// runs from the hinge when it's shut (`toward`), and how far it can open
// before it meets a wall. Swinging right, it opens right back against the
// hallway wall. Swinging left, its free edge meets the kitchen-side wall a
// little past 90°, where it has come back the 60 from its hinge to the wall
export const DOOR_SWINGS = {
  right: { hingeX: fromKitchenWall + width, toward: -1, stopsAt: 180 },
  left: { hingeX: fromKitchenWall, toward: 1, stopsAt: Math.floor(90 + Math.asin(fromKitchenWall / width) / DEGREE) },   // 94
};
export const SWING_WAYS = Object.keys(DOOR_SWINGS);

// How far into the room the door sweeps (v), opened from shut to `degrees`,
// over the floor up to `upToX` from the kitchen-side wall: the most v of the
// part of the swing's sector within that strip. As v is straight, it's at a
// corner of that part, or where the arc is furthest out (90°): the free
// edge at `degrees`; the arc at 90°; the arc where it crosses x = upToX;
// and the door at `degrees` where it crosses that line. 0 if none is in it.
export function sweepInto(swings, degrees, upToX) {
  const { hingeX, toward } = DOOR_SWINGS[swings], r = width;
  const opened = degrees * DEGREE, within = x => x <= upToX + 1e-9;
  const reaches = [0];
  const edgeAt = a => ({ x: hingeX + toward * r * Math.cos(a), v: r * Math.sin(a) });
  for (const a of [opened, ...(degrees >= 90 ? [90 * DEGREE] : [])]) {
    const edge = edgeAt(a);
    if (within(edge.x)) reaches.push(edge.v);
  }
  const across = upToX - hingeX;                                 // from the hinge to the strip's edge
  if (Math.abs(across) <= r && Math.acos(across / (toward * r)) <= opened + 1e-9) reaches.push(Math.sqrt(r * r - across * across));
  const along = toward * Math.cos(opened);                       // x gained for each mm out along the door at `degrees`
  if (along !== 0) {
    const s = across / along;
    if (s >= 0 && s <= r) reaches.push(s * Math.sin(opened));
  }
  return Math.max(...reaches);
}

// How far the door can open, in whole degrees, before it meets a cupboard
// leg `deep` from the kitchen-side wall whose end is `endV` from the
// hallway wall (or before it meets a wall)
export function opensTo(swings, deep, endV) {
  let degrees = 0;
  while (degrees < DOOR_SWINGS[swings].stopsAt && sweepInto(swings, degrees + 1, deep) <= endV) degrees++;
  return degrees;
}
