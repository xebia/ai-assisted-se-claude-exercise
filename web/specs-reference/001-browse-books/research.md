# Research: BookStore API as observed

**Method**: curl against a running backend on `localhost:8080`, 2026-09-01.
Observed, not read from a README.

## Paging

```
GET /api/books?page=1&size=3   → 3 books, ids 1,2,3
GET /api/books?page=2&size=3   → 3 books, ids 4,5,6
GET /api/books?page=0&size=3   → same as page 1
GET /api/books                 → 10 books (default size 10)
GET /api/books?page=999        → []
```

**Decision**: pages start at 1. Page 0 is not an error; it repeats page 1.
The UI never sends page 0. There is no total count and no paging metadata.
Last page = first empty page.

## Shapes

```
GET /api/books        → [ {id, title, author_id, isbn, year, created_at}, … ]
GET /api/books/1      → { "book": {…}, "author": {id, name, bio} }
GET /api/books/9999   → 404 { "error": "book not found" }
GET /api/books/abc    → 500 { "error": "invalid id" }
GET /api/authors/1    → { "author": {…}, "books": [ … ] }
```

**Decision**: the list is a bare array; the detail is an envelope. The UI
must not assume one shape for both. A non-numeric id returns 500, not 400 —
the UI treats any non-200 on detail the same way except 404.

## Errors

- Body is always `{"error": "<text>"}` on failure.
- Text is developer-facing ("db error", "invalid id"). Not for users.

## Alternatives considered

- Fetching the author separately via `GET /api/authors/{id}`: rejected, the
  detail envelope already contains it (SC-003).
- Reading `bookstore-*/README.md` for the contract: rejected, constitution II.
