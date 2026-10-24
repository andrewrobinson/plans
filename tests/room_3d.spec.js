// index.html: saved addresses look the same, give the same snapshots (the
// model's, tests/snapshots/, and the view's, tests/view_snapshots/) and
// round-trip, and the menus work. See REFACTOR_PLAN.md. Every test also fails on a console error
// (helpers.js).
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { test, expect, openOptions, openTab, openSection, openRoom, addressOf, readAddress, configurationOf, viewOf, pickOption, setting, optionShown, expectSnapshot } = require('./helpers');
const { ADDRESSES } = require('./addresses');

// The configurations in living_room.configurations.js, read the way the page reads them
const configurationsFile = fs.readFileSync(path.join(__dirname, '..', 'living_room.configurations.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(configurationsFile, sandbox);
const CONFIGURATIONS = Object.entries(sandbox.window.ROOM_CONFIGURATIONS.list);

// The default page's configuration and view
const DEFAULT = ADDRESSES.find(a => a.name === 'default');
// Option 10 with the bench and the dresser, where the controls' tests start
const OPTION_7 = (({ configuration, view }) => addressOf(configuration, view))(ADDRESSES.find(a => a.name === 'option07'));

// The rooms' screenshots kept (REFACTOR_PLAN.md items 2 and 3, chosen with
// the user, 21 Oct 2026): one a room, in 3D where it has one, as the
// model's snapshots check every saved address's sizes, cutting lists and
// places and the view snapshots each view's camera, cut and what it shows.
// These check what only a picture can: the shapes inside each piece,
// colours and lighting, and that the view's drawn at all. The lounge and
// the bedroom from above (with its new cupboard), the hallway, the shoe
// rack downstairs, the garage's plan, and the configurations Option 12
// and Pretty
const PICTURED = new Set([
  'default', 'bedroom-new-cupboard-option10', 'wicker-bench-hallway', 'shoe-rack-stairs', 'garage-moved-plan',
  'configuration-option12', 'configuration-pretty',
]);
// ...of the 3D view alone, the page's buttons and menus hidden, so changing
// them retakes none of these (the bar and menus have their own, below)
const VIEW_ONLY = { stylePath: path.join(__dirname, 'view_only.css') };
const CONTROLS_ONLY = { stylePath: path.join(__dirname, 'controls_only.css') };
// The tests that also run on the desktop (playwright.config.js runs only
// these there): those whose result depends on the window's size or on a
// keyboard and mouse: the screenshots, the bar and drawers fitting, the keys,
// and Share and Screenshot's desktop paths. The rest, the same on any
// device, run on the phone alone
const DESKTOP = { tag: '@desktop' };

test.describe('saved addresses', () => {
  for (const { name, configuration, view } of ADDRESSES) {
    test(`${name} looks the same and round-trips`, PICTURED.has(name) ? DESKTOP : {}, async ({ page }) => {
      await openRoom(page, addressOf(configuration, view));
      expect(await configurationOf(page)).toEqual(configuration);
      expect(await viewOf(page)).toEqual(view);
      await expectSnapshot(page, name);
      await expectSnapshot(page, name, { of: 'view' });
      if (PICTURED.has(name)) await expect(page).toHaveScreenshot(`${name}.png`, VIEW_ONLY);
    });
  }

  for (const [id, { configuration }] of CONFIGURATIONS) {
    test(`configuration ${id} looks the same and round-trips`, PICTURED.has(`configuration-${id}`) ? DESKTOP : {}, async ({ page }) => {
      await openRoom(page, addressOf(configuration));
      // A configuration leaves out the view, so the page shows its starting one
      expect(await configurationOf(page)).toEqual(configuration);
      expect(await viewOf(page)).toEqual(DEFAULT.view);
      await expectSnapshot(page, `configuration-${id}`);
      await expectSnapshot(page, `configuration-${id}`, { of: 'view' });
      if (PICTURED.has(`configuration-${id}`)) await expect(page).toHaveScreenshot(`configuration-${id}.png`, VIEW_ONLY);
    });
  }

  // The configuration's numbers are held to their sliders' ranges, written
  // in the schema (so Node has them): each must be its slider's in index.html
  test('the configuration\'s ranges are the sliders\'', async ({ page }) => {
    await openRoom(page);
    const entries = (await page.evaluate(() => window.plans.schema())).filter(e => e.slider);
    expect(entries.length).toBeGreaterThan(30);
    // Read in one go: one by one, the desktop's slow drawing made it time out
    const html = await page.evaluate(ids => ids.map(id => {
      const el = document.getElementById(id);
      return [Number(el.min), Number(el.max), Number(el.step || 1)];
    }), entries.map(e => e.slider));
    entries.forEach(({ path, slider, min, max, step }, k) => expect(html[k], `${path}'s slider, #${slider}`).toEqual([min, max, step]));
  });

  test('no address gives the default page', async ({ page }) => {
    await openRoom(page);
    expect(await configurationOf(page)).toEqual(DEFAULT.configuration);
    expect(await viewOf(page)).toEqual(DEFAULT.view);
  });
});

// The page's bar and menus, the 3D view behind them hidden: what the UI
// changes (notes/UI_CRITIQUE.md) are meant to change, so these are retaken with
// them. The page as it opens, then each corner menu and Lounge options open
test.describe('the bar and menus look the same', DESKTOP, () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });

  test('every menu closed', async ({ page }) => {
    await expect(page).toHaveScreenshot('controls-closed.png', CONTROLS_ONLY);
  });

  test('the Look menu open', async ({ page }) => {
    await page.click('#viewMenu .popToggle');
    await expect(page).toHaveScreenshot('controls-look.png', CONTROLS_ONLY);
  });

  test('the Configuration menu open', async ({ page }) => {
    await page.click('#configurationMenu .popToggle');
    await expect(page).toHaveScreenshot('controls-configuration.png', CONTROLS_ONLY);
  });

  test('Lounge options open', async ({ page }) => {
    await openOptions(page);
    await expect(page).toHaveScreenshot('controls-lounge-options.png', CONTROLS_ONLY);
  });
});

