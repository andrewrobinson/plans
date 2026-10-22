// The configuration kit: a page's settings as JSON, organised by piece,
// read and written through a schema, and packed small for the page's
// address (REFACTOR_PLAN.md, step 6b). Nothing here needs the page, the DOM
// or three.js, so Node can use it too.
//
// A schema is a list of entries, one per setting, in the order the
// configuration lists them (and reads them: a setting checked against
// another comes after it). The page holds its settings laid out as the
// configuration is, so an entry's path is the setting's place in both
// (REFACTOR_PLAN.md items 14 and 15). Each entry:
//   path     where it is, as 'pieces.shoeRack.design.w'
//   kind     what it holds, and how it's checked (the makers below):
//            'number'  with min, max and step (the step isn't checked:
//                      saved designs have sizes off it, as option 7's leg
//                      at 582), unless onSteps, as turns are
//            'onOff'   true or false
//            'choice'  one of `choices`: the configuration's words, or
//                      words for values of the page's own (the view's doors)
//            'colour'  a colour code, checked by the room's `isColour`
//            'other'   anything else, with the entry's own read and write
//   default  the configuration's value as the page starts, filled in by
//            withDefaults()
// A value missing from a configuration, or failing its check, leaves the
// setting as it was: as the page starts.
// ---------------------------------------------------------------------------

// The value at `path` in `object` (undefined if it isn't there), and
// setting it, making the objects on the way
export const valueAt = (object, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), object);
export function setValueAt(object, path, value) {
  const keys = path.split('.'), last = keys.pop();
  const parent = keys.reduce((o, k) => (o[k] ??= {}), object);
  parent[last] = value;
}

// ---------------------------------------------------------------------------
// The entries' makers
// ---------------------------------------------------------------------------
// A number from min to max. more: { onSteps } to hold it to its steps from
// min; { clamp } to bring one outside the range to its nearer end, rather
// than leave the setting as it was; { also: v => true } for a check of the
// room's own
export const number = (path, min, max, step, more = {}) => ({ path, kind: 'number', min, max, step, ...more });
export const onOff = path => ({ path, kind: 'onOff' });
// choices: a list of what it can be (words, or numbers that stay numbers);
// or the word for each of the page's own values, as { foldedAway: 0,
// down: 90 }. Kept as [configuration's, page's] pairs
export const choice = (path, choices) => ({
  path, kind: 'choice',
  choices: Array.isArray(choices) ? choices.map(c => [c, c]) : Object.entries(choices),
});
export const colour = (path, isColour) => ({ path, kind: 'colour', isColour });
// read(value, was, settings): the page's value, or undefined to leave it as
// it was; write(value, settings): the configuration's, or undefined to
// leave it out
export const other = (path, read, write = v => structuredClone(v)) => ({ path, kind: 'other', read, write });

// ---------------------------------------------------------------------------
// Reading and writing
// ---------------------------------------------------------------------------
const finite = v => typeof v === 'number' && Number.isFinite(v);
// A configuration's value as the page's, or undefined if it fails its check
function readValue(entry, value, was, settings) {
  switch (entry.kind) {
    case 'number': {
      if (!finite(value)) return undefined;
      const { min, max, step, onSteps, clamp, also } = entry;
      const v = clamp ? Math.min(max, Math.max(min, value)) : value;
      if (v < min || v > max) return undefined;
      if (onSteps && (v - min) % step !== 0) return undefined;
      return !also || also(v) ? v : undefined;
    }
    case 'onOff': return typeof value === 'boolean' ? value : undefined;
    case 'choice': return entry.choices.find(([word]) => word === value)?.[1];
    case 'colour': return finite(value) && entry.isColour(value) ? value : undefined;
    case 'other': return entry.read(value, was, settings);
    default: throw new Error(`no such kind of setting: ${entry.kind}`);
  }
}
// The page's value as the configuration's (an 'other' entry's write is
// given the settings too, so it can leave a value out: undefined)
function writeValue(entry, value, settings) {
  switch (entry.kind) {
    case 'choice': return entry.choices.find(([, page]) => page === value)?.[0];
    case 'other': return entry.write(value, settings);
    default: return value;
  }
}

// `more` put into `object`: objects merged key by key, anything else (a
// setting's value, an array) put in place of what's there. As a room's
// module's settings, laid out as the configuration is, join the model's
export function mergeInto(object, more) {
  for (const [key, value] of Object.entries(more)) {
    const isObject = v => v && typeof v === 'object' && !Array.isArray(v);
    if (isObject(value) && isObject(object[key])) mergeInto(object[key], value);
    else object[key] = value;
  }
  return object;
}

// One setting, by its entry: its value in `settings` as the configuration
// writes it, and a configuration's value read into `settings`, if it passes
// its check (true if it did)
export const configurationValue = (entry, settings) => writeValue(entry, valueAt(settings, entry.path), settings);
export function readEntry(entry, value, settings) {
  const read = readValue(entry, value, valueAt(settings, entry.path), settings);
  if (read === undefined) return false;
  setValueAt(settings, entry.path, read);
  return true;
}

// A schema's entry by its path
export const entryAt = (schema, path) => schema.find(entry => entry.path === path);

// The configuration of `settings`: every entry's value, in the schema's
// order, after `head` (as its version), bar any its entry leaves out
export function writeConfiguration(schema, settings, head = {}) {
  const configuration = structuredClone(head);
  for (const entry of schema) {
    const value = configurationValue(entry, settings);
    if (value !== undefined) setValueAt(configuration, entry.path, value);
  }
  return configuration;
}
// A configuration read into `settings`, entry by entry, in the schema's
// order. Anything not in the schema is ignored
export function readConfiguration(schema, configuration, settings) {
  for (const entry of schema) {
    const value = valueAt(configuration, entry.path);
    if (value !== undefined) readEntry(entry, value, settings);
  }
}
// Each entry with its default: its value in `settings` as the page starts
export const withDefaults = (schema, settings) => schema.map(entry => ({ ...entry, default: structuredClone(configurationValue(entry, settings)) }));
// The configuration of every default, after `head`
export function defaultConfiguration(schema, head = {}) {
  const configuration = structuredClone(head);
  for (const entry of schema) setValueAt(configuration, entry.path, structuredClone(entry.default));
  return configuration;
}

// ---------------------------------------------------------------------------
// Packing: JSON deflated and written in base64url (A to Z, a to z, 0 to 9,
// - and _), so it can go in an address as it is. With the browser's and
// Node's own CompressionStream, so it's asynchronous
// ---------------------------------------------------------------------------
const PACKING = 'deflate-raw';
const toBase64url = bytes => {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64url = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const through = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

export async function pack(json) {
  return toBase64url(await through(new TextEncoder().encode(JSON.stringify(json)), new CompressionStream(PACKING)));
}
// The JSON packed in `text`, or null if it isn't any
export async function unpack(text) {
  if (!text || !/^[A-Za-z0-9_-]+$/.test(text)) return null;
  try {
    return JSON.parse(new TextDecoder().decode(await through(fromBase64url(text), new DecompressionStream(PACKING))));
  } catch (e) {
    return null;
  }
}
