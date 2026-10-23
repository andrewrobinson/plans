// The model tests' reporter (npm run test:model): nothing for a test that
// passes, each failure in a few short lines, then the totals. Node's own
// reporters print a failed snapshot's whole description, twice, which is
// read again with every step after it.
const MOST_LINES = 12;               // of a failure's message (chosen: a diff's first changes)
const MOST_WIDE = 200;               // of a line (chosen)
const AROUND = 60;                   // kept either side of where two long lines first differ (chosen)

// A long line cut to MOST_WIDE, or, for an actual and expected pair, both
// cut to where they first differ
function shorten(line) {
  return line.length > MOST_WIDE ? `${line.slice(0, MOST_WIDE)}…` : line;
}
function aroundTheDifference(actual, expected) {
  let at = 1;                                                   // past the + and -
  while (at < actual.length && actual[at] === expected[at]) at++;
  const from = Math.max(0, at - AROUND);
  const cut = line => `${line.slice(0, 4)}${from > 4 ? '…' : ''}${line.slice(Math.max(4, from), at + AROUND)}…`;
  return [cut(actual), cut(expected)];
}
function briefly(message) {
  const lines = message.split('\n').filter(line => line.trim() && !line.includes('Skipped lines'));
  const out = [];
  for (let i = 0; i < lines.length && out.length < MOST_LINES; i++) {
    const [line, next] = [lines[i], lines[i + 1] ?? ''];
    if (line.trimStart().startsWith('+') && next.trimStart().startsWith('-') && line.length > MOST_WIDE) {
      out.push(...aroundTheDifference(line, next));
      i++;
    } else out.push(shorten(line));
  }
  return out.map(line => `    ${line}`).join('\n');
}

export default async function* quietReporter(source) {
  const counts = { passed: 0, failed: 0, skipped: 0 };
  for await (const { type, data } of source) {
    if (type === 'test:pass' && data.details?.type !== 'suite') counts[data.skip || data.todo ? 'skipped' : 'passed']++;
    if (type === 'test:fail' && data.details?.type !== 'suite') {
      counts.failed++;
      const error = data.details.error?.cause ?? data.details.error;
      yield `✖ ${data.name} (${data.file?.split('/').pop() ?? ''})\n${briefly(String(error?.message ?? error))}\n`;
    }
  }
  yield `${counts.passed} passed, ${counts.failed} failed${counts.skipped ? `, ${counts.skipped} skipped` : ''}\n`;
}
