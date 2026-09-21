package store

import (
	"database/sql"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/model"
)

type AuthorStore struct {
	db *sql.DB
}

func NewAuthorStore(db *sql.DB) *AuthorStore {
	return &AuthorStore{db: db}
}

func (s *AuthorStore) List() ([]model.Author, error) {
	rows, err := s.db.Query(`SELECT id, name, bio FROM authors`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var authors []model.Author
	for rows.Next() {
		var a model.Author
		if err := rows.Scan(&a.ID, &a.Name, &a.Bio); err != nil {
			return nil, err
		}
		authors = append(authors, a)
	}
	return authors, rows.Err()
}

func (s *AuthorStore) Get(id int) (*model.Author, error) {
	var a model.Author
	err := s.db.QueryRow(`SELECT id, name, bio FROM authors WHERE id = ?`, id).
		Scan(&a.ID, &a.Name, &a.Bio)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &a, err
}

func (s *AuthorStore) BooksByAuthor(authorID int) ([]model.Book, error) {
	rows, err := s.db.Query(
		`SELECT id, title, author_id, isbn, year, created_at FROM books WHERE author_id = ?`, authorID,
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

func (s *AuthorStore) Create(name, bio string) (*model.Author, error) {
	res, err := s.db.Exec(`INSERT INTO authors (name, bio) VALUES (?, ?)`, name, bio)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return s.Get(int(id))
}
