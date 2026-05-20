import unittest

from bookstore.util.pagination import paginate


class TestPaginate(unittest.TestCase):
    def test_table(self):
        cases = [
            ("first page", 1, 10, 10, 0),
            ("second page", 2, 10, 10, 10),
            ("third page custom size", 3, 5, 5, 10),
            ("large page", 100, 20, 20, 1980),
        ]
        for name, page, size, want_limit, want_offset in cases:
            with self.subTest(name=name):
                limit, offset = paginate(page, size)
                self.assertEqual(limit, want_limit)
                self.assertEqual(offset, want_offset)


if __name__ == "__main__":
    unittest.main()
