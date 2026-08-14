package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
	"github.com/xebia/ai-assisted-se-claude-exercise/internal/util"
)

type BookHandler struct {
	books   *store.BookStore
	authors *store.AuthorStore
}

func NewBookHandler(books *store.BookStore, authors *store.AuthorStore) *BookHandler {
	return &BookHandler{books: books, authors: authors}
}

// ListBooks returns a paginated list of books.
func (h *BookHandler) ListBooks(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	size, _ := strconv.Atoi(r.URL.Query().Get("size"))
	if size == 0 {
		size = 10
	}
	limit, offset := util.Paginate(page, size)
	books, err := h.books.List(limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list books")
		return
	}
	writeJSON(w, http.StatusOK, books)
}

// GetBook returns a single book with its author.
func (h *BookHandler) GetBook(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "invalid id")
		return
	}
	book, err := h.books.Get(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	if book == nil {
		writeError(w, http.StatusNotFound, "book not found")
		return
	}
	author, _ := h.authors.Get(book.AuthorID)
	writeJSON(w, http.StatusOK, map[string]any{"book": book, "author": author})
}

func (h *BookHandler) CreateBook(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Title    string `json:"title"`
		AuthorID int    `json:"author_id"`
		ISBN     string `json:"isbn"`
		Year     int    `json:"year"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	book, err := h.books.Create(body.Title, body.AuthorID, body.ISBN, body.Year)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create book")
		return
	}
	writeJSON(w, http.StatusOK, book)
}

func (h *BookHandler) DeleteBook(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "invalid id")
		return
	}
	if err := h.books.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete book")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
