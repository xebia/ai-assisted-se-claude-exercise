# API Contract (observed)

Base path: `/api` (same origin; Vite proxies to the backend).

## GET /api/books?page={n}&size={m}

- `page` starts at 1. `0` or missing behaves as `1`. Default `size` is 10.
- 200 → `Book[]`, possibly `[]`. No paging metadata.
- 500 → `{error}`.

## GET /api/books/{id}

- 200 → `{ book: Book, author: Author }`
- 404 → `{error: "book not found"}`
- 500 → `{error}` (also for a non-numeric id)

## Outcomes the UI must handle for every call

| Situation | Outcome kind | List page shows | Detail page shows |
| --- | --- | --- | --- |
| 200 with data | ok | the books | the book |
| 200 with `[]` | ok (empty) | "No books on this page." | n/a |
| 404 | not-found | n/a | "Book not found." |
| other 4xx | client-error | "Could not load books." | "Book not found." |
| 5xx | server-error | "Could not load books." | "Could not load this book." |
| fetch throws / non-JSON | network | "Could not load books." | "Could not load this book." |

Backend `error` text is never rendered.
