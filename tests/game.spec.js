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

test('the picker puts a piece in and takes it out, with Undo', async ({ page }) => {
  await openRoom(page, '', { game: true });
  const chesham = 'pieces.chesham.in.livingRoom.on';
  expect(await setting(page, chesham)).toBe(false);
  await page.click('#picker [data-key=chesham]');
  expect(await setting(page, chesham)).toBe(true);
  await expect(page.locator('#picker [data-key=chesham]')).toHaveClass(/\bin\b/);
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
  // Dragged far past the right-hand wall, it stops against it
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
  const icon = await page.locator('#picker [data-key=cornwall]').boundingBox();
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
  await expect(page.locator('#picker [data-key=kvistbro]')).toBeVisible();
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

test('the sofa resizes from its handles, and turns from the action bar', async ({ page }) => {
  await openRoom(page, '', { game: true });
  await toPlan(page);
  const at = await pieceOnScreen(page, 'sofa');
  // A long-press
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await expect(page.locator('#resizeHandles [data-side=end]')).toBeVisible();
  await page.mouse.up();
  const w = await setting(page, 'pieces.sofa.design.w');
  const handle = await page.locator('#resizeHandles [data-side=end]').boundingBox();
  const from = { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
  await drag(page, from, { x: from.x + 6, y: from.y });
  expect(await setting(page, 'pieces.sofa.design.w')).toBeGreaterThan(w);
  await page.keyboard.press('Escape');
  await page.mouse.click(at.x, at.y);
  const turn = (await setting(page, 'pieces.sofa.in.livingRoom.move')).turn;
  await page.click('#actionBar [data-action=turn]');
  expect((await setting(page, 'pieces.sofa.in.livingRoom.move')).turn).toBe((turn + 90) % 360);
});

// The colour sheet opened, and still once it's slid up
const SHEET_SLIDE_MS = 300;        // game.css's 0.22 s, and a little over
async function openSheet(page) {
  await page.click('#actionBar [data-action=colour]');
  await expect(page.locator('#colourSheet')).toHaveClass(/\bup\b/);
  await page.waitForTimeout(SHEET_SLIDE_MS);
}

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
  const where = () => page.evaluate(() => window.plans.view().camera?.position ?? null);
  // A spot on the floor ahead, 1.5 m in front of you
  const spot = await page.evaluate(async () => {
    const { camera, controls } = await import('/living_room.js'), { screenOf } = await import('/page/game/picking.js');
    const ahead = controls.target.clone().sub(camera.position).setY(0).normalize().multiplyScalar(1.5).add(camera.position);
    return screenOf(ahead.x * 1000, ahead.z * 1000, 0);
  });
  await page.mouse.click(spot.x, spot.y);
  await expect.poll(where).not.toBeNull();
  const start = await page.evaluate(async () => (await import('/living_room.js')).camera.position.toArray());
  await expect.poll(async () => (await where())[0]).not.toBe(Math.round(start[0] * 1000) + 1);   // settled
  const end = await where();
  expect(end[1]).toBe(Math.round(start[1] * 1000));                // the same eye height
});

test('?classic leaves the game UI out', async ({ page }) => {
  await openRoom(page);
  await expect(page.locator('#picker')).toBeHidden();
  await expect(page.locator('#gameModes')).toBeHidden();
  await expect(page.locator('#bar')).toBeVisible();
});
