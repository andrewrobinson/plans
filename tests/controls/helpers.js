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
const { test, expect, openOptions, openRoom, addressOf, readAddress, configurationOf, edited, pickOption, setting, optionShown } = require('../helpers');
const { ADDRESSES } = require('../addresses');

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
// section in every drawer unfolded and every tab's sections shown at once
// (these tests are of the controls; the tabs have their own), at an address
// (the page as it opens unless given)
async function openDrawer(page, address = '', room = 'lounge') {
  await openRoom(page, address);
  if (room === 'other') await page.click('#menu');
  else await openOptions(page, room);
  await page.evaluate(() => {
    document.querySelectorAll('.drawer details').forEach(d => { d.open = true; });
    document.querySelectorAll('.drawer .tabpanel').forEach(p => { p.hidden = false; });
  });
}

// What to do first, from the page as it opens (option 16, the room as it
// is: no cupboard or bench, Billy and BillyChest on the back wall), so a
// control is on show: a cupboard; the bench, once Billy and BillyChest are
// off the back wall (they stand in its place); the dresser or a larder on
// the front wall, offered in the room as it is too; a sofa
const OPTION = n => page => pickOption(page, n);
async function BENCH(page) {
  for (const id of ['billyOn', 'billyChestOn']) await toggle(page, id, false);
  await toggle(page, 'benchOn', true);
}
const onTheFrontWall = piece => page => page.check(`input[name=frontPiece][value="${piece}"]`);
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


module.exports = {
  test, expect, openOptions, openRoom, addressOf, readAddress, configurationOf, edited, pickOption, 
  setting, optionShown, ADDRESSES, saved, inPlan, hash, SETTLE_MS, settledHash, storedHead, view, any, 
  openDrawer, OPTION, BENCH, onTheFrontWall, DRESSER, LARDER, SOFA, LEFT_CUPBOARD, at, slide, toggle, 
  readout, endsAndBack
};
