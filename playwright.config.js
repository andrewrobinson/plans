// Browser tests for room_3d.html and menu_demo.html. See REFACTOR_PLAN.md.
//
//   npm test                   run every test, in both browsers: before merging or deploying
//   npm run test:quick         every test in WebKit only (iPhone size): quicker, while working
//   npm run test:update        take the reference screenshots again
//   npm run report             the last run's report, with any image differences
//
// Node 20 or later is needed (.nvmrc): `nvm use` first.
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8765;

module.exports = defineConfig({
  testDir: 'tests',
  // The 3D page loads three.js from the CDN and draws in software in a
  // headless browser, so give it time
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    // The 3D drawing can differ by a few anti-aliased pixels between runs
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    // The offline service worker would serve saved copies between tests
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    // The controls tests (controls.spec.js) check plain JavaScript, the same
    // in any browser, so they run once, in the faster one: headless Chrome
    // draws the 3D view in software, at about a quarter of WebKit's speed
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, testIgnore: /controls\.spec\.js/ },
    // Safari's engine at phone size, close to the phone the app is used on
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: `python3 serve.py ${PORT}`,
    url: `http://localhost:${PORT}/room_3d.html`,
    reuseExistingServer: true,
    stderr: 'ignore',                        // the server's request log
  },
});
