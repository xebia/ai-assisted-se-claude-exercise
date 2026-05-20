import json
from http.server import BaseHTTPRequestHandler

from bookstore.handler.response import write_error, write_json
from bookstore.store.review import ReviewStore


class ReviewHandler:
    def __init__(self, reviews: ReviewStore):
        self.reviews = reviews

    def list_reviews(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        try:
            book_id = int(params["id"])
        except (KeyError, ValueError):
            write_error(h, 500, "invalid book id")
            return
        try:
            reviews = self.reviews.list_by_book(book_id)
        except Exception:
            write_error(h, 500, "failed to list reviews")
            return
        write_json(h, 200, reviews)

    def create_review(self, h: BaseHTTPRequestHandler, params: dict[str, str], query: dict[str, str]) -> None:
        try:
            book_id = int(params["id"])
        except (KeyError, ValueError):
            write_error(h, 500, "invalid book id")
            return
        length = int(h.headers.get("Content-Length") or "0")
        raw = h.rfile.read(length) if length else b""
        try:
            body = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            write_error(h, 400, "invalid body")
            return
        try:
            review = self.reviews.create(
                book_id,
                int(body.get("rating", 0)),
                body.get("review_text", ""),
            )
        except Exception as e:
            write_error(h, 500, str(e))
            return
        write_json(h, 201, review)
