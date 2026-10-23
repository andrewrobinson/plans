// The browser tests' reporter (playwright.config.js): nothing for a test
// that passes, each failure in a few short lines (where it is and what was
// expected, without the call log), then the totals. Playwright's own
// reporters print the call log, a line each time an expect tries again,
// and every line printed is read again with each step after it. The html
// report (npm run report) still has the whole of it.
const MOST_LINES = 8;                // of a failure's message (chosen)
const MOST_WIDE = 200;               // of a line (chosen)
const ANSI = /\u001b\[[0-9;]*m/g;    // terminal colours

function briefly(message) {
  const lines = message.replace(ANSI, '').split('\n');
  const callLog = lines.findIndex(line => line.trim() === 'Call log:');
  return lines.slice(0, callLog < 0 ? lines.length : callLog)
    .filter(line => line.trim())
    .slice(0, MOST_LINES)
    .map(line => `    ${line.length > MOST_WIDE ? `${line.slice(0, MOST_WIDE)}…` : line}`)
    .join('\n');
}

class QuietReporter {
  onBegin(config, suite) { this.suite = suite; }
  printsToStdio() { return true; }

  onTestEnd(test, result) {
    if (result.status === test.expectedStatus) return;
    const { file, line } = test.location;
    const where = `${file.split('/tests/').pop()}:${line}`;
    const error = result.error?.message ?? result.status;
    const [project, , ...titles] = test.titlePath().filter(Boolean);       // the device, the file, then its describes and title
    console.log(`✖ [${project}] ${titles.join(' › ')} (${where})\n${briefly(error)}`);
  }

  onEnd(result) {
    const counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
    for (const test of this.suite.allTests()) counts[test.outcome()]++;
    const extra = [counts.flaky && `${counts.flaky} flaky`, counts.skipped && `${counts.skipped} skipped`].filter(Boolean);
    console.log(`${counts.expected} passed, ${counts.unexpected} failed${extra.length ? `, ${extra.join(', ')}` : ''} (${Math.round(result.duration / 1000)} s)`);
  }
}

module.exports = QuietReporter;
