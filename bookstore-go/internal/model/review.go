package model

import "time"

type Review struct {
	ID         int       `json:"id"`
	BookID     int       `json:"book_id"`
	Rating     int       `json:"rating"`
	ReviewText string    `json:"review_text"`
	CreatedAt  time.Time `json:"created_at"`
}
