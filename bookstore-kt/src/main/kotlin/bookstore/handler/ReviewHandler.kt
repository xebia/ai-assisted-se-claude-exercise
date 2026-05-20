package bookstore.handler

import bookstore.store.ReviewStore
import bookstore.util.Json
import com.sun.net.httpserver.HttpExchange

class ReviewHandler(private val reviews: ReviewStore) {
    fun listReviews(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val bookID = params["id"]?.toIntOrNull() ?: return writeError(ex, 500, "invalid book id")
        val list = try {
            reviews.listByBook(bookID)
        } catch (_: Exception) {
            return writeError(ex, 500, "failed to list reviews")
        }
        writeJson(ex, 200, list)
    }

    fun createReview(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val bookID = params["id"]?.toIntOrNull() ?: return writeError(ex, 500, "invalid book id")
        val body = ex.requestBody.readBytes().toString(Charsets.UTF_8)
        val parsed = try {
            @Suppress("UNCHECKED_CAST")
            Json.decode(body) as Map<String, Any?>
        } catch (_: Exception) {
            return writeError(ex, 400, "invalid body")
        }
        val review = try {
            reviews.create(
                bookID,
                (parsed["rating"] as? Number)?.toInt() ?: 0,
                (parsed["review_text"] as? String) ?: "",
            )
        } catch (e: Exception) {
            return writeError(ex, 500, e.message ?: "failed to create review")
        }
        writeJson(ex, 201, review)
    }
}