// The long drawers' tabs (notes/MENU_TABS.md): choosing one shows its sections
// and hides the others', the arrow keys move between them, the drawer opens
// on the one last used, and on either device each drawer's tabs fit across
// it without scrolling sideways
test.describe('the drawers\' tabs', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });
  const chosen = (page, tabs) => page.locator(`#${tabs} [role=tab][aria-selected=true]`);
  const tab = (page, tabs, name) => page.locator(`#${tabs} [role=tab]`, { hasText: name });

  test('a tab shows its sections, and the description is under them all', async ({ page }) => {
    await openOptions(page);
    await expect(chosen(page, 'loungeTabs')).toHaveText('Cupboard');
    await expect(page.locator('#secCupboard')).toBeVisible();
    await expect(page.locator('#secSofa')).toBeHidden();
    await tab(page, 'loungeTabs', 'Furniture').click();
    await expect(page.locator('#secSofa')).toBeVisible();
    await expect(page.locator('#secCupboard')).toBeHidden();
    await expect(page.locator('#about')).toBeAttached();
    expect(await page.locator('#about').evaluate(d => !d.closest('.tabpanel'))).toBe(true);
  });

  test('the arrow keys, Home and End move between tabs', async ({ page }) => {
    await openOptions(page);
    await tab(page, 'loungeTabs', 'Cupboard').focus();
    await page.keyboard.press('ArrowRight');
    await expect(chosen(page, 'loungeTabs')).toHaveText('Furniture');
    await page.keyboard.press('End');
    await expect(chosen(page, 'loungeTabs')).toHaveText('Stored');
    await page.keyboard.press('ArrowRight');                     // round the end
    await expect(chosen(page, 'loungeTabs')).toHaveText('Cupboard');
    await page.keyboard.press('ArrowLeft');
    await expect(chosen(page, 'loungeTabs')).toHaveText('Stored');
    await expect(page.locator('#secStored')).toBeVisible();
  });

  test('a drawer opens on the tab last used', async ({ page }) => {
    await openOptions(page);
    await tab(page, 'loungeTabs', 'Walls & doors').click();
    await openRoom(page);
    await openOptions(page);
    await expect(chosen(page, 'loungeTabs')).toHaveText('Walls & doors');
    await expect(page.locator('#secDoors')).toBeVisible();
  });

  test('the garage\'s pieces are in their groups\' tabs', async ({ page }) => {
    await openOptions(page, 'garage');
    await expect(page.locator('#garageTabs [role=tab]')).toHaveText(['Cupboards & shelves', 'Tables & benches', 'Boxes', 'Home']);
    await expect(page.locator('#garageDoorBlock')).toBeVisible();   // the door, above the tabs
    await tab(page, 'garageTabs', 'Boxes').click();
    await expect(page.locator('#garage_trellis_on')).toBeVisible();
    await expect(page.locator('#garage_sean_on')).toBeHidden();
  });

  test('each drawer\'s tabs fit across it', DESKTOP, async ({ page }) => {
    for (const [room, tabs] of [['lounge', 'loungeTabs'], ['hallway', 'hallTabs'], ['bedroom', 'bedTabs'], ['garage', 'garageTabs']]) {
      await openOptions(page, room);
      const { across, needed } = await page.locator(`#${tabs} .tablist`).evaluate(l => ({ across: l.clientWidth, needed: l.scrollWidth }));
      expect(needed, `${tabs}: ${needed} needed, ${across} across`).toBeLessThanOrEqual(across);
    }
  });
});

// The top bar fits (REFACTOR_PLAN.md item 5, with notes/UI_CRITIQUE.md's step 1):
// on a phone (390 wide) its buttons take three rows at most, and on either
// device the bar, and so its buttons, stop short of Look ▾ at the top right
const BAR_ROWS_ON_A_PHONE = 3;          // chosen, 19 Oct 2026: about 15% of the screen
test('the top bar fits, clear of Look ▾', DESKTOP, async ({ page, isMobile }) => {
  await openRoom(page);
  const boxes = await page.locator('#bar > :not(#roomViews), #roomViews > *').evaluateAll(els => els.map(e => e.getBoundingClientRect().toJSON()));
  const look = await page.locator('#viewMenu .popToggle').boundingBox();
  const bar = await page.locator('#bar').boundingBox();
  expect(bar.x + bar.width).toBeLessThanOrEqual(look.x);    // room kept for it, however the buttons wrap
  for (const box of boxes) expect(box.right <= look.x || box.top >= look.y + look.height, JSON.stringify(box)).toBe(true);
  if (isMobile) expect(new Set(boxes.map(b => Math.round(b.top))).size).toBeLessThanOrEqual(BAR_ROWS_ON_A_PHONE);
});

