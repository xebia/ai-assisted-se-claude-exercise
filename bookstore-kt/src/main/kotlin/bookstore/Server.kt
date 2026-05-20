package bookstore

import bookstore.handler.AuthorHandler
import bookstore.handler.BookHandler
import bookstore.handler.ReviewHandler
import bookstore.handler.writeError
import bookstore.store.AuthorStore
import bookstore.store.BookStore
import bookstore.store.ReviewStore
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.net.URLDecoder
import java.sql.Connection

typealias RouteFn = (HttpExchange, Map<String, String>, Map<String, String>) -> Unit

data class Route(val method: String, val pattern: Regex, val paramNames: List<String>, val fn: RouteFn)

private fun compile(path: String): Pair<Regex, List<String>> {
    val params = mutableListOf<String>()
    val regex = StringBuilder("^")
    val parts = path.split('/')
    for ((idx, part) in parts.withIndex()) {
        if (idx > 0) regex.append('/')
        if (part.startsWith("{") && part.endsWith("}")) {
            params += part.substring(1, part.length - 1)
            regex.append("([^/]+)")
        } else {
            regex.append(Regex.escape(part))
        }
    }
    regex.append('$')
    return Regex(regex.toString()) to params
}

fun buildRoutes(db: Connection): List<Route> {
    val books = BookStore(db)
    val authors = AuthorStore(db)
    val reviews = ReviewStore(db)

    val bh = BookHandler(books, authors)
    val ah = AuthorHandler(authors)
    val rh = ReviewHandler(reviews)

    fun route(method: String, path: String, fn: RouteFn): Route {
        val (re, names) = compile(path)
        return Route(method, re, names, fn)
    }

    return listOf(
        route("GET", "/api/books", bh::listBooks),
        route("GET", "/api/books/{id}", bh::getBook),
        route("POST", "/api/books", bh::createBook),
        route("DELETE", "/api/books/{id}", bh::deleteBook),
        route("GET", "/api/books/{id}/reviews", rh::listReviews),
        route("POST", "/api/books/{id}/reviews", rh::createReview),
        route("GET", "/api/authors", ah::listAuthors),
        route("GET", "/api/authors/{id}", ah::getAuthor),
    )
}

private fun parseQuery(raw: String?): Map<String, String> {
    if (raw.isNullOrEmpty()) return emptyMap()
    val out = LinkedHashMap<String, String>()
    for (pair in raw.split('&')) {
        val eq = pair.indexOf('=')
        val k = if (eq >= 0) pair.substring(0, eq) else pair
        val v = if (eq >= 0) pair.substring(eq + 1) else ""
        out[URLDecoder.decode(k, Charsets.UTF_8)] = URLDecoder.decode(v, Charsets.UTF_8)
    }
    return out
}

fun startServer(db: Connection, port: Int = 8080): HttpServer {
    val routes = buildRoutes(db)
    val server = HttpServer.create(InetSocketAddress("127.0.0.1", port), 0)
    server.createContext("/", HttpHandler { ex ->
        val path = ex.requestURI.path
        val query = parseQuery(ex.requestURI.rawQuery)
        for (r in routes) {
            if (r.method != ex.requestMethod) continue
            val m = r.pattern.matchEntire(path) ?: continue
            val params = r.paramNames.mapIndexed { i, n -> n to m.groupValues[i + 1] }.toMap()
            try {
                r.fn(ex, params, query)
            } catch (e: Exception) {
                e.printStackTrace()
                writeError(ex, 500, "internal error")
            }
            return@HttpHandler
        }
        writeError(ex, 404, "not found")
    })
    server.executor = java.util.concurrent.Executors.newCachedThreadPool()
    server.start()
    return server
}
