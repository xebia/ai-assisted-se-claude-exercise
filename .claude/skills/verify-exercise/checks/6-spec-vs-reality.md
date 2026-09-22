# Exercise 6 — Spec vs. reality

**Under review: the plan's account of the API, not a prompt.** This is a
Session 6 exception to this skill's usual framing, like sessions 4 and 5.
The participant wrote no prompt of their own: `/speckit-specify` ran a
fixed sentence, and `/speckit-plan` did its own research. What they
produced is a review: two predictions, a list of differences, and a
collision verdict. In Step 0, instead of a prompt, ask for two file names:
`specs/001-*/research.md` and the file under `specs/001-*/contracts/`. Then
ask for their task 4 list of differences and their task 5 collision verdict,
as they wrote them. If a list is missing, that is a finding: say so and
grade what you can from the files.

**Artifact:** `specs/001-*/research.md`, `specs/001-*/contracts/*`,
`specs/001-*/tasks.md`, all in `bookstore-web`.

**What the participant was asked to produce.** A committed `specs/001-*/`
folder with spec, plan, research, data model, contract, quickstart and task
list, and no application code. Plus, on paper: two predictions written
before the first curl, a list of differences between the plan's files and
the running API, and *collision: yes or no* for the `[P]` tasks.

This check is language-agnostic. The backend can be Go, Kotlin, Python or
TypeScript; all four return the same JSON shapes. Never read backend source
to establish ground truth. Call the running API.

## Rubric — replaces the Session 2 technique table

Grade the plan's files against these five. ✅ with what it got right, ❌ with
the predicted consequence in code.

| Check | Passes when… |
| --- | --- |
| **Detail shape** | `research.md` or the contract says `GET /api/books/{id}` returns an envelope with a `book` object and an `author` object, not a bare book |
| **Paging** | the files say pages start at 1, and they say what page 0 does in *this* backend (the participant fixed that in Session 2: page 1 again, or an error) |
| **No inventions** | every endpoint, field and status code in the contract appears in a real response from the running backend |
| **`[P]` collisions** | no two `[P]` tasks from different user stories name the same file |
| **Foundation ownership** | no story task (`[US1]`, `[US2]`, …) writes a shared file: the API client, the stylesheet, `index.html`, the page shell. Constitution principle IV |

State the grade as *N of 5 checks sound*. Then grade the participant's own
review: did their task 4 list contain every ❌ you found? Say which they
found and which they missed, in one line each.

## Establish ground truth

Run these yourself, from `bookstore-web`, with the backend on port 8080. Do
not take the participant's notes or the plan's files on trust.

1. `curl -s "http://localhost:8080/api/books?page=1&size=3"` — note the
   shape of the list (bare array or wrapper), the field names, and the page
   size.
2. `curl -s "http://localhost:8080/api/books?page=0&size=3"` — note what
   page 0 does: the same as page 1, or an error body. Both are correct for
   this course; what matters is whether the plan's files say the same.
3. `curl -s "http://localhost:8080/api/books/1"` — note the envelope:
   `{"book": {...}, "author": {...}}`.
4. `curl -s -i "http://localhost:8080/api/books/999999"` — note the status
   code and the error body shape.
5. For every other endpoint the contract names, call it once. An endpoint
   that returns 404 or a connection error is an invention.
6. Open `tasks.md`. List every `[P]` task with its file path and story tag.
   Sort by file path; any path with two stories is a collision. Then list
   every story task that names `src/api.js`, `styles.css`, `index.html` or
   `src/main.js` (or the plan's names for the client, stylesheet, shell and
   entry point).

If the backend is not running, say so and stop. Do not grade from memory.

## Known traps

- **Bare book on the detail endpoint.** The most likely defect. Every REST
  API the model has read returns the resource itself, so the contract says
  `GET /api/books/{id}` returns a book. The real backend returns a wrapper.
  In Exercise 7 the detail page will render `undefined` for every field.
  Map it to Detail shape.
- **Pages start at 0.** The contract or a user story says page 0 is the
  first page. In Exercise 7 the list page sends `page=0`, and the backend
  either shows page 1 twice or returns an error the UI shows. Map it to
  Paging.
- **Invented search or sort parameters.** A `?q=` or `?sort=` that no
  backend implements. The frontend will send it and get the unfiltered
  list back, silently. Map it to No inventions.
- **Invented status codes.** A contract that promises `422` for a bad id
  when the backend sends `400`, or `204` where it sends `200`. Map it to No
  inventions.
- **Shared file inside a story.** A `[P]` task under `[US2]` that "adds a
  helper to `src/api.js`". Two agents edit `api.js` at the same time and
  one loses its work without an error. Map it to Foundation ownership.
- **Two stories, one file.** A route table or a page shell that both story
  phases edit. Same consequence. Map it to `[P]` collisions.
- **Participant list matches the files, not the API.** Their differences
  list repeats the plan's claims as facts. Say plainly: the list was
  written from the files, not from the curl output.

## Pass bar

- Detail shape and Paging both ✅, or both ❌ and both on the participant's
  own list of differences.
- No inventions ✅, or every invention on the participant's list.
- `[P]` collisions and Foundation ownership both ✅, or the participant's
  verdict says *collision: yes* with the right file.
- Partial is the normal first-attempt outcome. Most plans get the detail
  shape wrong. Name the check that failed; do not round up.

The learning goal is the habit, not a clean plan: a plan that is wrong in
two places, found by the participant before anyone wrote code, is a full
pass of the habit. Say that in one line when it applies.

## Held back

Until the participant has given you their task 4 list, do not say what
`GET /api/books/1` returns or which number the first page has. Ask for
their list first. If they have no list and no predictions, ask them to run
the three curl commands from task 4 now and tell you what they see, before
you show your own ground truth.
