// View kit: where you are in a three.js room model, and what you're looking
// at. Reusable for any room: the room supplies its own data (see
// living_room.views.js for one) and a few hooks, and the kit does the rest:
//
// - Views from the room's data (config-defined), views saved in the page
//   (kept in the browser, so on one device), and the room's own built-in
//   views, in one list.
// - Rooms: choosing one offers its places and things, and takes you to its
//   doorway; views that frame every room (a bird's eye, a plan) frame it.
// - Places you can be and things you can look at, chosen apart: the camera
//   stands at the place, at the chosen eye height, aimed at the thing.
// - Eye heights: who's looking (short, tall) and whether they sit, stand or lie.
// - As a person, dragging turns your head where you are (and swivels the
//   chair, if you're in one); right-drag, shift-drag, the arrow keys or WASD
//   walk; scrolling zooms like a lens. Views from above orbit as usual.
// - The view in the page address, so a shared link shows just what's on
//   screen.
//
// Room data positions are in mm: [x, y, height], x and y across the floor
// and height up from it. The scene is y-up in metres, so room [x, y, h] is
// scene [x, h, y] / 1000. Built-in views, from the room's code, are already
// in scene metres.
//
// An ES module, as kit/floor_kit.js: a page imports it as ViewKit
// (import * as ViewKit from './kit/view_kit.js'), and calls ViewKit.create().
const MM = 0.001;
const PIVOT = 0.1;               // as a person, the controls' pivot: metres in front of your eyes
const STEP = 0.1;                // a walking step, in metres
const toScene = ([x, y, h]) => [x * MM, h * MM, y * MM];
const posture = key => key.split('-')[0];                     // eye heights are keyed '<posture>-<person>', as 'sit-tall'
const person = key => key.split('-').slice(1).join('-');

// options:
//   THREE, camera, controls (OrbitControls), canvas: the 3D view
//   room: a name for this room, to keep its saved views apart
//   config: the room's data (eyes, rooms, places, things, views, looks, startView, look)
//   builtIn: { id: view } the room's own views, in scene metres; those
//     with `fit` are 2D, for the room's code to place (see hooks.place)
//   origins: { room: [x, y] } each room's corner, in mm, where its places'
//     and things' `at` are measured from (the first room's is [0, 0])
//   anchors: { name: () => [x, y, height] } things that move, in mm (or
//     [x, y] for places that move)
//   computed: { name: () => view } views worked out when chosen, in scene metres
//   actions: { name: () => {} } things a place does when you arrive (its `arrive`)
//   chair: { object, rest, eyes } a swivel chair: the object to turn, its
//     turn when no one's in it (radians), and how far your eyes are in
//     front of its middle (mm)
//   el: { where, lookAt, eye, save, remove, hint } the controls, and
//     optionally { views } the views list (else the page lists them, with
//     hooks.viewsChanged and `savedViews`), { room } to choose the room,
//     and { looks, saveLook, removeLook } for saved looks
//   hints: { flat, orbit, person } what the hint says in each case
//   hooks: {
//     place(view, id, room)   put the cameras at the view (2D or 3D), then resize and update
//     isFlat()          in a 2D view
//     resize()          after the lens changes
//     writeAddress()    write the page address, with view() as its view
//     viewsChanged()    optional: a view was saved or deleted
//   }
export function create(o) {
  // The room's data, and each part's functions, all on `k`; what changes
  // as the view does, on `s` (viewState()). Each part below is given `k`
  // and calls the others' through it, so the order they're made in is only
  // the order they set up their lists and listeners (REFACTOR_PLAN.md item 10)
  const k = { ...o, builtIn: o.builtIn ?? {}, origins: o.origins ?? {}, anchors: o.anchors ?? {}, computed: o.computed ?? {},
    actions: o.actions ?? {}, chair: o.chair ?? null };
  Object.assign(k, roomData(k));
  k.s = viewState(k);
  Object.assign(k, viewFinding(k));
  Object.assign(k, cameraControls(k));
  Object.assign(k, savedViewsList(k));
  Object.assign(k, whereAndLookingAt(k));
  Object.assign(k, looksMenu(k));
  Object.assign(k, { showChoices: postured => showChoices(k, postured) });
  Object.assign(k, startAndSaving(k));
  Object.assign(k, address(k));
  return kitFace(k);
}

