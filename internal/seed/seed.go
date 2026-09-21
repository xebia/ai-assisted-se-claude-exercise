package seed

import (
	"database/sql"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

// Run populates the database with sample data.
// It is idempotent only in the sense that it always inserts fresh rows;
// call it only when the database is empty or when a reseed is explicitly requested.
func Run(db *sql.DB) error {
	authors := store.NewAuthorStore(db)
	books := store.NewBookStore(db)
	reviews := store.NewReviewStore(db)

	type authorSeed struct{ name, bio string }
	authorSeeds := []authorSeed{
		{"George Orwell", "English novelist and essayist."},
		{"Ursula K. Le Guin", "American author of speculative fiction."},
		{"Cormac McCarthy", "American novelist and playwright."},
		{"Toni Morrison", "American novelist and Nobel laureate."},
		{"Haruki Murakami", "Japanese author of surrealist fiction."},
	}

	authorIDs := make([]int, len(authorSeeds))
	for i, a := range authorSeeds {
		author, err := authors.Create(a.name, a.bio)
		if err != nil {
			return err
		}
		authorIDs[i] = author.ID
	}

	type bookSeed struct {
		title     string
		isbn      string
		year      int
		authorIdx int
	}
	bookSeeds := []bookSeed{
		{"1984", "978-0451524935", 1949, 0},
		{"Animal Farm", "978-0451526342", 1945, 0},
		{"Homage to Catalonia", "978-0156421171", 1938, 0},
		{"The Left Hand of Darkness", "978-0441478125", 1969, 1},
		{"The Dispossessed", "978-0061054884", 1974, 1},
		{"A Wizard of Earthsea", "978-0547773742", 1968, 1},
		{"Blood Meridian", "978-0679728757", 1985, 2},
		{"No Country for Old Men", "978-0307387899", 2005, 2},
		{"The Road", "978-0307387899", 2006, 2},
		{"Beloved", "978-1400033416", 1987, 3},
		{"Song of Solomon", "978-1400033423", 1977, 3},
		{"Sula", "978-1400033430", 1973, 3},
		{"Norwegian Wood", "978-0375704024", 1987, 4},
		{"Kafka on the Shore", "978-1400079278", 2002, 4},
		{"The Wind-Up Bird Chronicle", "978-0679775430", 1994, 4},
	}

	bookIDs := make([]int, len(bookSeeds))
	for i, b := range bookSeeds {
		book, err := books.Create(b.title, authorIDs[b.authorIdx], b.isbn, b.year)
		if err != nil {
			return err
		}
		bookIDs[i] = book.ID
	}

	type reviewSeed struct {
		bookIdx    int
		rating     int
		reviewText string
	}
	reviewSeeds := []reviewSeed{
		{0, 5, "A chilling vision of totalitarianism."},
		{1, 4, "A sharp political allegory."},
		{3, 5, "A masterpiece of speculative fiction."},
		{6, 4, "Brutal and poetic."},
		{8, 5, "Haunting and unforgettable."},
		{9, 5, "Morrison at her very best."},
		{12, 4, "Melancholic and beautifully written."},
		{13, 3, "Imaginative but occasionally meandering."},
		{14, 5, "Surreal and utterly gripping."},
		{4, 4, "A profound meditation on freedom."},
	}

	for _, rv := range reviewSeeds {
		if _, err := reviews.Create(bookIDs[rv.bookIdx], rv.rating, rv.reviewText); err != nil {
			return err
		}
	}
	return nil
}

// IsEmpty reports whether the authors table has no rows.
func IsEmpty(db *sql.DB) (bool, error) {
	var n int
	err := db.QueryRow(`SELECT COUNT(*) FROM authors`).Scan(&n)
	return n == 0, err
}
