// The controls tests: the bedroom's cupboard, option 7's shelves, the wicker bench, what's by the bed, the kitchen tables, the castor desk, the speakers, the first radiator, the daybed with a desk and the things to store.
// The helpers they share are in helpers.js.
const {
  test, expect, openRoom, pickOption, setting, optionShown, inPlan, storedHead, view, openDrawer, 
  OPTION, BENCH, at, slide, toggle, readout, endsAndBack
} = require('./helpers');

// The bedroom's own corner cupboard, in Bedroom options: its option, sizes,
// doors and colour its own, the lounge's left as they were
test.describe('the bedroom\'s cupboard', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, 'bedroom'); });

  test('its controls show once it\'s on, and change only it', async ({ page }) => {
    await expect(page.locator('#bedroomCupboardBlock')).toBeHidden();
    await page.locator('#otherRoom_newCupboardOn').check();
    await expect(page.locator('#bedroomCupboardBlock')).toBeVisible();
    await expect(page.locator('#bedroomCupboardLeftLenBlock')).toBeHidden();   // option 10 has its own depth
    await pickOption(page, 7, 'bedroomCupboardCurrent');
    await expect(page.locator('#bedroomCupboardLegBlock')).toBeVisible();
    await expect(page.locator('#bedroomCupboardLeftLenBlock')).toBeVisible();
    expect(await optionShown(page)).toBe(16);                               // the lounge's as it was, the room as it is
    expect(await at('pieces.bedroomCupboard.design.option')(page)).not.toBe(await at('pieces.cornerCupboard.design.option')(page));
    await endsAndBack(page, 'bedroomCupboardRear', at('pieces.bedroomCupboard.design.R'));
    await endsAndBack(page, 'bedroomCupboardLeg', at('pieces.bedroomCupboard.design.LEG'));
    await endsAndBack(page, 'bedroomCupboardTallDoor', at('doors.bedroomCupboardTall'), { text: v => `${v}°` });
    expect(await setting(page, 'pieces.cornerCupboard.design.R')).toBe(330);
    await page.selectOption('#ral-bedroomCupboard', 'other');
    await page.selectOption('#ral-bedroomCupboard-other', '7016');
    expect(await setting(page, 'colours.bedroomCupboard')).toBe(7016);
    expect(await setting(page, 'colours.cupboard')).toBe(4);
    await page.locator('#bedroomCutting summary').click();
    await expect(page.locator('#bedroomCutList')).toContainText('7. ');
  });

  // It reaches along the chimney breast to the recess (1858 from the
  // kitchen-side wall) and out along the kitchen-side wall till it meets the
  // bedroom door's swing, which it meets sooner the deeper it is. Its height
  // is its own.
  test('it reaches to the recess and the door', async ({ page }) => {
    await page.locator('#otherRoom_newCupboardOn').check();
    await pickOption(page, 7, 'bedroomCupboardCurrent');
    await slide(page, 'bedroomCupboardLeg', 1858);
    expect(await setting(page, 'pieces.bedroomCupboard.design.LEG')).toBe(1858 - 600);  // inside, from the 600-deep left-wall leg
    await slide(page, 'bedroomCupboardLeftLen', 2841);
    expect(await setting(page, 'pieces.bedroomCupboard.design.F')).toBe(2103);           // the door's swing, for a 600-deep leg
    expect(await readout(page, 'bedroomCupboardLeftLen')).toBe('2103');
    await slide(page, 'bedroomCupboardDepth', 800);                        // deeper: both come in
    expect(await setting(page, 'pieces.bedroomCupboard.design.F')).toBe(2071);
    expect(await setting(page, 'pieces.bedroomCupboard.design.LEG')).toBe(1858 - 800);
    await slide(page, 'bedroomCupboardDepth', 400);
    await slide(page, 'bedroomCupboardLeftLen', 2841);
    expect(await setting(page, 'pieces.bedroomCupboard.design.F')).toBe(2197);           // shallower, further
    await pickOption(page, 10, 'bedroomCupboardCurrent');
    await slide(page, 'bedroomCupboardCornerW', 1858);
    expect(await setting(page, 'pieces.bedroomCupboard.design.CORNER_W')).toBe(1858);
    await slide(page, 'bedroomCupboardCornerD', 2841);
    expect(await setting(page, 'pieces.bedroomCupboard.design.CORNER_D')).toBe(2071);    // 1858 wide: past the door's hinge
    await slide(page, 'bedroomCupboardTop', 2100);
    expect(await setting(page, 'pieces.bedroomCupboard.design.TOP')).toBe(2100);
    expect(await setting(page, 'pieces.cornerCupboard.design.TOP')).toBe(0);
  });

  // The bedroom door swinging left as you go in lies along the kitchen-side
  // wall when it's open, so the cupboard's leg keeps clear of it opened as
  // far as it must (bedroom_door.js): 2071 at 90°, at any depth; further
  // when it needs to open less. Doors section says what that means
  test('swinging left, the door holds the cupboard back as far as it must open', async ({ page }) => {
    await page.locator('#otherRoom_newCupboardOn').check();
    await pickOption(page, 7, 'bedroomCupboardCurrent');
    await slide(page, 'bedroomCupboardDepth', 400);
    await slide(page, 'bedroomCupboardLeftLen', 2841);
    expect(await setting(page, 'pieces.bedroomCupboard.design.F')).toBe(2197);           // swinging right, as it was
    await expect(page.locator('#bedroomDoorMustBlock')).toBeHidden();
    await page.locator('input[name=bedroomDoorSwings][value=left]').check();
    expect(await setting(page, 'bedroom.door.swings')).toBe('left');
    expect(await setting(page, 'pieces.bedroomCupboard.design.F')).toBe(2071);           // brought in clear of it at 90°
    await expect(page.locator('#bedroomDoorMustBlock')).toBeVisible();
    await slide(page, 'bedroomDoorMustOpenTo', 60);
    expect(await setting(page, 'bedroom.door.mustOpenTo')).toBe(60);
    await slide(page, 'bedroomCupboardLeftLen', 2841);
    expect(await setting(page, 'pieces.bedroomCupboard.design.F')).toBe(2242);           // needing 60°, it comes out further
    await expect(page.locator('#bedroomDoorText')).toContainText('up to 2242 and still let the door open to 60°');
    await page.locator('#bedroomDoorSwingShown').check();
    expect(await setting(page, 'bedroom.door.swingShown')).toBe(true);
  });
});

