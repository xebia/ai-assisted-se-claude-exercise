from dataclasses import dataclass


@dataclass
class Review:
    id: int
    book_id: int
    rating: int
    review_text: str
    created_at: str