// The room's data: its eye heights, places and things in their rooms, its
// views, and what's remembered on this device
function roomData({ config, origins, builtIn, room: name }) {
  const EYES = Object.fromEntries(Object.entries(config.eyes).map(([key, e]) => [key, { ...e, height: e.height * MM }]));
  const PLACES = config.places, THINGS = config.things;
  // Rooms (config.rooms: { id: { label, enter: { place, thing } } }). Each
  // place and thing is in one: its `room`, else the first. Built-in and
  // config-defined views are likewise in one room, or frame whichever room
  // is chosen, with `rooms`: { room: what's different there }.
  const ROOMS = config.rooms ?? { room: { label: 'Room' } };
  const firstRoom = Object.keys(ROOMS)[0];
  const roomOf = item => item.room ?? firstRoom;
  const inRoom = (item, [x, y, ...height]) => {
    const [ox, oy] = origins[roomOf(item)] ?? [0, 0];
    return [x + ox, y + oy, ...height];
  };
  const inRoomOf = (r, items) => Object.keys(items).filter(id => roomOf(items[id]) === r);
  // Where you arrive in a room: its doorway, as the room says, else its first place and thing
  const entrance = r => ROOMS[r].enter ?? { place: inRoomOf(r, PLACES)[0], thing: inRoomOf(r, THINGS)[0] };
  const userViews = Object.fromEntries(Object.entries(config.views).map(([id, v]) =>
    [id, v.compute ? v : { ...v, position: toScene(v.position), target: toScene(v.target) }]));
  const views = { ...builtIn, ...userViews };
  const firstView = config.startView ?? Object.keys(userViews)[0];

  // Remembered on this device, per room
  const key = what => `${name}:${what}`;
  const load = what => { try { return localStorage.getItem(key(what)); } catch (e) { return null; } };
  const remember = (what, value) => { try { localStorage.setItem(key(what), value); } catch (e) { /* not important */ } };
  // A list kept on this device as JSON, read and written
  const storedList = what => ({
    read() { try { return JSON.parse(localStorage.getItem(key(what))) || []; } catch (e) { return []; } },
    write(list) { try { localStorage.setItem(key(what), JSON.stringify(list)); return true; } catch (e) { return false; } },
  });
  // Saved views: [{ name, posture, position, target, hfov }] in scene
  // metres, posture only if saved at the chosen eye height
  const savedViewsKept = storedList('savedViews');
  // Saved looks: [{ name, place, thing, eye }]
  const savedLooksKept = storedList('savedLooks');
  return { EYES, PLACES, THINGS, ROOMS, firstRoom, roomOf, inRoom, inRoomOf, entrance, userViews, views, firstView, load, remember,
    savedViews: savedViewsKept.read, storeSavedViews: savedViewsKept.write, savedLooks: savedLooksKept.read, storeSavedLooks: savedLooksKept.write };
}

// What changes as the view does
function viewState({ EYES, config, firstRoom, firstView, load }) {
  return {
    room: firstRoom,               // the room chosen
    eye: Object.hasOwn(EYES, load('eye') ?? '') ? load('eye') : (config.eye ?? Object.keys(EYES)[0]),   // the eye height chosen
    viewId: firstView,             // the view chosen, or '' once moved by hand
    follows: false,                // worked out from the room as it is, so worked out again when it changes
    eyeLevel: false,               // at the chosen eye height, as a person, before any moving by hand
    floorLevel: 0,                 // the height of the floor you're on, in metres (0 but on the stairs and below)
    aimed: false,                  // looking at a thing, before any moving by hand
    seatable: false,               // in a view with a chair to sit in
    hfov: null,                    // the angle across, in degrees, if the view sets one
    asPerson: false,               // in a view as a person
    inChair: false,                // and sitting in the chair
    // Changing Where or Looking at keeps the other, if it's in the same room
    lookPlace: config.look?.place ?? Object.keys(config.places)[0],
    lookThing: config.look?.thing ?? Object.keys(config.things)[0],
    startView: null,               // the last 3D view chosen here, to go back to from the 2D views (startAndSaving())
    ready: false,                  // the address's own view has been read, so it can be written
    timer: null,                   // writing the view into the address, a moment after it stops changing
  };
}

