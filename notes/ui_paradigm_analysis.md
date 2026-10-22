# The configuration, the view and the URL: recommendations

Written 17 Oct 2026, reviewing the configuration, view and address built
in `REFACTOR_PLAN.md`'s step 6 against the usual UI patterns: the split is
sound. Trimmed 22 Oct 2026 to the recommendations; the comparison and the
doors' options are in git (`git show 05f88b7:ui_paradigm_analysis.md`).

1. **The configuration as the store** (`set(path, value)`): done.
2. **Views don't write the doors**: done. Decided 17 Oct 2026 (option C):
   the door angles are the view's, not the configuration's. A door's angle
   changes nothing that's built, so it's how you're looking.
3. **The display switches out of the model's module state**: give the view
   to each build, as `buildFlat(configuration, view)` already does in Node.
   Done (22 Oct 2026): the page's `display` (page/display.js), passed to
   `rebuild`, `updateDims` and `drawStored`.
4. **No history entry per slider move**: `replaceState` while a slider's
   dragged, a new entry for a choice. Done (22 Oct 2026): one entry per change, a drag
   being one, and Back and Forward load the address's configuration.
5. **Worked-out values out of the settings**: done.
6. **Instances for every piece**, as `makeCupboard()` is, so `world` and
   the page's imports from the model shrink. *Open.*
