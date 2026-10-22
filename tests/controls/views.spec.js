// The controls tests: the room buttons' views and the Look menu, the Configuration menu, a walk through the menus, and the 2D views' door sizes and the cutting list.
// The helpers they share are in helpers.js.
const {
  test, expect, openOptions, openRoom, configurationOf, setting, optionShown, saved, inPlan, hash, 
  settledHash, view, any, openDrawer, OPTION, SOFA, at, slide, toggle
} = require('./helpers');

// The views are in each room button's ▾ (the Views menu went, 21 Oct 2026:
// notes/VIEWS_MENU.md); the Look menu has Where, Looking at, eye height and looks
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
  // notes/VIEWS_MENU.md has them; and every choice goes to its room and view
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

  // Greyed out till there's a look to save, saying why (notes/UI_CRITIQUE.md, step 9)
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
