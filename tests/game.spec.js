// The game UI (page/game/), on the phone: the picker, moving and resizing
// in Plan, the colour sheet, and walking. Each finds where things are on
// screen from the page's own picking (page/game/picking.js), so they don't
// depend on the screen's size.
const { test, openRoom, setting } = require('./helpers');
const { expect } = require('@playwright/test');

test.skip(({ isMobile }) => !isMobile, 'the phone');

// Where a point in the room (mm) is on the screen
const screenOf = (page, x, y, z = 0) => page.evaluate(async ([x, y, z]) => (await import('/page/game/picking.js')).screenOf(x, y, z), [x, y, z]);
// The middle of a lounge piece's footprint on the screen
const pieceOnScreen = (page, key, room = 'livingRoom') => page.evaluate(async ([key, room]) => {
  const { inRoom, floorBox } = await import('/page/game/furniture.js'), { screenOf } = await import('/page/game/picking.js');
  const b = floorBox(inRoom(room).find(p => p.key === key).object());
  return screenOf((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.top);
}, [key, room]);
async function toPlan(page) {
  await page.click('#gameModes [data-view=plan]');
  await expect(page.locator('#gameModes [data-view=plan]')).toHaveAttribute('aria-checked', 'true');
}
async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 4 });
  await page.mouse.up();
}

// The camera's glide between views done (shell.js's GLIDE_MS, 450, and a little over)
const GLIDE_DONE_MS = 600;
// The colour sheet opened, and still once it's slid up
const SHEET_SLIDE_MS = 300;        // game.css's 0.22 s, and a little over
async function openSheet(page) {
  await page.click('#actionBar [data-action=colour]');
  await expect(page.locator('#colourSheet')).toHaveClass(/\bup\b/);
  await page.waitForTimeout(SHEET_SLIDE_MS);
}

// A long-press at a point on the screen
async function longPress(page, at) {
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await expect(page.locator('#optionsSheet')).toBeVisible();
  await page.mouse.up();
}
// The middle of an object's box on the screen, from a model's name for it
const objectOnScreen = (page, name) => page.evaluate(async name => {
  const THREE = await import('three'), { namedPieces } = await import('/flat_model.js'), { screenOf } = await import('/page/game/picking.js');
  const b = new THREE.Box3().setFromObject(namedPieces()[name]), c = b.getCenter(new THREE.Vector3());
  return screenOf(c.x * 1000, c.z * 1000, b.max.y * 1000);
}, name);

test('the picker puts a piece in and takes it out, with Undo', async ({ page }) => {
  await openRoom(page, '', { game: true });
  const chesham = 'pieces.chesham.in.livingRoom.on';
  expect(await setting(page, chesham)).toBe(false);
  // Chesham's in the Other folder
  await expect(page.locator('[data-key=chesham]')).toBeHidden();
  await page.click('#picker [data-folder=other]');
  await page.click('#pickerFolder [data-key=chesham]');
  await expect(page.locator('#picker [data-folder=other]')).toHaveClass(/\bin\b/);
  expect(await setting(page, chesham)).toBe(true);
  await expect(page.locator('#pickerFolder [data-key=chesham]')).toHaveClass(/\bin\b/);
  await page.click('#gameToast button');
  expect(await setting(page, chesham)).toBe(false);
});

