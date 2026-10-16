// index.html: every control in the drawer and the menus, used once: it
// shows its new value, puts it in the address, and draws it without a
// console error (every test fails on one; helpers.js). room_3d.spec.js
// checks how saved addresses look; this checks the controls that set them.
// It runs in one browser only (playwright.config.js).
// The address's fields, by number, are ADDRESS in living_room.js.
const { test, expect, openRoom, pickOption, settingsField } = require('./helpers');

const hash = page => page.evaluate(() => location.hash);
const field = async (page, k) => settingsField(await hash(page), k);
// One part of a field made of parts, as the dresser's sizes w.h.baseD.baseH.upperD
const fieldPart = async (page, k, j) => (await field(page, k)).split('.')[j];
// The things to store: shown.packing.where, then x.y.turned(.z) for each
const stored = async page => (await hash(page)).split('~')[1].split('_');
// The view: its id, eye height, and the doors' angles (room, left-wall cupboard, option's own)
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

// Where a slider's value goes in the address: field k (or part j of it)
const at = (k, j = null) => async page => (j === null ? field(page, k) : fieldPart(page, k, j));
// ...or for the doors, in the view's part: room door, left-wall cupboard's, option's own
const door = k => async page => (await view(page)).split('.').pop().split('-')[k];

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
// started. At each end its readout and its place in the address follow the
// value it lands on (text(v), address(v)); back where it started, the whole
// address must be as it was, so it changed nothing else. `back: false` for
// a slider that can't get back exactly (see where it's used).
async function endsAndBack(page, id, place, { text = v => v, address = v => v, back = true } = {}) {
  const before = await hash(page);
  const { min, max, value: start } = await page.locator(`#${id}`).evaluate(el => ({ min: el.min, max: el.max, value: el.value }));
  for (const [end, value] of [['lowest', min], ['highest', max]]) {
    const v = await slide(page, id, value);
    expect(await readout(page, id), `${id} at its ${end}`).toBe(String(text(v)));
    // (the doors write theirs a moment later)
    await expect.poll(() => place(page), `${id} at its ${end}, in the address`).toBe(String(address(v)));
  }
  await slide(page, id, start);
  if (back) await expect.poll(() => hash(page), `the address with ${id} back where it started`).toBe(before);
}

test.describe('sliders, to each end and back', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('the corner cupboard\'s sizes', async ({ page }) => {
    await OPTION(7)(page);                                       // for the left-wall depth slider
    await endsAndBack(page, 'depth', at(1), { text: v => (v < 300 ? 'none' : v), address: v => (v < 300 ? 0 : v) });
    await endsAndBack(page, 'rear', at(2));
    await endsAndBack(page, 'board', at(31));
  });

  test('option 7\'s sliders', async ({ page }) => {
    await OPTION(7)(page);
    await endsAndBack(page, 'leg', at(7));
    await endsAndBack(page, 'legD', at(27));
  });

  test('option 9\'s sliders', async ({ page }) => {
    await OPTION(9)(page);
    await endsAndBack(page, 'ward', at(8));
    await endsAndBack(page, 'wardD', at(10));
    await endsAndBack(page, 'tower', at(9));
  });

  // Their depth replaces the left-wall cupboard front's radio buttons. At its
  // lowest (0) the cupboard is too shallow to build, and isn't drawn
  test('options 10 and 11\'s corner cupboard width and depth', async ({ page }) => {
    for (const n of [10, 11]) {
      await OPTION(n)(page);
      await expect(page.locator('#front')).toBeHidden();
      await endsAndBack(page, 'cornerW', at(32));
      await endsAndBack(page, 'cornerD', at(33));
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
    await expect.poll(() => field(page, 34)).toBe('1');
    await expect(page.locator('#summary')).toContainText('Bench 2638, from x = 1200');
    await endsAndBack(page, 'sideW', at(35));
    await endsAndBack(page, 'sideD', at(36));
    await toggle(page, 'sideShelfOn', false);
    await expect.poll(() => field(page, 34)).toBe('0');
    await expect(page.locator('#summary')).toContainText('Bench 3038, from x = 800');
    await OPTION(11)(page);
    await expect(page.locator('#sideShelfBlock')).toBeHidden();
  });

  test('the bench', async ({ page }) => {
    await endsAndBack(page, 'shelfDepth', at(5));
    const TV = { 0: [32, '32" (720 × 440)'], 14: [86, '86" (1930 × 1110)'] };   // the ends of TV_SIZES
    await endsAndBack(page, 'tvSize', at(16), { text: v => TV[v][1], address: v => TV[v][0] });
  });

  test('the dresser', async ({ page }) => {
    await endsAndBack(page, 'dresserW', at(18, 0));
    await endsAndBack(page, 'dresserH', at(18, 1));
    await endsAndBack(page, 'dresserBaseH', at(18, 3));
    // Its upper part is never deeper than its base (420)
    await endsAndBack(page, 'dresserUpperD', at(18, 4), { text: v => Math.min(v, 420), address: v => Math.min(v, 420) });
    // ...so a shallower base takes the upper part (420) with it, and it stays there
    await endsAndBack(page, 'dresserBaseD', at(18, 2), { back: false });
    expect(await fieldPart(page, 18, 4)).toBe('300');
  });

  test('the larder', async ({ page }) => {
    await LARDER(page);
    await endsAndBack(page, 'larderW', at(24, 0));
    await endsAndBack(page, 'larderH', at(24, 1));
    await endsAndBack(page, 'larderD', at(24, 2));
  });

  test('the sofa', async ({ page }) => {
    await SOFA(page);
    await endsAndBack(page, 'sofaFront', at(23));
    await endsAndBack(page, 'sofaW', at(25, 0));
    await endsAndBack(page, 'sofaD', at(25, 1));
    await endsAndBack(page, 'sofaH', at(25, 2));
  });

  test('the island, out there', async ({ page }) => {
    await endsAndBack(page, 'islandX', at(30, 0));
    // It starts at 3571 (measured), between the slider's steps of 5, so the
    // slider can't take it back there exactly
    await endsAndBack(page, 'islandY', at(30, 1), { back: false });
    await endsAndBack(page, 'islandTurn', at(30, 2), { text: v => `${v}°` });
  });

  // The doors turn without rebuilding
  test('the doors', async ({ page }) => {
    await LEFT_CUPBOARD(page);                                         // so the left-wall cupboard has a door
    for (const [id, k] of [['roomDoor', 0], ['tallDoor', 1], ['secondDoor', 2], ['bedroomDoor', 3], ['flatDoor', 4], ['outsideDoor', 5]]) await endsAndBack(page, id, door(k), { text: v => `${v}°` });
  });
});

