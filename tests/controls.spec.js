// index.html: every control in the drawer and the menus, used once: it
// shows its new value, changes the settings as it should, and draws it
// without a console error (every test fails on one; helpers.js).
// room_3d.spec.js checks how saved addresses look; this checks the controls
// that set them. It runs in one browser only (playwright.config.js).
// The settings are read through window.plans.get() (setting(), by their
// paths in `state` in living_room.js), not from the address, so a new
// address format leaves these tests alone.
const { test, expect, openRoom, pickOption, setting, optionShown } = require('./helpers');

const hash = page => page.evaluate(() => location.hash);
// The things to store: whether they're shown, which packing, where (state.stored)
const storedHead = async page => { const { shown, packing, where } = await setting(page, 'stored'); return { shown, packing, where }; };
// The view: its id, eye height, the doors' angles and the room
const view = async page => (await hash(page)).split('~')[2];

// The page with a drawer open (Other options, or with '#cupMenu' Cupboard
// options), and every section in it unfolded
async function openDrawer(page, address, button = '#menu') {
  await openRoom(page, address);
  await page.click(button);
  await page.evaluate(() => document.querySelectorAll('#panel details').forEach(d => { d.open = true; }));
}

// What to do first, so a slider is on show
const OPTION = n => page => pickOption(page, n);
const LARDER = page => page.check('input[name=frontPiece][value="larder"]');
const SOFA = page => page.selectOption('#sofaPick', 'merton');
const LEFT_CUPBOARD = page => slide(page, 'depth', 600);

// Where a slider's value goes in the settings: its path, as text to compare
// with the slider's (the doors' are under `doors`)
const at = path => async page => String(await setting(page, path));

// Set a slider as dragging it would, with its 'input' event, and return the
// value it lands on (the browser holds it to its steps). Done in the page
// rather than with Playwright's fill(), which waits on the 3D view's frames:
// slow in headless Chrome, which draws them in software.
const slide = (page, id, value) => page.locator(`#${id}`).evaluate((el, v) => {
  el.value = v;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return el.value;
}, String(value));
// ...and a switch, with its 'change' event
const toggle = (page, id, on) => page.locator(`#${id}`).evaluate((el, v) => {
  el.checked = v;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, on);
const readout = (page, id) => page.locator(`#${id}Value`).evaluate(el => el.textContent);

// Take a slider to its lowest, then its highest, then back to where it
// started. At each end its readout and its setting follow the value it
// lands on (text(v), setting(v)); back where it started, the whole address
// must be as it was, so it changed nothing else. `back: false` for a slider
// that can't get back exactly (see where it's used).
async function endsAndBack(page, id, place, { text = v => v, setting = v => v, back = true } = {}) {
  const before = await hash(page);
  const { min, max, value: start } = await page.locator(`#${id}`).evaluate(el => ({ min: el.min, max: el.max, value: el.value }));
  for (const [end, value] of [['lowest', min], ['highest', max]]) {
    const v = await slide(page, id, value);
    expect(await readout(page, id), `${id} at its ${end}`).toBe(String(text(v)));
    // (the doors write theirs a moment later)
    await expect.poll(() => place(page), `${id} at its ${end}, in the settings`).toBe(String(setting(v)));
  }
  await slide(page, id, start);
  if (back) await expect.poll(() => hash(page), `the address with ${id} back where it started`).toBe(before);
}

test.describe('sliders, to each end and back', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('the corner cupboard\'s sizes', async ({ page }) => {
    await OPTION(7)(page);                                       // for the left-wall depth slider
    await endsAndBack(page, 'depth', at('T'), { text: v => (v < 300 ? 'none' : v), setting: v => (v < 300 ? 0 : v) });
    await endsAndBack(page, 'rear', at('R'));
    await endsAndBack(page, 'board', at('BOARD'));
  });

  test('option 7\'s sliders', async ({ page }) => {
    await OPTION(7)(page);
    await endsAndBack(page, 'leg', at('LEG'));
    await endsAndBack(page, 'legD', at('LEG_D'));
  });

  test('option 9\'s sliders', async ({ page }) => {
    await OPTION(9)(page);
    await endsAndBack(page, 'ward', at('WARD'));
    await endsAndBack(page, 'wardD', at('WARD_D'));
    await endsAndBack(page, 'tower', at('TOWER'));
  });

  // Their depth replaces the left-wall cupboard front's radio buttons. At its
  // lowest (0) the cupboard is too shallow to build, and isn't drawn
  test('options 10 and 11\'s corner cupboard width and depth', async ({ page }) => {
    for (const n of [10, 11]) {
      await OPTION(n)(page);
      await expect(page.locator('#front')).toBeHidden();
      await endsAndBack(page, 'cornerW', at('CORNER_W'));
      await endsAndBack(page, 'cornerD', at('CORNER_D'));
      await slide(page, 'cornerD', 0);
      await expect(page.locator('#summary')).toContainText('too shallow to build');
      await slide(page, 'cornerD', 1200);
    }
    await OPTION(9)(page);
    await expect(page.locator('#front')).toBeVisible();
  });

  // Only option 10 has it: option 11's doors open where it would stand. Off,
  // its sliders are hidden; on, it takes the bench's start along by its width
  test('option 10\'s side bookshelf', async ({ page }) => {
    await OPTION(10)(page);
    await expect(page.locator('#sideShelfDetails')).toBeHidden();
    await toggle(page, 'sideShelfOn', true);
    await expect.poll(() => setting(page, 'SIDE_SHELF')).toBe(true);
    await expect(page.locator('#summary')).toContainText('Bench 2638, from x = 1200');
    await endsAndBack(page, 'sideW', at('SIDE_W'));
    await endsAndBack(page, 'sideD', at('SIDE_D'));
    await toggle(page, 'sideShelfOn', false);
    await expect.poll(() => setting(page, 'SIDE_SHELF')).toBe(false);
    await expect(page.locator('#summary')).toContainText('Bench 3038, from x = 800');
    await OPTION(11)(page);
    await expect(page.locator('#sideShelfBlock')).toBeHidden();
  });

  test('the bench', async ({ page }) => {
    await endsAndBack(page, 'shelfDepth', at('shelfDepth'));
    const TV = { 0: [32, '32" (720 × 440)'], 14: [86, '86" (1930 × 1110)'] };   // the ends of TV_SIZES
    await endsAndBack(page, 'tvSize', at('tv'), { text: v => TV[v][1], setting: v => TV[v][0] });
  });

  test('the dresser', async ({ page }) => {
    await endsAndBack(page, 'dresserW', at('dresser.w'));
    await endsAndBack(page, 'dresserH', at('dresser.h'));
    await endsAndBack(page, 'dresserBaseH', at('dresser.baseH'));
    // Its upper part is never deeper than its base (420)
    await endsAndBack(page, 'dresserUpperD', at('dresser.upperD'), { text: v => Math.min(v, 420), setting: v => Math.min(v, 420) });
    // ...so a shallower base takes the upper part (420) with it, and it stays there
    await endsAndBack(page, 'dresserBaseD', at('dresser.baseD'), { back: false });
    expect(await setting(page, 'dresser.upperD')).toBe(300);
  });

  test('the larder', async ({ page }) => {
    await LARDER(page);
    await endsAndBack(page, 'larderW', at('larder.size.w'));
    await endsAndBack(page, 'larderH', at('larder.size.h'));
    await endsAndBack(page, 'larderD', at('larder.size.d'));
  });

  test('the sofa', async ({ page }) => {
    await SOFA(page);
    await endsAndBack(page, 'sofaFront', at('sofa.front'));
    await endsAndBack(page, 'sofaW', at('sofa.size.w'));
    await endsAndBack(page, 'sofaD', at('sofa.size.d'));
    await endsAndBack(page, 'sofaH', at('sofa.size.h'));
  });

  test('the island, out there', async ({ page }) => {
    await endsAndBack(page, 'islandX', at('island.move.x'));
    // It starts at 3571 (measured), between the slider's steps of 5, so the
    // slider can't take it back there exactly
    await endsAndBack(page, 'islandY', at('island.move.y'), { back: false });
    await endsAndBack(page, 'islandTurn', at('island.move.turn'), { text: v => `${v}°` });
  });

  // The doors turn without rebuilding
  test('the doors', async ({ page }) => {
    await LEFT_CUPBOARD(page);                                         // so the left-wall cupboard has a door
    for (const [id, door] of [['roomDoor', 'room'], ['tallDoor', 'tall'], ['secondDoor', 'second'], ['bedroomDoor', 'bedroom'], ['flatDoor', 'flat'], ['outsideDoor', 'outside']]) await endsAndBack(page, id, at(`doors.${door}`), { text: v => `${v}°` });
  });
});