test.describe('the settings drawers', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });

  test('☰ opens it, ✕ and Escape close it', DESKTOP, async ({ page }) => {
    const panel = page.locator('#panel');
    await expect(panel).not.toBeInViewport();
    await page.click('#menu');
    await expect(page.locator('body')).toHaveClass(/menu-open/);
    await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeInViewport();
    await page.click('#close');
    await expect(panel).not.toBeInViewport();
    await page.click('#menu');
    await expect(panel).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(panel).not.toBeInViewport();
  });

  // On a phone the options are a sheet from the bottom, the room live
  // above it (no scrim), the options button on its top edge to close it
  test('on a phone the options are a sheet, with the room above it', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'a sheet only on narrow screens');
    await page.click('#roomOptions');
    const sheet = page.locator('#loungePanel'), { height } = page.viewportSize();
    await expect(sheet).toBeInViewport();
    await expect.poll(async () => (await sheet.boundingBox()).y).toBeGreaterThan(height / 3);   // the top part's the room's
    const options = await page.locator('#roomOptions').boundingBox();
    expect(options.y + options.height).toBeLessThanOrEqual((await sheet.boundingBox()).y);
    await page.click('#roomOptions');
    await expect(sheet).not.toBeInViewport();
  });

  // The room's options (the button at the bottom left, Lounge options in
  // the lounge) and Other options (☰), one open at a time; an open drawer
  // covers the options button, so ✕ or Escape closes it
  test('Lounge options has its own drawer, and one drawer is open at a time', async ({ page }) => {
    const other = page.locator('#panel'), lounge = page.locator('#loungePanel'), options = page.locator('#roomOptions');
    await expect(options).toHaveText('Lounge options');
    await expect(lounge).not.toBeInViewport();
    await options.click();
    await expect(lounge).toBeInViewport();
    await expect(options).toHaveAttribute('aria-expanded', 'true');
    await page.click('#menu');
    await expect(other).toBeInViewport();
    await expect(lounge).not.toBeInViewport();
    await expect(options).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Escape');
    await options.click();
    await expect(lounge).toBeInViewport();
    await expect(other).not.toBeInViewport();
    await page.click('#loungeClose');
    await expect(lounge).not.toBeInViewport();
  });

  // Each room's button goes to it, from Bird's eye or the plan as its
  // dropdown says, and the options button follows the room in view
  test('the room buttons go to each room, and the options follow it', async ({ page }) => {
    for (const [room, button, options] of [['bedroom', '#bedroomView', 'Bedroom options'], ['garage', '#garageView', 'Garage options'],
      ['hallway', '#hallwayView', 'Hallway and stairs'], ['livingRoom', '#loungeView', 'Lounge options']]) {
      await page.click(button);
      await expect(page.locator('#roomOptions')).toHaveText(options);
      expect(await viewOf(page)).toMatchObject({ room, view: 'birdseye' });
    }
    await page.selectOption('#garageViewKind', 'plan');
    expect(await viewOf(page)).toMatchObject({ room: 'garage', view: 'plan' });
    // The hallway's own view, the stairs from the side, is in its list alone
    await expect(page.locator('#garageViewKind option[value="stairsSide"]')).toHaveCount(0);
    await page.selectOption('#hallwayViewKind', 'stairsSide');
    expect(await viewOf(page)).toMatchObject({ room: 'hallway', view: 'stairsSide' });
    await page.click('#loungeView');
    await page.click('#garageView');                                // as its dropdown says now
    expect(await viewOf(page)).toMatchObject({ room: 'garage', view: 'plan' });
    await page.click('#roomOptions');
    await expect(page.locator('#garagePanel')).toBeInViewport();
    // Only the lounge and the bedroom have a cupboard, so a cutting list
    for (const panel of ['#garagePanel', '#hallPanel', '#panel']) await expect(page.locator(panel)).not.toContainText('Cutting list');
    // The hallway's options: the shoe rack and the doors downstairs
    await page.keyboard.press('Escape');
    await page.click('#hallwayView');
    await page.click('#roomOptions');
    await expect(page.locator('#hallPanel')).toBeInViewport();
    await expect(page.locator('#hallPanel')).toContainText('The shoe rack');
    await expect(page.locator('#panel')).not.toContainText('The shoe rack');
    for (const panel of ['#loungePanel', '#bedPanel']) await expect(page.locator(`${panel} summary`, { hasText: 'Cutting list' })).toHaveCount(1);
  });

  test('the option list is in Lounge options, with its sliders', async ({ page }) => {
    await openOptions(page);
    await pickOption(page, 9);
    await expect(page.locator('#wardBlock')).toBeVisible();        // its sliders, in the drawer
    expect(await optionShown(page)).toBe(9);
  });
});

