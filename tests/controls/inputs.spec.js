// The controls tests: sliders, radio buttons, dropdowns, switches and buttons.
// The helpers they share are in helpers.js.
const {
  test, expect, openOptions, setting, hash, settledHash, view, openDrawer, OPTION, BENCH, DRESSER, 
  LARDER, SOFA, LEFT_CUPBOARD, at, slide, toggle, endsAndBack
} = require('./helpers');

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

  test('the island\'s shelves and chairs', async ({ page }) => {
    const before = await hash(page);
    for (const value of ['facing', 'trolleys', 'drawers', 'standard']) {
      await page.check(`input[name=islandLayout][value="${value}"]`);
      expect(await setting(page, 'pieces.island.design.layout')).toBe(value);
    }
    for (const value of ['out', 'none', 'in']) {
      await page.check(`input[name=islandChairs][value="${value}"]`);
      expect(await setting(page, 'pieces.island.in.livingRoom.chairs')).toBe(value);
    }
    expect(await hash(page)).toBe(before);
  });

  // The custom island has its size, not IKEA's shelves
  test('which island, and the custom one\'s size', async ({ page }) => {
    const before = await hash(page);
    await page.check('input[name=islandType][value="custom"]');
    expect(await setting(page, 'pieces.island.design.type')).toBe('custom');
    await expect(page.locator('#islandLayoutRow')).toBeHidden();
    await endsAndBack(page, 'islandLength', at('pieces.island.design.custom.length'));
    await endsAndBack(page, 'islandWidth', at('pieces.island.design.custom.width'));
    await endsAndBack(page, 'islandOverhang', at('pieces.island.design.custom.overhang'));
    await page.check('input[name=islandType][value="ikea"]');
    await expect(page.locator('#islandSizeBlock')).toBeHidden();
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

// The browser's history: one entry per change, a slider's whole drag being
// one, and Back and Forward taking the page's settings with them. Dragged
// with the mouse: an entry is added only in answer to the user, which a
// scripted event isn't
test.describe('Back and Forward', () => {
  // A drag of a slider's thumb from where it stands to `value`, in steps
  const DRAG_STEPS = 5;                                          // chosen: several input events, as a hand's drag gives
  async function drag(page, id, value) {
    const slider = page.locator(`#${id}`);
    await slider.scrollIntoViewIfNeeded();
    const { min, max, now } = await slider.evaluate(el => ({ min: Number(el.min), max: Number(el.max), now: Number(el.value) }));
    const box = await slider.boundingBox();
    const xOf = v => box.x + box.width * (v - min) / (max - min);
    const y = box.y + box.height / 2;
    await page.mouse.move(xOf(now), y);
    await page.mouse.down();
    await page.mouse.move(xOf(value), y, { steps: DRAG_STEPS });
    await page.mouse.up();
  }
  const entries = page => page.evaluate(() => history.length);
  const SOFA_X = at('pieces.sofa.in.livingRoom.move.x');
  const SOFA_Y = at('pieces.sofa.in.livingRoom.move.y');

  test('a drag is one change, undone by Back', async ({ page }) => {
    await openDrawer(page);
    await settledHash(page);
    const startEntries = await entries(page);
    expect(startEntries, 'none added as the page opens').toBeLessThanOrEqual(2);   // the page, after the browser's blank one
    const [startX, startY] = [await SOFA_X(page), await SOFA_Y(page)];
    await drag(page, 'sofaX', 600);
    await settledHash(page);
    const draggedX = await SOFA_X(page);
    expect(draggedX).not.toBe(startX);
    await drag(page, 'sofaY', 2000);
    await settledHash(page);
    expect(await SOFA_Y(page)).not.toBe(startY);
    expect(await entries(page), 'one entry per drag').toBe(startEntries + 2);

    await page.goBack();
    await expect.poll(() => SOFA_Y(page), 'Back undoes the second drag').toBe(startY);
    expect(await SOFA_X(page)).toBe(draggedX);
    await page.goBack();
    await expect.poll(() => SOFA_X(page), '...then the first').toBe(startX);
    await page.goForward();
    await expect.poll(() => SOFA_X(page), 'Forward redoes it').toBe(draggedX);
    await expect(page.locator('#sofaXValue')).toHaveText(draggedX);
  });
});