test.describe('radio buttons', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('bench height', async ({ page }) => {
    const before = await hash(page);
    await page.check('input[name=bench][value="900"]');
    expect(await setting(page, 'BENCH')).toBe(900);
    await page.check('input[name=bench][value="780"]');
    expect(await hash(page)).toBe(before);
  });

  test('the left-wall cupboard\'s front', async ({ page }) => {
    await page.click('#cupMenu');
    await OPTION(7)(page);                                       // option 10, as the page opens, has its own depth instead
    const before = await hash(page);
    await page.check('input[name=front][value="1329"]');
    expect(await setting(page, 'F')).toBe(1329);
    await page.check('input[name=front][value="1200"]');
    expect(await hash(page)).toBe(before);
  });

  test('where the island is', async ({ page }) => {
    const before = await hash(page);
    for (const value of ['along', 'out', 'none', 'room']) {
      await page.check(`input[name=islandAt][value="${value}"]`);
      expect(await setting(page, 'island.at')).toBe(value);
    }
    expect(await hash(page)).toBe(before);
  });

  test('what\'s on the front wall', async ({ page }) => {
    const before = await hash(page);
    for (const value of ['larder', 'none', 'dresser']) {
      await page.check(`input[name=frontPiece][value="${value}"]`);
      expect(await setting(page, 'frontPiece')).toBe(value);
    }
    expect(await hash(page)).toBe(before);
  });
});

