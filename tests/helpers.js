// Shared by the test files: a `test` that fails on any console error, and
// openRoom(), which loads room_3d.html and waits until it's drawn.
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

// Load room_3d.html with an address (the part after #, with the #), and wait
// until it's ready: the 3D canvas is there and the page has stopped
// rewriting its address (it writes it once the model is built, then again
// once the view in the address is applied, a moment later on a phone).
// Going via a blank page makes every load a fresh one, even when only the #
// part differs from the page already open.
async function openRoom(page, hash = '') {
  await page.goto('about:blank');
  await page.goto(`room_3d.html${hash}`);
  await page.waitForFunction(() => document.querySelector('#view canvas') && location.hash.length > 1);
  await page.waitForFunction(() => new Promise(resolve => {
    let last = location.hash, still = 0;
    const timer = setInterval(() => {
      if (location.hash !== last) { last = location.hash; still = 0; }
      else if (++still >= 5) { clearInterval(timer); resolve(true); }     // unchanged for half a second
    }, 100);
  }));
}

// The parts of the address: settings ~ things to store ~ view
const settingsField = (hash, k) => hash.slice(1).split('~')[0].split('-')[k];

module.exports = { test, expect: base.expect, openRoom, settingsField };