test.describe('option 7\'s shelves', () => {
  test.beforeEach(async ({ page }) => {
    await openDrawer(page);
    await OPTION(7)(page);
  });

  test('a list of shelf tops for each leg', async ({ page }) => {
    await page.locator('#shelvesBack').fill('1000 500');
    await page.locator('#shelvesBack').press('Tab');                    // the list is read once you leave the box
    await expect(page.locator('#shelvesBack')).toHaveValue('500, 1000');   // sorted, and written back tidily
    expect(await setting(page, 'pieces.cornerCupboard.design.L_SHELVES.back')).toEqual([500, 1000]);
    await page.locator('#shelvesLeft').fill('700');
    await page.locator('#shelvesLeft').press('Tab');
    expect(await setting(page, 'pieces.cornerCupboard.design.L_SHELVES.left')).toEqual([700]);
  });

  test('tops too low, too high or not numbers are left out', async ({ page }) => {
    await page.locator('#shelvesBack').fill('50, shelf, 2500');
    await page.locator('#shelvesBack').press('Tab');
    await expect(page.locator('#shelvesBack')).toHaveValue('');
    expect(await setting(page, 'pieces.cornerCupboard.design.L_SHELVES.back')).toEqual([]);         // no shelves
  });
});

// The wicker bench (pieces.wickerBench): its sizes, then whether it's on and
// where in the hallway, the bedroom and the living room, each on its own
test.describe('the wicker bench', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, 'other'); });

  test('it can be on in each room, resized and moved', async ({ page }) => {
    await expect(page.locator('#wickerBench_bedroom')).toBeHidden();
    await toggle(page, 'wickerBench_bedroom_on', true);
    await expect(page.locator('#wickerBench_bedroom')).toBeVisible();
    await toggle(page, 'wickerBench_hallway_on', false);
    await slide(page, 'wickerBench_w', 1200);
    await slide(page, 'wickerBench_bedroom_u', 2000);
    expect(await readout(page, 'wickerBench_w')).toBe('1200');
    expect(await setting(page, 'pieces.wickerBench.design')).toMatchObject({ w: 1200, d: 410, h: 450, legs: 80 });
    expect(await setting(page, 'pieces.wickerBench.in.hallway')).toEqual({ on: false, along: 1470, across: 1372, turn: 0 });
    expect(await setting(page, 'pieces.wickerBench.in.bedroom')).toEqual({ on: true, u: 2000, v: 1985, turn: 0 });
    expect(await setting(page, 'pieces.wickerBench.in.livingRoom')).toEqual({ on: false, x: 3686, y: 2910, turn: 90 });
    await page.locator('#wickerBenchBlock [data-reset="bedroom"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.wickerBench.in.bedroom')).toEqual({ on: true, u: 1360, v: 1985, turn: 0 });
    await page.locator('#wickerBenchBlock [data-reset="sizes"]').evaluate(b => b.click());
    expect(await setting(page, 'pieces.wickerBench.design')).toMatchObject({ w: 920, d: 410, h: 450, legs: 80 });
  });
});