test.describe('dropdowns', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('the cupboard colour, ◀ ▶, and other colours', async ({ page }) => {
    await page.selectOption('#ral-cupboard', '5');
    expect(await setting(page, 'colours.cupboard')).toBe(5);
    await expect(page.locator('#cupboardSwatch')).toHaveCSS('background-color', 'rgb(245, 244, 239)');   // #F5F4EF
    // ◀ ▶ step through the named colours: from AI Olive (4) on to Bella Brittany (6)
    await page.selectOption('#ral-cupboard', '4');
    await page.click('#colNext');
    expect(await setting(page, 'colours.cupboard')).toBe(6);
    await page.click('#colPrev');
    expect(await setting(page, 'colours.cupboard')).toBe(4);
    // Other colours: any RAL colour, from a second dropdown
    await expect(page.locator('#otherRow')).toBeHidden();
    await page.selectOption('#ral-cupboard', 'other');
    await expect(page.locator('#otherRow')).toBeVisible();
    await page.selectOption('#ral-other', '7016');
    expect(await setting(page, 'colours.cupboard')).toBe(7016);
  });

  test('the dresser colour, ◀ ▶, and other colours', async ({ page }) => {
    await page.selectOption('#ral-dresser', '6');
    expect(await setting(page, 'colours.dresser')).toBe(6);
    await page.click('#dresserNext');
    expect(await setting(page, 'colours.dresser')).toBe(7);
    await page.click('#dresserPrev');
    expect(await setting(page, 'colours.dresser')).toBe(6);
    await page.selectOption('#ral-dresser', 'other');
    await expect(page.locator('#dresserOtherRow')).toBeVisible();
    await page.selectOption('#ral-dresser-other', '5014');
    expect(await setting(page, 'colours.dresser')).toBe(5014);
  });

  // The carpet (bedroom and stairs), colours.carpet: from the doorway photo (0),
  // the first photos' colour lighter (13), as it was (12), Dormouse's
  // swatch (11), or any RAL colour
  test('the carpet colour, ◀ ▶, and other colours', async ({ page }) => {
    expect(await setting(page, 'colours.carpet')).toBe(0);
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(181, 164, 153)');   // #B5A499, from the doorway photo
    await page.click('#carpetNext');
    expect(await setting(page, 'colours.carpet')).toBe(13);
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(171, 165, 160)');   // #ABA5A0, the photos' colour, lighter
    await page.click('#carpetNext');
    expect(await setting(page, 'colours.carpet')).toBe(12);
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(143, 135, 128)');   // #8F8780, from the photos
    await page.click('#carpetNext');
    expect(await setting(page, 'colours.carpet')).toBe(11);
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(162, 144, 124)');   // #A2907C, Dormouse
    await page.click('#carpetPrev');
    await page.click('#carpetPrev');
    await page.click('#carpetPrev');
    expect(await setting(page, 'colours.carpet')).toBe(0);
    await page.selectOption('#ral-carpet', 'other');
    await expect(page.locator('#carpetOtherRow')).toBeVisible();
    await page.selectOption('#ral-carpet-other', '7035');
    expect(await setting(page, 'colours.carpet')).toBe(7035);
  });

  test('the shelf wood', async ({ page }) => {
    await page.selectOption('#shelfWood', '2');
    expect(await setting(page, 'shelfWood')).toBe(2);
    await expect(page.locator('#shelfSwatch')).toHaveCSS('background-color', 'rgb(138, 90, 51)');      // #8A5A33
  });

  test('the colours in this view', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('palette').open = true; });
    await expect(page.locator('#paletteList .colrow').first()).toBeVisible();
    await page.selectOption('#shelfWood', '3');
    await expect(page.locator('#paletteList')).toContainText('Walnut');
  });

  test('the dresser: a listed one, then Custom once a slider moves', async ({ page }) => {
    await page.selectOption('#dresserPick', 'inglesham');
    expect(await setting(page, 'dresser')).toMatchObject({ w: 1000, h: 1930, baseD: 420, baseH: 830, upperD: 420 });
    await expect(page.locator('#dresserWValue')).toHaveText('1000');
    await slide(page, 'dresserW', 1100);
    await expect(page.locator('#dresserPick')).toHaveValue('');           // Custom
  });

  test('the larder: a listed one, then Custom once a slider moves', async ({ page }) => {
    await LARDER(page);
    await page.selectOption('#larderPick', 'stow');
    expect(await setting(page, 'larder.key')).toBe('stow');
    expect(await setting(page, 'larder.size.w')).toBe(670);
    await expect(page.locator('#larderWValue')).toHaveText('670');
    await slide(page, 'larderW', 700);
    await expect(page.locator('#larderPick')).toHaveValue('');            // Custom
  });

  test('the sofa: one, then none', async ({ page }) => {
    await expect(page.locator('#sofaFrontBlock')).toBeHidden();
    await SOFA(page);
    expect(await setting(page, 'sofa.key')).toBe('merton');
    await expect(page.locator('#sofaFrontBlock')).toBeVisible();
    await slide(page, 'sofaW', 2000);
    await expect(page.locator('#sofaPick')).toHaveValue('custom');
    await page.selectOption('#sofaPick', '');
    expect(await setting(page, 'sofa.key')).toBe('');            // none
    await expect(page.locator('#sofaFrontBlock')).toBeHidden();
  });
});

test.describe('option 7\'s shelves', () => {
  test.beforeEach(async ({ page }) => {
    await openDrawer(page, undefined, '#cupMenu');
    await OPTION(7)(page);
  });

  test('a list of shelf tops for each leg', async ({ page }) => {
    await page.locator('#shelvesBack').fill('1000 500');
    await page.locator('#shelvesBack').press('Tab');                    // the list is read once you leave the box
    await expect(page.locator('#shelvesBack')).toHaveValue('500, 1000');   // sorted, and written back tidily
    expect(await setting(page, 'L_SHELVES.back')).toEqual([500, 1000]);
    await page.locator('#shelvesLeft').fill('700');
    await page.locator('#shelvesLeft').press('Tab');
    expect(await setting(page, 'L_SHELVES.left')).toEqual([700]);
  });

  test('tops too low, too high or not numbers are left out', async ({ page }) => {
    await page.locator('#shelvesBack').fill('50, shelf, 2500');
    await page.locator('#shelvesBack').press('Tab');
    await expect(page.locator('#shelvesBack')).toHaveValue('');
    expect(await setting(page, 'L_SHELVES.back')).toEqual([]);         // no shelves
  });
});

