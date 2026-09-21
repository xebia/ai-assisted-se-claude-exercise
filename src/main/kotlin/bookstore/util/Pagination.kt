package bookstore.util

// paginate returns (limit, offset) for the given page and size.
fun paginate(page: Int, size: Int): Pair<Int, Int> = size to (page - 1) * size
