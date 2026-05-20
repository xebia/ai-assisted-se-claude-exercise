from dataclasses import dataclass


@dataclass
class Book:
    id: int
    title: str
    author_id: int
    isbn: str
    year: int
    created_at: str
