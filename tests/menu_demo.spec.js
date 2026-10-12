// menu_demo.html: one test group per KIND in the page, to learn Playwright
// on a page small enough to read alongside. Run just this file with
//
//   npx playwright test menu_demo
//   npx playwright test menu_demo --ui          (watch each step, time-travel through it)
//   npx playwright test menu_demo --headed --project=desktop   (see the browser)
//
// THE FOUR IDEAS YOU NEED
//
// 1. `page` is a browser tab. Each test gets a fresh one, with empty storage,
//    so tests can't affect each other.
//
// 2. A LOCATOR is a description of how to find an element, not the element
//    itself: page.locator('#width'), page.getByRole('button', { name: 'Share' }),
//    page.getByLabel('Style'). It's looked up again each time it's used, so it
//    still works after the page has re-rendered. Prefer getByRole and
//    getByLabel: they find things the way a person (or a screen reader) does,
//    so a test written with them also checks the page is accessible.
//
// 3. ACTIONS (click, fill, check, selectOption, press) wait by themselves
//    until the element is there, visible, enabled and not moving, then act.
//    No sleeps needed.
//
// 4. WEB-FIRST ASSERTIONS: `await expect(locator).toHaveText(...)` retries
//    until it's true or the timeout passes (15 s here, playwright.config.js).
//    Use them for anything on the page. A plain `expect(value).toBe(...)`
//    checks once, so use it for values you've already read.
//
// `test.describe` groups tests; `test.beforeEach` runs before each test in
// its group. `test` here comes from helpers.js: Playwright's own, plus a
// check that the console stayed free of errors.
const { test, expect } = require('./helpers');

// Every test starts with the page open at its defaults
test.beforeEach(async ({ page }) => {
  await page.goto('menu_demo.html');
});

// The text area that shows the state. Many tests check it, as the page's
// "what's on screen".
const stateView = page => page.getByRole('textbox', { name: 'UI state' });

// The ☰ button. STRICT MODE: an action or assertion on a locator that
// matches more than one element fails, rather than guessing which you meant.
// A name matches if it CONTAINS the text, so { name: 'Settings' } finds both
// ☰ ("Settings") and ✕ ("Close settings"); exact: true matches it whole.
const burger = page => page.getByRole('button', { name: 'Settings', exact: true });

test.describe('KIND 1: the full-screen view', () => {
  test('shows the state as text', async ({ page }) => {
    // toHaveValue is for form fields (a textarea's text is its value). A
    // regular expression matches part of it; a string must match all of it.
    await expect(stateView(page)).toHaveValue(/"style": "open"/);
    await expect(stateView(page)).toHaveValue(/Drawer:\s+closed/);
  });

  test('is read-only', async ({ page }) => {
    await expect(stateView(page)).not.toBeEditable();
  });
});

test.describe('KIND 2: the top-level buttons', () => {
  test('Share copies the address', async ({ page }) => {
    // The real clipboard is shared by every test running at once (and is
    // yours), so swap in a stand-in. addInitScript runs a script in the page
    // before the page's own scripts, on every load from now on, so load the
    // page again for it to apply.
    await page.addInitScript(() => {
      window.copied = [];
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copied.push(text); } } });
    });
    await page.reload();

    // Not getByRole('button', { name: 'Share' }): a locator is looked up
    // afresh each time, and once the button says "Link copied" no button is
    // called Share. For an element whose text changes, use something that
    // doesn't, such as its id.
    const share = page.locator('#share');
    await share.click();
    await expect(share).toHaveText('Link copied');
    // page.evaluate runs a function inside the page and hands back the result
    expect(await page.evaluate(() => window.copied)).toEqual([page.url()]);
    // The button says Share again after 2 s; toHaveText waits for it
    await expect(share).toHaveText('Share');
  });

  test('Reset asks first, and does nothing if you cancel', async ({ page }) => {
    await page.getByLabel(/Width/).fill('1200');
    // window.confirm() opens a dialog, which Playwright reports as a
    // 'dialog' event. Answer it before the click that opens it: page.once
    // handles just the next one.
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('#widthValue')).toHaveText('1200');
  });

  test('Reset, accepted, goes back to the defaults', async ({ page }) => {
    await page.getByLabel(/Width/).fill('1200');
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toBe('Reset all settings?');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Reset' }).click();
    // The page reloads; the assertion simply waits for the new page
    await expect(page.locator('#widthValue')).toHaveText('900');
    await expect(page).toHaveURL(/width=900/);
  });
});

