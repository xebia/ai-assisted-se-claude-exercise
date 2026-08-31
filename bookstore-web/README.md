# BookStore Web

The frontend for the BookStore API — **and, for now, an empty project on
purpose.**

There is no application code here. What this frontend does is decided by the
specification you produce in **Exercise 6** using
[Spec Kit](https://github.com/github/spec-kit), and built by the parallel agent
team in **Exercise 7**.

## Backend-agnostic by design

This project talks to whichever BookStore backend you started on port `8080`:

| Backend | Start it with |
|---|---|
| [bookstore-go](../bookstore-go/) | `go run .` |
| [bookstore-kt](../bookstore-kt/) | `./gradlew run` |
| [bookstore-py](../bookstore-py/) | `python3 main.py` |
| [bookstore-ts](../bookstore-ts/) | `bun run start` |

All four ship the same paths, methods and JSON shapes, so one specification
covers all of them — but write that specification against the backend you can
actually `curl`, not against this README. See the warning under
[The API](#the-api).

`vite.config.js` proxies `/api` to `http://localhost:8080`, which is what keeps
the browser on a single origin — no CORS, and no change to any backend.

## Running it

Two terminals — but only from **Exercise 7** onward. Exercise 6 specifies this
frontend without running it, and needs the backend alone.

**Terminal 1 — a backend:**

```bash
cd ../bookstore-kt && ./gradlew run
```

**Terminal 2 — this frontend:**

```bash
npm run dev
```

Opens http://localhost:5173. Requests to `/api/*` reach the backend on `:8080`.

Verify the proxy before you start an exercise:

```bash
curl http://localhost:5173/api/books
```

JSON means you are ready. A connection error means no backend is running.

## The API

Eight endpoints, identical across all four backends:

```
GET    /api/books                 list books (paginated: ?page=&size=)
GET    /api/books/{id}            one book, with its author
POST   /api/books                 create a book
DELETE /api/books/{id}            delete a book
GET    /api/books/{id}/reviews    reviews for a book
POST   /api/books/{id}/reviews    add a review
GET    /api/authors               list authors
GET    /api/authors/{id}          one author, with their books
```

Shapes are not uniform, which matters when you write the spec:

- **List endpoints return a bare JSON array** — `[ {...}, {...} ]`
- **Detail endpoints return an envelope** — `{book, author}` and `{author, books}`
- Failures return `{error: "..."}`

> [!IMPORTANT]
> **This is a sketch, not the specification** — least of all for status codes,
> paging behaviour and error bodies. The BookStore API ships with deliberate
> bugs, several endpoints do not behave the way a reasonable reader would
> expect, and the backend in front of you has been worked on since it was
> cloned. Your copy and your neighbour's may no longer agree.
>
> Finding out what your running backend actually does is part of the exercise —
> and the exercise has you delegate that research rather than do it by hand.
> Nothing here is a substitute for a response you have actually seen.

## Files

| File | What it is |
|---|---|
| `.specify/memory/constitution.md` | Pre-written project principles. **Read this first.** The one file under `.specify/` that is committed — Spec Kit reads it from here. |
| `vite.config.js` | Dev server and `/api` proxy. Not application code. |
| `index.html` | Deliberately empty shell. |
| `specs/` | Created by Spec Kit in Exercise 6. **Commit this** — Exercise 7 needs it. |
| `.specify/` (the rest) | Spec Kit tooling. Generated during setup, not committed. |

## Setup

See the `preparation.md` in your chosen backend project. In short:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
npm install
specify init --here --force --non-interactive --integration claude
git checkout -- .specify/memory/constitution.md      # must run AFTER init
specify check
```

The `git checkout` comes after `init` deliberately. The constitution is
committed at Spec Kit's own path, `.specify/memory/constitution.md`, and
`specify init --force` overwrites it with its own template — so the last step
puts the real one back. Everything else under `.specify/` is generated and
ignored.
