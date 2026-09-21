package bookstore.handler

import bookstore.store.AuthorStore
import bookstore.store.BookStore
import bookstore.util.Json
import bookstore.util.paginate
import com.sun.net.httpserver.HttpExchange

class BookHandler(private val books: BookStore, private val authors: AuthorStore) {
    fun listBooks(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val page = query["page"]?.toIntOrNull() ?: 0
        var size = query["size"]?.toIntOrNull() ?: 0
        if (size == 0) size = 10
        val (limit, offset) = paginate(page, size)
        val list = try {
            books.list(limit, offset)
        } catch (_: Exception) {
            return writeError(ex, 500, "failed to list books")
        }
        writeJson(ex, 200, list)
    }

    fun getBook(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val id = params["id"]?.toIntOrNull() ?: return writeError(ex, 500, "invalid id")
        val book = try {
            books.get(id)
        } catch (_: Exception) {
            return writeError(ex, 500, "db error")
        }
        if (book == null) return writeError(ex, 404, "book not found")
        val author = authors.get(book.author_id)
        writeJson(ex, 200, mapOf("book" to book, "author" to author))
    }

    fun createBook(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val body = ex.requestBody.readBytes().toString(Charsets.UTF_8)
        val parsed = try {
            @Suppress("UNCHECKED_CAST")
            Json.decode(body) as Map<String, Any?>
        } catch (_: Exception) {
            return writeError(ex, 400, "invalid body")
        }
        val book = try {
            books.create(
                (parsed["title"] as? String) ?: "",
                (parsed["author_id"] as? Number)?.toInt() ?: 0,
                (parsed["isbn"] as? String) ?: "",
                (parsed["year"] as? Number)?.toInt() ?: 0,
            )
        } catch (_: Exception) {
            return writeError(ex, 500, "failed to create book")
        }
        writeJson(ex, 200, book)
    }

    fun deleteBook(ex: HttpExchange, params: Map<String, String>, query: Map<String, String>) {
        val id = params["id"]?.toIntOrNull() ?: return writeError(ex, 500, "invalid id")
        try {
            books.delete(id)
        } catch (_: Exception) {
            return writeError(ex, 500, "failed to delete book")
        }
        writeJson(ex, 200, mapOf("status" to "deleted"))
    }
}
