package handler_test

import (
	"database/sql"
	"net/http"
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/handler"
	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

// newTestMux wires up all handlers against an in-memory SQLite database
// and returns the mux together with the underlying stores for test setup.
func newTestMux(t *testing.T) (mux *http.ServeMux, books *store.BookStore, authors *store.AuthorStore, reviews *store.ReviewStore) {
	t.Helper()
	db := newTestDB(t)

	books = store.NewBookStore(db)
	authors = store.NewAuthorStore(db)
	reviews = store.NewReviewStore(db)

	bh := handler.NewBookHandler(books, authors)
	ah := handler.NewAuthorHandler(authors)
	rh := handler.NewReviewHandler(reviews)

	mux = http.NewServeMux()
	mux.HandleFunc("GET /api/books", bh.ListBooks)
	mux.HandleFunc("GET /api/books/{id}", bh.GetBook)
	mux.HandleFunc("POST /api/books", bh.CreateBook)
	mux.HandleFunc("DELETE /api/books/{id}", bh.DeleteBook)
	mux.HandleFunc("GET /api/books/{id}/reviews", rh.ListReviews)
	mux.HandleFunc("POST /api/books/{id}/reviews", rh.CreateReview)
	mux.HandleFunc("GET /api/authors", ah.ListAuthors)
	mux.HandleFunc("GET /api/authors/{id}", ah.GetAuthor)
	return
}

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(":memory:")
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}
