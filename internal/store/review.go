package store

import (
	"database/sql"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/model"
)

type ReviewStore struct {
	db *sql.DB
}

func NewReviewStore(db *sql.DB) *ReviewStore {
	return &ReviewStore{db: db}
}

func (s *ReviewStore) ListByBook(bookID int) ([]model.Review, error) {
	rows, err := s.db.Query(
		`SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE book_id = ?`, bookID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []model.Review
	for rows.Next() {
		var r model.Review
		if err := rows.Scan(&r.ID, &r.BookID, &r.Rating, &r.ReviewText, &r.CreatedAt); err != nil {
			return nil, err
		}
		reviews = append(reviews, r)
	}
	return reviews, rows.Err()
}

func (s *ReviewStore) Create(bookID, rating int, reviewText string) (*model.Review, error) {
	res, err := s.db.Exec(
		`INSERT INTO reviews (book_id, rating, review_text) VALUES (?, ?, ?)`,
		bookID, rating, reviewText,
	)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	var r model.Review
	err = s.db.QueryRow(
		`SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE id = ?`, id,
	).Scan(&r.ID, &r.BookID, &r.Rating, &r.ReviewText, &r.CreatedAt)
	return &r, err
}