test.describe('switches and buttons', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, '#cupMenu'); });

  test('see-through cupboards', async ({ page }) => {
    await page.click('#xray');
    await expect(page.locator('#xray')).toHaveText('See-through cupboards: on');
    await page.click('#xray');
    await expect(page.locator('#xray')).toHaveText('See-through cupboards: off');
  });

  test('cupboard only, in 3D and in the plan', async ({ page }) => {
    await page.locator('#cupboardOnly').check();
    await page.click('#cupClose');
    await page.locator('#viewsMenu .popToggle').click();
    await page.selectOption('#viewPick', 'plan');
    await expect(page.locator('#dims')).toHaveText('Dimensions: on');
    await page.keyboard.press('Escape');                             // the Views menu shut: on a phone it reaches the top bar
    await page.click('#cupMenu');
    await page.locator('#cupboardOnly').uncheck();
  });
});

// The wicker bench (state.wickerBench): its sizes, then whether it's on and
// where in the hallway, the bedroom and the living room, each on its own
test.describe('the wicker bench', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('it can be on in each room, resized and moved', async ({ page }) => {
    await expect(page.locator('#wickerBench_bedroom')).toBeHidden();
    await toggle(page, 'wickerBench_bedroom_on', true);
    await expect(page.locator('#wickerBench_bedroom')).toBeVisible();
    await toggle(page, 'wickerBench_hallway_on', false);
    await slide(page, 'wickerBench_w', 1200);
    await slide(page, 'wickerBench_bedroom_u', 2000);
    expect(await readout(page, 'wickerBench_w')).toBe('1200');
    expect(await setting(page, 'wickerBench')).toMatchObject({ w: 1200, d: 410, h: 450, legs: 80 });
    expect(await setting(page, 'wickerBench.hallway')).toEqual({ on: false, along: 1470, across: 1372, turn: 0 });
    expect(await setting(page, 'wickerBench.bedroom')).toEqual({ on: true, u: 2000, v: 1985, turn: 0 });
    expect(await setting(page, 'wickerBench.livingRoom')).toEqual({ on: false, x: 3686, y: 2910, turn: 90 });
    await page.locator('#wickerBenchBlock [data-reset="bedroom"]').evaluate(b => b.click());
    expect(await setting(page, 'wickerBench.bedroom')).toEqual({ on: true, u: 1360, v: 1985, turn: 0 });
    await page.locator('#wickerBenchBlock [data-reset="sizes"]').evaluate(b => b.click());
    expect(await setting(page, 'wickerBench')).toMatchObject({ w: 920, d: 410, h: 450, legs: 80 });
  });
});

