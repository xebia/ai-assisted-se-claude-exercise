package bookstore.model

data class Author(val id: Int, val name: String, val bio: String)

data class Book(
    val id: Int,
    val title: String,
    val author_id: Int,
    val isbn: String,
    val year: Int,
    val created_at: String,
)

data class Review(
    val id: Int,
    val book_id: Int,
    val rating: Int,
    val review_text: String,
    val created_at: String,
)
