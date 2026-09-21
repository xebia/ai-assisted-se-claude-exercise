package bookstore.store

import java.sql.Connection
import java.sql.DriverManager

fun openDb(path: String): Connection {
    val conn = DriverManager.getConnection("jdbc:sqlite:$path")
    migrate(conn)
    return conn
}

private fun migrate(conn: Connection) {
    conn.createStatement().use { stmt ->
        stmt.executeUpdate(
            """
            CREATE TABLE IF NOT EXISTS authors (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                bio  TEXT NOT NULL DEFAULT ''
            )
            """.trimIndent()
        )
        stmt.executeUpdate(
            """
            CREATE TABLE IF NOT EXISTS books (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                title      TEXT NOT NULL,
                author_id  INTEGER NOT NULL REFERENCES authors(id),
                isbn       TEXT NOT NULL DEFAULT '',
                year       INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """.trimIndent()
        )
        stmt.executeUpdate(
            """
            CREATE TABLE IF NOT EXISTS reviews (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id     INTEGER NOT NULL REFERENCES books(id),
                rating      INTEGER NOT NULL,
                review_text TEXT NOT NULL DEFAULT '',
                created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """.trimIndent()
        )
    }
}
