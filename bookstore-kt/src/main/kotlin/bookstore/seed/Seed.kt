package bookstore.seed

import bookstore.store.AuthorStore
import bookstore.store.BookStore
import bookstore.store.ReviewStore
import java.sql.Connection

fun run(db: Connection) {
    val authors = AuthorStore(db)
    val books = BookStore(db)
    val reviews = ReviewStore(db)

    val authorSeeds = listOf(
        "George Orwell" to "English novelist and essayist.",
        "Ursula K. Le Guin" to "American author of speculative fiction.",
        "Cormac McCarthy" to "American novelist and playwright.",
        "Toni Morrison" to "American novelist and Nobel laureate.",
        "Haruki Murakami" to "Japanese author of surrealist fiction.",
    )
    val authorIDs = authorSeeds.map { (n, b) -> authors.create(n, b).id }

    data class BookSeed(val title: String, val isbn: String, val year: Int, val authorIdx: Int)
    val bookSeeds = listOf(
        BookSeed("1984", "978-0451524935", 1949, 0),
        BookSeed("Animal Farm", "978-0451526342", 1945, 0),
        BookSeed("Homage to Catalonia", "978-0156421171", 1938, 0),
        BookSeed("The Left Hand of Darkness", "978-0441478125", 1969, 1),
        BookSeed("The Dispossessed", "978-0061054884", 1974, 1),
        BookSeed("A Wizard of Earthsea", "978-0547773742", 1968, 1),
        BookSeed("Blood Meridian", "978-0679728757", 1985, 2),
        BookSeed("No Country for Old Men", "978-0307387899", 2005, 2),
        BookSeed("The Road", "978-0307387899", 2006, 2),
        BookSeed("Beloved", "978-1400033416", 1987, 3),
        BookSeed("Song of Solomon", "978-1400033423", 1977, 3),
        BookSeed("Sula", "978-1400033430", 1973, 3),
        BookSeed("Norwegian Wood", "978-0375704024", 1987, 4),
        BookSeed("Kafka on the Shore", "978-1400079278", 2002, 4),
        BookSeed("The Wind-Up Bird Chronicle", "978-0679775430", 1994, 4),
    )
    val bookIDs = bookSeeds.map { books.create(it.title, authorIDs[it.authorIdx], it.isbn, it.year).id }

    data class ReviewSeed(val bookIdx: Int, val rating: Int, val text: String)
    val reviewSeeds = listOf(
        ReviewSeed(0, 5, "A chilling vision of totalitarianism."),
        ReviewSeed(1, 4, "A sharp political allegory."),
        ReviewSeed(3, 5, "A masterpiece of speculative fiction."),
        ReviewSeed(6, 4, "Brutal and poetic."),
        ReviewSeed(8, 5, "Haunting and unforgettable."),
        ReviewSeed(9, 5, "Morrison at her very best."),
        ReviewSeed(12, 4, "Melancholic and beautifully written."),
        ReviewSeed(13, 3, "Imaginative but occasionally meandering."),
        ReviewSeed(14, 5, "Surreal and utterly gripping."),
        ReviewSeed(4, 4, "A profound meditation on freedom."),
    )
    for (rv in reviewSeeds) {
        reviews.create(bookIDs[rv.bookIdx], rv.rating, rv.text)
    }
}

fun isEmpty(db: Connection): Boolean {
    db.createStatement().use { stmt ->
        stmt.executeQuery("SELECT COUNT(*) FROM authors").use { rs ->
            rs.next()
            return rs.getInt(1) == 0
        }
    }
}
