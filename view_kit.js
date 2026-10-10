// View kit: where you are in a three.js room model, and what you're looking
// at. Reusable for any room: the room supplies its own data (see
// room_3d.views.js for one) and a few hooks, and the kit does the rest:
//
// - Views from the room's data (user-defined), views saved in the page
//   (kept in the browser, so on one device), and the room's own built-in
//   views, in one list.
// - Places you can be and things you can look at, chosen apart: the camera
//   stands at the place, at the chosen eye height, aimed at the thing.
// - Eye heights: who's looking (short, tall) and whether they sit or stand.
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
// A plain script (not a module), so pages work when opened from a file too.
// It sets window.ViewKit.
(function () {
  'use strict';
  const MM = 0.001;
  const PIVOT = 0.1;               // as a person, the controls' pivot: metres in front of your eyes
  const STEP = 0.1;                // a walking step, in metres
  const toScene = ([x, y, h]) => [x * MM, h * MM, y * MM];
  const posture = key => key.split('-')[0];                     // eye heights are keyed '<posture>-<person>', as 'sit-tall'
  const person = key => key.split('-').slice(1).join('-');

  // options:
  //   THREE, camera, controls (OrbitControls), canvas: the 3D view
  //   room: a name for this room, to keep its saved views apart
  //   config: the room's data (eyes, places, things, views, startView, look)
  //   builtIn: { id: view } the room's own views, in scene metres; those
  //     with `fit` are 2D, for the room's code to place (see hooks.place)
  //   anchors: { name: () => [x, y, height] } things that move, in mm (or
  //     [x, y] for places that move)
  //   computed: { name: () => view } views worked out when chosen, in scene metres
  //   actions: { name: () => {} } things a place does when you arrive (its `arrive`)
  //   chair: { object, rest, eyes } a swivel chair: the object to turn, its
  //     turn when no one's in it (radians), and how far your eyes are in
  //     front of its middle (mm)
  //   el: { where, lookAt, eye, views, save, remove, hint } the controls
  //   hints: { flat, orbit, person } what the hint says in each case
  //   hooks: {
  //     place(view, id)   put the cameras at the view (2D or 3D), then resize and update
  //     isFlat()          in a 2D view
  //     resize()          after the lens changes
  //     writeAddress()    write the page address, with address() as its view part
  //     sceneState        optional { get(), set(text) }: more of the scene for the address, as door angles
  //   }
  function create(o) {
    const { THREE, camera, controls, canvas, config, builtIn = {}, anchors = {}, computed = {}, actions = {}, chair = null, el, hints, hooks } = o;
    const EYES = Object.fromEntries(Object.entries(config.eyes).map(([k, e]) => [k, { ...e, height: e.height * MM }]));
    const PLACES = config.places, THINGS = config.things;
    const userViews = Object.fromEntries(Object.entries(config.views).map(([id, v]) =>
      [id, v.compute ? v : { ...v, position: toScene(v.position), target: toScene(v.target) }]));
    const views = { ...builtIn, ...userViews };
    const firstView = config.startView ?? Object.keys(userViews)[0];

    // Remembered on this device, per room
    const key = name => `${o.room}:${name}`;
    const load = name => { try { return localStorage.getItem(key(name)); } catch (e) { return null; } };
    const remember = (name, value) => { try { localStorage.setItem(key(name), value); } catch (e) { /* not important */ } };
    // Saved views: [{ name, posture, position, target, hfov }] in scene
    // metres, posture only if saved at the chosen eye height
    function savedViews() {
      try { return JSON.parse(localStorage.getItem(key('savedViews'))) || []; } catch (e) { return []; }
    }
    function storeSavedViews(list) {
      try { localStorage.setItem(key('savedViews'), JSON.stringify(list)); return true; } catch (e) { return false; }
    }

    let eye = Object.hasOwn(EYES, load('eye') ?? '') ? load('eye') : (config.eye ?? Object.keys(EYES)[0]);
    // The same person, sitting or standing
    const eyeFor = p => EYES[`${p}-${person(eye)}`] ? `${p}-${person(eye)}` : Object.keys(EYES).find(k => posture(k) === p) ?? eye;

    // View ids: a user-defined or built-in view's own, 'saved:<name>', or
    // 'look:<place>:<thing>'
    const lookParts = id => id.split(':').slice(1);
    const thingAt = id => THINGS[id].anchor ? anchors[THINGS[id].anchor]() : THINGS[id].at;
    function is3dView(id) {
      if (id.startsWith('saved:')) return savedViews().some(v => v.name === id.slice(6));
      if (id.startsWith('look:')) {
        const [p, t] = lookParts(id);
        return Object.hasOwn(PLACES, p ?? '') && Object.hasOwn(THINGS, t ?? '') && !PLACES[p].cannotSee?.includes(t);
      }
      return Object.hasOwn(views, id) && !views[id].fit;
    }
    function findView(id) {
      if (id.startsWith('saved:')) return savedViews().find(v => v.name === id.slice(6)) || null;
      if (id.startsWith('look:')) return is3dView(id) ? lookView(...lookParts(id)) : null;
      const v = Object.hasOwn(views, id) ? views[id] : null;
      if (v && v.compute) return { ...v, ...computed[v.compute](), follows: true, compute: undefined };
      return v;
    }
    // From a place to a thing, at no height yet (see atEyeHeight). In a
    // chair, you turn it to face the thing, your eyes in front of its middle
    // (the place's `at`).
    function lookView(placeId, thingId) {
      const place = PLACES[placeId], [tx, ty, th] = thingAt(thingId);
      if (place.arrive) actions[place.arrive]?.();
      let [x, y] = place.anchor ? anchors[place.anchor]() : place.at, chairTurn;
      if (place.chair && chair) {
        chairTurn = Math.atan2(tx - x, ty - y);                 // the chair's front is its +y, turned by this from the room's
        x += chair.eyes * Math.sin(chairTurn);
        y += chair.eyes * Math.cos(chairTurn);
      }
      return { posture: place.posture, chair: place.chair, aimed: true, follows: true, chairTurn,
        position: [x * MM, 0, y * MM], target: toScene([tx, ty, th]), hfov: place.hfov ?? config.hfov ?? 79 };
    }
    // As a person, at the chosen eye height: raised or lowered, looking at
    // the same angle, or still at the same thing
    function atEyeHeight(v) {
      if (!v.posture || v.exact) return v;
      const h = EYES[eye].height;
      if (v.aimed) return { ...v, position: [v.position[0], h, v.position[2]] };
      const rise = h - v.position[1];
      const up = ([x, ht, y]) => [x, ht + rise, y];
      return { ...v, position: up(v.position), target: up(v.target) };
    }

    let viewId = firstView;          // the view chosen, or '' once moved by hand
    let follows = false;             // worked out from the room as it is, so worked out again when it changes
    let eyeLevel = false;            // at the chosen eye height, as a person, before any moving by hand
    let aimed = false;               // looking at a thing, before any moving by hand
    let seatable = false;            // in a view with a chair to sit in
    let hfov = null;                 // the angle across, in degrees, if the view sets one
    let asPerson = false;            // in a view as a person
    let inChair = false;             // and sitting in the chair

    // keepEye: the eye height was just chosen, so the view doesn't set
    // sitting or standing
    function setView(id, keepEye = false) {
      let v = findView(id);
      if (!v) v = findView(id = firstView);                     // a saved view since deleted
      applyView(v, id, keepEye);
    }
    // id is '' for a view not in the lists (from the address)
    function applyView(v, id, keepEye = false) {
      viewId = id;
      follows = Boolean(v.follows);
      asPerson = inChair = false;                               // till the cameras are placed
      if (v.posture && !keepEye) eye = eyeFor(v.posture);
      v = atEyeHeight(v);
      eyeLevel = Boolean(v.posture);
      aimed = Boolean(v.aimed);
      seatable = Boolean(v.chair || v.seat);
      if (chair) chair.object.rotation.y = v.chairTurn ?? chair.rest;
      hfov = v.hfov || null;
      hooks.place(v, id);
      const flat = hooks.isFlat();
      setPerson(!flat && Boolean(v.posture));
      if (!flat) controls.update();
      el.save.disabled = flat;
      showChoices(Boolean(v.posture) && !v.exact);
      writeView();
    }

    function setPerson(on) {
      asPerson = on;
      inChair = on && seatable && Boolean(chair) && posture(eye) === 'sit';
      if (on) {
        const ahead = controls.target.clone().sub(camera.position).normalize();
        controls.target.copy(camera.position).addScaledVector(ahead, PIVOT);
      }
      controls.enableZoom = !on;                                // scrolling zooms the lens instead
      controls.enablePan = !inChair;
      controls.screenSpacePanning = !on;                        // as a person, panning walks across the floor
      controls.panSpeed = on ? 15 : 1;                          // panning goes by the pivot's distance, so much faster when it's close
      controls.rotateSpeed = on ? 0.5 : 1;
      if (el.hint) el.hint.textContent = hooks.isFlat() ? hints.flat : on ? hints.person : hints.orbit;
    }
    // In the chair, your eyes stay in front of its middle as you swivel
    controls.addEventListener('change', () => {
      if (!inChair) return;
      const turn = Math.atan2(controls.target.x - camera.position.x, controls.target.z - camera.position.z);
      const c = chair.object.position, r = chair.eyes * MM;
      const shift = new THREE.Vector3(c.x + r * Math.sin(turn) - camera.position.x, 0, c.z + r * Math.cos(turn) - camera.position.z);
      camera.position.add(shift);
      controls.target.add(shift);
      chair.object.rotation.y = turn;
    });
    // Scrolling as a person zooms like a lens: 30° to 100° across
    canvas.addEventListener('wheel', e => {
      if (hooks.isFlat() || !asPerson) return;
      e.preventDefault();
      hfov = THREE.MathUtils.clamp((hfov || 79) * Math.exp(e.deltaY * 0.001), 30, 100);
      hooks.resize();
      movedByHand();
    }, { passive: false });
    // The arrow keys or WASD walk you about as a person, at the same height.
    // In the chair, you stand up first (by choosing a standing eye height).
    window.addEventListener('keydown', e => {
      if (hooks.isFlat() || !asPerson || inChair || e.metaKey || e.ctrlKey || e.altKey) return;
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
      if (viewId) {
        viewId = '';
        follows = aimed = false;
        showChoices(false);
      }
      writeView();
    }
    controls.addEventListener('start', movedByHand);
    controls.addEventListener('change', () => writeView());      // as it settles after dragging, too

    // The controls: the views list in three groups, Where and Looking at,
    // and eye heights
    const choice = (value, label, title = '') => Object.assign(document.createElement('option'), { value, textContent: label, title });
    const unset = label => Object.assign(choice('', label), { disabled: true });
    const viewUnset = unset('');
    function fillViews() {
      el.views.replaceChildren(viewUnset);
      const group = (label, choices) => {
        if (!choices.length) return;
        const g = document.createElement('optgroup');
        g.label = label;
        g.append(...choices);
        el.views.append(g);
      };
      group('User-defined', Object.entries(userViews).map(([id, v]) => choice(id, v.label, v.title)));
      group('Saved on this device', savedViews().map(v => choice(`saved:${v.name}`, v.name)));
      group('Built-in', Object.entries(builtIn).map(([id, v]) => choice(id, v.label, v.title)));
    }
    fillViews();
    el.eye.append(unset('Eye height'), ...Object.entries(EYES).map(([k, e]) => choice(k, `${e.label} (${e.height.toFixed(2)} m)`)));
    // Changing Where or Looking at keeps the other
    let lookPlace = config.look?.place ?? Object.keys(PLACES)[0];
    let lookThing = config.look?.thing ?? Object.keys(THINGS)[0];
    el.where.append(unset('Where'), ...Object.entries(PLACES).map(([id, p]) => choice(id, p.label)));
    el.lookAt.append(unset('Looking at'), ...Object.entries(THINGS).map(([id, t]) => choice(id, `Looking at ${t.label}`)));
    const cannotSee = (p, t) => Boolean(PLACES[p].cannotSee?.includes(t));
    function lookFromPicks() {
      if (cannotSee(lookPlace, lookThing)) lookThing = Object.keys(THINGS).find(t => !cannotSee(lookPlace, t));
      setView(`look:${lookPlace}:${lookThing}`);
      remember('startView', startView = viewId);
    }
    el.where.addEventListener('change', () => {
      lookPlace = el.where.value;
      lookFromPicks();
    });
    el.lookAt.addEventListener('change', () => {
      lookThing = el.lookAt.value;
      lookFromPicks();
    });
    // Show the view chosen (none once moved by hand), and the eye height when
    // you're in it as a person
    function showChoices(postured) {
      const looking = viewId.startsWith('look:');
      if (looking) [lookPlace, lookThing] = lookParts(viewId);
      el.where.value = looking ? lookPlace : '';
      el.lookAt.value = looking ? lookThing : '';
      [...el.lookAt.options].forEach(op => { op.disabled = !op.value || cannotSee(lookPlace, op.value); });
      viewUnset.textContent = viewId ? 'Views' : 'Your view (not saved)';
      el.views.value = looking ? '' : viewId;
      if (postured || asPerson) el.eye.value = eye;
      else if (viewId) el.eye.value = '';
      el.remove.hidden = !viewId.startsWith('saved:');
    }

    // The last 3D view chosen here, to go back to from the 2D views
    let startView = load('startView');
    if (!startView || !is3dView(startView)) startView = firstView;
    el.views.addEventListener('change', () => {
      setView(el.views.value);
      if (!hooks.isFlat()) remember('startView', startView = viewId);
    });
    // A new eye height: up or down from where you are, looking at the same
    // angle, or at the same thing
    el.eye.addEventListener('change', () => {
      eye = el.eye.value;
      remember('eye', eye);
      writeView();
      if (hooks.isFlat()) return;
      if (aimed) {
        setView(viewId, true);
        return;
      }
      eyeLevel = true;
      const rise = EYES[eye].height - camera.position.y;
      camera.position.y += rise;
      controls.target.y += rise;
      setPerson(true);                                          // standing up gets you out of the chair
      controls.update();
      writeView();
    });
    // As a person the pivot is close in front of your eyes: 3 m out keeps
    // the aim exact
    const aimOut = () => controls.target.clone().sub(camera.position).normalize().multiplyScalar(3).add(camera.position);
    el.save.addEventListener('click', () => {
      if (hooks.isFlat()) return;
      const list = savedViews();
      const name = window.prompt('Name this view', viewId.startsWith('saved:') ? viewId.slice(6) : `My view ${list.length + 1}`)?.trim();
      if (!name) return;
      const at = list.findIndex(v => v.name === name);
      if (at >= 0 && !window.confirm(`Replace the saved view "${name}"?`)) return;
      // Moved from the chosen eye height, and not far up or down (dragging
      // can swing you up or down a little), it keeps to whoever's eye height
      // is chosen later; anywhere else, it stays where it is
      const postured = eyeLevel && Math.abs(camera.position.y - EYES[eye].height) < 0.3;
      const round = p => p.toArray().map(n => Math.round(n * 1000) / 1000);
      const view = { name, ...(postured && { posture: posture(eye) }), ...(inChair && { seat: true }),
        position: round(camera.position), target: round(asPerson ? aimOut() : controls.target), hfov };
      if (at >= 0) list[at] = view;
      else list.push(view);
      if (!storeSavedViews(list)) {
        window.alert("This browser isn't letting the page save views (a private window, perhaps).");
        return;
      }
      fillViews();
      remember('startView', startView = viewId = `saved:${name}`);
      showChoices(postured);
      writeView();
    });
    el.remove.addEventListener('click', () => {
      const name = viewId.slice('saved:'.length);
      if (!window.confirm(`Delete the saved view "${name}"?`)) return;
      storeSavedViews(savedViews().filter(v => v.name !== name));
      fillViews();
      if (startView === viewId) remember('startView', startView = firstView);
      viewId = '';
      showChoices(false);
      writeView();
    });

    // The view's part of the page address, so a link shows just what was on
    // screen: a view from the lists by its id, or anywhere else (moved by
    // hand, or saved on a device) as 'cam' (orbiting), 'walk' (as a person)
    // or 'seat' (in the chair) and seven numbers, joined by ':': the camera's
    // place and aim in mm, and the angle across in degrees. Then '.' and the
    // eye height, and '.' and the room's sceneState, if it has one. 2D views
    // keep their id only, not any panning or zooming.
    let ready = false;               // the address's own view has been read, so it can be written
    let timer = null;
    function writeView() {
      if (!ready) return;
      clearTimeout(timer);
      timer = setTimeout(hooks.writeAddress, 250);
    }
    function address() {
      const extra = hooks.sceneState ? `.${hooks.sceneState.get()}` : '';
      if (hooks.isFlat() || (viewId && !viewId.startsWith('saved:'))) return `${viewId}.${eye}${extra}`;
      const kind = inChair ? 'seat' : asPerson ? 'walk' : 'cam';
      const mm = p => p.toArray().map(n => Math.round(n * 1000));
      return [kind, ...mm(camera.position), ...mm(asPerson ? aimOut() : controls.target), Math.round(hfov || 0)].join(':') + `.${eye}${extra}`;
    }
    // Returns whether there was a view to show
    function readAddress(text) {
      if (!text) return false;
      const [what, eyeIn, extra] = text.split('.');
      if (Object.hasOwn(EYES, eyeIn ?? '')) eye = eyeIn;
      if (hooks.sceneState && extra) hooks.sceneState.set(extra);   // first, as the view may then change it
      const [kind, ...numbers] = what.split(':');
      if (['cam', 'walk', 'seat'].includes(kind)) {
        const n = numbers.map(Number);
        if (n.length !== 7 || n.some(Number.isNaN)) return false;
        applyView({ exact: true, posture: kind === 'cam' ? undefined : posture(eye), seat: kind === 'seat',
          position: n.slice(0, 3).map(v => v * MM), target: n.slice(3, 6).map(v => v * MM), hfov: n[6] || null }, '', true);
        return true;
      }
      if (!is3dView(what) && !Object.hasOwn(builtIn, what)) return false;
      setView(what, true);
      return true;
    }
    // After the room is built: the address's view, else the room's own
    // starting view (config.startView)
    function start(text) {
      if (!readAddress(text)) setView(firstView);
      ready = true;
      writeView();
    }

    return {
      setView, start, address, writeView,
      // The room changed: work the view out again, if it's worked out from it
      refresh() { if (follows) setView(viewId); },
      get viewId() { return viewId; },
      get startView() { return startView; },
      get hfov() { return hfov; },
    };
  }
  window.ViewKit = { create };
})();
