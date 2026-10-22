// index.html: every control in the drawer and the menus, used once: it
// shows its new value, changes the settings as it should, and draws it
// without a console error (every test fails on one; helpers.js).
// room_3d.spec.js checks how saved addresses look; this checks the controls
// that set them. It runs in one browser only (playwright.config.js).
// The settings are read through window.plans.get() (setting(), by their
// paths in the configuration, as the model's config holds them), not from
// the address, so a new address format leaves these tests alone. Each test
// starts from the page as it opens (the rooms as they are) and switches on
// what it needs through the controls (REFACTOR_PLAN.md item 16).
const { test, expect, openOptions, openRoom, addressOf, readAddress, configurationOf, edited, pickOption, setting, optionShown } = require('./helpers');
const { ADDRESSES } = require('./addresses');

// A saved address's configuration (tests/configs/), with settings changed
// (as edited() takes them), seen in the plan
const saved = name => ADDRESSES.find(a => a.name === name);
const inPlan = (name, changes = {}) => addressOf(edited(saved(name).configuration, changes), saved('view-plan').view);

const hash = page => page.evaluate(() => location.hash);
// ...once it's settled: the page packs it after each change, asynchronously,
// so the last change's may not be written yet. The same twice, a moment
// apart (SETTLE_MS, chosen: longer than a write takes under load)
const SETTLE_MS = 300;
async function settledHash(page) {
  for (;;) {
    const was = await hash(page);
    await page.waitForTimeout(SETTLE_MS);
    if (await hash(page) === was) return was;
  }
}
// The things to store: whether they're shown, which packing, where (thingsToStore)
const storedHead = async page => { const { shown, packing, where } = await setting(page, 'thingsToStore'); return { shown, packing, where }; };
// The view in the address: the room, the view's id (or the camera), the eye
// height and the switches for what's shown
const view = async page => readAddress(await hash(page)).view;
const any = expect.stringMatching;

// The page with a drawer open (a room's options, as openOptions() takes
// them, the lounge's unless given, or 'other' for Other options), and every
// section in every drawer unfolded, at an address (the page as it opens
// unless given)
async function openDrawer(page, address = '', room = 'lounge') {
  await openRoom(page, address);
  if (room === 'other') await page.click('#menu');
  else await openOptions(page, room);
  await page.evaluate(() => document.querySelectorAll('.drawer details').forEach(d => { d.open = true; }));
}

