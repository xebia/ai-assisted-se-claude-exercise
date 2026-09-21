from __future__ import annotations

import sqlite3
from typing import Optional

from bookstore.model.author import Author
from bookstore.model.book import Book


class AuthorStore:
    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def list(self) -> list[Author]:
        rows = self.db.execute("SELECT id, name, bio FROM authors").fetchall()
        return [Author(**dict(r)) for r in rows]

    def get(self, id: int) -> Optional[Author]:
        row = self.db.execute(
            "SELECT id, name, bio FROM authors WHERE id = ?", (id,)
        ).fetchone()
        return Author(**dict(row)) if row else None

    def books_by_author(self, author_id: int) -> list[Book]:
        rows = self.db.execute(
            "SELECT id, title, author_id, isbn, year, created_at FROM books WHERE author_id = ?",
            (author_id,),
        ).fetchall()
        return [Book(**dict(r)) for r in rows]

    def create(self, name: str, bio: str) -> Author:
        cur = self.db.execute(
            "INSERT INTO authors (name, bio) VALUES (?, ?)", (name, bio)
        )
        self.db.commit()
        return self.get(cur.lastrowid)  # type: ignore[return-value]
