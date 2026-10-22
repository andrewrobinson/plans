# Sharing and talking it through: notes for later

Set aside 22 Oct 2026 as too big to take on now; the UI comes first. Nothing
here is built or decided.

## What's wanted

Hand the page to a designer, who can use it to try options and show them
to me. I can show the designer my ideas the same way.

## How it works now, and where it falls short

- **Named configurations** are in the code (`living_room.configurations.js`,
  14 of them). Only someone editing the code can add one: Claude, from
  `plans.export()` in the console.
- **Save** (Configs ▾) keeps a configuration in one browser's localStorage
  (`kit/configuration_kit.js`). The designer's saves never reach me, and
  mine never reach them.
- **Share** copies the published address with the whole configuration
  and view in the hash (`shareButton()`, `kit/floor_kit.js`). The link
  works, but it has no name and no note to say what the idea is. Opening
  it shows *Yours (not saved)*, and nothing offers to keep it.

## Ways it could go (none chosen)

1. **Named links.** Share asks for a name and a short note and puts them
   in the link. Opening a link shows the note, with **Add to my list**.
   This needs no server or accounts and works on GitHub Pages as it is.
   The smallest step.
2. **A set in one link.** Options A, B and C, each with a name and note,
   stepped through with Previous and Next: for presenting. Builds on 1.
3. **A shared online board.** One list both of us see live, and either can
   add to. It needs a hosted store (a free database), plus a password or
   sign-in, and something to look after.
4. **Files.** Download an option as a small `.json`, send it, open it on
   the other side. Reliable but clunky; useful as a backup to 1.
5. **Into the built-in list.** A shared link sent to Claude becomes a named
   configuration in the code, for everyone. This works today, by hand.

## Questions to settle first

- Does the designer only adjust what's modelled, or do they need to add
  pieces of their own (simple named boxes, say)?
- Is a link, sent by message or email, enough, or do we want one place
  where the options gather?
- Should someone opening a shared link see a simpler page (viewing, not
  editing)? This ties in with the UI work.
