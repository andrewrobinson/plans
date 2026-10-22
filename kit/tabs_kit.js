// The tabs kit: tabs across the top of a long drawer (notes/MENU_TABS.md), so
// Lounge, Hallway and stairs, Bedroom and Garage options each show one group of
// sections at a time. From demos/controls_demo.html's Tabs card.
//
// In the page, a drawer's tabs are a .tabs holding an empty .tablist and a
// .tabpanel for each tab, its name in data-tab:
//
//   <div class="tabs" id="loungeTabs">
//     <div class="tablist"></div>
//     <div class="tabpanel" data-tab="Cupboard"> ...its sections... </div>
//   </div>
//
// drawerTabs() makes the buttons. Each drawer opens on the tab last used
// here, kept in localStorage as the sections' open or closed state is: how
// the page is used, not the room, so it isn't in the configuration or the
// address.

// Where the tab last used in `tabs` is kept on this device
const tabKey = tabs => `room_3d:tab:${tabs.id}`;

// Turn every .tabs in `root` into working tabs
export function drawerTabs(root = document) {
  root.querySelectorAll('.tabs').forEach(makeTabs);
}

// Show the tab that holds `element`, if it's in one (for a control reached
// by other means than the tabs: the tests, say)
export function showTabOf(element) {
  const panel = element.closest('.tabpanel');
  if (panel) pickTab(panel.closest('.tabs'), panel);
}

function makeTabs(tabs) {
  const list = tabs.querySelector('.tablist');
  const panels = [...tabs.querySelectorAll(':scope > .tabpanel')];
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', tabs.dataset.label ?? '');
  panels.forEach((panel, i) => {
    const button = tabButton(tabs, panel, i);
    button.addEventListener('click', () => pickTab(tabs, panel));
    button.addEventListener('keydown', e => moveByArrow(e, tabs, panels, i));
    list.append(button);
  });
  pickTab(tabs, lastUsed(tabs, panels) ?? panels[0], { remember: false });
}

// The button for `panel`, the i-th tab, joined to it by their ids
function tabButton(tabs, panel, i) {
  panel.id ||= `${tabs.id}Panel${i}`;
  panel.setAttribute('role', 'tabpanel');
  const button = Object.assign(document.createElement('button'), { type: 'button', textContent: panel.dataset.tab, id: `${panel.id}Tab` });
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', panel.id);
  panel.setAttribute('aria-labelledby', button.id);
  return button;
}

// Show `panel`, hiding the others, and remember it unless told not to
function pickTab(tabs, panel, { remember = true } = {}) {
  for (const other of tabs.querySelectorAll(':scope > .tabpanel')) {
    const on = other === panel;
    other.hidden = !on;
    const button = document.getElementById(other.getAttribute('aria-labelledby'));
    button.setAttribute('aria-selected', String(on));
    button.tabIndex = on ? 0 : -1;                         // Tab reaches only the chosen one; the arrows move between them
  }
  if (remember) {
    try { localStorage.setItem(tabKey(tabs), panel.dataset.tab); } catch (e) { /* not important */ }
  }
}

// The panel last chosen here, if it's still one of them
function lastUsed(tabs, panels) {
  let name = null;
  try { name = localStorage.getItem(tabKey(tabs)); } catch (e) { /* storage blocked: the first tab */ }
  return panels.find(p => p.dataset.tab === name);
}

// Left and right arrows move to the tab before or after, round the ends;
// Home and End to the first and last
function moveByArrow(e, tabs, panels, i) {
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: panels.length - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  const panel = panels[(to + panels.length) % panels.length];
  pickTab(tabs, panel);
  document.getElementById(panel.getAttribute('aria-labelledby')).focus();
}