// What to do first, from the page as it opens (option 16, the room as it
// is: no cupboard or bench, Billy and BillyChest on the back wall), so a
// control is on show: a cupboard; the bench, once Billy and BillyChest are
// off the back wall (they stand in its place); the dresser or a larder on
// the front wall, which a cupboard option has; a sofa
const OPTION = n => page => pickOption(page, n);
async function BENCH(page) {
  for (const id of ['billyOn', 'billyChestOn']) await toggle(page, id, false);
  await toggle(page, 'benchOn', true);
}
const onTheFrontWall = piece => async page => {
  await OPTION(10)(page);
  await page.check(`input[name=frontPiece][value="${piece}"]`);
};
const DRESSER = onTheFrontWall('dresser');
const LARDER = onTheFrontWall('larder');
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
  const before = await settledHash(page);
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
    await endsAndBack(page, 'depth', at('pieces.cornerCupboard.design.T'), { text: v => (v < 300 ? 'none' : v), setting: v => (v < 300 ? 0 : v) });
    await endsAndBack(page, 'rear', at('pieces.cornerCupboard.design.R'));
    await endsAndBack(page, 'board', at('pieces.cornerCupboard.design.BOARD'));
  });

  // Its height: at the slider's far right up to the ceiling (TOP 0), else
  // as high as it's set, the description saying so
  test('the cupboard\'s height', async ({ page }) => {
    await OPTION(7)(page);
    await endsAndBack(page, 'top', at('pieces.cornerCupboard.design.TOP'), { text: v => (v >= 2450 ? 'ceiling' : v), setting: v => (v >= 2450 ? 0 : v) });
    await slide(page, 'top', 2000);
    await expect(page.locator('#summary')).toContainText('Both legs of the L run 2000 high, from the floor');
    await expect(page.locator('#summary')).toContainText('Doors 1994 high');
  });

  test('option 7\'s sliders', async ({ page }) => {
    await OPTION(7)(page);
    await endsAndBack(page, 'leg', at('pieces.cornerCupboard.design.LEG'));
    await endsAndBack(page, 'legD', at('pieces.cornerCupboard.design.LEG_D'));
  });

  // Option 8's back-wall leg, and where its diagonal starts on each leg: a
  // straight front in from the leg's end, held so the diagonal keeps 100
  // along each wall
  test('option 8\'s sliders', async ({ page }) => {
    await OPTION(8)(page);
    await expect(page.locator('#diagBlock')).toBeVisible();
    await endsAndBack(page, 'diagRun', at('pieces.cornerCupboard.design.DIAG_RUN'));
    await endsAndBack(page, 'diagBack', at('pieces.cornerCupboard.design.DIAG_BACK'), { text: v => Math.min(v, 600), setting: v => Math.min(v, 600) });
    await endsAndBack(page, 'diagLeft', at('pieces.cornerCupboard.design.DIAG_LEFT'), { text: v => Math.min(v, 770), setting: v => Math.min(v, 770) });
    await slide(page, 'diagLeft', 400);
    await slide(page, 'diagBack', 300);
    await expect(page.locator('#summary')).toContainText('Its front runs straight 400 in from the left-wall leg\'s end (a 394 door) and 300 in from the back-wall leg\'s end (a 276 door)');
    await expect(page.locator('#tallBlock')).toBeVisible();                // the left-wall leg's door
    await OPTION(7)(page);
    await expect(page.locator('#diagBlock')).toBeHidden();
  });

  test('option 9\'s sliders', async ({ page }) => {
    await OPTION(9)(page);
    await endsAndBack(page, 'ward', at('pieces.cornerCupboard.design.WARD'));
    await endsAndBack(page, 'wardD', at('pieces.cornerCupboard.design.WARD_D'));
    await endsAndBack(page, 'tower', at('pieces.cornerCupboard.design.TOWER'));
  });

  // Their depth replaces the left-wall cupboard front's radio buttons. At its
  // lowest (0) the cupboard is too shallow to build, and isn't drawn
  test('options 10 and 11\'s corner cupboard width and depth', async ({ page }) => {
    for (const n of [10, 11]) {
      await OPTION(n)(page);
      await expect(page.locator('#leftLenBlock')).toBeHidden();
      await endsAndBack(page, 'cornerW', at('pieces.cornerCupboard.design.CORNER_W'));
      await endsAndBack(page, 'cornerD', at('pieces.cornerCupboard.design.CORNER_D'));
      await slide(page, 'cornerD', 0);
      await expect(page.locator('#summary')).toContainText('too shallow to build');
      await slide(page, 'cornerD', 1200);
    }
    await OPTION(9)(page);
    await expect(page.locator('#leftLenBlock')).toBeVisible();
  });

  // Only option 10 has it: option 11's doors open where it would stand. Off,
  // its sliders are hidden; on, it takes the bench's start along by its width
  test('option 10\'s side bookshelf', async ({ page }) => {
    await BENCH(page);
    await OPTION(10)(page);
    await expect(page.locator('#sideShelfDetails')).toBeHidden();
    await toggle(page, 'sideShelfOn', true);
    await expect.poll(() => setting(page, 'pieces.cornerCupboard.design.SIDE_SHELF')).toBe(true);
    await expect(page.locator('#summary')).toContainText('Bench 2638, from x = 1200');
    await endsAndBack(page, 'sideW', at('pieces.cornerCupboard.design.SIDE_W'));
    await endsAndBack(page, 'sideD', at('pieces.cornerCupboard.design.SIDE_D'));
    await toggle(page, 'sideShelfOn', false);
    await expect.poll(() => setting(page, 'pieces.cornerCupboard.design.SIDE_SHELF')).toBe(false);
    await expect(page.locator('#summary')).toContainText('Bench 3038, from x = 800');
    await OPTION(11)(page);
    await expect(page.locator('#sideShelfBlock')).toBeHidden();
  });

  // Only option 10 has it, on its side facing the windows, where the side
  // is clear of the bench (option 11's doors are there). Off, its sliders
  // and how it's shown are hidden; on, it's folded away or down, ready to use
  test('option 10\'s fold-down desk', async ({ page }) => {
    await OPTION(10)(page);
    await slide(page, 'cornerD', 1150);                          // 820 of side clear of the 330-deep bench
    await expect(page.locator('#deskDetails')).toBeHidden();
    await expect(page.locator('#deskDoorBlock')).toBeHidden();
    await toggle(page, 'deskOn', true);
    await expect.poll(() => setting(page, 'pieces.cornerCupboard.design.DESK')).toBe(true);
    await expect(page.locator('#summary')).toContainText('a fold-down desk 780 wide and 500 deep');
    await endsAndBack(page, 'deskW', at('pieces.cornerCupboard.design.DESK_W'));
    await endsAndBack(page, 'deskD', at('pieces.cornerCupboard.design.DESK_D'));
    await endsAndBack(page, 'deskH', at('pieces.cornerCupboard.design.DESK_H'));
    await expect(page.locator('#deskFolded')).toBeChecked();
    await toggle(page, 'deskDown', true);
    await expect.poll(() => setting(page, 'doors.desk')).toBe(90);   // its angle, level
    await toggle(page, 'deskFolded', true);
    await expect.poll(() => setting(page, 'doors.desk')).toBe(0);    // upright
    await toggle(page, 'deskOn', false);
    await expect(page.locator('#deskDoorBlock')).toBeHidden();
    await expect(page.locator('#summary')).not.toContainText('fold-down desk');
    await OPTION(11)(page);
    await expect(page.locator('#deskBlock')).toBeHidden();
  });

  test('the bench', async ({ page }) => {
    await BENCH(page);
    await endsAndBack(page, 'shelfDepth', at('pieces.aboveBench.design.shelfDepth'));
    const TV = { 0: [32, '32" (720 × 440)'], 14: [86, '86" (1930 × 1110)'] };   // the ends of TV_SIZES
    await endsAndBack(page, 'tvSize', at('pieces.aboveBench.design.tv'), { text: v => TV[v][1], setting: v => TV[v][0] });
  });

  test('the dresser', async ({ page }) => {
    await DRESSER(page);
    await endsAndBack(page, 'dresserW', at('pieces.dresser.design.w'));
    await endsAndBack(page, 'dresserH', at('pieces.dresser.design.h'));
    await endsAndBack(page, 'dresserBaseH', at('pieces.dresser.design.baseH'));
    // Its upper part is never deeper than its base (420)
    await endsAndBack(page, 'dresserUpperD', at('pieces.dresser.design.upperD'), { text: v => Math.min(v, 420), setting: v => Math.min(v, 420) });
    // ...so a shallower base takes the upper part (420) with it, and it stays there
    await endsAndBack(page, 'dresserBaseD', at('pieces.dresser.design.baseD'), { back: false });
    expect(await setting(page, 'pieces.dresser.design.upperD')).toBe(300);
  });

  test('the larder', async ({ page }) => {
    await LARDER(page);
    await endsAndBack(page, 'larderW', at('pieces.larder.design.w'));
    await endsAndBack(page, 'larderH', at('pieces.larder.design.h'));
    await endsAndBack(page, 'larderD', at('pieces.larder.design.d'));
  });

  test('the sofa', async ({ page }) => {
    await SOFA(page);
    await endsAndBack(page, 'sofaFront', at('pieces.sofa.in.livingRoom.front'));
    await endsAndBack(page, 'sofaW', at('pieces.sofa.design.w'));
    await endsAndBack(page, 'sofaD', at('pieces.sofa.design.d'));
    await endsAndBack(page, 'sofaH', at('pieces.sofa.design.h'));
  });

  test('the island, out there', async ({ page }) => {
    await endsAndBack(page, 'islandX', at('pieces.island.in.livingRoom.x'));
    // It starts at 3571 (measured), between the slider's steps of 5, so the
    // slider can't take it back there exactly
    await endsAndBack(page, 'islandY', at('pieces.island.in.livingRoom.y'), { back: false });
    await endsAndBack(page, 'islandTurn', at('pieces.island.in.livingRoom.turn'), { text: v => `${v}°` });
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
    await BENCH(page);
    const before = await settledHash(page);
    await page.check('input[name=bench][value="900"]');
    expect(await setting(page, 'pieces.bench.design.height')).toBe(900);
    await page.check('input[name=bench][value="780"]');
    expect(await hash(page)).toBe(before);
  });

  // Its length out from the back wall, 1000 up to the room door's frame
  test('the left-wall cupboard\'s length', async ({ page }) => {
    await OPTION(7)(page);                                       // option 10, as the page opens, has its own depth instead
    await endsAndBack(page, 'leftLen', at('pieces.cornerCupboard.design.F'));
  });

  test('where the island is', async ({ page }) => {
    const before = await hash(page);
    for (const value of ['along', 'out', 'none', 'room']) {
      await page.check(`input[name=islandAt][value="${value}"]`);
      expect(await setting(page, 'pieces.island.in.livingRoom.at')).toBe(value);
    }
    expect(await hash(page)).toBe(before);
  });

  test('what\'s on the front wall', async ({ page }) => {
    await OPTION(10)(page);                                      // the room as it is has nothing there
    const before = await settledHash(page);
    for (const value of ['larder', 'dresser', 'none']) {
      await page.check(`input[name=frontPiece][value="${value}"]`);
      expect(await setting(page, 'livingRoom.frontWall')).toBe(value);
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
    await openOptions(page, 'bedroom');                          // the carpet's in Bedroom options
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
    expect(await setting(page, 'colours.shelves')).toBe(2);
    await expect(page.locator('#shelfSwatch')).toHaveCSS('background-color', 'rgb(138, 90, 51)');      // #8A5A33
  });

  test('the colours in this view', async ({ page }) => {
    await page.selectOption('#shelfWood', '3');
    await page.click('#menu');                                   // they're in Other options
    await expect(page.locator('#paletteList .colrow').first()).toBeVisible();
    await expect(page.locator('#paletteList')).toContainText('Walnut');
  });

  test('the dresser: a listed one, then Custom once a slider moves', async ({ page }) => {
    await DRESSER(page);
    await page.selectOption('#dresserPick', 'inglesham');
    expect(await setting(page, 'pieces.dresser.design')).toMatchObject({ w: 1000, h: 1930, baseD: 420, baseH: 830, upperD: 420 });
    await expect(page.locator('#dresserWValue')).toHaveText('1000');
    await slide(page, 'dresserW', 1100);
    await expect(page.locator('#dresserPick')).toHaveValue('');           // Custom
  });

  test('the larder: a listed one, then Custom once a slider moves', async ({ page }) => {
    await LARDER(page);
    await page.selectOption('#larderPick', 'stow');
    expect(await setting(page, 'pieces.larder.design.model')).toBe('stow');
    expect(await setting(page, 'pieces.larder.design.w')).toBe(670);
    await expect(page.locator('#larderWValue')).toHaveText('670');
    await slide(page, 'larderW', 700);
    await expect(page.locator('#larderPick')).toHaveValue('');            // Custom
  });

  test('the sofa: one, then none', async ({ page }) => {
    await page.selectOption('#sofaPick', 'none');                         // the Drift, as the page opens
    await expect(page.locator('#sofaFrontBlock')).toBeHidden();
    await SOFA(page);
    expect(await setting(page, 'pieces.sofa.design.model')).toBe('merton');
    await expect(page.locator('#sofaFrontBlock')).toBeVisible();
    await slide(page, 'sofaW', 2000);
    await expect(page.locator('#sofaPick')).toHaveValue('custom');
    await page.selectOption('#sofaPick', 'none');
    expect(await setting(page, 'pieces.sofa.design.model')).toBe('none');
    await expect(page.locator('#sofaFrontBlock')).toBeHidden();
  });
});

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

