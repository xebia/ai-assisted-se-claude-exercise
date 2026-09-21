package bookstore.handler

import bookstore.TestEnv
import bookstore.util.Json
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class BookHandlerTest {
    @Test fun listBooks() {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            env.books.create("Book A", a.id, "", 2000)
            env.books.create("Book B", a.id, "", 2001)
            val r = env.request("GET", "/api/books")
            assertEquals(200, r.status)
            @Suppress("UNCHECKED_CAST") val list = Json.decode(r.body) as List<Any?>
            assertEquals(2, list.size)
        }
    }

    @Test fun getBookFound() {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            val b = env.books.create("1984", a.id, "", 1949)
            assertEquals(200, env.request("GET", "/api/books/${b.id}").status)
        }
    }

    @Test fun getBookNotFound() {
        TestEnv().use { env ->
            assertEquals(404, env.request("GET", "/api/books/99999").status)
        }
    }

    // POST /api/books should return 201 Created.
    @Test fun createBookReturns201() {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            val body = """{"title":"New Book","author_id":${a.id},"isbn":"978-x","year":2024}"""
            val r = env.request("POST", "/api/books", body)
            assertEquals(201, r.status, "expected 201 Created for POST /api/books")
        }
    }

    // DELETE /api/books/{id} should return 204 No Content with no body.
    @Test fun deleteBookReturns204() {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            val b = env.books.create("To Delete", a.id, "", 2000)
            val r = env.request("DELETE", "/api/books/${b.id}")
            assertEquals(204, r.status, "expected 204 No Content")
            assertEquals("", r.body, "expected empty body for 204")
        }
    }

    @Test fun createBookInvalidBody() {
        TestEnv().use { env ->
            assertEquals(400, env.request("POST", "/api/books", "not json").status)
        }
    }
}
