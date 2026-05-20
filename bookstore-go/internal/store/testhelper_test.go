package store_test

import (
	"database/sql"
	"testing"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

// newTestDB opens an in-memory SQLite database and runs migrations.
// The database is closed automatically when the test ends.
func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(":memory:")
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}
