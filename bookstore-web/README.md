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

All four expose the same HTTP contract, so one specification covers all of them.
`vite.config.js` proxies `/api` to `http://localhost:8080`, which is what keeps
the browser on a single origin — no CORS, and no change to any backend.

## Running it

Two terminals.

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
- Delete returns `{status: "deleted"}`; failures return `{error: "..."}`

> [!IMPORTANT]
> Do not take this table as the specification. The BookStore API contains
> **deliberate bugs** — some endpoints do not behave the way this summary
> suggests. Discovering the real behaviour is part of Exercise 6. Check what the
> API actually returns before you write a requirement about it.

## Files

| File | What it is |
|---|---|
| `constitution.md` | Pre-written project principles. Read this first. Copied into `.specify/memory/` during setup. |
| `vite.config.js` | Dev server and `/api` proxy. Not application code. |
| `index.html` | Deliberately empty shell. |
| `specs/` | Created by Spec Kit in Exercise 6. **Commit this** — Exercise 7 needs it. |
| `.specify/` | Spec Kit tooling. Generated during setup, not committed. |

## Setup

See the `preparation.md` in your chosen backend project. In short:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
npm install
specify init --here --force --non-interactive --integration claude
cp constitution.md .specify/memory/constitution.md   # must run AFTER init
specify check
```

The `cp` comes after `init` deliberately: `specify init --force` writes into a
non-empty directory and would otherwise overwrite the constitution with its own
template.
