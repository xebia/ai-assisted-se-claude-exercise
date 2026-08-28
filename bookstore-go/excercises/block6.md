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

Open [`bookstore-web/constitution.md`](../../bookstore-web/constitution.md).
It is pre-written — you are not authoring one today.

Read it and note **two things it forbids**. Spec Kit loads this before every
command, so you will see these constraints again in the artifacts you generate.

Pay attention to principle II: you have your backend's source on `--add-dir`,
but you may only use it to *discover the HTTP contract*. Reading the source to
learn what `GET /api/books` returns is research. Encoding anything about how it
is implemented is a violation.

### 2. `/speckit.specify` — capture intent (5 min)

Use this prompt **exactly as written**:

> A web UI for the BookStore API. Users can browse books, open a book to see its
> author and its reviews, add a review to a book, and browse authors. The API is
> already running behind `/api`.

Then open the generated `specs/001-*/spec.md` and read it.

It is thin, and deliberately so. Note what the prompt never said: how many books
per page, what an empty list looks like, what happens when a request fails, what
a book page actually displays.

### 3. `/speckit.clarify` — interrogate the spec (7 min)

**This is the core of the exercise.** Spec Kit asks up to five targeted
questions about what you left underspecified, and writes your answers back into
the spec.

Answer **quickly — do not deliberate**. The point is to experience the
interrogation, not to design the perfect UI. Re-running it is cheap.

Two questions you should be ready for, because the answers are not obvious:

- **Which page does the list start on?** Compare these two:

  ```bash
  curl 'http://localhost:5173/api/books?page=0&size=3'
  curl 'http://localhost:5173/api/books?page=1&size=3'
  ```

  They return **the same three books**. Pages are 1-based, and page 0 silently
  aliases page 1 — so a UI that counts from zero shows the first page twice and
  can never reach the last one. Your spec has to say where paging starts.

- **What does a bad book id return?** Not what you would guess:

  ```bash
  curl -i http://localhost:5173/api/books/99999   # 404 — missing, as expected
  curl -i http://localhost:5173/api/books/abc     # 500 — malformed, not 400
  ```

  A requirement saying "show not-found when the API returns 404" is wrong about
  this API: a malformed id arrives as a *server* error. Check, do not assume.

Diff `spec.md` afterwards and see where your answers landed.

### 4. `/speckit.plan` — decide how (5 min)

Runs unattended. While it works, watch what it writes — it produces **five**
files, not one:

```
specs/001-*/plan.md          the approach
           research.md       what it learned about the API
           data-model.md     the entities
           contracts/        the API contract it extracted
           quickstart.md     how to verify
```

When it finishes, skim `research.md` and `contracts/`. **Is the contract it
extracted actually correct?** It had your backend's source available — check
whether it wrote down the real behaviour or the behaviour it expected.

### 5. `/speckit.tasks` — break it down (5 min)

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

### 6. `/speckit.analyze` — validate (4 min)

A read-only consistency check across `spec.md`, `plan.md` and `tasks.md`. It
writes no files.

Read the report and pick **one finding you agree with** and **one you do not**.
Be ready to say why.

### 7. Commit

```bash
git add specs/ && git commit -m "spec: bookstore-web frontend"
```

Exercise 7 starts from this.

---

## Pair Discussion (2 min)

- Which `/speckit.clarify` question did you not see coming?
- Did `/speckit.plan` get the API contract right, or did it write down what it
  assumed?
- Could four agents genuinely take four user stories from your `tasks.md` right
  now? If not, what is in the way?

---

## What you should have

```
bookstore-web/specs/001-*/
  spec.md          intent, clarified
  plan.md          approach
  research.md      what it learned
  data-model.md    entities
  contracts/       API contract
  quickstart.md    verification
  tasks.md         the work queue, with [P] markers
```

No application code. That is the point — `/speckit.implement` is Exercise 7.
