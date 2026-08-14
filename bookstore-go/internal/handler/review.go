package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

type ReviewHandler struct {
	reviews *store.ReviewStore
	books   *store.BookStore
}

func NewReviewHandler(reviews *store.ReviewStore, books *store.BookStore) *ReviewHandler {
	return &ReviewHandler{reviews: reviews, books: books}
}

func (h *ReviewHandler) ListReviews(w http.ResponseWriter, r *http.Request) {
	bookID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "invalid book id")
		return
	}
	reviews, err := h.reviews.ListByBook(bookID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list reviews")
		return
	}
	writeJSON(w, http.StatusOK, reviews)
}

func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	bookID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "invalid book id")
		return
	}
	book, err := h.books.Get(bookID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	if book == nil {
		writeError(w, http.StatusNotFound, "book not found")
		return
	}
	var body struct {
		Rating     int    `json:"rating"`
		ReviewText string `json:"review_text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if body.Rating < 1 || body.Rating > 5 {
		writeError(w, http.StatusBadRequest, "rating must be between 1 and 5")
		return
	}
	if len(body.ReviewText) == 0 {
		writeError(w, http.StatusBadRequest, "review_text must not be empty")
		return
	}
	review, err := h.reviews.Create(bookID, body.Rating, body.ReviewText)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, review)
}
