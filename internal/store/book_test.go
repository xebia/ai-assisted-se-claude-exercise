package store_test

import (
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

func TestBookCreate(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)

	author, _ := as.Create("Cormac McCarthy", "")
	book, err := bs.Create("Blood Meridian", author.ID, "978-0679728757", 1985)
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if book.ID == 0 {
		t.Error("expected non-zero ID")
	}
	if book.Title != "Blood Meridian" {
		t.Errorf("Title = %q, want %q", book.Title, "Blood Meridian")
	}
	if book.AuthorID != author.ID {
		t.Errorf("AuthorID = %d, want %d", book.AuthorID, author.ID)
	}
}

func TestBookGet(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)

	author, _ := as.Create("Haruki Murakami", "")
	created, _ := bs.Create("Norwegian Wood", author.ID, "978-0", 1987)

	t.Run("exists", func(t *testing.T) {
		got, err := bs.Get(created.ID)
		if err != nil {
			t.Fatalf("Get: %v", err)
		}
		if got == nil {
			t.Fatal("expected book, got nil")
		}
		if got.Title != "Norwegian Wood" {
			t.Errorf("Title = %q, want %q", got.Title, "Norwegian Wood")
		}
	})

	t.Run("not found", func(t *testing.T) {
		got, err := bs.Get(99999)
		if err != nil {
			t.Fatalf("Get: %v", err)
		}
		if got != nil {
			t.Errorf("expected nil for missing book, got %+v", got)
		}
	})
}

func TestBookList(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)

	author, _ := as.Create("Author", "")
	bs.Create("Book 1", author.ID, "", 2000)
	bs.Create("Book 2", author.ID, "", 2001)
	bs.Create("Book 3", author.ID, "", 2002)

	t.Run("all", func(t *testing.T) {
		books, err := bs.List(10, 0)
		if err != nil {
			t.Fatalf("List: %v", err)
		}
		if len(books) != 3 {
			t.Errorf("len = %d, want 3", len(books))
		}
	})

	t.Run("limit", func(t *testing.T) {
		books, err := bs.List(2, 0)
		if err != nil {
			t.Fatalf("List: %v", err)
		}
		if len(books) != 2 {
			t.Errorf("len = %d, want 2", len(books))
		}
	})

	t.Run("offset", func(t *testing.T) {
		books, err := bs.List(10, 2)
		if err != nil {
			t.Fatalf("List: %v", err)
		}
		if len(books) != 1 {
			t.Errorf("len = %d, want 1", len(books))
		}
	})
}

func TestBookDelete(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)

	author, _ := as.Create("Author", "")
	book, _ := bs.Create("To Delete", author.ID, "", 2000)

	if err := bs.Delete(book.ID); err != nil {
		t.Fatalf("Delete: %v", err)
	}

	got, err := bs.Get(book.ID)
	if err != nil {
		t.Fatalf("Get after delete: %v", err)
	}
	if got != nil {
		t.Error("expected nil after delete, book still exists")
	}
}

// TestBookSearch documents the N+1 query behaviour in Search().
// The test verifies correctness; the N+1 issue is a performance bug, not a logic bug.
func TestBookSearch(t *testing.T) {
	db := newTestDB(t)
	as := store.NewAuthorStore(db)
	bs := store.NewBookStore(db)

	author, _ := as.Create("George Orwell", "")
	bs.Create("1984", author.ID, "", 1949)
	bs.Create("Animal Farm", author.ID, "", 1945)
	bs.Create("Homage to Catalonia", author.ID, "", 1938)

	t.Run("matches title", func(t *testing.T) {
		results, err := bs.Search("1984")
		if err != nil {
			t.Fatalf("Search: %v", err)
		}
		if len(results) != 1 {
			t.Errorf("len = %d, want 1", len(results))
		}
	})

	t.Run("partial match", func(t *testing.T) {
		results, err := bs.Search("a")
		if err != nil {
			t.Fatalf("Search: %v", err)
		}
		if len(results) < 2 {
			t.Errorf("len = %d, want >=2", len(results))
		}
	})

	t.Run("no match", func(t *testing.T) {
		results, err := bs.Search("zzznomatch")
		if err != nil {
			t.Fatalf("Search: %v", err)
		}
		if len(results) != 0 {
			t.Errorf("len = %d, want 0", len(results))
		}
	})
}
