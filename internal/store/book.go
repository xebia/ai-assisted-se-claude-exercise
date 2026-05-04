package store

import (
	"database/sql"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/model"
)

type BookStore struct {
	db *sql.DB
}

func NewBookStore(db *sql.DB) *BookStore {
	return &BookStore{db: db}
}

// Search returns books matching query, with author details for each result.
func (s *BookStore) Search(query string) ([]map[string]any, error) {
	rows, err := s.db.Query(
		`SELECT id, title, author_id, isbn, year, created_at FROM books WHERE title LIKE ?`,
		"%"+query+"%",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]any
	for rows.Next() {
		var b model.Book
		if err := rows.Scan(&b.ID, &b.Title, &b.AuthorID, &b.ISBN, &b.Year, &b.CreatedAt); err != nil {
			return nil, err
		}
		var a model.Author
		s.db.QueryRow(`SELECT id, name, bio FROM authors WHERE id = ?`, b.AuthorID).
			Scan(&a.ID, &a.Name, &a.Bio)

		results = append(results, map[string]any{
			"book":   b,
			"author": a,
		})
	}
	return results, rows.Err()
}

func (s *BookStore) List(limit, offset int) ([]model.Book, error) {
	rows, err := s.db.Query(
		`SELECT id, title, author_id, isbn, year, created_at FROM books LIMIT ? OFFSET ?`,
		limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []model.Book
	for rows.Next() {
		var b model.Book
		if err := rows.Scan(&b.ID, &b.Title, &b.AuthorID, &b.ISBN, &b.Year, &b.CreatedAt); err != nil {
			return nil, err
		}
		books = append(books, b)
	}
	return books, rows.Err()
}

func (s *BookStore) Get(id int) (*model.Book, error) {
	var b model.Book
	err := s.db.QueryRow(
		`SELECT id, title, author_id, isbn, year, created_at FROM books WHERE id = ?`, id,
	).Scan(&b.ID, &b.Title, &b.AuthorID, &b.ISBN, &b.Year, &b.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &b, err
}

func (s *BookStore) Create(title string, authorID int, isbn string, year int) (*model.Book, error) {
	res, err := s.db.Exec(
		`INSERT INTO books (title, author_id, isbn, year) VALUES (?, ?, ?, ?)`,
		title, authorID, isbn, year,
	)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return s.Get(int(id))
}

func (s *BookStore) Delete(id int) error {
	_, err := s.db.Exec(`DELETE FROM books WHERE id = ?`, id)
	return err
}
