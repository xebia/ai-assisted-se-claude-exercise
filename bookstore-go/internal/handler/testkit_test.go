package handler_test

// Test helpers for handler tests: NewAPI, builders (AnAuthor, ABook,
// AReview), request helpers (Get, Post, Delete) and response checks
// (ExpectStatus, ExpectJSON).

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/model"
	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

// API is a test server with its stores. Routes come from newTestMux.
type API struct {
	t       *testing.T
	mux     *http.ServeMux
	Books   *store.BookStore
	Authors *store.AuthorStore
	Reviews *store.ReviewStore
}

// NewAPI starts a fresh in-memory API for one test case.
func NewAPI(t *testing.T) *API {
	t.Helper()
	mux, books, authors, reviews := newTestMux(t)
	return &API{t: t, mux: mux, Books: books, Authors: authors, Reviews: reviews}
}

// AnAuthor creates an author with the given name.
func (api *API) AnAuthor(name string) *model.Author {
	api.t.Helper()
	a, err := api.Authors.Create(name, "")
	if err != nil {
		api.t.Fatalf("testkit: create author: %v", err)
	}
	return a
}

// ABook creates a book with the given title, and an author for it.
func (api *API) ABook(title string) *model.Book {
	api.t.Helper()
	a := api.AnAuthor("Author of " + title)
	b, err := api.Books.Create(title, a.ID, "", 2000)
	if err != nil {
		api.t.Fatalf("testkit: create book: %v", err)
	}
	return b
}

// AReview creates a review with the given rating on a book.
func (api *API) AReview(book *model.Book, rating int) *model.Review {
	api.t.Helper()
	r, err := api.Reviews.Create(book.ID, rating, "A review written by the test kit.")
	if err != nil {
		api.t.Fatalf("testkit: create review: %v", err)
	}
	return r
}

// Get, Post and Delete send one request and return the response.
func (api *API) Get(path string) *Resp    { return api.do(http.MethodGet, path, nil) }
func (api *API) Delete(path string) *Resp { return api.do(http.MethodDelete, path, nil) }
func (api *API) Post(path string, body any) *Resp {
	return api.do(http.MethodPost, path, body)
}

func (api *API) do(method, path string, body any) *Resp {
	api.t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			api.t.Fatalf("testkit: encode body: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	w := httptest.NewRecorder()
	api.mux.ServeHTTP(w, req)
	return &Resp{t: api.t, Code: w.Code, Body: w.Body.Bytes()}
}

// Resp is one response, with chainable checks.
type Resp struct {
	t    *testing.T
	Code int
	Body []byte
}

// ExpectStatus fails the test when the status code differs.
func (r *Resp) ExpectStatus(want int) *Resp {
	r.t.Helper()
	if r.Code != want {
		r.t.Fatalf("status = %d, want %d; body: %s", r.Code, want, r.Body)
	}
	return r
}

// ExpectJSON fails the test when a top-level JSON field differs.
func (r *Resp) ExpectJSON(field string, want any) *Resp {
	r.t.Helper()
	var m map[string]any
	if err := json.Unmarshal(r.Body, &m); err != nil {
		r.t.Fatalf("body is not a JSON object: %s", r.Body)
	}
	if fmt.Sprint(m[field]) != fmt.Sprint(want) {
		r.t.Fatalf("%s = %v, want %v; body: %s", field, m[field], want, r.Body)
	}
	return r
}
