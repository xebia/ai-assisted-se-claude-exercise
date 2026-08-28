# Exercise 6: Spec-Driven Development with Spec Kit

**Block**: 6 — Real Development Workflows **Duration**: 30 minutes
**Project**: `bookstore-web` — a new frontend for the BookStore API you already
know.

**Goal**: Run a real spec-driven flow end to end and produce every artifact up
to a task breakdown. You will **not** write any application code. Exercise 7
implements what you specify here, with a team of agents working in parallel.

---

## Why a frontend

The BookStore API has no UI. That makes it genuinely unspecified: the HTTP
contract is discoverable, but nothing tells you what happens on an empty list,
what a failed request looks like, or which fields a book page shows. Those are
decisions, and decisions are what a specification is for.

It also breaks into pieces that different agents can build at the same time —
which is the property Exercise 7 depends on.

## Before you start

Setup is in `preparation.md`. Verify it in one command:

```bash
cd ../bookstore-web && specify check
```

Then get both halves running.

**Terminal 1 — your backend**, from the `bookstore-go` project directory
(any of the four backends works; the frontend is agnostic):

```bash
go run .
```

**Terminal 2 — the frontend dev server:**

```bash
cd ../bookstore-web && npm run dev
```

Confirm the proxy works — this must return JSON, not a connection error:

```bash
curl http://localhost:5173/api/books
```

**Terminal 3 — Claude Code, started from `bookstore-web` with your backend
readable:**

```bash
cd ../bookstore-web && claude --add-dir ../bookstore-go
```

---

## Tasks

### 1. Read the constitution (2 min)

Open [`.specify/memory/constitution.md`](../../bookstore-web/.specify/memory/constitution.md)
in `bookstore-web`. It is pre-written — you are not authoring one today, and it
is already where Spec Kit looks for it.

Read it and note **two things it forbids**.

Where those constraints show up is worth knowing: `/speckit.plan` gates its
output against this file and `/speckit.analyze` audits every artifact against
it. `/speckit.specify` does **not** read it — so don't go hunting for the
constitution's fingerprints in `spec.md` in the next task. It bites from task 5
onward.

**Principle II is the one that will bite you.** There are four interchangeable
implementations of this API. That is what the principle protects: a requirement
that is only true of the one you happen to be running is a defect, not a detail.

The rule is not "don't read the source". It is *what you take from it*:

- The source is good for finding out **what to ask** — which routes exist, which
  query parameters are read, which fields come back.
- The source is not where you learn **what happens**. Only a response tells you
  that. A requirement saying "returns X" that nobody ever saw return X is a
  guess wearing a citation.
- Anything below the HTTP boundary — tables, columns, SQL, file layout,
  framework behaviour — cannot appear in a requirement, however true it is. If
  you have a way to query the database directly, that is not research for this
  spec; it is the shortest route to a violation.

The test for every requirement you write: **would this still hold if the backend
were swapped for one of the other three tomorrow?** If not, it belongs in your
research notes, not in the spec.

### 2. `/speckit.specify` — capture intent (4 min)

Use this prompt **exactly as written**:

> A web UI for the BookStore API. Users can browse books, open a book to see its
> author and its reviews, add a review to a book, and browse authors. The API is
> already running behind `/api`.

It writes `specs/001-*/spec.md`. Don't read it yet — the next task starts by
handing it to someone else.

The prompt was deliberately thin, and the spec inherits that. Nothing in it was
informed by the API it is a UI for, because nothing has looked at the API yet.

### 3. Research what the spec can't answer (4 min)

The next task interrogates you about an API you have never called. Answering it
from memory is how a spec ends up describing a REST API that does not exist.

You are not going to do this by hand. **Delegate it to a subagent** and give it
a brief of your own writing. What the brief has to get across:

- The subagent's input is the `spec.md` you just generated. Its job is to find
  every statement in there that cannot be settled without calling the live API —
  and then settle it, by calling it.
- **Evidence per finding**, not description: the request it made, the status it
  got back, the body it got back. A finding without a response attached is an
  opinion.