// What's by the bed: the two Knarrevik bedside tables and the Kvistbro on
// the walls, the laundry basket anywhere. All in, as the page opens
test.describe('what\'s by the bed', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, 'bedroom'); });

  test('each can be taken out, put in, moved and put back', async ({ page }) => {
    expect(await setting(page, 'pieces.kvistbro.in.bedroom.on')).toBe(true);
    await toggle(page, 'otherRoom_kvistbroOn', false);
    await expect(page.locator('#otherRoomPiece_kvistbroDetails')).toBeHidden();
    await toggle(page, 'otherRoom_kvistbroOn', true);
    await page.selectOption('#otherRoom_kvistbro_wall', 'window');
    expect(await setting(page, 'pieces.kvistbro.in.bedroom')).toMatchObject({ wall: 'window', along: 400 });     // as far along as it was
    await toggle(page, 'otherRoom_laundryBasketOn', true);
    await slide(page, 'otherRoom_laundryBasket_v', 1500);
    await slide(page, 'otherRoom_bedsideTable_along', 3000);
    expect(await setting(page, 'pieces.laundryBasket.in.bedroom')).toMatchObject({ u: 400, v: 1500, turn: 0 });
    expect(await setting(page, 'pieces.bedsideTable.in.bedroom')).toMatchObject({ wall: 'hallway', along: 3000 });
    await page.locator('[data-reset="place"]').evaluateAll(bs => bs.forEach(b => b.click()));
    expect(await setting(page, 'pieces.kvistbro.in.bedroom')).toMatchObject({ wall: 'hallway', along: 400 });
    expect(await setting(page, 'pieces.laundryBasket.in.bedroom')).toMatchObject({ u: 400, v: 460, turn: 0 });
    expect(await setting(page, 'pieces.bedsideTable.in.bedroom')).toMatchObject({ wall: 'hallway', along: 2275 });
    expect(await setting(page, 'pieces.bedsideTableByCupboard.in.bedroom')).toMatchObject({ wall: 'kitchen', along: 1016 });
  });

  test('all four are in on the default page', async ({ page }) => {
    await openRoom(page);
    const on = await page.evaluate(() => ['bedsideTableOn', 'bedsideTableByCupboardOn', 'kvistbroOn', 'laundryBasketOn'].map(k => window.plans.get().pieces[k.replace(/On$/, '')].in.bedroom.on));
    expect(on).toEqual([true, true, true, true]);
  });
});

// The kitchen tables, in the lounge as they are now (the default page):
// hidden to start (asked for, 19 Oct 2026); switched on, Cornwall on the
// floor with its legs off, Chesham on its end on it; each can be moved,
// posed otherwise, and taken out
test.describe('the kitchen tables', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, ''); });
  const boxOf = (page, key) => page.evaluate(k => window.plans.snapshot().boxes[`${k}.livingRoom`], key);

  test('Chesham stands on Cornwall in the corner by the door', async ({ page }) => {
    expect(await boxOf(page, 'cornwall')).toBe(null);
    expect(await boxOf(page, 'chesham')).toBe(null);
    await page.locator('#cornwallOn').check();
    await page.locator('#cheshamOn').check();
    expect(await boxOf(page, 'cornwall')).toEqual({ from: [0, 0, 0], to: [800, 1200, 150], shown: true });
    expect(await boxOf(page, 'chesham')).toEqual({ from: [0, 0, 150], to: [740, 730, 1340], shown: true });
    await expect(page.locator('#summary')).toContainText('The Chesham table, on its end, its top against the wall behind it, on the other table');
    // Cornwall's legs back on: Chesham's on a table 730 high
    await page.locator('#cornwallLegsOff').uncheck();
    expect(await boxOf(page, 'chesham')).toEqual({ from: [0, 0, 730], to: [740, 730, 1920], shown: true });
    // Chesham stood up, moved out of the way, then back where it is now
    await page.locator('#cheshamOnItsEnd').uncheck();
    await slide(page, 'cheshamX', 2500);
    expect(await setting(page, 'pieces.chesham.in.livingRoom.move')).toEqual({ x: 2500, y: 0, turn: 0 });
    expect(await boxOf(page, 'chesham')).toEqual({ from: [1905, 0, 0], to: [3095, 740, 730], shown: true });
    await page.locator('#cheshamHome').click();
    expect(await setting(page, 'pieces.chesham.in.livingRoom.move')).toBe(null);
    // Out, and its settings with it
    await page.locator('#cheshamOn').uncheck();
    await expect(page.locator('#cheshamMoveBlock')).toBeHidden();
    expect(await boxOf(page, 'chesham')).toBe(null);
  });
});