// View ids: a config-defined or built-in view's own, 'saved:<name>', or
// 'look:<place>:<thing>'
const lookParts = id => id.split(':').slice(1);
// A Save button greyed out says why in its tooltip (notes/UI_CRITIQUE.md, step
// 9), its own tooltip back once it can be used
function canUse(button, yes, whyNot) {
  button.dataset.title ??= button.title;
  button.disabled = !yes;
  button.title = yes ? button.dataset.title : whyNot;
}
// The menus' choices
const choice = (value, label, title = '') => Object.assign(document.createElement('option'), { value, textContent: label, title });
const unset = label => Object.assign(choice('', label), { disabled: true });
// A list filled again with `first`, then each group of choices, under its label
function fillGrouped(list, first, groups) {
  list.replaceChildren(first);
  for (const [label, choices] of groups) {
    if (!choices.length) continue;
    const g = document.createElement('optgroup');
    g.label = label;
    g.append(...choices);
    list.append(g);
  }
}

// Finding a view by its id, and where it is: a look worked out from its
// place and thing, at the eye height chosen
function viewFinding(k) {
  const { PLACES, THINGS, EYES, views, anchors, actions, chair, computed, config, roomOf, inRoom, s } = k;
  const forRoom = v => v.rooms?.[s.room] ? { ...v, ...v.rooms[s.room] } : v;
  const thingAt = id => THINGS[id].anchor ? anchors[THINGS[id].anchor]() : inRoom(THINGS[id], THINGS[id].at);
  const cannotSee = (p, t) => Boolean(PLACES[p].cannotSee?.includes(t));
  const canSee = (p, t) => roomOf(THINGS[t]) === roomOf(PLACES[p]) && !cannotSee(p, t);
  function is3dView(id) {
    if (id.startsWith('saved:')) return k.savedViews().some(v => v.name === id.slice(6));
    if (id.startsWith('look:')) {
      const [p, t] = lookParts(id);
      return Object.hasOwn(PLACES, p ?? '') && Object.hasOwn(THINGS, t ?? '') && !PLACES[p].cannotSee?.includes(t);
    }
    return Object.hasOwn(views, id) && !views[id].fit;
  }
  function findView(id) {
    if (id.startsWith('saved:')) return k.savedViews().find(v => v.name === id.slice(6)) || null;
    if (id.startsWith('look:')) return is3dView(id) ? lookView(...lookParts(id)) : null;
    const v = Object.hasOwn(views, id) ? forRoom(views[id]) : null;
    if (v && v.compute) return { ...v, ...computed[v.compute](), follows: true, compute: undefined };
    return v;
  }
  // From a place to a thing, at no height yet (see atEyeHeight). In a
  // chair, you turn it to face the thing, your eyes in front of its middle
  // (the place's `at`).
  function lookView(placeId, thingId) {
    const place = PLACES[placeId], [tx, ty, th] = thingAt(thingId);
    if (place.arrive) actions[place.arrive]?.();
    let [x, y] = place.anchor ? anchors[place.anchor]() : inRoom(place, place.at), chairTurn;
    if (place.chair && chair) {
      chairTurn = Math.atan2(tx - x, ty - y);                 // the chair's front is its +y, turned by this from the room's
      x += chair.eyes * Math.sin(chairTurn);
      y += chair.eyes * Math.cos(chairTurn);
    }
    return { posture: place.posture, chair: place.chair, aimed: true, follows: true, chairTurn, floor: (place.floor ?? 0) * MM,
      position: [x * MM, 0, y * MM], target: toScene([tx, ty, th]), hfov: place.hfov ?? config.hfov ?? 79 };
  }
  // As a person, at the chosen eye height above the floor you're on (a
  // view's `floor`, in metres, for a place on the stairs or below): raised
  // or lowered, looking at the same angle, or still at the same thing
  function atEyeHeight(v) {
    if (!v.posture || v.exact) return v;
    const h = EYES[s.eye].height + (v.floor ?? 0);
    if (v.aimed) return { ...v, position: [v.position[0], h, v.position[2]] };
    const rise = h - v.position[1];
    const up = ([x, ht, y]) => [x, ht + rise, y];
    return { ...v, position: up(v.position), target: up(v.target) };
  }
  // The room a view is in: a look's place's; a built-in or config-defined
  // view's own (the first room, unless it says), or if it frames every
  // room, the one chosen; a saved view's, as saved
  function roomOfView(id) {
    if (id.startsWith('look:')) return Object.hasOwn(PLACES, lookParts(id)[0] ?? '') ? roomOf(PLACES[lookParts(id)[0]]) : s.room;
    if (id.startsWith('saved:')) return k.savedViews().find(v => v.name === id.slice(6))?.room ?? s.room;
    if (Object.hasOwn(views, id)) return views[id].rooms ? s.room : roomOf(views[id]);
    return s.room;
  }
  return { cannotSee, canSee, is3dView, findView, atEyeHeight, roomOfView };
}

