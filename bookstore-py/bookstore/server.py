import re
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Callable
from urllib.parse import parse_qs, urlparse

from bookstore.handler.author import AuthorHandler
from bookstore.handler.book import BookHandler
from bookstore.handler.response import write_error
from bookstore.handler.review import ReviewHandler
from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from bookstore.store.review import ReviewStore

Route = tuple[str, re.Pattern[str], Callable[[BaseHTTPRequestHandler, dict[str, str], dict[str, str]], None]]


def build_routes(db: sqlite3.Connection) -> list[Route]:
    books = BookStore(db)
    authors = AuthorStore(db)
    reviews = ReviewStore(db)

    bh = BookHandler(books, authors)
    ah = AuthorHandler(authors)
    rh = ReviewHandler(reviews)

    def compile_pattern(path: str) -> re.Pattern[str]:
        regex = re.sub(r"\{(\w+)\}", r"(?P<\1>[^/]+)", path)
        return re.compile(f"^{regex}$")

    return [
        ("GET", compile_pattern("/api/books"), bh.list_books),
        ("GET", compile_pattern("/api/books/{id}"), bh.get_book),
        ("POST", compile_pattern("/api/books"), bh.create_book),
        ("DELETE", compile_pattern("/api/books/{id}"), bh.delete_book),
        ("GET", compile_pattern("/api/books/{id}/reviews"), rh.list_reviews),
        ("POST", compile_pattern("/api/books/{id}/reviews"), rh.create_review),
        ("GET", compile_pattern("/api/authors"), ah.list_authors),
        ("GET", compile_pattern("/api/authors/{id}"), ah.get_author),
    ]


def make_request_handler(routes: list[Route]) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        def _dispatch(self) -> None:
            parsed = urlparse(self.path)
            query = {k: v[0] for k, v in parse_qs(parsed.query).items()}
            for method, pattern, fn in routes:
                if method != self.command:
                    continue
                m = pattern.match(parsed.path)
                if m:
                    fn(self, m.groupdict(), query)
                    return
            write_error(self, 404, "not found")

        def do_GET(self) -> None:
            self._dispatch()

        def do_POST(self) -> None:
            self._dispatch()

        def do_DELETE(self) -> None:
            self._dispatch()

        def log_message(self, format: str, *args) -> None:  # noqa: A002
            pass

    return Handler


def start_server(db: sqlite3.Connection, port: int = 8080) -> ThreadingHTTPServer:
    routes = build_routes(db)
    handler_cls = make_request_handler(routes)
    return ThreadingHTTPServer(("127.0.0.1", port), handler_cls)
