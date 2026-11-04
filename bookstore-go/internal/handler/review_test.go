package handler_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestListReviews(t *testing.T) {
	mux, books, authors, reviews := newTestMux(t)

	a, _ := authors.Create("Author", "")
	b, _ := books.Create("Book", a.ID, "", 2000)
	reviews.Create(b.ID, 5, "Great read.")
	reviews.Create(b.ID, 3, "It was okay.")

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/books/%d/reviews", b.ID), nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", w.Code)
	}
	var result []any
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("len = %d, want 2", len(result))
	}
}

func TestCreateReview(t *testing.T) {
	mux, books, authors, _ := newTestMux(t)

	a, _ := authors.Create("Author", "")
	b, _ := books.Create("Book", a.ID, "", 2000)

	body, _ := json.Marshal(map[string]any{"rating": 4, "review_text": "Solid book."})
	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/books/%d/reviews", b.ID), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("status = %d, want 201", w.Code)
	}
}

// TestCreateReviewNonexistentBook: posting a review for a non-existent book should return 404.
func TestCreateReviewNonexistentBook(t *testing.T) {
	mux, _, _, _ := newTestMux(t)

	body, _ := json.Marshal(map[string]any{"rating": 5, "review_text": "Orphaned review."})
	req := httptest.NewRequest(http.MethodPost, "/api/books/99999/reviews", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404 for review on non-existent book, got %d", w.Code)
	}
}

// TestCreateReviewValidation: invalid rating and review_text values should return 400.
func TestCreateReviewValidation(t *testing.T) {
	mux, books, authors, _ := newTestMux(t)

	a, _ := authors.Create("Author", "")
	b, _ := books.Create("Book", a.ID, "", 2000)

	cases := []struct {
		name   string
		rating int
		text   string
	}{
		{"zero rating", 0, "Some text here."},
		{"negative rating", -1, "Some text here."},
		{"huge rating", 999, "Some text here."},
		{"empty text", 3, ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			body, _ := json.Marshal(map[string]any{"rating": tc.rating, "review_text": tc.text})
			req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/books/%d/reviews", b.ID), bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			mux.ServeHTTP(w, req)

			if w.Code != http.StatusBadRequest {
				t.Errorf("expected 400 for invalid input (%s), got %d", tc.name, w.Code)
			}
		})
	}
}
