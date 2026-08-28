# BookStore Web Constitution

The non-negotiable principles for the BookStore frontend. Spec Kit loads this
before every `/speckit.*` command; it constrains the specification, the plan and
the generated tasks.

This file is **pre-written for the training**. You are not asked to author it —
you are asked to read it, and then to notice where it shows up in the artifacts
you generate.

## Core Principles

### I. Vanilla Only

Plain HTML, CSS and JavaScript. No UI framework, no component library, no state
management library, no runtime dependencies of any kind. Application code has no
build step and no bundler features: no JSX, no TypeScript, no `import` from
`node_modules`. ES modules between your own files are fine.

Vite is a dev server and reverse proxy. Nothing more. The app must still make
sense if Vite disappears.

*Why:* the BookStore backend hand-rolls its own JSON encoder, router and SQL
mapping. The frontend keeps the same ethos — and dependency-free code stays
reviewable when an agent team generates it.

### II. Contract, Not Implementation

The frontend must run unchanged against **all four** backend implementations —
`bookstore-go`, `bookstore-kt`, `bookstore-py` and `bookstore-ts`.

Depend only on the HTTP contract: paths, methods, status codes, and JSON shapes.
Never depend on a backend's internals, source layout, database schema or SQL.

You may read a backend's source to *discover* the contract. You may not encode
anything you find there beyond the contract itself.

### III. Independently Demoable Stories

Every user story must be completable and demonstrable in a browser on its own,
without any other story being finished.

If a story cannot be demoed alone, it is not a story — it is a fragment, and it
belongs merged into another one or pushed into the foundational phase.

*Why:* this is what allows separate agents to build separate stories at the same
time.

### IV. Shared Code Is Foundational

Anything more than one story needs — the API client, the layout shell, the
stylesheet, shared error rendering — belongs to the foundational phase and must
be finished before story work starts.

No user story may create or modify a file another user story also creates or
modifies. A task marked `[P]` that violates this is wrong, no matter what the
generated plan says.

### V. Every Error Path Is Specified (NON-NEGOTIABLE)

Every API call has a specified behaviour for: success, empty result, not found,
client error, server error, and network failure.

Raw upstream error text is never rendered to a user. The BookStore API is known
to leak internal database messages in at least one endpoint; the UI must not
pass those through.

"The API returns a 404 there" is not an assumption you may make. Check what it
actually returns.

### VI. Verifiable Acceptance Criteria

Every user story states how you would confirm it works — concrete, observable
steps against a running backend, not "it looks right".

Automated tests are not written in the specification phase. Acceptance criteria
are what a later implementation phase turns into tests, so they must be precise
enough to be mechanically checkable.

## Technology Constraints

- Runtime dependencies: **none**.
- Dev dependencies: **Vite only**.
- The API is reached at the same-origin path `/api`, proxied to
  `http://localhost:8080`. Never hardcode a host, port or scheme.
- Target: current evergreen browsers. No transpilation, no polyfills.

## Development Workflow

- Specification precedes implementation. No production code is written before
  `spec.md`, `plan.md` and `tasks.md` exist and have been read by a human.
- Ambiguity is resolved in the specification, not in code. If an
  implementer has to guess, the spec has a defect — fix the spec.
- Any principle here may be overridden only by amending this file, never by an
  exception buried in a plan or a task.

## Governance

This constitution supersedes conventions inherited from any other BookStore
project. Plans and tasks that conflict with it are defects in the plan, not
grounds for an exception.

`/speckit.analyze` checks generated artifacts against these principles. Treat
what it reports as findings to act on, not as advice to weigh.

**Version**: 1.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
