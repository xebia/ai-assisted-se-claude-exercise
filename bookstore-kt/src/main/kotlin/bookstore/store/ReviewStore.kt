package bookstore.store

import bookstore.model.Review
import java.sql.Connection

class ReviewStore(private val db: Connection) {
    fun listByBook(bookID: Int): List<Review> {
        val out = mutableListOf<Review>()
        db.prepareStatement(
            "SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE book_id = ?"
        ).use { ps ->
            ps.setInt(1, bookID)
            ps.executeQuery().use { rs ->
                while (rs.next()) {
                    out += Review(
                        rs.getInt(1), rs.getInt(2), rs.getInt(3),
                        rs.getString(4), rs.getString(5),
                    )
                }
            }
        }
        return out
    }

    fun create(bookID: Int, rating: Int, reviewText: String): Review {
        db.prepareStatement(
            "INSERT INTO reviews (book_id, rating, review_text) VALUES (?, ?, ?)",
            java.sql.Statement.RETURN_GENERATED_KEYS,
        ).use { ps ->
            ps.setInt(1, bookID)
            ps.setInt(2, rating)
            ps.setString(3, reviewText)
            ps.executeUpdate()
            ps.generatedKeys.use { keys ->
                keys.next()
                val id = keys.getInt(1)
                db.prepareStatement(
                    "SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE id = ?"
                ).use { ps2 ->
                    ps2.setInt(1, id)
                    ps2.executeQuery().use { rs ->
                        rs.next()
                        return Review(
                            rs.getInt(1), rs.getInt(2), rs.getInt(3),
                            rs.getString(4), rs.getString(5),
                        )
                    }
                }
            }
        }
    }
}
