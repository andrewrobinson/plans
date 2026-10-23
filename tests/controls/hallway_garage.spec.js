// The controls tests: the garage, the shoe rack, the bathroom and WC, the shelves and pictures over the stairs and the shoe boxes.
// The helpers they share are in helpers.js.
const {
  test, expect, readAddress, setting, hash, settledHash, openDrawer, at, slide, toggle, readout
} = require('./helpers');

// The garage, in Garage options (each piece's place in.garage): Sean, Billy and BillyChest,
// each on, x, y and turn; then Metal, Yellow (with its height above the
// floor, z), the scaffold bench, Small Billy (with its gap from the wall,
// off), Potters (likewise), Biltong (with its height), Trellis and the
// bedroom's pine cupboard (its sizes the bedroom's). The tests of older
// links write them in the address's fields, 58 to 68
test.describe('the garage', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, 'garage'); });

  // Its door: not shown to start, then open (a canopy, its bottom 1 m out)
  // or closed, in the view's doors, and back
  test('the garage door: not shown, open or closed', async ({ page }) => {
    const before = await settledHash(page);
    await expect(page.locator('input[name=garageDoor][value="hidden"]')).toBeChecked();
    for (const state of ['open', 'closed', 'hidden']) {
      await page.check(`input[name=garageDoor][value="${state}"]`);
      expect(await setting(page, 'doors.garage')).toBe(state);
      await expect.poll(async () => readAddress(await hash(page)).view.doors.garage).toBe(state);   // in the link too
    }
    await expect.poll(() => hash(page)).toBe(before);
  });

  test('Sean and Billy can be moved and turned, and put back', async ({ page }) => {
    await toggle(page, 'garage_billy_on', true);                       // out, as the page opens (in the lounge)
    expect(await setting(page, 'pieces.sean.in.garage')).toEqual({ on: true, x: 1255, y: 2865, turn: 180 });
    expect(await setting(page, 'pieces.billy.in.garage')).toEqual({ on: true, x: 0, y: 1920, turn: 270, lying: false });
    await slide(page, 'garage_sean_x', 2000);
    await slide(page, 'garage_sean_y', 1000);
    await slide(page, 'garage_sean_turn', 90);
    await slide(page, 'garage_billy_x', 4000);
    expect(await setting(page, 'pieces.sean.in.garage')).toEqual({ on: true, x: 2000, y: 1000, turn: 90 });
    expect(await setting(page, 'pieces.billy.in.garage')).toEqual({ on: true, x: 4000, y: 1920, turn: 270, lying: false });
    expect(await readout(page, 'garage_sean_turn')).toBe('90°');
    await page.locator('#garageBlock [data-reset="sean"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.sean.in.garage')).toEqual({ on: true, x: 1255, y: 2865, turn: 180 });
    expect(await setting(page, 'pieces.billy.in.garage')).toEqual({ on: true, x: 4000, y: 1920, turn: 270, lying: false });         // Billy stays where he was put
  });

  // Billy can lie on its long side, and stand again, where it is
  test('Billy can lie down in the garage', async ({ page }) => {
    await toggle(page, 'garage_billy_on', true);
    await toggle(page, 'garage_billy_lying', true);
    expect(await setting(page, 'pieces.billy.in.garage')).toEqual({ on: true, x: 0, y: 1920, turn: 270, lying: true });
    await toggle(page, 'garage_billy_lying', false);
    expect(await setting(page, 'pieces.billy.in.garage.lying')).toBe(false);
  });

  // Each has its In the garage switch; taken out, its sliders are hidden,
  // as the bedroom's
  test('each can be taken out, moved and put back', async ({ page }) => {
    await toggle(page, 'garage_sean_on', false);
    expect(await setting(page, 'pieces.sean.in.garage')).toEqual({ on: false, x: 1255, y: 2865, turn: 180 });
    await expect(page.locator('#garage_sean_x')).toBeHidden();
    await toggle(page, 'garage_sean_on', true);
    await expect(page.locator('#garage_sean_x')).toBeVisible();
    expect(await setting(page, 'pieces.sean.in.garage')).toEqual({ on: true, x: 1255, y: 2865, turn: 180 });
    expect(await setting(page, 'pieces.billyChest.in.garage')).toEqual({ on: false, x: 0, y: 1100, turn: 270 });            // out to start
    await toggle(page, 'garage_billyChest_on', true);
    await slide(page, 'garage_billyChest_x', 3000);
    await slide(page, 'garage_billyChest_turn', 0);
    expect(await setting(page, 'pieces.billyChest.in.garage')).toEqual({ on: true, x: 3000, y: 1100, turn: 0 });
    await page.locator('#garageBlock [data-reset="billyChest"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.billyChest.in.garage')).toEqual({ on: true, x: 0, y: 1100, turn: 270 });            // put back, still in
  });

  // Yellow starts on the scaffold bench and Biltong on Trellis, each
  // raised by the height of what it's on; the others have no height
  test('Yellow and Biltong can be raised and lowered, and put back', async ({ page }) => {
    expect(await setting(page, 'pieces.yellow.in.garage')).toEqual({ on: true, x: 3390, y: 2550, turn: 0, z: 438 });
    expect(await setting(page, 'pieces.scaffoldBench.in.garage')).toEqual({ on: true, x: 3430, y: 2650, turn: 0 });
    expect(await setting(page, 'pieces.biltong.in.garage')).toEqual({ on: true, x: 580, y: 1490, turn: 90, z: 750 });
    expect(await page.locator('#garage_metal_z').count()).toBe(0);
    expect(await setting(page, 'pieces.pineCupboard.in.garage')).toEqual({ on: false, x: 1425, y: 0, turn: 0 });   // out, as the page opens (in the bedroom)
    await toggle(page, 'garage_pine_on', true);
    await toggle(page, 'garage_pine_on', false);
    await slide(page, 'garage_pine_turn', 90);
    expect(await setting(page, 'pieces.pineCupboard.in.garage')).toEqual({ on: false, x: 1425, y: 0, turn: 90 });
    await slide(page, 'garage_yellow_z', 0);
    await toggle(page, 'garage_biltong_on', false);
    expect(await setting(page, 'pieces.yellow.in.garage')).toEqual({ on: true, x: 3390, y: 2550, turn: 0, z: 0 });
    expect(await setting(page, 'pieces.biltong.in.garage')).toEqual({ on: false, x: 580, y: 1490, turn: 90, z: 750 });
    await page.locator('#garageBlock [data-reset="yellow"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.yellow.in.garage')).toEqual({ on: true, x: 3390, y: 2550, turn: 0, z: 438 });
  });

  // Small Billy and Potters can stand off the wall behind them; the others can't
  test('Small Billy and Potters can stand off the wall, and be put back', async ({ page }) => {
    expect(await setting(page, 'pieces.smallBilly.in.garage')).toEqual({ on: true, x: 2480, y: 0, turn: 0, off: 0 });
    expect(await setting(page, 'pieces.potters.in.garage')).toEqual({ on: true, x: 3090, y: 0, turn: 0, off: 0 });
    expect(await page.locator('#garage_sean_off').count()).toBe(0);
    await slide(page, 'garage_smallBilly_off', 25);
    await slide(page, 'garage_potters_off', 40);
    expect(await setting(page, 'pieces.smallBilly.in.garage')).toEqual({ on: true, x: 2480, y: 0, turn: 0, off: 25 });
    expect(await setting(page, 'pieces.potters.in.garage')).toEqual({ on: true, x: 3090, y: 0, turn: 0, off: 40 });
    await page.locator('#garageBlock [data-reset="potters"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.potters.in.garage')).toEqual({ on: true, x: 3090, y: 0, turn: 0, off: 0 });
  });
});

