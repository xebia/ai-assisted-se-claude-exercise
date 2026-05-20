package bookstore.store

import bookstore.newTestDb
import bookstore.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class BookStoreTest {
    @Test fun create() {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db)
        val author = authors.create("Cormac McCarthy", "")
        val book = books.create("Blood Meridian", author.id, "978-0679728757", 1985)
        assertTrue(book.id > 0)
        assertEquals("Blood Meridian", book.title)
        assertEquals(author.id, book.author_id)
    }

    @Test fun getExists() {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db)
        val author = authors.create("Haruki Murakami", "")
        val created = books.create("Norwegian Wood", author.id, "978-0", 1987)
        val got = books.get(created.id); assertNotNull(got); assertEquals("Norwegian Wood", got.title)
    }

    @Test fun getNotFound() {
        val books = BookStore(newTestDb())
        assertNull(books.get(99999))
    }

    private fun threeBooks(): BookStore {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db)
        val author = authors.create("Author", "")
        books.create("Book 1", author.id, "", 2000)
        books.create("Book 2", author.id, "", 2001)
        books.create("Book 3", author.id, "", 2002)
        return books
    }

    @Test fun listAll() { assertEquals(3, threeBooks().list(10, 0).size) }
    @Test fun listLimit() { assertEquals(2, threeBooks().list(2, 0).size) }
    @Test fun listOffset() { assertEquals(1, threeBooks().list(10, 2).size) }

    @Test fun delete() {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db)
        val author = authors.create("Author", "")
        val book = books.create("To Delete", author.id, "", 2000)
        books.delete(book.id)
        assertNull(books.get(book.id))
    }
}

// BookSearchTest documents the N+1 query behaviour in search().
// The test verifies correctness; the N+1 issue is a performance bug, not a logic bug.
class BookSearchTest {
    private fun setup(): BookStore {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db)
        val author = authors.create("George Orwell", "")
        books.create("1984", author.id, "", 1949)
        books.create("Animal Farm", author.id, "", 1945)
        books.create("Homage to Catalonia", author.id, "", 1938)
        return books
    }

    @Test fun matchesTitle() { assertEquals(1, setup().search("1984").size) }
    @Test fun partialMatch() { assertTrue(setup().search("a").size >= 2) }
    @Test fun noMatch() { assertEquals(0, setup().search("zzznomatch").size) }
}
