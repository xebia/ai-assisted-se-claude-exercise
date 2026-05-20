package bookstore.handler

import bookstore.store.AuthorStore
import com.sun.net.httpserver.HttpExchange

class AuthorHandler(private val authors: AuthorStore) {
    fun listAuthors(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val list = try {
            authors.list()
        } catch (_: Exception) {
            return writeError(ex, 500, "failed to list authors")
        }
        writeJson(ex, 200, list)
    }

    fun getAuthor(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val id = params["id"]?.toIntOrNull()
            ?: return writeError(ex, 500, "invalid id") // bug: should be 400
        val author = try {
            authors.get(id)
        } catch (_: Exception) {
            return writeError(ex, 500, "db error")
        }
        if (author == null) return writeError(ex, 404, "author not found")
        val books = try {
            authors.booksByAuthor(id)
        } catch (_: Exception) {
            return writeError(ex, 500, "failed to list books")
        }
        writeJson(ex, 200, mapOf("author" to author, "books" to books))
    }
}
