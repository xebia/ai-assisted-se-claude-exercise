# Implementation Plan: Browse Books

**Branch**: `001-browse-books` | **Date**: 2026-09-01 | **Spec**: spec.md
**Input**: Feature specification from `specs/001-browse-books/spec.md`

## Summary

Two pages, hash-routed, in plain HTML/CSS/JS: a paginated book list and a
book detail page with author. One small API client wraps `fetch`, maps
status codes to typed outcomes, and hides backend error text. Nothing else.

## Technical Context

**Language/Version**: JavaScript, ES modules, evergreen browsers
**Primary Dependencies**: none at runtime; Vite as dev server and proxy only
**Storage**: none
**Testing**: manual, per quickstart.md (constitution VI: no automated tests
before tasks.md exists)
**Target Platform**: browser, served by `npm run dev` on port 5173
**Project Type**: single static web app
**Constraints**: constitution I–VI; `/api` relative path only

## Constitution Check

| Principle | Status |
| --- | --- |
| I Vanilla only | PASS — no framework, ES modules between own files |
| II Contract, not implementation | PASS — contracts/api.md records observed behaviour |
| III Independently demoable stories | PASS — each page works with the other absent (foundation ships stubs) |
| IV Shared code is foundational | PASS — client, router, shell, stylesheet, error rendering in Phase 2; stories own one file each |
| V Every error path specified | PASS — see contracts/api.md, "Outcomes" |
| VI Verifiable acceptance criteria | PASS — quickstart.md |

## Project Structure

```
bookstore-web/
  index.html            shell: header, <main id="app">, module script
  styles.css            all styling; stories add no CSS files
  src/
    main.js             hash router; registers BOTH routes (foundation)
    api.js              fetch wrapper → {ok, status, data} | {error: kind}
    ui.js               render helpers: loading, message, link
    pages/
      book-list.js      User Story 1 — owned by US1 only
      book-detail.js    User Story 2 — owned by US2 only
```

Foundation creates `pages/book-list.js` and `pages/book-detail.js` as stubs
that render "Not built yet." — so the router never changes after Phase 2.

## Design Decisions

- **Hash routing** (`#/books?page=2`, `#/books/1`) so Vite needs no
  rewrite rule and the app works from a plain file server.
- **API client returns outcomes, never throws.** Callers switch on
  `outcome.kind`: `ok`, `not-found`, `client-error`, `server-error`,
  `network`. The backend's `error` field is dropped at this boundary
  (constitution V).
- **No total count in the API.** Next is always enabled; an empty page is a
  real state with its own message.
- **Detail envelope.** `api.getBook(id)` returns `{book, author}` as the
  backend sends it; the page reads both.

## Complexity Tracking

None. No principle is violated.