// The garage, in Garage options (state.garage): Sean, Billy and BillyChest,
// each on, x, y and turn; then Metal, Yellow (with its height above the
// floor, z), the scaffold bench, Small Billy (with its gap from the wall,
// off), Potters (likewise), Biltong (with its height), Trellis and the
// bedroom's pine cupboard (its sizes the bedroom's). The tests of older
// links write them in the address's fields, 58 to 68
test.describe('the garage', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, '#garageMenu'); });

  test('Sean and Billy can be moved and turned, and put back', async ({ page }) => {
    expect(await setting(page, 'garage.sean')).toEqual({ on: true, x: 1255, y: 2865, turn: 180 });
    expect(await setting(page, 'garage.billy')).toEqual({ on: true, x: 0, y: 1920, turn: 270 });
    await slide(page, 'garage_sean_x', 2000);
    await slide(page, 'garage_sean_y', 1000);
    await slide(page, 'garage_sean_turn', 90);
    await slide(page, 'garage_billy_x', 4000);
    expect(await setting(page, 'garage.sean')).toEqual({ on: true, x: 2000, y: 1000, turn: 90 });
    expect(await setting(page, 'garage.billy')).toEqual({ on: true, x: 4000, y: 1920, turn: 270 });
    expect(await readout(page, 'garage_sean_turn')).toBe('90°');
    await page.locator('#garageBlock [data-reset="sean"]').evaluate(b => b.click());
    expect(await setting(page, 'garage.sean')).toEqual({ on: true, x: 1255, y: 2865, turn: 180 });
    expect(await setting(page, 'garage.billy')).toEqual({ on: true, x: 4000, y: 1920, turn: 270 });         // Billy stays where he was put
  });

  // Each has its In the garage switch; taken out, its sliders stay, as the
  // bedroom's
  test('each can be taken out, moved and put back', async ({ page }) => {
    await toggle(page, 'garage_sean_on', false);
    expect(await setting(page, 'garage.sean')).toEqual({ on: false, x: 1255, y: 2865, turn: 180 });
    await expect(page.locator('#garage_sean_x')).toBeVisible();
    await toggle(page, 'garage_sean_on', true);
    expect(await setting(page, 'garage.sean')).toEqual({ on: true, x: 1255, y: 2865, turn: 180 });
    expect(await setting(page, 'garage.billyChest')).toEqual({ on: false, x: 0, y: 1100, turn: 270 });            // out to start
    await toggle(page, 'garage_billyChest_on', true);
    await slide(page, 'garage_billyChest_x', 3000);
    await slide(page, 'garage_billyChest_turn', 0);
    expect(await setting(page, 'garage.billyChest')).toEqual({ on: true, x: 3000, y: 1100, turn: 0 });
    await page.locator('#garageBlock [data-reset="billyChest"]').evaluate(b => b.click());
    expect(await setting(page, 'garage.billyChest')).toEqual({ on: true, x: 0, y: 1100, turn: 270 });            // put back, still in
  });

  // Yellow starts on the scaffold bench and Biltong on Trellis, each
  // raised by the height of what it's on; the others have no height
  test('Yellow and Biltong can be raised and lowered, and put back', async ({ page }) => {
    expect(await setting(page, 'garage.yellow')).toEqual({ on: true, x: 3390, y: 2550, turn: 0, z: 438 });
    expect(await setting(page, 'garage.scaffoldBench')).toEqual({ on: true, x: 3430, y: 2650, turn: 0 });
    expect(await setting(page, 'garage.biltong')).toEqual({ on: true, x: 580, y: 1070, turn: 90, z: 750 });
    expect(await page.locator('#garage_metal_z').count()).toBe(0);
    expect(await setting(page, 'garage.pine')).toEqual({ on: true, x: 1425, y: 0, turn: 0 });
    await toggle(page, 'garage_pine_on', false);
    await slide(page, 'garage_pine_turn', 90);
    expect(await setting(page, 'garage.pine')).toEqual({ on: false, x: 1425, y: 0, turn: 90 });
    await slide(page, 'garage_yellow_z', 0);
    await toggle(page, 'garage_biltong_on', false);
    expect(await setting(page, 'garage.yellow')).toEqual({ on: true, x: 3390, y: 2550, turn: 0, z: 0 });
    expect(await setting(page, 'garage.biltong')).toEqual({ on: false, x: 580, y: 1070, turn: 90, z: 750 });
    await page.locator('#garageBlock [data-reset="yellow"]').evaluate(b => b.click());
    expect(await setting(page, 'garage.yellow')).toEqual({ on: true, x: 3390, y: 2550, turn: 0, z: 438 });
  });

  // Small Billy and Potters can stand off the wall behind them; the others can't
  test('Small Billy and Potters can stand off the wall, and be put back', async ({ page }) => {
    expect(await setting(page, 'garage.smallBilly')).toEqual({ on: true, x: 2480, y: 0, turn: 0, off: 0 });
    expect(await setting(page, 'garage.potters')).toEqual({ on: true, x: 3090, y: 0, turn: 0, off: 0 });
    expect(await page.locator('#garage_sean_off').count()).toBe(0);
    await slide(page, 'garage_smallBilly_off', 25);
    await slide(page, 'garage_potters_off', 40);
    expect(await setting(page, 'garage.smallBilly')).toEqual({ on: true, x: 2480, y: 0, turn: 0, off: 25 });
    expect(await setting(page, 'garage.potters')).toEqual({ on: true, x: 3090, y: 0, turn: 0, off: 40 });
    await page.locator('#garageBlock [data-reset="potters"]').evaluate(b => b.click());
    expect(await setting(page, 'garage.potters')).toEqual({ on: true, x: 3090, y: 0, turn: 0, off: 0 });    // a link from before there was a gap keeps it as it starts
    const [settings, ...rest] = (await hash(page)).split('~');
    await openRoom(page, [settings.split('-').map((f, k) => (k === 64 ? '0.1000.0.90' : f)).join('-'), ...rest].join('~'));
    expect(await setting(page, 'garage.smallBilly')).toEqual({ on: false, x: 1000, y: 0, turn: 90, off: 0 });
  });

  // Links from before Sean and Billy could be taken out, x.y.turn, keep
  // them in
  test('a link with their places keeps them, and holds them to the garage', async ({ page }) => {
    const [settings, ...rest] = (await hash(page)).split('~');
    const withPlaces = (sean, billy) => [settings.split('-').map((f, k) => (k === 58 ? sean : k === 59 ? billy : f)).join('-'), ...rest].join('~');
    await openRoom(page, withPlaces('0.3000.2000.180', '500.500.0'));
    expect(await setting(page, 'garage.sean')).toEqual({ on: false, x: 3000, y: 2000, turn: 180 });
    expect(await setting(page, 'garage.billy')).toEqual({ on: true, x: 500, y: 500, turn: 0 });
    await openRoom(page, withPlaces('1.9000.2000.45', '500.500.0'));   // past the back wall's far end, and not a quarter turn
    expect(await setting(page, 'garage.sean')).toEqual({ on: true, x: 1255, y: 2000, turn: 180 });
  });
});