// The desk on castors (asked for, 20 Oct 2026): out to start; switched on,
// parked against the left wall, 20 short of the door frame; wheeled out in
// front of the TV, centred on it, its back 100 out from the bench; moved from
// there by hand, and Reset location takes it back
test('the desk on castors parks by the door and wheels out to the TV', async ({ page }) => {
  await openDrawer(page);
  await BENCH(page);
  await OPTION(10)(page);                                       // option 10 with the bench: the TV's middle at x 2319
  const box = () => page.evaluate(() => window.plans.snapshot().boxes['castorDesk.livingRoom']);
  expect(await box()).toBe(null);
  await expect(page.locator('#castorDeskMoveBlock')).toBeHidden();
  await toggle(page, 'castorDeskOn', true);
  await expect(page.locator('input[name=castorDeskAt][value=byTheDoor]')).toBeChecked();
  expect(await box()).toEqual({ from: [0, 359, 0], to: [550, 1309, 740], shown: true });
  await expect(page.locator('#summary')).toContainText('The desk on castors (950 long, 550 deep, 740 high), parked by the door');
  await expect(page.locator('#summary')).toContainText('It stands where the corner cupboard is');   // option 10's starts 650 out along the left wall
  await page.locator('input[name=castorDeskAt][value=atTheTv]').evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(await box()).toEqual({ from: [1844, 430, 0], to: [2794, 980, 740], shown: true });
  await expect(page.locator('#summary')).toContainText('in front of the TV, centred on it, its back 100 out from the bench');
  await slide(page, 'castorDeskY', 1500);
  expect(await setting(page, 'pieces.castorDesk.in.livingRoom.move')).toEqual({ x: 2319, y: 1500, turn: 0 });
  await page.locator('#castorDeskHome').click();
  expect(await setting(page, 'pieces.castorDesk.in.livingRoom.move')).toBe(null);
  expect(await setting(page, 'pieces.castorDesk.in.livingRoom.at')).toBe('atTheTv');
  await toggle(page, 'castorDeskOn', false);
  expect(await box()).toBe(null);
});

