# Testing: findings and questions (from 15 Oct 2026)

For tomorrow. Nothing has changed yet. The session's run-by-run log is
`test_runs_15_oct_2026.md`.

**16 Oct 2026:** `REFACTOR_PLAN.md` step 6 changes the testing: saved
snapshots (JSON) checked exactly beside the screenshots (6a), controls
tests that read settings rather than the address (6a), and most
combinations of settings tested in Node in seconds (6c), leaving fewer and
shorter browser runs. The questions below are still open either way.

## Findings

1. **The tests take too much of each session.** On 15 Oct there were 13
   runs, about 24 minutes in all. About 8 minutes would have done. The full
   suite (phone and desktop, about 4.5 min a time) ran 4 times, where once,
   before deploying, was enough.
2. **The quick tests run on a phone, not on your browser.** Since 12 Oct,
   `npm run test:quick` has run only the `iphone` project: Safari's engine,
   at iPhone 13 size. The repo's notes say to run it after each change.
   The reasons, from `playwright.config.js`:
   - Headless Chrome draws the 3D view in software, at about a quarter of
     the phone engine's speed.
   - The page was thought to be used on a phone.
3. **You use Chrome on a Mac**, so that's the setup to test against first.
4. **The controls tests skip Chrome.** `controls.spec.js` checks every
   slider and switch, and runs only on the phone. Desktop Chrome
   (1280 × 800) gets only the screenshot and address tests.
5. **Already changed:** a saved note (Claude's memory) now says to run only
   the affected tests while working, and the full suite once, at "deploy to
   main". It still says to run them on the phone, which question 1 may
   change.

## Questions

1. **Do you ever open the page on your phone (or iPad)?**
   - Mac only: the phone tests can go, and every run gets shorter.
   - Sometimes on the phone: keep them, but only in the full run at deploy.
2. **Should the quick and targeted runs use desktop Chrome?** Recommended:
   yes, as it's what you use. Runs of a few named tests take seconds, so its
   slower drawing hardly matters.
3. **Should the controls tests run in desktop Chrome?** Recommended: yes,
   moving them off the phone. That adds a few minutes to the full run, once
   per deploy.
4. **Should the desktop screenshots be at your window's size?** They're
   1280 × 800 now. If you mostly use a bigger window (a full-screen MacBook
   or an external screen), the screenshots could match it. If so, what size
   is it? Chrome's View ▸ Developer ▸ JavaScript Console, typing
   `innerWidth + ' x ' + innerHeight`, gives it.
5. **How often should tests run?** Proposed:
   - **While working:** only the tests a change affects (named with `-g`).
   - **Before a commit:** at most one quick run.
   - **At "deploy to main":** one full run, and none if nothing has changed
     since the last one passed.
   - **Never:** rerunning the whole suite just to read failures.

## What would change, once decided

- `playwright.config.js`:
  - which project the controls tests run in;
  - the desktop window size;
  - whether the phone project stays.
- `package.json`: what `test:quick` runs.
- `README.md` and `PLAN.md`: the working rule for tests.
- The saved memory note on test runs.
