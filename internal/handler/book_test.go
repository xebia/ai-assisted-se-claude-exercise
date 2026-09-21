package handler_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestListBooks(t *testing.T) {
	mux, books, authors, _ := newTestMux(t)

	a, _ := authors.Create("Author", "")
	books.Create("Book A", a.ID, "", 2000)
	books.Create("Book B", a.ID, "", 2001)

	req := httptest.NewRequest(http.MethodGet, "/api/books", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", w.Code)
	}
	var result []any
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("len = %d, want 2", len(result))
	}
}

func TestGetBook(t *testing.T) {
	mux, books, authors, _ := newTestMux(t)
	a, _ := authors.Create("Author", "")
	b, _ := books.Create("1984", a.ID, "", 1949)

	t.Run("found", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/books/%d", b.ID), nil)
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("status = %d, want 200", w.Code)
		}
	})

	t.Run("not found", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/books/99999", nil)
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("status = %d, want 404", w.Code)
		}
	})
}

// TestCreateBookReturns201: POST /api/books should return 201 Created.
func TestCreateBookReturns201(t *testing.T) {
	mux, _, authors, _ := newTestMux(t)
	a, _ := authors.Create("Author", "")

	body, _ := json.Marshal(map[string]any{
		"title":     "New Book",
		"author_id": a.ID,
		"isbn":      "978-x",
		"year":      2024,
	})
	req := httptest.NewRequest(http.MethodPost, "/api/books", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected 201 Created for POST /api/books, got %d", w.Code)
	}
}

// TestDeleteBookReturns204: DELETE /api/books/{id} should return 204 No Content with no body.
func TestDeleteBookReturns204(t *testing.T) {
	mux, books, authors, _ := newTestMux(t)
	a, _ := authors.Create("Author", "")
	b, _ := books.Create("To Delete", a.ID, "", 2000)

	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/books/%d", b.ID), nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected 204 No Content for DELETE /api/books/%d, got %d", b.ID, w.Code)
	}
	if w.Body.Len() != 0 {
		t.Errorf("expected empty body for 204, got %q", w.Body.String())
	}
}

func TestCreateBookInvalidBody(t *testing.T) {
	mux, _, _, _ := newTestMux(t)

	req := httptest.NewRequest(http.MethodPost, "/api/books", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}
