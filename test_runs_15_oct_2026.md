# Test runs, 15 Oct 2026 session

The Playwright runs during the session that added downstairs (the stairs' foot,
the internal and external doors, the Downstairs room) and the pine cupboard
switches. Each run used port 8766.

The test suite has two projects:

- **iphone:** the phone, about 115 tests.
- **desktop:** about 75 more tests that run only there.

A **full** run is both projects (`npm test`). A **quick** run is the phone only
(`npm run test:quick`). A **targeted** run is only the tests named with `-g`.

## Every run, in order

| # | When | What ran | Kind | Result | Time |
|---|---|---|---|---|---|
| 1 | Downstairs drawn, first check | Phone, all | Quick | 86 passed, about 28 failed (the address had 2 new door angles) | 1.9 min |
| 2 | Same, to list the failures | Phone, all, again | Quick | The same failures | about 1.9 min (estimated: not printed) |
| 3 | Test addresses given the new door angles | Phone, all | Quick | 113 passed, 2 failed (bedroom bird's-eye screenshots) | 0.9 min |
| 4 | Screenshots meant to change | `bedroom-no-bookcase`, `bedroom-mirror-kitchen-wall`, `entrance-doors-plan`, both devices | Targeted, updating | 6 passed | 10 s |
| 5 | Before committing | Everything | Full | 187 passed, 3 failed (desktop-only plan screenshots) | 4.3 min |
| 6 | Room renamed Downstairs; screenshots meant to change | `view-plan`, `board-12-option09-plan`, `settings-option07-no-bench`, `downstairs-doors-plan`, the two bedroom ones, both devices | Targeted, updating | 12 passed | 19 s |
| 7 | Before committing downstairs | Everything | Full | 190 passed | 4.3 min |
| 8 | Pine cupboard switches added | Phone, all | Quick | 115 passed, 2 failed (a new screenshot; the finished7 scene's address) | 1.5 min |
| 9 | To see the finished7 failure | `finished7`, phone | Targeted | 1 failed (to read the error) | a few seconds |
| 10 | New and changed screenshots | `view-back-wall-pine`, `settings-option07-no-bench`, both devices | Targeted, updating | 4 passed | 9 s |
| 11 | Before committing the pine cupboard | Everything | Full | 194 passed | 4.7 min |
| 12 | Bookshelf moved to start beside the pine cupboard | `view-back-wall-pine`, both devices | Targeted, updating | 2 passed | 5 s |
| 13 | Before committing, again | Everything | Full | 194 passed | 3.8 min |

At "deploy to main", no further run was made: commit 85119bc had already
passed run 13.

## Totals

| Kind | Runs | Time |
|---|---|---|
| Full (both devices) | 4 (runs 5, 7, 11, 13) | about 17 min |
| Quick (phone, all) | 4 (runs 1, 2, 3, 8) | about 6 min |
| Targeted | 5 (runs 4, 6, 9, 10, 12) | about 1 min |
| **All** | **13** | **about 24 min** |

## What wasn't needed

Without these runs, the tests would have taken about 8 minutes instead of 24.

- **Run 2:** a repeat of run 1, only to read its failures. They could have been
  read from run 1's own output.
- **Run 5:** run 3 had just shown which tests the change affected. A targeted
  run of those on the desktop would have found the 3 desktop-only screenshots
  in seconds.
- **Runs 7 and 11:** full runs before each commit. One full run, before the
  deploy, would have been enough.
- **Run 13:** after a change to one screenshot, which run 12 had already
  checked on both devices.
- **Runs 1, 3 and 8:** these could have been targeted runs, of the tests for
  the address and the screenshots each change affected.

The other way of working, saved in memory for later sessions:

- **While working:** targeted runs only.
- **Before a commit:** at most one quick run.
- **At "deploy to main":** one full run, and none if nothing has changed since
  the last one passed.