// From the page as it opens (REFACTOR_PLAN.md item 16): option 16, the room
// as it is, with no cupboard or bench, Billy and BillyChest on the back
// wall and the Drift by them. Each test switches on what it needs: a
// cupboard (which has the front wall's choices), or the bench, once Billy
// and BillyChest are off the back wall, where they stand in its place.
// Each leaves its own tab of Lounge options chosen: Cupboard, Furniture
async function withCupboard(page) {
  await openTab(page, 'Cupboard');
  await pickOption(page, 10);
}
async function withBench(page) {
  await openTab(page, 'Furniture');
  for (const id of ['#billyOn', '#billyChestOn']) await page.locator(id).uncheck();
  await page.locator('#benchOn').check();
}
test.describe('the controls', () => {
  test.beforeEach(async ({ page }) => {
    await openRoom(page);
    await openOptions(page);
  });
  const hash = page => page.evaluate(() => location.hash);

  test('a slider updates its number and the address', async ({ page }) => {
    await withBench(page);
    await withCupboard(page);
    await page.locator('#rear').fill('500');
    await expect(page.locator('#rearValue')).toHaveText('500');
    expect(await setting(page, 'pieces.cornerCupboard.design.R')).toBe(500);
  });

  test('the board thickness slider updates its number and the address', async ({ page }) => {
    await openOptions(page);
    await page.locator('#board').fill('22');
    await expect(page.locator('#boardValue')).toHaveText('22');
    expect(await setting(page, 'pieces.cornerCupboard.design.BOARD')).toBe(22);
  });

  // A number typed in the box beside a millimetre slider (notes/UI_CRITIQUE.md,
  // step 3) goes where the slider would take it: held to its range and
  // step, anything else refused; a word (none) shown beside it; the box
  // following the slider; none beside the angles
  test('a millimetre slider\'s number can be typed', async ({ page }) => {
    await withBench(page);
    await openTab(page, 'Cupboard');
    await pickOption(page, 7);
    const box = page.locator('#rearBox');
    await box.fill('520');
    await box.press('Enter');
    expect(await setting(page, 'pieces.cornerCupboard.design.R')).toBe(520);
    await expect(page.locator('#rear')).toHaveValue('520');
    await box.fill('9000');
    await box.press('Enter');
    await expect(box).toHaveValue('800');                       // the slider's highest
    expect(await setting(page, 'pieces.cornerCupboard.design.R')).toBe(800);
    await box.fill('');
    await box.press('Enter');
    await expect(box).toHaveValue('800');                       // nothing typed: refused
    await box.fill('455');
    await box.press('Enter');
    await expect(box).toHaveValue('460');                       // on its step, of 10
    await page.locator('#depth').fill('290');
    await expect(page.locator('#depthBox')).toHaveValue('290');   // the slider moved, the box follows
    await expect(page.locator('#depthValue')).toHaveText('none');
    await expect(page.locator('#depthValue')).toBeVisible();
    await expect(page.locator('#rearValue')).toBeHidden();     // a bare number, shown once, in the box
    await expect(page.locator('#roomDoorBox')).toHaveCount(0);
  });

  test('the left-wall depth slider shows "none" below 300', async ({ page }) => {
    await openOptions(page);
    await pickOption(page, 7);                                   // option 10, as the page opens, has no left-wall cupboard
    await page.locator('#depth').fill('450');
    await expect(page.locator('#depthValue')).toHaveText('450');
    expect(await setting(page, 'pieces.cornerCupboard.design.T')).toBe(450);
    await page.locator('#depth').fill('290');
    await expect(page.locator('#depthValue')).toHaveText('none');
    expect(await setting(page, 'pieces.cornerCupboard.design.T')).toBe(0);
  });

  test('each option shows its own slider blocks', async ({ page }) => {
    await openOptions(page);
    const blocks = ['legBlock', 'wardBlock', 'cornerBlock'];
    // option number → the blocks shown (show() in index.html)
    const cases = [[7, ['legBlock']], [8, []], [9, ['wardBlock']], [10, ['cornerBlock']], [11, ['cornerBlock']], [16, []]];
    for (const [n, shown] of cases) {
      await pickOption(page, n);
      for (const b of blocks) {
        if (shown.includes(b)) await expect(page.locator(`#${b}`), `${b} with option ${n}`).toBeVisible();
        else await expect(page.locator(`#${b}`), `${b} with option ${n}`).toBeHidden();
      }
    }
  });

  test('option 8 needs a left-wall cupboard', async ({ page }) => {
    await openOptions(page);
    await pickOption(page, 7);                                   // for the left-wall depth slider
    await page.locator('#depth').fill('290');                    // none
    const option8 = page.locator('#current option', { hasText: /^8\. / });
    await expect(option8).toBeDisabled();
    await page.locator('#depth').fill('600');
    await expect(option8).toBeEnabled();
    await pickOption(page, 8);
    expect(await optionShown(page)).toBe(8);
  });

  // The shelves above the bench, and the TV a piece of its own (24 Oct 2026)
  test('the shelves above the bench show their slider; the TV its own, while it\'s on', async ({ page }) => {
    await withBench(page);
    const tv = page.locator('#tvBlock'), shelf = page.locator('#shelfBlock');
    for (const [value, shelfShown] of [['nothing', false], ['shelves', true], ['topShelf', true]]) {
      await page.check(`input[name=above][value="${value}"]`);
      await expect(shelf).toBeVisible({ visible: shelfShown });
      expect(await setting(page, 'pieces.aboveBench.design.what')).toBe(value);
    }
    await expect(tv).toBeHidden();
    await page.locator('#tvOn').check();
    await expect(tv).toBeVisible();
    await expect(page.locator('#summary')).toContainText('Above the bench: a 75" TV (1680 × 960)');
  });

  test('the bench switch hides the bench settings', async ({ page }) => {
    await withBench(page);
    await page.locator('#benchOn').uncheck();
    await expect(page.locator('#benchDetails')).toBeHidden();
    expect(await setting(page, 'pieces.bench.in.livingRoom.on')).toBe(false);
    await page.locator('#benchOn').check();
    await expect(page.locator('#benchDetails')).toBeVisible();
    expect(await setting(page, 'pieces.bench.in.livingRoom.on')).toBe(true);
  });

  // The bedroom's lower recess cupboard (pieces.recessCupboards) and mirror (pieces.mirror)
  test('the bedroom\'s reset buttons, and the mirror\'s wall', async ({ page }) => {
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    for (const section of ['extras', 'recess']) await openSection(page, `secOtherRoom_${section}`);
    const recess = page.locator('#otherRoomPiece_recess');
    const mirror = page.locator('#otherRoomPiece_mirror');
    await page.locator('#otherRoom_mirrorOn').check();                 // none yet, as the page opens
    await page.locator('#otherRoom_lowerD').fill('800');
    expect(await setting(page, 'pieces.recessCupboards.design.lowerD')).toBe(800);
    await recess.getByRole('button', { name: 'Reset dimensions' }).click();
    expect(await setting(page, 'pieces.recessCupboards.design.lowerD')).toBe(301);
    await page.locator('#otherRoom_upperDrawers').check();             // the upper cupboard's drawers and mirrors
    expect(await setting(page, 'pieces.recessCupboards.design')).toMatchObject({ upperDrawers: true, upperMirrors: false });
    await page.locator('#otherRoom_upperMirrors').check();
    expect(await setting(page, 'pieces.recessCupboards.design')).toMatchObject({ upperDrawers: true, upperMirrors: true });
    await page.selectOption('#otherRoom_mirror_wall', 'kitchen');
    await expect(page.locator('#otherRoom_mirror_alongLabel')).toHaveText('Middle from the hallway wall');
    expect(await setting(page, 'pieces.mirror.in.bedroom')).toMatchObject({ wall: 'kitchen', along: 2569, bottom: 1400 });
    expect(await setting(page, 'pieces.mirror.design')).toEqual({ w: 1000, h: 800 });
    await page.locator('#otherRoom_mirror_w').fill('600');
    await mirror.getByRole('button', { name: 'Reset location' }).click();
    expect(await setting(page, 'pieces.mirror.in.bedroom')).toMatchObject({ wall: 'breast', along: 2569, bottom: 1400 });
    expect(await setting(page, 'pieces.mirror.design')).toEqual({ w: 600, h: 800 });   // its size kept
    await mirror.getByRole('button', { name: 'Reset dimensions' }).click();
    expect(await setting(page, 'pieces.mirror.in.bedroom')).toMatchObject({ wall: 'breast', along: 2569, bottom: 1400 });
    expect(await setting(page, 'pieces.mirror.design')).toEqual({ w: 1000, h: 800 });
  });

  // The bench is drawn whenever it's on (the user's, 24 Oct 2026): the
  // bookshelf stands in front of it, and its switch stays as it's set
  test('the bookshelf stands in front of the bench, which stays', async ({ page }) => {
    await withBench(page);
    await page.locator('#bookshelfOn').check();
    await expect(page.locator('#benchOn')).toBeEnabled();
    await expect(page.locator('#benchOn')).toBeChecked();
    await expect(page.locator('#benchDetails')).toBeVisible();
    await expect(page.locator('#summary')).toContainText('in front of the bench');
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.on')).toBe(true);
    await page.locator('#bookshelfOn').uncheck();
    await expect(page.locator('#benchOn')).toBeChecked();
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.on')).toBe(false);
  });

  // The bedroom's pine cupboard in the living room (in.livingRoom: on, and
  // its place, move) and in the bedroom (in.bedroom.on), each on its
  // own; in the bench's place, with the bookshelf too if it's on
  test('the pine cupboard can be on the back wall and in the bedroom, each on its own', async ({ page }) => {
    await openTab(page, 'Furniture');
    await expect(page.locator('#pineMoveBlock')).toBeHidden();
    await page.locator('#pineOn').check();
    await expect(page.locator('#benchOn')).toBeEnabled();             // the bench drawn whenever it's on
    await expect(page.locator('#pineMoveBlock')).toBeVisible();
    expect(await setting(page, 'pieces.pineCupboard.in.livingRoom.on')).toBe(true);
    expect(await setting(page, 'pieces.pineCupboard.in.livingRoom.move')).toBe(null);                    // where it starts
    await page.locator('#pineY').fill('1000');
    expect(await setting(page, 'pieces.pineCupboard.in.livingRoom.move')).toMatchObject({ y: 1000, turn: 0 });
    await page.locator('#pineHome').click();
    expect(await setting(page, 'pieces.pineCupboard.in.livingRoom.move')).toBe(null);                    // where it starts
    await page.locator('#bookshelfOn').check();
    await page.locator('#pineOn').uncheck();
    await expect(page.locator('#benchOn')).toBeEnabled();             // the bench drawn whenever it's on
    expect(await setting(page, 'pieces.pineCupboard.in.bedroom.on')).toBe(true);
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_cupboardOn').uncheck();
    expect(await setting(page, 'pieces.pineCupboard.in.bedroom.on')).toBe(false);
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.on')).toBe(true);           // the living room's kept
  });

  // Billy, from the garage, in the living room (in.livingRoom: on, lying,
  // move) and in the bedroom (in.bedroom, on any wall), each on its own, as
  // the pine cupboard; lying, it's 2020 along its wall. On the back wall,
  // lying, as the page opens, moved to where it is now
  test('Billy can be on the back wall and in the bedroom, standing or lying', async ({ page }) => {
    await openTab(page, 'Furniture');
    await page.locator('#billyOn').uncheck();
    await expect(page.locator('#billyMoveBlock')).toBeHidden();
    await page.locator('#billyOn').check();
    await expect(page.locator('#benchOn')).toBeEnabled();             // the bench drawn whenever it's on
    expect(await setting(page, 'pieces.billy.in.livingRoom.lying')).toBe(true);
    await page.locator('#billyHome').click();
    expect(await setting(page, 'pieces.billy.in.livingRoom.move')).toBe(null);                   // against the cupboards, where the bench starts
    await page.locator('#billyY').fill('500');
    expect(await setting(page, 'pieces.billy.in.livingRoom.move')).toMatchObject({ y: 500, turn: 0 });
    await page.locator('#billyHome').click();
    expect(await setting(page, 'pieces.billy.in.livingRoom.move')).toBe(null);
    expect(await setting(page, 'pieces.billy.in.bedroom.on')).toBe(false);          // the bedroom's its own
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_billyOn').check();
    expect(await setting(page, 'pieces.billy.in.bedroom')).toMatchObject({ wall: 'breast', along: 2569, lying: false });
    await page.locator('#otherRoom_billy_lying').check();
    await page.selectOption('#otherRoom_billy_wall', 'hallway');
    await expect(page.locator('#otherRoom_billy_along')).toHaveAttribute('min', '1010');   // half its 2020 lying
    expect(await setting(page, 'pieces.billy.in.bedroom')).toMatchObject({ wall: 'hallway', along: 2569, lying: true });
    expect(await setting(page, 'pieces.billy.in.livingRoom.on')).toBe(true);                     // the living room's kept
    expect(await setting(page, 'pieces.billy.in.garage.on')).toBe(false);            // and the garage's, out as it starts
  });

  // BillyChest, as Billy but with no lying: in the living room and in the
  // bedroom (on any wall), each on its own. In the living room's corner as
  // the page opens
  test('BillyChest can be on the back wall and in the bedroom', async ({ page }) => {
    await openTab(page, 'Furniture');
    expect(await setting(page, 'pieces.billyChest.in.livingRoom.on')).toBe(false);   // out to start
    await page.locator('#billyChestOn').check();
    await expect(page.locator('#benchOn')).toBeEnabled();             // the bench drawn whenever it's on
    await page.locator('#billyChestHome').click();                    // against the cupboards, where the bench starts
    await page.locator('#billyChestY').fill('500');
    expect(await setting(page, 'pieces.billyChest.in.livingRoom.move')).toMatchObject({ y: 500, turn: 0 });
    await page.locator('#billyChestHome').click();
    expect(await setting(page, 'pieces.billyChest.in.livingRoom.move')).toBe(null);
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_billyChestOn').check();
    await page.selectOption('#otherRoom_billyChest_wall', 'window');
    await expect(page.locator('#otherRoom_billyChest_along')).toHaveAttribute('min', '402.5');   // half its 805
    expect(await setting(page, 'pieces.billyChest.in.bedroom')).toMatchObject({ wall: 'window' });
    expect(await setting(page, 'pieces.billyChest.in.livingRoom.on')).toBe(true);                // the living room's kept
    expect(await setting(page, 'pieces.billyChest.in.garage.on')).toBe(false);       // and the garage's, out as it starts
  });

  // The Ivar: out of the lounge to start, put in lying by the first radiator; moved
  // and put back; standing; and in the bedroom and garage, each on its own
  test('the Ivar is by the first radiator, and can go to the bedroom and garage', async ({ page }) => {
    await openTab(page, 'Furniture');
    expect(await setting(page, 'pieces.ivar.in.livingRoom.on')).toBe(false);
    await page.locator('#ivarOn').check();
    expect(await setting(page, 'pieces.ivar.in.livingRoom.lying')).toBe(true);
    await expect(page.locator('#ivarXValue')).toHaveText('3291');      // 830 out from the radiator's front, at 3706
    await page.locator('#ivarY').fill('2000');
    expect(await setting(page, 'pieces.ivar.in.livingRoom.move')).toMatchObject({ x: 3291, y: 2000, turn: 0 });
    await page.locator('#ivarHome').click();
    expect(await setting(page, 'pieces.ivar.in.livingRoom.move')).toBe(null);
    await page.locator('#ivarLying').uncheck();
    await expect(page.locator('#ivarXValue')).toHaveText('3306');      // standing, 800 out
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_ivarOn').check();
    expect(await setting(page, 'pieces.ivar.in.bedroom.on')).toBe(true);
    expect(await setting(page, 'pieces.ivar.in.garage')).toEqual({ on: false, x: 0, y: 1100, turn: 270 });
    expect(await setting(page, 'pieces.ivar.in.livingRoom.on')).toBe(true);                   // the lounge's kept
  });

  // The Drift, a daybed: its As a bed switch only for it, 1980 wide as a bed
  test('the Drift sofa can be laid out as a bed', async ({ page }) => {
    await openTab(page, 'Furniture');
    await page.selectOption('#sofaPick', 'merton');                    // the Drift, as the page opens
    await expect(page.locator('#sofaAsBedRow')).toBeHidden();
    await page.selectOption('#sofaPick', 'drift');
    expect(await setting(page, 'pieces.sofa.design')).toMatchObject({ model: 'drift', w: 1480, d: 790, h: 670 });
    await expect(page.locator('#sofaAsBedRow')).toBeVisible();
    await page.locator('#sofaAsBed').check();
    expect(await setting(page, 'pieces.sofa.design.asBed')).toBe(true);
    await expect(page.locator('#summary')).toContainText('as a bed: 1980 wide');
    await page.selectOption('#sofaPick', 'merton');
    await expect(page.locator('#sofaAsBedRow')).toBeHidden();
  });

  // The living room's corner cupboard copied into the bedroom
  // (pieces.bedroomCupboard.in.bedroom.on): the pine cupboard's switch can't
  // be used while it's there, and keeps its setting for when it's gone
  test('the new cupboard takes the bedroom pine cupboard\'s place', async ({ page }) => {
    expect(await setting(page, 'pieces.bedroomCupboard.in.bedroom.on')).toBe(false);
    await openOptions(page, 'bedroom');
    await expect(page.locator('#otherRoom_cupboardOn')).toBeEnabled();
    await page.locator('#otherRoom_newCupboardOn').check();
    expect(await setting(page, 'pieces.bedroomCupboard.in.bedroom.on')).toBe(true);
    await expect(page.locator('#otherRoom_cupboardOn')).toBeDisabled();
    expect(await setting(page, 'pieces.pineCupboard.in.bedroom.on')).toBe(true);
    await page.locator('#otherRoom_newCupboardOn').uncheck();
    expect(await setting(page, 'pieces.bedroomCupboard.in.bedroom.on')).toBe(false);
    await expect(page.locator('#otherRoom_cupboardOn')).toBeEnabled();
  });

  // Bedroom options in sections (asked for, 18 Oct 2026), all closed to
  // start: the bed and what's by it, Extras, the recess cupboards; a piece's
  // controls hidden while it's out of the bedroom
  test('Bedroom options: its sections, and a piece out shows only its switch', async ({ page }) => {
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    for (const section of ['bed', 'extras', 'recess']) await expect(page.locator(`#secOtherRoom_${section}`)).not.toHaveAttribute('open', '');
    await expect(page.locator('#secOtherRoom_bed #otherRoomPiece_kvistbro')).toHaveCount(1);
    await expect(page.locator('#secOtherRoom_extras #otherRoomPiece_billy')).toHaveCount(1);
    await openSection(page, 'secOtherRoom_extras');
    await expect(page.locator('#otherRoom_bookcase_w')).toBeVisible();
    await page.locator('#otherRoom_bookcaseOn').uncheck();
    await expect(page.locator('#otherRoom_bookcase_w')).toBeHidden();
    await expect(page.locator('#otherRoom_bookcaseOn')).toBeVisible();
    await page.locator('#otherRoom_bookcaseOn').check();
    await expect(page.locator('#otherRoom_bookcase_w')).toBeVisible();
    await page.reload();                                                // Extras left open, as the other sections are
    await expect(page.locator('#secOtherRoom_extras')).toHaveAttribute('open', '');
  });

  // The bedroom's mirror: none yet as the page opens, switched on and off again
  test('the bedroom mirror can be switched on and off', async ({ page }) => {
    expect(await setting(page, 'pieces.mirror.in.bedroom.on')).toBe(false);
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_mirrorOn').check();
    expect(await setting(page, 'pieces.mirror.in.bedroom.on')).toBe(true);
    await page.locator('#otherRoom_mirrorOn').uncheck();
    expect(await setting(page, 'pieces.mirror.in.bedroom.on')).toBe(false);
  });

  test('the front-wall piece shows the dresser or larder settings', async ({ page }) => {
    await withCupboard(page);
    await openTab(page, 'Furniture');
    await page.check('input[name=frontPiece][value="larder"]');
    await expect(page.locator('#larderBlock')).toBeVisible();
    await expect(page.locator('#dresserBlock')).toBeHidden();
    await page.check('input[name=frontPiece][value="none"]');
    await expect(page.locator('#larderBlock')).toBeHidden();
    await expect(page.locator('#dresserBlock')).toBeHidden();
    await page.check('input[name=frontPiece][value="bookshelf"]');
    await expect(page.locator('#bookshelfBlock')).toBeVisible();
    await expect(page.locator('#dresserBlock')).toBeHidden();
    expect(await setting(page, 'livingRoom.frontWall')).toBe('bookshelf');
    await page.locator('#bookshelfW').fill('1200');             // the bedroom's bookcase's width
    expect(await setting(page, 'pieces.bookcase.design.w')).toBe(1200);
    await page.check('input[name=frontPiece][value="dresser"]');
    await expect(page.locator('#dresserBlock')).toBeVisible();
    await expect(page.locator('#bookshelfBlock')).toBeHidden();
  });

  // A bookcase on the front wall (livingRoom.frontWall), the back wall
  // (in.livingRoom.on) and in the bedroom (in.bedroom.on), each on its own
  test('a bookcase can be on either wall and in the bedroom, each on its own', async ({ page }) => {
    await withCupboard(page);
    await openTab(page, 'Furniture');
    await page.check('input[name=frontPiece][value="bookshelf"]');
    await page.locator('#bookshelfOn').check();
    expect(await setting(page, 'livingRoom.frontWall')).toBe('bookshelf');
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.on')).toBe(true);
    expect(await setting(page, 'pieces.bookcase.in.bedroom.on')).toBe(true);
    await openOptions(page, 'bedroom');
    await openTab(page, 'Furniture');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_bookcaseOn').uncheck();
    expect(await setting(page, 'pieces.bookcase.in.bedroom.on')).toBe(false);
    expect(await setting(page, 'livingRoom.frontWall')).toBe('bookshelf');           // the living room's kept
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.on')).toBe(true);
  });

  // Its place, in.livingRoom.move: null where it starts, else { x, y, turn }
  test('the bookshelf in the bench\'s place can be moved and turned', async ({ page }) => {
    await openTab(page, 'Furniture');
    await expect(page.locator('#bookshelfMoveBlock')).toBeHidden();
    await page.locator('#bookshelfOn').check();
    await expect(page.locator('#bookshelfMoveBlock')).toBeVisible();
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.move')).toBe(null);                    // where it starts
    await page.locator('#bookshelfY').fill('1000');
    await expect(page.locator('#bookshelfYValue')).toHaveText('1000');
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.move')).toMatchObject({ y: 1000, turn: 0 });
    await page.locator('#bookshelfTurn').fill('90');
    await expect(page.locator('#bookshelfTurnValue')).toHaveText('90°');
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.move')).toMatchObject({ y: 1000, turn: 90 });
    await page.click('#bookshelfHome');
    expect(await setting(page, 'pieces.bookcase.in.livingRoom.move')).toBe(null);                    // where it starts
    await expect(page.locator('#bookshelfTurnValue')).toHaveText('0°');
  });

  // The sofa's place, in.livingRoom.move: null where it starts, centred on the TV,
  // else its middle's x and y and how far it's turned, in quarter turns
  test('the sofa can be moved and turned, and its place round-trips through the address', async ({ page }) => {
    await openTab(page, 'Furniture');
    await page.selectOption('#sofaPick', 'merton');
    await page.click('#sofaHome');                                     // the Drift's place by Billy, as the page opens
    expect(await setting(page, 'pieces.sofa.in.livingRoom.move')).toBe(null);               // where it starts, facing the TV
    await expect(page.locator('#sofaFront')).toBeVisible();
    await page.locator('#sofaX').fill('1500');
    await page.locator('#sofaY').fill('2000');
    await page.selectOption('#sofaTurn', '90');
    expect(await setting(page, 'pieces.sofa.in.livingRoom.move')).toEqual({ x: 1500, y: 2000, turn: 90 });
    await expect(page.locator('#sofaFront')).toBeHidden();         // moved, its sliders say where
    // Turned a quarter, its 1690 width runs along the room and its 1000 depth across
    await expect(page.locator('#summary')).toContainText('its middle at x 1500, y 2000, facing the right-hand wall (x 1000-2000, y 1155-2845)');
    const moved = await hash(page);
    await openRoom(page, moved);
    expect(await hash(page)).toBe(moved);
    await expect(page.locator('#sofaXValue')).toHaveText('1500');
    await expect(page.locator('#sofaYValue')).toHaveText('2000');
    await expect(page.locator('#sofaTurn')).toHaveValue('90');
    await openOptions(page);
    await page.click('#sofaHome');
    expect(await setting(page, 'pieces.sofa.in.livingRoom.move')).toBe(null);               // where it starts, facing the TV
    await expect(page.locator('#sofaTurn')).toHaveValue('0');
    await expect(page.locator('#summary')).toContainText('Its front is 1900 from the TV wall');
  });

  test('the island can only be moved when it is out in the room', async ({ page }) => {
    await openTab(page, 'Furniture');
    await expect(page.locator('#islandMoveBlock')).toBeVisible();
    await page.check('input[name=islandAt][value="out"]');
    await expect(page.locator('#islandMoveBlock')).toBeHidden();
  });

  test('a number key chooses an option', DESKTOP, async ({ page, isMobile }) => {
    test.skip(isMobile, 'no keyboard on a phone');
    await page.click('#loungeClose');
    await page.keyboard.press('9');
    await expect(page.locator('#current option:checked')).toHaveText(/^9\. /);
    expect(await optionShown(page)).toBe(9);
  });
});

