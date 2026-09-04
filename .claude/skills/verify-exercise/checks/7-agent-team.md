# Exercise 7 — Agent team built the spec

**Artifact:** the `bookstore-web` working tree after the team finished, plus
`specs/001-*/tasks.md`. The commit tagged `foundation` marks where the
team's work started.

**What the participant was asked to produce.** A team prompt: the lead
reads `tasks.md`, spawns one teammate per user story, each teammate owns
its story's file, the foundation stays untouched, each story is done when
its Independent Test passes. The lead waits and reports.

**Under review: the team prompt.** Ask for it verbatim. The code is
evidence about that prompt.

## Rubric — replaces the Session 2/3 technique tables

Grade the prompt against these five. ✅ with what it gave them, ❌ with the
predicted defect.

| Check | Present when the prompt… |
| --- | --- |
| **Source of work** | names `tasks.md` and that story tags decide who does what |
| **Team, not subagents** | says agent team / teammates, one per story, named |
| **File ownership** | names the foundation files as finished; each teammate edits only its story's file |
| **Done per teammate** | the story's Independent Test passes, tasks ticked |
| **Lead waits** | the lead does not implement stories and waits for all teammates |

## Establish ground truth

Run these yourself. Do not take the participant's notes on trust.

1. `git diff --stat foundation` (from `bookstore-web`). List every changed
   file. Sort each into: story file (under `src/pages/`), foundation file
   (`index.html`, `styles.css`, `src/main.js`, `src/api.js`, `src/ui.js`),
   or other.
2. `git log --format=%s foundation..HEAD` — did teammates commit? Not
   required, but a commit by the lead touching a story file is the "lead
   waits" defect.
3. Open `specs/001-*/tasks.md`. Count story tasks ticked vs total.
4. `grep -rn "8080\|localhost" src/ index.html` — must print nothing
   (constitution II).
5. With a backend on :8080 and `npm run dev` running, fetch the pages the
   quickstart names, or read the page modules and trace what they render
   for: empty array, 404, non-JSON, fetch failure (constitution V). Every
   one of the four must render a fixed sentence, not backend text.
6. Read `src/pages/*.js` for `import` lines. Any import from
   `node_modules` or a CDN is a constitution I violation.

## Known traps

- **Foundation edited.** The most likely defect. A teammate wanted a helper
  and put it in `api.js` or `ui.js`. Name the file and the teammate if the
  diff or a commit shows it. Map it to the File ownership check.
- **Lead built a story.** The lead's transcript or a commit shows story
  code written by the lead. Map it to Lead waits.
- **Ticked but not tested.** Tasks ticked, but the browser shows "Not built
  yet" or a console error for one story. Map it to Done per teammate.
- **Backend error text on screen.** `#/books/abc` shows "invalid id", or
  the list shows "db error". Constitution V. Usually the page module reads
  `outcome.error` that the client was supposed to drop — check whether the
  foundation client leaks it or the story re-fetches on its own.
- **Page 0.** A page module that starts counting at 0 sends `page=0`. What
  happens next depends on the participant's Session 2 fix: the API treats
  it as page 1, so Next shows page 1 twice, or it returns an error the UI
  shows. Both are a spec defect from Exercise 6 that became code. Mention
  it as a finding either way — it is the point of the closing-round question about marked guesses.
- **Subagents, not a team.** The participant reports no agent panel. Not a
  code defect, but a prompt one: map it to Team, not subagents.

## Pass bar

- No foundation file in `git diff --stat foundation`
- Every story task ticked, and both stories render in the browser
- Grep clean; all four error paths render a fixed sentence
- Partial is a normal first-attempt outcome. Name which story or which
  boundary failed; do not round up.

## Held back

None for the verifier. The held-back fact for this session lives in the
`/parallel-coach` card for task 2 (nothing enforces file ownership except
the prompt). By the time the verifier runs, the run has already taught it —
say it plainly if the evidence shows it.
