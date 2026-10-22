# Testing: what was decided (15 to 21 Oct 2026)

Trimmed 22 Oct 2026; the findings and the 15 Oct session's runs are in git
(`git show 05f88b7:testing_questions.md`).

Decided 21 Oct 2026:

1. The page is sometimes used on the phone, so both projects (desktop
   Chrome and iPhone) stay.
2. Everyday and targeted runs use desktop Chrome.
3. The controls tests run once, in WebKit at phone size (the faster at
   drawing); see `playwright.config.js`.
5. How often: while working, only the tests a change affects (`-g`);
   before a commit, at most one quick run; at "deploy to main", one full
   run; never the whole suite just to read failures.

Still open:

4. **The desktop screenshots' size.** They're 1280 × 800. If the page is
   mostly used in a bigger window, they could match it (Chrome's console:
   `innerWidth + ' x ' + innerHeight`).
