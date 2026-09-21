# Feature Specification: Browse Books

**Feature Branch**: `001-browse-books`
**Created**: 2026-09-01
**Status**: Clarified
**Input**: "A web UI for the BookStore API. Users can browse books and open a
book to see its details and its author. The API is already running behind
`/api`."

## Clarifications

### Session 2026-09-01

- Q: How does a visitor reach the next page of the list? → A: "Previous" and
  "Next" buttons under the list. Page numbers start at 1. (Guess: the API
  gives no total count, so "Next" stays enabled until a page comes back
  empty.)
- Q: What does an empty page show? → A: The text "No books on this page."
  and a working "Previous" button.
- Q: What does the page show for a book id that does not exist? → A: The
  text "Book not found." and a link back to the list. Never the backend's
  own error text.
- Q: What identifies a book in a URL? → A: The hash route `#/books/{id}`.
  The list is `#/books?page={n}`. (Guess: hash routing avoids a server
  rewrite rule.)
- Q: What does the detail page show about the author? → A: Name and bio,
  from the same response as the book. No second request.

## User Scenarios & Testing

### User Story 1 — Browse the book list (Priority: P1)

A visitor opens the site and sees a page of books. They can move to the next
and previous page.

**Why this priority**: without the list there is nothing to open.

**Independent Test**: start a backend, open `#/books`, see ten books with
title and year, press Next, see different books, press Previous, see the
first ten again. Delivers value on its own.

**Acceptance Scenarios**:

1. **Given** the backend has more than ten books, **When** the visitor opens
   `#/books`, **Then** ten books show, each with title and year, and a Next
   button.
2. **Given** the visitor is on page 1, **When** they press Next, **Then** the
   URL becomes `#/books?page=2` and the list shows the next ten books.
3. **Given** the visitor is on page 2, **When** they press Previous, **Then**
   the URL becomes `#/books?page=1`.
4. **Given** a page beyond the last, **When** it loads, **Then** the page
   shows "No books on this page." and Previous still works.
5. **Given** the backend is down, **When** the list loads, **Then** the page
   shows "Could not load books." and nothing else.

### User Story 2 — Open a book (Priority: P2)

A visitor clicks a book in the list and sees its details and its author.

**Independent Test**: open `#/books/1` directly, see title, ISBN, year,
author name and author bio. Open `#/books/9999`, see "Book not found."
Works without User Story 1 being present.

**Acceptance Scenarios**:

1. **Given** book 1 exists, **When** the visitor opens `#/books/1`, **Then**
   the page shows the book's title, ISBN, year, and the author's name and
   bio, plus a link "Back to list".
2. **Given** no book has id 9999, **When** the visitor opens `#/books/9999`,
   **Then** the page shows "Book not found." and the "Back to list" link.
3. **Given** the id is not a number, **When** the visitor opens
   `#/books/abc`, **Then** the page shows "Book not found." (The backend
   answers 500 for this. The UI must not show that text.)
4. **Given** the backend is down, **When** the page loads, **Then** the page
   shows "Could not load this book."

### Edge Cases

- A page number below 1 in the URL is treated as page 1.
- A response that is not JSON is treated as a server error.
- The list shows a loading state for at most the duration of the request;
  no spinner library.

## Requirements

### Functional Requirements

- **FR-001**: The list page MUST request `GET /api/books?page={n}&size=10`
  and render the returned array.
- **FR-002**: The list MUST show, per book, title and year, as a link to
  `#/books/{id}`.
- **FR-003**: Next and Previous MUST change the `page` query in the hash and
  reload the list. Previous is disabled on page 1.
- **FR-004**: An empty array MUST render "No books on this page."
- **FR-005**: The detail page MUST request `GET /api/books/{id}` and read
  `book` and `author` from the response envelope.
- **FR-006**: The detail page MUST show title, ISBN, year, author name and
  author bio.
- **FR-007**: A 404 from the detail request MUST render "Book not found."
- **FR-008**: Any other failure (network, 5xx, non-JSON) MUST render a
  fixed sentence per page. Backend error text is never shown.
- **FR-009**: All requests MUST use the relative path `/api/...`. No host,
  port or scheme in code.
- **FR-010**: Navigation is hash-based. No server rewrite is needed.

### Key Entities

- **Book**: id, title, author_id, isbn, year, created_at.
- **Author**: id, name, bio.

## Success Criteria

- **SC-001**: Every acceptance scenario above passes in a browser against
  any of the four backends, with no code change.
- **SC-002**: Loading the list page makes exactly one API request.
- **SC-003**: Loading a detail page makes exactly one API request.
- **SC-004**: No runtime dependency is added to `package.json`.

## Assumptions

- Ten books per page is a sensible default; the API's own default is also
  ten.
- The API returns no total count, so the last page is detected by an empty
  response. (Guess, confirmed by research.md.)
- Author bio can be long; it is shown in full.
