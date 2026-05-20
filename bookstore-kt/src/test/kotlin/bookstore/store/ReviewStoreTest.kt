package bookstore.store

import bookstore.newTestDb
import bookstore.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ReviewStoreTest {
    @Test fun create() {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db); val reviews = ReviewStore(db)
        val author = authors.create("Author", "")
        val book = books.create("Book", author.id, "", 2000)
        val r = reviews.create(book.id, 5, "Excellent read.")
        assertTrue(r.id > 0); assertEquals(5, r.rating); assertEquals(book.id, r.book_id)
    }

    private data class Setup(val reviews: ReviewStore, val book1Id: Int, val book2Id: Int)

    private fun setup(): Setup {
        val db = newTestDb()
        val authors = AuthorStore(db); val books = BookStore(db); val reviews = ReviewStore(db)
        val author = authors.create("Author", "")
        val b1 = books.create("Book 1", author.id, "", 2000)
        val b2 = books.create("Book 2", author.id, "", 2001)
        reviews.create(b1.id, 5, "Great.")
        reviews.create(b1.id, 3, "Average.")
        reviews.create(b2.id, 4, "Good.")
        return Setup(reviews, b1.id, b2.id)
    }

    @Test fun book1HasTwoReviews() {
        val s = setup(); assertEquals(2, s.reviews.listByBook(s.book1Id).size)
    }
    @Test fun book2HasOneReview() {
        val s = setup(); assertEquals(1, s.reviews.listByBook(s.book2Id).size)
    }
    @Test fun unknownBookReturnsEmpty() {
        val s = setup(); assertEquals(0, s.reviews.listByBook(99999).size)
    }
}
