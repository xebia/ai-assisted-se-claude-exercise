import bookstore.seed.isEmpty
import bookstore.seed.run as runSeed
import bookstore.startServer
import bookstore.store.openDb

fun main(args: Array<String>) {
    val reseed = args.contains("--seed")
    val db = openDb("store.db")

    if (reseed) {
        println("reseeding database...")
        db.createStatement().use { stmt ->
            stmt.executeUpdate("DELETE FROM reviews")
            stmt.executeUpdate("DELETE FROM books")
            stmt.executeUpdate("DELETE FROM authors")
        }
        runSeed(db)
        println("reseed complete")
    } else if (isEmpty(db)) {
        println("empty database — seeding initial data...")
        runSeed(db)
        println("seed complete")
    }

    val server = startServer(db, 8080)
    println("listening on :${server.address.port}")
    Thread.currentThread().join()
}
