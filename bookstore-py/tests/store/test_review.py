import unittest

from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from bookstore.store.review import ReviewStore
from tests.helpers import new_test_db


class TestReviewStore(unittest.TestCase):
    def test_create(self):
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        r_store = ReviewStore(db)
        author = a_store.create("Author", "")
        book = b_store.create("Book", author.id, "", 2000)
        r = r_store.create(book.id, 5, "Excellent read.")
        self.assertGreater(r.id, 0)
        self.assertEqual(r.rating, 5)
        self.assertEqual(r.book_id, book.id)

    def _setup(self):
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        r_store = ReviewStore(db)
        author = a_store.create("Author", "")
        book1 = b_store.create("Book 1", author.id, "", 2000)
        book2 = b_store.create("Book 2", author.id, "", 2001)
        r_store.create(book1.id, 5, "Great.")
        r_store.create(book1.id, 3, "Average.")
        r_store.create(book2.id, 4, "Good.")
        return r_store, book1, book2

    def test_book1_has_two_reviews(self):
        r_store, book1, _ = self._setup()
        self.assertEqual(len(r_store.list_by_book(book1.id)), 2)

    def test_book2_has_one_review(self):
        r_store, _, book2 = self._setup()
        self.assertEqual(len(r_store.list_by_book(book2.id)), 1)

    def test_unknown_book_returns_empty(self):
        r_store, _, _ = self._setup()
        self.assertEqual(len(r_store.list_by_book(99999)), 0)


if __name__ == "__main__":
    unittest.main()
