import unittest

from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from tests.helpers import new_test_db


class TestBookStore(unittest.TestCase):
    def test_create(self):
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        author = a_store.create("Cormac McCarthy", "")
        book = b_store.create("Blood Meridian", author.id, "978-0679728757", 1985)
        self.assertGreater(book.id, 0)
        self.assertEqual(book.title, "Blood Meridian")
        self.assertEqual(book.author_id, author.id)

    def test_get_exists(self):
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        author = a_store.create("Haruki Murakami", "")
        created = b_store.create("Norwegian Wood", author.id, "978-0", 1987)
        got = b_store.get(created.id)
        self.assertIsNotNone(got)
        self.assertEqual(got.title, "Norwegian Wood")

    def test_get_not_found(self):
        b_store = BookStore(new_test_db())
        self.assertIsNone(b_store.get(99999))

    def _three_books(self) -> BookStore:
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        author = a_store.create("Author", "")
        b_store.create("Book 1", author.id, "", 2000)
        b_store.create("Book 2", author.id, "", 2001)
        b_store.create("Book 3", author.id, "", 2002)
        return b_store

    def test_list_all(self):
        self.assertEqual(len(self._three_books().list(10, 0)), 3)

    def test_list_limit(self):
        self.assertEqual(len(self._three_books().list(2, 0)), 2)

    def test_list_offset(self):
        self.assertEqual(len(self._three_books().list(10, 2)), 1)

    def test_delete(self):
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        author = a_store.create("Author", "")
        book = b_store.create("To Delete", author.id, "", 2000)
        b_store.delete(book.id)
        self.assertIsNone(b_store.get(book.id))


# TestBookSearch documents the N+1 query behaviour in search().
# The test verifies correctness; the N+1 issue is a performance bug, not a logic bug.
class TestBookSearch(unittest.TestCase):
    def _setup(self) -> BookStore:
        db = new_test_db()
        a_store = AuthorStore(db)
        b_store = BookStore(db)
        author = a_store.create("George Orwell", "")
        b_store.create("1984", author.id, "", 1949)
        b_store.create("Animal Farm", author.id, "", 1945)
        b_store.create("Homage to Catalonia", author.id, "", 1938)
        return b_store

    def test_matches_title(self):
        self.assertEqual(len(self._setup().search("1984")), 1)

    def test_partial_match(self):
        self.assertGreaterEqual(len(self._setup().search("a")), 2)

    def test_no_match(self):
        self.assertEqual(len(self._setup().search("zzznomatch")), 0)


if __name__ == "__main__":
    unittest.main()