test.describe('KIND 3: the drawer', () => {
  test('☰ opens it and ✕ closes it', async ({ page }) => {
    const panel = page.locator('#panel');
    const menuButton = burger(page);                          // found by its aria-label

    // The drawer is always in the page; when closed it's moved off-screen
    // with a CSS transform. So check whether it's in the viewport, not
    // whether it's "visible".
    await expect(panel).not.toBeInViewport();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await menuButton.click();
    await expect(page.locator('body')).toHaveClass(/menu-open/);   // the only thing the JS changes
    await expect(panel).toBeInViewport();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(stateView(page)).toHaveValue(/Drawer:\s+open/);

    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(panel).not.toBeInViewport();
  });

  test('Escape closes it', async ({ page }) => {
    await burger(page).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#panel')).not.toBeInViewport();
  });

  test('the scrim shows on a phone, and a tap on it closes the drawer', async ({ page, isMobile }) => {
    // isMobile is true in the 'iphone' project (playwright.config.js)
    test.skip(!isMobile, 'the scrim only shows at 900px wide or less');
    const scrim = page.locator('#scrim');
    await expect(scrim).toBeHidden();
    await burger(page).click();
    await expect(scrim).toBeVisible();
    // Most of the scrim is under the drawer, so tap it to the drawer's right.
    // A click lands in the middle of an element unless told otherwise.
    const { width } = page.viewportSize();
    await scrim.click({ position: { x: width - 15, y: 300 } });
    await expect(scrim).toBeHidden();
  });

  test('the scrim never shows on a wide screen', async ({ page, isMobile }) => {
    test.skip(isMobile, 'a desktop-only check');
    await burger(page).click();
    await expect(page.locator('#scrim')).toBeHidden();
  });
});

test.describe('KIND 4: the pop-up menu', () => {
  // The pop-up's button and its group are both called "View", so ask for
  // the button by role, with exact: true to skip names that only contain it
  const toggle = page => page.getByRole('button', { name: 'View', exact: true });
  const group = page => page.getByRole('group', { name: 'View' });

  test('its button opens and closes it', async ({ page }) => {
    await expect(group(page)).toBeHidden();                // display: none until "open"
    await toggle(page).click();
    await expect(group(page)).toBeVisible();
    await expect(page.locator('#viewMenu')).toHaveClass(/\bopen\b/);
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await toggle(page).click();
    await expect(group(page)).toBeHidden();
  });

  test('a click outside it or Escape closes it', async ({ page }) => {
    await toggle(page).click();
    await stateView(page).click();                           // anywhere else
    await expect(group(page)).toBeHidden();

    await toggle(page).click();
    await page.keyboard.press('Escape');
    await expect(group(page)).toBeHidden();
  });

  test('its dropdown, filled by JS, sets the view', async ({ page }) => {
    await toggle(page).click();
    const camera = page.getByLabel('Camera');
    // toHaveText on a <select> checks the text of its options, in order
    await expect(camera.locator('option')).toHaveText(['From the front', 'From above', 'From the side']);
    // selectOption picks by value or by label
    await camera.selectOption({ label: 'From above' });
    await expect(camera).toHaveValue('above');
    await expect(page).toHaveURL(/view=above/);
  });
});

test.describe('KIND 5: the collapsible sections', () => {
  test('<details> opens and closes with no JS', async ({ page }) => {
    await burger(page).click();
    const about = page.locator('details', { has: page.locator('summary', { hasText: 'About' }) });
    const text = about.getByText('Each control writes to');

    await expect(about).not.toHaveAttribute('open');
    await expect(text).toBeHidden();
    await about.locator('summary').click();
    await expect(about).toHaveAttribute('open', '');
    await expect(text).toBeVisible();
  });
});