// The shoe rack, downstairs (state.shoeRack): its sizes, bevel, shelves'
// slope, shoes and the door angle its bevel's cut for (field 55 in the
// address, for the test of links)
test.describe('the shoe rack', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('it can be resized and put back', async ({ page }) => {
    expect(await setting(page, 'shoeRack')).toEqual({ w: 460, d: 300, h: 1290, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
    await slide(page, 'shoeRack_d', 250);
    await slide(page, 'shoeRack_h', 900);
    await slide(page, 'shoeRack_slope', 30);
    expect(await setting(page, 'shoeRack')).toEqual({ w: 460, d: 250, h: 900, bevel: true, slope: 30, shoes: true, bevelDoor: 72 });
    await page.locator('#shoeRackBlock [data-reset="sizes"]').evaluate(b => b.click());
    expect(await setting(page, 'shoeRack')).toEqual({ w: 460, d: 300, h: 1290, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
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
    expect(await setting(page, 'shoeRack')).toEqual({ w: 460, d: 300, h: 1290, bevel: false, slope: 45, shoes: true, bevelDoor: 80 });
    await expect(page.locator('#shoeRack_w')).toBeEnabled();
    await expect(page.locator('#shoeRack_bevelDoor')).toBeHidden();
    await expect(page.locator('#shoeRack_door')).toContainText('opens to 65.5°');  // the door stops on its corner
    await slide(page, 'shoeRack_slope', 0);
    await expect(page.locator('#shoeRack_fits')).toContainText('sticks out 15');    // a UK 11, about 315, on 300
    await slide(page, 'shoeRack_d', 200);
    await slide(page, 'shoeRack_slope', 30);
    await expect(page.locator('#shoeRack_fits')).toContainText('up to 231 long');   // 200 / cos 30°
    await page.locator('#shoeRack_shoes').uncheck();
    expect(await setting(page, 'shoeRack')).toEqual({ w: 460, d: 200, h: 1290, bevel: false, slope: 30, shoes: false, bevelDoor: 80 });
  });

  test('a link with its settings keeps them, and holds them to the sliders', async ({ page }) => {
    const [settings, ...rest] = (await hash(page)).split('~');
    const withRack = rack => [settings.split('-').map((f, k) => (k === 55 ? rack : f)).join('-'), ...rest].join('~');   // its field, 55
    await openRoom(page, withRack('900.250.1500.0.15.0.60'));
    expect(await hash(page)).toBe(withRack('900.250.1500.0.15.0.60'));
    expect(await readout(page, 'shoeRack_slope')).toBe('15°');
    await openRoom(page, withRack('900.250.1500'));                     // a shorter link: the rest as they start
    expect(await setting(page, 'shoeRack')).toEqual({ w: 900, d: 250, h: 1500, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
    await openRoom(page, withRack('5000.250.1500.2.90.1.120'));         // too wide, a bad switch, too steep, past 90°
    expect(await setting(page, 'shoeRack')).toEqual({ w: 460, d: 250, h: 1500, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
  });
});

test.describe('things to store', () => {
  test('shown, packed, and where they go', async ({ page }) => {
    await openDrawer(page);
    await page.click('#storedToggle');
    await expect(page.locator('#storedToggle')).toHaveText('Stored things: shown');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 0 });
    await expect(page.locator('#storedInfo')).toContainText('Standing on the floor they take');
    await page.selectOption('#storedPacking', '2');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 2, where: 0 });
    await page.check('input[name=storedWhere][value="1"]');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 2, where: 1 });
    await expect(page.locator('#storedInfo')).toContainText("corner cupboard");
    await page.click('#storedToggle');
    expect(await storedHead(page)).toEqual({ shown: false, packing: 2, where: 1 });
  });

  test('off the floor, then packed again', async ({ page }) => {
    await openDrawer(page);
    await page.click('#storedToggle');
    const lift = page.locator('#storedLifts input').first();             // Rack 1
    await lift.fill('300');
    await lift.press('Tab');
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 2 });   // as placed by hand now
    expect(await setting(page, 'stored.spots.0.z')).toBe(300);
    await page.click('#storedPack');                                   // back by the window
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 0 });
  });

  // In the plan, with the drawers shut, the view is centred on (1400, 2860)
  // in room mm, in the part of the screen below the top bar, at a scale
  // that fits 6.0 × 6.9 m there (index.html's built-in plan view, and
  // resize()). Rack 1 starts at x 2550, y 2640, turned: 100 × 800.
  test('in the plan: named under the pointer, dragged, and turned', async ({ page }) => {
    await openRoom(page, '#9-0-330-1200-3-250-780-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0-18~1.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1~plan.sit-tall.90-0-0');
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
    expect(await storedHead(page)).toEqual({ shown: true, packing: 0, where: 2 });   // moved by hand
    const rack1 = await setting(page, 'stored.spots.0');
    expect(rack1.x).toBeGreaterThan(2000);
    expect(rack1.x).toBeLessThan(2100);
    expect(rack1.turned).toBe(true);
    // A double-click turns it round
    await page.mouse.dblclick(sx - 500 * perMm, sy);
    expect(await setting(page, 'stored.spots.0.turned')).toBe(false);
  });
});