test('in Plan, a piece is dragged about, held inside the walls, and dropped on the picker to take it out', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await toPlan(page);
  const before = await setting(page, 'pieces.sofa.in.livingRoom.move');
  const at = await pieceOnScreen(page, 'sofa');
  await drag(page, at, { x: at.x, y: at.y + 60 });
  const after = await setting(page, 'pieces.sofa.in.livingRoom.move');
  expect(after.y).toBeGreaterThan(before.y);
  expect(after.x).toBe(before.x);
  // Dragged far past the right-hand wall, it stops against it (the sofa
  // let go first, so its action bar isn't over the Ivar)
  await page.keyboard.press('Escape');
  await page.click('#picker [data-folder=other]');            // out as the page opens: put in from Other
  await page.click('#pickerFolder [data-key=ivar]');
  await page.keyboard.press('Escape');
  const ivar = await pieceOnScreen(page, 'ivar');
  await drag(page, ivar, { x: ivar.x + 400, y: ivar.y });
  const box = await page.evaluate(async () => {
    const { inRoom, floorBox } = await import('/page/game/furniture.js');
    return floorBox(inRoom('livingRoom').find(p => p.key === 'ivar').object());
  });
  const width = await page.evaluate(async () => (await import('/flat_model.js')).ROOM_BOXES.livingRoom.x1);
  expect(Math.round(box.x1)).toBe(width);
  // ...and on the picker it goes
  const ivarNow = await pieceOnScreen(page, 'ivar');
  const picker = await page.locator('#picker').boundingBox();
  await drag(page, ivarNow, { x: picker.x + picker.width / 2, y: ivarNow.y });
  expect(await setting(page, 'pieces.ivar.in.livingRoom.on')).toBe(false);
});

test('in Plan, a piece dragged in from the picker stands where it is let go', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await toPlan(page);
  await page.click('#picker [data-folder=other]');
  const icon = await page.locator('#pickerFolder [data-key=cornwall]').boundingBox();
  const to = await screenOf(page, 1500, 3500);
  await drag(page, { x: icon.x + icon.width / 2, y: icon.y + icon.height / 2 }, to);
  expect(await setting(page, 'pieces.cornwall.in.livingRoom.on')).toBe(true);
  const middle = await pieceOnScreen(page, 'cornwall');
  expect(Math.abs(middle.x - to.x)).toBeLessThan(6);
  expect(Math.abs(middle.y - to.y)).toBeLessThan(6);
  await expect(page.locator('#actionBar')).toBeVisible();
});

test('the bedroom has its own pieces: dragged in, one on a wall goes against the nearest; the bed moves', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await page.click('#gameRooms [data-room=bedroom]');
  await toPlan(page);
  // the Kvistbro's in its Other folder
  await expect(page.locator('#picker [data-key=kvistbro]')).toHaveCount(0);
  await page.click('#picker [data-folder=other]');
  await expect(page.locator('#pickerFolder [data-key=kvistbro]')).toBeVisible();
  await page.click('#picker [data-folder=other]');
  await expect(page.locator('#picker [data-key=cornwall]')).toHaveCount(0);
  // Billy, dropped by the window wall (u 0), stands against it
  const icon = await page.locator('#picker [data-key=billy]').boundingBox();
  const corner = await page.evaluate(async () => (await import('/floor.js')).OTHER_ROOM_CORNER);
  const to = await screenOf(page, corner.x + 150, corner.y + 1500);
  await drag(page, { x: icon.x + icon.width / 2, y: icon.y + icon.height / 2 }, to);
  expect(await setting(page, 'pieces.billy.in.bedroom.on')).toBe(true);
  expect(await setting(page, 'pieces.billy.in.bedroom.wall')).toBe('window');
  // The bed, dragged, moves
  const u = await setting(page, 'pieces.bed.in.bedroom.u');
  const bed = await pieceOnScreen(page, 'bed', 'bedroom');
  await drag(page, bed, { x: bed.x + 20, y: bed.y });
  expect(await setting(page, 'pieces.bed.in.bedroom.u')).not.toBe(u);
});

test('a long-press shows the sofa\'s options and handles; a handle resizes it; it turns from the action bar', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await toPlan(page);
  await longPress(page, await pieceOnScreen(page, 'sofa'));
  await expect(page.locator('#optionsTitle')).toHaveText('Sofa');
  await expect(page.locator('#resizeHandles .handle')).toHaveCount(4);
  // The rightmost handle, an end of its width (it stands square to the back wall), dragged out
  await page.waitForTimeout(SHEET_SLIDE_MS);                     // the plan fitted above the sheet
  const boxes = await page.locator('#resizeHandles .handle').evaluateAll(hs => hs.map(h => h.getBoundingClientRect().toJSON()));
  const right = boxes.reduce((a, b) => (b.x > a.x ? b : a));
  const w = await setting(page, 'pieces.sofa.design.w');
  const from = { x: right.x + right.width / 2, y: right.y + right.height / 2 };
  await drag(page, from, { x: from.x + 6, y: from.y });
  expect(await setting(page, 'pieces.sofa.design.w')).toBeGreaterThan(w);
  await page.click('#optionsDone');
  await expect(page.locator('#resizeHandles')).toBeHidden();
  const at = await pieceOnScreen(page, 'sofa');
  await page.mouse.click(at.x, at.y);
  const turn = (await setting(page, 'pieces.sofa.in.livingRoom.move')).turn;
  await page.click('#actionBar [data-action=turn]');
  expect((await setting(page, 'pieces.sofa.in.livingRoom.move')).turn).toBe((turn + 90) % 360);
});