// The controls are in the drawer, so open it first. A nested beforeEach runs
// after the file's own one.
test.describe('the controls in the drawer', () => {
  test.beforeEach(async ({ page }) => {
    await burger(page).click();
  });

  test('KIND 6: the switch is a checkbox underneath', async ({ page }) => {
    const lights = page.getByLabel('Lights');
    // Styled as a sliding switch, but still a checkbox to Playwright and to
    // screen readers, because it's a real <input type="checkbox">
    await expect(lights).toHaveAttribute('type', 'checkbox');
    await expect(lights).toBeChecked();
    await lights.uncheck();
    await expect(lights).not.toBeChecked();
    // With the lights off the door slider is disabled (KIND 9's other way)
    await page.getByLabel('Style').selectOption('doors');
    await expect(page.getByLabel(/Door angle/)).toBeDisabled();
  });

  test('KIND 7: only one radio in a group can be checked', async ({ page }) => {
    // getByRole('radio') finds each radio by its label text
    const r2100 = page.getByRole('radio', { name: '2100' });
    const r2400 = page.getByRole('radio', { name: '2400' });
    await expect(r2100).toBeChecked();
    await r2400.check();
    await expect(r2400).toBeChecked();
    await expect(r2100).not.toBeChecked();      // the shared name="height" did this
    await expect(stateView(page)).toHaveValue(/"height": 2400/);
  });

  test('KIND 7: clicking the label text checks the radio', async ({ page }) => {
    // The <label> wraps the input, so its text is part of the click target
    await page.locator('.radios label', { hasText: '1800' }).click();
    await expect(page.getByRole('radio', { name: '1800' })).toBeChecked();
  });

  test('KIND 8: a slider updates its readout', async ({ page }) => {
    const width = page.getByLabel(/Width/);
    // fill() on a range input sets its value and fires 'input', as a drag would
    await width.fill('1250');
    await expect(page.locator('#widthValue')).toHaveText('1250');
    await expect(stateView(page)).toHaveValue(/LAST EVENT\n=+\ninput on #width → 1250/);
  });

  test('KIND 8: a slider snaps to its step, and stops at its ends', async ({ page }) => {
    const width = page.getByLabel(/Width/);       // min 400, max 1600, step 50
    // The keyboard moves a focused slider one step at a time
    await width.focus();
    await page.keyboard.press('ArrowRight');
    await expect(width).toHaveValue('950');
    await page.keyboard.press('End');
    await expect(width).toHaveValue('1600');
    await page.keyboard.press('Home');
    await expect(width).toHaveValue('400');
    await expect(page.locator('#widthValue')).toHaveText('400');
  });

  test('KIND 9: the dropdown shows and hides slider blocks', async ({ page }) => {
    const style = page.getByLabel('Style');
    const shelves = page.locator('#shelvesBlock');
    const door = page.locator('#doorBlock');

    // A table of cases, looped over: one test checks every choice
    const cases = [
      ['open', true, false],
      ['doors', true, true],
      ['wardrobe', false, true],
    ];
    for (const [value, shelvesShown, doorShown] of cases) {
      await style.selectOption(value);
      // toBeVisible({ visible: false }) is the same as toBeHidden()
      await expect(shelves, `shelves with ${value}`).toBeVisible({ visible: shelvesShown });
      await expect(door, `door with ${value}`).toBeVisible({ visible: doorShown });
    }
  });
});

test.describe('KIND 10: the state in the address', () => {
  // The page is already open (the beforeEach at the top), and going to the
  // same page with only a different # part does NOT load it again: it's a
  // same-document navigation, like clicking a link to a heading. The page's
  // startup code, which reads the address, wouldn't run. So go, then reload.
  async function openWith(page, hash) {
    await page.goto(`menu_demo.html${hash}`);
    await page.reload();
  }

  test('every change is written to the address', async ({ page }) => {
    await burger(page).click();
    await page.getByLabel('Style').selectOption('wardrobe');
    await page.getByRole('radio', { name: '1800' }).check();
    // toHaveURL retries too; a regular expression matches part of the URL
    await expect(page).toHaveURL(/#style=wardrobe&.*height=1800/);
  });

  test('a link opens with its settings in every control', async ({ page }) => {
    await openWith(page, '#style=doors&lights=false&height=2400&width=1200&shelves=6&door=45&view=side');
    await expect(page.getByLabel('Style')).toHaveValue('doors');
    await expect(page.getByLabel('Lights')).not.toBeChecked();
    await expect(page.getByRole('radio', { name: '2400' })).toBeChecked();
    await expect(page.locator('#width')).toHaveValue('1200');
    await expect(page.locator('#widthValue')).toHaveText('1200');
    await expect(page.locator('#doorValue')).toHaveText('45°');
    await expect(page.locator('#viewPick')).toHaveValue('side');
  });

  test('an address round-trips unchanged', async ({ page }) => {
    const hash = '#style=doors&lights=false&height=2400&width=1200&shelves=6&door=45&view=side';
    await openWith(page, hash);
    await expect(stateView(page)).toHaveValue(/"style": "doors"/);    // wait until it has rendered
    expect(await page.evaluate(() => location.hash)).toBe(hash);
  });

  test('a short link fills in the defaults, and ignores what it does not know', async ({ page }) => {
    await openWith(page, '#width=600&colour=red');
    await expect(page).toHaveURL(/#style=open&lights=true&height=2100&width=600&shelves=4&door=0&view=front$/);
  });

  test('it survives a reload', async ({ page }) => {
    await burger(page).click();
    await page.getByLabel(/Shelves/).fill('7');
    await page.reload();
    await expect(page.locator('#shelvesValue')).toHaveText('7');
  });
});

// A screenshot test. The first run (or `npm run test:update`) saves the
// picture in tests/menu_demo.spec.js-snapshots/; every later run compares
// against it, and fails with a side-by-side diff in the report
// (`npm run report`) if they differ. One per project, as the browsers draw
// slightly differently.
test.describe('how it looks', () => {
  test('the drawer open, with the doors style', async ({ page }) => {
    await page.goto('menu_demo.html#style=doors&width=1200');
    await page.reload();                         // see KIND 10
    await burger(page).click();
    await expect(page.locator('#panel')).toBeInViewport();
    // The text area shows the full address, port and all, which can change;
    // mask covers it with a box in both pictures
    await expect(page).toHaveScreenshot('drawer-open.png', { mask: [stateView(page)] });
  });
});