// The speakers (asked for, 22 Oct 2026): on nothing to start; on Billy, as
// it lies on the back wall as the page opens, 1650 apart, set apart by
// their slider, held to Billy; on the bench, each place keeping its own
// spacing; and the corner cupboard offered only once it's set below the
// ceiling, where they're spread evenly, with no slider
test('the speakers stand on Billy, the bench or the corner cupboard', async ({ page }) => {
  await openDrawer(page);
  const box = () => page.evaluate(() => window.plans.snapshot().boxes['speakers.livingRoom']);
  const putOn = place => page.locator(`input[name=speakersOn][value=${place}]`).evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(await box()).toBe(null);
  await expect(page.locator('#speakerSpacingBlock')).toBeHidden();
  await expect(page.locator('#speakersOnCupboardRow')).toBeHidden();
  await putOn('billy');
  await expect(page.locator('#speakerSpacingValue')).toHaveText('1650');
  expect(await page.locator('#speakerSpacing').getAttribute('max')).toBe('1850');   // Billy's 2020, less a speaker
  await expect(page.locator('#summary')).toContainText('on Billy, lying on its side, their middles 1650 apart');
  await slide(page, 'speakerSpacing', 1200);
  expect(await setting(page, 'pieces.speakers.in.livingRoom.spacing')).toEqual({ bench: null, billy: 1200, deskDaybed: null });
  await BENCH(page);
  await expect(page.locator('#summary')).toContainText('No speakers: they go on Billy, which isn\'t in the lounge');
  await putOn('bench');
  await expect(page.locator('#speakerSpacingValue')).toHaveText('2050');   // the 75" TV's 1680, 100 clear each side
  expect(await box()).not.toBe(null);
  await OPTION(10)(page);
  await expect(page.locator('#speakersOnCupboardRow')).toBeHidden();       // to the ceiling
  await slide(page, 'top', 2100);
  await putOn('cupboard');
  await expect(page.locator('#speakerSpacingBlock')).toBeHidden();
  await expect(page.locator('#summary')).toContainText('on the corner cupboard, 2100 high, spread evenly along its 800');
  expect((await box()).from[2]).toBe(2100);
});
// The first window's radiator (asked for, 22 Oct 2026): in to start; out,
// the description says so; and the pine cupboard by the door leaves the
// bench on, starting past it
test('the first window\'s radiator can be taken out, and the bench starts past the pine cupboard by the door', async ({ page }) => {
  await openDrawer(page);
  await expect(page.locator('#firstRadiatorOn')).toBeChecked();
  await toggle(page, 'firstRadiatorOn', false);
  expect(await setting(page, 'livingRoom.firstRadiator')).toBe(false);
  await expect(page.locator('#summary')).toContainText('The radiator under the first window is taken out, and its pipes.');
  for (const id of ['billyOn', 'billyChestOn']) await toggle(page, id, false);
  await toggle(page, 'benchOn', true);
  await toggle(page, 'pineOn', true);
  await expect(page.locator('#benchOn')).toBeDisabled();                 // on the back wall, in the bench's place
  await slide(page, 'pineTurn', 270);
  await slide(page, 'pineX', 60);
  await slide(page, 'pineY', 710);
  await expect(page.locator('#benchOn')).toBeEnabled();                  // by the door, beside it
  await expect(page.locator('#summary')).toContainText('Bench 3278, from x 560 (past the pine cupboard by the door) to the right-hand wall');
});


// The daybed with a desk and bookcase (asked for, 22 Oct 2026): out to
// start; on in Billy's place, its sliders shown, the bench off; its desk
// switched to the right-hand end; moved, and put back
test('the daybed with a desk stands on the back wall, its desk at either end', async ({ page }) => {
  await openDrawer(page);
  await expect(page.locator('#deskDaybedMoveBlock')).toBeHidden();
  await toggle(page, 'billyOn', false);
  await toggle(page, 'deskDaybedOn', true);
  await expect(page.locator('#deskDaybedMoveBlock')).toBeVisible();
  await expect(page.locator('#benchOn')).toBeDisabled();
  await expect(page.locator('#summary')).toContainText('The daybed with a desk and bookcase, its desk at the left end (2630 wide, 1140 deep, 1000 high) on the back wall');
  await toggle(page, 'deskDaybedRight', true);
  expect(await setting(page, 'pieces.deskDaybed.design.deskAt')).toBe('right');
  await expect(page.locator('#summary')).toContainText('its desk at the right end');
  await slide(page, 'deskDaybedY', 1500);
  expect(await setting(page, 'pieces.deskDaybed.in.livingRoom.move')).toEqual({ x: 1315, y: 1500, turn: 0 });
  await page.locator('#deskDaybedHome').click();
  expect(await setting(page, 'pieces.deskDaybed.in.livingRoom.move')).toBe(null);
  // The TV above it, sized by the TV size slider, shown with it; and the
  // speakers on it, either side of the TV
  await expect(page.locator('#tvBlock')).toBeHidden();
  await toggle(page, 'deskDaybedTv', true);
  await expect(page.locator('#tvBlock')).toBeVisible();
  await expect(page.locator('#summary')).toContainText('Above the daybed: a 75" TV (1680 × 960), centred on its bed');
  await page.locator('input[name=speakersOn][value=deskDaybed]').evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
  await expect(page.locator('#speakerSpacingValue')).toHaveText('2050');
  await slide(page, 'speakerSpacing', 1800);
  expect(await setting(page, 'pieces.speakers.in.livingRoom.spacing.deskDaybed')).toBe(1800);
  // The chair at its desk: the smaller one to start; with the desk at the
  // left end against the left wall there's no room, slid against BillyChest
  // there's 635 (the sofa out, which stands across it as the page opens)
  await toggle(page, 'deskDaybedRight', false);
  await page.selectOption('#sofaPick', 'none');
  await expect(page.locator('input[name=deskDaybedChair][value=small]')).toBeChecked();
  await expect(page.locator('#summary')).toContainText('At the daybed\'s desk there\'s no room to sit: the left wall is right up against its end.');
  await slide(page, 'deskDaybedX', 1950);
  await expect(page.locator('#summary')).toContainText('At the daybed\'s desk there\'s 635 from its end to the left wall.');
  await page.locator('input[name=deskDaybedChair][value=office]').evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(await setting(page, 'pieces.deskDaybed.in.livingRoom.chair')).toBe('office');
  await expect(page.locator('#summary')).toContainText('the office chair (drawn) reaches 470 past it, 165 to spare');
});