// The shoe rack, downstairs (pieces.shoeRack): not there yet, as the page
// opens; its switch shows its settings
test('the shoe rack is out to start, its switch showing its settings', async ({ page }) => {
  await openDrawer(page, '', 'hallway');
  expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(false);
  await expect(page.locator('#shoeRack_block')).toBeHidden();
  await page.locator('#shoeRack_on').check();
  expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(true);
  await expect(page.locator('#shoeRack_block')).toBeVisible();
});

// The bathroom and WC (Hallway and stairs options): shown to start, and
// hidden by their switch, to see the hallway and stairs past them
test('the bathroom and WC can be hidden', async ({ page }) => {
  await openDrawer(page, '', 'hallway');
  expect(await setting(page, 'hallway.bathroomShown')).toBe(true);
  await expect(page.locator('#bathroomShown')).toBeChecked();
  await page.locator('#bathroomShown').uncheck();
  expect(await setting(page, 'hallway.bathroomShown')).toBe(false);
  await page.locator('#bathroomShown').check();
  expect(await setting(page, 'hallway.bathroomShown')).toBe(true);
});

// The shelves and pictures over the stairs (stair_walls.js, agreed 19 Oct
// 2026): all off to start, at the sizes and places the user set; on one
// wall the shelves and the picture are kept apart, the one moved going
// along the wall past the other, held below the ceiling, or not moved at
// all where it can't fit; the L-shaped shelves on the TV and WC walls
test.describe('the shelves and pictures over the stairs', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, '', 'hallway'); });
  const wall = (page, key) => setting(page, `hallway.${key}`);

  test('are off to start, at the user’s sizes, each switch showing its sliders', async ({ page }) => {
    for (const key of ['wcWall', 'loungeWall', 'tvWall']) {
      expect((await wall(page, key)).shelves.on).toBe(false);
      expect((await wall(page, key)).picture.on).toBe(false);
      await expect(page.locator(`#stairWalls_${key}_shelves_block`)).toBeHidden();
      await expect(page.locator(`#stairWalls_${key}_picture_block`)).toBeHidden();
    }
    expect((await wall(page, 'cornerShelves')).on).toBe(false);
    await toggle(page, 'stairWalls_wcWall_picture_on', true);
    await expect(page.locator('#stairWalls_wcWall_picture_block')).toBeVisible();
    expect(await setting(page, 'hallway.wcWall.picture')).toEqual({ on: true, height: 1420, width: 670, tall: 930, along: 830 });
    await toggle(page, 'stairWalls_tvWall_shelves_on', true);
    await expect(page.locator('#stairWalls_tvWall_shelves_alongLabel')).toHaveText('Middle, from the lounge door wall');
  });

  test('the TV wall’s shelves go the wall’s length, and lower', async ({ page }) => {
    await toggle(page, 'stairWalls_tvWall_shelves_on', true);
    expect(await slide(page, 'stairWalls_tvWall_shelves_width', 5000)).toBe('2330');
    expect(await slide(page, 'stairWalls_tvWall_shelves_height', 0)).toBe('200');
    expect(await wall(page, 'tvWall')).toMatchObject({ shelves: { width: 2330, along: 1165, height: 200 } });   // held to the wall
  });

  test('on the TV wall, the picture and shelves keep apart', async ({ page }) => {
    await slide(page, 'stairWalls_tvWall_picture_along', 1900);            // out of the shelves' way first: 1300 to 2500, held to 1730
    await toggle(page, 'stairWalls_tvWall_picture_on', true);
    await slide(page, 'stairWalls_tvWall_picture_width', 600);             // 1430 to 2030, as held
    await slide(page, 'stairWalls_tvWall_shelves_along', 700);             // 100 to 1300
    await toggle(page, 'stairWalls_tvWall_shelves_on', true);
    // The picture moved onto the shelves goes past them: 1300 + 50 apart + 300
    await slide(page, 'stairWalls_tvWall_picture_along', 1000);
    expect((await wall(page, 'tvWall')).picture.along).toBe(1650);
    // Shrunk to 400 high and raised as far as it goes, its top 50 under the
    // ceiling (2443), it's above the shelves, so it can go over them
    await slide(page, 'stairWalls_tvWall_picture_tall', 400);
    await slide(page, 'stairWalls_tvWall_picture_height', 2200);
    expect((await wall(page, 'tvWall')).picture.height).toBe(2193);
    await slide(page, 'stairWalls_tvWall_picture_along', 700);
    expect((await wall(page, 'tvWall')).picture.along).toBe(700);
    // Spaced out, the shelves reach up to it, so they go along, past it: 1000 + 50 + 600
    await slide(page, 'stairWalls_tvWall_shelves_spacing', 500);
    expect((await wall(page, 'tvWall')).shelves).toEqual({ on: true, count: 3, height: 1000, width: 1200, along: 1650, spacing: 500, depth: 240 });
    expect(await readout(page, 'stairWalls_tvWall_shelves_along')).toBe('1650');
  });

  test('on the lounge door wall, the shelves won’t squeeze past the picture, and stay under the ceiling', async ({ page }) => {
    // 1200 wide, they fit on neither side of the picture (the wall is
    // 1327): left off, saying why
    await toggle(page, 'stairWalls_loungeWall_picture_on', true);
    await toggle(page, 'stairWalls_loungeWall_shelves_on', true);
    expect((await wall(page, 'loungeWall')).shelves.on).toBe(false);
    await expect(page.locator('#stairWalls_loungeWall_shelves_blocked')).toBeVisible();
    // Without the picture they go up; raised as far as they go with three
    // 500 apart, the top shelf 150 under the ceiling: 2443 − 150 − 2 × 500
    await toggle(page, 'stairWalls_loungeWall_picture_on', false);
    await toggle(page, 'stairWalls_loungeWall_shelves_on', true);
    await expect(page.locator('#stairWalls_loungeWall_shelves_blocked')).toBeHidden();
    await slide(page, 'stairWalls_loungeWall_shelves_count', 3);
    await slide(page, 'stairWalls_loungeWall_shelves_spacing', 500);
    await slide(page, 'stairWalls_loungeWall_shelves_height', 2300);
    expect((await wall(page, 'loungeWall')).shelves.height).toBe(1293);
  });

  test('the L-shaped shelves take the TV and WC walls’ own, and keep clear of their pictures', async ({ page }) => {
    await toggle(page, 'stairWalls_tvWall_shelves_on', true);
    await toggle(page, 'stairWalls_cornerShelves_on', true);
    expect(await wall(page, 'cornerShelves')).toEqual({ on: true, count: 3, height: 1000, spacing: 440, depth: 240, tvLength: 1200, wcLength: 1200 });
    await expect(page.locator('#stairWalls_tvWall_shelves_on')).toBeDisabled();
    await expect(page.locator('#stairWalls_wcWall_shelves_on')).toBeDisabled();
    await expect(page.locator('#stairWalls_tvWall_shelves_replaced')).toBeVisible();
    await expect(page.locator('#stairWalls_tvWall_shelves_block')).toBeHidden();
    // The WC wall's picture, where the L's arm is (0 to 1200 along it),
    // has nowhere to go beside it: left off
    await toggle(page, 'stairWalls_wcWall_picture_on', true);
    expect((await wall(page, 'wcWall')).picture.on).toBe(false);
    await expect(page.locator('#stairWalls_wcWall_picture_blocked')).toBeVisible();
    // With the arm shorter it goes past it: 600 + 50 + 335
    await slide(page, 'stairWalls_cornerShelves_wcLength', 600);
    await toggle(page, 'stairWalls_wcWall_picture_on', true);
    expect((await wall(page, 'wcWall')).picture).toEqual({ on: true, height: 1420, width: 670, tall: 930, along: 985 });
    // ...and then the arm can't grow back onto it
    await slide(page, 'stairWalls_cornerShelves_wcLength', 1200);
    expect((await wall(page, 'cornerShelves')).wcLength).toBe(600);
    await expect(page.locator('#stairWalls_cornerShelves_blocked')).toBeVisible();
    // Off, the walls' own shelves are back
    await toggle(page, 'stairWalls_cornerShelves_on', false);
    await expect(page.locator('#stairWalls_tvWall_shelves_on')).toBeEnabled();
    await expect(page.locator('#stairWalls_tvWall_shelves_block')).toBeVisible();
  });
});

