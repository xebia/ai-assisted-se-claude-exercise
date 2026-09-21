from http.server import BaseHTTPRequestHandler

from bookstore.handler.response import write_error, write_json
from bookstore.store.author import AuthorStore


class AuthorHandler:
    def __init__(self, authors: AuthorStore):
        self.authors = authors

    def list_authors(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        try:
            authors = self.authors.list()
        except Exception:
            write_error(h, 500, "failed to list authors")
            return
        write_json(h, 200, authors)

    def get_author(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        try:
            id = int(params["id"])
        except (KeyError, ValueError):
            write_error(h, 500, "invalid id")  # bug: should be 400
            return
        try:
            author = self.authors.get(id)
        except Exception:
            write_error(h, 500, "db error")
            return
        if author is None:
            write_error(h, 404, "author not found")
            return
        try:
            books = self.authors.books_by_author(id)
        except Exception:
            write_error(h, 500, "failed to list books")
            return
        write_json(h, 200, {"author": author, "books": books})