test('the hallway\'s and the garage\'s pickers, and the things to store in the lounge\'s', async ({ page }) => {
  await openRoom(page, '', { game: true });
  const stored = await setting(page, 'thingsToStore.shown');
  await page.click('#picker [data-key=stored]');
  expect(await setting(page, 'thingsToStore.shown')).toBe(!stored);
  await page.click('#gameRooms [data-room=hallway]');
  await page.click('#picker [data-key=cornerShelves]');
  expect(await setting(page, 'hallway.cornerShelves.on')).toBe(true);
  await page.click('#gameRooms [data-room=garage]');
  await toPlan(page);
  const before = await setting(page, 'pieces.yellow.in.garage');
  const yellow = await pieceOnScreen(page, 'yellow', 'garage');
  await drag(page, yellow, { x: yellow.x - 30, y: yellow.y });
  expect((await setting(page, 'pieces.yellow.in.garage')).x).toBeLessThan(before.x);
});

test('the colour sheet paints as you slide, ✕ puts it back and ✓ keeps it', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await toPlan(page);
  const floorColour = () => page.evaluate(async () => (await import('/floor.js')).floorMat.color.getHexString());
  const before = await floorColour();
  const spot = await screenOf(page, 1000, 2500);
  await page.mouse.click(spot.x, spot.y);
  await openSheet(page);
  const strip = await page.locator('#colourStrip').boundingBox();
  await drag(page, { x: strip.x + 5, y: strip.y + strip.height / 2 }, { x: strip.x + strip.width * 0.3, y: strip.y + strip.height / 2 });
  const previewed = await floorColour();
  expect(previewed).not.toBe(before);
  await page.click('#colourCancel');
  expect(await floorColour()).toBe(before);
  expect(await setting(page, 'colours.floor')).toBe(0);
  await openSheet(page);
  await drag(page, { x: strip.x + 5, y: strip.y + strip.height / 2 }, { x: strip.x + strip.width * 0.3, y: strip.y + strip.height / 2 });
  await page.click('#colourKeep');
  expect(await setting(page, 'colours.floor')).not.toBe(0);
  expect(await floorColour()).toBe(previewed);
});

test('in Walk, a tap on the floor walks you there', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await page.click('#gameModes [data-view=walk]');
  await expect(page.locator('#miniPlan')).toBeVisible();
  await page.waitForTimeout(GLIDE_DONE_MS);                      // down from Overhead, at eye height
  const where = () => page.evaluate(() => window.plans.view().camera?.position ?? null);
  // A spot on the floor ahead, 3 m in front of you (nearer's below the
  // screen at eye height)
  const spot = await page.evaluate(async () => {
    const { camera, controls } = await import('/living_room.js'), { screenOf } = await import('/page/game/picking.js');
    const ahead = controls.target.clone().sub(camera.position).setY(0).normalize().multiplyScalar(3).add(camera.position);
    return screenOf(ahead.x * 1000, ahead.z * 1000, 0);
  });
  await page.mouse.click(spot.x, spot.y);
  await expect.poll(where).not.toBeNull();
  const start = await page.evaluate(async () => (await import('/living_room.js')).camera.position.toArray());
  await expect.poll(async () => (await where())[0]).not.toBe(Math.round(start[0] * 1000) + 1);   // settled
  const end = await where();
  expect(end[1]).toBe(Math.round(start[1] * 1000));                // the same eye height
});