- Verify, do not infer. Principle II from task 1 applies to your researcher too.
- Output is a file, written next to the spec: `api-research.md`, in the same
  `specs/001-*/` directory. Findings that live only in a transcript are gone by
  the next task.

**While it works, don't watch it type.** Read `spec.md` yourself and write down
the gaps *you* would have asked about.

Then, when it comes back — and this is the part that matters — **do not trust
it**. Compare its gaps against yours, then pick two of its findings and check
them against the running API yourself. A researcher reporting on a REST API will
happily write down the API it has read a thousand times instead of the one
running on `:8080`, and the only thing standing between that and your spec is
you.

### 4. `/speckit.clarify` — interrogate the spec (5 min)

**This is the core of the exercise.** Spec Kit asks up to five targeted
questions about what you left underspecified, and writes your answers back into
the spec.

Answer **quickly — do not deliberate**, and answer from `api-research.md`. You
can afford the speed because you did the research; that is the whole point of
having done it.

Two rules for the answers:

- Where the research covers the question, answer with what was observed — not
  with what a REST API conventionally does.
- Where the research does not cover it, answer anyway and **mark that you
  guessed**. Research is never complete. An honest guess that is labelled is a
  defect someone can find later; an unlabelled one is a landmine.

Diff `spec.md` afterwards and see where your answers landed. If you and your
neighbour turn the same prompt into two different specs, that is the correct
outcome — and the reason the artifact gets committed.

### 5. `/speckit.plan` — decide how (5 min)

Runs unattended. While it works, watch what it writes — it produces **five**
files, not one:

```
specs/001-*/plan.md          the approach
           research.md       what it learned about the API
           data-model.md     the entities
           contracts/        the API contract it extracted
           quickstart.md     how to verify
```

Note the second file. `/speckit.plan` just did its own research, and it landed
in the same directory as yours. **Two researchers, one API: diff them.**

Where they disagree, one of them is wrong, and you have the evidence to say
which. Look at the paging convention, the status codes and the error bodies
first; those are where a plan describes a conventional REST API instead of this
one. Then check `contracts/` for anything asserted that neither researcher ever
actually observed.

### 6. `/speckit.tasks` — break it down (4 min)

Open `specs/001-*/tasks.md`. This is the artifact Exercise 7 consumes, so read
it properly.

The task format is `[ID] [P?] [Story]`:

- `[P]` — can run in parallel: different files, no dependencies
- `[US1]`, `[US2]` — which user story the task belongs to

Find the **Parallel Opportunities** and **Parallel Team Strategy** sections at
the bottom. That is a staffing plan for agents.

Now check one thing: pick two `[P]` tasks from **different** user stories. Do
they write the same file? Shared things — the API client, the stylesheet,
`index.html` — belong to the foundational phase (constitution principle IV). If
one lives inside a story, the `[P]` is a lie and two agents will collide.

### 7. `/speckit.analyze` — validate (3 min)

A read-only consistency check across `spec.md`, `plan.md` and `tasks.md`. It
writes no files.

Read the report and pick **one finding you agree with** and **one you do not**.
Be ready to say why. The answers you marked as guesses in task 4 are a good
place to start looking.

### 8. Commit

```bash
git add specs/ && git commit -m "spec: bookstore-web frontend"
```

That is nine files plus your research note. Exercise 7 starts from this, and a
spec is worth less without the evidence its requirements rest on.

---

## Pair Discussion (2 min)

- Which `/speckit.clarify` question did you not see coming?
- Did either researcher get anything wrong — your subagent, or `/speckit.plan`?
  How would you have found out if you had not checked by hand?
- You started from the same prompt against the same API. Where do your two specs
  differ, and which of those differences would ever have surfaced if neither of
  you had written one?
- Could four agents genuinely take four user stories from your `tasks.md` right
  now? If not, what is in the way?

---

## What you should have

```
bookstore-web/specs/001-*/
  api-research.md    what the API actually does, with evidence — yours
  spec.md            intent, clarified
  plan.md            approach
  research.md        what the plan learned
  data-model.md      entities
  contracts/         API contract
  quickstart.md      verification
  tasks.md           the work queue, with [P] markers
```

No application code. That is the point — `/speckit.implement` is Exercise 7.
