package handler

import (
	"net/http"
	"strconv"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

type AuthorHandler struct {
	authors *store.AuthorStore
}

func NewAuthorHandler(authors *store.AuthorStore) *AuthorHandler {
	return &AuthorHandler{authors: authors}
}

func (h *AuthorHandler) ListAuthors(w http.ResponseWriter, r *http.Request) {
	authors, err := h.authors.List()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list authors")
		return
	}
	writeJSON(w, http.StatusOK, authors)
}

func (h *AuthorHandler) GetAuthor(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "invalid id") // bug: should be 400
		return
	}
	author, err := h.authors.Get(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	if author == nil {
		writeError(w, http.StatusNotFound, "author not found")
		return
	}
	books, err := h.authors.BooksByAuthor(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list books")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"author": author, "books": books})
}
