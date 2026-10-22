// Shared by the test files: a `test` that fails on any console error;
// openRoom(), which loads index.html and waits until it's drawn, and
// addressOf(), the address of a configuration and a view;
// expectSnapshot(), which checks what the page makes of its settings
// against the one saved; and setting(), which reads one.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
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

// The address of a configuration and, if given, a view (with none, the
// page shows its starting view): each JSON deflated and in base64url, as
// the page packs them (kit/config_kit.js). Node's deflate may not give the
// browser's bytes, so tests compare what the page reads (plans.export()
// and plans.view()), not the address it writes
const packed = json => zlib.deflateRawSync(JSON.stringify(json)).toString('base64url');
const addressOf = (configuration, view) => `#${packed(configuration)}${view ? `~${packed(view)}` : ''}`;
// What an address holds, { configuration, view }, read back in Node
const unpacked = text => (text ? JSON.parse(zlib.inflateRawSync(Buffer.from(text, 'base64url')).toString()) : undefined);
function readAddress(hash) {
  const [configuration, view] = hash.replace(/^#/, '').split('~');
  return { configuration: unpacked(configuration), view: unpacked(view) };
}
// A copy of a configuration with settings changed, as { 'pieces.sofa.design.w': 1500 };
// undefined takes one out
function edited(configuration, changes) {
  const copy = structuredClone(configuration);
  for (const [at, value] of Object.entries(changes)) {
    const keys = at.split('.'), last = keys.pop();
    const parent = keys.reduce((o, k) => o[k], copy);
    if (value === undefined) delete parent[last];
    else parent[last] = value;
  }
  return copy;
}
// What the page has: its configuration and its view
const configurationOf = page => page.evaluate(() => window.plans.export());
const viewOf = page => page.evaluate(() => window.plans.view());

// Choose option n (its number, as in its name) from the option list. Its
// place in the list isn't n - 1, as the list starts at option 7.
// `list`: the list's id, the lounge cupboard's unless given (the bedroom's
// is 'bedroomCupboardCurrent')
async function pickOption(page, n, list = 'current') {
  const value = await page.locator(`#${list} option`).evaluateAll((os, n) => os.find(o => parseInt(o.textContent, 10) === n)?.value, n);
  if (value === undefined) throw new Error(`option ${n} isn't in the option list`);
  await page.selectOption(`#${list}`, value);
}

// What the page makes of its settings (window.plans.snapshot(): the
// configuration, each corner cupboard's cutting list, the dimension figures and
// the description) against tests/snapshots/<name>.json, exactly. The
// screenshots let through a board 2 mm out or one fewer; this doesn't
// (REFACTOR_PLAN.md, step 6a). One file for both devices, so they must
// agree. It's written when it's missing, and again when it's changed with
// `npm run test:update`, as the screenshots are.
// `of: 'view'` checks the view's instead (window.plans.viewSnapshot(): the
// camera, the cut and how much of each piece and room the view shows)
// against tests/view_snapshots/<name>.json, which only the page makes.
const SNAPSHOTS = path.join(__dirname, 'snapshots');
const SNAPSHOT_KINDS = {
  model: { folder: SNAPSHOTS, method: 'snapshot' },
  view: { folder: path.join(__dirname, 'view_snapshots'), method: 'viewSnapshot' },
};
async function expectSnapshot(page, name, { of = 'model' } = {}) {
  const { folder, method } = SNAPSHOT_KINDS[of];
  const actual = await page.evaluate(m => window.plans[m](), method);
  const file = path.join(folder, `${name}.json`);
  const mode = base.test.info().config.updateSnapshots;           // 'default' normally, 'changed' with --update-snapshots
  const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
  const write = mode === 'all' || mode === 'changed' || (mode !== 'none' && saved === undefined);
  if (write) {
    if (JSON.stringify(actual) === JSON.stringify(saved)) return;
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(actual, null, 2)}\n`);
    return;
  }
  base.expect(actual, `what the page makes of it, as saved in ${path.relative(path.join(__dirname, '..'), file)}`).toEqual(saved);
}

// A setting, by its path in window.plans.get() (the model's config, laid out
// as the configuration is, and the view's doors' angles as `doors`), as
// 'pieces.sean.in.garage' or 'pieces.dresser.design.w'. The
// tests read the settings this way rather than from the address, so a new
// address format leaves them alone (REFACTOR_PLAN.md, step 6a).
const setting = (page, path) => page.evaluate(p => p.split('.').reduce((o, k) => o?.[k], window.plans.get()), path);
// The option on show: its number, from the option list
const optionShown = page => page.locator('#current option:checked').evaluate(o => parseInt(o.textContent, 10));

// Open the options of `room` ('lounge', 'bedroom', 'garage' or 'hallway'):
// the button at the bottom left, going to the room first with its button
// in the top bar if it isn't the one in view; left open if it is already
async function openOptions(page, room = 'lounge') {
  const button = page.locator('#roomOptions');
  if (!(await button.textContent()).toLowerCase().startsWith(room)) {
    await page.keyboard.press('Escape');                          // on a phone an open sheet hides the room buttons
    await page.click(`#${room}View`);
  }
  if (await button.getAttribute('aria-expanded') !== 'true') await button.click();
}

// Open a menu's section (a <details>, by its id), its triangle pointing down
const openSection = (page, id) => page.locator(`#${id}`).evaluate(d => { d.open = true; });

module.exports = { test, expect: base.expect, openOptions, openSection, openRoom, addressOf, readAddress, edited, configurationOf, viewOf, pickOption, setting, optionShown, expectSnapshot };