test.describe('switches and buttons', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('see-through cupboards', async ({ page }) => {
    await page.click('#xray');
    await expect(page.locator('#xray')).toBeChecked();
    await page.click('#xray');
    await expect(page.locator('#xray')).not.toBeChecked();
  });

  test('cupboard only, in 3D and in the plan', async ({ page }) => {
    await page.locator('#cupboardOnly').check();
    await page.click('#loungeClose');
    await page.selectOption('#loungeViewKind', 'plan');
    await expect(page.locator('#dims')).toHaveText('Dimensions: on');
    await openOptions(page);
    await page.locator('#cupboardOnly').uncheck();
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
    await expect(page.locator('#shoeRack_door')).toContainText('opens to 65.5°');  // the door stops on its corner
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

// The views are in each room button's ▾ (the Views menu went, 21 Oct 2026:
// VIEWS_MENU.md); the Look menu has Where, Looking at, eye height and looks
test.describe('the room buttons\' views and the Look menu', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });
  // The Look menu open, if it isn't
  const openLook = async page => {
    if (!(await page.locator('#viewGroup').isVisible())) await page.locator('#viewMenu .popToggle').click();
  };

  // A room's own view, another room's wall in 2D, and downstairs under the hallway's
  test('a view from a room\'s list', async ({ page }) => {
    await page.selectOption('#loungeViewKind', 'desk');
    await expect.poll(() => view(page)).toMatchObject({ room: 'livingRoom', view: 'desk' });
    await page.selectOption('#bedroomViewKind', 'front');
    await expect.poll(() => view(page)).toMatchObject({ room: 'bedroom', view: 'front' });
    await expect(page.locator('#dims')).toHaveText('Dimensions: on');
    await page.selectOption('#hallwayViewKind', 'downstairs/plan');
    await expect.poll(() => view(page)).toMatchObject({ room: 'downstairs', view: 'plan' });
    await page.selectOption('#garageViewKind', 'garageFromAbove');
    await expect.poll(() => view(page)).toMatchObject({ room: 'garage', view: 'garageFromAbove' });
  });

  // Each room button's ▾, in full, with nothing saved on the device: its
  // headings and choices (roomViewChoices() in living_room.js), as
  // VIEWS_MENU.md has them; and every choice goes to its room and view
  test('each room button\'s ▾ lists its views, and each one goes there', async ({ page }) => {
    const whole = [['birdseye', "Bird's eye"], ['plan', 'Plan (2D)']];
    const LISTS = {
      lounge: [['Whole room', whole],
        ['Walls', [['back', 'Back wall, the TV (2D)'], ['left', 'Left wall, the door (2D)'], ['front', 'Front wall, the kitchen (2D)'], ['right', 'Right wall, the windows (2D)']]],
        ['Views', [['desk', 'Seated'], ['kitchen', 'Kitchen'], ['window', 'Window'], ['door', 'Door'], ['packing', 'Packing']]]],
      bedroom: [['Whole room', whole],
        ['Walls', [['back', 'Hallway wall (2D)'], ['front', 'Chimney breast (2D)'], ['left', 'Window wall (2D)'], ['right', 'Kitchen-side wall (2D)']]]],
      garage: [['Whole room', whole],
        ['Walls', [['left', 'Back wall (2D)'], ['right', 'Door (2D)'], ['back', 'Right-hand wall, going in (2D)'], ['front', 'Left-hand wall, going in (2D)']]],
        ['Views', [['garageFromAbove', 'Garage from above']]]],
      hallway: [['Whole room', whole],
        ['Walls', [['back', "Stairs' outside wall (2D)"], ['front', 'Bedroom side (2D)'], ['right', 'Lounge door wall (2D)'], ['left', 'WC wall (2D)']]],
        ['Views', [['stairsSide', 'Stairs from the side']]],
        ['Downstairs: whole room', whole.map(([id, label]) => [`downstairs/${id}`, label])],
        ['Downstairs: views', [['downstairs/footFromAbove', 'Foot of the stairs']]]],
    };
    // The button's room: the lounge's is the living room
    const ROOM_OF = { lounge: 'livingRoom', bedroom: 'bedroom', garage: 'garage', hallway: 'hallway' };
    for (const [button, list] of Object.entries(LISTS)) {
      const kind = page.locator(`#${button}ViewKind`);
      expect(await kind.evaluate(s => [...s.querySelectorAll('optgroup')].map(g => [g.label, [...g.children].map(o => [o.value, o.textContent])])), `${button}'s ▾`).toEqual(list);
      for (const [, choices] of list) {
        for (const [value] of choices) {
          await kind.selectOption(value);
          const [room, id] = value.includes('/') ? value.split('/') : [ROOM_OF[button], value];
          expect(await page.evaluate(() => (({ room, view }) => ({ room, view }))(window.plans.viewSnapshot())), `${button}'s ▾: ${value}`).toEqual({ room, view: id });
        }
      }
    }
  });

  test('where you are, what you look at, and eye height', async ({ page }) => {
    await openLook(page);
    await page.selectOption('#where', 'island');
    await expect.poll(() => view(page)).toMatchObject({ view: any(/^look:island:/) });
    await page.selectOption('#lookAt', 'tv');
    await expect.poll(() => view(page)).toMatchObject({ view: 'look:island:tv' });
    await page.selectOption('#eye', 'stand-short');
    await expect.poll(() => view(page)).toMatchObject({ eye: 'stand-short' });
  });

  // The rooms, from their buttons: Where and Looking at offer only the
  // room's places and things, and the address's view has the room.
  test('choosing the room', async ({ page }) => {
    const options = id => page.locator(`#${id} option`).evaluateAll(os => os.filter(o => o.value).map(o => o.textContent));
    await page.selectOption('#bedroomViewKind', 'birdseye');
    await expect.poll(() => view(page)).toMatchObject({ room: 'bedroom', view: 'birdseye' });
    await openLook(page);
    expect(await options('where')).toEqual(['In the bedroom doorway, walking in', 'Lying on the bed', 'Standing beside the bed', 'Standing at the bedroom window']);
    expect(await options('lookAt')).toEqual(['Looking at the cupboards in the recess', 'Looking at the bookcase', 'Looking at the wardrobe', 'Looking at Billy', 'Looking at BillyChest', 'Looking at the Ivar', 'Looking at the bedside table by the bed', 'Looking at the bedside table by the wardrobe', 'Looking at the Kvistbro', 'Looking at the laundry basket', 'Looking at the new cupboard', 'Looking at the wicker bench', 'Looking at the window', 'Looking at the bed', 'Looking at the mirror']);
    await page.selectOption('#where', 'bed');
    await expect.poll(() => view(page)).toMatchObject({ room: 'bedroom', view: any(/^look:bed:\w+$/), eye: 'lie-tall' });
    await page.selectOption('#hallwayViewKind', 'plan');
    await expect.poll(() => view(page)).toMatchObject({ room: 'hallway', view: 'plan' });
    await page.selectOption('#loungeViewKind', 'plan');
    await expect.poll(() => view(page)).toMatchObject({ room: 'livingRoom', view: 'plan' });
    // Downstairs, under the hallway's button: its plan, and a place on the first floor's level
    await page.selectOption('#hallwayViewKind', 'downstairs/plan');
    await expect.poll(() => view(page)).toMatchObject({ room: 'downstairs', view: 'plan' });
    await openLook(page);
    expect(await options('where')).toEqual(['Halfway down the stairs', 'At bottom of stairs', 'Outside internal door', 'Outside external door']);
    // Halfway down, looking on down: the foot, its window and the internal door
    await page.selectOption('#where', 'stairsHalfway');
    await expect.poll(() => view(page)).toMatchObject({ room: 'downstairs', view: any(/^look:stairsHalfway:\w+$/), eye: 'stand-tall' });
    const offered = () => page.locator('#lookAt option').evaluateAll(os => os.filter(o => o.value && !o.disabled).map(o => o.textContent));
    expect(await offered()).toEqual(['Looking at the foot of the stairs', 'Looking at the window at the foot of the stairs', 'Looking at the internal door', 'Looking at the shoe rack']);
    await page.selectOption('#where', 'outsideFlatDoor');
    await expect.poll(() => view(page)).toMatchObject({ room: 'downstairs', view: any(/^look:outsideFlatDoor:\w+$/), eye: 'stand-tall' });
    // The garage: Looking in and Looking out, each not offering the wall you stand at
    await page.selectOption('#garageViewKind', 'birdseye');
    await expect.poll(() => view(page)).toMatchObject({ room: 'garage', view: 'birdseye' });
    await openLook(page);
    expect(await options('where')).toEqual(['Looking in', 'Looking out', 'Looking in from outside']);
    await page.selectOption('#where', 'garageLookingIn');
    await expect.poll(() => view(page)).toMatchObject({ room: 'garage', view: 'look:garageLookingIn:sean', eye: 'stand-tall' });
    const garageThings = ['Looking at Sean', 'Looking at Billy', 'Looking at BillyChest', 'Looking at Metal', 'Looking at Yellow', 'Looking at the scaffold bench', 'Looking at Small Billy', 'Looking at Potters', 'Looking at Biltong', 'Looking at Trellis', 'Looking at the pine cupboard', 'Looking at the Ivar'];
    expect(await offered()).toEqual([...garageThings, 'Looking at the back wall']);
    await page.selectOption('#where', 'garageLookingOut');
    expect(await offered()).toEqual([...garageThings, 'Looking at the entrance']);
    await page.selectOption('#where', 'garageOutside');
    await expect.poll(() => view(page)).toMatchObject({ room: 'garage', view: any(/^look:garageOutside:\w+$/), eye: 'stand-tall' });
  });

  // Saved in the Look menu, listed in its room's ▾
  test('saving and deleting a view', async ({ page }) => {
    await openLook(page);
    page.once('dialog', d => d.accept('Test view'));
    await page.click('#saveView');
    await expect(page.locator('#loungeViewKind option[value="saved:Test view"]')).toHaveCount(1);
    await expect(page.locator('#bedroomViewKind option[value="saved:Test view"]')).toHaveCount(0);
    await expect(page.locator('#deleteView')).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.click('#deleteView');
    await expect(page.locator('#loungeViewKind option[value="saved:Test view"]')).toHaveCount(0);
  });

  // Greyed out till there's a look to save, saying why (UI_CRITIQUE.md, step 9)
  test('saving and deleting a look', async ({ page }) => {
    await openLook(page);
    await expect(page.locator('#saveLook')).toBeDisabled();
    await expect(page.locator('#saveLook')).toHaveAttribute('title', /^Choose Where you are and Looking at first/);
    await page.selectOption('#where', 'window2');
    await expect(page.locator('#saveLook')).toHaveAttribute('title', /^Keep this Where/);
    page.once('dialog', d => d.accept('Test look'));
    await page.click('#saveLook');
    await expect(page.locator('#lookPick option[value="saved:Test look"]')).toHaveCount(1);
    page.once('dialog', d => d.accept());
    await page.click('#deleteLook');
    await expect(page.locator('#lookPick option[value="saved:Test look"]')).toHaveCount(0);
  });
});

