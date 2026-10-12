# Measurements needed

What to measure in the flat so the rest of it (the other room, the hallway,
the bathroom, the stairs and the entrance) can be modelled to scale. The
estimates in `PLAN.md`, scaled off the architect's drawing, are only to start
shaping the model. Use this list to replace them.

The names follow the drawing (`drawings/second_floor_plan.png`): the **living
room** is the room modelled so far (three windows), the **other room** is the
one with the single large window, and the **hallway** runs between them past
the stairs.

## How to measure

- Everything in **mm**, to the nearest 5 or so.
- Floor to wall, wall to wall, at about waist height unless it says
  otherwise. Old walls aren't straight: where a length looks different at
  floor and ceiling height, note both.
- For a door or window, measure to the **opening** (the inside of the frame
  or reveal), and say which edge you measured from.
- A rough sketch with the numbers written on it, or a photo of the tape in
  place, is as good as a typed list. Mark **M** for measured and **E** for
  estimated where you're not sure.
- **Priority 1** is needed to start building. **Priority 2** can follow.

---

## 1. Tying the rooms together (priority 1)

Rooms measured separately rarely add up when joined, so a few measurements
across the hallway and through the door frames fix where each room sits.

- [ ] **Living room door frame, far side.** Its width. Today it's assumed to
      be 71, like the hinge side (frame ending at y = 2231). Measured from the
      living room's back wall (the bench wall) to the far edge of the frame.
- [ ] **The wall the living room door is in:** its thickness, i.e. the depth of
      the door frame from the living room face to the hallway face.
- [ ] **The hallway's width** opposite the living room door, wall to wall.
- [ ] **The living room's back wall carried on:** standing in the hallway, how
      far it is from the outside wall (the wall the stairs run along) to the
      hallway wall opposite. Does the outside wall line up with the living
      room's back wall, or step in or out?
- [ ] **The other room's door frame:** the thickness of the wall it's in, and
      the distance along the hallway from the living room door frame's far
      edge to the near edge of the other room's door frame.
- [ ] **The wall between the kitchen recess and the other room:** its
      thickness, if it can be found, e.g. from the other room's door
      frame or a socket box. Otherwise the two measurements in section 2
      that run to it.

## 2. The other room (priority 1)

- [ ] **Length, kitchen-side wall to window wall,** at both ends of the
      room if they differ.
- [ ] **Width, hallway wall to the chimney breast face,** and to the back of
      the recess beside it.
- [ ] **Ceiling height,** at a few places (the living room's is 2443).
- [ ] **Chimney breast:** how far it sticks out, and where it starts and ends
      along the wall, measured from the kitchen-side wall.
- [ ] **Recess beside it:** depth and length.
- [ ] **Window:** distance from each side wall to the opening; opening width;
      sill height from the floor; top of the opening from the floor; sill
      depth; the reveal's depth (wall thickness at the window).
- [ ] **Radiator,** if any: position along the wall, width, height, how far
      it stands off the wall, and its height off the floor.
- [ ] **Door:** distance from the kitchen-side wall to the opening; opening
      width; door width, height and thickness; frame height; which side the
      hinges are on; which way it opens. The drawing shows it opening into
      the room, hinged on the side away from the kitchen.
- [ ] **Anything fixed** that a cupboard or furniture would have to clear:
      sockets, switches, pipes, skirting height and depth, coving, a picture
      rail.

## 3. The hallway and bathroom (priority 2)

- [ ] **Hallway:** its length from the top of the stairs to the bathroom
      door; its width along the way, where it changes; ceiling height.
- [ ] **Each door off the hallway** (the bathroom and WC): position, opening
      width, and which way it opens.
- [ ] **Bathroom and WC:** length and width of each, and the windows'
      positions and sizes. The shower, basin and WC only roughly, unless
      you want them shown in detail.

## 4. The stairs, from the ground floor up (priority 2)

Plans don't give heights, so the slope can only come from these.

- [ ] **Floor to floor,** from the second floor down to the first-floor
      landing, and from that landing down to the ground. Or count the
      steps and measure the rise (below), which gives the same answer.
- [ ] **Number of steps in each flight,** counting each riser (each step up).
- [ ] **Rise:** the height of one step, top of a tread to the top of the next.
      Measure two or three and note if they differ.
- [ ] **Going:** the depth of one straight step, front edge (nosing) to front
      edge. The drawing suggests about 220.
- [ ] **Width of the flight,** wall to wall or wall to banister.
- [ ] **The winders at the top** (the turning steps): how many, and each
      one's depth at the narrow end, the middle and the wide end. A sketch is
      easiest.
- [ ] **The top of the stairs:** where the top step meets the hallway floor,
      measured from the outside wall and from the living room door frame.
- [ ] **Banister and handrail:** handrail height above the step's front edge;
      the banister's height and position at the top, around the opening.
- [ ] **The opening above the stairs:** its length and width, and the
      headroom, the lowest ceiling over any step, measured straight up
      from the step's front edge.
- [ ] **The ceiling over the stairs:** is it flat or sloping, and where does it
      change?

Then the slope is the arctangent of rise ÷ going: for example 200 over 220
is about 42°.

## 5. The entrance (priority 2)

Only as much as is needed to show the way in from the street.

- [ ] **Ground floor:** the entrance door (width, height, which way it
      opens), and where the stairs start from it.
- [ ] **The ground-floor stair:** number of steps, rise, going and width, as
      for section 4.
- [ ] **The first-floor lobby:** its length and width, and its door into the
      enclosed flight (width, which way it opens).
- [ ] **Which way you turn** at each level: a sketch from the street door up
      to the flat's hallway would cover it.

## 6. Loose ends in the living room (priority 2)

Already noted as estimates in `room_dimensions.md`:

- [ ] **Tall fridge unit height** (the width, 630, is measured; height taken as 2400).
- [ ] **Wall cupboards:** bottom and top heights (taken as 1450 to 2400).
- [ ] **The sink recess:** its left edge and its top (taken as about 1990).
- [ ] **The sink:** its position in the worktop.
- [ ] **"The counter extends 105 cm left of the base":** what the 105 cm is
      measured from.

---

When some of these come in, they go into `room_dimensions.md` for the living
room, and into a new `floor.md` for the floor plan and the other rooms, as
`PLAN.md` describes.
