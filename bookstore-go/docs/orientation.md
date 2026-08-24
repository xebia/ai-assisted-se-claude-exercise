# BookStore (Go) — Orientation

## Package tree

- `main` (`main.go`) — process entry point: opens the DB, seeds it if empty, wires stores into handlers, and registers HTTP routes.
- `internal/model` (`internal/model/book.go`, `author.go`, `review.go`) — plain data structs (`Book`, `Author`, `Review`) with JSON tags; no behavior.
- `internal/store` (`internal/store/db.go`, `book.go`, `author.go`, `review.go`) — SQLite persistence: `db.go` opens the DB and runs migrations, one `*Store` type per entity does the SQL for that table.
- `internal/handler` (`internal/handler/book.go`, `author.go`, `review.go`, `response.go`) — `net/http` handlers that parse requests, call stores, and write JSON responses; `response.go` holds the shared `writeJSON`/`writeError` helpers.
- `internal/util` (`internal/util/pagination.go`) — one helper, `Paginate`, converting `page`/`size` query params into `limit`/`offset`.
- `internal/seed` (`internal/seed/seed.go`) — populates the database with sample authors/books/reviews on first run or `--seed`.

## Request flow: `GET /api/books`

Route registered at `main.go:50`. Traced end to end:

1. `main.go:50` — `http.HandleFunc("GET /api/books", bh.ListBooks)` routes the request to the handler.
2. `internal/handler/book.go:22-27` — `ListBooks` reads `page`/`size` from the query string, defaulting `size` to `10` if unset.
3. `internal/handler/book.go:28` — calls `util.Paginate(page, size)` to get `(limit, offset)`.
4. `internal/util/pagination.go:4-6` — `Paginate` returns `(size, (page-1)*size)`.
5. `internal/handler/book.go:29` — calls `h.books.List(limit, offset)` on the injected `*store.BookStore`.
6. `internal/store/book.go:46-65` — `List` runs `SELECT id, title, author_id, isbn, year, created_at FROM books LIMIT ? OFFSET ?` against the `*sql.DB`, scanning rows into `[]model.Book`.
7. `internal/store/db.go:8-17` — the `*sql.DB` this query runs against was opened here via `sql.Open("sqlite", path)`, against the `books` table created by `migrate` (`internal/store/db.go:27-34`).
8. `internal/handler/book.go:29-34` — on success, `writeJSON(w, http.StatusOK, books)` is called.
9. `internal/handler/response.go:8-12` — `writeJSON` sets the `Content-Type` header, writes the status, and JSON-encodes the body to the response writer.