test.describe('radio buttons', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('bench height', async ({ page }) => {
    const before = await hash(page);
    await page.check('input[name=bench][value="900"]');
    expect(await field(page, 6)).toBe('900');
    await page.check('input[name=bench][value="780"]');
    expect(await hash(page)).toBe(before);
  });

  test('the left-wall cupboard\'s front', async ({ page }) => {
    await page.click('#cupMenu');
    await OPTION(7)(page);                                       // option 10, as the page opens, has its own depth instead
    const before = await hash(page);
    await page.check('input[name=front][value="1329"]');
    expect(await field(page, 3)).toBe('1329');
    await page.check('input[name=front][value="1200"]');
    expect(await hash(page)).toBe(before);
  });

  test('where the island is', async ({ page }) => {
    const before = await hash(page);
    for (const [value, code] of [['along', '1'], ['out', '2'], ['none', '3'], ['room', '0']]) {
      await page.check(`input[name=islandAt][value="${value}"]`);
      expect(await field(page, 21)).toBe(code);
    }
    expect(await hash(page)).toBe(before);
  });

  test('what\'s on the front wall', async ({ page }) => {
    const before = await hash(page);
    for (const [value, code] of [['larder', '1'], ['none', '2'], ['dresser', '0']]) {
      await page.check(`input[name=frontPiece][value="${value}"]`);
      expect(await field(page, 19)).toBe(code);
    }
    expect(await hash(page)).toBe(before);
  });
});