test.describe('the Views and Look menus', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });

  test('a view from the list', async ({ page }) => {
    await page.locator('#viewsMenu .popToggle').click();
    await page.selectOption('#viewPick', 'top');
    await expect.poll(() => view(page)).toMatch(/^top\./);
  });

  test('where you are, what you look at, and eye height', async ({ page }) => {
    await page.locator('#viewMenu .popToggle').click();
    await page.selectOption('#where', 'island');
    await expect.poll(() => view(page)).toMatch(/^look:island:/);
    await page.selectOption('#lookAt', 'tv');
    await expect.poll(() => view(page)).toMatch(/^look:island:tv\./);
    await page.selectOption('#eye', 'stand-short');
    await expect.poll(() => view(page)).toMatch(/\.stand-short\./);
  });

  // The rooms: Bird's eye and the plan stay as they are, framing the room
  // chosen; from anywhere else you go in at its doorway. Where and Looking
  // at offer only its places and things, and the address ends with the
  // room, unless it's the living room.
  test('choosing the room', async ({ page }) => {
    await page.locator('#viewMenu .popToggle').click();
    const options = id => page.locator(`#${id} option`).evaluateAll(os => os.filter(o => o.value).map(o => o.textContent));
    await page.selectOption('#room', 'bedroom');
    await expect.poll(() => view(page)).toMatch(/^birdseye\..*\.bedroom$/);
    expect(await options('where')).toEqual(['In the bedroom doorway, walking in', 'Lying on the bed', 'Standing beside the bed', 'Standing at the bedroom window']);
    expect(await options('lookAt')).toEqual(['Looking at the cupboards in the recess', 'Looking at the bookcase', 'Looking at the wardrobe', 'Looking at the new cupboard', 'Looking at the wicker bench', 'Looking at the window', 'Looking at the bed', 'Looking at the mirror']);
    await page.selectOption('#where', 'bed');
    await expect.poll(() => view(page)).toMatch(/^look:bed:\w+\.lie-tall\..*\.bedroom$/);
    await page.selectOption('#room', 'hallway');
    await expect.poll(() => view(page)).toMatch(/^look:hallLivingDoor:bedroomDoor\.stand-tall\..*\.hallway$/);
    await page.locator('#viewsMenu .popToggle').click();
    await page.selectOption('#viewPick', 'plan');
    await expect.poll(() => view(page)).toMatch(/^plan\..*\.hallway$/);
    await page.locator('#viewMenu .popToggle').click();             // one menu open at a time
    await page.selectOption('#room', 'living');
    await expect.poll(() => view(page)).toMatch(/^plan\.stand-tall\.[\d-]+$/);
    // Downstairs: its plan, and a place on the first floor's level
    await page.selectOption('#room', 'downstairs');
    await expect.poll(() => view(page)).toMatch(/^plan\..*\.downstairs$/);
    expect(await options('where')).toEqual(['Halfway down the stairs', 'At bottom of stairs', 'Outside internal door', 'Outside external door']);
    // Halfway down, looking on down: the foot, its window and the internal door
    await page.selectOption('#where', 'stairsHalfway');
    await expect.poll(() => view(page)).toMatch(/^look:stairsHalfway:\w+\.stand-tall\..*\.downstairs$/);
    const offered = () => page.locator('#lookAt option').evaluateAll(os => os.filter(o => o.value && !o.disabled).map(o => o.textContent));
    expect(await offered()).toEqual(['Looking at the foot of the stairs', 'Looking at the window at the foot of the stairs', 'Looking at the internal door', 'Looking at the shoe rack']);
    await page.selectOption('#where', 'outsideFlatDoor');
    await expect.poll(() => view(page)).toMatch(/^look:outsideFlatDoor:\w+\.stand-tall\..*\.downstairs$/);
    // The garage: in at its door, looking in at Sean; Looking in and Looking
    // out, each not offering the wall you stand at
    await page.selectOption('#room', 'garage');
    await expect.poll(() => view(page)).toMatch(/^look:garageLookingIn:sean\.stand-tall\..*\.garage$/);
    expect(await options('where')).toEqual(['Looking in', 'Looking out', 'Looking in from outside']);
    const garageThings = ['Looking at Sean', 'Looking at Billy', 'Looking at BillyChest', 'Looking at Metal', 'Looking at Yellow', 'Looking at the scaffold bench', 'Looking at Small Billy', 'Looking at Potters', 'Looking at Biltong', 'Looking at Trellis', 'Looking at the pine cupboard'];
    expect(await offered()).toEqual([...garageThings, 'Looking at the back wall']);
    await page.selectOption('#where', 'garageLookingOut');
    expect(await offered()).toEqual([...garageThings, 'Looking at the entrance']);
    await page.selectOption('#where', 'garageOutside');
    await expect.poll(() => view(page)).toMatch(/^look:garageOutside:\w+\.stand-tall\..*\.garage$/);
  });

  test('saving and deleting a view', async ({ page }) => {
    await page.locator('#viewsMenu .popToggle').click();
    page.once('dialog', d => d.accept('Test view'));
    await page.click('#saveView');
    await expect(page.locator('#viewPick option[value="saved:Test view"]')).toHaveCount(1);
    await expect(page.locator('#deleteView')).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.click('#deleteView');
    await expect(page.locator('#viewPick option[value="saved:Test view"]')).toHaveCount(0);
  });

  test('saving and deleting a look', async ({ page }) => {
    await page.locator('#viewMenu .popToggle').click();
    await page.selectOption('#where', 'window2');
    page.once('dialog', d => d.accept('Test look'));
    await page.click('#saveLook');
    await expect(page.locator('#lookPick option[value="saved:Test look"]')).toHaveCount(1);
    page.once('dialog', d => d.accept());
    await page.click('#deleteLook');
    await expect(page.locator('#lookPick option[value="saved:Test look"]')).toHaveCount(0);
  });
});

test.describe('the Scenes menu', () => {
  test('saving and deleting a scene', async ({ page }) => {
    await openRoom(page);
    await page.locator('#sceneMenu .popToggle').click();
    page.once('dialog', d => d.accept('Test scene'));
    await page.click('#saveScene');
    await expect(page.locator('#scenePick option[value="saved:Test scene"]')).toHaveCount(1);
    await expect(page.locator('#scenePick')).toHaveValue('saved:Test scene');   // it's the one on screen
    page.once('dialog', d => d.accept());
    await page.click('#deleteScene');
    await expect(page.locator('#scenePick option[value="saved:Test scene"]')).toHaveCount(0);
  });
});

