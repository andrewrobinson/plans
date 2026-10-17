# The configuration, the view and the URL: how they compare with UI paradigms

A review of the abstractions built in step 6 of `REFACTOR_PLAN.md` (the
configuration, the snapshot, the view, the address) and 6d's (the corner
cupboard's module), against the usual UI patterns. Written 17 Oct 2026,
during 6d; line numbers are as of commit `dd0ac8b`.

In short: the split is sound and in line with well-known patterns. It still
blurs in four places, most already on `REFACTOR_PLAN.md`'s list.

---

## What's been built

| Layer | What it is | Where |
|---|---|---|
| **Configuration** | The input document: each piece once, with its design and where it stands in each room, the doors, colours and things to store. Versioned, read through a schema | `SCHEMA` in `flat_model.js`, `kit/config_kit.js` |
| **Snapshot** | The output: cutting lists, dimensions, description and each piece's box, worked out from the configuration, never stored (bar the tests' fixtures) | `buildFlat()`, `flat_model.js:1533` |
| **View** | A document of its own: room, view id or camera, eye height, the display switches | `viewNow()`, `living_room.js:1006`; `view()`, `kit/view_kit.js:490` |
| **URL** | `#<configuration>~<view>`, each the full JSON, deflated | `writeAddress()`, `living_room.js:372` |
| **Scenes, views and looks** | A scene is a configuration without a view; a saved view or look is a view without a configuration | `kit/scene_kit.js`, `kit/view_kit.js` |
| **The cupboard's module** | `buildCupboard(settings, place, materials)`: given everything it needs, reading no globals | `corner_cupboard.js` |

---

## How it compares

There's no fixed number of paradigms. About eight families apply here, with
a handful of best practices that run across them (one source of truth,
don't store what's worked out, keep the document apart from how it's seen,
the URL as the shareable state, a pure build, dependencies passed in).

