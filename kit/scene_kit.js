// Scene kit: named scenes for a room page, to show people the options. A
// scene is the page's configuration (what's built, and how, as JSON; see
// kit/config_kit.js): the room supplies how to read the configuration it's
// showing (get) and how to show a scene's (apply). Where you're looking
// from isn't part of a scene; that's a view (see view_kit.js).
//
// Scenes come from the room's data (config-defined, the same on every device;
// see living_room.scenes.js for one) and from Save scene (kept in the browser,
// so on one device only), in one list. The list shows the scene on screen,
// or "Your scene (not saved)" once anything's changed.
//
// An ES module, as kit/floor_kit.js: a page imports it as SceneKit
// (import * as SceneKit from './kit/scene_kit.js'), and calls SceneKit.create().
// options:
//   room: a name for this room, to keep its saved scenes apart
//   config: the room's data: { list: { id: { label, title, configuration } } }
//   el: { scenes, save, remove } the list and its buttons
//   get(): the configuration on screen
//   apply(configuration): show a scene's
export function create(o) {
  const { config = {}, el, get, apply } = o;
  const userScenes = config.list ?? {};
  const key = `${o.room}:savedScenes`;
  // Saved scenes: [{ name, configuration }] (those saved before there were
  // configurations, as an address, are left out)
  function savedScenes() {
    try { return (JSON.parse(localStorage.getItem(key)) || []).filter(s => s.configuration); } catch (e) { return []; }
  }
  function storeSavedScenes(list) {
    try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  // Ids in the list: a config-defined scene's own, or 'saved:<name>'
  function configurationOf(id) {
    if (id.startsWith('saved:')) return savedScenes().find(s => s.name === id.slice(6))?.configuration ?? null;
    return Object.hasOwn(userScenes, id) ? userScenes[id].configuration : null;
  }
  // Two configurations the same, whatever the order of their keys
  const sorted = (key, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v);
  const asText = configuration => JSON.stringify(configuration, sorted);

  const choice = (value, label, title = '') => Object.assign(document.createElement('option'), { value, textContent: label, title });
  const unset = Object.assign(choice('', ''), { disabled: true });
  function fill() {
    el.scenes.replaceChildren(unset);
    const group = (label, choices) => {
      if (!choices.length) return;
      const g = document.createElement('optgroup');
      g.label = label;
      g.append(...choices);
      el.scenes.append(g);
    };
    group('Config-defined', Object.entries(userScenes).map(([id, s]) => choice(id, s.label, s.title)));
    group('Saved on this device', savedScenes().map(s => choice(`saved:${s.name}`, s.name)));
  }
  // The scene on screen, if it's one in the list: a saved one first, as
  // it's the one most likely just saved
  function refresh() {
    const now = asText(get());
    const saved = savedScenes().find(s => asText(s.configuration) === now);
    const user = Object.entries(userScenes).find(([, s]) => asText(s.configuration) === now);
    const id = saved ? `saved:${saved.name}` : user ? user[0] : '';
    unset.textContent = id ? 'Scenes' : (el.scenes.options.length > 1 ? 'Your scene (not saved)' : 'Scenes');
    el.scenes.value = id;
    el.remove.hidden = !id.startsWith('saved:');
  }

  el.scenes.addEventListener('change', () => {
    const configuration = configurationOf(el.scenes.value);
    if (configuration) apply(configuration);
  });
  el.save.addEventListener('click', () => {
    const list = savedScenes(), on = el.scenes.value;
    const name = window.prompt('Name this scene', on.startsWith('saved:') ? on.slice(6) : `Scene ${list.length + 1}`)?.trim();
    if (!name) return;
    const at = list.findIndex(s => s.name === name);
    if (at >= 0 && !window.confirm(`Replace the saved scene "${name}"?`)) return;
    const scene = { name, configuration: get() };
    if (at >= 0) list[at] = scene;
    else list.push(scene);
    if (!storeSavedScenes(list)) {
      window.alert("This browser isn't letting the page save scenes (a private window, perhaps).");
      return;
    }
    fill();
    refresh();
  });
  el.remove.addEventListener('click', () => {
    const name = el.scenes.value.slice('saved:'.length);
    if (!window.confirm(`Delete the saved scene "${name}"?`)) return;
    storeSavedScenes(savedScenes().filter(s => s.name !== name));
    fill();
    refresh();
  });

  fill();
  return { refresh };
}
