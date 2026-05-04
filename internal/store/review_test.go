package store_test

import (
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

func TestReviewCreate(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)
	rs := store.NewReviewStore(db)

	author, _ := as.Create("Author", "")
	book, _ := bs.Create("Book", author.ID, "", 2000)

	r, err := rs.Create(book.ID, 5, "Excellent read.")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if r.ID == 0 {
		t.Error("expected non-zero ID")
	}
	if r.Rating != 5 {
		t.Errorf("Rating = %d, want 5", r.Rating)
	}
	if r.BookID != book.ID {
		t.Errorf("BookID = %d, want %d", r.BookID, book.ID)
	}
}

func TestReviewListByBook(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)
	rs := store.NewReviewStore(db)

	author, _ := as.Create("Author", "")
	book1, _ := bs.Create("Book 1", author.ID, "", 2000)
	book2, _ := bs.Create("Book 2", author.ID, "", 2001)

	rs.Create(book1.ID, 5, "Great.")
	rs.Create(book1.ID, 3, "Average.")
	rs.Create(book2.ID, 4, "Good.")

	t.Run("book1 has two reviews", func(t *testing.T) {
		reviews, err := rs.ListByBook(book1.ID)
		if err != nil {
			t.Fatalf("ListByBook: %v", err)
		}
		if len(reviews) != 2 {
			t.Errorf("len = %d, want 2", len(reviews))
		}
	})

	t.Run("book2 has one review", func(t *testing.T) {
		reviews, err := rs.ListByBook(book2.ID)
		if err != nil {
			t.Fatalf("ListByBook: %v", err)
		}
		if len(reviews) != 1 {
			t.Errorf("len = %d, want 1", len(reviews))
		}
	})

	t.Run("unknown book returns empty slice", func(t *testing.T) {
		reviews, err := rs.ListByBook(99999)
		if err != nil {
			t.Fatalf("ListByBook: %v", err)
		}
		if len(reviews) != 0 {
			t.Errorf("len = %d, want 0", len(reviews))
		}
	})
}
