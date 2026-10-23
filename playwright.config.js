// Browser tests for index.html (the living room) and demos/menu_demo.html. See REFACTOR_PLAN.md.
//
//   npm test                   run every test, in both browsers: before merging or deploying
//   npm run test:quick         every test in WebKit only (iPhone size): quicker, while working
//   npm run test:update        take the reference screenshots again
//   npm run report             the last run's report, with any image differences
//
// Node 20 or later is needed (.nvmrc): `nvm use` first.
//
// The tests serve this folder on port 8765, or on PORT if set, and reuse a
// server already there: from a worktree, while another checkout's server
// holds 8765, run e.g. `PORT=8766 npm test`, or they test the other's files.
const { defineConfig, devices } = require('@playwright/test');

const PORT = Number(process.env.PORT) || 8765;

module.exports = defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.js',                 // not the model's tests (tests/model/*.test.mjs): Node runs those
  // The 3D page loads three.js from the CDN and draws in software in a
  // headless browser, so give it time
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    // Every pixel the same (21 Oct 2026): measured, the 15 kept screenshots
    // came out identical on both devices 4 times over at 10 workers, so
    // any difference is a real one. It was 0.2%, which let the newel posts
    // through the lounge doorway pass for days. A new browser version may
    // draw a pixel differently: retake them then (npm run test:update)
    toHaveScreenshot: { maxDiffPixelRatio: 0 },
  },
  fullyParallel: true,
  // Only the failures, briefly, and the totals (tests/quiet_reporter.js);
  // the html report has the rest
  reporter: [['./tests/quiet_reporter.js'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    // The offline service worker would serve saved copies between tests
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    // On the desktop, only the room tests tagged @desktop (tests/room_3d.spec.js):
    // those that depend on its size or its keyboard; the rest are the same
    // on any device, so they run on the phone alone.
    // The controls tests (tests/controls/) check plain JavaScript, the same
    // in any browser, so they run once, in the faster one: headless Chrome
    // draws the 3D view in software, at about a quarter of WebKit's speed
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, testIgnore: /tests\/controls\//, grep: /@desktop|menu_demo/ },
    // Safari's engine at phone size, close to the phone the app is used on
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: `python3 serve.py ${PORT}`,
    url: `http://localhost:${PORT}/index.html`,
    reuseExistingServer: true,
    stderr: 'ignore',                        // the server's request log
  },
});