test.describe('dropdowns', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('the cupboard colour, ◀ ▶, and other colours', async ({ page }) => {
    await page.selectOption('#ral-cupboard', '5');
    expect(await field(page, 12)).toBe('5');
    await expect(page.locator('#cupboardSwatch')).toHaveCSS('background-color', 'rgb(245, 244, 239)');   // #F5F4EF
    // ◀ ▶ step through the named colours: from AI Olive (4) on to Bella Brittany (6)
    await page.selectOption('#ral-cupboard', '4');
    await page.click('#colNext');
    expect(await field(page, 12)).toBe('6');
    await page.click('#colPrev');
    expect(await field(page, 12)).toBe('4');
    // Other colours: any RAL colour, from a second dropdown
    await expect(page.locator('#otherRow')).toBeHidden();
    await page.selectOption('#ral-cupboard', 'other');
    await expect(page.locator('#otherRow')).toBeVisible();
    await page.selectOption('#ral-other', '7016');
    expect(await field(page, 12)).toBe('7016');
  });

  test('the dresser colour, ◀ ▶, and other colours', async ({ page }) => {
    await page.selectOption('#ral-dresser', '6');
    expect(await field(page, 17)).toBe('6');
    await page.click('#dresserNext');
    expect(await field(page, 17)).toBe('7');
    await page.click('#dresserPrev');
    expect(await field(page, 17)).toBe('6');
    await page.selectOption('#ral-dresser', 'other');
    await expect(page.locator('#dresserOtherRow')).toBeVisible();
    await page.selectOption('#ral-dresser-other', '5014');
    expect(await field(page, 17)).toBe('5014');
  });

  // The carpet (bedroom and stairs), field 54: from the doorway photo (0),
  // the first photos' colour lighter (13), as it was (12), Dormouse's
  // swatch (11), or any RAL colour
  test('the carpet colour, ◀ ▶, and other colours', async ({ page }) => {
    expect(await field(page, 54)).toBe('0');
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(181, 164, 153)');   // #B5A499, from the doorway photo
    await page.click('#carpetNext');
    expect(await field(page, 54)).toBe('13');
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(171, 165, 160)');   // #ABA5A0, the photos' colour, lighter
    await page.click('#carpetNext');
    expect(await field(page, 54)).toBe('12');
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(143, 135, 128)');   // #8F8780, from the photos
    await page.click('#carpetNext');
    expect(await field(page, 54)).toBe('11');
    await expect(page.locator('#carpetSwatch')).toHaveCSS('background-color', 'rgb(162, 144, 124)');   // #A2907C, Dormouse
    await page.click('#carpetPrev');
    await page.click('#carpetPrev');
    await page.click('#carpetPrev');
    expect(await field(page, 54)).toBe('0');
    await page.selectOption('#ral-carpet', 'other');
    await expect(page.locator('#carpetOtherRow')).toBeVisible();
    await page.selectOption('#ral-carpet-other', '7035');
    expect(await field(page, 54)).toBe('7035');
  });

  test('the shelf wood', async ({ page }) => {
    await page.selectOption('#shelfWood', '2');
    expect(await field(page, 15)).toBe('2');
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
    expect(await field(page, 18)).toBe('1000.1930.420.830.420');
    await expect(page.locator('#dresserWValue')).toHaveText('1000');
    await slide(page, 'dresserW', 1100);
    await expect(page.locator('#dresserPick')).toHaveValue('');           // Custom
  });

  test('the larder: a listed one, then Custom once a slider moves', async ({ page }) => {
    await LARDER(page);
    await page.selectOption('#larderPick', 'stow');
    expect(await field(page, 20)).toBe('stow');
    expect(await fieldPart(page, 24, 0)).toBe('670');
    await expect(page.locator('#larderWValue')).toHaveText('670');
    await slide(page, 'larderW', 700);
    await expect(page.locator('#larderPick')).toHaveValue('');            // Custom
  });

  test('the sofa: one, then none', async ({ page }) => {
    await expect(page.locator('#sofaFrontBlock')).toBeHidden();
    await SOFA(page);
    expect(await field(page, 22)).toBe('merton');
    await expect(page.locator('#sofaFrontBlock')).toBeVisible();
    await slide(page, 'sofaW', 2000);
    await expect(page.locator('#sofaPick')).toHaveValue('custom');
    await page.selectOption('#sofaPick', '');
    expect(await field(page, 22)).toBe('none');
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
    expect(await field(page, 28)).toBe('500.1000');
    await page.locator('#shelvesLeft').fill('700');
    await page.locator('#shelvesLeft').press('Tab');
    expect(await field(page, 29)).toBe('700');
  });

  test('tops too low, too high or not numbers are left out', async ({ page }) => {
    await page.locator('#shelvesBack').fill('50, shelf, 2500');
    await page.locator('#shelvesBack').press('Tab');
    await expect(page.locator('#shelvesBack')).toHaveValue('');
    expect(await field(page, 28)).toBe('0');                            // no shelves
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

// The wicker bench: its sizes (field 46), then on.a.b.turn in the hallway
// (47), the bedroom (48) and the living room (49), each on its own
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
    expect(await field(page, 46)).toBe('1200.410.450.80');
    expect(await field(page, 47)).toBe('0.1470.1372.0');
    expect(await field(page, 48)).toBe('1.2000.1985.0');
    expect(await field(page, 49)).toBe('0.3686.2910.90');
    await page.locator('#wickerBenchBlock [data-reset="bedroom"]').evaluate(b => b.click());
    expect(await field(page, 48)).toBe('1.1360.1985.0');
    await page.locator('#wickerBenchBlock [data-reset="sizes"]').evaluate(b => b.click());
    expect(await field(page, 46)).toBe('920.410.450.80');
  });
});

