package model

import "time"

type Book struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	AuthorID  int       `json:"author_id"`
	ISBN      string    `json:"isbn"`
	Year      int       `json:"year"`
	CreatedAt time.Time `json:"created_at"`
}