// A walk through the menus in one go, as someone might use them, each step
// checked in the settings; then everything back as it started, which must
// give the default page's address exactly
test('a walk through the menus, and back to the start', async ({ page }) => {
  await openDrawer(page);
  const start = await hash(page);
  const step = async (what, path, value) => expect(await setting(page, path), what).toBe(value);
  expect(await optionShown(page), 'option 10, as the page opens').toBe(10);
  await step('...with a left-wall cupboard', 'T', 600);
  await page.check('input[name=islandAt][value="out"]');              // the island in the corner, against the counter
  await step('the island in the corner', 'island.at', 'out');
  await expect(page.locator('#frontBlock'), 'no dresser or larder with the island there').toBeHidden();
  await page.check('input[name=islandAt][value="room"]');             // and out there again
  await step('the island out there', 'island.at', 'room');
  await expect(page.locator('#frontBlock')).toBeVisible();
  await page.check('input[name=frontPiece][value="none"]');
  await page.check('input[name=frontPiece][value="dresser"]');
  await step('the dresser', 'frontPiece', 'dresser');
  await page.check('input[name=frontPiece][value="larder"]');
  await step('the larder', 'frontPiece', 'larder');
  await SOFA(page);
  await step('the sofa', 'sofa.key', 'merton');
  await OPTION(9)(page);
  expect(await optionShown(page), 'option 9').toBe(9);
  await expect(page.locator('#summary')).toContainText('A larder on the front wall');
  await expect(page.locator('#summary')).toContainText('A sofa facing the TV');

  // Back as it started
  await page.selectOption('#sofaPick', '');
  await page.check('input[name=frontPiece][value="dresser"]');
  await OPTION(10)(page);
  expect(await hash(page)).toBe(start);
});

test.describe('the 2D views\' door sizes and cutting list', () => {
  const PLAN = '#7-600-330-1200-3-250-780-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0-18~0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1~plan.sit-tall.90-0-0';

  test('the cutting list opens, follows the boards\' thickness, and closes', async ({ page }) => {
    await openRoom(page, PLAN);
    const list = page.locator('#cutList'), toggle = page.locator('#cutToggle');
    await expect(list).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveText('Hide cutting list');
    // Option 7 at 18: its doors are LEG - BOARD - 6 and F - LEG_D - 6 wide, H - 6 high
    await expect(list).toContainText('boards 18 thick');
    await expect(list).toContainText('2437 × 576');
    await expect(list).toContainText('2437 × 594');
    await expect(list).toContainText('16 boards');
    await expect(list).toContainText('Rear panels (against the walls) and ends run full height');   // the rule, at its head
    await expect(list).toContainText('2443 × 1200');                // the back-wall rear panel runs through the corner...
    await expect(list).toContainText('2443 × 1182');                // ...and the left-wall one stops at it
    await expect(list).toContainText('Left-wall leg front end, back-wall leg end');   // what each panel is for
    await expect(list).toContainText('Left-wall leg top, left-wall leg bottom');
    await expect(list).toContainText('Back-wall leg door');
    await slide(page, 'board', 25);
    await expect(list).toContainText('2443 × 1175');                // the left-wall rear panel, shorter
    await expect(list).toContainText('2437 × 569');                 // the back-wall leg's door, narrower
    await expect(list).toContainText('2437 × 594');                 // the left-wall leg's, not
    await toggle.click();
    await expect(list).toBeHidden();
    await expect(toggle).toHaveText('Show cutting list');
  });

  // Option 10's side bookshelf is part of its cupboard: its rear panel,
  // sides, top, bottom and five shelves are in the cutting list, sized by its
  // sliders
  test('option 10\'s side bookshelf is in the cutting list', async ({ page }) => {
    await openRoom(page, `#11-0-${PLAN.slice(PLAN.indexOf('-330-') + 1, PLAN.indexOf('~'))}-800-650-1-400-330${PLAN.slice(PLAN.indexOf('~'))}`);
    const list = page.locator('#cutList');
    await page.locator('#cutToggle').click();
    await expect(list).toContainText('2443 × 312');                 // its own side, full height, in front of its rear panel
    await expect(list).toContainText('Bookshelf side');
    await expect(list).toContainText('2443 × 400');                 // its rear panel, on from the cupboard's
    await expect(list).toContainText('382 × 312');                  // top, bottom and shelves: SIDE_W - BOARD long
    await expect(list).toContainText('Bookshelf top, bookshelf bottom');
    await expect(list).toContainText('19 boards');                 // the cupboard's 10, and the bookshelf's 9
    await toggle(page, 'sideShelfOn', false);
    await expect(list).not.toContainText('Bookshelf');
    await expect(list).toContainText('10 boards');
  });

  test('the door sizes button', async ({ page }) => {
    await openRoom(page, PLAN);
    await page.locator('#viewsMenu .popToggle').click();
    const button = page.locator('#doorDims');
    await expect(button).toHaveText('Door sizes: on');
    await button.click();
    await expect(button).toHaveText('Door sizes: off');
    await button.click();
    await expect(button).toHaveText('Door sizes: on');
  });
});
