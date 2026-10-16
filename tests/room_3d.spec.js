// index.html: saved addresses look the same and round-trip, and the menus
// work. See REFACTOR_PLAN.md. Every test also fails on a console error
// (helpers.js).
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { test, expect, openRoom, pickOption, settingsField } = require('./helpers');
const { ADDRESSES, VIEW } = require('./addresses');

// The scenes in living_room.scenes.js, read the way the page reads them
const sceneFile = fs.readFileSync(path.join(__dirname, '..', 'living_room.scenes.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(sceneFile, sandbox);
const SCENES = Object.entries(sandbox.window.ROOM_SCENES.list);

// The default page's address, as it writes it
const DEFAULT = ADDRESSES.find(a => a.name === 'default').address;

test.describe('saved addresses', () => {
  for (const { name, address } of ADDRESSES) {
    test(`${name} looks the same and round-trips`, async ({ page }) => {
      await openRoom(page, address);
      expect(await page.evaluate(() => location.hash)).toBe(address);
      await expect(page).toHaveScreenshot(`${name}.png`);
    });
  }

  for (const [id, { address }] of SCENES) {
    test(`scene ${id} looks the same and round-trips`, async ({ page }) => {
      await openRoom(page, `#${address}`);
      // A scene leaves out the view, so the page adds its default one
      expect(await page.evaluate(() => location.hash)).toBe(`#${address}~${VIEW}`);
      await expect(page).toHaveScreenshot(`scene-${id}.png`);
    });
  }

  // From before the bookshelf could move, the bedroom's bookcase be taken
  // out, the wicker bench be drawn, the pine cupboard be moved about, the
  // mirror be taken out, the carpet's colour chosen or the shoe rack be
  // drawn, the new cupboard be copied into the bedroom, the sofa be moved
  // and turned, or Sean, Billy, BillyChest and the rest be placed in the garage: their twenty-five
  // fields left off the end, so the bookshelf's against the wall, the
  // bookcase, the pine cupboard and the mirror in the bedroom, the bench in
  // the hallway, no pine cupboard in the living room, the carpet as in the
  // doorway photo, the shoe rack at the foot of the stairs and no new
  // cupboard in the bedroom, the sofa where it starts, and the garage's
  // things where they start, as they start
  test('a link without the bookshelf\'s place, the bedroom bookcase, the wicker bench, the pine cupboard, the mirror, the carpet, the shoe rack, the new cupboard, the sofa\'s place or the garage\'s keeps them as they start', async ({ page }) => {
    const [settings, ...rest] = DEFAULT.split('~');
    await openRoom(page, [settings.split('-').slice(0, -25).join('-'), ...rest].join('~'));
    expect(await page.evaluate(() => location.hash)).toBe(DEFAULT);
  });

  test('no address gives the default page', async ({ page }) => {
    await openRoom(page);
    expect(await page.evaluate(() => location.hash)).toBe(DEFAULT);
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

  test('the scrim dims the model on a phone, and a tap on it closes the drawer', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the scrim is only shown on narrow screens');
    await page.click('#menu');
    const scrim = page.locator('#scrim');
    await expect(scrim).toBeVisible();
    const { width } = page.viewportSize();
    await scrim.click({ position: { x: width - 15, y: 400 } });   // beside the drawer
    await expect(page.locator('#panel')).not.toBeInViewport();
    await expect(scrim).toBeHidden();
  });

  // Cupboard options and Other options (☰), one open at a time; they open
  // below the top bar, so its buttons and option list still work
  test('Cupboard options has its own drawer, and one drawer is open at a time', async ({ page }) => {
    const other = page.locator('#panel'), cupboard = page.locator('#cupPanel');
    await expect(cupboard).not.toBeInViewport();
    await page.click('#cupMenu');
    await expect(cupboard).toBeInViewport();
    await expect(page.locator('#cupMenu')).toHaveAttribute('aria-expanded', 'true');
    await page.click('#menu');
    await expect(other).toBeInViewport();
    await expect(cupboard).not.toBeInViewport();
    await expect(page.locator('#cupMenu')).toHaveAttribute('aria-expanded', 'false');
    await page.click('#cupMenu');
    await expect(cupboard).toBeInViewport();
    await expect(other).not.toBeInViewport();
    await page.click('#cupClose');
    await expect(cupboard).not.toBeInViewport();
  });

  test('the option list is in the top bar, and works with a drawer open', async ({ page }) => {
    await page.click('#cupMenu');
    await pickOption(page, 9);
    await expect(page.locator('#wardBlock')).toBeVisible();        // its sliders, in the drawer
    expect(settingsField(await page.evaluate(() => location.hash), 0)).toBe('9');
  });
});

test.describe('the controls', () => {
  test.beforeEach(async ({ page }) => {
    await openRoom(page);
    await page.click('#menu');
  });
  const hash = page => page.evaluate(() => location.hash);

  test('a slider updates its number and the address', async ({ page }) => {
    await page.click('#cupMenu');
    await page.locator('#rear').fill('500');
    await expect(page.locator('#rearValue')).toHaveText('500');
    expect(settingsField(await hash(page), 2)).toBe('500');
  });

  test('the board thickness slider updates its number and the address', async ({ page }) => {
    await page.click('#cupMenu');
    await page.locator('#board').fill('22');
    await expect(page.locator('#boardValue')).toHaveText('22');
    expect(settingsField(await hash(page), 31)).toBe('22');
  });

  test('the left-wall depth slider shows "none" below 300', async ({ page }) => {
    await page.click('#cupMenu');
    await pickOption(page, 7);                                   // option 10, as the page opens, has no left-wall cupboard
    await page.locator('#depth').fill('450');
    await expect(page.locator('#depthValue')).toHaveText('450');
    expect(settingsField(await hash(page), 1)).toBe('450');
    await page.locator('#depth').fill('290');
    await expect(page.locator('#depthValue')).toHaveText('none');
    expect(settingsField(await hash(page), 1)).toBe('0');
  });

  test('each option shows its own slider blocks', async ({ page }) => {
    await page.click('#cupMenu');
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
    await page.click('#cupMenu');
    await pickOption(page, 7);                                   // for the left-wall depth slider
    await page.locator('#depth').fill('290');                    // none
    const option8 = page.locator('#current option', { hasText: /^8\. / });
    await expect(option8).toBeDisabled();
    await page.locator('#depth').fill('600');
    await expect(option8).toBeEnabled();
    await pickOption(page, 8);
    expect(settingsField(await hash(page), 0)).toBe('8');
  });

  test('"Above the bench" shows the TV and shelf sliders that apply', async ({ page }) => {
    const tv = page.locator('#tvBlock'), shelf = page.locator('#shelfBlock');
    const cases = [['0', false, false], ['1', false, true], ['2', true, false], ['3', true, true], ['4', true, true]];
    for (const [value, tvShown, shelfShown] of cases) {
      await page.check(`input[name=above][value="${value}"]`);
      await expect(tv).toBeVisible({ visible: tvShown });
      await expect(shelf).toBeVisible({ visible: shelfShown });
      expect(settingsField(await hash(page), 4)).toBe(value);
    }
  });

  test('the bench switch hides the bench settings', async ({ page }) => {
    await page.locator('#benchOn').uncheck();
    await expect(page.locator('#benchDetails')).toBeHidden();
    expect(settingsField(await hash(page), 26)).toBe('0');
    await page.locator('#benchOn').check();
    await expect(page.locator('#benchDetails')).toBeVisible();
    expect(settingsField(await hash(page), 26)).toBe('1');
  });

  // The bedroom's lower recess cupboard (field 40) and mirror (field 42)
  test('the bedroom\'s reset buttons, and the mirror\'s wall', async ({ page }) => {
    await page.click('#bedMenu');
    const recess = page.locator('#otherRoomBlock .depth', { hasText: 'Recess cupboards' });
    const mirror = page.locator('#otherRoomBlock .depth').last();             // the mirror's, last
    await page.locator('#otherRoom_lowerD').fill('800');
    expect(settingsField(await hash(page), 40)).toBe('800');
    await recess.getByRole('button', { name: 'Reset dimensions' }).click();
    expect(settingsField(await hash(page), 40)).toBe('301');
    await page.locator('#otherRoom_upperDrawers').check();             // the upper cupboard's drawers and mirrors (field 43)
    expect(settingsField(await hash(page), 43)).toBe('1.0');
    await page.locator('#otherRoom_upperMirrors').check();
    expect(settingsField(await hash(page), 43)).toBe('1.1');
    await page.selectOption('#otherRoom_mirror_wall', 'kitchen');
    await expect(page.locator('#otherRoom_mirror_alongLabel')).toHaveText('Middle from the hallway wall');
    expect(settingsField(await hash(page), 42)).toBe('3.2569.1400.1000.800');
    await page.locator('#otherRoom_mirror_w').fill('600');
    await mirror.getByRole('button', { name: 'Reset location' }).click();
    expect(settingsField(await hash(page), 42)).toBe('0.2569.1400.600.800');   // its size kept
    await mirror.getByRole('button', { name: 'Reset dimensions' }).click();
    expect(settingsField(await hash(page), 42)).toBe('0.2569.1400.1000.800');
  });

  test('the bookshelf takes the bench\'s place and turns its switch off', async ({ page }) => {
    await page.locator('#bookshelfOn').check();
    await expect(page.locator('#benchOn')).toBeDisabled();
    await expect(page.locator('#benchOn')).not.toBeChecked();
    await expect(page.locator('#benchDetails')).toBeHidden();
    expect(settingsField(await hash(page), 41)).toBe('1');
    await page.locator('#bookshelfOn').uncheck();
    await expect(page.locator('#benchOn')).toBeEnabled();
    await expect(page.locator('#benchOn')).toBeChecked();             // the bench as it was
    expect(settingsField(await hash(page), 41)).toBe('0');
  });

  // The bedroom's pine cupboard in the living room (pineOn, field 51; its
  // place, field 52) and in the bedroom (cupboardOn, field 50), each on its
  // own; in the bench's place, with the bookshelf too if it's on
  test('the pine cupboard can be on the back wall and in the bedroom, each on its own', async ({ page }) => {
    await expect(page.locator('#pineMoveBlock')).toBeHidden();
    await page.locator('#pineOn').check();
    await expect(page.locator('#benchOn')).toBeDisabled();
    await expect(page.locator('#pineMoveBlock')).toBeVisible();
    expect(settingsField(await hash(page), 51)).toBe('1');
    expect(settingsField(await hash(page), 52)).toBe('wall');
    await page.locator('#pineY').fill('1000');
    expect(settingsField(await hash(page), 52)).toMatch(/^\d+\.1000\.0$/);
    await page.locator('#pineHome').click();
    expect(settingsField(await hash(page), 52)).toBe('wall');
    await page.locator('#bookshelfOn').check();
    await page.locator('#pineOn').uncheck();
    await expect(page.locator('#benchOn')).toBeDisabled();            // the bookshelf's still there
    expect(settingsField(await hash(page), 50)).toBe('1');
    await page.click('#bedMenu');
    await page.locator('#otherRoom_cupboardOn').uncheck();
    expect(settingsField(await hash(page), 50)).toBe('0');
    expect(settingsField(await hash(page), 41)).toBe('1');           // the living room's kept
  });

  // The living room's corner cupboard copied into the bedroom (newCupboardOn,
  // field 56): the pine cupboard's switch (field 50) can't be used while it's
  // there, and keeps its setting for when it's gone
  test('the new cupboard takes the bedroom pine cupboard\'s place', async ({ page }) => {
    expect(settingsField(await hash(page), 56)).toBe('0');
    await page.click('#bedMenu');
    await expect(page.locator('#otherRoom_cupboardOn')).toBeEnabled();
    await page.locator('#otherRoom_newCupboardOn').check();
    expect(settingsField(await hash(page), 56)).toBe('1');
    await expect(page.locator('#otherRoom_cupboardOn')).toBeDisabled();
    expect(settingsField(await hash(page), 50)).toBe('1');
    await page.locator('#otherRoom_newCupboardOn').uncheck();
    expect(settingsField(await hash(page), 56)).toBe('0');
    await expect(page.locator('#otherRoom_cupboardOn')).toBeEnabled();
  });

  // The bedroom's mirror (mirrorOn, field 53) switched off and on again
  test('the bedroom mirror can be switched off', async ({ page }) => {
    expect(settingsField(await hash(page), 53)).toBe('1');
    await page.click('#bedMenu');
    await page.locator('#otherRoom_mirrorOn').uncheck();
    expect(settingsField(await hash(page), 53)).toBe('0');
    await page.locator('#otherRoom_mirrorOn').check();
    expect(settingsField(await hash(page), 53)).toBe('1');
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
    expect(settingsField(await hash(page), 19)).toBe('3');
    await page.locator('#bookshelfW').fill('1200');             // the bedroom's bookcase's width (field 38's fourth)
    expect(settingsField(await hash(page), 38).split('.')[3]).toBe('1200');
    await page.check('input[name=frontPiece][value="dresser"]');
    await expect(page.locator('#dresserBlock')).toBeVisible();
    await expect(page.locator('#bookshelfBlock')).toBeHidden();
  });

  // A bookcase on the front wall (front piece, field 19), the back wall
  // (bookshelfOn, field 41) and in the bedroom (field 45), each on its own
  test('a bookcase can be on either wall and in the bedroom, each on its own', async ({ page }) => {
    await page.check('input[name=frontPiece][value="bookshelf"]');
    await page.locator('#bookshelfOn').check();
    expect(settingsField(await hash(page), 19)).toBe('3');
    expect(settingsField(await hash(page), 41)).toBe('1');
    expect(settingsField(await hash(page), 45)).toBe('1');
    await page.click('#bedMenu');
    await page.locator('#otherRoom_bookcaseOn').uncheck();
    expect(settingsField(await hash(page), 45)).toBe('0');
    expect(settingsField(await hash(page), 19)).toBe('3');           // the living room's kept
    expect(settingsField(await hash(page), 41)).toBe('1');
  });

  // Its place, field 44: `wall` where it starts, else x.y.turn
  test('the bookshelf in the bench\'s place can be moved and turned', async ({ page }) => {
    await expect(page.locator('#bookshelfMoveBlock')).toBeHidden();
    await page.locator('#bookshelfOn').check();
    await expect(page.locator('#bookshelfMoveBlock')).toBeVisible();
    expect(settingsField(await hash(page), 44)).toBe('wall');
    await page.locator('#bookshelfY').fill('1000');
    await expect(page.locator('#bookshelfYValue')).toHaveText('1000');
    expect(settingsField(await hash(page), 44)).toMatch(/^\d+\.1000\.0$/);
    await page.locator('#bookshelfTurn').fill('90');
    await expect(page.locator('#bookshelfTurnValue')).toHaveText('90°');
    expect(settingsField(await hash(page), 44)).toMatch(/^\d+\.1000\.90$/);
    await page.click('#bookshelfHome');
    expect(settingsField(await hash(page), 44)).toBe('wall');
    await expect(page.locator('#bookshelfTurnValue')).toHaveText('0°');
  });

  // The sofa's place, field 57: `tv` where it starts, centred on the TV,
  // else its middle's x.y and how far it's turned, in quarter turns
  test('the sofa can be moved and turned, and its place round-trips through the address', async ({ page }) => {
    await page.selectOption('#sofaPick', 'merton');
    expect(settingsField(await hash(page), 57)).toBe('tv');
    await expect(page.locator('#sofaFront')).toBeVisible();
    await page.locator('#sofaX').fill('1500');
    await page.locator('#sofaY').fill('2000');
    await page.selectOption('#sofaTurn', '90');
    expect(settingsField(await hash(page), 57)).toBe('1500.2000.90');
    await expect(page.locator('#sofaFront')).toBeHidden();         // moved, its sliders say where
    // Turned a quarter, its 1690 width runs along the room and its 1000 depth across
    await expect(page.locator('#summary')).toContainText('its middle at x 1500, y 2000, facing the right-hand wall (x 1000-2000, y 1155-2845)');
    const moved = await hash(page);
    await openRoom(page, moved);
    expect(await hash(page)).toBe(moved);
    await expect(page.locator('#sofaXValue')).toHaveText('1500');
    await expect(page.locator('#sofaYValue')).toHaveText('2000');
    await expect(page.locator('#sofaTurn')).toHaveValue('90');
    await page.click('#menu');
    await page.click('#sofaHome');
    expect(settingsField(await hash(page), 57)).toBe('tv');
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
    await page.click('#close');
    await page.keyboard.press('9');
    await expect(page.locator('#current option:checked')).toHaveText(/^9\. /);
    expect(settingsField(await hash(page), 0)).toBe('9');
  });
});

test.describe('the pop-up menus', () => {
  test.beforeEach(async ({ page }) => { await openRoom(page); });
  const MENUS = ['#viewsMenu', '#viewMenu', '#sceneMenu'];

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
    await page.locator('#sceneMenu .popToggle').click();
    await expect(page.locator('#sceneMenu .group')).toBeHidden();
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
    await expect.poll(() => page.evaluate(() => location.hash.split('~')[2])).toMatch(/^plan\./);
    await expect(dims).toHaveText('Dimensions: on');
    await dims.click();
    await expect(dims).toHaveText('Dimensions: off');
  });

  test('Scenes: choosing one loads its settings', async ({ page }) => {
    const [id, { address }] = SCENES[0];
    await page.locator('#sceneMenu .popToggle').click();
    await page.selectOption('#scenePick', id);
    // The page loads again with the scene's settings, keeping the view
    await page.waitForURL(url => url.hash.startsWith(`#${address}~`));
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
    await openRoom(page, ADDRESSES.find(a => a.name === 'option07').address);
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
    await openRoom(page, ADDRESSES.find(a => a.name === 'option07').address);
    await page.click('#screenshot');
    await expect(page.locator('#screenshot')).toHaveText('Copied');
    const [copied] = await page.evaluate(() => window.copied);
    expect(copied.type).toBe('image/png');
    expect(copied.size).toBeGreaterThan(10000);                 // a picture, not a blank canvas (a few hundred bytes)
  });

  test('Reset asks first, then goes back to the default page', async ({ page }) => {
    await openRoom(page, ADDRESSES.find(a => a.name === 'option07').address);
    // Cancelled: nothing changes
    page.once('dialog', d => d.dismiss());
    await page.click('#reset');
    expect(settingsField(await page.evaluate(() => location.hash), 0)).toBe('7');
    // Accepted
    page.once('dialog', d => {
      expect(d.message()).toBe('Reset all settings?');
      d.accept();
    });
    await page.click('#reset');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe(DEFAULT);
  });
});