test('a long-press opens a thing\'s options, from its drawer, and Done puts them back', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await toPlan(page);
  await longPress(page, await objectOnScreen(page, 'island'));
  await expect(page.locator('#optionsTitle')).toHaveText('Kitchen island');
  await expect(page.locator('#optionsBody #islandTypeBlock')).toBeVisible();
  // A control there works as in the drawer
  await page.locator('#optionsBody input[name=islandType][value=custom]').check({ force: true });
  expect(await setting(page, 'pieces.island.design.type')).toBe('custom');
  await page.click('#optionsDone');
  await expect(page.locator('#optionsSheet')).toBeHidden();
  expect(await page.evaluate(() => Boolean(document.getElementById('islandTypeBlock').closest('#loungePanel')))).toBe(true);
  // In the bedroom, in Overhead, the bed's own
  await page.click('#gameRooms [data-room=bedroom]');
  await page.click('#gameModes [data-view=overhead]');
  await longPress(page, await objectOnScreen(page, 'bed'));
  await expect(page.locator('#optionsTitle')).toHaveText('Bed');
  await expect(page.locator('#optionsBody #otherRoomPiece_bed')).toBeVisible();
});

test('the TV is a piece of its own: put in from the picker, it slides along the back wall in Plan', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await page.click('#picker [data-key=tv]');
  expect(await setting(page, 'pieces.tv.in.livingRoom.on')).toBe(true);
  await toPlan(page);
  const tv = await pieceOnScreen(page, 'tv');
  await drag(page, tv, { x: tv.x - 30, y: tv.y + 40 });
  const { along, bottom } = await setting(page, 'pieces.tv.in.livingRoom');
  expect(along).toBeLessThan(3838 / 2);                          // moved along the wall from the middle...
  expect(bottom).toBeNull();                                     // ...not up or down
  await expect(page.locator('#summary')).toContainText(`On the back wall: a 75" TV (1680 × 960), its middle ${along} from the left wall`);
});

// After the Other folder's been opened in the lounge, going to another room
// once threw (its pieces aren't that room's), inside the render loop, so the
// room changed but was never drawn (24 Oct 2026)
test('after using the lounge\'s picker and its folder, the room chips still go to each room and draw it', async ({ page }) => {
  await openRoom(page, '', { game: true });
  for (const key of ['pine', 'tv', 'bench']) await page.click(`#picker [data-key=${key}]`);
  await page.click('#picker [data-folder=other]');
  await page.click('#pickerFolder [data-key=chesham]');
  const frames = () => page.evaluate(async () => (await import('/living_room.js')).renderer.info.render.frame);
  for (const room of ['bedroom', 'hallway', 'garage', 'livingRoom']) {
    const before = await frames();
    await page.locator(`#gameRooms [data-room=${room}]`).click();
    expect(await page.evaluate(async () => (await import('/living_room.js')).viewKit.room)).toBe(room);
    await expect.poll(frames).toBeGreaterThan(before);           // drawn
  }
});

test('each room\'s corner cupboard is its picker\'s first icon, putting it in and taking it out', async ({ page }) => {
  await openRoom(page, '', { game: true });
  const option = 'pieces.cornerCupboard.design.option';
  await expect(page.locator('#picker .pick').first()).toHaveAttribute('data-key', 'cornerCupboard');
  expect(await setting(page, option)).toBe(16);                  // the room as it is
  await page.click('#picker [data-key=cornerCupboard]');
  expect(await setting(page, option)).toBe(10);                  // in, as it comes to start
  await page.click('#picker [data-key=cornerCupboard]');
  expect(await setting(page, option)).toBe(16);
  await page.click('#gameRooms [data-room=bedroom]');
  await expect(page.locator('#picker .pick').first()).toHaveAttribute('data-key', 'newCupboard');
  await page.click('#picker [data-key=newCupboard]');
  expect(await setting(page, 'pieces.bedroomCupboard.in.bedroom.on')).toBe(true);
});

