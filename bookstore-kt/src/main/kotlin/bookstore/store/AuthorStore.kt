package bookstore.store

import bookstore.model.Author
import bookstore.model.Book
import java.sql.Connection

class AuthorStore(private val db: Connection) {
    fun list(): List<Author> {
        val out = mutableListOf<Author>()
        db.prepareStatement("SELECT id, name, bio FROM authors").use { ps ->
            ps.executeQuery().use { rs ->
                while (rs.next()) {
                    out += Author(rs.getInt(1), rs.getString(2), rs.getString(3))
                }
            }
        }
        return out
    }

    fun get(id: Int): Author? {
        db.prepareStatement("SELECT id, name, bio FROM authors WHERE id = ?").use { ps ->
            ps.setInt(1, id)
            ps.executeQuery().use { rs ->
                if (rs.next()) {
                    return Author(rs.getInt(1), rs.getString(2), rs.getString(3))
                }
            }
        }
        return null
    }

    fun booksByAuthor(authorID: Int): List<Book> {
        val out = mutableListOf<Book>()
        db.prepareStatement(
            "SELECT id, title, author_id, isbn, year, created_at FROM books WHERE author_id = ?"
        ).use { ps ->
            ps.setInt(1, authorID)
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

    fun create(name: String, bio: String): Author {
        db.prepareStatement(
            "INSERT INTO authors (name, bio) VALUES (?, ?)",
            java.sql.Statement.RETURN_GENERATED_KEYS,
        ).use { ps ->
            ps.setString(1, name)
            ps.setString(2, bio)
            ps.executeUpdate()
            ps.generatedKeys.use { keys ->
                keys.next()
                return get(keys.getInt(1))!!
            }
        }
    }
}