| Paradigm | Where the code matches it | Where it doesn't yet |
|---|---|---|
| **Document and viewport** (CAD, Figma, MFC's Doc/View) | Strongly: the configuration is the document; the camera, eye height and display switches are the viewport. Scenes and views saved apart is how CAD tools do it | The view writes into the document: Packing and walking in turn the doors (below) |
| **MVC, MVVM** | The model (`flat_model.js`, no page needed) is apart from the view and controls (`living_room.js`); `syncControls()` is the view-model's binding | The display switches (`flat`, `flatView`, `flatRoom`, `cupboardOnly`, `showDims`, `showDoorDims`) are the model's module globals, set by `setDisplay()` (`flat_model.js:49`) |
| **One-way data flow** (Elm, Redux, Flux) | `changeSettings(edit)` → `syncControls()` → `show()` → `writeAddress()` (`living_room.js:395`) is one loop, one way | The settings are changed in place, not replaced; the door sliders take a second route (`update()`), a fast path |
| **One source of truth** | Planned | Two today: `state`, flat with its short names (`flat_model.js:205`), and the configuration, mapped both ways by `SCHEMA`. The configuration is only `state` written out. `set(path, value)` fixes it |
| **Don't store what's worked out** | The snapshot is never stored | `settle()` keeps worked-out values (the TV's size, where the dresser stands) beside the settings, so the order of calls matters |
| **What's drawn = f(settings)**; a functional core in an imperative shell | `buildFlat(configuration, view)` is pure from outside: the same input gives the same snapshot, which is why 1,728 generated configurations test in Node | Inside, it resets and changes one module-level flat and one `world` (`startAgain()`). 6d.5's `makeCupboard()` is the first instance in place of a singleton |
| **A retained scene graph** | three.js's `world` is a cache rebuilt from the configuration; the doors turn without a rebuild | Fine as it is |
| **The URL as the state** (Excalidraw's `#json=`, the TypeScript playground, Google Maps' camera) | The full document, not changes from defaults, so a link never changes meaning when a default does; versioned. The document and the view apart in the URL, as Maps keeps a place apart from its camera | `writeAddress()` sets `location.hash` unless told to replace, so Back may step through every slider move (check in the browser) |
| **Components with props, dependencies passed in** | `buildCupboard(settings, place, materials)`; `place` is like a context, so the bedroom's instance (6d.6) is the same cupboard in another room | `living_room.js` still imports about 80 names from the model |

Better than many apps: a **look** is a place, a thing and an eye height,
not coordinates, so it follows the furniture when it moves.

---

## Where each kind of state lives

| Tier | Holds | In memory | Saved in |
|---|---|---|---|
| **Document** | Each piece's design and place in each room (`{ on, x, y, turn }`, `u, v`, `along, across`), the option, colours, doors, things to store | `state` today; the configuration after `set(path, value)` | URL part 1; scenes (`living_room.scenes.js`, or localStorage on one device); `tests/configs/*.json` |
| **Worked out** | Cutting lists, dimensions, boxes, three.js's `world` | Rebuilt on every change | Never, bar `tests/snapshots/` |
| **View** | Room, view id or camera (mm, the scene's axes), eye height, the four display switches | The view kit, and display globals in `flat_model.js` and `living_room.js` | URL part 2 |
| **This device's** | The last view, eye height, saved views, looks and scenes | The view and scene kits | localStorage only, so they don't go with a link |
| **The menus' own** | Which drawer's open, the cutting list shown or hidden | The DOM | Not saved (the drawers start closed) |

---

## Recommendations, in order of value

1. **The configuration as the store**: `set(path, value)` (on
   `REFACTOR_PLAN.md`'s list). `state` goes, and with it the second source
   of truth and the menus' 73 uses of its flat names. Undo then comes
   nearly free, as a stack of configurations. **Half done, 17 Oct 2026**:
   the menus write only through `set(path, value)` (REFACTOR_PLAN.md);
   `state` stays as what the drawing code reads, till the configuration
   is the store.
2. **Views don't write the doors**: the door angles move into the view
   (decided, below).
3. **The display switches out of the model's module state**: give the view
   to each build, as `buildFlat(configuration, view)` already does in Node.
4. **No history entry per slider move**: `replaceState` while a slider's
   dragged, a new entry for a choice (an option, a view, a scene). Check
   in the browser first.
5. **Worked-out values out of `state`**: what `settle()` works out becomes
   the build's results, not settings.
6. **Instances for every piece**: 6d's `makeCupboard()` and the bedroom's
   instance are the pattern; the model's one flat and `world` follow, and
   `living_room.js`'s imports from it shrink.

---

## The doors: views writing into the document

**Today.** `packingView()` (`living_room.js:841`) opens the cupboard's
doors to 170° and shuts the room door; the walk-in action `shutRoomDoor()`
shuts the room door. Both write `state.doors`, the configuration's. So:

- The next address write carries the changed doors in the configuration's
  part, not the view's.
- The Scenes list goes to "Your scene (not saved)" though only the view
  changed.
- A scene saved after Packing keeps the doors open.
- Leaving Packing doesn't put the doors back.

**The options.**

- **A. A view's own door angles, shown but not saved.** A view can carry
  door angles (Packing: `{ tall: 170, second: 170, room: 0 }`), drawn over
  the configuration's. The configuration never changes; leaving the view
  brings the doors back; a link to Packing still opens them, as they're in
  the view's part. Keeps 6b's decision (door angles are the flat's, so
  scenes keep them). To decide: a door slider moved in Packing becomes a
  real edit, its override gone. Moderate work: `turnDoors()` and the
  sliders read the angles combined.
- **B. An edit, made on purpose and shown as one.** Packing and walking in
  go through `changeSettings()` like any control, with a hint ("Packing
  opened the doors"), perhaps putting them back on leaving. Little work,
  but the view still changes the document.
- **C. The door angles move into the view.** Reverses 6b's decision. A
  door's angle changes nothing that's built (the cutting list and sizes
  stay the same), so it's how you're looking, as the camera is. The
  configuration becomes only what's made, and a view setting the doors is
  just the view. Links keep them, in the view's part. Scenes would lose
  them.

**Decided 17 Oct 2026: C.** The scenes aren't used, and would be rebuilt
when they are, so losing door angles from them costs nothing; a rebuilt
scene can be a configuration and a view, which brings them back if wanted.

How A and C differ: in A the configuration owns the angles and a view
overrides them for a while, so leaving Packing brings back the doors as
set; in C the view owns them, one set, so leaving Packing leaves the doors
where it put them, as the eye height stays when the view changes (a view
can still set them: walking in shuts the room door). C is the simpler, at
the cost of views overwriting each other's angles.

What C costs:

- Every saved configuration and snapshot in `tests/` has `doors`: moved to
  the view, with the configuration's `version` up (old links needn't work,
  agreed 12 Oct 2026).
- The generated tests, which check each design fits its room with the
  doors opened, pass the angles in `buildFlat(configuration, view)`'s view.
- The door sliders write the view; moving one no longer changes the
  address's configuration.
- The angles move from `state.doors` to the view's state.

To build after 6d is committed: it changes `living_room.js`,
`flat_model.js` and `tests/`, which 6d's refactor is changing now.
