// Shared by the test files: a `test` that fails on any console error;
// openRoom(), which loads index.html and waits until it's drawn; and
// expectSnapshot(), which checks what the page makes of its settings
// against the one saved.
const fs = require('fs');
const path = require('path');
const base = require('@playwright/test');

// Every test gets this automatically (auto: true): it listens for console
// errors and uncaught exceptions while the test runs, and fails the test if
// there were any. Warnings (the blocked service worker, WebGL's performance
// notes) are allowed.
const test = base.test.extend({
  consoleErrors: [async ({ page }, use) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await use(errors);
    base.expect(errors, 'errors in the console').toEqual([]);
  }, { auto: true }],
});

// Load index.html with an address (the part after #, with the #), and wait
// until it's ready: the 3D canvas is there and the page has stopped
// rewriting its address (it writes it once the model is built, then again
// once the view in the address is applied, a moment later on a phone).
// Going via a blank page makes every load a fresh one, even when only the #
// part differs from the page already open.
async function openRoom(page, hash = '') {
  await page.goto('about:blank');
  await page.goto(`index.html${hash}`);
  await page.waitForFunction(() => document.querySelector('#view canvas') && location.hash.length > 1);
  await page.waitForFunction(() => new Promise(resolve => {
    let last = location.hash, still = 0;
    const timer = setInterval(() => {
      if (location.hash !== last) { last = location.hash; still = 0; }
      else if (++still >= 5) { clearInterval(timer); resolve(true); }     // unchanged for half a second
    }, 100);
  }));
}

// Choose option n (its number, as in its name) from the option list. Its
// place in the list isn't n - 1, as the list starts at option 7.
async function pickOption(page, n) {
  const value = await page.locator('#current option').evaluateAll((os, n) => os.find(o => parseInt(o.textContent, 10) === n)?.value, n);
  if (value === undefined) throw new Error(`option ${n} isn't in the option list`);
  await page.selectOption('#current', value);
}

// What the page makes of its settings (window.plans.snapshot(): the
// settings, each corner cupboard's cutting list, the dimension figures and
// the description) against tests/snapshots/<name>.json, exactly. The
// screenshots let through a board 2 mm out or one fewer; this doesn't
// (REFACTOR_PLAN.md, step 6a). One file for both devices, so they must
// agree. It's written when it's missing, and again when it's changed with
// `npm run test:update`, as the screenshots are.
const SNAPSHOTS = path.join(__dirname, 'snapshots');
async function expectSnapshot(page, name) {
  const actual = await page.evaluate(() => window.plans.snapshot());
  const file = path.join(SNAPSHOTS, `${name}.json`);
  const mode = base.test.info().config.updateSnapshots;           // 'default' normally, 'changed' with --update-snapshots
  const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
  const write = mode === 'all' || mode === 'changed' || (mode !== 'none' && saved === undefined);
  if (write) {
    if (JSON.stringify(actual) === JSON.stringify(saved)) return;
    fs.mkdirSync(SNAPSHOTS, { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(actual, null, 2)}\n`);
    return;
  }
  base.expect(actual, `what the page makes of it, as saved in tests/snapshots/${name}.json`).toEqual(saved);
}

// The parts of the address: settings ~ things to store ~ view
const settingsField = (hash, k) => hash.slice(1).split('~')[0].split('-')[k];

module.exports = { test, expect: base.expect, openRoom, pickOption, settingsField, expectSnapshot };