test.describe('the Configuration menu', () => {
  test('saving and deleting a configuration', async ({ page }) => {
    await openRoom(page);
    await page.locator('#configurationMenu .popToggle').click();
    page.once('dialog', d => d.accept('Test configuration'));
    await page.click('#saveConfiguration');
    await expect(page.locator('#configurationPick option[value="saved:Test configuration"]')).toHaveCount(1);
    await expect(page.locator('#configurationPick')).toHaveValue('saved:Test configuration');   // it's the one on screen
    page.once('dialog', d => d.accept());
    await page.click('#deleteConfiguration');
    await expect(page.locator('#configurationPick option[value="saved:Test configuration"]')).toHaveCount(0);
  });

  // Those saved when the list was Scenes come across, under the new key
  test('scenes saved before are kept as configurations', async ({ page }) => {
    await openRoom(page);
    const configuration = await configurationOf(page);
    await page.evaluate(c => {
      localStorage.removeItem('room_3d:savedConfigurations');
      localStorage.setItem('room_3d:savedScenes', JSON.stringify([{ name: 'Old scene', configuration: c }]));
    }, configuration);
    await page.reload();
    await expect(page.locator('#configurationPick option[value="saved:Old scene"]')).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem('room_3d:savedScenes'))).toBeNull();
  });
});

