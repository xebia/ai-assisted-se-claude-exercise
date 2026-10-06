package bookstore.testkit

// Test helpers for handler tests: apiTest { }, builders (anAuthor, aBook,
// aReview), request helpers (get, post, delete) and response checks
// (expectStatus, expectJson).

import bookstore.TestEnv
import bookstore.model.Author
import bookstore.model.Book
import bookstore.model.Review
import bookstore.util.Json
import kotlin.test.assertEquals

/** Runs [block] against a fresh in-memory API and closes it afterwards. */
fun apiTest(block: Api.() -> Unit) {
    TestEnv().use { env -> Api(env).block() }
}

class Api(val env: TestEnv) {
    fun anAuthor(name: String = "An author"): Author = env.authors.create(name, "")

    /** Creates a book with the given title, and an author for it. */
    fun aBook(title: String = "A book", year: Int = 2000): Book {
        val author = anAuthor("Author of $title")
        return env.books.create(title, author.id, "", year)
    }

    fun aReview(book: Book, rating: Int = 4): Review =
        env.reviews.create(book.id, rating, "A review written by the test kit.")

    fun get(path: String) = Resp(env.request("GET", path))
    fun delete(path: String) = Resp(env.request("DELETE", path))
    fun post(path: String, json: String) = Resp(env.request("POST", path, json))
}

/** One response, with chainable checks. */
class Resp(result: TestEnv.HttpResult) {
    val status = result.status
    val body = result.body

    fun expectStatus(expected: Int): Resp {
        assertEquals(expected, status, "status; body: $body")
        return this
    }

    fun expectJson(field: String, expected: Any?): Resp {
        @Suppress("UNCHECKED_CAST")
        val obj = Json.decode(body) as? Map<String, Any?>
            ?: throw AssertionError("body is not a JSON object: $body")
        assertEquals(expected.toString(), obj[field].toString(), "$field; body: $body")
        return this
    }
}
