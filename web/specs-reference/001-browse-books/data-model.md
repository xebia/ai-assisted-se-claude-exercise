# Data Model: Browse Books

Read-only. The UI creates nothing.

## Book

| Field | Type | Notes |
| --- | --- | --- |
| id | number | used in `#/books/{id}` |
| title | string | shown in list and detail |
| author_id | number | not shown; the detail envelope carries the author |
| isbn | string | detail only |
| year | number | list and detail |
| created_at | string | not shown |

## Author

| Field | Type | Notes |
| --- | --- | --- |
| id | number | not shown |
| name | string | detail |
| bio | string | detail, may be long |

## Envelopes

- List: `Book[]`
- Detail: `{ book: Book, author: Author }`

## Client-side outcome (from `src/api.js`)

```
{ kind: "ok", data }
{ kind: "not-found" }
{ kind: "client-error", status }
{ kind: "server-error", status }
{ kind: "network" }
```

The `error` text from the backend is never part of an outcome.