// A walk through the menus in one go, as someone might use them, each step
// checked in the settings; then everything back as it started, which must
// give the default page's address exactly
test('a walk through the menus, and back to the start', async ({ page }) => {
  await openDrawer(page);
  const start = await hash(page);
  const step = async (what, path, value) => expect(await setting(page, path), what).toBe(value);
  expect(await optionShown(page), 'option 16, the room as it is, as the page opens').toBe(16);
  await OPTION(10)(page);
  await step('...with a left-wall cupboard', 'pieces.cornerCupboard.design.T', 600);
  await page.check('input[name=islandAt][value="out"]');              // the island in the corner, against the counter
  await step('the island in the corner', 'pieces.island.in.livingRoom.at', 'out');
  await expect(page.locator('#frontBlock'), 'no dresser or larder with the island there').toBeHidden();
  await page.check('input[name=islandAt][value="room"]');             // and out there again
  await step('the island out there', 'pieces.island.in.livingRoom.at', 'room');
  await expect(page.locator('#frontBlock')).toBeVisible();
  await page.check('input[name=frontPiece][value="none"]');
  await page.check('input[name=frontPiece][value="dresser"]');
  await step('the dresser', 'livingRoom.frontWall', 'dresser');
  await page.check('input[name=frontPiece][value="larder"]');
  await step('the larder', 'livingRoom.frontWall', 'larder');
  await SOFA(page);
  await step('the sofa', 'pieces.sofa.design.model', 'merton');
  await OPTION(9)(page);
  expect(await optionShown(page), 'option 9').toBe(9);
  await expect(page.locator('#summary')).toContainText('A larder on the front wall');
  await expect(page.locator('#summary')).toContainText('A sofa, the Merton 2 Seater');   // where the Drift stands now, by Billy

  // Back as it started: the Drift, nothing on the front wall, the room as it is
  await page.selectOption('#sofaPick', 'drift');
  await page.check('input[name=frontPiece][value="none"]');
  await OPTION(16)(page);
  expect(await settledHash(page)).toBe(start);
});

