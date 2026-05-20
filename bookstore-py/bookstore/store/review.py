import sqlite3
from typing import Optional

from bookstore.model.review import Review


class ReviewStore:
    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def list_by_book(self, book_id: int) -> list[Review]:
        rows = self.db.execute(
            "SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE book_id = ?",
            (book_id,),
        ).fetchall()
        return [Review(**dict(r)) for r in rows]

    def create(self, book_id: int, rating: int, review_text: str) -> Review:
        cur = self.db.execute(
            "INSERT INTO reviews (book_id, rating, review_text) VALUES (?, ?, ?)",
            (book_id, rating, review_text),
        )
        self.db.commit()
        row = self.db.execute(
            "SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE id = ?",
            (cur.lastrowid,),
        ).fetchone()
        return Review(**dict(row))
