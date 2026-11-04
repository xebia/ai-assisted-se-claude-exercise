import json
import unittest

from tests.helpers import test_env


class TestReviewHandler(unittest.TestCase):
    def test_list_reviews(self):
        with test_env() as env:
            a = env.authors.create("Author", "")
            b = env.books.create("Book", a.id, "", 2000)
            env.reviews.create(b.id, 5, "Great read.")
            env.reviews.create(b.id, 3, "It was okay.")
            status, body = env.request("GET", f"/api/books/{b.id}/reviews")
            self.assertEqual(status, 200)
            self.assertEqual(len(json.loads(body)), 2)

    def test_create_review_returns_201(self):
        with test_env() as env:
            a = env.authors.create("Author", "")
            b = env.books.create("Book", a.id, "", 2000)
            status, _ = env.request(
                "POST",
                f"/api/books/{b.id}/reviews",
                {"rating": 4, "review_text": "Solid book."},
            )
            self.assertEqual(status, 201)

    # posting a review for a non-existent book should return 404.
    def test_create_review_nonexistent_book(self):
        with test_env() as env:
            status, _ = env.request(
                "POST",
                "/api/books/99999/reviews",
                {"rating": 5, "review_text": "Orphaned review."},
            )
            self.assertEqual(status, 404, "expected 404 for review on non-existent book")

    # invalid rating and review_text values should return 400.
    def test_create_review_validation(self):
        cases = [
            ("zero rating", 0, "Some text here."),
            ("negative rating", -1, "Some text here."),
            ("huge rating", 999, "Some text here."),
            ("empty text", 3, ""),
        ]
        for name, rating, text in cases:
            with self.subTest(name=name):
                with test_env() as env:
                    a = env.authors.create("Author", "")
                    b = env.books.create("Book", a.id, "", 2000)
                    status, _ = env.request(
                        "POST",
                        f"/api/books/{b.id}/reviews",
                        {"rating": rating, "review_text": text},
                    )
                    self.assertEqual(
                        status, 400, f"expected 400 for invalid input ({name})"
                    )


if __name__ == "__main__":
    unittest.main()
