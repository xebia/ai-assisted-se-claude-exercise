package store_test

import (
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

func TestAuthorCreate(t *testing.T) {
	db := newTestDB(t)
	s := store.NewAuthorStore(db)

	a, err := s.Create("Ursula K. Le Guin", "American author of speculative fiction.")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if a.ID == 0 {
		t.Error("expected non-zero ID")
	}
	if a.Name != "Ursula K. Le Guin" {
		t.Errorf("Name = %q, want %q", a.Name, "Ursula K. Le Guin")
	}
}

func TestAuthorGet(t *testing.T) {
	db := newTestDB(t)
	s := store.NewAuthorStore(db)

	created, _ := s.Create("George Orwell", "English novelist.")

	t.Run("exists", func(t *testing.T) {
		got, err := s.Get(created.ID)
		if err != nil {
			t.Fatalf("Get: %v", err)
		}
		if got == nil {
			t.Fatal("expected author, got nil")
		}
		if got.Name != created.Name {
			t.Errorf("Name = %q, want %q", got.Name, created.Name)
		}
	})

	t.Run("not found", func(t *testing.T) {
		got, err := s.Get(99999)
		if err != nil {
			t.Fatalf("Get: %v", err)
		}
		if got != nil {
			t.Errorf("expected nil for missing author, got %+v", got)
		}
	})
}

func TestAuthorList(t *testing.T) {
	db := newTestDB(t)
	s := store.NewAuthorStore(db)

	s.Create("Author A", "")
	s.Create("Author B", "")
	s.Create("Author C", "")

	authors, err := s.List()
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(authors) != 3 {
		t.Errorf("len = %d, want 3", len(authors))
	}
}

func TestAuthorBooksByAuthor(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)

	author, _ := as.Create("Toni Morrison", "")
	bs.Create("Beloved", author.ID, "978-0", 1987)
	bs.Create("Sula", author.ID, "978-1", 1973)

	books, err := as.BooksByAuthor(author.ID)
	if err != nil {
		t.Fatalf("BooksByAuthor: %v", err)
	}
	if len(books) != 2 {
		t.Errorf("len = %d, want 2", len(books))
	}
}
