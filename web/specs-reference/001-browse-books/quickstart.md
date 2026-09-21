# Quickstart: verify Browse Books

Prerequisites: a backend on `:8080`, `npm run dev` on `:5173`.

1. Open http://localhost:5173. Expect the shell and, once US1 is built, ten
   books with title and year.
2. Press **Next**. URL becomes `#/books?page=2`; the books change.
3. Press **Previous**. Back to page 1; Previous becomes disabled.
4. Open `#/books?page=999`. Expect "No books on this page." and a working
   Previous.
5. Click a book. Expect title, ISBN, year, author name, author bio, and a
   "Back to list" link.
6. Open `#/books/9999`. Expect "Book not found." — not "book not found" in
   JSON, not a blank page.
7. Open `#/books/abc`. Expect "Book not found."
8. Stop the backend. Reload the list. Expect "Could not load books." and
   nothing else. Start it again.
9. In the browser's network tab, load `#/books/1`. Expect exactly one
   request to `/api/books/1`.
10. `grep -rn "8080\|localhost" src/ index.html` prints nothing.
