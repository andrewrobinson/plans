// Configuration kit: named configurations for a room page, each a snapshot
// of the whole page's settings (what's built in every room, and how, as JSON;
// see kit/config_kit.js): the room supplies how to read the configuration
// it's showing (get) and how to show one (apply). Where you're looking from
// isn't part of a configuration; that's a view (see view_kit.js).
//
// Configurations come from the room's data (in a file, the same on every
// device; see living_room.configurations.js) and from Save (kept in the
// browser, so on one device only), in one list. The list shows the
// configuration on screen, or "Yours (not saved)" once anything's changed.
//
// An ES module, as kit/floor_kit.js: a page imports it as ConfigurationKit
// (import * as ConfigurationKit from './kit/configuration_kit.js'), and calls
// ConfigurationKit.create().
// options:
//   room: a name for this room, to keep its saved configurations apart
//   config: the room's data: { list: { id: { label, title, configuration } } }
//   el: { pick, save, remove } the list and its buttons
//   get(): the configuration on screen
//   apply(configuration): show one
export function create(o) {
  const { config = {}, el, get, apply } = o;
  const inFile = config.list ?? {};
  const key = `${o.room}:savedConfigurations`;
  // Those saved when this list was Scenes, under their old key: moved to the
  // new one the first time the page opens
  const OLD_KEY = `${o.room}:savedScenes`;
  try {
    if (localStorage.getItem(key) === null && localStorage.getItem(OLD_KEY) !== null) {
      localStorage.setItem(key, localStorage.getItem(OLD_KEY));
      localStorage.removeItem(OLD_KEY);
    }
  } catch (e) { /* storage blocked: nothing saved to move */ }
  // Saved configurations: [{ name, configuration }] (those saved as an
  // address, before there were configurations, are left out)
  function savedConfigurations() {
    try { return (JSON.parse(localStorage.getItem(key)) || []).filter(s => s.configuration); } catch (e) { return []; }
  }
  function storeSavedConfigurations(list) {
    try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  // Ids in the list: one in the file's own, or 'saved:<name>'
  function configurationOf(id) {
    if (id.startsWith('saved:')) return savedConfigurations().find(s => s.name === id.slice(6))?.configuration ?? null;
    return Object.hasOwn(inFile, id) ? inFile[id].configuration : null;
  }
  // Two configurations the same, whatever the order of their keys
  const sorted = (key, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v);
  const asText = configuration => JSON.stringify(configuration, sorted);

  const choice = (value, label, title = '') => Object.assign(document.createElement('option'), { value, textContent: label, title });
  const unset = Object.assign(choice('', ''), { disabled: true });
  function fill() {
    el.pick.replaceChildren(unset);
    const group = (label, choices) => {
      if (!choices.length) return;
      const g = document.createElement('optgroup');
      g.label = label;
      g.append(...choices);
      el.pick.append(g);
    };
    group('In the file', Object.entries(inFile).map(([id, s]) => choice(id, s.label, s.title)));
    group('Saved on this device', savedConfigurations().map(s => choice(`saved:${s.name}`, s.name)));
  }
  // The configuration on screen, if it's one in the list: a saved one
  // first, as it's the one most likely just saved
  function refresh() {
    const now = asText(get());
    const saved = savedConfigurations().find(s => asText(s.configuration) === now);
    const user = Object.entries(inFile).find(([, s]) => asText(s.configuration) === now);
    const id = saved ? `saved:${saved.name}` : user ? user[0] : '';
    unset.textContent = id ? 'Configurations' : (el.pick.options.length > 1 ? 'Yours (not saved)' : 'Configurations');
    el.pick.value = id;
    el.remove.hidden = !id.startsWith('saved:');
  }

  el.pick.addEventListener('change', () => {
    const configuration = configurationOf(el.pick.value);
    if (configuration) apply(configuration);
  });
  el.save.addEventListener('click', () => {
    const list = savedConfigurations(), on = el.pick.value;
    const name = window.prompt('Name this configuration', on.startsWith('saved:') ? on.slice(6) : `Configuration ${list.length + 1}`)?.trim();
    if (!name) return;
    const at = list.findIndex(s => s.name === name);
    if (at >= 0 && !window.confirm(`Replace the saved configuration "${name}"?`)) return;
    const saved = { name, configuration: get() };
    if (at >= 0) list[at] = saved;
    else list.push(saved);
    if (!storeSavedConfigurations(list)) {
      window.alert("This browser isn't letting the page save configurations (a private window, perhaps).");
      return;
    }
    fill();
    refresh();
  });
  el.remove.addEventListener('click', () => {
    const name = el.pick.value.slice('saved:'.length);
    if (!window.confirm(`Delete the saved configuration "${name}"?`)) return;
    storeSavedConfigurations(savedConfigurations().filter(s => s.name !== name));
    fill();
    refresh();
  });

  fill();
  return { refresh };
}
