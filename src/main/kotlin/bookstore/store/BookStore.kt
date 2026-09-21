package bookstore.store

import bookstore.model.Author
import bookstore.model.Book
import java.sql.Connection

class BookStore(private val db: Connection) {
    // search returns books matching query, with author details for each result.
    fun search(query: String): List<Map<String, Any?>> {
        val books = mutableListOf<Book>()
        db.prepareStatement(
            "SELECT id, title, author_id, isbn, year, created_at FROM books WHERE title LIKE ?"
        ).use { ps ->
            ps.setString(1, "%$query%")
            ps.executeQuery().use { rs ->
                while (rs.next()) {
                    books += Book(
                        rs.getInt(1), rs.getString(2), rs.getInt(3),
                        rs.getString(4), rs.getInt(5), rs.getString(6),
                    )
                }
            }
        }
        val results = mutableListOf<Map<String, Any?>>()
        for (b in books) {
            var author: Author? = null
            db.prepareStatement("SELECT id, name, bio FROM authors WHERE id = ?").use { ps ->
                ps.setInt(1, b.author_id)
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        author = Author(rs.getInt(1), rs.getString(2), rs.getString(3))
                    }
                }
            }
            results += mapOf("book" to b, "author" to author)
        }
        return results
    }

    fun list(limit: Int, offset: Int): List<Book> {
        val out = mutableListOf<Book>()
        db.prepareStatement(
            "SELECT id, title, author_id, isbn, year, created_at FROM books LIMIT ? OFFSET ?"
        ).use { ps ->
            ps.setInt(1, limit)
            ps.setInt(2, offset)
            ps.executeQuery().use { rs ->
                while (rs.next()) {
                    out += Book(
                        rs.getInt(1), rs.getString(2), rs.getInt(3),
                        rs.getString(4), rs.getInt(5), rs.getString(6),
                    )
                }
            }
        }
        return out
    }

    fun get(id: Int): Book? {
        db.prepareStatement(
            "SELECT id, title, author_id, isbn, year, created_at FROM books WHERE id = ?"
        ).use { ps ->
            ps.setInt(1, id)
            ps.executeQuery().use { rs ->
                if (rs.next()) {
                    return Book(
                        rs.getInt(1), rs.getString(2), rs.getInt(3),
                        rs.getString(4), rs.getInt(5), rs.getString(6),
                    )
                }
            }
        }
        return null
    }

    fun create(title: String, authorID: Int, isbn: String, year: Int): Book {
        db.prepareStatement(
            "INSERT INTO books (title, author_id, isbn, year) VALUES (?, ?, ?, ?)",
            java.sql.Statement.RETURN_GENERATED_KEYS,
        ).use { ps ->
            ps.setString(1, title)
            ps.setInt(2, authorID)
            ps.setString(3, isbn)
            ps.setInt(4, year)
            ps.executeUpdate()
            ps.generatedKeys.use { keys ->
                keys.next()
                return get(keys.getInt(1))!!
            }
        }
    }

    fun delete(id: Int) {
        db.prepareStatement("DELETE FROM books WHERE id = ?").use { ps ->
            ps.setInt(1, id)
            ps.executeUpdate()
        }
    }
}
