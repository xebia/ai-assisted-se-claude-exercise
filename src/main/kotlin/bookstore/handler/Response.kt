package bookstore.handler

import bookstore.util.Json
import com.sun.net.httpserver.HttpExchange

fun writeJson(ex: HttpExchange, status: Int, body: Any?) {
    val payload = Json.encode(body).toByteArray(Charsets.UTF_8)
    ex.responseHeaders.set("Content-Type", "application/json")
    ex.sendResponseHeaders(status, payload.size.toLong())
    ex.responseBody.use { it.write(payload) }
}

fun writeError(ex: HttpExchange, status: Int, msg: String) {
    writeJson(ex, status, mapOf("error" to msg))
}