// The bedroom's new cupboard stands in the pine cupboard's place, as its
// menu has it: with it in, the pine cupboard's icon's greyed, and tapped,
// the two swap, one Undo putting both back
test('a piece something else stands in place of is greyed, and a tap swaps them', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await page.click('#gameRooms [data-room=bedroom]');
  const pine = page.locator('#picker [data-key=cupboard]');
  await expect(pine).toHaveClass(/\bin\b/);
  await page.click('#picker [data-key=newCupboard]');
  await expect(pine).toHaveClass(/\breplaced\b/);
  await expect(pine).not.toHaveClass(/\bin\b/);
  await pine.click();
  expect(await setting(page, 'pieces.bedroomCupboard.in.bedroom.on')).toBe(false);
  expect(await setting(page, 'pieces.pineCupboard.in.bedroom.on')).toBe(true);
  await expect(pine).toHaveClass(/\bin\b/);
  await page.click('#gameToast button');                         // Undo: the new cupboard back in
  expect(await setting(page, 'pieces.bedroomCupboard.in.bedroom.on')).toBe(true);
});

// The laptop's ways to a thing's options (24 Oct 2026): the Options button
// for a fitted thing clicked in Plan, Enter or O for what's selected, a
// right-click and a double-click in any view
test('a thing\'s options from the action bar, the keys, a right-click and a double-click', async ({ page }) => {
  await openRoom(page, '', { game: true });
  const title = page.locator('#optionsTitle'), done = () => page.click('#optionsDone');
  await page.click('#picker [data-key=cornerCupboard]');
  await toPlan(page);
  const cupboard = await objectOnScreen(page, 'cornerCupboard');
  await page.mouse.click(cupboard.x, cupboard.y);
  await page.click('#actionBar [data-action=options]');
  await expect(title).toHaveText('Corner cupboard');
  await done();
  await page.mouse.click(cupboard.x, cupboard.y);
  await page.keyboard.press('o');
  await expect(title).toHaveText('Corner cupboard');
  await done();
  await page.click('#gameModes [data-view=overhead]');
  const island = await objectOnScreen(page, 'island');
  await page.mouse.click(island.x, island.y, { button: 'right' });
  await expect(title).toHaveText('Kitchen island');
  await done();
  const sofa = await objectOnScreen(page, 'sofa');
  await page.mouse.dblclick(sofa.x, sofa.y);
  await expect(title).toHaveText('Sofa');
});

// Turned round in the bird's eye to look at the bedroom, a click in it makes
// it the room chosen (its picker), the camera left where it is; and a click
// back in the lounge, the lounge (asked for, 24 Oct 2026)
test('a click in another room in Overhead or Plan chooses it, the camera left as it is', async ({ page }) => {
  await openRoom(page, '', { game: true });
  const camera = () => page.evaluate(async () => (await import('/living_room.js')).camera.position.toArray().map(n => n.toFixed(3)).join());
  const room = () => page.evaluate(async () => (await import('/living_room.js')).viewKit.room);
  const floorOf = (page, name) => page.evaluate(async name => {
    const { ROOM_BOXES } = await import('/flat_model.js'), { screenOf } = await import('/page/game/picking.js');
    const b = ROOM_BOXES[name];
    return screenOf((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.floor);
  }, name);
  await page.click('#gameModes [data-view=plan]');
  const before = await camera();
  const bedroom = await floorOf(page, 'bedroom');
  await page.mouse.click(bedroom.x, bedroom.y);
  expect(await room()).toBe('bedroom');
  await expect(page.locator('#picker [data-key=newCupboard]')).toBeVisible();
  const lounge = await floorOf(page, 'livingRoom');
  await page.mouse.click(lounge.x, lounge.y);
  expect(await room()).toBe('livingRoom');
  await expect(page.locator('#picker [data-key=cornerCupboard]')).toBeVisible();
  expect(await camera()).toBe(before);
});

test('?classic leaves the game UI out', async ({ page }) => {
  await openRoom(page);
  await expect(page.locator('#picker')).toBeHidden();
  await expect(page.locator('#gameModes')).toBeHidden();
  await expect(page.locator('#bar')).toBeVisible();
});
