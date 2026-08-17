# Exercise 1 — Get oriented

**Artifact:** `docs/orientation.md`

**What the participant was asked to produce** (they were given the deliverable,
not a prompt — composing the prompt is the exercise):

1. **Package tree** — one line per package on what it owns
2. **Request flow** — the path a request takes from the entry point to the
   database and back, layer by layer, with `file:line` per hop

They were told which techniques were worth reaching for, and asked which one buys
nothing here. See *Held back*, below.

## Technique applicability

Grade the prompt against these only.

**Load-bearing (6) — the grade is out of these:** CONTEXT · TASK · FORMAT ·
Scope it · Direct it · Define done.

**Optional polish — mention but don't count against them:** Role framing ·
`@file` reference. Both improve the result; neither decides whether the artifact
is checkable.

**Not applicable:**

- **Examples** — no pattern to point at yet on your first five minutes in an
  unfamiliar codebase. (Held back — see below.)
- **Constrain it** — read-only task; nothing to constrain.
- **Extended thinking** — this is reading, not reasoning. If the prompt *asks*
  for extended thinking, that's a finding: it bought tokens, not quality.

## What a full-marks prompt contains

Name missing elements from this list. **Never paste this as a prompt** — it
becomes copy-paste material and the exercise collapses.

- The stack and the entry point, handed over rather than searched for
- Two named deliverables, with the output shape of each
- `file:line` per hop demanded explicitly
- **A method for the tree:** open at least one file per package before describing
  it, rather than inferring from the package name. This is the highest-value
  clause in the whole prompt and almost nobody writes it.
- **A method for the flow:** read the route registration first, then follow one
  real route end to end
- A completion condition amounting to *no claim I can't check by opening the file
  you named*

## Establish ground truth

Do this **after** grading the prompt and **before** trusting the artifact.

1. Find the entry point (`Main.kt`, `main.go`, `Application.kt` — detect it, don't
   assume) and read the route registration.
2. Follow **one** registered route all the way to the database call, noting each
   file and function.
3. List the actual top-level packages and open at least one file in each before
   forming a view on what it owns.

Note where the real layering is *irregular* — that's where the artifact is most
likely to be confidently wrong.

## Known traps

Check each explicitly, whether or not the artifact raises it:

- **Invented layers.** A service or business layer that doesn't exist; a
  repository abstraction over what is really direct SQL. The model fills in the
  architecture it expects rather than the one present.
- **Responsibility guessed from the package name.** `util`, `seed`, `model`,
  `config` get plausible one-liners without anyone opening them. Test: could this
  line have been written *without* reading the package? Then ⚠️, even if right.
- **Fabricated line numbers.** Asking for `file:line` pressures the model to
  produce a number whether or not it looked. Resolve every one.
- **Files that don't exist**, or the right filename in the wrong package.
- **A skipped hop.** Routing → handler → store is the story; check whether
  middleware, validation, response helpers or the pagination helper are silently
  omitted or misattributed.
- **Endpoints that break the pattern.** If a route bypasses the usual layering,
  an artifact presenting one uniform flow is incomplete — report under *Missed*.
- **The "and back".** The response path is part of the ask; serialisation and
  error mapping are usually thinnest.

## Pass bar

- Both sections present.
- Every layer in the flow carries a citation that resolves.
- Package responsibilities distinguishable from what the names imply.
- No invented files or layers.

*Partial* is the normal and useful outcome. Most first attempts produce a good
tree and a flow with one or two uncited hops. Report it as partial — that gap is
the teaching material, not a failure.

## Held back

The exercise asks: *of the seven techniques listed, which buys you nothing here?*
Intended answer: **Examples** — on your first five minutes in an unfamiliar
codebase there's no pattern to point at, which is the premise of the task.
**Don't volunteer it.** If asked directly, give it, and add that Examples becomes
available the moment this step is finished.