// The garage, in Garage options: Sean (field 58), Billy (59) and
// BillyChest (60), each on.x.y.turn
test.describe('the garage', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page, undefined, '#garageMenu'); });

  test('Sean and Billy can be moved and turned, and put back', async ({ page }) => {
    expect(await field(page, 58)).toBe('1.1255.2865.180');
    expect(await field(page, 59)).toBe('1.0.1920.270');
    await slide(page, 'garage_sean_x', 2000);
    await slide(page, 'garage_sean_y', 1000);
    await slide(page, 'garage_sean_turn', 90);
    await slide(page, 'garage_billy_x', 4000);
    expect(await field(page, 58)).toBe('1.2000.1000.90');
    expect(await field(page, 59)).toBe('1.4000.1920.270');
    expect(await readout(page, 'garage_sean_turn')).toBe('90°');
    await page.locator('#garageBlock [data-reset="sean"]').evaluate(b => b.click());
    expect(await field(page, 58)).toBe('1.1255.2865.180');
    expect(await field(page, 59)).toBe('1.4000.1920.270');         // Billy stays where he was put
  });

  // Each has its In the garage switch; taken out, its sliders stay, as the
  // bedroom's
  test('each can be taken out, moved and put back', async ({ page }) => {
    for (const [piece, k] of [['sean', 58], ['billy', 59]]) {
      await toggle(page, `garage_${piece}_on`, false);
      expect((await field(page, k)).split('.')[0]).toBe('0');
      await expect(page.locator(`#garage_${piece}_x`)).toBeVisible();
      await toggle(page, `garage_${piece}_on`, true);
      expect((await field(page, k)).split('.')[0]).toBe('1');
    }
    expect(await field(page, 60)).toBe('1.0.1100.270');
    await toggle(page, 'garage_billyChest_on', false);
    expect(await field(page, 60)).toBe('0.0.1100.270');
    await toggle(page, 'garage_billyChest_on', true);
    await slide(page, 'garage_billyChest_x', 3000);
    await slide(page, 'garage_billyChest_turn', 0);
    expect(await field(page, 60)).toBe('1.3000.1100.0');
    await page.locator('#garageBlock [data-reset="billyChest"]').evaluate(b => b.click());
    expect(await field(page, 60)).toBe('1.0.1100.270');
  });

  // Links from before Sean and Billy could be taken out, x.y.turn, keep
  // them in
  test('a link with their places keeps them, and holds them to the garage', async ({ page }) => {
    const [settings, ...rest] = (await hash(page)).split('~');
    const withPlaces = (sean, billy) => [settings.split('-').map((f, k) => (k === 58 ? sean : k === 59 ? billy : f)).join('-'), ...rest].join('~');
    await openRoom(page, withPlaces('0.3000.2000.180', '500.500.0'));
    expect(await field(page, 58)).toBe('0.3000.2000.180');
    expect(await field(page, 59)).toBe('1.500.500.0');
    await openRoom(page, withPlaces('1.9000.2000.45', '500.500.0'));   // past the back wall's far end, and not a quarter turn
    expect(await field(page, 58)).toBe('1.1255.2000.180');
  });
});

// The shoe rack, downstairs: w.d.h.bevel.slope.shoes.bevelDoor (field 55)
test.describe('the shoe rack', () => {
  test.beforeEach(async ({ page }) => { await openDrawer(page); });

  test('it can be resized and put back', async ({ page }) => {
    expect(await field(page, 55)).toBe('460.300.1290.1.45.1.72');
    await slide(page, 'shoeRack_d', 250);
    await slide(page, 'shoeRack_h', 900);
    await slide(page, 'shoeRack_slope', 30);
    expect(await field(page, 55)).toBe('460.250.900.1.30.1.72');
    await page.locator('#shoeRackBlock [data-reset="sizes"]').evaluate(b => b.click());
    expect(await field(page, 55)).toBe('460.300.1290.1.45.1.72');
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
    expect(await field(page, 55)).toBe('460.300.1290.0.45.1.80');
    await expect(page.locator('#shoeRack_w')).toBeEnabled();
    await expect(page.locator('#shoeRack_bevelDoor')).toBeHidden();
    await expect(page.locator('#shoeRack_door')).toContainText('opens to 65.5°');  // the door stops on its corner
    await slide(page, 'shoeRack_slope', 0);
    await expect(page.locator('#shoeRack_fits')).toContainText('sticks out 15');    // a UK 11, about 315, on 300
    await slide(page, 'shoeRack_d', 200);
    await slide(page, 'shoeRack_slope', 30);
    await expect(page.locator('#shoeRack_fits')).toContainText('up to 231 long');   // 200 / cos 30°
    await page.locator('#shoeRack_shoes').uncheck();
    expect(await field(page, 55)).toBe('460.200.1290.0.30.0.80');
  });

  test('a link with its settings keeps them, and holds them to the sliders', async ({ page }) => {
    const [settings, ...rest] = (await hash(page)).split('~');
    const withRack = rack => [settings.split('-').map((f, k) => (k === 55 ? rack : f)).join('-'), ...rest].join('~');   // its field, 55
    await openRoom(page, withRack('900.250.1500.0.15.0.60'));
    expect(await hash(page)).toBe(withRack('900.250.1500.0.15.0.60'));
    expect(await readout(page, 'shoeRack_slope')).toBe('15°');
    await openRoom(page, withRack('900.250.1500'));                     // a shorter link: the rest as they start
    expect(await field(page, 55)).toBe('900.250.1500.1.45.1.72');
    await openRoom(page, withRack('5000.250.1500.2.90.1.120'));         // too wide, a bad switch, too steep, past 90°
    expect(await field(page, 55)).toBe('460.250.1500.1.45.1.72');
  });
});