test.describe('the pop-up menus', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });
  const MENUS = ['#viewMenu', '#configurationMenu'];

  test('each opens on its button and closes the others', async ({ page }) => {
    for (const menu of MENUS) {
      await page.locator(`${menu} .popToggle`).click();
      for (const other of MENUS) {
        const open = other === menu;
        await expect(page.locator(other)).toHaveClass(open ? /\bopen\b/ : /^(?!.*\bopen\b)/);
        await expect(page.locator(`${other} .group`)).toBeVisible({ visible: open });
        await expect(page.locator(`${other} .popToggle`)).toHaveAttribute('aria-expanded', String(open));
      }
    }
    // Its own button again closes it
    await page.locator('#configurationMenu .popToggle').click();
    await expect(page.locator('#configurationMenu .group')).toBeHidden();
  });

  test('Escape closes it; moving about in the 3D view does not', async ({ page }) => {
    await page.locator('#viewMenu .popToggle').click();
    await page.locator('#view canvas').click({ position: { x: 200, y: 400 } });
    await expect(page.locator('#viewGroup')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#viewGroup')).toBeHidden();
  });

  test('a 2D view goes into the address, with its Dimensions button', async ({ page }) => {
    const dims = page.locator('#dims');
    await expect(dims).toBeHidden();                            // 3D views have no dimensions
    await page.selectOption('#loungeViewKind', 'plan');
    await expect.poll(async () => (await viewOf(page)).view).toBe('plan');
    await expect(dims).toHaveText('Dimensions: on');
    await dims.click();
    await expect(dims).toHaveText('Dimensions: off');
    // and into the address: loaded again, they're off still
    await expect.poll(async () => readAddress(await page.evaluate(() => location.hash)).view.dimensions).toBe(false);
    await openRoom(page, await page.evaluate(() => location.hash));
    await expect(dims).toHaveText('Dimensions: off');
  });

  test('Configuration: choosing one loads its settings', async ({ page }) => {
    // Option 7's settings saved on this device, then the default page opened
    await openRoom(page, OPTION_7);
    const configuration = await configurationOf(page);
    await page.locator('#configurationMenu .popToggle').click();
    page.once('dialog', d => d.accept('Option 7'));
    await page.click('#saveConfiguration');
    await openRoom(page);
    await page.locator('#configurationMenu .popToggle').click();
    await page.selectOption('#configurationPick', 'saved:Option 7');
    // The page loads again with its settings, keeping the view
    await page.waitForFunction(saved => JSON.stringify(window.plans?.export()) === saved, JSON.stringify(configuration));
  });
});

