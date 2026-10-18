// index.html: saved addresses look the same, give the same snapshot
// (tests/snapshots/) and round-trip, and the menus work. See REFACTOR_PLAN.md. Every test also fails on a console error
// (helpers.js).
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { test, expect, openOptions, openSection, openRoom, addressOf, readAddress, configurationOf, viewOf, pickOption, setting, optionShown, expectSnapshot } = require('./helpers');
const { ADDRESSES } = require('./addresses');

// The configurations in living_room.configurations.js, read the way the page reads them
const configurationsFile = fs.readFileSync(path.join(__dirname, '..', 'living_room.configurations.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(configurationsFile, sandbox);
const CONFIGURATIONS = Object.entries(sandbox.window.ROOM_CONFIGURATIONS.list);

// The default page's configuration and view
const DEFAULT = ADDRESSES.find(a => a.name === 'default');
// Option 10 with the bench and the dresser, where the controls' tests start
const DESIGNED = (({ configuration, view }) => addressOf(configuration, view))(ADDRESSES.find(a => a.name === 'designed'));
const OPTION_7 = (({ configuration, view }) => addressOf(configuration, view))(ADDRESSES.find(a => a.name === 'option07'));

test.describe('saved addresses', () => {
  for (const { name, configuration, view } of ADDRESSES) {
    test(`${name} looks the same and round-trips`, async ({ page }) => {
      await openRoom(page, addressOf(configuration, view));
      expect(await configurationOf(page)).toEqual(configuration);
      expect(await viewOf(page)).toEqual(view);
      await expectSnapshot(page, name);
      await expect(page).toHaveScreenshot(`${name}.png`);
    });
  }

  for (const [id, { configuration }] of CONFIGURATIONS) {
    test(`configuration ${id} looks the same and round-trips`, async ({ page }) => {
      await openRoom(page, addressOf(configuration));
      // A configuration leaves out the view, so the page shows its starting one
      expect(await configurationOf(page)).toEqual(configuration);
      expect(await viewOf(page)).toEqual(DEFAULT.view);
      await expectSnapshot(page, `configuration-${id}`);
      await expect(page).toHaveScreenshot(`configuration-${id}.png`);
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

test.describe('the settings drawers', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });

  test('☰ opens it, ✕ and Escape close it', async ({ page }) => {
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

test.describe('the controls', () => {
  test.beforeEach(async ({ page }) => {
    await openRoom(page, DESIGNED);
    await openOptions(page);
  });
  const hash = page => page.evaluate(() => location.hash);

  test('a slider updates its number and the address', async ({ page }) => {
    await openOptions(page);
    await page.locator('#rear').fill('500');
    await expect(page.locator('#rearValue')).toHaveText('500');
    expect(await setting(page, 'cornerCupboard.R')).toBe(500);
  });

  test('the board thickness slider updates its number and the address', async ({ page }) => {
    await openOptions(page);
    await page.locator('#board').fill('22');
    await expect(page.locator('#boardValue')).toHaveText('22');
    expect(await setting(page, 'cornerCupboard.BOARD')).toBe(22);
  });

  test('the left-wall depth slider shows "none" below 300', async ({ page }) => {
    await openOptions(page);
    await pickOption(page, 7);                                   // option 10, as the page opens, has no left-wall cupboard
    await page.locator('#depth').fill('450');
    await expect(page.locator('#depthValue')).toHaveText('450');
    expect(await setting(page, 'cornerCupboard.T')).toBe(450);
    await page.locator('#depth').fill('290');
    await expect(page.locator('#depthValue')).toHaveText('none');
    expect(await setting(page, 'cornerCupboard.T')).toBe(0);
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

  test('"Above the bench" shows the TV and shelf sliders that apply', async ({ page }) => {
    const tv = page.locator('#tvBlock'), shelf = page.locator('#shelfBlock');
    const cases = [['0', false, false], ['1', false, true], ['2', true, false], ['3', true, true], ['4', true, true]];
    for (const [value, tvShown, shelfShown] of cases) {
      await page.check(`input[name=above][value="${value}"]`);
      await expect(tv).toBeVisible({ visible: tvShown });
      await expect(shelf).toBeVisible({ visible: shelfShown });
      expect(await setting(page, 'above')).toBe(Number(value));
    }
  });

  test('the bench switch hides the bench settings', async ({ page }) => {
    await page.locator('#benchOn').uncheck();
    await expect(page.locator('#benchDetails')).toBeHidden();
    expect(await setting(page, 'benchOn')).toBe(false);
    await page.locator('#benchOn').check();
    await expect(page.locator('#benchDetails')).toBeVisible();
    expect(await setting(page, 'benchOn')).toBe(true);
  });

  // The bedroom's lower recess cupboard (otherRoom.lowerD) and mirror (otherRoom.mirror)
  test('the bedroom\'s reset buttons, and the mirror\'s wall', async ({ page }) => {
    await openOptions(page, 'bedroom');
    for (const section of ['extras', 'recess']) await openSection(page, `secOtherRoom_${section}`);
    const recess = page.locator('#otherRoomPiece_recess');
    const mirror = page.locator('#otherRoomPiece_mirror');
    await page.locator('#otherRoom_lowerD').fill('800');
    expect(await setting(page, 'otherRoom.lowerD')).toBe(800);
    await recess.getByRole('button', { name: 'Reset dimensions' }).click();
    expect(await setting(page, 'otherRoom.lowerD')).toBe(301);
    await page.locator('#otherRoom_upperDrawers').check();             // the upper cupboard's drawers and mirrors
    expect(await setting(page, 'otherRoom')).toMatchObject({ upperDrawers: true, upperMirrors: false });
    await page.locator('#otherRoom_upperMirrors').check();
    expect(await setting(page, 'otherRoom')).toMatchObject({ upperDrawers: true, upperMirrors: true });
    await page.selectOption('#otherRoom_mirror_wall', 'kitchen');
    await expect(page.locator('#otherRoom_mirror_alongLabel')).toHaveText('Middle from the hallway wall');
    expect(await setting(page, 'otherRoom.mirror')).toEqual({ wall: 'kitchen', along: 2569, bottom: 1400, w: 1000, h: 800 });
    await page.locator('#otherRoom_mirror_w').fill('600');
    await mirror.getByRole('button', { name: 'Reset location' }).click();
    expect(await setting(page, 'otherRoom.mirror')).toEqual({ wall: 'breast', along: 2569, bottom: 1400, w: 600, h: 800 });   // its size kept
    await mirror.getByRole('button', { name: 'Reset dimensions' }).click();
    expect(await setting(page, 'otherRoom.mirror')).toEqual({ wall: 'breast', along: 2569, bottom: 1400, w: 1000, h: 800 });
  });

  test('the bookshelf takes the bench\'s place and turns its switch off', async ({ page }) => {
    await page.locator('#bookshelfOn').check();
    await expect(page.locator('#benchOn')).toBeDisabled();
    await expect(page.locator('#benchOn')).not.toBeChecked();
    await expect(page.locator('#benchDetails')).toBeHidden();
    expect(await setting(page, 'bookshelfOn')).toBe(true);
    await page.locator('#bookshelfOn').uncheck();
    await expect(page.locator('#benchOn')).toBeEnabled();
    await expect(page.locator('#benchOn')).toBeChecked();             // the bench as it was
    expect(await setting(page, 'bookshelfOn')).toBe(false);
  });

  // The bedroom's pine cupboard in the living room (pineOn; its place,
  // pineMove) and in the bedroom (otherRoom.cupboardOn), each on its
  // own; in the bench's place, with the bookshelf too if it's on
  test('the pine cupboard can be on the back wall and in the bedroom, each on its own', async ({ page }) => {
    await expect(page.locator('#pineMoveBlock')).toBeHidden();
    await page.locator('#pineOn').check();
    await expect(page.locator('#benchOn')).toBeDisabled();
    await expect(page.locator('#pineMoveBlock')).toBeVisible();
    expect(await setting(page, 'pineOn')).toBe(true);
    expect(await setting(page, 'pineMove')).toBe(null);                    // where it starts
    await page.locator('#pineY').fill('1000');
    expect(await setting(page, 'pineMove')).toMatchObject({ y: 1000, turn: 0 });
    await page.locator('#pineHome').click();
    expect(await setting(page, 'pineMove')).toBe(null);                    // where it starts
    await page.locator('#bookshelfOn').check();
    await page.locator('#pineOn').uncheck();
    await expect(page.locator('#benchOn')).toBeDisabled();            // the bookshelf's still there
    expect(await setting(page, 'otherRoom.cupboardOn')).toBe(true);
    await openOptions(page, 'bedroom');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_cupboardOn').uncheck();
    expect(await setting(page, 'otherRoom.cupboardOn')).toBe(false);
    expect(await setting(page, 'bookshelfOn')).toBe(true);           // the living room's kept
  });

  // Billy, from the garage, in the living room (billyOn, billyLying; its
  // place, billyMove) and in the bedroom (otherRoom.billyOn, on any wall),
  // each on its own, as the pine cupboard; lying, it's 2020 along its wall
  test('Billy can be on the back wall and in the bedroom, standing or lying', async ({ page }) => {
    await expect(page.locator('#billyMoveBlock')).toBeHidden();
    await page.locator('#billyOn').check();
    await expect(page.locator('#benchOn')).toBeDisabled();
    await page.locator('#billyLying').check();
    expect(await setting(page, 'billyLying')).toBe(true);
    expect(await setting(page, 'billyMove')).toBe(null);                   // against the cupboards, where the bench starts
    await page.locator('#billyY').fill('500');
    expect(await setting(page, 'billyMove')).toMatchObject({ y: 500, turn: 0 });
    await page.locator('#billyHome').click();
    expect(await setting(page, 'billyMove')).toBe(null);
    expect(await setting(page, 'otherRoom.billyOn')).toBe(false);          // the bedroom's its own
    await openOptions(page, 'bedroom');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_billyOn').check();
    expect(await setting(page, 'otherRoom.billy')).toEqual({ wall: 'breast', along: 2569, lying: false });
    await page.locator('#otherRoom_billy_lying').check();
    await page.selectOption('#otherRoom_billy_wall', 'hallway');
    await expect(page.locator('#otherRoom_billy_along')).toHaveAttribute('min', '1010');   // half its 2020 lying
    expect(await setting(page, 'otherRoom.billy')).toEqual({ wall: 'hallway', along: 2569, lying: true });
    expect(await setting(page, 'billyOn')).toBe(true);                     // the living room's kept
    expect(await setting(page, 'garage.billy.on')).toBe(true);             // and the garage's
  });

  // BillyChest, as Billy but with no lying: in the living room
  // (billyChestOn, billyChestMove) and in the bedroom (otherRoom.billyChestOn,
  // on any wall), each on its own
  test('BillyChest can be on the back wall and in the bedroom', async ({ page }) => {
    await page.locator('#billyChestOn').check();
    await expect(page.locator('#benchOn')).toBeDisabled();
    await page.locator('#billyChestY').fill('500');
    expect(await setting(page, 'billyChestMove')).toMatchObject({ y: 500, turn: 0 });
    await page.locator('#billyChestHome').click();
    expect(await setting(page, 'billyChestMove')).toBe(null);
    await openOptions(page, 'bedroom');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_billyChestOn').check();
    await page.selectOption('#otherRoom_billyChest_wall', 'window');
    await expect(page.locator('#otherRoom_billyChest_along')).toHaveAttribute('min', '402.5');   // half its 805
    expect(await setting(page, 'otherRoom.billyChest')).toMatchObject({ wall: 'window' });
    expect(await setting(page, 'billyChestOn')).toBe(true);                // the living room's kept
    expect(await setting(page, 'garage.billyChest.on')).toBe(false);       // and the garage's, out as it starts
  });

  // The Ivar: in the lounge to start, lying by the first radiator; moved
  // and put back; standing; and in the bedroom and garage, each on its own
  test('the Ivar is by the first radiator, and can go to the bedroom and garage', async ({ page }) => {
    expect(await setting(page, 'ivarOn')).toBe(true);
    expect(await setting(page, 'ivarLying')).toBe(true);
    await expect(page.locator('#ivarXValue')).toHaveText('3291');      // 830 out from the radiator's front, at 3706
    await page.locator('#ivarY').fill('2000');
    expect(await setting(page, 'ivarMove')).toMatchObject({ x: 3291, y: 2000, turn: 0 });
    await page.locator('#ivarHome').click();
    expect(await setting(page, 'ivarMove')).toBe(null);
    await page.locator('#ivarLying').uncheck();
    await expect(page.locator('#ivarXValue')).toHaveText('3306');      // standing, 800 out
    await openOptions(page, 'bedroom');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_ivarOn').check();
    expect(await setting(page, 'otherRoom.ivarOn')).toBe(true);
    expect(await setting(page, 'garage.ivar')).toEqual({ on: false, x: 0, y: 1100, turn: 270 });
    expect(await setting(page, 'ivarOn')).toBe(true);                   // the lounge's kept
  });

  // The Drift, a daybed: its As a bed switch only for it, 1980 wide as a bed
  test('the Drift sofa can be laid out as a bed', async ({ page }) => {
    await expect(page.locator('#sofaAsBedRow')).toBeHidden();
    await page.selectOption('#sofaPick', 'drift');
    expect(await setting(page, 'sofa.size')).toEqual({ w: 1480, d: 790, h: 670 });
    await expect(page.locator('#sofaAsBedRow')).toBeVisible();
    await page.locator('#sofaAsBed').check();
    expect(await setting(page, 'sofa.asBed')).toBe(true);
    await expect(page.locator('#summary')).toContainText('as a bed: 1980 wide');
    await page.selectOption('#sofaPick', 'merton');
    await expect(page.locator('#sofaAsBedRow')).toBeHidden();
  });

  // The living room's corner cupboard copied into the bedroom
  // (otherRoom.newCupboardOn): the pine cupboard's switch (cupboardOn) can't
  // be used while it's there, and keeps its setting for when it's gone
  test('the new cupboard takes the bedroom pine cupboard\'s place', async ({ page }) => {
    expect(await setting(page, 'otherRoom.newCupboardOn')).toBe(false);
    await openOptions(page, 'bedroom');
    await expect(page.locator('#otherRoom_cupboardOn')).toBeEnabled();
    await page.locator('#otherRoom_newCupboardOn').check();
    expect(await setting(page, 'otherRoom.newCupboardOn')).toBe(true);
    await expect(page.locator('#otherRoom_cupboardOn')).toBeDisabled();
    expect(await setting(page, 'otherRoom.cupboardOn')).toBe(true);
    await page.locator('#otherRoom_newCupboardOn').uncheck();
    expect(await setting(page, 'otherRoom.newCupboardOn')).toBe(false);
    await expect(page.locator('#otherRoom_cupboardOn')).toBeEnabled();
  });

  // Bedroom options in sections (asked for, 18 Oct 2026), all closed to
  // start: the bed and what's by it, Extras, the recess cupboards; a piece's
  // controls hidden while it's out of the bedroom
  test('Bedroom options: its sections, and a piece out shows only its switch', async ({ page }) => {
    await openOptions(page, 'bedroom');
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

  // The bedroom's mirror (otherRoom.mirrorOn) switched off and on again
  test('the bedroom mirror can be switched off', async ({ page }) => {
    expect(await setting(page, 'otherRoom.mirrorOn')).toBe(true);
    await openOptions(page, 'bedroom');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_mirrorOn').uncheck();
    expect(await setting(page, 'otherRoom.mirrorOn')).toBe(false);
    await page.locator('#otherRoom_mirrorOn').check();
    expect(await setting(page, 'otherRoom.mirrorOn')).toBe(true);
  });

  test('the front-wall piece shows the dresser or larder settings', async ({ page }) => {
    await page.check('input[name=frontPiece][value="larder"]');
    await expect(page.locator('#larderBlock')).toBeVisible();
    await expect(page.locator('#dresserBlock')).toBeHidden();
    await page.check('input[name=frontPiece][value="none"]');
    await expect(page.locator('#larderBlock')).toBeHidden();
    await expect(page.locator('#dresserBlock')).toBeHidden();
    await page.check('input[name=frontPiece][value="bookshelf"]');
    await expect(page.locator('#bookshelfBlock')).toBeVisible();
    await expect(page.locator('#dresserBlock')).toBeHidden();
    expect(await setting(page, 'frontPiece')).toBe('bookshelf');
    await page.locator('#bookshelfW').fill('1200');             // the bedroom's bookcase's width
    expect(await setting(page, 'otherRoom.bookcase.w')).toBe(1200);
    await page.check('input[name=frontPiece][value="dresser"]');
    await expect(page.locator('#dresserBlock')).toBeVisible();
    await expect(page.locator('#bookshelfBlock')).toBeHidden();
  });

  // A bookcase on the front wall (frontPiece), the back wall (bookshelfOn)
  // and in the bedroom (otherRoom.bookcaseOn), each on its own
  test('a bookcase can be on either wall and in the bedroom, each on its own', async ({ page }) => {
    await page.check('input[name=frontPiece][value="bookshelf"]');
    await page.locator('#bookshelfOn').check();
    expect(await setting(page, 'frontPiece')).toBe('bookshelf');
    expect(await setting(page, 'bookshelfOn')).toBe(true);
    expect(await setting(page, 'otherRoom.bookcaseOn')).toBe(true);
    await openOptions(page, 'bedroom');
    await openSection(page, 'secOtherRoom_extras');
    await page.locator('#otherRoom_bookcaseOn').uncheck();
    expect(await setting(page, 'otherRoom.bookcaseOn')).toBe(false);
    expect(await setting(page, 'frontPiece')).toBe('bookshelf');           // the living room's kept
    expect(await setting(page, 'bookshelfOn')).toBe(true);
  });

  // Its place, bookshelfMove: null where it starts, else { x, y, turn }
  test('the bookshelf in the bench\'s place can be moved and turned', async ({ page }) => {
    await expect(page.locator('#bookshelfMoveBlock')).toBeHidden();
    await page.locator('#bookshelfOn').check();
    await expect(page.locator('#bookshelfMoveBlock')).toBeVisible();
    expect(await setting(page, 'bookshelfMove')).toBe(null);                    // where it starts
    await page.locator('#bookshelfY').fill('1000');
    await expect(page.locator('#bookshelfYValue')).toHaveText('1000');
    expect(await setting(page, 'bookshelfMove')).toMatchObject({ y: 1000, turn: 0 });
    await page.locator('#bookshelfTurn').fill('90');
    await expect(page.locator('#bookshelfTurnValue')).toHaveText('90°');
    expect(await setting(page, 'bookshelfMove')).toMatchObject({ y: 1000, turn: 90 });
    await page.click('#bookshelfHome');
    expect(await setting(page, 'bookshelfMove')).toBe(null);                    // where it starts
    await expect(page.locator('#bookshelfTurnValue')).toHaveText('0°');
  });

  // The sofa's place, sofa.move: null where it starts, centred on the TV,
  // else its middle's x and y and how far it's turned, in quarter turns
  test('the sofa can be moved and turned, and its place round-trips through the address', async ({ page }) => {
    await page.selectOption('#sofaPick', 'merton');
    expect(await setting(page, 'sofa.move')).toBe(null);               // where it starts, facing the TV
    await expect(page.locator('#sofaFront')).toBeVisible();
    await page.locator('#sofaX').fill('1500');
    await page.locator('#sofaY').fill('2000');
    await page.selectOption('#sofaTurn', '90');
    expect(await setting(page, 'sofa.move')).toEqual({ x: 1500, y: 2000, turn: 90 });
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
    expect(await setting(page, 'sofa.move')).toBe(null);               // where it starts, facing the TV
    await expect(page.locator('#sofaTurn')).toHaveValue('0');
    await expect(page.locator('#summary')).toContainText('Its front is 1900 from the TV wall');
  });

  test('the island can only be moved when it is out in the room', async ({ page }) => {
    await expect(page.locator('#islandMoveBlock')).toBeVisible();
    await page.check('input[name=islandAt][value="out"]');
    await expect(page.locator('#islandMoveBlock')).toBeHidden();
  });

  test('a number key chooses an option', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no keyboard on a phone');
    await page.click('#loungeClose');
    await page.keyboard.press('9');
    await expect(page.locator('#current option:checked')).toHaveText(/^9\. /);
    expect(await optionShown(page)).toBe(9);
  });
});

test.describe('the pop-up menus', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });
  const MENUS = ['#viewsMenu', '#viewMenu', '#configurationMenu'];

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

  test('Views: a 2D view goes into the address, with its Dimensions button', async ({ page }) => {
    await page.locator('#viewsMenu .popToggle').click();
    const dims = page.locator('#dims');
    await expect(dims).toBeHidden();                            // 3D views have no dimensions
    await page.selectOption('#viewPick', 'plan');
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
  test('Share copies the address, or opens the share sheet on a phone', async ({ page, isMobile }) => {
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

  test('Screenshot copies a PNG of the view', async ({ page }) => {
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
    await page.click('#reload');
    await expect.poll(() => configurationOf(page).catch(() => 'loading')).toEqual(DEFAULT.configuration);
    await expect(page.locator('#reload')).toHaveText('Reload');
    const stored = await page.evaluate(keys => keys.map(k => localStorage.getItem(k)), [...remembered, 'room_3d:savedViews']);
    expect(stored).toEqual([...remembered.map(() => null), '[]']);   // all forgotten but the saved views
  });
});