// The shoe boxes on the sills (shoe_boxes.js, agreed 19 Oct 2026): off to
// start, at 1200 long, as wide as their sills, the left one 370 high and
// the right 300; the right one can be kept level with the left; held on their
// sills, no wider than them; the TV wall's shelves kept clear of the right
// one, which isn't made longer where it would meet them
test.describe('the shoe boxes on the sills', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, '', 'hallway'); });
  const shoeBox = (page, key) => setting(page, `hallway.shoeBoxes.${key}`);
  const wall = (page, key) => setting(page, `hallway.${key}`);

  test('are off to start, each switch showing its sliders', async ({ page }) => {
    expect(await shoeBox(page, 'left')).toEqual({ on: false, from: 0, length: 1200, width: 240, height: 370 });
    expect(await shoeBox(page, 'right')).toEqual({ on: false, from: 0, length: 1200, width: 120, height: 300, levelWithLeft: false });
    await expect(page.locator('#shoeBoxes_left_block')).toBeHidden();
    await toggle(page, 'shoeBoxes_left_on', true);
    await expect(page.locator('#shoeBoxes_left_block')).toBeVisible();
    await expect(page.locator('#shoeBoxes_left_fromLabel')).toHaveText('Near end, from the newel posts');
    await expect(page.locator('#shoeBoxes_right_fromLabel')).toHaveText('Near end, from the lounge door wall');
  });

  test('stay on their sills, no wider than them', async ({ page }) => {
    await toggle(page, 'shoeBoxes_left_on', true);
    expect(await slide(page, 'shoeBoxes_left_width', 5000)).toBe('240');
    expect(await slide(page, 'shoeBoxes_left_from', 5000)).toBe('360');            // 1560 behind the post, less its 1200
    expect(await slide(page, 'shoeBoxes_left_length', 5000)).toBe('1560');
    expect(await readout(page, 'shoeBoxes_left_from')).toBe('0');                   // brought back to fit
    await toggle(page, 'shoeBoxes_right_on', true);
    expect(await slide(page, 'shoeBoxes_right_width', 5000)).toBe('120');
    expect(await slide(page, 'shoeBoxes_right_length', 5000)).toBe('2330');
  });

  test('the right one can keep its top level with the left one’s', async ({ page }) => {
    await toggle(page, 'shoeBoxes_left_on', true);
    await toggle(page, 'shoeBoxes_right_on', true);
    await toggle(page, 'shoeBoxes_right_levelWithLeft', true);
    // Its sill 185 above the left's: 370 less 185
    expect((await shoeBox(page, 'right')).height).toBe(185);
    await expect(page.locator('#shoeBoxes_right_height')).toBeDisabled();
    await slide(page, 'shoeBoxes_left_height', 500);
    expect((await shoeBox(page, 'right')).height).toBe(315);
    await toggle(page, 'shoeBoxes_right_levelWithLeft', false);
    await expect(page.locator('#shoeBoxes_right_height')).toBeEnabled();
    await slide(page, 'shoeBoxes_left_height', 400);
    expect((await shoeBox(page, 'right')).height).toBe(315);              // free again
  });

  test('on the TV wall, the shelves keep clear of the right one', async ({ page }) => {
    await toggle(page, 'shoeBoxes_right_on', true);                                 // 0 to 1200 along, 300 high
    await toggle(page, 'stairWalls_tvWall_shelves_on', true);
    await slide(page, 'stairWalls_tvWall_shelves_width', 600);                          // 880 to 1480
    // Brought down onto the box, the shelves go along past it: 1200 + 50 + 300
    await slide(page, 'stairWalls_tvWall_shelves_height', 200);
    expect((await wall(page, 'tvWall')).shelves).toMatchObject({ height: 200, along: 1550 });
    // The box made longer would meet them: not made, saying why
    await slide(page, 'shoeBoxes_right_length', 2000);
    expect((await shoeBox(page, 'right')).length).toBe(1200);
    await expect(page.locator('#shoeBoxes_right_blocked')).toBeVisible();
    // Lower, it's clear of them
    await slide(page, 'shoeBoxes_right_height', 100);
    await slide(page, 'shoeBoxes_right_length', 2000);
    expect(await shoeBox(page, 'right')).toMatchObject({ height: 100, length: 2000 });
  });
});

