# Exercise 7 — Agent team built the frontend

**Artifact:** the `web` working tree after the team finished, plus
`specs/001-*/tasks.md`. The commit tagged `foundation` marks where the
team's work started.

**What the participant was asked to produce.** A team prompt: the lead
reads `tasks.md` and spawns one builder per user story plus a `reviewer`
that writes no code. Each builder owns its story's file, and the
foundation stays untouched. When a builder's Independent Test passes, it
sends its file list to the reviewer. The reviewer sends its findings back
to that builder, and a story is done only after the reviewer approves it.
The lead waits and reports.

**Under review: the team prompt.** Ask for it verbatim. The code is
evidence about that prompt.

## Rubric — replaces the Session 2/3 technique tables

Grade the prompt against these five. ✅ with what it gave them, ❌ with the
predicted defect.

| Check | Present when the prompt… |
| --- | --- |
| **Source of work** | names `tasks.md` and that story tags decide who does what |
| **Team, not subagents** | says agent team / teammates: one named builder per story, and a `reviewer` that writes no code |
| **File ownership** | names the foundation files as finished; each builder edits only its story's file |
| **Closed review loop** | builder sends its files to the reviewer, the reviewer sends findings back to that builder by name, and a story is done only when its Independent Test passes and the reviewer approves it |
| **Lead waits** | the lead does not implement stories, does not fix findings, and waits for all teammates |

## Establish ground truth

Run these yourself. Do not take the participant's notes on trust.

0. Take the file lists from the participant's own `tasks.md`, not from
   the reference spec. Foundation files are the files Phase 1 and 2
   create. Story files are the files each story phase writes. Task 1 had
   the lead move shared work into Phase 2, so layouts differ: `src/views/`
   or other names are fine. The reference spec's list (`index.html`,
   `styles.css`, `src/main.js`, `src/api.js`, `src/ui.js`, one file per
   story under `src/pages/`) applies only when they used that spec.
1. `git diff --stat foundation` (from `web`). List every changed
   file. Sort each into: story file (and which story), foundation file,
   or other.
2. `git log --format=%s foundation..HEAD` — did teammates commit? Not
   required, but a commit by the lead touching a story file is the "lead
   waits" defect.
3. Open `specs/001-*/tasks.md`. Count story tasks ticked vs total.
4. `grep -rn "8080\|localhost" src/ index.html` — must print nothing
   (constitution II).
5. Read the story files and the API client, and trace what each page renders
   for: empty array, 404, non-JSON, fetch failure (constitution V). Every
   one of the four must render a fixed sentence, not backend text. Do not
   fetch the pages with curl: the dev server returns the empty shell, the
   pages are rendered by JavaScript in the browser. Say "read the page
   modules" in the report, never "fetched the page".
6. Read the story files for `import` lines. Any import from
   `node_modules` or a CDN is a constitution I violation.

7. Ask the participant what the reviewer sent back to a builder, and
   what they found in the browser that the reviewer did not (task 4,
   step 2). Their answer is the only evidence of the loop: you cannot
   read the teammates' transcripts. Compare it with steps 1, 4 and 5. A
   defect that is still in the code after the reviewer approved the story
   means the reviewer missed it, or its finding never reached the builder.

## Known traps

- **Foundation edited.** The most likely defect. A teammate wanted a helper
  and put it in `api.js` or `ui.js`. Name the file and the teammate if the
  diff or a commit shows it. Map it to the File ownership check.
- **Lead built a story.** The lead's transcript or a commit shows story
  code written by the lead. Map it to Lead waits.
- **Finding went to the lead.** The reviewer reported to the lead, and the
  lead fixed it, or nobody did. Map it to Closed review loop. With
  subagents this is the default route for a finding; in a team it is a
  prompt gap.
- **Approved but broken.** The reviewer approved a story that still leaks
  backend text or changed a foundation file. Say which check the reviewer
  was told to run and whether the prompt named it. The browser problems
  from task 4 are expected misses: the reviewer reads code, it does not
  open the browser.
- **Ticked but not tested.** Tasks ticked, but the browser shows "Not built
  yet" or a console error for one story. Map it to Closed review loop: the
  done condition did not require the Independent Test.
- **Backend error text on screen.** `#/books/abc` shows "invalid id", or
  the list shows "db error". Constitution V. Usually the page module reads
  `outcome.error` that the client was supposed to drop — check whether the
  foundation client leaks it or the story re-fetches on its own.
- **Page 0.** A page module that starts counting at 0 sends `page=0`. What
  happens next depends on the participant's Session 2 fix: the API treats
  it as page 1, so Next shows page 1 twice, or it returns an error the UI
  shows. Both are a spec defect from Exercise 6 that became code. Mention
  it as a finding either way — it is the point of the closing-round question about marked guesses.
- **Subagents, not a team.** The participant reports no panel rows with
  the teammate names from the prompt. Not a code defect, but a prompt one:
  map it to Team, not subagents. An empty Ctrl+T task list is not evidence
  either way: on current models the session has no Task tools, so that list
  stays empty for a real team too.

## Pass bar

- No foundation file in `git diff --stat foundation`
- Every story task ticked, and both stories render in the browser
- The participant can name one finding the reviewer sent to a builder
- Grep clean; all four error paths render a fixed sentence
- Partial is a normal first-attempt outcome. Name which story or which
  boundary failed; do not round up.

## Held back

None for the verifier. The held-back fact for this session lives in the
`/parallel-coach` card for task 2 (nothing enforces file ownership except
the prompt). By the time the verifier runs, the run has already taught it —
say it plainly if the evidence shows it. Add the second half: the reviewer
is the check behind the prompt, and it catches only what it was told to
check.