test.describe('things to store', () => {
  const head = async page => (await stored(page))[0];

  test('shown, packed, and where they go', async ({ page }) => {
    await openDrawer(page);
    await page.click('#storedToggle');
    await expect(page.locator('#storedToggle')).toHaveText('Stored things: shown');
    expect(await head(page)).toBe('1.0.0');
    await expect(page.locator('#storedInfo')).toContainText('Standing on the floor they take');
    await page.selectOption('#storedPacking', '2');
    expect(await head(page)).toBe('1.2.0');
    await page.check('input[name=storedWhere][value="1"]');
    expect(await head(page)).toBe('1.2.1');
    await expect(page.locator('#storedInfo')).toContainText("corner cupboard");
    await page.click('#storedToggle');
    expect(await head(page)).toBe('0.2.1');
  });

  test('off the floor, then packed again', async ({ page }) => {
    await openDrawer(page);
    await page.click('#storedToggle');
    const lift = page.locator('#storedLifts input').first();             // Rack 1
    await lift.fill('300');
    await lift.press('Tab');
    const [h, rack1] = await stored(page);
    expect(h).toBe('1.0.2');                                          // as placed by hand now
    expect(rack1.split('.')[3]).toBe('300');
    await page.click('#storedPack');                                   // back by the window
    expect(await head(page)).toBe('1.0.0');
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
    let [h, rack1] = await stored(page);
    expect(h).toBe('1.0.2');                                          // moved by hand
    const x = Number(rack1.split('.')[0]);
    expect(x).toBeGreaterThan(2000);
    expect(x).toBeLessThan(2100);
    expect(rack1.split('.')[2]).toBe('1');
    // A double-click turns it round
    await page.mouse.dblclick(sx - 500 * perMm, sy);
    [, rack1] = await stored(page);
    expect(rack1.split('.')[2]).toBe('0');
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
    expect(await offered()).toEqual(['Looking at Sean', 'Looking at Billy', 'Looking at BillyChest', 'Looking at the back wall']);
    await page.selectOption('#where', 'garageLookingOut');
    expect(await offered()).toEqual(['Looking at Sean', 'Looking at Billy', 'Looking at BillyChest', 'Looking at the entrance']);
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
// checked in the address; then everything back as it started, which must
// give the default page's address exactly
test('a walk through the menus, and back to the start', async ({ page }) => {
  await openDrawer(page);
  const start = await hash(page);
  const step = async (what, k, value) => expect(await field(page, k), what).toBe(value);
  await step('option 10, as the page opens', 0, '11');
  await step('...with a left-wall cupboard', 1, '600');
  await page.check('input[name=islandAt][value="out"]');              // the island in the corner, against the counter
  await step('the island in the corner', 21, '2');
  await expect(page.locator('#frontBlock'), 'no dresser or larder with the island there').toBeHidden();
  await page.check('input[name=islandAt][value="room"]');             // and out there again
  await step('the island out there', 21, '0');
  await expect(page.locator('#frontBlock')).toBeVisible();
  await page.check('input[name=frontPiece][value="none"]');
  await page.check('input[name=frontPiece][value="dresser"]');
  await step('the dresser', 19, '0');
  await page.check('input[name=frontPiece][value="larder"]');
  await step('the larder', 19, '1');
  await SOFA(page);
  await step('the sofa', 22, 'merton');
  await OPTION(9)(page);
  await step('option 9', 0, '9');
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
