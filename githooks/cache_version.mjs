// Sets the offline cache's name (CACHE in sw.js) from what's being
// committed: a hash of the staged copy of every file sw.js caches. A commit
// that changes any of them changes sw.js too, so phones fetch the new files;
// one that changes none leaves sw.js as it is. Run by githooks/pre-commit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const SW = 'sw.js';
const CACHE_LINE = /const CACHE = '[^']*';/;
const HASH_LENGTH = 10;                                         // chosen: short to read, and enough to tell versions apart

// The staged copy of a file (what the commit will hold), not the working one
const staged = file => execFileSync('git', ['show', `:${file}`]);

const sw = staged(SW).toString();
const cached = [...sw.matchAll(/^\s*'\.\/([^']+)',/gm)].map(m => m[1]);

const hash = createHash('sha256');
for (const file of cached) hash.update(file).update(staged(file));
const name = `cupboards-${hash.digest('hex').slice(0, HASH_LENGTH)}`;

const line = `const CACHE = '${name}';`;
if (sw.replace(CACHE_LINE, line) !== sw) {
  writeFileSync(SW, readFileSync(SW, 'utf8').replace(CACHE_LINE, line));
  execFileSync('git', ['add', SW]);
  console.log(`sw.js: CACHE is now ${name}`);
}