// ...and, switched in: its sizes, bevel, shelves' slope, shoes and the door
// angle its bevel's cut for
test.describe('the shoe rack', () => {
  test.beforeEach(async ({ page }) => {
    await openDrawer(page, undefined, 'hallway');
    await toggle(page, 'shoeRack_on', true);
  });

  test('it can be resized and put back', async ({ page }) => {
    expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(true);
    expect(await setting(page, 'pieces.shoeRack.design')).toEqual({ w: 460, d: 300, h: 1290, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
    await slide(page, 'shoeRack_d', 250);
    await slide(page, 'shoeRack_h', 900);
    await slide(page, 'shoeRack_slope', 30);
    expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(true);
    expect(await setting(page, 'pieces.shoeRack.design')).toEqual({ w: 460, d: 250, h: 900, bevel: true, slope: 30, shoes: true, bevelDoor: 72 });
    await page.locator('#shoeRackBlock [data-reset="sizes"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(true);
    expect(await setting(page, 'pieces.shoeRack.design')).toEqual({ w: 460, d: 300, h: 1290, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
  });

  // The bevel, on to start: the well's whole width, cut where the internal
  // door swings to its own slider's angle, whatever the door does; without
  // it, its own width, and how far the door opens
  test('the bevel, the shelves\' slope and the shoes', async ({ page }) => {
    await expect(page.locator('#shoeRack_w')).toBeDisabled();
    expect(await readout(page, 'shoeRack_w')).toBe('900');              // as wide as the well
    await expect(page.locator('#shoeRack_door')).toContainText('at 72°, its front is 252 wide');
    await slide(page, 'flatDoor', 30);                                // the door moves; the cut stays
    await expect(page.locator('#shoeRack_door')).toContainText('at 72°, its front is 252 wide');
    await slide(page, 'shoeRack_bevelDoor', 80);
    await expect(page.locator('#shoeRack_door')).toContainText('at 80°, its front is 153 wide');
    await expect(page.locator('#shoeRack_fits')).toContainText('up to 424 long');   // 300 / cos 45°
    await page.locator('#shoeRack_bevel').uncheck();
    expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(true);
    expect(await setting(page, 'pieces.shoeRack.design')).toEqual({ w: 460, d: 300, h: 1290, bevel: false, slope: 45, shoes: true, bevelDoor: 80 });
    await expect(page.locator('#shoeRack_w')).toBeEnabled();
    await expect(page.locator('#shoeRack_bevelDoor')).toBeHidden();
    await expect(page.locator('#shoeRack_door')).toContainText('opens to 65°');  // the door stops on its corner (in whole degrees, kit/door_kit.js's OPEN_STEP)
    await slide(page, 'shoeRack_slope', 0);
    await expect(page.locator('#shoeRack_fits')).toContainText('sticks out 15');    // a UK 11, about 315, on 300
    await slide(page, 'shoeRack_d', 200);
    await slide(page, 'shoeRack_slope', 30);
    await expect(page.locator('#shoeRack_fits')).toContainText('up to 231 long');   // 200 / cos 30°
    await page.locator('#shoeRack_shoes').uncheck();
    expect(await setting(page, 'pieces.shoeRack.in.hallway.on')).toBe(true);
    expect(await setting(page, 'pieces.shoeRack.design')).toEqual({ w: 460, d: 200, h: 1290, bevel: false, slope: 30, shoes: false, bevelDoor: 80 });
  });
});