// The shoe rack, downstairs (pieces.shoeRack): not there yet, as the page
// opens; its switch shows its settings

test.describe('things to store', () => {
  // Shown as the page opens, where they are now (placed by hand); packed by
  // the middle window, with option 10, so there's a corner cupboard to pack
  // them into. Shown or hidden from the top bar (asked for, 19 Oct 2026),
  // which on a phone is hidden while a drawer's open: so after closing it
  async function packedByTheWindow(page) {
    await openDrawer(page);
    await expect(page.locator('#storedToggle')).toBeChecked();
    await OPTION(10)(page);
    await page.click('#storedPack');
  }

  test('shown, packed, and where they go', async ({ page }) => {
    await packedByTheWindow(page);
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 'window' });
    await expect(page.locator('#storedInfo')).toContainText('Standing on the floor they take');
    await page.selectOption('#storedPacking', '2');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 2, where: 'window' });
    await page.check('input[name=storedWhere][value="cupboard"]');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 2, where: 'cupboard' });
    await expect(page.locator('#storedInfo')).toContainText("corner cupboard");
    await page.click('#roomOptions');                                  // Lounge options shut
    await page.click('#storedToggle');
    await expect(page.locator('#storedToggle')).not.toBeChecked();
    expect(await storedHead(page)).toEqual({ shown: false, packing: 2, where: 'cupboard' });
  });

  test('off the floor, then packed again', async ({ page }) => {
    await packedByTheWindow(page);
    const lift = page.locator('#storedLifts input').first();             // Rack 1
    await lift.fill('300');
    await lift.press('Tab');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 'byHand' });   // as placed by hand now
    expect(await setting(page, 'thingsToStore.spots.0.z')).toBe(300);
    await page.click('#storedPack');                                   // back by the window
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 'window' });
  });

  // In the plan, with the drawers shut, the view is centred on (1400, 2860)
  // in room mm, in the part of the screen below the top bar, at a scale
  // that fits 6.0 × 6.9 m there (index.html's built-in plan view, and
  // resize()). Rack 1 starts at x 2550, y 2640, turned: 100 × 800.
  test('in the plan: named under the pointer, dragged, and turned', async ({ page }) => {
    await openRoom(page, inPlan('view-plan', { 'thingsToStore.shown': true }));   // option 9, the things to store shown
    const { width, height } = page.viewportSize();
    const below = Math.min(await page.locator('#bar').evaluate(el => el.getBoundingClientRect().bottom), height / 3);
    const perMm = Math.min(width / 6.0, (height - below) / 6.9) / 1000;
    const at = (x, y) => [width / 2 + (x - 1400) * perMm, below + (height - below) / 2 + (y - 2860) * perMm];
    const [sx, sy] = at(2600, 3040);                                  // Rack 1's middle
    await page.mouse.move(sx, sy);
    await expect(page.locator('#tip')).toContainText('Rack 1');
    // Dragged 500 to the left
    await page.mouse.down();
    await page.mouse.move(sx - 500 * perMm, sy, { steps: 5 });
    await page.mouse.up();
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 'byHand' });   // moved by hand
    const rack1 = await setting(page, 'thingsToStore.spots.0');
    expect(rack1.x).toBeGreaterThan(2000);
    expect(rack1.x).toBeLessThan(2100);
    expect(rack1.turned).toBe(true);
    // A double-click turns it round
    await page.mouse.dblclick(sx - 500 * perMm, sy);
    expect(await setting(page, 'thingsToStore.spots.0.turned')).toBe(false);
  });
});
