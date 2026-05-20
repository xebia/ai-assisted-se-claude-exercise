import json
import unittest

from tests.helpers import test_env


class TestBookHandler(unittest.TestCase):
    def test_list_books(self):
        with test_env() as env:
            a = env.authors.create("Author", "")
            env.books.create("Book A", a.id, "", 2000)
            env.books.create("Book B", a.id, "", 2001)
            status, body = env.request("GET", "/api/books")
            self.assertEqual(status, 200)
            data = json.loads(body)
            self.assertEqual(len(data), 2)

    def test_get_book_found(self):
        with test_env() as env:
            a = env.authors.create("Author", "")
            b = env.books.create("1984", a.id, "", 1949)
            status, _ = env.request("GET", f"/api/books/{b.id}")
            self.assertEqual(status, 200)

    def test_get_book_not_found(self):
        with test_env() as env:
            status, _ = env.request("GET", "/api/books/99999")
            self.assertEqual(status, 404)

    # POST /api/books should return 201 Created.
    def test_create_book_returns_201(self):
        with test_env() as env:
            a = env.authors.create("Author", "")
            status, _ = env.request(
                "POST",
                "/api/books",
                {"title": "New Book", "author_id": a.id, "isbn": "978-x", "year": 2024},
            )
            self.assertEqual(status, 201, "expected 201 Created for POST /api/books")

    # DELETE /api/books/{id} should return 204 No Content with no body.
    def test_delete_book_returns_204(self):
        with test_env() as env:
            a = env.authors.create("Author", "")
            b = env.books.create("To Delete", a.id, "", 2000)
            status, body = env.request("DELETE", f"/api/books/{b.id}")
            self.assertEqual(status, 204, "expected 204 No Content for DELETE")
            self.assertEqual(body, b"", "expected empty body for 204")

    def test_create_book_invalid_body(self):
        with test_env() as env:
            status, _ = env.request_raw("POST", "/api/books", b"not json")
            self.assertEqual(status, 400)


if __name__ == "__main__":
    unittest.main()
