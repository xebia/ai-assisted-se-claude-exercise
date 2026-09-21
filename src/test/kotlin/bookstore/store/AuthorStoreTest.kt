package bookstore.store

import bookstore.newTestDb
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AuthorStoreTest {
    @Test fun create() {
        val s = AuthorStore(newTestDb())
        val a = s.create("Ursula K. Le Guin", "American author of speculative fiction.")
        assertTrue(a.id > 0)
        assertEquals("Ursula K. Le Guin", a.name)
    }

    @Test fun getExists() {
        val s = AuthorStore(newTestDb())
        val created = s.create("George Orwell", "English novelist.")
        val got = s.get(created.id); assertNotNull(got); assertEquals(created.name, got.name)
    }

    @Test fun getNotFound() {
        val s = AuthorStore(newTestDb())
        assertNull(s.get(99999))
    }

    @Test fun list() {
        val s = AuthorStore(newTestDb())
        s.create("Author A", ""); s.create("Author B", ""); s.create("Author C", "")
        assertEquals(3, s.list().size)
    }

    @Test fun booksByAuthor() {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db)
        val author = authors.create("Toni Morrison", "")
        books.create("Beloved", author.id, "978-0", 1987); books.create("Sula", author.id, "978-1", 1973)
        assertEquals(2, authors.booksByAuthor(author.id).size)
    }
}
