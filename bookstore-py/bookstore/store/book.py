from __future__ import annotations

import sqlite3
from typing import Optional

from bookstore.model.author import Author
from bookstore.model.book import Book


class BookStore:
    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def search(self, query: str) -> list[dict]:
        """Returns books matching query, with author details for each result."""
        rows = self.db.execute(
            "SELECT id, title, author_id, isbn, year, created_at FROM books WHERE title LIKE ?",
            (f"%{query}%",),
        ).fetchall()

        results: list[dict] = []
        for r in rows:
            book = Book(**dict(r))
            ar = self.db.execute(
                "SELECT id, name, bio FROM authors WHERE id = ?", (book.author_id,)
            ).fetchone()
            author = Author(**dict(ar)) if ar else None
            results.append({"book": book, "author": author})
        return results

    def list(self, limit: int, offset: int) -> list[Book]:
        rows = self.db.execute(
            "SELECT id, title, author_id, isbn, year, created_at FROM books LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        return [Book(**dict(r)) for r in rows]

    def get(self, id: int) -> Optional[Book]:
        row = self.db.execute(
            "SELECT id, title, author_id, isbn, year, created_at FROM books WHERE id = ?",
            (id,),
        ).fetchone()
        return Book(**dict(row)) if row else None

    def create(self, title: str, author_id: int, isbn: str, year: int) -> Book:
        cur = self.db.execute(
            "INSERT INTO books (title, author_id, isbn, year) VALUES (?, ?, ?, ?)",
            (title, author_id, isbn, year),
        )
        self.db.commit()
        return self.get(cur.lastrowid)  # type: ignore[return-value]

    def delete(self, id: int) -> None:
        self.db.execute("DELETE FROM books WHERE id = ?", (id,))
        self.db.commit()
