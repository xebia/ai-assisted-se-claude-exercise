package bookstore

import bookstore.store.AuthorStore
import bookstore.store.BookStore
import bookstore.store.ReviewStore
import bookstore.store.openDb
import com.sun.net.httpserver.HttpServer
import java.net.HttpURLConnection
import java.net.URI
import java.sql.Connection

fun newTestDb(): Connection = openDb(":memory:")

class TestEnv : AutoCloseable {
    val db: Connection = newTestDb()
    val authors = AuthorStore(db)
    val books = BookStore(db)
    val reviews = ReviewStore(db)
    val server: HttpServer = startServer(db, 0)
    val base: String = "http://127.0.0.1:${server.address.port}"

    data class HttpResult(val status: Int, val body: String)

    fun request(method: String, path: String, body: String? = null): HttpResult {
        val conn = URI("$base$path").toURL().openConnection() as HttpURLConnection
        conn.requestMethod = method
        if (body != null) {
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json")
            conn.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
        }
        val status = conn.responseCode
        val stream = if (status >= 400) conn.errorStream else conn.inputStream
        val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
        return HttpResult(status, text)
    }

    override fun close() {
        server.stop(0)
        db.close()
    }
}
