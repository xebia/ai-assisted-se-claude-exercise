import sqlite3

from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from bookstore.store.review import ReviewStore


def run(db: sqlite3.Connection) -> None:
    authors = AuthorStore(db)
    books = BookStore(db)
    reviews = ReviewStore(db)

    author_seeds = [
        ("George Orwell", "English novelist and essayist."),
        ("Ursula K. Le Guin", "American author of speculative fiction."),
        ("Cormac McCarthy", "American novelist and playwright."),
        ("Toni Morrison", "American novelist and Nobel laureate."),
        ("Haruki Murakami", "Japanese author of surrealist fiction."),
    ]
    author_ids = [authors.create(n, b).id for n, b in author_seeds]

    book_seeds = [
        ("1984", "978-0451524935", 1949, 0),
        ("Animal Farm", "978-0451526342", 1945, 0),
        ("Homage to Catalonia", "978-0156421171", 1938, 0),
        ("The Left Hand of Darkness", "978-0441478125", 1969, 1),
        ("The Dispossessed", "978-0061054884", 1974, 1),
        ("A Wizard of Earthsea", "978-0547773742", 1968, 1),
        ("Blood Meridian", "978-0679728757", 1985, 2),
        ("No Country for Old Men", "978-0307387899", 2005, 2),
        ("The Road", "978-0307387899", 2006, 2),
        ("Beloved", "978-1400033416", 1987, 3),
        ("Song of Solomon", "978-1400033423", 1977, 3),
        ("Sula", "978-1400033430", 1973, 3),
        ("Norwegian Wood", "978-0375704024", 1987, 4),
        ("Kafka on the Shore", "978-1400079278", 2002, 4),
        ("The Wind-Up Bird Chronicle", "978-0679775430", 1994, 4),
    ]
    book_ids = [
        books.create(t, author_ids[ai], isbn, y).id for t, isbn, y, ai in book_seeds
    ]

    review_seeds = [
        (0, 5, "A chilling vision of totalitarianism."),
        (1, 4, "A sharp political allegory."),
        (3, 5, "A masterpiece of speculative fiction."),
        (6, 4, "Brutal and poetic."),
        (8, 5, "Haunting and unforgettable."),
        (9, 5, "Morrison at her very best."),
        (12, 4, "Melancholic and beautifully written."),
        (13, 3, "Imaginative but occasionally meandering."),
        (14, 5, "Surreal and utterly gripping."),
        (4, 4, "A profound meditation on freedom."),
    ]
    for bi, rating, text in review_seeds:
        reviews.create(book_ids[bi], rating, text)


def is_empty(db: sqlite3.Connection) -> bool:
    (n,) = db.execute("SELECT COUNT(*) FROM authors").fetchone()
    return n == 0
