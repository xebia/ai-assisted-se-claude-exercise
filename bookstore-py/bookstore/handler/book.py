import json
from http.server import BaseHTTPRequestHandler

from bookstore.handler.response import write_error, write_json
from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from bookstore.util.pagination import paginate


class BookHandler:
    def __init__(self, books: BookStore, authors: AuthorStore):
        self.books = books
        self.authors = authors

    def list_books(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        page = int(query.get("page", "0") or "0")
        size = int(query.get("size", "0") or "0")
        if size == 0:
            size = 10
        limit, offset = paginate(page, size)
        try:
            books = self.books.list(limit, offset)
        except Exception:
            write_error(h, 500, "failed to list books")
            return
        write_json(h, 200, books)

    def get_book(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        try:
            id = int(params["id"])
        except (KeyError, ValueError):
            write_error(h, 500, "invalid id")
            return
        try:
            book = self.books.get(id)
        except Exception:
            write_error(h, 500, "db error")
            return
        if book is None:
            write_error(h, 404, "book not found")
            return
        author = self.authors.get(book.author_id)
        write_json(h, 200, {"book": book, "author": author})

    def create_book(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        length = int(h.headers.get("Content-Length") or "0")
        raw = h.rfile.read(length) if length else b""
        try:
            body = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            write_error(h, 400, "invalid body")
            return
        try:
            book = self.books.create(
                body.get("title", ""),
                int(body.get("author_id", 0)),
                body.get("isbn", ""),
                int(body.get("year", 0)),
            )
        except Exception:
            write_error(h, 500, "failed to create book")
            return
        write_json(h, 200, book)

    def delete_book(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        try:
            id = int(params["id"])
        except (KeyError, ValueError):
            write_error(h, 500, "invalid id")
            return
        try:
            self.books.delete(id)
        except Exception:
            write_error(h, 500, "failed to delete book")
            return
        write_json(h, 200, {"status": "deleted"})
