"""Test helpers for handler tests: ApiTestCase, builders (an_author, a_book,
a_review), request helpers (get, post, delete) and response checks
(expect_status, expect_json)."""

import json
import unittest

from tests.helpers import TestEnv


class Resp:
    """One response, with chainable checks."""

    def __init__(self, case: unittest.TestCase, status: int, body: bytes):
        self.case = case
        self.status = status
        self.body = body

    def expect_status(self, expected: int) -> "Resp":
        self.case.assertEqual(self.status, expected, f"status; body: {self.body!r}")
        return self

    def expect_json(self, field: str, expected) -> "Resp":
        try:
            obj = json.loads(self.body)
        except ValueError:
            self.case.fail(f"body is not JSON: {self.body!r}")
        self.case.assertIsInstance(obj, dict, f"body is not a JSON object: {self.body!r}")
        self.case.assertEqual(str(obj.get(field)), str(expected), f"{field}; body: {self.body!r}")
        return self


class ApiTestCase(unittest.TestCase):
    """Base class for handler tests: a fresh in-memory API per test."""

    def setUp(self):
        self.env = TestEnv()
        self.addCleanup(self.env.stop)

    def an_author(self, name: str = "An author"):
        return self.env.authors.create(name, "")

    def a_book(self, title: str = "A book", year: int = 2000):
        """Creates a book with the given title, and an author for it."""
        author = self.an_author(f"Author of {title}")
        return self.env.books.create(title, author.id, "", year)

    def a_review(self, book, rating: int = 4):
        return self.env.reviews.create(book.id, rating, "A review written by the test kit.")

    def get(self, path: str) -> Resp:
        return Resp(self, *self.env.request("GET", path))

    def delete(self, path: str) -> Resp:
        return Resp(self, *self.env.request("DELETE", path))

    def post(self, path: str, body) -> Resp:
        return Resp(self, *self.env.request("POST", path, body))