test.describe('Share and Reset', () => {
  test('Share copies the address, or opens the share sheet on a phone', DESKTOP, async ({ page, isMobile }) => {
    // A stand-in for the clipboard and share sheet, so the test doesn't touch
    // the real clipboard (shared by every test running at once, and yours)
    await page.addInitScript(() => {
      window.sent = [];
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.sent.push(text); } } });
      Object.defineProperty(navigator, 'share', { value: async data => { window.sent.push(data.url); } });
    });
    await openRoom(page, OPTION_7);
    await page.click('#share');
    if (!isMobile) await expect(page.locator('#share')).toHaveText('Link copied');
    // Always a link to the published page, so it works for others
    const hash = await page.evaluate(() => location.hash);
    await expect.poll(() => page.evaluate(() => window.sent)).toEqual([`https://andrewrobinson.github.io/plans/index.html${hash}`]);
  });

  test('Screenshot copies a PNG of the view', DESKTOP, async ({ page }) => {
    // A stand-in for the clipboard, as for Share, keeping the picture's type
    // and size
    await page.addInitScript(() => {
      window.copied = [];
      Object.defineProperty(navigator, 'clipboard', { value: { write: async items => {
        const png = await items[0].getType('image/png');
        window.copied.push({ type: png.type, size: png.size });
      } } });
    });
    await openRoom(page, OPTION_7);
    await page.click('#screenshot');
    await expect(page.locator('#screenshot')).toHaveText('Copied');
    const [copied] = await page.evaluate(() => window.copied);
    expect(copied.type).toBe('image/png');
    expect(copied.size).toBeGreaterThan(10000);                 // a picture, not a blank canvas (a few hundred bytes)
  });

  // ...saying so as it goes, and forgetting the view remembered on this device
  test('Reload goes to the default page, with nothing to confirm', async ({ page }) => {
    await openRoom(page, OPTION_7);
    const remembered = ['room_3d:viewKind:bedroom', 'room_3d:secOtherRoom_extras', 'room_3d:secCupboard', 'aboutOpen', 'paletteOpen', 'room_3d:sheetHeight'];
    await page.evaluate(keys => { for (const k of keys) localStorage.setItem(k, '1'); localStorage.setItem('room_3d:savedViews', '[]'); }, remembered);
    await page.click('#menu');                                  // in Other options (notes/UI_CRITIQUE.md, step 2)
    await page.click('#reload');
    await expect.poll(() => configurationOf(page).catch(() => 'loading')).toEqual(DEFAULT.configuration);
    await expect(page.locator('#reload')).toHaveText('Reload');
    const stored = await page.evaluate(keys => keys.map(k => localStorage.getItem(k)), [...remembered, 'room_3d:savedViews']);
    expect(stored).toEqual([...remembered.map(() => null), '[]']);   // all forgotten but the saved views
  });

  // Reset forgets everything, the saved views and configurations too, once
  // confirmed (asked for, 19 Oct 2026); declined, it does nothing
  test('Reset forgets everything once confirmed', async ({ page }) => {
    await openRoom(page, OPTION_7);
    const kept = ['room_3d:savedViews', 'room_3d:secCupboard', 'aboutOpen'];
    await page.evaluate(keys => { for (const k of keys) localStorage.setItem(k, '1'); }, kept);
    await page.click('#menu');
    page.once('dialog', dialog => dialog.dismiss());
    await page.click('#reset');
    await expect(page.locator('#reset')).toHaveText('Reset');
    expect(await page.evaluate(() => localStorage.length)).toBeGreaterThanOrEqual(kept.length);   // declined: all still there
    page.once('dialog', dialog => dialog.accept());
    await page.click('#reset');
    await expect.poll(() => configurationOf(page).catch(() => 'loading')).toEqual(DEFAULT.configuration);
    const left = await page.evaluate(keys => keys.map(k => localStorage.getItem(k)), kept);
    expect(left).toEqual(kept.map(() => null));
  });
});