// The camera put at a view, and moved by hand: as a person, dragging turns
// your head (and the chair, if you're in it), scrolling zooms like a lens
// and the arrow keys or WASD walk
function cameraControls(k) {
  const { THREE, camera, controls, canvas, chair, el, hints, hooks, firstView, s } = k;
  // keepEye: the eye height was just chosen, so the view doesn't set
  // sitting or standing
  function setView(id, keepEye = false) {
    k.setRoom(k.roomOfView(id));
    let v = k.findView(id);
    if (!v) v = k.findView(id = firstView);                   // a saved view since deleted
    applyView(v, id, keepEye);
  }
  // id is '' for a view not in the lists (from the address)
  function applyView(v, id, keepEye = false) {
    s.viewId = id;
    s.follows = Boolean(v.follows);
    s.asPerson = s.inChair = false;                           // till the cameras are placed
    if (v.posture && !keepEye) s.eye = eyeFor(v.posture);
    v = k.atEyeHeight(v);
    s.eyeLevel = Boolean(v.posture);
    s.floorLevel = v.floor ?? 0;
    s.aimed = Boolean(v.aimed);
    s.seatable = Boolean(v.chair || v.seat);
    if (chair) chair.object.rotation.y = v.chairTurn ?? chair.rest;
    s.hfov = v.hfov || null;
    hooks.place(v, id, s.room);
    const flat = hooks.isFlat();
    setPerson(!flat && Boolean(v.posture));
    if (!flat) controls.update();
    canUse(el.save, !flat, 'A 2D view can\'t be saved: each of the room\'s walls is in its ▾ already');
    k.showChoices(Boolean(v.posture) && !v.exact);
    k.writeView();
  }
  // The same person, sitting or standing
  const eyeFor = p => k.EYES[`${p}-${person(s.eye)}`] ? `${p}-${person(s.eye)}` : Object.keys(k.EYES).find(key => posture(key) === p) ?? s.eye;

  function setPerson(on) {
    s.asPerson = on;
    s.inChair = on && s.seatable && Boolean(chair) && posture(s.eye) === 'sit';
    if (on) {
      const ahead = controls.target.clone().sub(camera.position).normalize();
      controls.target.copy(camera.position).addScaledVector(ahead, PIVOT);
    }
    controls.enableZoom = !on;                                // scrolling zooms the lens instead
    controls.enablePan = !s.inChair;
    controls.screenSpacePanning = !on;                        // as a person, panning walks across the floor
    controls.panSpeed = on ? 15 : 1;                          // panning goes by the pivot's distance, so much faster when it's close
    controls.rotateSpeed = on ? 0.5 : 1;
    if (el.hint) el.hint.textContent = hooks.isFlat() ? hints.flat : on ? hints.person : hints.orbit;
  }
  // In the chair, your eyes stay in front of its middle as you swivel
  controls.addEventListener('change', () => {
    if (!s.inChair) return;
    const turn = Math.atan2(controls.target.x - camera.position.x, controls.target.z - camera.position.z);
    const c = chair.object.position, r = chair.eyes * MM;
    const shift = new THREE.Vector3(c.x + r * Math.sin(turn) - camera.position.x, 0, c.z + r * Math.cos(turn) - camera.position.z);
    camera.position.add(shift);
    controls.target.add(shift);
    chair.object.rotation.y = turn;
  });
  // Scrolling as a person zooms like a lens: 30° to 100° across
  canvas.addEventListener('wheel', e => {
    if (hooks.isFlat() || !s.asPerson) return;
    e.preventDefault();
    s.hfov = THREE.MathUtils.clamp((s.hfov || 79) * Math.exp(e.deltaY * 0.001), 30, 100);
    hooks.resize();
    movedByHand();
  }, { passive: false });
  // The arrow keys or WASD walk you about as a person, at the same height.
  // In the chair, you stand up first (by choosing a standing eye height).
  window.addEventListener('keydown', e => {
    if (hooks.isFlat() || !s.asPerson || s.inChair || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('select, input, textarea')) return;  // the arrow keys work those
    const steps = { ArrowUp: [0, 1], w: [0, 1], ArrowDown: [0, -1], s: [0, -1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
    const step = steps[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (!step) return;
    e.preventDefault();
    const ahead = controls.target.clone().sub(camera.position).setY(0).normalize();
    const right = new THREE.Vector3(-ahead.z, 0, ahead.x);
    const move = ahead.multiplyScalar(step[1] * STEP).addScaledVector(right, step[0] * STEP);
    camera.position.add(move);
    controls.target.add(move);
    movedByHand();
  });
  // Moving by hand leaves the view chosen, so it can be saved, or chosen again
  function movedByHand() {
    if (s.viewId) {
      s.viewId = '';
      s.follows = s.aimed = false;
      k.showChoices(false);
    }
    k.writeView();
  }
  controls.addEventListener('start', movedByHand);
  controls.addEventListener('change', () => k.writeView());    // as it settles after dragging, too
  // As a person the pivot is close in front of your eyes: 3 m out keeps
  // the aim exact
  const aimOut = () => controls.target.clone().sub(camera.position).normalize().multiplyScalar(3).add(camera.position);
  return { setView, applyView, setPerson, aimOut };
}

// The views list, if the page has one (else the page lists them itself:
// hooks.viewsChanged(), after one's saved or deleted, and `savedViews`), in
// three groups
function savedViewsList(k) {
  const { el, userViews, builtIn } = k;
  const viewUnset = unset('');
  function fillViews() {
    if (!el.views) return;
    fillGrouped(el.views, viewUnset, [
      ['Config-defined', Object.entries(userViews).map(([id, v]) => choice(id, v.label, v.title))],
      ['Saved on this device', k.savedViews().map(v => choice(`saved:${v.name}`, v.name))],
      ['Built-in', Object.entries(builtIn).map(([id, v]) => choice(id, v.label, v.title))],
    ]);
  }
  fillViews();
  return { fillViews, viewUnset };
}

// Room, Where and Looking at, offering the room's places and things, and
// the eye heights
function whereAndLookingAt(k) {
  const { el, EYES, PLACES, THINGS, ROOMS, views, inRoomOf, entrance, hooks, remember, s } = k;
  el.eye.append(unset('Eye height'), ...Object.entries(EYES).map(([key, e]) => choice(key, `${e.label} (${e.height.toFixed(2)} m)`)));
  el.room?.append(...Object.entries(ROOMS).map(([id, r]) => choice(id, r.label)));
  function fillRoomLists() {
    el.where.replaceChildren(unset('Where'), ...inRoomOf(s.room, PLACES).map(id => choice(id, PLACES[id].label)));
    el.lookAt.replaceChildren(unset('Looking at'), ...inRoomOf(s.room, THINGS).map(id => choice(id, `Looking at ${THINGS[id].label}`)));
    if (el.room) el.room.value = s.room;
  }
  fillRoomLists();
  function setRoom(r) {
    if (r === s.room) return;
    s.room = r;
    fillRoomLists();
  }
  function lookFromPicks() {
    if (k.roomOf(PLACES[s.lookPlace]) !== s.room) s.lookPlace = entrance(s.room).place;
    if (!k.canSee(s.lookPlace, s.lookThing)) s.lookThing = Object.keys(THINGS).find(t => k.canSee(s.lookPlace, t));
    k.setView(`look:${s.lookPlace}:${s.lookThing}`);
    remember('startView', s.startView = s.viewId);
  }
  // A new room: the same view if it frames every room, else in at its doorway
  el.room?.addEventListener('change', () => {
    setRoom(el.room.value);
    if (s.viewId && views[s.viewId]?.rooms) {
      k.setView(s.viewId);
      if (!hooks.isFlat()) remember('startView', s.startView = s.viewId);
      return;
    }
    ({ place: s.lookPlace, thing: s.lookThing } = entrance(s.room));
    lookFromPicks();
  });
  el.where.addEventListener('change', () => {
    s.lookPlace = el.where.value;
    lookFromPicks();
  });
  el.lookAt.addEventListener('change', () => {
    s.lookThing = el.lookAt.value;
    lookFromPicks();
  });
  return { setRoom };
}

// Looks: a Where, Looking at and eye height by name, from the room's data
// (config.looks: { id: { label, place, thing, eye } }) or saved here
// ([{ name, place, thing, eye }]). Unlike a saved view (a camera's spot
// and direction), a look aims at its thing wherever it is now. In the
// list their ids are 'user:<id>' and 'saved:<name>'.
function looksMenu(k) {
  const { el, config, EYES, PLACES, THINGS, remember, s } = k;
  const userLooks = config.looks ?? {};
  const findLook = id => id.startsWith('saved:') ? k.savedLooks().find(l => l.name === id.slice(6))
    : Object.hasOwn(userLooks, id.slice(5)) ? userLooks[id.slice(5)] : null;
  const lookUnset = unset('');
  function fillLooks() {
    if (!el.looks) return;
    fillGrouped(el.looks, lookUnset, [
      ['Config-defined', Object.entries(userLooks).map(([id, l]) => choice(`user:${id}`, l.label))],
      ['Saved on this device', k.savedLooks().map(l => choice(`saved:${l.name}`, l.name))],
    ]);
  }
  fillLooks();
  if (el.looks) {
    el.looks.addEventListener('change', () => {
      const l = findLook(el.looks.value);
      if (!l || !k.is3dView(`look:${l.place}:${l.thing}`)) return;
      const withEye = Object.hasOwn(EYES, l.eye ?? '');
      if (withEye) remember('eye', s.eye = l.eye);
      k.setView(`look:${l.place}:${l.thing}`, withEye);
      remember('startView', s.startView = s.viewId);
    });
    el.saveLook.addEventListener('click', () => {
      if (!s.viewId.startsWith('look:')) return;
      const [place, thing] = lookParts(s.viewId), list = k.savedLooks(), on = el.looks.value;
      const name = window.prompt('Name this look', on.startsWith('saved:') ? on.slice(6) : `${PLACES[place].label}, looking at ${THINGS[thing].label}`)?.trim();
      if (!name) return;
      const at = list.findIndex(l => l.name === name);
      if (at >= 0 && !window.confirm(`Replace the saved look "${name}"?`)) return;
      const look = { name, place, thing, eye: s.eye };
      if (at >= 0) list[at] = look;
      else list.push(look);
      if (!k.storeSavedLooks(list)) {
        window.alert("This browser isn't letting the page save looks (a private window, perhaps).");
        return;
      }
      fillLooks();
      k.showChoices(true);
    });
    el.removeLook.addEventListener('click', () => {
      const name = el.looks.value.slice('saved:'.length);
      if (!window.confirm(`Delete the saved look "${name}"?`)) return;
      k.storeSavedLooks(k.savedLooks().filter(l => l.name !== name));
      fillLooks();
      k.showChoices(true);
    });
  }
  return { userLooks, lookUnset };
}

// Show the view chosen (none once moved by hand), and the eye height when
// you're in it as a person
function showChoices(k, postured) {
  const { el, PLACES, s } = k;
  const looking = s.viewId.startsWith('look:');
  if (looking) [s.lookPlace, s.lookThing] = lookParts(s.viewId);
  el.where.value = looking ? s.lookPlace : '';
  el.lookAt.value = looking ? s.lookThing : '';
  [...el.lookAt.options].forEach(op => { op.disabled = !op.value || (k.roomOf(PLACES[s.lookPlace]) === s.room && k.cannotSee(s.lookPlace, op.value)); });
  if (el.room) el.room.value = s.room;
  k.viewUnset.textContent = s.viewId ? 'Views' : 'Your view (not saved)';
  if (el.views) el.views.value = looking ? '' : s.viewId;
  if (postured || s.asPerson) el.eye.value = s.eye;
  else if (s.viewId) el.eye.value = '';
  el.remove.hidden = !s.viewId.startsWith('saved:');
  // The look on screen, if it's one in the list (a saved one first);
  // only a look can be saved as one, not anywhere moved to by hand
  if (el.looks) {
    const fits = l => l.place === s.lookPlace && l.thing === s.lookThing && (!l.eye || l.eye === s.eye);
    const saved = looking && k.savedLooks().find(fits), user = looking && Object.entries(k.userLooks).find(([, l]) => fits(l));
    const id = saved ? `saved:${saved.name}` : user ? `user:${user[0]}` : '';
    k.lookUnset.textContent = looking && !id ? 'This look (not saved)' : 'Looks';
    el.looks.value = id;
    canUse(el.saveLook, looking, 'Choose Where you are and Looking at first: a look is those, kept by name');
    el.removeLook.hidden = !id.startsWith('saved:');
  }
}

// The last 3D view chosen here, the views list and eye heights chosen, and
// saving and deleting a view
function startAndSaving(k) {
  const { el, EYES, camera, controls, hooks, firstView, load, remember, s } = k;
  s.startView = load('startView');
  if (!s.startView || !k.is3dView(s.startView)) s.startView = firstView;
  el.views?.addEventListener('change', () => {
    k.setView(el.views.value);
    if (!hooks.isFlat()) remember('startView', s.startView = s.viewId);
  });
  // A new eye height: up or down from where you are, looking at the same
  // angle, or at the same thing
  el.eye.addEventListener('change', () => {
    s.eye = el.eye.value;
    remember('eye', s.eye);
    k.writeView();
    if (hooks.isFlat()) return;
    if (s.aimed) {
      k.setView(s.viewId, true);
      return;
    }
    s.eyeLevel = true;
    const rise = EYES[s.eye].height + s.floorLevel - camera.position.y;
    camera.position.y += rise;
    controls.target.y += rise;
    k.setPerson(true);                                        // standing up gets you out of the chair
    controls.update();
    k.writeView();
  });
  el.save.addEventListener('click', () => {
    if (hooks.isFlat()) return;
    const list = k.savedViews();
    const name = window.prompt('Name this view', s.viewId.startsWith('saved:') ? s.viewId.slice(6) : `My view ${list.length + 1}`)?.trim();
    if (!name) return;
    const at = list.findIndex(v => v.name === name);
    if (at >= 0 && !window.confirm(`Replace the saved view "${name}"?`)) return;
    // Moved from the chosen eye height, and not far up or down (dragging
    // can swing you up or down a little), it keeps to whoever's eye height
    // is chosen later; anywhere else, it stays where it is
    const postured = s.eyeLevel && Math.abs(camera.position.y - s.floorLevel - EYES[s.eye].height) < 0.3;
    const round = p => p.toArray().map(n => Math.round(n * 1000) / 1000);
    const view = { name, room: s.room, ...(postured && { posture: posture(s.eye) }), ...(postured && s.floorLevel && { floor: s.floorLevel }), ...(s.inChair && { seat: true }),
      position: round(camera.position), target: round(s.asPerson ? k.aimOut() : controls.target), hfov: s.hfov };
    if (at >= 0) list[at] = view;
    else list.push(view);
    if (!k.storeSavedViews(list)) {
      window.alert("This browser isn't letting the page save views (a private window, perhaps).");
      return;
    }
    k.fillViews();
    hooks.viewsChanged?.();
    remember('startView', s.startView = s.viewId = `saved:${name}`);
    k.showChoices(postured);
    k.writeView();
  });
  el.remove.addEventListener('click', () => {
    const name = s.viewId.slice('saved:'.length);
    if (!window.confirm(`Delete the saved view "${name}"?`)) return;
    k.storeSavedViews(k.savedViews().filter(v => v.name !== name));
    k.fillViews();
    hooks.viewsChanged?.();
    if (s.startView === s.viewId) remember('startView', s.startView = firstView);
    s.viewId = '';
    k.showChoices(false);
    k.writeView();
  });
  return {};
}

// The view in the page's address (hooks.writeAddress), written a moment
// after it stops changing, and read back
function address(k) {
  const { camera, controls, hooks, EYES, ROOMS, builtIn, firstView, s } = k;
  function writeView() {
    if (!s.ready) return;
    clearTimeout(s.timer);
    s.timer = setTimeout(hooks.writeAddress, 250);
  }
  // The view as JSON, for the page's address: the room chosen; a view from
  // the lists by its id, or for anywhere else (moved by hand, or saved on a
  // device) null and the camera: `kind` 'cam' (orbiting), 'walk' (as a
  // person) or 'seat' (in the chair), its place and aim in mm, and its
  // angle across in degrees (null if the view doesn't set one); and the eye
  // height. 2D views keep their id only, not any panning or zooming.
  function view() {
    const listed = hooks.isFlat() || Boolean(s.viewId && !s.viewId.startsWith('saved:'));
    const mm = p => p.toArray().map(n => Math.round(n * 1000));
    const at = listed ? null : {
      kind: s.inChair ? 'seat' : s.asPerson ? 'walk' : 'cam',
      position: mm(camera.position), target: mm(s.asPerson ? k.aimOut() : controls.target), fov: s.hfov ? Math.round(s.hfov) : null,
    };
    return { room: s.room, view: listed ? s.viewId : null, camera: at, eye: s.eye };
  }
  // A view as view() gives it. Returns whether there was a view to show
  function readView(v) {
    if (!v || typeof v !== 'object') return false;
    if (Object.hasOwn(EYES, v.eye ?? '')) s.eye = v.eye;
    if (Object.hasOwn(ROOMS, v.room ?? '')) k.setRoom(v.room);
    const point = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
    const { kind, position, target, fov } = v.camera ?? {};
    if (['cam', 'walk', 'seat'].includes(kind) && point(position) && point(target)) {
      k.applyView({ exact: true, posture: kind === 'cam' ? undefined : posture(s.eye), seat: kind === 'seat',
        position: position.map(n => n * MM), target: target.map(n => n * MM), hfov: Number.isFinite(fov) ? fov : null }, '', true);
      return true;
    }
    if (typeof v.view !== 'string' || (!k.is3dView(v.view) && !Object.hasOwn(builtIn, v.view))) return false;
    k.setView(v.view, true);
    return true;
  }
  // After the room is built: the address's view (as view() gives it), else
  // the room's own starting view (config.startView)
  function start(given) {
    if (!readView(given)) k.setView(firstView);
    s.ready = true;
    writeView();
  }
  return { writeView, view, start };
}

// What the page sees of the kit
function kitFace(k) {
  const { hooks, remember, s } = k;
  return {
    setView: k.setView, start: k.start, view: k.view, writeView: k.writeView,
    // Room r, seen from view `id`, one that frames every room (as Bird's
    // eye or the plan), as if chosen from the lists
    showRoom(r, id) {
      k.setRoom(r);
      k.setView(id);
      if (!hooks.isFlat()) remember('startView', s.startView = s.viewId);
    },
    // Room r chosen where the view is, the camera left as it is (a click in
    // it on the page's plan or bird's eye)
    chooseRoom(r) { k.setRoom(r); k.writeView(); },
    // The room changed: work the view out again, if it's worked out from it
    refresh() { if (s.follows) k.setView(s.viewId); },
    get viewId() { return s.viewId; },
    get savedViews() { return k.savedViews(); },
    get room() { return s.room; },
    get startView() { return s.startView; },
    get hfov() { return s.hfov; },
    get asPerson() { return s.asPerson; },                    // in a view as a person, at eye height
    get eye() { return s.eye; },                              // the eye height chosen, as 'sit-tall'
  };
}
