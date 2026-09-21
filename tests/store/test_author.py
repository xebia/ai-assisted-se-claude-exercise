import unittest

from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from tests.helpers import new_test_db


class TestAuthorStore(unittest.TestCase):
    def test_create(self):
        s = AuthorStore(new_test_db())
        a = s.create("Ursula K. Le Guin", "American author of speculative fiction.")
        self.assertGreater(a.id, 0)
        self.assertEqual(a.name, "Ursula K. Le Guin")

    def test_get_exists(self):
        s = AuthorStore(new_test_db())
        created = s.create("George Orwell", "English novelist.")
        got = s.get(created.id)
        self.assertIsNotNone(got)
        self.assertEqual(got.name, created.name)

    def test_get_not_found(self):
        s = AuthorStore(new_test_db())
        self.assertIsNone(s.get(99999))

    def test_list(self):
        s = AuthorStore(new_test_db())
        s.create("Author A", "")
        s.create("Author B", "")
        s.create("Author C", "")
        self.assertEqual(len(s.list()), 3)

    def test_books_by_author(self):
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        author = a_store.create("Toni Morrison", "")
        b_store.create("Beloved", author.id, "978-0", 1987)
        b_store.create("Sula", author.id, "978-1", 1973)
        self.assertEqual(len(a_store.books_by_author(author.id)), 2)


if __name__ == "__main__":
    unittest.main()
