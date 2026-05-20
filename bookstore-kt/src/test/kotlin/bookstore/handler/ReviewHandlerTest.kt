package bookstore.handler

import bookstore.TestEnv
import bookstore.util.Json
import bookstore.Test
import kotlin.test.assertEquals

class ReviewHandlerTest {
    @Test fun listReviews() {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            val b = env.books.create("Book", a.id, "", 2000)
            env.reviews.create(b.id, 5, "Great read.")
            env.reviews.create(b.id, 3, "It was okay.")
            val r = env.request("GET", "/api/books/${b.id}/reviews")
            assertEquals(200, r.status)
            @Suppress("UNCHECKED_CAST") val list = Json.decode(r.body) as List<Any?>
            assertEquals(2, list.size)
        }
    }

    @Test fun createReviewReturns201() {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            val b = env.books.create("Book", a.id, "", 2000)
            val r = env.request(
                "POST",
                "/api/books/${b.id}/reviews",
                """{"rating":4,"review_text":"Solid book."}""",
            )
            assertEquals(201, r.status)
        }
    }

    // posting a review for a non-existent book should return 404.
    @Test fun createReviewNonexistentBook() {
        TestEnv().use { env ->
            val r = env.request(
                "POST",
                "/api/books/99999/reviews",
                """{"rating":5,"review_text":"Orphaned review."}""",
            )
            assertEquals(404, r.status, "expected 404 for review on non-existent book")
        }
    }

    // invalid rating and review_text values should return 400.
    private val validationCases = listOf(
        Triple("zero rating", 0, "Some text here."),
        Triple("negative rating", -1, "Some text here."),
        Triple("huge rating", 999, "Some text here."),
        Triple("empty text", 3, ""),
    )

    @Test fun createReviewValidationZeroRating() { runValidation(validationCases[0]) }
    @Test fun createReviewValidationNegativeRating() { runValidation(validationCases[1]) }
    @Test fun createReviewValidationHugeRating() { runValidation(validationCases[2]) }
    @Test fun createReviewValidationEmptyText() { runValidation(validationCases[3]) }

    private fun runValidation(case: Triple<String, Int, String>) {
        TestEnv().use { env ->
            val a = env.authors.create("Author", "")
            val b = env.books.create("Book", a.id, "", 2000)
            val body = """{"rating":${case.second},"review_text":${Json.encode(case.third)}}"""
            val r = env.request("POST", "/api/books/${b.id}/reviews", body)
            assertEquals(400, r.status, "expected 400 for invalid input (${case.first})")
        }
    }
}
