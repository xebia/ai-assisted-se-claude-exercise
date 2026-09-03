# Tasks: Browse Books

**Input**: Design documents from `/specs/001-browse-books/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md
**Tests**: none — constitution VI forbids automated tests in this phase.

**Organization**: tasks are grouped by user story so each story can be built
and demoed independently, by a different agent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependencies)
- **[Story]**: which user story the task belongs to (US1, US2)

## Phase 1: Setup

- [ ] T001 Confirm `npm run dev` serves `index.html` on :5173 and `/api/books` is proxied (curl `http://localhost:5173/api/books` returns JSON)
- [ ] T002 Create `src/` and `src/pages/` directories

## Phase 2: Foundational (blocking — no story work before this is done)

- [ ] T003 Write `index.html`: header with site name linking to `#/books`, `<main id="app">`, `<script type="module" src="/src/main.js">`, link to `styles.css`
- [ ] T004 [P] Write `styles.css`: base typography, list layout, `.message`, `.pager`, disabled button state. Stories add no CSS files and do not edit this one.
- [ ] T005 [P] Write `src/api.js`: `listBooks(page, size)` and `getBook(id)`; both return an outcome object per data-model.md; never throw; drop backend `error` text
- [ ] T006 [P] Write `src/ui.js`: `renderMessage(text)`, `renderLoading()`, `link(href, text)` — return DOM nodes, no innerHTML from API data
- [ ] T007 Write `src/pages/book-list.js` stub: `export function render(app, params)` that shows "Not built yet."
- [ ] T008 Write `src/pages/book-detail.js` stub: `export function render(app, params)` that shows "Not built yet."
- [ ] T009 Write `src/main.js`: hash router. `#/books?page=n` → book-list, `#/books/{id}` → book-detail, anything else → `#/books`. Imports both page modules. This file is complete after this task; stories do not edit it.

**Checkpoint**: shell loads, both routes show "Not built yet."

---

## Phase 3: User Story 1 — Browse the book list (Priority: P1) 🎯 MVP

**Goal**: paginated list of books with Next/Previous.

**Independent Test**: quickstart.md steps 1–4 and 8 pass.

**Owns**: `src/pages/book-list.js` only.

- [ ] T010 [US1] In `src/pages/book-list.js`: read `page` from params (default 1, minimum 1), call `api.listBooks(page, 10)`, render loading first
- [ ] T011 [US1] Render each book as a link to `#/books/{id}` with title and year
- [ ] T012 [US1] Render "No books on this page." for an empty array; "Could not load books." for every non-ok outcome
- [ ] T013 [US1] Render Previous (disabled on page 1) and Next; both change the hash and re-render

**Checkpoint**: US1 demoable alone.

---

## Phase 4: User Story 2 — Open a book (Priority: P2)

**Goal**: book detail page with author.

**Independent Test**: quickstart.md steps 5–7 and 9 pass, with `#/books/1`
opened directly.

**Owns**: `src/pages/book-detail.js` only.

- [ ] T014 [US2] In `src/pages/book-detail.js`: read `id` from params, call `api.getBook(id)`, render loading first
- [ ] T015 [US2] Render title, ISBN, year, author name, author bio from the `{book, author}` envelope, plus a "Back to list" link to `#/books`
- [ ] T016 [US2] Render "Book not found." for not-found and client-error outcomes; "Could not load this book." for server-error and network

**Checkpoint**: US2 demoable alone.

---

## Phase 5: Polish

- [ ] T017 Walk quickstart.md end to end against a second backend; note any difference in research.md

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → (Phase 3 ∥ Phase 4) → Phase 5
- US1 and US2 have no dependency on each other. Each owns one file.
- No story task edits `index.html`, `styles.css`, `src/main.js`,
  `src/api.js` or `src/ui.js`. If a story needs a change there, that is a
  defect in Phase 2 — stop and fix it there first.

### Parallel Opportunities

- T004, T005, T006 can run in parallel (different files).
- After the Phase 2 checkpoint, all of Phase 3 and all of Phase 4 can run in
  parallel.

## Implementation Strategy

### MVP First

1. Phase 1 + 2. 2. Phase 3. 3. Stop and validate with quickstart steps 1–4.

### Parallel Team Strategy

1. One session completes Phase 1 + 2 and commits.
2. Then:
   - Teammate A: User Story 1 (`src/pages/book-list.js`)
   - Teammate B: User Story 2 (`src/pages/book-detail.js`)
3. Each teammate is done when its Independent Test passes and its tasks
   are ticked here.
4. Phase 5 after both.
