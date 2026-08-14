package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

type ReviewHandler struct {
	reviews *store.ReviewStore
}

func NewReviewHandler(reviews *store.ReviewStore) *ReviewHandler {
	return &ReviewHandler{reviews: reviews}
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
	var body struct {
		Rating     int    `json:"rating"`
		ReviewText string `json:"review_text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	review, err := h.reviews.Create(bookID, body.Rating, body.ReviewText)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, review)
}