// The cutting list is in Lounge options (the bedroom cupboard's in Bedroom
// options), folded away till opened
test.describe('the 2D views\' door sizes, and the cutting list', () => {
  const PLAN = inPlan('option07');                             // option 7, in the plan

  test('the cutting list opens, follows the boards\' thickness, and closes', async ({ page }) => {
    await openRoom(page, PLAN);
    await openOptions(page);
    const list = page.locator('#loungeCutList'), toggle = page.locator('#loungeCutting summary');
    await expect(list).toBeHidden();
    await toggle.click();
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
  });

  // Option 10's side bookshelf is part of its cupboard: its rear panel,
  // sides, top, bottom and five shelves are in the cutting list, sized by its
  // sliders
  test('option 10\'s side bookshelf is in the cutting list', async ({ page }) => {
    await openRoom(page, inPlan('option10', { 'pieces.cornerCupboard.design.SIDE_SHELF': true }));
    await openOptions(page);
    const list = page.locator('#loungeCutList');
    await page.locator('#loungeCutting summary').click();
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
    const button = page.locator('#doorDims');                    // on show in a 2D view, at the bottom right
    await expect(button).toHaveText('Door sizes: on');
    await button.click();
    await expect(button).toHaveText('Door sizes: off');
    await button.click();
    await expect(button).toHaveText('Door sizes: on');
  });
});
